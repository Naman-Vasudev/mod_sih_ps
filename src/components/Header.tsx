import React, { useEffect, useState } from 'react';
import type { CurrentUser } from '../storage/storageService';
import { soundFx } from '../utils/audio';
import {
  Shield,
  Target,
  BarChart3,
  Trophy,
  HelpCircle,
  RotateCcw,
  User,
  Radio,
  Activity,
  Palette,
  Volume2,
  VolumeX,
  Eye,
} from 'lucide-react';

interface HeaderProps {
  currentScreen: 'home' | 'scenarios' | 'simulator' | 'debrief' | 'aar' | 'leaderboard';
  onNavigate: (screen: 'home' | 'scenarios' | 'simulator' | 'debrief' | 'aar' | 'leaderboard') => void;
  currentUser: CurrentUser;
  onOpenHotkeys: () => void;
  onResetData: () => void;
  hasActiveSession?: boolean;
}

const NavBtn: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  activeClass?: string;
  pulse?: boolean;
}> = ({ active, onClick, icon, label, activeClass = 'bg-emerald-600 text-white font-bold border-emerald-400', pulse = false }) => (
  <button
    onClick={onClick}
    className={`btn-tactical flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-150 border ${
      active
        ? `${activeClass} shadow-md ${pulse ? 'animate-pulse' : ''}`
        : 'text-slate-300 hover:text-white hover:bg-slate-800/90 border-transparent hover:border-slate-700'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  currentUser,
  onOpenHotkeys,
  onResetData,
  hasActiveSession = false,
}) => {
  const [timeStr, setTimeStr] = useState(() => formatLocalTime());
  const [currentTheme, setCurrentTheme] = useState<'tactical' | 'night-ops' | 'desert-ops'>(() => {
    try {
      const saved = localStorage.getItem('cuas_theme');
      if (saved === 'night-ops' || saved === 'desert-ops' || saved === 'tactical') return saved;
    } catch {}
    return 'tactical';
  });

  const [isMuted, setIsMuted] = useState(() => soundFx.getMuted());
  const [isColorblind, setIsColorblind] = useState(() => {
    try {
      return localStorage.getItem('cuas_colorblind') === 'true';
    } catch {}
    return false;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    try {
      localStorage.setItem('cuas_theme', currentTheme);
    } catch {}
  }, [currentTheme]);

  const handleToggleTheme = () => {
    const nextTheme = currentTheme === 'tactical' ? 'night-ops' : currentTheme === 'night-ops' ? 'desert-ops' : 'tactical';
    setCurrentTheme(nextTheme);
    soundFx.playClick();
  };

  const handleToggleMute = () => {
    const newMuted = soundFx.toggleMute();
    setIsMuted(newMuted);
    if (!newMuted) soundFx.playClick();
  };

  const handleToggleColorblind = () => {
    const next = !isColorblind;
    setIsColorblind(next);
    try {
      localStorage.setItem('cuas_colorblind', String(next));
    } catch {}
    soundFx.playClick();
  };

  useEffect(() => {
    const clock = window.setInterval(() => setTimeStr(formatLocalTime()), 30_000);
    return () => window.clearInterval(clock);
  }, []);

  return (
    <header
      className="bg-slate-950/95 border-b border-slate-800 px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-3 font-sans select-none"
      style={{ minHeight: '60px' }}
    >
      {/* Brand */}
      <div
        onClick={() => onNavigate('home')}
        className="flex items-center space-x-3 cursor-pointer group py-1 min-w-0"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center relative bg-emerald-950 border border-emerald-500/40"
        >
          <Shield className="text-emerald-400" style={{ width: 18, height: 18 }} />
          <span
            className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400"
            style={{ animation: 'blink 2s infinite' }}
          />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-wide text-white group-hover:text-emerald-300 transition-colors truncate">
            GHOST PROTOCOL C-UAS
          </div>
          <div className="text-[10px] font-mono text-slate-400 tracking-wider">SIH-26247 • THREAT SIMULATION TRAINER</div>
        </div>
      </div>

      {/* Live Status Ticker */}
      <div className="hidden lg:flex items-center space-x-4 text-[11px] font-mono text-slate-400 tracking-wide">
        <div className="flex items-center space-x-1.5">
          <span className="status-dot online" />
          <span className="text-slate-300">ENGINE: ONLINE</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>ZULU: {timeStr}</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center space-x-1.5">
          <span className="status-dot standby" />
          <span>OFFLINE READY</span>
        </div>
      </div>

      {/* Nav Tabs */}
      <nav className="order-3 md:order-none w-full md:w-auto flex items-center space-x-1 p-1 rounded-lg text-xs bg-slate-900 border border-slate-800 overflow-x-auto">
        <NavBtn
          active={currentScreen === 'home'}
          onClick={() => onNavigate('home')}
          icon={<User style={{ width: 14, height: 14 }} />}
          label="PROFILE"
        />
        <NavBtn
          active={currentScreen === 'scenarios'}
          onClick={() => onNavigate('scenarios')}
          icon={<Target style={{ width: 14, height: 14 }} />}
          label="MISSIONS"
        />
        {hasActiveSession && (
          <NavBtn
            active={currentScreen === 'simulator'}
            onClick={() => onNavigate('simulator')}
            icon={<Radio style={{ width: 14, height: 14 }} />}
            label="LIVE SIM"
            activeClass="bg-red-600 text-white font-bold border-red-500"
            pulse={true}
          />
        )}
        <NavBtn
          active={currentScreen === 'aar'}
          onClick={() => onNavigate('aar')}
          icon={<BarChart3 style={{ width: 14, height: 14 }} />}
          label="AAR"
        />
        <NavBtn
          active={currentScreen === 'leaderboard'}
          onClick={() => onNavigate('leaderboard')}
          icon={<Trophy style={{ width: 14, height: 14 }} />}
          label="RANKINGS"
        />
      </nav>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 text-xs py-1">
        <div className="hidden md:flex">
          <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-cyan-300" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-white text-xs">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400">{currentUser.unit}</div>
            </div>
          </div>
        </div>

        {/* Theme Switcher Button */}
        <button
          onClick={handleToggleTheme}
          title={`Active Theme: ${currentTheme.toUpperCase()} (Click to toggle)`}
          className="btn-tactical flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
        >
          <Palette style={{ width: 14, height: 14 }} className="text-amber-400" />
          <span className="hidden xl:inline text-[11px] font-mono uppercase text-slate-200">
            {currentTheme === 'tactical' ? 'TACTICAL' : currentTheme === 'night-ops' ? 'NIGHT OPS' : 'DESERT OPS'}
          </span>
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={handleToggleMute}
          title={isMuted ? 'Tactical Audio: MUTED (Click to unmute)' : 'Tactical Audio: ACTIVE (Click to mute)'}
          className={`btn-tactical p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors ${isMuted ? 'text-slate-500' : 'text-emerald-400'}`}
        >
          {isMuted ? <VolumeX style={{ width: 15, height: 15 }} /> : <Volume2 style={{ width: 15, height: 15 }} />}
        </button>

        {/* Colorblind Mode Toggle */}
        <button
          onClick={handleToggleColorblind}
          title={isColorblind ? 'Colorblind Mode: ACTIVE (Shapes + Colors)' : 'Colorblind Mode: OFF (Click to toggle)'}
          className={`btn-tactical p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border transition-colors ${isColorblind ? 'text-cyan-300 border-cyan-500' : 'text-slate-400 border-slate-700 hover:text-white'}`}
        >
          <Eye style={{ width: 15, height: 15 }} />
        </button>

        <button
          onClick={onOpenHotkeys}
          title="Keyboard Shortcuts [?]"
          className="btn-tactical p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
        >
          <HelpCircle style={{ width: 15, height: 15 }} />
        </button>

        <button
          onClick={onResetData}
          title="Reset Demo Data"
          className="btn-tactical p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
        >
          <RotateCcw style={{ width: 15, height: 15 }} />
        </button>
      </div>
    </header>
  );
};

function formatLocalTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
}
;
