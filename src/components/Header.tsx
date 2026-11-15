import React from 'react';
import { PhoneCall, Sparkles, SlidersHorizontal, Download } from 'lucide-react';
import { TabKey } from './Sidebar';

interface HeaderProps {
  currentTab: TabKey;
  promptVersion: 'V1' | 'V2' | 'V3';
  onChangePromptVersion: (ver: 'V1' | 'V2' | 'V3') => void;
  onStartSimulation: () => void;
  onExportAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  promptVersion,
  onChangePromptVersion,
  onStartSimulation,
  onExportAll
}) => {
  const getTabTitle = (tab: TabKey) => {
    switch (tab) {
      case 'dashboard': return 'Operational Dashboard';
      case 'scenarios': return 'Emergency Scenarios Library';
      case 'simulator': return 'Voice & Text Simulator';
      case 'history': return 'Test Call Records & Transcripts';
      case 'evaluation': return 'Safety Behavior Evaluation';
      case 'improvements': return 'Prompt Version & Improvement Log';
      case 'settings': return 'System Settings & Integration';
      default: return 'Smart Crisis';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              SMART CRISIS
            </h1>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">|</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {getTabTitle(currentTab)}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Emergency Training and Safety Evaluation Platform
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Active Prompt Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="px-2 py-1 font-semibold text-slate-500 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Prompt:
            </span>
            {(['V1', 'V2', 'V3'] as const).map((ver) => (
              <button
                key={ver}
                onClick={() => onChangePromptVersion(ver)}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  promptVersion === ver
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={
                  ver === 'V1'
                    ? 'V1: Baseline prototype (known flaws)'
                    : ver === 'V2'
                    ? 'V2: Safety-engineered concise directives'
                    : 'V3: Reserved for empirical evidence'
                }
              >
                {ver}
                {ver === 'V2' && <span className="ml-1 text-[10px] text-emerald-200">★</span>}
              </button>
            ))}
          </div>

          {/* Quick Action: Start Simulation */}
          <button
            onClick={onStartSimulation}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Simulator</span>
          </button>

          {/* Export button */}
          <button
            onClick={onExportAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-all"
            title="Export all test records to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Emergency 112 hotline reminder */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold">
            <PhoneCall className="w-3 h-3 text-rose-600" />
            <span>Real Emergency: 112</span>
          </div>
        </div>
      </div>
    </header>
  );
};
