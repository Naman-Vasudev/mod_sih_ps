import React, { useState } from 'react';
import type { ScenarioConfig } from '../types';
import { Shield, AlertTriangle, CheckCircle2, BookOpen, Compass } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-900 border-2 border-emerald-600/80 rounded-xl max-w-xl w-full p-6 text-emerald-400 font-mono shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-emerald-900 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-950 rounded-lg border border-emerald-700">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-[10px] text-zinc-400 uppercase tracking-widest">
                <span>TACTICAL BRIEFING</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">DIFF {scenario.difficulty}/10</span>
                <span>•</span>
                <span className="text-zinc-500">SEED: {scenario.seed}</span>
              </div>
              <h2 className="text-lg font-black text-emerald-300 tracking-wide mt-0.5">
                {scenario.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onOpenTutorial}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-cyan-800/60 rounded text-xs font-bold transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>HOW TO PLAY</span>
          </button>
        </div>

        {/* Narrative & Environment */}
        <div className="space-y-2 text-xs leading-relaxed">
          <p className="text-zinc-200 font-sans">
            {scenario.description}
          </p>

          <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
            <div className="p-2 bg-zinc-950 rounded border border-zinc-800 text-zinc-300">
              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">TIME & LIGHT</span>
              <span className="font-bold uppercase text-emerald-400">{scenario.environment.time}</span>
            </div>
            <div className="p-2 bg-zinc-950 rounded border border-zinc-800 text-zinc-300">
              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">ATMOSPHERE</span>
              <span className="font-bold uppercase text-cyan-400">{scenario.environment.weather}</span>
            </div>
            <div className="p-2 bg-zinc-950 rounded border border-zinc-800 text-zinc-300">
              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">TERRAIN SECTOR</span>
              <span className="font-bold uppercase text-amber-400">{scenario.environment.terrain}</span>
            </div>
          </div>
        </div>

        {/* Rules of Engagement Card */}
        <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2.5 text-xs">
          <div className="flex items-center space-x-2 text-amber-300 font-bold border-b border-zinc-800 pb-1.5">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>RULES OF ENGAGEMENT (ROE) & DIRECTIVES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px] font-sans">
            <div>
              <span className="font-bold text-emerald-300 block mb-0.5">PRIMARY DIRECTIVE</span>
              <p className="text-zinc-300">
                Protect central base asset at (0,0). Neutralize or divert threats prior to the 500m defense perimeter ring.
              </p>
            </div>
            <div>
              <span className="font-bold text-cyan-300 block mb-0.5">TARGET DISCRIMINATION</span>
              <p className="text-zinc-300">
                Classify tracks using EO/IR slew and RF frequencies before kinetic engagement. Do not engage friendly UAVs or bird decoys.
              </p>
            </div>
          </div>

          <div className="p-2 bg-red-950/40 border border-red-900/60 rounded text-[11px] text-red-300 font-sans flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              <strong>STRICT PENALTIES:</strong> -25 points per fratricide incident (friendly fire)! -10 points for firing at decoys.
            </span>
          </div>
        </div>

        {/* Practice Mode Option */}
        <div className="flex items-center justify-between p-3 bg-zinc-950 border border-cyan-900/60 rounded-lg text-xs">
          <div>
            <span className="font-bold text-cyan-300 flex items-center space-x-1.5">
              <span>PRACTICE / TRAINING MODE</span>
              <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded text-[10px]">COACHING ACTIVE</span>
            </span>
            <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
              Provides live tactical tactical hint banners and instant "why that was right/wrong" feedback after actions.
            </p>
          </div>
          <input
            type="checkbox"
            checked={practiceMode}
            onChange={(e) => setPracticeMode(e.target.checked)}
            className="w-4 h-4 accent-cyan-500 rounded cursor-pointer ml-3"
          />
        </div>

        {/* Launch Button */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={() => onStartMission(practiceMode)}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-black text-xs uppercase tracking-wider rounded-lg flex items-center justify-center space-x-2 shadow-xl shadow-emerald-950 transition-all hover:scale-[1.01]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>START MISSION (3-2-1 COUNTDOWN)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
