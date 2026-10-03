import type {
  EntityState,
  TrackSensorData,
  SensorType,
  ScenarioConfig,
} from '../types';

export interface SensorSystemState {
  radarActive: boolean;
  eoIrActive: boolean;
  rfActive: boolean;
  acousticActive: boolean;
  eoirSlewAngle: number; // degrees 0-360
  eoirFov: number; // degrees FOV (e.g. 45 degrees)
  radarSweepAngle: number; // degrees 0-360
  activeGhostBlips: Array<{ id: string; x: number; y: number; rcs: number }>;
}

export function createInitialSensorState(): SensorSystemState {
  return {
    radarActive: true,
    eoIrActive: true,
    rfActive: true,
    acousticActive: true,
    eoirSlewAngle: 0,
    eoirFov: 45,
    radarSweepAngle: 0,
    activeGhostBlips: [],
  };
}

export function updateSensorData(
  entities: EntityState[],
  existingTracks: Map<string, TrackSensorData>,
  sensorState: SensorSystemState,
  scenario: ScenarioConfig,
  simTime: number,
  deltaTime: number
): { updatedTracks: Map<string, TrackSensorData>; newSweepAngle: number; updatedGhostBlips: Array<{ id: string; x: number; y: number; rcs: number }> } {
  // Update radar sweep angle (1.5s full 360 rotation = 240 deg/s)
  const newSweepAngle = (sensorState.radarSweepAngle + 240 * deltaTime) % 360;

  const updatedTracks = new Map<string, TrackSensorData>();

  const isNight = scenario.environment.time === 'night';
  const isFog = scenario.environment.weather === 'fog';
  const isRain = scenario.environment.weather === 'rain';
  const isUrban = scenario.environment.terrain === 'urban';
  const isMountain = scenario.environment.terrain === 'mountain';

  const eoMaxRange = isNight ? (isFog ? 400 : 700) : isFog ? 800 : isRain ? 1000 : 1400;
  const radarMaxRange = isRain ? 2800 : 3500;
  const rfMaxRange = scenario.sensorDegradation.rfJitter ? 1800 : 2500;
  const acousticMaxRange = 650;

  // Intermittent radar outage cycle (e.g. 7s jamming outage every 24s)
  const isRadarInOutage = scenario.sensorDegradation.radarOutage && (Math.floor(simTime) % 24 >= 14 && Math.floor(simTime) % 24 <= 21);

  entities.forEach((entity) => {
    if (!entity.active || entity.status !== 'active') return;

    const dist = Math.hypot(entity.x, entity.y);
    const bearing = (Math.atan2(entity.y, entity.x) * 180 / Math.PI + 360) % 360;

    const detectedBy: SensorType[] = [];

    // 1. Radar Detection check
    let radarDetected = false;
    if (sensorState.radarActive && dist <= radarMaxRange && !isRadarInOutage) {
      // Check RCS & altitude sensitivity
      const minRCS = (dist / 3500) ** 2 * 0.02; // Small RCS hard to see at far range
      if (entity.rcs >= minRCS) {
        // Check Urban shadow zone (random occlusion mask behind buildings)
        let occluded = false;
        if (isUrban && dist > 1200) {
          if (entity.altitude < 100 && Math.floor(bearing / 30) % 2 === 0) {
            occluded = true;
          }
        }
        // Mountain shadow zone (occlusion behind ridges at lower altitudes)
        if (isMountain && dist > 1800) {
          if (entity.altitude < 120 && (bearing > 45 && bearing < 85 || bearing > 220 && bearing < 260)) {
            occluded = true;
          }
        }
        if (!occluded) {
          radarDetected = true;
          detectedBy.push('radar');
        }
      }
    }

    // 2. EO/IR Camera check
    let eoConfidence = 0;
    if (sensorState.eoIrActive && dist <= eoMaxRange) {
      // Check if inside camera FOV cone
      let angleDiff = Math.abs(bearing - sensorState.eoirSlewAngle);
      if (angleDiff > 180) angleDiff = 360 - angleDiff;

      if (angleDiff <= sensorState.eoirFov / 2) {
        // Visual clarity decreases with distance & weather
        eoConfidence = Math.max(0, 1.0 - dist / eoMaxRange);
        if (isNight) eoConfidence *= 0.75; // Thermal IR active
        if (isFog) eoConfidence *= (1 - scenario.sensorDegradation.eoFogPenalty);
        if (eoConfidence > 0.2) {
          detectedBy.push('eo_ir');
        }
      }
    }

    // 3. RF Detector check
    let rfSignal: TrackSensorData['rfSignal'] = undefined;
    if (sensorState.rfActive && entity.isRFActive && dist <= rfMaxRange) {
      detectedBy.push('rf');
      const freq = entity.trueType === 'hostile_swarm' ? '5.8 GHz' : entity.trueType === 'hostile_attack' ? '2.4 GHz' : 'SATCOM';
      rfSignal = {
        frequency: freq,
        bearing: bearing + (scenario.sensorDegradation.rfJitter ? (Math.sin(simTime * 5) * 4) : 0),
        signalStrength: Math.round(Math.max(10, 100 * (1 - dist / rfMaxRange))),
      };
    }

    // 4. Acoustic Array check
    let acousticConfidence = 0;
    if (sensorState.acousticActive && dist <= acousticMaxRange && entity.altitude < 180) {
      acousticConfidence = Math.max(0, 1 - dist / acousticMaxRange);
      if (acousticConfidence > 0.25) {
        detectedBy.push('acoustic');
      }
    }

    // If detected by at least one sensor, update track data
    if (detectedBy.length > 0) {
      const existing = existingTracks.get(entity.trackId);
      const firstDetected = existing?.firstDetectedTime ?? simTime;

      // Add noise to estimation based on radar/sensor reliability
      const noiseDistance = radarDetected ? (Math.sin(simTime * 3 + dist) * 12) : 0;
      const noiseBearing = radarDetected ? (Math.cos(simTime * 2 + dist) * 1.2) : 0;

      const estimatedX = entity.x + noiseDistance * Math.cos((bearing * Math.PI) / 180);
      const estimatedY = entity.y + noiseDistance * Math.sin((bearing * Math.PI) / 180);
      const estimatedDist = Math.hypot(estimatedX, estimatedY);
      const estimatedBearing = (bearing + noiseBearing + 360) % 360;

      let iffDisplay: TrackSensorData['iffDisplay'] = 'UNKNOWN';
      if (entity.iffStatus === 'valid') {
        iffDisplay = 'FRIENDLY_SQUAWK';
      } else if (entity.iffStatus === 'faulty') {
        iffDisplay = simTime % 4 < 2 ? 'FRIENDLY_SQUAWK' : 'NO_RESPONSE'; // Intermittent faulty squawk
      } else {
        iffDisplay = 'NO_RESPONSE';
      }

      const trackData: TrackSensorData = {
        trackId: entity.trackId,
        detectedBy,
        estimatedX,
        estimatedY,
        estimatedDistance: Math.round(estimatedDist),
        estimatedBearing: Math.round(estimatedBearing * 10) / 10,
        estimatedSpeed: Math.round(entity.speed),
        estimatedAltitude: Math.round(entity.altitude),
        estimatedRCS: entity.rcs,
        rfSignal,
        iffDisplay,
        eoVisualConfidence: Math.round(eoConfidence * 100) / 100,
        acousticConfidence: Math.round(acousticConfidence * 100) / 100,
        firstDetectedTime: firstDetected,
        userAcknowledged: existing?.userAcknowledged ?? false,
        userAcknowledgedTime: existing?.userAcknowledgedTime ?? null,
        userClassification: existing?.userClassification ?? 'unknown',
        userConfidence: existing?.userConfidence ?? 'low',
        lastAction: existing?.lastAction,
        lastActionTime: existing?.lastActionTime,
      };

      updatedTracks.set(entity.trackId, trackData);
    }
  });

  // Generate ghost blips / false radar clutter if falseBlips degradation is active
  const updatedGhostBlips: Array<{ id: string; x: number; y: number; rcs: number }> = [];
  if (sensorState.radarActive && scenario.sensorDegradation.falseBlips && !isRadarInOutage) {
    // 2 drifting ghost clutter points
    const g1X = 1400 * Math.cos(simTime * 0.05 + 1.2) + Math.sin(simTime * 2) * 40;
    const g1Y = 1600 * Math.sin(simTime * 0.04 + 0.8) + Math.cos(simTime * 2) * 40;
    const g2X = -2100 * Math.cos(simTime * 0.03 + 2.5);
    const g2Y = -1200 * Math.sin(simTime * 0.03 + 2.1);
    updatedGhostBlips.push({ id: 'GHOST-01', x: g1X, y: g1Y, rcs: 0.006 });
    updatedGhostBlips.push({ id: 'GHOST-02', x: g2X, y: g2Y, rcs: 0.008 });
  }

  return { updatedTracks, newSweepAngle, updatedGhostBlips };
}
