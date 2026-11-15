import React, { useState } from 'react';
import { 
  Settings, 
  ShieldAlert, 
  PhoneCall, 
  Lock, 
  Download, 
  Trash2, 
  Radio, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sliders,
  HardDrive
} from 'lucide-react';
import { BolnaConfig, TestRecord } from '../types';
import { exportTestsAsCSV } from '../utils/exportUtils';

interface SettingsViewProps {
  bolnaConfig: BolnaConfig;
  onOpenBolnaConfig: () => void;
  tests: TestRecord[];
  onResetAllData: () => void;
  promptVersion: 'V1' | 'V2' | 'V3';
  onChangePromptVersion: (ver: 'V1' | 'V2' | 'V3') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  bolnaConfig,
  onOpenBolnaConfig,
  tests,
  onResetAllData,
  promptVersion,
  onChangePromptVersion
}) => {
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">Platform Settings & Safety Guardrails</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Fictional disclosure notices, emergency routing, integration placeholders, and local storage management
        </p>
      </div>

      {/* Mandatory Safety Disclosure Block */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-wide text-amber-950 uppercase">
              FICTIONAL TRAINING SIMULATION – NOT AN EMERGENCY SERVICE.
            </h3>
            <p className="text-xs text-amber-900 font-medium leading-relaxed mt-1">
              Smart Crisis is an offline, non-operational AI voice training prototype designed solely to test 
              conversational safety guardrails and evaluation checklists. It does not contact, alert, or dispatch fire, 
              medical, police, or rescue services.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white/90 rounded-lg border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-800 font-bold">
            <PhoneCall className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>If this is a real emergency, stop the simulation immediately and call 112.</span>
          </div>
          <span className="px-3 py-1 bg-rose-600 text-white font-extrabold rounded-md uppercase tracking-wider text-[11px]">
            Dial 112 (India / EU Standard)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-amber-950">
          <div className="p-3 bg-white/70 rounded-lg border border-amber-200/60">
            <span className="font-bold block mb-1">Zero-Collection Privacy Protocol:</span>
            <p className="text-[11px] text-amber-900 leading-snug">
              Do not collect real names, phone numbers, exact residential addresses, or medical records. All role-play data must remain strictly fictional.
            </p>
          </div>
          <div className="p-3 bg-white/70 rounded-lg border border-amber-200/60">
            <span className="font-bold block mb-1">Harm Prevention Rules:</span>
            <p className="text-[11px] text-amber-900 leading-snug">
              Under zero circumstances does the agent instruct callers to fight fires, use elevators during alarms, re-enter smoke, or conduct civilian searches.
            </p>
          </div>
        </div>
      </div>

      {/* Bolna Voice Agent Integration Module */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Bolna Voice AI Integration Module</h3>
              <p className="text-xs text-slate-500">Documented placeholders for external Bolna voice agent bridge</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Prototype Local Mode
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Bolna Agent ID:</span>
              <span className="font-mono font-semibold text-slate-800">{bolnaConfig.agentId || 'UNSET'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">API Base Endpoint:</span>
              <span className="font-mono font-semibold text-slate-800">{bolnaConfig.apiBaseUrl}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Voice Connection:</span>
              <span className="font-semibold text-amber-700">Simulated Rule Engine (Safe Prototype)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-400">
            No real API calls or outbound calls are initiated without explicit configuration.
          </p>
          <button
            onClick={onOpenBolnaConfig}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Configure Bolna Parameters
          </button>
        </div>
      </div>

      {/* Data Management & Export */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Data Persistence & Export</h3>
            <p className="text-xs text-slate-500">Local browser storage (HTML5 localStorage) and CSV export</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 border border-slate-200 rounded-lg space-y-2">
            <span className="font-bold text-xs text-slate-800 block">Export All Test Call Records</span>
            <p className="text-[11px] text-slate-500">
              Download all {tests.length} recorded simulation sessions with timestamps and observed failures in CSV format.
            </p>
            <button
              onClick={() => exportTestsAsCSV(tests)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>

          <div className="p-4 border border-rose-200 bg-rose-50/30 rounded-lg space-y-2">
            <span className="font-bold text-xs text-rose-900 block">Reset Prototype Data</span>
            <p className="text-[11px] text-rose-800/80">
              Clear local storage and restore default factory scenarios, evaluations, and baseline prompt settings.
            </p>
            {!resetConfirmOpen ? (
              <button
                onClick={() => setResetConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Local Data</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onResetAllData();
                    setResetConfirmOpen(false);
                  }}
                  className="px-3 py-1.5 bg-rose-700 text-white text-xs font-bold rounded-lg"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => setResetConfirmOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
