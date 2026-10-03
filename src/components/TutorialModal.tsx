import React, { useState } from 'react';
import {
  Shield,
  Eye,
  Radio,
  Crosshair,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
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
        <div className="space-y-2 text-xs text-slate-200 leading-relaxed font-sans">
          <p>
            You are stationed at tactical base command defending the central asset at coordinates <strong className="text-emerald-400">(0,0)</strong>.
          </p>
          <p>
            The green rotating sweep line displays active radar scans up to <strong className="text-emerald-400">3,500m</strong>. The inner red circle marks the <strong className="text-red-400">500m Critical Defense Perimeter</strong>; any hostile drone crossing this ring will impact and damage base personnel!
          </p>
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-300">
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
        <div className="space-y-2 text-xs text-slate-200 leading-relaxed font-sans">
          <p>
            Incoming contacts appear as blips on the radar and entries in the <strong className="text-cyan-400">TRACK LIST</strong> on the left sidebar.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-200 text-xs">
            <li><strong>Click any radar blip</strong> or track card (e.g. TRK-101) to lock target reticle.</li>
            <li>Unacknowledged tracks pulse with an <strong className="text-amber-400">AMBER ALERT RING</strong>.</li>
            <li>Press <strong className="text-white">[ESC]</strong> at any time to clear active target selection.</li>
          </ul>
        </div>
      ),
    },
    {
      title: '3. DETECT & CLASSIFY TARGETS',
      icon: <Eye className="w-6 h-6 text-amber-400" />,
      spotlightTarget: 'ACTIONS PANEL: BUTTONS 1 & 2',
      content: (
        <div className="space-y-2 text-xs text-slate-200 leading-relaxed font-sans">
          <p>
            Once locked on a track, execute identification protocol:
          </p>
          <ol className="list-decimal pl-4 space-y-1.5 text-xs text-slate-200">
            <li>
              <strong>Detect Contact [D]</strong>: Confirms radar blip acknowledgment (scores up to 25 pts for speed &lt;5s).
            </li>
            <li>
              <strong>Classify Identity [1-6]</strong>: Inspect optical feed &amp; RF band, then classify:
              <br />
              <span className="text-slate-300 font-mono text-[11px] block mt-1">
                [1] Attack Kamikaze | [2] Recon Drone | [3] Swarm | [4] Friendly | [5] Civilian | [6] Bird Decoy
              </span>
            </li>
          </ol>
        </div>
      ),
    },
    {
      title: '4. FOUR-SENSOR RECON SUITE',
      icon: <Sliders className="w-6 h-6 text-purple-400" />,
      spotlightTarget: 'SENSOR TOGGLE ROW & OPTICAL FEED',
      content: (
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-200 font-sans">
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <strong className="text-emerald-400 font-mono block">1. 3D RADAR:</strong>
            3.5km sweep radius. Measures range, bearing, speed, and RCS.
          </div>
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <strong className="text-cyan-400 font-mono block">2. EO/IR OPTICAL:</strong>
            30° FOV optical camera. Click <em>SLEW CAMERA</em> to inspect geometry.
          </div>
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <strong className="text-amber-400 font-mono block">3. RF DETECTOR:</strong>
            Detects 2.4GHz / 5.8GHz / 433MHz command telemetry links.
          </div>
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <strong className="text-purple-400 font-mono block">4. ACOUSTIC ARRAY:</strong>
            Acoustic acoustic signature recognition unaffected by fog or darkness.
          </div>
        </div>
      ),
    },
    {
      title: '5. COUNTERMEASURES & WEAPONS',
      icon: <Crosshair className="w-6 h-6 text-red-400" />,
      spotlightTarget: 'COUNTERMEASURE ACTION BUTTONS',
      content: (
        <div className="space-y-2 text-xs text-slate-200 leading-relaxed font-sans">
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2 bg-amber-950/60 rounded-lg border border-amber-700/80 text-amber-200">
              <strong className="block text-amber-300">RF JAMMER [J]</strong>
              20s cooldown. Best against RF-controlled quadcopters.
            </div>
            <div className="p-2 bg-purple-950/60 rounded-lg border border-purple-700/80 text-purple-200">
              <strong className="block text-purple-300">SOFT-KILL [S]</strong>
              GPS spoofing &amp; nav denial for non-fiber-optic drones.
            </div>
            <div className="p-2 bg-red-950/60 rounded-lg border border-red-700/80 text-red-200">
              <strong className="block text-red-300">KINETIC [H]</strong>
              8 missiles. Essential against autonomous kamikazes!
            </div>
          </div>
          <p className="text-slate-300 text-[11px] pt-1">
            <strong>Base Alarm [A]</strong>: Warns personnel. Halves kinetic impact damage if drones penetrate perimeter!
          </p>
        </div>
      ),
    },
    {
      title: '6. TACTICAL SCORING RUBRIC',
      icon: <Shield className="w-6 h-6 text-emerald-400" />,
      spotlightTarget: 'POST-MISSION GRADE & DEBRIEF',
      content: (
        <div className="space-y-1.5 text-xs text-slate-200 font-sans">
          <p>Missions evaluate 5 core competencies (0–100 pts, Grade S/A/B/C/D/F):</p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-emerald-400">
              Detection Speed: 25%
            </div>
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-cyan-400">
              Classification: 25%
            </div>
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-amber-400">
              Engagement Tree: 30%
            </div>
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-purple-400">
              Resource Efficiency: 10%
            </div>
          </div>
          <div className="p-2 bg-red-950/60 border border-red-700/80 rounded-lg text-red-200 font-bold text-xs mt-1">
            CRITICAL: Fratricide (engaging friendly UAV) incurs a -25 pt penalty!
          </div>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 text-slate-100 font-sans shadow-2xl space-y-4">
        {/* Top Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              {currentStep.icon}
            </div>
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                <span>ORIENTATION STEP {step + 1} OF {steps.length}</span>
                <span>•</span>
                <span className="text-cyan-400 font-bold uppercase">{scenarioName}</span>
              </div>
              <h2 className="text-base font-extrabold text-white tracking-wide mt-0.5">
                {currentStep.title}
              </h2>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
            title="Skip Tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real UI Spotlight Callout Bar */}
        <div className="flex items-center space-x-2 px-3 py-2 bg-cyan-950/60 border border-cyan-700/60 rounded-xl text-xs text-cyan-200 font-mono">
          <Target className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-bold text-cyan-300">FOCUS TARGET:</span>
          <span className="text-white">{currentStep.spotlightTarget}</span>
        </div>

        {/* Content Body */}
        <div className="min-h-[140px]">{currentStep.content}</div>

        {/* Mode Specific Tip */}
        <div className="flex items-start space-x-2 p-3 bg-amber-950/40 border border-amber-700/60 rounded-xl text-xs text-amber-200 leading-relaxed font-sans">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{getModeTip(scenarioName)}</span>
        </div>

        {/* Footer & Controls */}
        <div className="border-t border-slate-800 pt-3.5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="accent-emerald-500 rounded cursor-pointer"
            />
            <span>Don't show again on mission launch</span>
          </label>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end font-mono">
            <button
              onClick={handleFinish}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition cursor-pointer"
            >
              SKIP
            </button>

            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center space-x-1 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>BACK</span>
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-md transition cursor-pointer"
              >
                <span>NEXT ({step + 1}/{steps.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-4 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold rounded-lg flex items-center space-x-1.5 shadow-lg transition cursor-pointer"
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
