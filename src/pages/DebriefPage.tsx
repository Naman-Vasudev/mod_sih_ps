import React, { useState } from 'react';
import type { SessionResult } from '../types';
import { generateLLMFeedback } from '../ai/instructor';
import { storageService } from '../storage/storageService';
import { computeAdaptiveDifficulty } from '../adaptive/difficulty';
import { soundFx } from '../utils/audio';
import { Award, CheckCircle2, XCircle, Play, BarChart3, Key, Sparkles, Home, Target, HelpCircle, ShieldAlert } from 'lucide-react';

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
  const currentDiff = profiles.find((p) => p.name === sessionResult.traineeName)?.currentDifficulty ?? sessionResult.difficulty;
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
        return 'text-emerald-400 border-emerald-500 bg-emerald-950/60 shadow-emerald-900/50';
      case 'A':
        return 'text-cyan-400 border-cyan-500 bg-cyan-950/60 shadow-cyan-900/50';
      case 'B':
        return 'text-amber-400 border-amber-500 bg-amber-950/60 shadow-amber-900/50';
      case 'C':
        return 'text-yellow-400 border-yellow-500 bg-yellow-950/60';
      default:
        return 'text-red-400 border-red-500 bg-red-950/60 shadow-red-900/50';
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-zinc-950 text-emerald-400 font-mono p-6 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-wider text-emerald-300 flex items-center space-x-2">
              <Award className="w-6 h-6 text-emerald-400" />
              <span>POST-MISSION AFTER-ACTION DEBRIEF</span>
            </h1>
            <p className="text-xs text-zinc-400">
              Session: {sessionResult.scenarioName} • Trainee: {sessionResult.traineeName} ({sessionResult.unitName})
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                soundFx.playClick();
                onGoHome();
              }}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-bold rounded flex items-center space-x-1.5"
            >
              <Home className="w-4 h-4" />
              <span>HOME</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onGoToReplay();
              }}
              className="px-4 py-2 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-700 text-xs font-bold rounded flex items-center space-x-1.5"
            >
              <BarChart3 className="w-4 h-4" />
              <span>REPLAY MISSION IN AAR</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onNextMission();
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold rounded flex items-center space-x-1.5 shadow-lg shadow-emerald-950"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>NEXT MISSION &rarr;</span>
            </button>
          </div>
        </div>

        {/* Grade Banner & Subscores */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Grade Badge */}
          <div className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 text-center shadow-2xl ${getGradeColor(sessionResult.grade)}`}>
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">FINAL MISSION GRADE</span>
            <div className="text-6xl font-black tracking-tighter">{sessionResult.grade}</div>
            <div className="text-xl font-bold">{sessionResult.finalScore} / 100 PTS</div>
            <span className="text-[10px] text-zinc-400">ASSET HEALTH: {sessionResult.assetHealthRemaining}%</span>
            <button
              onClick={() => setShowScoringHelp(!showScoringHelp)}
              className="mt-2 text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 underline"
            >
              <HelpCircle className="w-3 h-3" />
              <span>{showScoringHelp ? 'Hide Scoring Rubric' : 'How Scoring Works'}</span>
            </button>
          </div>

          {/* Subscores Grid */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex flex-col justify-between">
              <span className="text-[10px] text-zinc-400 font-bold">DETECTION SPEED (25%)</span>
              <div className="text-2xl font-bold text-emerald-400">{sessionResult.subScores.detection}%</div>
              <span className="text-[10px] text-zinc-500">Radar & RF Ack</span>
            </div>

            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex flex-col justify-between">
              <span className="text-[10px] text-zinc-400 font-bold">CLASSIFICATION (25%)</span>
              <div className="text-2xl font-bold text-cyan-400">{sessionResult.subScores.classification}%</div>
              <span className="text-[10px] text-zinc-500">Visual EO Match</span>
            </div>

            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex flex-col justify-between">
              <span className="text-[10px] text-zinc-400 font-bold">ENGAGEMENT DECISION (30%)</span>
              <div className="text-2xl font-bold text-amber-400">{sessionResult.subScores.engagement}%</div>
              <span className="text-[10px] text-zinc-500">Tactical Tree Pass</span>
            </div>

            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex flex-col justify-between">
              <span className="text-[10px] text-zinc-400 font-bold">RESOURCE EFFICIENCY (10%)</span>
              <div className="text-2xl font-bold text-purple-400">{sessionResult.subScores.efficiency}%</div>
              <span className="text-[10px] text-zinc-500">Ammo & Jammer Use</span>
            </div>
          </div>
        </div>

        {/* How Scoring Works Panel */}
        {showScoringHelp && (
          <div className="bg-zinc-900/90 border border-cyan-800/80 rounded-lg p-5 space-y-3 text-xs text-zinc-300 shadow-xl">
            <div className="flex items-center space-x-2 text-cyan-300 font-bold border-b border-zinc-800 pb-2">
              <HelpCircle className="w-4 h-4" />
              <span>TACTICAL SCORING RUBRIC & PENALTY SYSTEM</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-[11px] leading-relaxed">
              <div className="p-3 bg-zinc-950 rounded border border-zinc-800 space-y-1">
                <span className="text-emerald-400 font-bold block">1. DETECTION SPEED (25%)</span>
                <p>&lt;5.0s = 100 pts | 5-10s = 75 pts | 10-20s = 40 pts | &gt;20s or Missed = 0 pts. Evaluates radar acknowledgment timeliness.</p>
              </div>
              <div className="p-3 bg-zinc-950 rounded border border-zinc-800 space-y-1">
                <span className="text-cyan-400 font-bold block">2. CLASSIFICATION ACCURACY (25%)</span>
                <p>Exact Category & Subtype = 100 pts | Right Category, wrong subtype = 60 pts | Wrong Category = 0 pts.</p>
              </div>
              <div className="p-3 bg-zinc-950 rounded border border-zinc-800 space-y-1">
                <span className="text-amber-400 font-bold block">3. ENGAGEMENT TREE (30%)</span>
                <p>Interception before 500m perimeter; weapon selection suitability (RF Jammer for RF drones, Kinetic for autonomous).</p>
              </div>
              <div className="p-3 bg-zinc-950 rounded border border-zinc-800 space-y-1">
                <span className="text-purple-400 font-bold block">4. RESOURCE EFFICIENCY (10%)</span>
                <p>Penalizes hard-kill interceptor waste on birds/decoys (-30 pts/shot) and excessive fire past 4 rounds.</p>
              </div>
              <div className="p-3 bg-zinc-950 rounded border border-zinc-800 space-y-1">
                <span className="text-red-400 font-bold block">5. ASSET INTEGRITY (10%)</span>
                <p>Remaining health percentage of defended central base asset (0-100%). Alarm reduces impact damage by 50%.</p>
              </div>
              <div className="p-3 bg-zinc-950 rounded border border-red-900/60 space-y-1">
                <span className="text-red-400 font-bold block flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>CRITICAL PENALTIES</span>
                </span>
                <p className="text-red-300 font-bold">-25 PTS PER FRATRICIDE (friendly fire)! -10 pts per civilian/decoy collateral engagement.</p>
              </div>
            </div>
          </div>
        )}

        {/* Adaptive Difficulty Next Mission Recommendation Card */}
        <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-600/50 rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                ADAPTIVE DIFFICULTY ENGINE RECOMMENDATION
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                NEXT: LEVEL {adaptiveRec.nextDifficulty}/10
              </span>
              {adaptiveRec.targetWeakness !== 'none' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  TARGETING: {adaptiveRec.targetWeakness.toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              {adaptiveRec.explanation}
            </p>
          </div>

          <button
            onClick={onNextMission}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs rounded-lg flex items-center space-x-2 shrink-0 shadow-lg shadow-amber-950 transition-all hover:scale-[1.02]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>LAUNCH ADAPTIVE MISSION &rarr;</span>
          </button>
        </div>

        {/* AI Instructor Debrief Feedback */}
        <div className="bg-zinc-900 border border-emerald-900/80 rounded-lg p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
            <h2 className="text-base font-bold text-emerald-300 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>AI INSTRUCTOR TACTICAL COACHING & ANALYSIS</span>
            </h2>

            <div className="flex items-center space-x-2 text-xs">
              <Key className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="password"
                placeholder="Optional LLM API Key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 px-2 py-1 rounded text-xs text-zinc-300 w-44"
              />
              <button
                onClick={handleSaveApiKeyAndGenerate}
                disabled={isGeneratingLLM}
                className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 rounded font-bold text-[11px]"
              >
                {isGeneratingLLM ? 'GENERATING...' : 'TEST LLM'}
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {feedback.map((note, i) => (
              <div key={i} className="p-3 bg-zinc-950 rounded border border-zinc-800 text-zinc-200 leading-relaxed">
                {note}
              </div>
            ))}
          </div>
        </div>

        {/* Entity Decision Tree Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-cyan-300">PER-ENTITY DECISION-TREE BREAKDOWN</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[11px] uppercase">
                  <th className="py-2 px-3">TRACK ID</th>
                  <th className="py-2 px-3">GROUND TRUTH</th>
                  <th className="py-2 px-3">CLASSIFIED AS</th>
                  <th className="py-2 px-3">DETECTION TIME</th>
                  <th className="py-2 px-3">VERDICT</th>
                  <th className="py-2 px-3 text-right">DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {sessionResult.entityEvaluations.map((evalItem) => {
                  const isExpanded = expandedTrack === evalItem.trackId;

                  return (
                    <React.Fragment key={evalItem.trackId}>
                      <tr className="hover:bg-zinc-800/40 transition">
                        <td className="py-3 px-3 font-bold text-emerald-300">{evalItem.trackId}</td>
                        <td className="py-3 px-3 uppercase text-zinc-300">{evalItem.trueType}</td>
                        <td className="py-3 px-3 uppercase text-cyan-300">{evalItem.userClassification}</td>
                        <td className="py-3 px-3 text-zinc-400">
                          {evalItem.detectionTime !== null ? `${evalItem.detectionTime.toFixed(1)}s` : 'MISSED'}
                        </td>
                        <td className="py-3 px-3 font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                            evalItem.verdict === 'PASS'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : evalItem.verdict === 'PARTIAL'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-red-950 text-red-300 border border-red-800'
                          }`}>
                            {evalItem.verdict}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setExpandedTrack(isExpanded ? null : evalItem.trackId)}
                            className="text-xs text-cyan-400 hover:underline"
                          >
                            {isExpanded ? 'Hide Tree' : 'View Decision Tree'}
                          </button>
                        </td>
                      </tr>

                      {/* Decision Tree Expanded Inspector */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-zinc-950 p-4 border-l-4 border-cyan-500">
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold text-cyan-300">
                                DECISION TREE EVALUATION FOR {evalItem.trackId}:
                              </span>
                              <div className="space-y-1.5 text-xs">
                                {evalItem.decisionNodes.map((node) => (
                                  <div
                                    key={node.id}
                                    className={`p-2 rounded border flex items-start space-x-2 ${
                                      node.passed
                                        ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                                        : 'bg-red-950/40 border-red-800/60 text-red-300'
                                    }`}
                                  >
                                    {node.passed ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                      <span className="font-bold block">{node.title}</span>
                                      <span className="text-[11px] opacity-90">{node.reason}</span>
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
