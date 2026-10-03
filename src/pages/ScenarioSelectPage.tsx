import React, { useState } from 'react';
import type { ScenarioConfig, TimeOfDay, WeatherCondition, TerrainType } from '../types';
import { SCRIPTED_SCENARIOS } from '../scenarios/scripted';
import { generateProceduralScenario } from '../scenarios/generator';
import { computeAdaptiveDifficulty } from '../adaptive/difficulty';
import { storageService, type CurrentUser } from '../storage/storageService';
import { soundFx } from '../utils/audio';
import { Target, Zap, Play, Sparkles, Sun, Moon, Cloud, CloudRain, Map } from 'lucide-react';

interface ScenarioSelectPageProps {
  currentUser: CurrentUser;
  onSelectScenario: (scenario: ScenarioConfig) => void;
}

export const ScenarioSelectPage: React.FC<ScenarioSelectPageProps> = ({
  currentUser,
  onSelectScenario,
}) => {
  const [tab, setTab] = useState<'scripted' | 'procedural' | 'adaptive'>('scripted');

  // Procedural Generator State
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 899999) + 100000);
  const [difficulty, setDifficulty] = useState<number>(5);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [weather, setWeather] = useState<WeatherCondition>('clear');
  const [terrain, setTerrain] = useState<TerrainType>('rural');

  // Adaptive Recommendation
  const userSessions = storageService.getSessions().filter((s) => s.traineeName === currentUser.name);
  const profiles = storageService.getProfiles();
  const currentDiff = profiles.find((p) => p.name === currentUser.name)?.currentDifficulty ?? 3;
  const adaptiveRec = computeAdaptiveDifficulty(userSessions, currentDiff);

  const handleRandomizeSeed = () => {
    soundFx.playClick();
    setSeed(Math.floor(Math.random() * 899999) + 100000);
  };

  const handleLaunchProcedural = () => {
    soundFx.playClick();
    const sc = generateProceduralScenario({
      seed,
      difficulty,
      timeOfDay,
      weather,
      terrain,
    });
    onSelectScenario(sc);
  };

  const handleLaunchAdaptive = () => {
    soundFx.playClick();
    const newSeed = Math.floor(Math.random() * 899999) + 100000;
    const sc = generateProceduralScenario({
      seed: newSeed,
      difficulty: adaptiveRec.nextDifficulty,
    });
    onSelectScenario(sc);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-slate-950 text-slate-100 font-sans p-6 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center space-x-2.5">
              <Target className="w-6 h-6 text-emerald-400" />
              <span>TACTICAL MISSION SELECTION</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Select an operational training mission, generate a custom seed scenario, or run dynamic Adaptive Mode.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex space-x-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => {
                soundFx.playClick();
                setTab('scripted');
              }}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                tab === 'scripted'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              SCRIPTED (5 PRESETS)
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setTab('procedural');
              }}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                tab === 'procedural'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              PROCEDURAL GENERATOR
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setTab('adaptive');
              }}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                tab === 'adaptive'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              ADAPTIVE MODE (REC)
            </button>
          </div>
        </div>

        {/* Tab 1: Scripted Scenarios */}
        {tab === 'scripted' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SCRIPTED_SCENARIOS.map((scenario) => (
              <div
                key={scenario.id}
                className="bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-lg transition duration-150"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 bg-emerald-950 border border-emerald-500/40 text-emerald-300 rounded-md">
                      DIFFICULTY: {scenario.difficulty}/10
                    </span>
                    <span className="text-xs font-mono text-slate-400">SEED: {scenario.seed}</span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-tight">{scenario.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                    {scenario.description}
                  </p>

                  {/* Environment Tags */}
                  <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                    <span className="px-2 py-0.5 bg-slate-950 text-slate-300 rounded border border-slate-800 uppercase flex items-center gap-1">
                      {scenario.environment.time === 'day' ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-cyan-400" />}
                      {scenario.environment.time}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-950 text-slate-300 rounded border border-slate-800 uppercase flex items-center gap-1">
                      {scenario.environment.weather === 'rain' ? <CloudRain className="w-3 h-3 text-blue-400" /> : scenario.environment.weather === 'fog' ? <Cloud className="w-3 h-3 text-slate-400" /> : <Sun className="w-3 h-3 text-amber-400" />}
                      {scenario.environment.weather}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-950 text-slate-300 rounded border border-slate-800 uppercase flex items-center gap-1">
                      <Map className="w-3 h-3 text-emerald-400" />
                      {scenario.environment.terrain}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    onSelectScenario(scenario);
                  }}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition shadow-md cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>LAUNCH MISSION</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Procedural Seed Generator */}
        {tab === 'procedural' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-cyan-400 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>PROCEDURAL SCENARIO GENERATOR (MULBERRY32 PRNG)</span>
              </h2>

              <div className="text-xs font-mono text-cyan-300 font-bold bg-cyan-950 px-3 py-1.5 rounded-lg border border-cyan-700/60">
                REPRODUCIBLE SEED: {seed}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Seed & Difficulty */}
              <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 mb-1.5 font-mono font-bold">SEED NUMBER:</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(parseInt(e.target.value) || 100000)}
                      className="flex-1 bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-white font-mono font-bold focus:outline-none focus:border-cyan-500 text-sm"
                    />
                    <button
                      onClick={handleRandomizeSeed}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg font-bold font-mono transition-colors"
                    >
                      RANDOMIZE
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1.5 font-mono font-bold">
                    <span>DIFFICULTY LEVEL:</span>
                    <span className="text-cyan-400 text-sm font-bold">{difficulty} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={difficulty}
                    onChange={(e) => setDifficulty(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Environment Controls */}
              <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 mb-1.5 font-mono font-bold">TIME OF DAY:</label>
                  <div className="flex space-x-2">
                    {(['day', 'night'] as TimeOfDay[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTimeOfDay(t)}
                        className={`flex-1 py-2 rounded-lg font-bold uppercase transition text-xs font-mono ${
                          timeOfDay === t
                            ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1.5 font-mono font-bold">WEATHER CONDITIONS:</label>
                  <div className="flex space-x-2">
                    {(['clear', 'fog', 'rain'] as WeatherCondition[]).map((w) => (
                      <button
                        key={w}
                        onClick={() => setWeather(w)}
                        className={`flex-1 py-2 rounded-lg font-bold uppercase transition text-xs font-mono ${
                          weather === w
                            ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1.5 font-mono font-bold">TERRAIN SECTOR:</label>
                  <div className="flex space-x-2">
                    {(['rural', 'urban', 'mountain'] as TerrainType[]).map((tr) => (
                      <button
                        key={tr}
                        onClick={() => setTerrain(tr)}
                        className={`flex-1 py-2 rounded-lg font-bold uppercase transition text-xs font-mono ${
                          terrain === tr
                            ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {tr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleLaunchProcedural}
              className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-sm rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-cyan-950 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>GENERATE &amp; LAUNCH PROCEDURAL MISSION</span>
            </button>
          </div>
        )}

        {/* Tab 3: Adaptive Training Mode */}
        {tab === 'adaptive' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-amber-400 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>DYNAMIC ADAPTIVE DIFFICULTY ENGINE</span>
              </h2>
              <span className="text-xs font-mono text-amber-300 font-bold bg-amber-950 px-3 py-1.5 rounded-lg border border-amber-700/60">
                RECOMMENDED DIFFICULTY: LEVEL {adaptiveRec.nextDifficulty}/10
              </span>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 text-sm">
              <div className="text-slate-200 font-medium leading-relaxed">
                {adaptiveRec.explanation}
              </div>

              {adaptiveRec.targetWeakness !== 'none' && (
                <div className="p-3 bg-amber-950/40 rounded-lg border border-amber-800/60 text-amber-300 font-mono text-xs">
                  <span className="font-bold">TARGETED SKILL FOCUS: </span>
                  <span className="uppercase font-bold">{adaptiveRec.targetWeakness}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleLaunchAdaptive}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-amber-950 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>LAUNCH ADAPTIVE MISSION (LEVEL {adaptiveRec.nextDifficulty})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
