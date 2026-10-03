import React, { useState, useEffect } from 'react';
import type { SessionResult } from '../types';
import { storageService, type CurrentUser } from '../storage/storageService';
import { RadarCanvas } from '../components/RadarCanvas';
import { createInitialSensorState } from '../sim/sensors';
import { soundFx } from '../utils/audio';
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
      <div className="p-8 bg-slate-950 text-slate-200 font-sans text-center">
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
        pointBackgroundColor: '#10b981',
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
        pointBackgroundColor: '#06b6d4',
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
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: '#ef4444',
        borderWidth: 1,
      },
    ],
  };

  // Replay current frame calculation
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
    soundFx.playClick();
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedSession, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `session_aar_${selectedSession.id}.json`);
    dlAnchorElem.click();
  };

  // Export PDF Report using jsPDF
  const handleExportPDF = () => {
    soundFx.playClick();
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
    <div className="min-h-[calc(100vh-60px)] bg-slate-950 text-slate-100 font-sans p-6 select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center space-x-2.5">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
              <span>AFTER-ACTION REVIEW (AAR) ANALYTICS &amp; REPLAY</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Historical performance trends, multi-axis skill radar breakdown, interactive replay viewer, and PDF report export.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 font-mono">
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>EXPORT JSON</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-md transition cursor-pointer"
            >
              <FileText className="w-4 h-4 fill-current" />
              <span>EXPORT PDF REPORT</span>
            </button>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Performance Line Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-lg">
            <h2 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              SCORE TREND ACROSS SESSIONS
            </h2>
            <div className="h-48">
              <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Skill Radar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-lg">
            <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              SKILL DIMENSIONS RADAR
            </h2>
            <div className="h-48 flex items-center justify-center">
              <Radar data={radarChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Mistake Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-lg">
            <h2 className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
              UNIT MISTAKE CATEGORIES
            </h2>
            <div className="h-48">
              <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Replay Player & Session Selector Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Session Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-lg">
            <h2 className="text-xs font-mono font-bold text-slate-300 border-b border-slate-800 pb-2 uppercase tracking-wider">
              RECORDED SESSIONS ({sessions.length})
            </h2>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 font-mono">
              {sessions.map((s) => {
                const isSelected = s.id === selectedSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedSessionId(s.id);
                      setReplayTime(0);
                      setIsPlayingReplay(false);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white font-sans">{s.scenarioName}</span>
                      <span className="font-bold text-emerald-400">{s.finalScore}% ({s.grade})</span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{s.traineeName}</span>
                      <span>{new Date(s.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Interactive Replay Viewer */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col shadow-lg">
            <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-3 gap-3">
              <div>
                <h2 className="text-sm font-bold text-cyan-300 font-mono">
                  REPLAY VIEWER: {selectedSession.scenarioName} (SEED: {selectedSession.seed})
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Ground Truth Revealed: Circles show true entity positions and trajectory vs operator decisions.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsPlayingReplay(!isPlayingReplay);
                  }}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg font-bold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  {isPlayingReplay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingReplay ? 'PAUSE' : 'PLAY REPLAY'}</span>
                </button>

                <select
                  value={replaySpeed}
                  onChange={(e) => setReplaySpeed(parseFloat(e.target.value))}
                  className="bg-slate-950 border border-slate-700 text-cyan-300 px-2 py-1.5 rounded-lg font-bold focus:outline-none"
                >
                  <option value={1}>1x Speed</option>
                  <option value={2}>2x Speed</option>
                  <option value={4}>4x Speed</option>
                </select>
              </div>
            </div>

            {/* Replay Timeline Slider */}
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between text-xs text-slate-300 font-bold">
                <span>REPLAY TIMESTAMP: {replayTime.toFixed(1)}s</span>
                <span>TOTAL DURATION: {selectedSession.duration}s</span>
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

            {/* Radar Canvas Replay Display */}
            <div className="flex justify-center bg-slate-950 p-3 rounded-xl border border-slate-800">
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
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white font-mono">
                DECISION-TREE NODE EVALUATIONS: {selectedSession.scenarioName} ({selectedSession.traineeName})
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                PASS/FAIL INSPECTION FOR EVERY SPAWNED THREAT TRACK
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                    <th className="py-2.5 px-3">TRACK ID</th>
                    <th className="py-2.5 px-3">TRUE THREAT TYPE</th>
                    <th className="py-2.5 px-3">OPERATOR CLASSIFICATION</th>
                    <th className="py-2.5 px-3">DETECTION TIME</th>
                    <th className="py-2.5 px-3">EVALUATION</th>
                    <th className="py-2.5 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedSession.entityEvaluations.map((evalItem) => {
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
                              onClick={() => {
                                soundFx.playClick();
                                setExpandedTrack(isExpanded ? null : evalItem.trackId);
                              }}
                              className="text-xs text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                            >
                              {isExpanded ? 'Hide Nodes' : 'Inspect Tree'}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="bg-slate-950 p-4 border-l-4 border-cyan-500 rounded-b-xl">
                              <div className="space-y-2 font-sans">
                                <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                                  TACTICAL DECISION NODES FOR {evalItem.trackId}:
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
        )}
      </div>
    </div>
  );
};
