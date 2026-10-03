import React, { useState } from 'react';
import { storageService, type CurrentUser } from '../storage/storageService';
import { soundFx } from '../utils/audio';
import {
  Shield,
  Target,
  Zap,
  BarChart3,
  Trophy,
  Play,
  Radio,
  Activity,
  ChevronRight,
  AlertTriangle,
  Crosshair,
  Eye,
  Plane,
  Layers,
} from 'lucide-react';

interface HomePageProps {
  currentUser: CurrentUser;
  onSaveProfile: (user: CurrentUser) => void;
  onStartAdaptive: () => void;
  onGoToScenarios: () => void;
  onGoToAAR: () => void;
  onGoToLeaderboard: () => void;
}

const SkillBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-slate-300 font-medium">{label}</span>
      <span className={`font-mono font-bold ${color}`}>{value}%</span>
    </div>
    <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${value}%`,
          background: color.includes('emerald')
            ? '#10b981'
            : color.includes('cyan')
            ? '#0ea5e9'
            : color.includes('amber')
            ? '#f59e0b'
            : '#a855f7',
        }}
      />
    </div>
  </div>
);

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta: string;
  color: string;
  borderColor: string;
  bgIcon: string;
  onClick: () => void;
}> = ({ icon, title, desc, cta, color, borderColor, bgIcon, onClick }) => (
  <div
    onClick={() => {
      soundFx.playClick();
      onClick();
    }}
    className="group relative rounded-xl p-5 cursor-pointer transition-all duration-150 hover:-translate-y-0.5 bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col justify-between shadow-lg"
    style={{ borderColor }}
  >
    <div className="space-y-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: `${bgIcon}18`, border: `1px solid ${bgIcon}35` }}
      >
        <span style={{ color: bgIcon }}>{icon}</span>
      </div>
      <div>
        <h3 className={`text-sm font-bold tracking-wide ${color}`}>{title}</h3>
        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{desc}</p>
      </div>
    </div>

    <span
      className={`mt-4 inline-flex items-center space-x-1 text-xs font-mono font-bold tracking-wider ${color} group-hover:translate-x-1 transition-transform`}
    >
      <span>{cta}</span>
      <ChevronRight style={{ width: 14, height: 14 }} />
    </span>
  </div>
);

export const HomePage: React.FC<HomePageProps> = ({
  currentUser,
  onSaveProfile,
  onStartAdaptive,
  onGoToScenarios,
  onGoToAAR,
  onGoToLeaderboard,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [unit, setUnit] = useState(currentUser.unit);
  const [isEditing, setIsEditing] = useState(false);
  const profiles = storageService.getProfiles();
  const activeProfile = profiles.find((p) => p.name === currentUser.name) || {
    name: currentUser.name,
    unit: currentUser.unit,
    sessionsCount: 0,
    avgScore: 0,
    topScore: 0,
    skillProfile: { detection: 0, classification: 0, engagement: 0, efficiency: 0 },
    currentDifficulty: 3,
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const updated = { name: name.trim(), unit: unit.trim() || 'Alpha Squad' };
    onSaveProfile(updated);
    setIsEditing(false);
  };

  const difficultyColor =
    activeProfile.currentDifficulty >= 7
      ? '#ef4444'
      : activeProfile.currentDifficulty >= 4
      ? '#f59e0b'
      : '#10b981';
  const sessions = storageService.getSessions();
  const recentSession = sessions.filter((s) => s.traineeName === currentUser.name)[0];

  return (
    <div className="min-h-[calc(100vh-60px)] bg-slate-950 text-slate-100 font-sans select-none flex flex-col">
      {/* Top Status Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/90 px-4 py-2 text-xs font-mono flex items-center justify-between text-slate-300">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="status-dot online" /> SYSTEM READY
          </span>
          <span className="text-slate-700 hidden md:inline">|</span>
          <span className="hidden md:inline text-slate-300">PS-26247 • COUNTER-UNMANNED AIRCRAFT SYSTEMS TRAINER</span>
        </div>
        <div className="text-slate-400">
          OPERATOR: <span className="text-white font-bold">{currentUser.name}</span>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden p-7 bg-slate-900 border border-slate-800 shadow-xl">
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md text-xs font-mono font-bold bg-slate-950 border border-emerald-500/30 text-emerald-400">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TACTICAL AIR DEFENSE SIMULATION PLATFORM</span>
                </div>

                <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  COUNTER-UAS THREAT SIMULATION TRAINER
                </h1>

                <p className="text-xs lg:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Unit-level training environment to detect, classify, and neutralize autonomous drones, loitering munitions, and swarm attacks.
                  Integrates radar telemetry, optical slewing, RF analysis, rule-of-engagement evaluation, and After-Action Review analytics.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {['2D RADAR SCOPE', 'EO/IR OPTICAL APERTURE', 'RF EMISSION ANALYSIS', 'ADAPTIVE AI ENGINE', 'AAR TIMELINE REPLAY'].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 text-slate-300"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
                <button
                  onClick={onStartAdaptive}
                  className="btn-tactical flex items-center space-x-2.5 px-6 py-3 rounded-xl font-bold text-slate-950 text-xs bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-lg cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>LAUNCH ADAPTIVE MISSION</span>
                </button>

                <div className="text-xs font-mono text-slate-400">
                  CURRENT ADAPTIVE TIER:{' '}
                  <span className="font-bold text-xs" style={{ color: difficultyColor }}>
                    LEVEL {activeProfile.currentDifficulty}/10
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'READINESS SCORE',
                value: `${activeProfile.avgScore || 0}%`,
                note: 'Rolling evaluation average',
                icon: <Activity className="w-4 h-4" />,
                color: 'text-emerald-400',
              },
              {
                label: 'TRAINING FOCUS',
                value:
                  activeProfile.skillProfile.classification <= activeProfile.skillProfile.detection
                    ? 'CLASSIFICATION'
                    : 'DETECTION SPEED',
                note: 'Prioritized weakness',
                icon: <Target className="w-4 h-4" />,
                color: 'text-cyan-400',
              },
              {
                label: 'DRILLS COMPLETED',
                value: activeProfile.sessionsCount,
                note: 'Recorded mission debriefs',
                icon: <BarChart3 className="w-4 h-4" />,
                color: 'text-amber-400',
              },
              {
                label: 'THREAT POSTURE',
                value: activeProfile.currentDifficulty >= 7 ? 'ELEVATED' : 'STANDARD',
                note: `Tier ${activeProfile.currentDifficulty}/10 complexity`,
                icon: <Shield className="w-4 h-4" />,
                color: activeProfile.currentDifficulty >= 7 ? 'text-red-400' : 'text-sky-400',
              },
            ].map((metric) => (
              <div key={metric.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
                <span className={`${metric.color} p-2 rounded-lg bg-slate-950 border border-slate-800`}>{metric.icon}</span>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{metric.label}</div>
                  <div className={`text-lg font-bold ${metric.color}`}>{metric.value}</div>
                  <div className="text-[11px] text-slate-400 truncate">{metric.note}</div>
                </div>
              </div>
            ))}
          </div>

          {/* OPERATIONAL DOCTRINE & QUICK START GUIDE */}
          <div className="rounded-xl p-5 bg-slate-900 border border-slate-800 space-y-4 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
                  <Crosshair className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                    OPERATOR ENGAGEMENT DOCTRINE &amp; QUICK START
                  </h2>
                  <p className="text-xs text-slate-400">
                    Mission Goal: Defend Base Command coordinates (0,0) from incoming aerial threats before perimeter breach at 500m.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-950 text-cyan-300 border border-slate-800">
                STANDARD ENGAGEMENT SEQUENCE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Step 1 */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-400 text-xs">PHASE 1: TARGET ACQUISITION</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">RADAR CLICK</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  Monitor the rotating 3,500m radar sweep. When a contact blip appears with a pulsing amber ring, <strong>click the radar blip</strong> or select its ID from the left Track List.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-400 text-xs">PHASE 2: DETECT &amp; CLASSIFY</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-cyan-300 border border-slate-800">[D] &amp; [1-6]</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  Press <strong>[D]</strong> to log detection speed. Click <strong>SLEW CAMERA</strong> to focus optical EO/IR lens. Check RF emission signatures and select classification from 1 to 6.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-400 text-xs">PHASE 3: NEUTRALIZE</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-amber-300 border border-slate-800">[J] / [H] / [A]</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  • RF Controlled Threat (&lt;1800m): Deploy <strong>RF Jammer [J]</strong> (unlimited ammo).<br />
                  • Autonomous / Fast Threat: Fire <strong>Kinetic Missile [H]</strong>.<br />
                  • Perimeter Entry (&lt;1500m): Sound <strong>Base Alarm [A]</strong> for bunker cover.
                </p>
              </div>
            </div>

            {/* Quick Hotkeys Reference Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300">
              <span className="font-bold text-emerald-400 text-[11px]">HOTKEYS:</span>
              <span><kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-white font-bold">SPACE</kbd> Pause</span>
              <span><kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-white font-bold">D</kbd> Detect</span>
              <span><kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-white font-bold">1-6</kbd> Classify</span>
              <span><kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-amber-300 font-bold">J</kbd> Jammer</span>
              <span><kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-red-300 font-bold">H</kbd> Kinetic</span>
              <span><kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-red-400 font-bold">A</kbd> Alarm</span>
              <span><kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-cyan-300 font-bold">?</kbd> Tutorial</span>
            </div>
          </div>

          {/* Main Grid: Profile + Action Modules */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Operator Profile Card */}
            <div className="lg:col-span-1 rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                    OPERATOR PROFILE
                  </span>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">CALLSIGN / RANK</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Sub. Vikram Singh"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">ASSIGNED REGIMENT / BATTERY</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. 48 Air Defence Regiment"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 tracking-wider transition-colors cursor-pointer"
                  >
                    SAVE PROFILE
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base text-emerald-300 bg-slate-950 border border-slate-800">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{currentUser.unit}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      { label: 'DRILLS', value: activeProfile.sessionsCount, color: 'text-cyan-300' },
                      { label: 'AVG SCORE', value: `${activeProfile.avgScore}%`, color: 'text-emerald-300' },
                      { label: 'TOP SCORE', value: `${activeProfile.topScore}%`, color: 'text-amber-300' },
                      { label: 'TIER', value: `LVL ${activeProfile.currentDifficulty}`, color: 'text-purple-300' },
                    ].map((stat) => (
                      <div key={stat.label} className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-[9px] font-mono text-slate-400">{stat.label}</div>
                        <div className={`text-sm font-mono font-bold ${stat.color}`}>{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-mono font-bold text-slate-400 uppercase">SKILL EVALUATION</div>
                    <SkillBar label="Detection Speed" value={activeProfile.skillProfile.detection} color="text-emerald-400" />
                    <SkillBar label="Classification Accuracy" value={activeProfile.skillProfile.classification} color="text-cyan-400" />
                    <SkillBar label="Engagement Tree" value={activeProfile.skillProfile.engagement} color="text-amber-400" />
                    <SkillBar label="Resource Efficiency" value={activeProfile.skillProfile.efficiency} color="text-purple-400" />
                  </div>

                  {recentSession && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">LATEST EVALUATION</div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 truncate max-w-[130px]">{recentSession.scenarioName}</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {recentSession.grade} ({recentSession.finalScore} PTS)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Feature Modules Grid */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Zap className="w-5 h-5" />}
                title="ADAPTIVE TRAINING MODE"
                desc="Automated difficulty scaling that analyzes past mission performance and dynamically targets your weakest skill dimension."
                cta="START ADAPTIVE DRILL"
                color="text-emerald-400"
                borderColor="rgba(16,185,129,0.25)"
                bgIcon="#10b981"
                onClick={onStartAdaptive}
              />

              <FeatureCard
                icon={<Target className="w-5 h-5" />}
                title="MISSION SCENARIOS"
                desc="Choose from 5 standard tactical missions (Dawn Recon, Swarm Attack, Convoy Defense) or generate reproducible seed scenarios."
                cta="SELECT MISSION"
                color="text-cyan-400"
                borderColor="rgba(14,165,233,0.25)"
                bgIcon="#0ea5e9"
                onClick={onGoToScenarios}
              />

              <FeatureCard
                icon={<BarChart3 className="w-5 h-5" />}
                title="AFTER-ACTION REVIEW"
                desc="Timeline replay with ground truth revealed, radar trajectory inspection, decision-tree rubric breakdowns, and PDF reports."
                cta="VIEW AAR REPORTS"
                color="text-amber-400"
                borderColor="rgba(245,158,11,0.25)"
                bgIcon="#f59e0b"
                onClick={onGoToAAR}
              />

              <FeatureCard
                icon={<Trophy className="w-5 h-5" />}
                title="UNIT LEADERBOARD"
                desc="Comparative squad rankings, unit readiness assessment, qualification tiers, and squad weakness analytics."
                cta="VIEW RANKINGS"
                color="text-purple-400"
                borderColor="rgba(168,85,247,0.25)"
                bgIcon="#a855f7"
                onClick={onGoToLeaderboard}
              />

              {/* Threat Types Guide Card */}
              <div className="sm:col-span-2 rounded-xl p-5 bg-slate-900 border border-slate-800 space-y-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                    RECOGNIZED TARGET CLASSIFICATIONS &amp; SENSOR PROFILES
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {[
                    { label: 'KAMIKAZE ATTACK', color: 'text-red-400', bg: 'bg-slate-950 border-red-900/60', icon: <Plane className="w-4 h-4 text-red-400" /> },
                    { label: 'RECON DRONE', color: 'text-amber-400', bg: 'bg-slate-950 border-amber-900/60', icon: <Eye className="w-4 h-4 text-amber-400" /> },
                    { label: 'SWARM FORMATION', color: 'text-rose-400', bg: 'bg-slate-950 border-rose-900/60', icon: <Layers className="w-4 h-4 text-rose-400" /> },
                    { label: 'FRIENDLY UAV', color: 'text-blue-400', bg: 'bg-slate-950 border-blue-900/60', icon: <Shield className="w-4 h-4 text-blue-400" /> },
                    { label: 'CIVILIAN DRONE', color: 'text-yellow-400', bg: 'bg-slate-950 border-yellow-900/60', icon: <Radio className="w-4 h-4 text-yellow-400" /> },
                    { label: 'BIRD / DECOY', color: 'text-slate-400', bg: 'bg-slate-950 border-slate-800', icon: <Activity className="w-4 h-4 text-slate-400" /> },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`p-2.5 rounded-lg border text-center space-y-1.5 flex flex-col items-center justify-center ${item.bg}`}
                    >
                      <div>{item.icon}</div>
                      <div className={`text-[10px] font-mono font-bold leading-tight ${item.color}`}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-3 text-center text-xs font-mono text-slate-400 bg-slate-900/60">
        GHOST PROTOCOL C-UAS SIMULATOR • PS-26247 DEFENCE SERVICES STAFF COLLEGE • OFFLINE TRAINING ENVIRONMENT
      </footer>
    </div>
  );
};
