import React, { useState } from 'react';
import {
  Shield,
  Eye,
  Radio,
  Crosshair,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Volume2,
  Sliders,
  X,
  Target,
  Info,
} from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioName?: string;
  scenarioId?: string;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  scenarioName = 'Standard Mission',
  scenarioId = 'default',
}) => {
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleFinish = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem(`cuas_skip_tutorial_${scenarioId}`, 'true');
        localStorage.setItem('cuas_skip_tutorial_all', 'true');
      } catch {
        // storage ignored
      }
    }
    onClose();
  };

  // Mode-specific tactical advisory
  const getModeTip = (name: string) => {
    if (name.includes('Dawn Recon')) {
      return 'MODE TIP: Single slow quadcopter. Take your time slewing the EO/IR lens to inspect its frame, then deploy RF Jammer when in range.';
    }
    if (name.includes('Convoy Kamikaze')) {
      return 'MODE TIP: Fast attack incoming at night! Autonomous guidance means RF Jammer is ineffective. Sound Base Alarm [A] immediately and fire Kinetic Interceptor [H]!';
    }
    if (name.includes('Bird')) {
      return 'MODE TIP: Migratory birds move erratically with low RCS (<0.01 dBSM). Always verify visual feed before firing to avoid decoy waste penalties.';
    }
    if (name.includes('Urban Swarm')) {
      return 'MODE TIP: 12-drone swarm navigation. Tall buildings cause radar shadowing. Deploy RF Jammer when the cluster enters 1800m to neutralize multiple links simultaneously!';
    }
    if (name.includes('Friendly')) {
      return 'MODE TIP: Friendly UAVs have intermittent transponder squawks. Confirm IFF visually via EO/IR before launching kinetic weapons - fratricide incurs a -25 pt penalty!';
    }
    return 'ADAPTIVE MODE TIP: This scenario dynamically adjusts speed, environmental modifiers, and threat densities to target your weakest skill profile.';
  };

  const steps = [
    {
      title: '1. RADAR SCOPE & DEFENDED ASSET',
      icon: <Radio className="w-6 h-6 text-emerald-400" />,
      spotlightTarget: 'RADAR SCOPE (CENTER CANVAS)',
      content: (
        <div className="space-y-2 text-xs text-zinc-300 leading-relaxed font-sans">
          <p>
            You are stationed at tactical base command defending the central asset at coordinates <strong className="text-emerald-300">(0,0)</strong>.
          </p>
          <p>
            The green rotating sweep line displays active radar scans up to <strong className="text-emerald-300">3,500m</strong>. The inner red circle marks the <strong className="text-red-400">500m Critical Defense Perimeter</strong>; any hostile drone crossing this ring will impact and damage base personnel!
          </p>
          <div className="p-2 bg-emerald-950/40 border border-emerald-800/60 rounded text-[11px] text-emerald-300">
            Range Rings: 500m (Kill Zone), 1000m (Tactical Intercept), 2000m (RF Jammer Envelope), 3000m (Early Warning).
          </div>
        </div>
      ),
    },
    {
      title: '2. TARGET TRACK SELECTION',
      icon: <Target className="w-6 h-6 text-cyan-400" />,
      spotlightTarget: 'RADAR BLIPS & LEFT TRACK LIST',
      content: (
        <div className="space-y-2 text-xs text-zinc-300 leading-relaxed font-sans">
          <p>
            Incoming contacts appear as blips on the radar and entries in the <strong className="text-cyan-300">TRACK LIST</strong> on the left sidebar.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-zinc-300 text-[11px]">
            <li><strong>Click any radar blip</strong> or track card (e.g. TRK-101) to lock target reticle.</li>
            <li>Unacknowledged tracks pulse with an <strong className="text-amber-400">AMBER ALERT RING</strong>.</li>
            <li>Press <strong className="text-zinc-100">[ESC]</strong> at any time to clear active target selection.</li>
          </ul>
        </div>
      ),
    },
    {
      title: '3. DETECTION & ACKNOWLEDGMENT [D]',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
      spotlightTarget: '1. DETECT / ACKNOWLEDGE BUTTON',
      content: (
        <div className="space-y-2 text-xs text-zinc-300 leading-relaxed font-sans">
          <p>
            Immediate acknowledgment is crucial for rapid response and accounts for <strong className="text-emerald-400">25% of your final mission score</strong>:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] p-2 bg-zinc-950 rounded border border-zinc-800">
            <div>&lt; 5.0s: <span className="text-emerald-400 font-bold">100 pts (EXCELLENT)</span></div>
            <div>5 - 10s: <span className="text-cyan-400 font-bold">75 pts (GOOD)</span></div>
            <div>10 - 20s: <span className="text-amber-400 font-bold">40 pts (SLOW)</span></div>
            <div>&gt; 20s: <span className="text-red-400 font-bold">0 pts (MISSED)</span></div>
          </div>
          <p className="text-[11px] text-zinc-400">
            Shortcut: Press <strong className="text-emerald-300 font-mono">[D]</strong> as soon as you select a new target to log prompt reaction time.
          </p>
        </div>
      ),
    },
    {
      title: '4. THE 4 MULTI-SPECTRAL SENSORS',
      icon: <Sliders className="w-6 h-6 text-purple-400" />,
      spotlightTarget: 'TOP SENSOR TOGGLE BAR & SLEW BUTTON',
      content: (
        <div className="space-y-2 text-xs text-zinc-300 leading-relaxed font-sans">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
              <span className="font-bold text-emerald-400 flex items-center space-x-1">
                <Radio className="w-3 h-3" />
                <span>RADAR (3500m)</span>
              </span>
              <p className="text-zinc-400 text-[10px] mt-0.5">Primary long-range search. Degraded by rain and blocked by buildings.</p>
            </div>
            <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
              <span className="font-bold text-cyan-400 flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>EO/IR CAMERA (Slew)</span>
              </span>
              <p className="text-zinc-400 text-[10px] mt-0.5">Narrow 45° optical cone. Click <strong>SLEW CAMERA</strong> to inspect visually!</p>
            </div>
            <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
              <span className="font-bold text-amber-400 flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>RF DETECTOR (2500m)</span>
              </span>
              <p className="text-zinc-400 text-[10px] mt-0.5">Detects 2.4/5.8 GHz control links. Silent if drone is autonomous!</p>
            </div>
            <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
              <span className="font-bold text-purple-400 flex items-center space-x-1">
                <Volume2 className="w-3 h-3" />
                <span>ACOUSTIC ARRAY (650m)</span>
              </span>
              <p className="text-zinc-400 text-[10px] mt-0.5">Detects propeller audio for low-altitude drones (&lt;180m).</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '5. TARGET CLASSIFICATION [1 - 6]',
      icon: <Eye className="w-6 h-6 text-cyan-400" />,
      spotlightTarget: '2. CLASSIFY TARGET TYPE BUTTONS',
      content: (
        <div className="space-y-2 text-xs text-zinc-300 leading-relaxed font-sans">
          <p>
            Inspect the visual feed, RF signals, and IFF transponder, then classify the target. Exact classification matches earn <strong className="text-cyan-300">100 pts</strong>:
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
            <div className="p-1.5 bg-red-950/60 border border-red-800 rounded">[1] ATTACK (Kamikaze)</div>
            <div className="p-1.5 bg-amber-950/60 border border-amber-800 rounded">[2] RECON QUAD</div>
            <div className="p-1.5 bg-red-900/60 border border-red-700 rounded">[3] SWARM GROUP</div>
            <div className="p-1.5 bg-blue-950/60 border border-blue-800 rounded">[4] FRIENDLY UAV</div>
            <div className="p-1.5 bg-zinc-900 border border-zinc-700 rounded">[5] CIVILIAN DRONE</div>
            <div className="p-1.5 bg-yellow-950/60 border border-yellow-800 rounded">[6] BIRD / DECOY</div>
          </div>
          <p className="text-[11px] text-zinc-400">
            Tip: You can re-classify at any time as more sensor data becomes available!
          </p>
        </div>
      ),
    },
    {
      title: '6. WEAPONS & COUNTERMEASURES [J, S, H, A]',
      icon: <Crosshair className="w-6 h-6 text-red-400" />,
      spotlightTarget: '3. EXECUTE COUNTERMEASURE BUTTONS',
      content: (
        <div className="space-y-2 text-xs text-zinc-300 leading-relaxed font-sans">
          <ul className="space-y-1.5 text-[11px]">
            <li className="p-1.5 bg-zinc-950 rounded border border-amber-900/60">
              <strong className="text-amber-400">[J] RF Jammer:</strong> 1800m range, 10s cooldown. Neutralizes RF control links. <em>Useless against autonomous drones!</em>
            </li>
            <li className="p-1.5 bg-zinc-950 rounded border border-purple-900/60">
              <strong className="text-purple-400">[S] Soft-Kill Spoofing:</strong> 2200m range. Spoofs GPS navigation to divert targets.
            </li>
            <li className="p-1.5 bg-zinc-950 rounded border border-red-900/60">
              <strong className="text-red-400">[H] Kinetic Interceptor:</strong> 100% hard-kill. Limited ammo (8 rounds). <em>Never fire on friendlies!</em>
            </li>
            <li className="p-1.5 bg-zinc-950 rounded border border-red-800/60">
              <strong className="text-red-500 font-bold">[A] Sound Base Alarm:</strong> Orders personnel into bunkers. <em>Reduces damage by 50% if a drone impacts!</em>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: '7. HUD GAUGES & RESOURCE MANAGEMENT',
      icon: <Shield className="w-6 h-6 text-amber-400" />,
      spotlightTarget: 'TOP HUD BAR (HEALTH, AMMO, COOLDOWNS)',
      content: (
        <div className="space-y-2 text-xs text-zinc-300 leading-relaxed font-sans">
          <p>
            Monitor your vital base metrics in the top tactical bar:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
              <span className="text-emerald-400 font-bold block">ASSET HEALTH (100%)</span>
              <span className="text-zinc-400 text-[10px]">Depletes if hostiles impact. Mission fails if health reaches 0%.</span>
            </div>
            <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
              <span className="text-cyan-400 font-bold block">INTERCEPTORS (8/8)</span>
              <span className="text-zinc-400 text-[10px]">Kinetic ammo pool. Wasting ammo on birds harms your Efficiency score.</span>
            </div>
            <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
              <span className="text-amber-400 font-bold block">JAMMER COOLDOWN</span>
              <span className="text-zinc-400 text-[10px]">10s thermal recovery after each jamming pulse. Time your bursts!</span>
            </div>
            <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
              <span className="text-purple-400 font-bold block">MISSION CLOCK</span>
              <span className="text-zinc-400 text-[10px]">Threat window countdown. Mission completes when time expires.</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '8. SCORING WEIGHTS & RULES OF ENGAGEMENT',
      icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
      spotlightTarget: 'MISSION DEBRIEF & RUBRIC',
      content: (
        <div className="space-y-2 text-xs text-zinc-300 leading-relaxed font-sans">
          <div className="grid grid-cols-5 gap-1 text-[10px] text-center font-mono">
            <div className="p-1.5 bg-zinc-950 rounded border border-zinc-800 text-emerald-400">DETECT<br/>25%</div>
            <div className="p-1.5 bg-zinc-950 rounded border border-zinc-800 text-cyan-400">CLASSIFY<br/>25%</div>
            <div className="p-1.5 bg-zinc-950 rounded border border-zinc-800 text-amber-400">ENGAGE<br/>30%</div>
            <div className="p-1.5 bg-zinc-950 rounded border border-zinc-800 text-purple-400">RESOURCE<br/>10%</div>
            <div className="p-1.5 bg-zinc-950 rounded border border-zinc-800 text-red-400">HEALTH<br/>10%</div>
          </div>
          <div className="p-2.5 bg-red-950/50 border border-red-800 rounded text-[11px] text-red-200">
            <strong className="text-red-400 block mb-0.5">CRITICAL ROE DIRECTIVE:</strong>
            Fratricide (shooting friendly UAV) carries a devastating <strong>-25 PT PENALTY</strong> and triggers investigation in the debrief! Always verify IFF squawk.
          </div>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-900 border-2 border-emerald-700/80 rounded-xl max-w-xl w-full p-6 text-emerald-400 font-mono shadow-2xl space-y-4">
        {/* Top Header */}
        <div className="flex justify-between items-start border-b border-emerald-900 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-950 rounded-lg border border-emerald-800">
              {currentStep.icon}
            </div>
            <div>
              <div className="flex items-center space-x-2 text-[10px] text-zinc-400 tracking-wider">
                <span>ORIENTATION STEP {step + 1} OF {steps.length}</span>
                <span>•</span>
                <span className="text-cyan-400 uppercase font-bold">{scenarioName}</span>
              </div>
              <h2 className="text-base font-extrabold text-emerald-300 tracking-wide mt-0.5">
                {currentStep.title}
              </h2>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="text-zinc-500 hover:text-white p-1 rounded-lg transition"
            title="Skip Tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real UI Spotlight Callout Bar */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-cyan-950/40 border border-cyan-800/60 rounded-lg text-xs text-cyan-300">
          <Target className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-bold text-[11px]">FOCUS TARGET:</span>
          <span className="text-[11px] text-zinc-200 font-sans tracking-wide">{currentStep.spotlightTarget}</span>
        </div>

        {/* Content Body */}
        <div className="min-h-[140px]">{currentStep.content}</div>

        {/* Mode Specific Tip */}
        <div className="flex items-start space-x-2 p-2.5 bg-amber-950/30 border border-amber-700/50 rounded-lg text-[11px] text-amber-200 leading-relaxed font-sans">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{getModeTip(scenarioName)}</span>
        </div>

        {/* Footer & Controls */}
        <div className="border-t border-zinc-800 pt-3 flex flex-col sm:flex-row justify-between items-center gap-3">
          <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="accent-emerald-500 rounded cursor-pointer"
            />
            <span className="text-[11px]">Don't show again on mission launch</span>
          </label>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleFinish}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-bold rounded-lg transition"
            >
              SKIP
            </button>

            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg flex items-center space-x-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>BACK</span>
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-md shadow-emerald-950 transition"
              >
                <span>NEXT ({step + 1}/{steps.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-lg flex items-center space-x-1.5 shadow-lg shadow-emerald-950 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>START MISSION</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
