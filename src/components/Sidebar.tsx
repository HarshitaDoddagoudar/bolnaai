import React from 'react';
import { 
  LayoutDashboard, 
  Flame, 
  Mic, 
  History, 
  ShieldCheck, 
  TrendingUp, 
  Settings, 
  Radio, 
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export type TabKey = 'dashboard' | 'scenarios' | 'simulator' | 'history' | 'evaluation' | 'improvements' | 'settings';

interface SidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  pendingTestCount: number;
  promptVersion: 'V1' | 'V2' | 'V3';
  isBolnaConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingTestCount,
  promptVersion,
  isBolnaConnected
}) => {
  const navItems: { key: TabKey; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { key: 'scenarios', label: 'Scenarios', icon: <Flame className="w-5 h-5" /> },
    { key: 'simulator', label: 'Voice Simulator', icon: <Mic className="w-5 h-5" />, badge: 'LIVE', badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
    { key: 'history', label: 'Test History', icon: <History className="w-5 h-5" />, badge: pendingTestCount > 0 ? `${pendingTestCount} pend` : undefined, badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
    { key: 'evaluation', label: 'Safety Evaluation', icon: <ShieldCheck className="w-5 h-5" /> },
    { key: 'improvements', label: 'Improvement Log', icon: <TrendingUp className="w-5 h-5" />, badge: promptVersion, badgeColor: 'bg-sky-500/20 text-sky-300 border border-sky-500/30' },
    { key: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-base text-white">SMART CRISIS</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                PROTOTYPE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-tight">
              Emergency Training Platform
            </p>
          </div>
        </div>
      </div>

      {/* Engine Status Widget */}
      <div className="px-4 py-3 mx-3 my-3 rounded-lg bg-slate-800/70 border border-slate-700/60 text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Engine Mode
          </span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-700 text-slate-200">
            {promptVersion}
          </span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          {isBolnaConnected ? 'Bolna Cloud Audio Bridge' : 'Local Rule Engine (Safe Prototype)'}
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'} transition-colors`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Safety Notice Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400">
        <p className="font-bold text-slate-300 flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Safety Guardrails Active
        </p>
        <p className="leading-snug">
          Real emergency services are never contacted. In life-safety situations, stop simulation & dial <strong className="text-amber-400">112</strong>.
        </p>
      </div>
    </aside>
  );
};
