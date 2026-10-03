import React, { useRef, useEffect } from 'react';
import type {
  TrackSensorData,
  UserClassification,
  EngagementType,
  SensorType,
} from '../types';
import type { SensorSystemState } from '../sim/sensors';
import {
  Shield,
  Zap,
  Crosshair,
  AlertTriangle,
  Radio,
  Eye,
  Volume2,
  Sliders,
} from 'lucide-react';

interface HUDPanelProps {
  assetHealth: number;
  ammoCount: number;
  maxAmmo: number;
  jammerCooldown: number;
  alarmActive: boolean;
  simTime: number;
  duration: number;
  tracks: Map<string, TrackSensorData>;
  selectedTrackId: string | null;
  sensorState: SensorSystemState;
  eventsLog: Array<{ id: string; time: number; text: string; type: string }>;
  onSelectTrack: (trackId: string) => void;
  onDetectTrack: (trackId: string) => void;
  onClassifyTrack: (trackId: string, classification: UserClassification, confidence: 'low' | 'med' | 'high') => void;
  onEngageTrack: (trackId: string, type: EngagementType) => void;
  onSoundAlarm: () => void;
  onSlewCamera: (bearing: number) => void;
  onToggleSensor: (sensor: SensorType) => void;
}

export const HUDPanel: React.FC<HUDPanelProps> = ({
  assetHealth,
  ammoCount,
  maxAmmo,
  jammerCooldown,
  alarmActive,
  simTime,
  duration,
  tracks,
  selectedTrackId,
  sensorState,
  eventsLog,
  onSelectTrack,
  onDetectTrack,
  onClassifyTrack,
  onEngageTrack,
  onSoundAlarm,
  onSlewCamera,
  onToggleSensor,
}) => {
  const selectedTrack = selectedTrackId ? tracks.get(selectedTrackId) : null;
  const eventsEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll event log to latest entry
  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [eventsLog.length]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none border-t border-slate-800">
      {/* Top Status & Resource Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 gap-3">
        {/* Asset Health Bar */}
        <div className="flex items-center space-x-3 w-64">
          <Shield className={`w-5 h-5 ${assetHealth > 50 ? 'text-emerald-400' : 'text-red-400 animate-pulse'}`} />
          <div className="flex-1">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300 font-bold">DEFENDED ASSET</span>
              <span className={assetHealth > 50 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                {Math.round(assetHealth)}%
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-300 ${
                  assetHealth > 50 ? 'bg-emerald-500' : assetHealth > 25 ? 'bg-amber-500' : 'bg-red-500 animate-pulse'
                }`}
                style={{ width: `${Math.max(0, assetHealth)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tactical Counters & Emergency Siren */}
        <div className="flex items-center space-x-4 font-mono text-xs">
          {/* Interceptor Inventory */}
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">AMMO:</span>
            <span className="text-white font-bold">{ammoCount} / {maxAmmo}</span>
          </div>

          {/* Jammer Status */}
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700">
            <Zap className={`w-4 h-4 ${jammerCooldown === 0 ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="text-slate-400">JAMMER:</span>
            <span className={jammerCooldown === 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
              {jammerCooldown === 0 ? 'READY' : `${Math.ceil(jammerCooldown)}s CD`}
            </span>
          </div>

          {/* Base Alarm Button */}
          <button
            onClick={onSoundAlarm}
            className={`px-3 py-1.5 text-xs font-bold font-mono rounded-lg flex items-center space-x-1.5 transition cursor-pointer ${
              alarmActive
                ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-950'
                : 'bg-slate-800 text-red-400 hover:bg-red-950 border border-red-700/60'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{alarmActive ? 'ALARM ACTIVE [COVER]' : 'SOUND ALARM [A]'}</span>
          </button>
        </div>

        {/* Mission Clock */}
        <div className="text-right font-mono">
          <div className="text-[10px] text-slate-400">MISSION CLOCK</div>
          <div className="text-base font-bold text-white tracking-wider">
            {formatTime(simTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>

      {/* Sensor Controls Bar */}
      <div className="flex items-center space-x-3 px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs font-mono">
        <span className="text-slate-400 flex items-center space-x-1 font-bold">
          <Sliders className="w-3.5 h-3.5" />
          <span>SENSORS:</span>
        </span>

        <button
          onClick={() => onToggleSensor('radar')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border font-bold transition-colors cursor-pointer ${
            sensorState.radarActive
              ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-sm'
              : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>RADAR (ACTIVE)</span>
        </button>

        <button
          onClick={() => onToggleSensor('eo_ir')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border font-bold transition-colors cursor-pointer ${
            sensorState.eoIrActive
              ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-sm'
              : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>EO/IR CAMERA</span>
        </button>

        <button
          onClick={() => onToggleSensor('rf')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border font-bold transition-colors cursor-pointer ${
            sensorState.rfActive
              ? 'bg-amber-950 text-amber-300 border-amber-500 shadow-sm'
              : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>RF DETECTOR</span>
        </button>

        <button
          onClick={() => onToggleSensor('acoustic')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border font-bold transition-colors cursor-pointer ${
            sensorState.acousticActive
              ? 'bg-purple-950 text-purple-300 border-purple-500 shadow-sm'
              : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>ACOUSTIC ARRAY</span>
        </button>
      </div>

      {/* Main Workspace: Track Sidebar + Action Terminal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track List Sidebar */}
        <div className="w-80 border-r border-slate-800 bg-slate-950 p-3 flex flex-col space-y-2.5 overflow-y-auto font-mono">
          <div className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-1.5 flex justify-between">
            <span>TRACK LIST ({tracks.size})</span>
            <span className="text-emerald-400">SEL: {selectedTrackId || 'NONE'}</span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {Array.from(tracks.values()).map((track) => {
              const isSelected = track.trackId === selectedTrackId;
              const isUnack = !track.userAcknowledged;

              return (
                <div
                  key={track.trackId}
                  onClick={() => onSelectTrack(track.trackId)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-400 shadow-md shadow-cyan-950'
                      : isUnack
                      ? 'bg-amber-950/40 border-amber-500/70 animate-pulse'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white flex items-center space-x-1.5">
                      <span>{track.trackId}</span>
                      {isUnack && (
                        <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded">
                          NEW
                        </span>
                      )}
                    </span>
                    <span className="text-slate-300 text-[11px] font-bold">
                      {track.estimatedDistance}m @ {track.estimatedBearing}°
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                    <span>SPD: {track.estimatedSpeed}m/s</span>
                    <span>ALT: {track.estimatedAltitude}m</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px]">
                    <span
                      className={`px-2 py-0.5 rounded font-bold uppercase ${
                        track.userClassification.startsWith('hostile') || track.userClassification === 'swarm'
                          ? 'bg-red-900 text-red-100 border border-red-700'
                          : track.userClassification === 'friendly'
                          ? 'bg-blue-900 text-blue-100 border border-blue-700'
                          : track.userClassification === 'unknown'
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-amber-900 text-amber-100 border border-amber-700'
                      }`}
                    >
                      {track.userClassification}
                    </span>

                    <span className="text-slate-400">IFF: {track.iffDisplay}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Selected Track Action Panel */}
        <div className="flex-1 p-4 bg-slate-900/50 flex flex-col justify-between overflow-y-auto">
          {selectedTrack ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide flex items-center space-x-2">
                    <Crosshair className="w-5 h-5 text-cyan-400" />
                    <span>TARGET MONITORING: {selectedTrack.trackId}</span>
                  </h3>
                  <p className="text-xs font-mono text-slate-300 mt-0.5">
                    Range: {selectedTrack.estimatedDistance}m | Bearing: {selectedTrack.estimatedBearing}° | Alt: {selectedTrack.estimatedAltitude}m
                  </p>
                </div>

                <button
                  onClick={() => onSlewCamera(selectedTrack.estimatedBearing)}
                  className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/80 text-xs font-mono font-bold rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>SLEW CAMERA TO {Math.round(selectedTrack.estimatedBearing)}°</span>
                </button>
              </div>

              {/* Sensor Feeds Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 font-mono">
                  <div className="text-slate-300 font-bold flex justify-between">
                    <span>EO/IR OPTICAL FEED</span>
                    <span className="text-cyan-400 font-bold">{Math.round(selectedTrack.eoVisualConfidence * 100)}% CONFIDENCE</span>
                  </div>
                  <div className="text-xs text-slate-200 font-sans">
                    {selectedTrack.eoVisualConfidence > 0.6 ? (
                      <span className="text-emerald-400 font-bold">Clear optical recognition active</span>
                    ) : selectedTrack.eoVisualConfidence > 0.2 ? (
                      <span className="text-amber-400 font-medium">Partial optical contact — slew optical camera towards bearing</span>
                    ) : (
                      <span className="text-slate-400">Target outside optical camera aperture</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 font-mono">
                  <div className="text-slate-300 font-bold flex justify-between">
                    <span>RF SPECTRUM FEED</span>
                    <span className="text-amber-400 font-bold">
                      {selectedTrack.rfSignal ? `${selectedTrack.rfSignal.signalStrength}% SIGNAL` : 'NO RF EMISSION'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-200 font-sans">
                    {selectedTrack.rfSignal ? (
                      <span className="text-amber-300 font-medium">
                        BAND: {selectedTrack.rfSignal.frequency} (Telemetry / Control link detected)
                      </span>
                    ) : (
                      <span className="text-slate-400">Silent RF / Autonomous Flight / Biological</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Trainee Countermeasure Actions Panel */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3.5">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  TRAINEE ACTIONS &amp; COUNTERMEASURES
                </div>

                {/* Step 1: Detect */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onDetectTrack(selectedTrack.trackId)}
                    disabled={selectedTrack.userAcknowledged}
                    className={`px-4 py-2 text-xs font-bold font-mono rounded-lg border transition cursor-pointer ${
                      selectedTrack.userAcknowledged
                        ? 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400 shadow-md'
                    }`}
                  >
                    {selectedTrack.userAcknowledged ? 'ACKNOWLEDGED [D]' : '1. DETECT / ACKNOWLEDGE CONTACT [D]'}
                  </button>
                </div>

                {/* Step 2: Classify */}
                <div className="space-y-1.5 font-mono">
                  <div className="text-xs text-slate-400">2. CLASSIFY TARGET IDENTITY:</div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                    {[
                      { key: 'hostile_attack', label: '1. ATTACK' },
                      { key: 'hostile_recon', label: '2. RECON' },
                      { key: 'swarm', label: '3. SWARM' },
                      { key: 'friendly', label: '4. FRIENDLY' },
                      { key: 'civilian', label: '5. CIVILIAN' },
                      { key: 'bird', label: '6. BIRD' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() =>
                          onClassifyTrack(selectedTrack.trackId, item.key as UserClassification, 'high')
                        }
                        className={`px-2 py-2 rounded-lg border text-xs font-bold text-center transition cursor-pointer ${
                          selectedTrack.userClassification === item.key
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-extrabold'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Engage */}
                <div className="space-y-1.5 font-mono">
                  <div className="text-xs text-slate-400">3. EXECUTE COUNTERMEASURE:</div>
                  <div className="flex space-x-2.5">
                    <button
                      onClick={() => onEngageTrack(selectedTrack.trackId, 'jam')}
                      disabled={jammerCooldown > 0}
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-900 text-slate-950 disabled:text-slate-600 font-extrabold text-xs rounded-lg transition cursor-pointer shadow-md disabled:border-slate-800"
                    >
                      RF JAMMER [J]
                    </button>

                    <button
                      onClick={() => onEngageTrack(selectedTrack.trackId, 'soft_kill')}
                      className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-lg transition cursor-pointer shadow-md"
                    >
                      SOFT-KILL / GPS SPOOF [S]
                    </button>

                    <button
                      onClick={() => onEngageTrack(selectedTrack.trackId, 'hard_kill')}
                      disabled={ammoCount <= 0}
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-900 text-white disabled:text-slate-600 font-extrabold text-xs rounded-lg transition cursor-pointer shadow-md disabled:border-slate-800"
                    >
                      KINETIC INTERCEPTOR [H]
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-sm">
                <Crosshair className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  PHASE 1: ACQUIRE TARGET CONTACT
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click any <strong>radar blip</strong> on the scope or select a track from the <strong>Track List</strong> on the left to inspect sensor feeds and deploy countermeasures.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 w-full max-w-md text-[11px] font-mono text-left pt-1">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-emerald-400 font-bold block">1. DETECT [D]</span>
                  <span className="text-slate-400 text-[10px]">Log rapid acquisition</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-cyan-400 font-bold block">2. CLASSIFY [1-6]</span>
                  <span className="text-slate-400 text-[10px]">Optical / RF check</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-amber-400 font-bold block">3. ENGAGE [J/H]</span>
                  <span className="text-slate-400 text-[10px]">Jammer or Kinetic</span>
                </div>
              </div>
            </div>
          )}

          {/* Chronological Event Log */}
          <div className="mt-4 bg-slate-950 p-3 rounded-xl border border-slate-800 h-32 flex flex-col font-mono text-xs">
            <div className="font-bold text-slate-400 border-b border-slate-800 pb-1 mb-1.5">
              TACTICAL EVENT LOG (CHRONOLOGICAL)
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {eventsLog.slice(-20).map((evt) => (
                <div key={evt.id} className="flex space-x-2">
                  <span className="text-slate-500">[{Math.floor(evt.time)}s]</span>
                  <span
                    className={
                      evt.type === 'alert'
                        ? 'text-red-400 font-bold'
                        : evt.type === 'warn'
                        ? 'text-amber-400'
                        : evt.type === 'success'
                        ? 'text-emerald-400 font-bold'
                        : 'text-cyan-300'
                    }
                  >
                    {evt.text}
                  </span>
                </div>
              ))}
              <div ref={eventsEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
