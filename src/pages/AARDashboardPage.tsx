import React, { useState, useEffect } from 'react';
import type { SessionResult } from '../types';
import { storageService, type CurrentUser } from '../storage/storageService';
import { RadarCanvas } from '../components/RadarCanvas';
import { createInitialSensorState } from '../sim/sensors';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Radar, Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import { BarChart3, Download, Play, Pause, FileText, CheckCircle2, XCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AARDashboardPageProps {
  currentUser: CurrentUser;
}

export const AARDashboardPage: React.FC<AARDashboardPageProps> = ({ currentUser }) => {
  const [sessions] = useState<SessionResult[]>(() => storageService.getSessions());
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(() => {
    const data = storageService.getSessions();
    return data.length > 0 ? data[0].id : null;
  });

  // Replay Player State
  const [replayTime, setReplayTime] = useState<number>(0);
  const [isPlayingReplay, setIsPlayingReplay] = useState<boolean>(false);
  const [replaySpeed, setReplaySpeed] = useState<number>(1);
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  // Replay animation loop
  useEffect(() => {
    if (!isPlayingReplay || !selectedSession) return;
    const interval = setInterval(() => {
      setReplayTime((prev) => {
        const next = prev + 0.25 * replaySpeed;
        if (next >= selectedSession.duration) {
          setIsPlayingReplay(false);
          return selectedSession.duration;
        }
        return next;
      });
    }, 250 / replaySpeed);

    return () => clearInterval(interval);
  }, [isPlayingReplay, selectedSession, replaySpeed]);

  if (!selectedSession) {
    return (
      <div className="p-8 bg-zinc-950 text-emerald-400 font-mono text-center">
        No training sessions recorded yet. Run a simulator mission first!
      </div>
    );
  }

  // 1. Line Chart Data (Performance trend)
  const userSessions = sessions.filter((s) => s.traineeName === currentUser.name).reverse();
  const lineChartData = {
    labels: userSessions.map((_, i) => `Sess #${i + 1}`),
    datasets: [
      {
        label: 'Mission Score (%)',
        data: userSessions.map((s) => s.finalScore),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  // 2. Radar Chart Data (Skill dimensions)
  const radarChartData = {
    labels: ['Detection Speed', 'Classification', 'Engagement Tree', 'Efficiency'],
    datasets: [
      {
        label: `${selectedSession.traineeName} Metrics`,
        data: [
          selectedSession.subScores.detection,
          selectedSession.subScores.classification,
          selectedSession.subScores.engagement,
          selectedSession.subScores.efficiency,
        ],
        backgroundColor: 'rgba(6, 182, 212, 0.25)',
        borderColor: '#06b6d4',
        borderWidth: 2,
      },
    ],
  };

  // 3. Bar Chart Data (Mistake categories aggregation)
  const mistakeCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    s.mistakeCategories.forEach((cat) => {
      mistakeCounts[cat] = (mistakeCounts[cat] || 0) + 1;
    });
  });

  const barChartData = {
    labels: Object.keys(mistakeCounts).slice(0, 5),
    datasets: [
      {
        label: 'Mistake Occurrences across Unit',
        data: Object.values(mistakeCounts).slice(0, 5),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: '#ef4444',
        borderWidth: 1,
      },
    ],
  };

  // Replay current frame calculation: find nearest frame for smooth scrubbing
  const frames = selectedSession.replayFrames || [];
  let currentFrame = null;
  if (frames.length > 0) {
    currentFrame = frames.reduce((prev, curr) =>
      Math.abs(curr.timestamp - replayTime) < Math.abs(prev.timestamp - replayTime) ? curr : prev
    );
  }
  const replayTracks = new Map();
  const replayEntities: any[] = [];

  if (currentFrame) {
    currentFrame.entities.forEach((e) => {
      replayEntities.push({
        id: e.id,
        trackId: e.trackId,
        x: e.x,
        y: e.y,
        altitude: e.altitude,
        trueType: e.trueType,
        status: e.status,
        active: e.status === 'active',
      });

      const dist = Math.round(Math.hypot(e.x, e.y));
      const bearing = Math.round(((Math.atan2(e.y, e.x) * 180) / Math.PI + 360) % 360);

      replayTracks.set(e.trackId, {
        trackId: e.trackId,
        detectedBy: ['radar'],
        estimatedX: e.x,
        estimatedY: e.y,
        estimatedDistance: dist,
        estimatedBearing: bearing,
        estimatedSpeed: 25,
        estimatedAltitude: e.altitude,
        estimatedRCS: 0.05,
        iffDisplay: e.trueType === 'friendly' ? 'FRIENDLY_SQUAWK' : 'NO_RESPONSE',
        eoVisualConfidence: 0.9,
        acousticConfidence: 0.5,
        firstDetectedTime: 0,
        userAcknowledged: true,
        userAcknowledgedTime: 5,
        userClassification: e.trueType === 'hostile_attack' ? 'hostile_attack' : 'unknown',
        userConfidence: 'high',
      });
    });
  }

  // Export session JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedSession, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `session_aar_${selectedSession.id}.json`);
    dlAnchorElem.click();
  };

  // Export PDF Report using jsPDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('courier', 'bold');
    doc.setFontSize(16);
    doc.text('C-UAS THREAT SIMULATOR - AFTER ACTION REPORT', 14, 20);

    doc.setFontSize(10);
    doc.setFont('courier', 'normal');
    doc.text(`Trainee Name: ${selectedSession.traineeName}`, 14, 30);
    doc.text(`Unit: ${selectedSession.unitName}`, 14, 36);
    doc.text(`Mission Scenario: ${selectedSession.scenarioName} (Seed: ${selectedSession.seed})`, 14, 42);
    doc.text(`Date & Time: ${new Date(selectedSession.timestamp).toLocaleString()}`, 14, 48);

    doc.setFont('courier', 'bold');
    doc.text(`OVERALL GRADE: ${selectedSession.grade} (${selectedSession.finalScore}/100 PTS)`, 14, 60);

    doc.text('SUBSCORES BREAKDOWN:', 14, 72);
    doc.setFont('courier', 'normal');
    doc.text(`- Detection Speed: ${selectedSession.subScores.detection}%`, 14, 80);
    doc.text(`- Classification Accuracy: ${selectedSession.subScores.classification}%`, 14, 86);
    doc.text(`- Engagement Decision Tree: ${selectedSession.subScores.engagement}%`, 14, 92);
    doc.text(`- Resource Efficiency: ${selectedSession.subScores.efficiency}%`, 14, 98);
    doc.text(`- Asset Health Remaining: ${selectedSession.assetHealthRemaining}%`, 14, 104);

    doc.setFont('courier', 'bold');
    doc.text('AI INSTRUCTOR FEEDBACK:', 14, 118);
    doc.setFont('courier', 'normal');
    let y = 126;
    selectedSession.aiDebriefFeedback.forEach((line) => {
      const splitText = doc.splitTextToSize(`• ${line}`, 180);
      doc.text(splitText, 14, y);
      y += splitText.length * 6;
    });

    doc.save(`AAR_Report_${selectedSession.traineeName.replace(/\s+/g, '_')}_${selectedSession.id}.pdf`);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-zinc-950 text-emerald-400 font-mono p-6 select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-wider text-emerald-300 flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
              <span>AFTER-ACTION REVIEW (AAR) ANALYTICS & REPLAY</span>
            </h1>
            <p className="text-xs text-zinc-400">
              Session history, skill radar breakdown, interactive replay player, and PDF/JSON export.
            </p>
          </div>

          <div className="flex space-x-2 mt-4 md:mt-0">
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold rounded flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT JSON</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs font-bold rounded flex items-center space-x-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>EXPORT PDF REPORT</span>
            </button>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Performance Line Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2 shadow-xl">
            <h2 className="text-xs font-bold text-emerald-300">SCORE TREND ACROSS SESSIONS</h2>
            <div className="h-48">
              <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Skill Radar Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2 shadow-xl">
            <h2 className="text-xs font-bold text-cyan-300">SKILL DIMENSIONS RADAR</h2>
            <div className="h-48 flex items-center justify-center">
              <Radar data={radarChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Mistake Bar Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2 shadow-xl">
            <h2 className="text-xs font-bold text-red-400">UNIT MISTAKE CATEGORIES</h2>
            <div className="h-48">
              <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Replay Player & Session Selector Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Session Selector */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
            <h2 className="text-xs font-bold text-zinc-400 border-b border-zinc-800 pb-1">
              PAST SESSIONS ({sessions.length})
            </h2>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {sessions.map((s) => {
                const isSelected = s.id === selectedSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedSessionId(s.id);
                      setReplayTime(0);
                      setIsPlayingReplay(false);
                    }}
                    className={`p-3 rounded border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-emerald-950 border-emerald-500 shadow-md'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-zinc-200">{s.scenarioName}</span>
                      <span className="font-bold text-emerald-400">{s.finalScore}% ({s.grade})</span>
                    </div>

                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span>{s.traineeName}</span>
                      <span>{new Date(s.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Interactive Replay Viewer */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4 flex flex-col">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <div>
                <h2 className="text-sm font-bold text-cyan-300">
                  REPLAY VIEWER: {selectedSession.scenarioName} (SEED: {selectedSession.seed})
                </h2>
                <p className="text-[11px] text-zinc-400">
                  Ground Truth Revealed: Green circles show true entity locations vs trainee actions.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() => setIsPlayingReplay(!isPlayingReplay)}
                  className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 rounded font-bold flex items-center space-x-1"
                >
                  {isPlayingReplay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingReplay ? 'PAUSE' : 'PLAY REPLAY'}</span>
                </button>

                <select
                  value={replaySpeed}
                  onChange={(e) => setReplaySpeed(parseFloat(e.target.value))}
                  className="bg-zinc-950 border border-zinc-700 text-cyan-300 px-2 py-1 rounded font-bold"
                >
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                </select>
              </div>
            </div>

            {/* Replay Timeline Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-400 font-bold">
                <span>REPLAY TIMESTAMP: {replayTime.toFixed(1)}s</span>
                <span>DURATION: {selectedSession.duration}s</span>
              </div>
              <input
                type="range"
                min="0"
                max={selectedSession.duration}
                step="0.5"
                value={replayTime}
                onChange={(e) => setReplayTime(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Canvas Replay Display */}
            <div className="flex justify-center bg-black p-2 rounded border border-zinc-800">
              <RadarCanvas
                tracks={replayTracks}
                entities={replayEntities}
                sensorState={createInitialSensorState()}
                selectedTrackId={null}
                onSelectTrack={() => {}}
                terrain="rural"
                timeOfDay="day"
                weather="clear"
                isReplayMode={true}
                assetHealth={selectedSession.assetHealthRemaining}
                width={520}
                height={520}
              />
            </div>
          </div>
        </div>

        {/* Selected Session Decision Tree Breakdown */}
        {selectedSession.entityEvaluations && selectedSession.entityEvaluations.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <h2 className="text-sm font-bold text-cyan-300">
                DECISION-TREE NODE EVALUATIONS: {selectedSession.scenarioName} ({selectedSession.traineeName})
              </h2>
              <span className="text-xs text-zinc-500">
                PASS/FAIL INSPECTION FOR EVERY SPAWNED THREAT TRACK
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-[11px] uppercase">
                    <th className="py-2 px-3">TRACK ID</th>
                    <th className="py-2 px-3">TRUE THREAT TYPE</th>
                    <th className="py-2 px-3">OPERATOR CLASSIFICATION</th>
                    <th className="py-2 px-3">DETECTION TIME</th>
                    <th className="py-2 px-3">EVALUATION</th>
                    <th className="py-2 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {selectedSession.entityEvaluations.map((evalItem) => {
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
                              {isExpanded ? 'Hide Nodes' : 'Inspect Tree'}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="bg-zinc-950 p-4 border-l-4 border-cyan-500">
                              <div className="space-y-2">
                                <span className="text-[11px] font-bold text-cyan-300">
                                  TACTICAL DECISION NODES FOR {evalItem.trackId}:
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
        )}
      </div>
    </div>
  );
};
