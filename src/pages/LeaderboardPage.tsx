import React, { useState } from 'react';
import { storageService } from '../storage/storageService';
import { Trophy, Shield, Users, Flame } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<string>('All Units');

  const profiles = storageService.getProfiles();
  const filteredProfiles = profiles
    .filter((p) => selectedUnit === 'All Units' || p.unit === selectedUnit)
    .sort((a, b) => b.avgScore - a.avgScore);

  // Aggregate unit stats
  const totalSessions = filteredProfiles.reduce((acc, p) => acc + p.sessionsCount, 0);
  const overallAvg = Math.round(
    filteredProfiles.reduce((acc, p) => acc + p.avgScore, 0) / (filteredProfiles.length || 1)
  );

  const topPerformer = filteredProfiles[0]?.name || 'N/A';

  return (
    <div className="min-h-[calc(100vh-60px)] bg-slate-950 text-slate-100 font-sans p-6 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center space-x-2.5">
              <Trophy className="w-6 h-6 text-purple-400" />
              <span>UNIT LEADERBOARD &amp; READINESS INDEX</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Comparative ranking and skill profile assessment across operators, platoons, and squads.
            </p>
          </div>

          <div>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 px-3.5 py-2 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-purple-500"
            >
              <option value="All Units">ALL UNITS (EVERY REGIMENT)</option>
              <option value="48 Air Defence Regiment">48 AIR DEFENCE REGIMENT</option>
              <option value="127 AD Missile Regiment">127 AD MISSILE REGIMENT</option>
              <option value="15 Forward AD Battery">15 FORWARD AD BATTERY</option>
              <option value="Western Fleet AD Wing">WESTERN FLEET AD WING</option>
            </select>
          </div>
        </div>

        {/* Aggregated Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center space-x-4 shadow-lg">
            <div className="p-3 bg-purple-950/80 rounded-xl border border-purple-700/80 text-purple-300">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-mono text-slate-400 font-bold block uppercase tracking-wider">
                UNIT READINESS INDEX
              </span>
              <span className="text-3xl font-extrabold text-white font-mono">{overallAvg}%</span>
              <span className="text-xs text-slate-400 block mt-0.5">Average operational score</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center space-x-4 shadow-lg">
            <div className="p-3 bg-amber-950/80 rounded-xl border border-amber-700/80 text-amber-300">
              <Flame className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-mono text-slate-400 font-bold block uppercase tracking-wider">
                TOP PERFORMING OPERATOR
              </span>
              <span className="text-xl font-bold text-amber-300 block truncate">{topPerformer}</span>
              <span className="text-xs text-slate-400 block mt-0.5">Highest rolling score average</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center space-x-4 shadow-lg">
            <div className="p-3 bg-cyan-950/80 rounded-xl border border-cyan-700/80 text-cyan-300">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-mono text-slate-400 font-bold block uppercase tracking-wider">
                TOTAL DRILLS COMPLETED
              </span>
              <span className="text-3xl font-extrabold text-white font-mono">{totalSessions}</span>
              <span className="text-xs text-slate-400 block mt-0.5">Across active unit roster</span>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            OPERATOR RANKINGS &amp; SKILL PROFILES
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                  <th className="py-3 px-4">RANK</th>
                  <th className="py-3 px-4">OPERATOR NAME</th>
                  <th className="py-3 px-4">UNIT / SQUAD</th>
                  <th className="py-3 px-4">DRILLS</th>
                  <th className="py-3 px-4">AVG SCORE</th>
                  <th className="py-3 px-4">TOP SCORE</th>
                  <th className="py-3 px-4">WEAKEST SKILL AREA</th>
                  <th className="py-3 px-4 text-right">QUALIFICATION BADGE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProfiles.map((p, idx) => {
                  const rank = idx + 1;
                  const skills = [
                    { name: 'Detection', val: p.skillProfile.detection },
                    { name: 'Classification', val: p.skillProfile.classification },
                    { name: 'Engagement', val: p.skillProfile.engagement },
                    { name: 'Efficiency', val: p.skillProfile.efficiency },
                  ].sort((a, b) => a.val - b.val);

                  const weakest = skills[0];

                  return (
                    <tr key={p.name} className="hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4 font-bold">
                        {rank === 1 ? (
                          <span className="text-amber-400 text-sm flex items-center space-x-1 font-bold">
                            <Trophy className="w-4 h-4" />
                            <span>#1</span>
                          </span>
                        ) : rank === 2 ? (
                          <span className="text-slate-200 font-bold">#2</span>
                        ) : rank === 3 ? (
                          <span className="text-amber-600 font-bold">#3</span>
                        ) : (
                          <span className="text-slate-400">#{rank}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white font-sans text-xs">{p.name}</td>
                      <td className="py-3.5 px-4 text-slate-300">{p.unit}</td>
                      <td className="py-3.5 px-4 text-cyan-400 font-bold">{p.sessionsCount}</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-extrabold">{p.avgScore}%</td>
                      <td className="py-3.5 px-4 text-purple-400 font-bold">{p.topScore}%</td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="px-2.5 py-1 bg-slate-950 rounded-md border border-slate-800 text-[11px] font-bold uppercase">
                          {weakest.name} ({weakest.val}%)
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase font-mono border ${
                            p.avgScore >= 90
                              ? 'bg-amber-950 text-amber-300 border-amber-500'
                              : p.avgScore >= 80
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {p.avgScore >= 90
                            ? 'MASTER C-UAS OPERATOR'
                            : p.avgScore >= 80
                            ? 'EXPERT INTERCEPTOR'
                            : 'QUALIFIED OPERATOR'}
                        </span>
                      </td>
                    </tr>
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
