import React, { useState } from 'react';
import type { SessionResult } from '../types';
import { generateLLMFeedback } from '../ai/instructor';
import { storageService } from '../storage/storageService';
import { computeAdaptiveDifficulty } from '../adaptive/difficulty';
import { soundFx } from '../utils/audio';
import {
  Award,
  CheckCircle2,
  XCircle,
  Play,
  BarChart3,
  Key,
  Sparkles,
  Home,
  Target,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';

interface DebriefPageProps {
  sessionResult: SessionResult;
  onNextMission: () => void;
  onGoToReplay: () => void;
  onGoHome: () => void;
}

export const DebriefPage: React.FC<DebriefPageProps> = ({
  sessionResult,
  onNextMission,
  onGoToReplay,
  onGoHome,
}) => {
  const [apiKey, setApiKey] = useState(() => storageService.getLLMApiKey());
  const [feedback, setFeedback] = useState<string[]>(sessionResult.aiDebriefFeedback);
  const [isGeneratingLLM, setIsGeneratingLLM] = useState(false);
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);
  const [showScoringHelp, setShowScoringHelp] = useState(false);

  // Compute adaptive recommendation for next mission
  const userSessions = storageService.getSessions().filter((s) => s.traineeName === sessionResult.traineeName);
  const profiles = storageService.getProfiles();
  const currentDiff =
    profiles.find((p) => p.name === sessionResult.traineeName)?.currentDifficulty ?? sessionResult.difficulty;
  const adaptiveRec = computeAdaptiveDifficulty(userSessions, currentDiff);

  const handleSaveApiKeyAndGenerate = async () => {
    storageService.setLLMApiKey(apiKey);
    if (!apiKey) return;
    setIsGeneratingLLM(true);
    const llmFeedback = await generateLLMFeedback(sessionResult, apiKey, 'openai');
    setFeedback(llmFeedback);
    setIsGeneratingLLM(false);
  };

  const getGradeColor = (grade: SessionResult['grade']) => {
    switch (grade) {
      case 'S':
        return 'text-emerald-400 border-emerald-500 bg-emerald-950/60 shadow-lg shadow-emerald-950';
      case 'A':
        return 'text-cyan-400 border-cyan-500 bg-cyan-950/60 shadow-lg shadow-cyan-950';
      case 'B':
        return 'text-amber-400 border-amber-500 bg-amber-950/60 shadow-lg shadow-amber-950';
      case 'C':
        return 'text-yellow-400 border-yellow-500 bg-yellow-950/60';
      default:
        return 'text-red-400 border-red-500 bg-red-950/60 shadow-lg shadow-red-950';
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-slate-950 text-slate-100 font-sans p-6 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Title & Nav Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center space-x-2.5">
              <Award className="w-6 h-6 text-emerald-400" />
              <span>POST-MISSION AFTER-ACTION DEBRIEF</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Mission: <span className="text-white font-bold">{sessionResult.scenarioName}</span> • Trainee:{' '}
              <span className="text-white font-bold">{sessionResult.traineeName}</span> ({sessionResult.unitName})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                soundFx.playClick();
                onGoHome();
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>HOME</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onGoToReplay();
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-600/60 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>REPLAY IN AAR</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onNextMission();
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-lg flex items-center space-x-1.5 shadow-md transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>NEXT MISSION &rarr;</span>
            </button>
          </div>
        </div>

        {/* Grade Banner & Subscores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Main Grade Badge */}
          <div
            className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center space-y-2 text-center ${getGradeColor(
              sessionResult.grade
            )}`}
          >
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              MISSION GRADE
            </span>
            <div className="text-6xl font-black font-mono tracking-tighter">{sessionResult.grade}</div>
            <div className="text-xl font-bold font-mono text-white">{sessionResult.finalScore} / 100 PTS</div>
            <span className="text-xs font-mono text-slate-300">ASSET HEALTH: {sessionResult.assetHealthRemaining}%</span>
            <button
              onClick={() => setShowScoringHelp(!showScoringHelp)}
              className="mt-2 text-xs text-cyan-300 hover:text-white flex items-center space-x-1 underline cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showScoringHelp ? 'Hide Scoring Rubric' : 'How Scoring Works'}</span>
            </button>
          </div>

          {/* Subscores Grid */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between shadow-md">
              <span className="text-xs font-mono text-slate-400 font-bold">DETECTION SPEED (25%)</span>
              <div className="text-3xl font-mono font-bold text-emerald-400 my-1">{sessionResult.subScores.detection}%</div>
              <span className="text-[11px] text-slate-400">Timely radar ack</span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between shadow-md">
              <span className="text-xs font-mono text-slate-400 font-bold">CLASSIFICATION (25%)</span>
              <div className="text-3xl font-mono font-bold text-cyan-400 my-1">{sessionResult.subScores.classification}%</div>
              <span className="text-[11px] text-slate-400">Target type match</span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between shadow-md">
              <span className="text-xs font-mono text-slate-400 font-bold">ENGAGEMENT TREE (30%)</span>
              <div className="text-3xl font-mono font-bold text-amber-400 my-1">{sessionResult.subScores.engagement}%</div>
              <span className="text-[11px] text-slate-400">Correct countermeasure</span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between shadow-md">
              <span className="text-xs font-mono text-slate-400 font-bold">RESOURCE EFFICIENCY (10%)</span>
              <div className="text-3xl font-mono font-bold text-purple-400 my-1">{sessionResult.subScores.efficiency}%</div>
              <span className="text-[11px] text-slate-400">Ammo conservation</span>
            </div>
          </div>
        </div>

        {/* How Scoring Works Modal / Guide Panel */}
        {showScoringHelp && (
          <div className="bg-slate-900 border border-cyan-600/70 rounded-2xl p-5 space-y-4 text-xs text-slate-200 shadow-2xl">
            <div className="flex items-center space-x-2 text-cyan-300 font-bold border-b border-slate-800 pb-2.5">
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm">TACTICAL SCORING RUBRIC &amp; PENALTY BREAKDOWN</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs leading-relaxed">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold block font-mono">1. DETECTION SPEED (25%)</span>
                <p className="text-slate-300">&lt;5.0s = 100 pts | 5-10s = 75 pts | 10-20s = 40 pts | &gt;20s = 0 pts. Evaluates radar blip acknowledgment latency.</p>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-bold block font-mono">2. CLASSIFICATION ACCURACY (25%)</span>
                <p className="text-slate-300">Exact threat match = 100 pts | Right category, wrong subtype = 60 pts | Wrong category = 0 pts.</p>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-amber-400 font-bold block font-mono">3. ENGAGEMENT DECISION (30%)</span>
                <p className="text-slate-300">Interception prior to 500m perimeter; weapon suitability (RF Jammer for RF drones, Kinetic for autonomous).</p>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-purple-400 font-bold block font-mono">4. RESOURCE EFFICIENCY (10%)</span>
                <p className="text-slate-300">Penalizes interceptors wasted on decoys (-30 pts) and firing more than 4 missiles per mission.</p>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-emerald-300 font-bold block font-mono">5. ASSET INTEGRITY (10%)</span>
                <p className="text-slate-300">Remaining base health percentage (0-100%). Activating Base Alarm reduces kinetic impact by 50%.</p>
              </div>
              <div className="p-3.5 bg-red-950/60 rounded-xl border border-red-700/80 space-y-1">
                <span className="text-red-300 font-bold block flex items-center space-x-1 font-mono">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>CRITICAL PENALTIES</span>
                </span>
                <p className="text-red-200 font-medium">-25 PTS PER FRATRICIDE (friendly fire)! -10 pts per civilian or decoy engagement.</p>
              </div>
            </div>
          </div>
        )}

        {/* Adaptive Recommendation Card */}
        <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                ADAPTIVE DIFFICULTY RECOMMENDATION
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-600/60">
                NEXT MISSION: LEVEL {adaptiveRec.nextDifficulty}/10
              </span>
              {adaptiveRec.targetWeakness !== 'none' && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                  TARGET: {adaptiveRec.targetWeakness.toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {adaptiveRec.explanation}
            </p>
          </div>

          <button
            onClick={onNextMission}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl flex items-center space-x-2 shrink-0 shadow-lg shadow-amber-950 transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>LAUNCH RECOMMENDED MISSION &rarr;</span>
          </button>
        </div>

        {/* AI Instructor Debrief Notes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-3 gap-2">
            <h2 className="text-base font-bold text-emerald-400 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>AI INSTRUCTOR TACTICAL COACHING &amp; ANALYSIS</span>
            </h2>

            <div className="flex items-center space-x-2 text-xs font-mono">
              <Key className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="Optional LLM API Key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white w-48 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSaveApiKeyAndGenerate}
                disabled={isGeneratingLLM}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition cursor-pointer"
              >
                {isGeneratingLLM ? 'GENERATING...' : 'TEST LLM'}
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {feedback.map((note, i) => (
              <div key={i} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 leading-relaxed font-sans text-xs">
                {note}
              </div>
            ))}
          </div>
        </div>

        {/* Entity Decision Tree Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white">PER-ENTITY DECISION-TREE BREAKDOWN</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                  <th className="py-2.5 px-3">TRACK ID</th>
                  <th className="py-2.5 px-3">GROUND TRUTH</th>
                  <th className="py-2.5 px-3">CLASSIFIED AS</th>
                  <th className="py-2.5 px-3">DETECTION TIME</th>
                  <th className="py-2.5 px-3">VERDICT</th>
                  <th className="py-2.5 px-3 text-right">DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sessionResult.entityEvaluations.map((evalItem) => {
                  const isExpanded = expandedTrack === evalItem.trackId;

                  return (
                    <React.Fragment key={evalItem.trackId}>
                      <tr className="hover:bg-slate-800/50 transition">
                        <td className="py-3 px-3 font-bold text-emerald-400">{evalItem.trackId}</td>
                        <td className="py-3 px-3 uppercase text-slate-200 font-bold">{evalItem.trueType}</td>
                        <td className="py-3 px-3 uppercase text-cyan-300">{evalItem.userClassification}</td>
                        <td className="py-3 px-3 text-slate-300">
                          {evalItem.detectionTime !== null ? `${evalItem.detectionTime.toFixed(1)}s` : 'MISSED'}
                        </td>
                        <td className="py-3 px-3 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              evalItem.verdict === 'PASS'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                                : evalItem.verdict === 'PARTIAL'
                                ? 'bg-amber-950 text-amber-300 border border-amber-600'
                                : 'bg-red-950 text-red-300 border border-red-600'
                            }`}
                          >
                            {evalItem.verdict}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setExpandedTrack(isExpanded ? null : evalItem.trackId)}
                            className="text-xs text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                          >
                            {isExpanded ? 'Hide Tree' : 'View Decision Tree'}
                          </button>
                        </td>
                      </tr>

                      {/* Decision Tree Expanded Inspector */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-slate-950 p-4 border-l-4 border-cyan-500 rounded-b-xl">
                            <div className="space-y-2 font-sans">
                              <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                                DECISION TREE RULES FOR {evalItem.trackId}:
                              </span>
                              <div className="space-y-2 text-xs">
                                {evalItem.decisionNodes.map((node) => (
                                  <div
                                    key={node.id}
                                    className={`p-3 rounded-xl border flex items-start space-x-2.5 ${
                                      node.passed
                                        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                                        : 'bg-red-950/40 border-red-800 text-red-200'
                                    }`}
                                  >
                                    {node.passed ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                      <span className="font-bold block font-mono text-xs">{node.title}</span>
                                      <span className="text-xs opacity-90">{node.reason}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
