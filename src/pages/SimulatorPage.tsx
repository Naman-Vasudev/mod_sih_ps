import React, { useState, useEffect, useRef } from 'react';
import type { ScenarioConfig, UserClassification, EngagementType, SensorType, SessionResult } from '../types';
import {
  type SimulationState,
  createSimulationEngine,
  tickSimulation,
  executeTraineeAction,
} from '../sim/engine';
import { calculateSessionScore } from '../scoring/rubric';
import { generateFeedback } from '../ai/instructor';
import { RadarCanvas } from '../components/RadarCanvas';
import { HUDPanel } from '../components/HUDPanel';
import { MissionBriefingModal } from '../components/MissionBriefingModal';
import { TutorialModal } from '../components/TutorialModal';
import type { CurrentUser } from '../storage/storageService';
import { soundFx } from '../utils/audio';
import { Play, Pause, Award, Sun, Moon, Cloud, CloudRain, Map, AlertTriangle, HelpCircle, Sparkles } from 'lucide-react';

interface SimulatorPageProps {
  scenario: ScenarioConfig;
  currentUser: CurrentUser;
  onFinishSession: (result: SessionResult) => void;
  onOpenTutorial: () => void;
}

const ENV_BADGE_ICONS: Record<string, React.ReactNode> = {
  day: <Sun style={{ width: 11, height: 11 }} />,
  night: <Moon style={{ width: 11, height: 11 }} />,
  clear: <Sun style={{ width: 11, height: 11 }} />,
  fog: <Cloud style={{ width: 11, height: 11 }} />,
  rain: <CloudRain style={{ width: 11, height: 11 }} />,
  urban: <Map style={{ width: 11, height: 11 }} />,
  rural: <Map style={{ width: 11, height: 11 }} />,
  mountain: <Map style={{ width: 11, height: 11 }} />,
};

const FIXED_STEP = 1 / 30; // 30Hz deterministic fixed physics step

export const SimulatorPage: React.FC<SimulatorPageProps> = ({
  scenario,
  currentUser,
  onFinishSession,
  onOpenTutorial: _onOpenTutorial,
}) => {
  const [simState, setSimState] = useState<SimulationState>(() => {
    const initial = createSimulationEngine(scenario);
    return { ...initial, isPaused: true }; // Start paused for briefing
  });

  const [isBriefingOpen, setIsBriefingOpen] = useState(true);
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPracticeMode, setIsPracticeMode] = useState(false);

  const simRef = useRef<SimulationState>(simState);
  useEffect(() => {
    simRef.current = simState;
  }, [simState]);

  const animFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Countdown controller
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 900);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCountdown(null);
        setSimState((prev) => ({ ...prev, isPaused: false }));
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleStartFromBriefing = (practice: boolean) => {
    setIsPracticeMode(practice);
    setIsBriefingOpen(false);
    setCountdown(3);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      const current = simRef.current;
      const selTrack = current.selectedTrackId;
      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          soundFx.playClick();
          setSimState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
          break;
        case 'd':
          if (selTrack) {
            soundFx.playRadarPing();
            setSimState((prev) => executeTraineeAction(prev, 'detect', selTrack));
          }
          break;
        case 'j':
          if (selTrack) {
            soundFx.playJammer();
            setSimState((prev) => executeTraineeAction(prev, 'engage', selTrack, { type: 'jam' }));
          }
          break;
        case 's':
          if (selTrack) {
            soundFx.playJammer();
            setSimState((prev) => executeTraineeAction(prev, 'engage', selTrack, { type: 'soft_kill' }));
          }
          break;
        case 'h':
          if (selTrack) {
            soundFx.playKineticFire();
            setSimState((prev) => executeTraineeAction(prev, 'engage', selTrack, { type: 'hard_kill' }));
          }
          break;
        case 'a':
          soundFx.playAlarm();
          setSimState((prev) => executeTraineeAction(prev, 'alarm', null));
          break;
        case 'escape':
          soundFx.playClick();
          setSimState((prev) => ({ ...prev, selectedTrackId: null }));
          break;
        case '1':
          if (selTrack) {
            soundFx.playClick();
            setSimState((prev) => executeTraineeAction(prev, 'classify', selTrack, { classification: 'hostile_attack', confidence: 'high' }));
          }
          break;
        case '2':
          if (selTrack) {
            soundFx.playClick();
            setSimState((prev) => executeTraineeAction(prev, 'classify', selTrack, { classification: 'hostile_recon', confidence: 'high' }));
          }
          break;
        case '3':
          if (selTrack) {
            soundFx.playClick();
            setSimState((prev) => executeTraineeAction(prev, 'classify', selTrack, { classification: 'swarm', confidence: 'high' }));
          }
          break;
        case '4':
          if (selTrack) {
            soundFx.playClick();
            setSimState((prev) => executeTraineeAction(prev, 'classify', selTrack, { classification: 'friendly', confidence: 'high' }));
          }
          break;
        case '5':
          if (selTrack) {
            soundFx.playClick();
            setSimState((prev) => executeTraineeAction(prev, 'classify', selTrack, { classification: 'civilian', confidence: 'high' }));
          }
          break;
        case '6':
          if (selTrack) {
            soundFx.playClick();
            setSimState((prev) => executeTraineeAction(prev, 'classify', selTrack, { classification: 'bird', confidence: 'high' }));
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const accumulatorRef = useRef<number>(0);

  useEffect(() => {
    const loop = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const rawDt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;
      const dt = Math.min(0.1, Math.max(0, rawDt));

      setSimState((prev) => {
        if (prev.isPaused || prev.isCompleted) {
          accumulatorRef.current = 0;
          return prev;
        }

        accumulatorRef.current += dt;
        let next = prev;
        while (accumulatorRef.current >= FIXED_STEP) {
          next = tickSimulation(next, FIXED_STEP);
          accumulatorRef.current -= FIXED_STEP;
          if (next.isCompleted) break;
        }
        return next;
      });

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  const handleSelectTrack = (trackId: string) => {
    soundFx.playClick();
    setSimState((prev) => ({ ...prev, selectedTrackId: trackId }));
  };
  const handleDetectTrack = (trackId: string) => {
    soundFx.playRadarPing();
    setSimState((prev) => executeTraineeAction(prev, 'detect', trackId));
  };
  const handleClassifyTrack = (trackId: string, classification: UserClassification, confidence: 'low' | 'med' | 'high') => {
    soundFx.playClick();
    setSimState((prev) => executeTraineeAction(prev, 'classify', trackId, { classification, confidence }));
  };
  const handleEngageTrack = (trackId: string, type: EngagementType) => {
    if (type === 'hard_kill') soundFx.playKineticFire();
    else soundFx.playJammer();
    setSimState((prev) => executeTraineeAction(prev, 'engage', trackId, { type }));
  };
  const handleSoundAlarm = () => {
    soundFx.playAlarm();
    setSimState((prev) => executeTraineeAction(prev, 'alarm', null));
  };
  const handleSlewCamera = (bearing: number) => {
    soundFx.playClick();
    setSimState((prev) => executeTraineeAction(prev, 'slew_camera', null, { bearing }));
  };
  const handleToggleSensor = (sensor: SensorType) => {
    soundFx.playClick();
    setSimState((prev) => {
      const sensorState = { ...prev.sensorState };
      if (sensor === 'radar') sensorState.radarActive = !sensorState.radarActive;
      if (sensor === 'eo_ir') sensorState.eoIrActive = !sensorState.eoIrActive;
      if (sensor === 'rf') sensorState.rfActive = !sensorState.rfActive;
      if (sensor === 'acoustic') sensorState.acousticActive = !sensorState.acousticActive;
      return { ...prev, sensorState };
    });
  };

  const handleProceedToDebrief = () => {
    const sessionResult = calculateSessionScore(simState, currentUser.name, currentUser.unit);
    sessionResult.aiDebriefFeedback = generateFeedback(sessionResult);
    onFinishSession(sessionResult);
  };

  const hostileCount = Array.from(simState.tracks.values()).filter(
    t => t.userClassification === 'hostile_attack' || t.userClassification === 'swarm' || t.userClassification === 'hostile_recon'
  ).length;

  const diffColor = scenario.difficulty >= 7 ? '#ef4444' : scenario.difficulty >= 4 ? '#f59e0b' : '#10b981';

  // Dynamic Practice Mode Coaching Hint
  let practiceHint: string | null = null;
  if (isPracticeMode) {
    const unackTrack = Array.from(simState.tracks.values()).find((t) => !t.userAcknowledged);
    const selectedTrack = simState.selectedTrackId ? simState.tracks.get(simState.selectedTrackId) : null;
    const selectedEntity = simState.entities.find((e) => e.trackId === simState.selectedTrackId && e.active);

    if (unackTrack) {
      practiceHint = `COACHING: New radar contact [${unackTrack.trackId}]! Click it and press [D] immediately to log quick detection.`;
    } else if (selectedTrack && selectedEntity) {
      if (selectedTrack.userClassification === 'unknown') {
        if (selectedTrack.eoVisualConfidence < 0.3) {
          practiceHint = `COACHING: Optical confidence is low. Click SLEW CAMERA to bearing ${Math.round(selectedTrack.estimatedBearing)}° to identify airframe.`;
        } else {
          practiceHint = `COACHING: Target visible in optical feed! Select classification [1-6] based on airframe geometry.`;
        }
      } else if (selectedEntity.trueType.startsWith('hostile')) {
        if (selectedEntity.isAutonomous) {
          practiceHint = `COACHING: WARNING! Threat has fiber-optic autonomous guidance. RF Jammer will NOT work. Fire Kinetic Interceptor [H] or sound alarm [A]!`;
        } else if (selectedTrack.estimatedDistance <= 1800) {
          practiceHint = `COACHING: Threat within 1800m RF jammer envelope. Press [J] to disable control link and save kinetic ammo!`;
        }
      } else if (selectedEntity.trueType === 'friendly') {
        practiceHint = `COACHING CAUTION: Friendly patrol UAV detected! Do NOT fire kinetic weapons (fratricide penalty -25 pts). Monitor track safely.`;
      } else if (selectedEntity.trueType === 'bird' || selectedEntity.trueType === 'civilian') {
        practiceHint = `COACHING: Non-hostile contact. Conserve interceptors; do not expend countermeasures on decoys.`;
      }
    } else {
      practiceHint = 'COACHING: Monitor perimeter. Select contacts to inspect multi-spectral sensor feeds.';
    }
  }

  return (
    <div className="h-[calc(100vh-60px)] text-slate-100 font-sans select-none flex flex-col relative bg-slate-950">
      {/* Top Mission Bar */}
      <div className="flex items-center justify-between px-4 py-2 text-xs bg-slate-900 border-b border-slate-800 shrink-0 font-mono">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="status-dot online" />
            <span className="font-bold text-white text-sm tracking-wide">{scenario.name}</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-xs text-slate-400">SEED: {scenario.seed}</span>
          <div className="flex items-center space-x-1.5">
            {[scenario.environment.time, scenario.environment.weather, scenario.environment.terrain].map((env) => (
              <span
                key={env}
                className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-950 text-slate-300 border border-slate-800"
              >
                {ENV_BADGE_ICONS[env]}
                <span>{env}</span>
              </span>
            ))}
          </div>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded border"
            style={{
              background: `${diffColor}20`,
              borderColor: `${diffColor}60`,
              color: diffColor,
            }}
          >
            DIFF {scenario.difficulty}/10
          </span>
          {isPracticeMode && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-500 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>PRACTICE MODE</span>
            </span>
          )}
          {hostileCount > 0 && (
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-red-950/80 border border-red-700/80">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[10px] font-bold text-red-300 tracking-wider">
                {hostileCount} HOSTILE{hostileCount > 1 ? 'S' : ''} DETECTED
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSimState((prev) => ({ ...prev, isPaused: !prev.isPaused }))}
            className={`btn-tactical flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
              simState.isPaused
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800 text-slate-200 hover:text-white border border-slate-700'
            }`}
          >
            {simState.isPaused ? <Play style={{ width: 13, height: 13 }} /> : <Pause style={{ width: 13, height: 13 }} />}
            <span>{simState.isPaused ? 'RESUME [SPACE]' : 'PAUSE [SPACE]'}</span>
          </button>
          <button
            onClick={() => setIsTutorialModalOpen(true)}
            className="btn-tactical flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition cursor-pointer"
          >
            <HelpCircle style={{ width: 13, height: 13 }} />
            <span>HOW TO PLAY [?]</span>
          </button>
        </div>
      </div>

      {/* Practice Mode Live Coaching Hint Bar */}
      {isPracticeMode && practiceHint && (
        <div className="bg-cyan-950 border-b border-cyan-700 px-4 py-2 text-xs text-cyan-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-bold tracking-wide font-mono">{practiceHint}</span>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <div className="p-4 flex items-center justify-center shrink-0 bg-slate-950 border-r border-slate-800">
          <RadarCanvas
            tracks={simState.tracks}
            entities={simState.entities}
            sensorState={simState.sensorState}
            selectedTrackId={simState.selectedTrackId}
            onSelectTrack={handleSelectTrack}
            terrain={scenario.environment.terrain}
            timeOfDay={scenario.environment.time}
            weather={scenario.environment.weather}
            assetHealth={simState.assetHealth}
            width={600}
            height={600}
          />
        </div>
        <div className="flex-1 min-w-0 bg-slate-950">
          <HUDPanel
            assetHealth={simState.assetHealth}
            ammoCount={simState.ammoCount}
            maxAmmo={simState.maxAmmo}
            jammerCooldown={simState.jammerCooldown}
            alarmActive={simState.alarmActive}
            simTime={simState.simTime}
            duration={scenario.duration}
            tracks={simState.tracks}
            selectedTrackId={simState.selectedTrackId}
            sensorState={simState.sensorState}
            eventsLog={simState.eventsLog}
            onSelectTrack={handleSelectTrack}
            onDetectTrack={handleDetectTrack}
            onClassifyTrack={handleClassifyTrack}
            onEngageTrack={handleEngageTrack}
            onSoundAlarm={handleSoundAlarm}
            onSlewCamera={handleSlewCamera}
            onToggleSensor={handleToggleSensor}
          />
        </div>
      </div>

      {/* Mission Complete Overlay */}
      {simState.isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div
            className={`w-full max-w-md p-7 rounded-2xl text-center space-y-6 bg-slate-900 border ${
              simState.assetHealth <= 0 ? 'border-red-500' : 'border-emerald-500'
            } shadow-2xl`}
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                simState.assetHealth <= 0 ? 'bg-red-950/80 text-red-400 border border-red-700' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-700'
              }`}
            >
              <Award className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                {simState.assetHealth <= 0 ? 'MISSION FAILED' : 'MISSION COMPLETED'}
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                {simState.assetHealth <= 0 ? 'DEFENDED BASE DESTROYED' : 'AIRSPACE SECTOR SECURED'}
              </h2>
              <p className="text-xs text-slate-300 pt-1">
                Engagement window closed. Final scoring and decision-tree evaluations are ready.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono">
              {[
                { label: 'TRACKS', value: simState.tracks.size },
                { label: 'ASSET HEALTH', value: `${Math.round(Math.max(0, simState.assetHealth))}%` },
                { label: 'TIME', value: `${Math.floor(simState.simTime)}s` },
              ].map((stat) => (
                <div key={stat.label} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400">{stat.label}</div>
                  <div className="font-bold text-emerald-400 text-sm mt-0.5">{stat.value}</div>
                </div>
              ))}
            </div>

            <button
              onClick={handleProceedToDebrief}
              className="btn-tactical w-full py-3.5 rounded-xl font-extrabold text-sm tracking-wider text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition shadow-lg shadow-emerald-950 cursor-pointer"
            >
              PROCEED TO POST-MISSION DEBRIEF &rarr;
            </button>
          </div>
        </div>
      )}

      {/* 3-2-1 COUNTDOWN OVERLAY */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center select-none">
          <div className="space-y-4 text-center">
            <div className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
              MISSION INITIALIZATION • DEFEND BASE (0,0)
            </div>
            <div className="text-8xl font-black text-emerald-400 font-mono tracking-tighter drop-shadow-2xl animate-bounce">
              {countdown > 0 ? countdown : 'ENGAGE!'}
            </div>
            <div className="text-sm font-bold text-cyan-300 tracking-widest uppercase">
              {countdown > 0 ? 'CALIBRATING SENSORS & PERIMETER GRIDS' : 'THREAT RADAR SWEEP ACTIVE'}
            </div>
          </div>
        </div>
      )}

      {/* MISSION BRIEFING MODAL */}
      <MissionBriefingModal
        scenario={scenario}
        isOpen={isBriefingOpen}
        onStartMission={handleStartFromBriefing}
        onOpenTutorial={() => setIsTutorialModalOpen(true)}
      />

      {/* HOW TO PLAY TUTORIAL MODAL */}
      <TutorialModal
        isOpen={isTutorialModalOpen}
        onClose={() => setIsTutorialModalOpen(false)}
        scenarioName={scenario.name}
        scenarioId={scenario.id}
      />
    </div>
  );
};