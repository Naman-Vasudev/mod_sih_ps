import { useState } from 'react';
import { storageService, type CurrentUser } from './storage/storageService';
import type { ScenarioConfig, SessionResult } from './types';
import { generateProceduralScenario } from './scenarios/generator';
import { computeAdaptiveDifficulty } from './adaptive/difficulty';
import { getScenarioBias } from './ai/skillModel';
import { Header } from './components/Header';
import { HotkeysModal } from './components/HotkeysModal';
import { TutorialModal } from './components/TutorialModal';
import { HomePage } from './pages/HomePage';
import { ScenarioSelectPage } from './pages/ScenarioSelectPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { DebriefPage } from './pages/DebriefPage';
import { AARDashboardPage } from './pages/AARDashboardPage';
import { LeaderboardPage } from './pages/LeaderboardPage';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<
    'home' | 'scenarios' | 'simulator' | 'debrief' | 'aar' | 'leaderboard'
  >('home');

  const [currentUser, setCurrentUser] = useState<CurrentUser>(() =>
    storageService.getCurrentUser()
  );

  const [selectedScenario, setSelectedScenario] = useState<ScenarioConfig | null>(null);
  const [latestSessionResult, setLatestSessionResult] = useState<SessionResult | null>(null);

  const [isHotkeysOpen, setIsHotkeysOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSaveProfile = (user: CurrentUser) => {
    setCurrentUser(user);
    storageService.setCurrentUser(user);
  };

  const handleConfirmReset = () => {
    storageService.resetDemoData();
    setIsResetModalOpen(false);
    window.location.reload();
  };

  const handleStartAdaptive = () => {
    const userSessions = storageService.getSessions().filter((s) => s.traineeName === currentUser.name);
    const profiles = storageService.getProfiles();
    const currentDiff = profiles.find((p) => p.name === currentUser.name)?.currentDifficulty ?? 3;
    const adaptiveRec = computeAdaptiveDifficulty(userSessions, currentDiff);

    // --- BKT Skill Model bias ---
    const skillState = storageService.getSkillModel(currentUser.name);
    const bias = getScenarioBias(skillState);

    const sc = generateProceduralScenario({
      seed: Math.floor(Math.random() * 899999) + 100000,
      difficulty: Math.max(1, Math.min(10, adaptiveRec.nextDifficulty + bias.difficultyAdjust)),
    });

    // Merge BKT scenario hints into the generated scenario
    const scenarioWithBias: ScenarioConfig = {
      ...sc,
      hints: [
        ...(sc.hints ?? []),
        ...bias.hints,
        skillState.focusRationale,
      ],
    };

    setSelectedScenario(scenarioWithBias);
    setCurrentScreen('simulator');
  };

  const handleSelectScenario = (scenario: ScenarioConfig) => {
    setSelectedScenario(scenario);
    setCurrentScreen('simulator');
  };

  const handleFinishSession = (result: SessionResult) => {
    storageService.saveSession(result);
    setLatestSessionResult(result);
    setCurrentScreen('debrief');
  };

  const handleNextAdaptiveMission = () => {
    handleStartAdaptive();
  };

  return (
    <div className="app-shell min-h-screen text-slate-100 flex flex-col">
      <Header
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        currentUser={currentUser}
        onOpenHotkeys={() => setIsHotkeysOpen(true)}
        onResetData={() => setIsResetModalOpen(true)}
        hasActiveSession={currentScreen === 'simulator' && !!selectedScenario}
      />

      <main className="flex-1 overflow-x-hidden">
        {currentScreen === 'home' && (
          <HomePage
            currentUser={currentUser}
            onSaveProfile={handleSaveProfile}
            onStartAdaptive={handleStartAdaptive}
            onGoToScenarios={() => setCurrentScreen('scenarios')}
            onGoToAAR={() => setCurrentScreen('aar')}
            onGoToLeaderboard={() => setCurrentScreen('leaderboard')}
          />
        )}

        {currentScreen === 'scenarios' && (
          <ScenarioSelectPage
            currentUser={currentUser}
            onSelectScenario={handleSelectScenario}
          />
        )}

        {currentScreen === 'simulator' && selectedScenario && (
          <SimulatorPage
            scenario={selectedScenario}
            currentUser={currentUser}
            onFinishSession={handleFinishSession}
            onOpenTutorial={() => setIsTutorialOpen(true)}
          />
        )}

        {currentScreen === 'debrief' && latestSessionResult && (
          <DebriefPage
            sessionResult={latestSessionResult}
            onNextMission={handleNextAdaptiveMission}
            onGoToReplay={() => setCurrentScreen('aar')}
            onGoHome={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'aar' && (
          <AARDashboardPage currentUser={currentUser} />
        )}

        {currentScreen === 'leaderboard' && (
          <LeaderboardPage />
        )}
      </main>

      {/* Global Modals */}
      <HotkeysModal isOpen={isHotkeysOpen} onClose={() => setIsHotkeysOpen(false)} />
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-700/80 rounded-xl max-w-md w-full p-6 text-zinc-100 font-mono shadow-2xl space-y-4">
            <div className="text-red-400 font-bold text-sm tracking-wider flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span>CONFIRM SYSTEM FACTORY RESET</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              Reset all session histories, operator metrics, and trainee profile records to initial factory baseline? This will reload the application with clean demo data.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg transition"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition shadow-lg shadow-red-950"
              >
                CONFIRM FACTORY RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
