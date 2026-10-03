import React, { useState } from 'react';
import type { ScenarioConfig } from '../types';
import { Shield, AlertTriangle, CheckCircle2, BookOpen, Compass, Sun, Moon, Cloud, CloudRain, Map } from 'lucide-react';

interface MissionBriefingModalProps {
  scenario: ScenarioConfig;
  isOpen: boolean;
  onStartMission: (practiceMode: boolean) => void;
  onOpenTutorial: () => void;
}

export const MissionBriefingModal: React.FC<MissionBriefingModalProps> = ({
  scenario,
  isOpen,
  onStartMission,
  onOpenTutorial,
}) => {
  const [practiceMode, setPracticeMode] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 text-slate-100 font-sans shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3.5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-950/80 rounded-xl border border-emerald-500/40 text-emerald-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                <span>TACTICAL BRIEFING</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">DIFF {scenario.difficulty}/10</span>
                <span>•</span>
                <span className="text-slate-400">SEED: {scenario.seed}</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                {scenario.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onOpenTutorial}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-mono font-bold transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>HOW TO PLAY</span>
          </button>
        </div>

        {/* Narrative & Environment */}
        <div className="space-y-3 text-xs leading-relaxed">
          <p className="text-slate-200 text-sm">
            {scenario.description}
          </p>

          <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">LIGHTING</span>
              <span className="font-bold uppercase text-amber-400 flex items-center gap-1 mt-0.5">
                {scenario.environment.time === 'day' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {scenario.environment.time}
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">ATMOSPHERE</span>
              <span className="font-bold uppercase text-cyan-400 flex items-center gap-1 mt-0.5">
                {scenario.environment.weather === 'rain' ? <CloudRain className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
                {scenario.environment.weather}
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">TERRAIN</span>
              <span className="font-bold uppercase text-emerald-400 flex items-center gap-1 mt-0.5">
                <Map className="w-3.5 h-3.5" />
                {scenario.environment.terrain}
              </span>
            </div>
          </div>
        </div>

        {/* Rules of Engagement Card */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
          <div className="flex items-center space-x-2 text-amber-400 font-bold border-b border-slate-800 pb-2 font-mono">
            <Compass className="w-4 h-4" />
            <span>RULES OF ENGAGEMENT (ROE) DIRECTIVES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-bold text-emerald-300 block mb-0.5 font-mono">PRIMARY OBJECTIVE</span>
              <p className="text-slate-300">
                Protect defended central base asset at (0,0). Intercept threats before the 500m perimeter line.
              </p>
            </div>
            <div>
              <span className="font-bold text-cyan-300 block mb-0.5 font-mono">TARGET IDENTIFICATION</span>
              <p className="text-slate-300">
                Verify identity via optical slew and RF bands before firing. Do NOT shoot friendly UAVs or bird decoys.
              </p>
            </div>
          </div>

          <div className="p-2.5 bg-red-950/60 border border-red-700/80 rounded-lg text-xs text-red-200 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              <strong>STRICT PENALTY:</strong> -25 points deduction for fratricide (friendly fire incidents)!
            </span>
          </div>
        </div>

        {/* Practice Mode Option */}
        <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
          <div>
            <span className="font-bold text-cyan-300 flex items-center space-x-2 font-mono">
              <span>PRACTICE / COACHING MODE</span>
              <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700 rounded text-[10px] font-bold">
                COACHING HINTS
              </span>
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Enables live coaching hint banners with instant guidance during tactical decisions.
            </p>
          </div>
          <input
            type="checkbox"
            checked={practiceMode}
            onChange={(e) => setPracticeMode(e.target.checked)}
            className="w-4 h-4 accent-cyan-500 rounded cursor-pointer ml-4"
          />
        </div>

        {/* Launch Button */}
        <div className="pt-2">
          <button
            onClick={() => onStartMission(practiceMode)}
            className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>START MISSION (3-2-1 COUNTDOWN)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
