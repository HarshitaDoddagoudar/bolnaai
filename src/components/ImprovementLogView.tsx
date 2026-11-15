import React, { useState } from 'react';
import { 
  TrendingUp, 
  Layers, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  FileCode,
  X
} from 'lucide-react';
import { PromptVersion, ImprovementItem } from '../types';

interface ImprovementLogViewProps {
  promptVersions: PromptVersion[];
  improvements: ImprovementItem[];
  activePromptVersion: 'V1' | 'V2' | 'V3';
  onChangePromptVersion: (ver: 'V1' | 'V2' | 'V3') => void;
  onAddImprovement: (item: ImprovementItem) => void;
}

export const ImprovementLogView: React.FC<ImprovementLogViewProps> = ({
  promptVersions,
  improvements,
  activePromptVersion,
  onChangePromptVersion,
  onAddImprovement
}) => {
  const [filterVersion, setFilterVersion] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New item form
  const [newVersion, setNewVersion] = useState<'V1' | 'V2' | 'V3'>('V2');
  const [problemIdentified, setProblemIdentified] = useState('');
  const [previousBehaviour, setPreviousBehaviour] = useState('');
  const [proposedChange, setProposedChange] = useState('');
  const [testResult, setTestResult] = useState('');
  const [improvementStatus, setImprovementStatus] = useState<ImprovementItem['improvementStatus']>('In Testing');

  const filteredImprovements = improvements.filter(imp => {
    return filterVersion === 'all' || imp.promptVersion === filterVersion;
  });

  const handleCreateImprovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemIdentified || !proposedChange) return;

    const newItem: ImprovementItem = {
      id: `imp-${Date.now()}`,
      promptVersion: newVersion,
      problemIdentified: problemIdentified.trim(),
      previousBehaviour: previousBehaviour.trim() || 'Unspecified prior behavior',
      proposedChange: proposedChange.trim(),
      testResult: testResult.trim() || 'Awaiting formal evaluation audit run.',
      improvementStatus,
      lastUpdated: new Date().toISOString().slice(0, 10)
    };

    onAddImprovement(newItem);
    setIsModalOpen(false);
    setProblemIdentified('');
    setPreviousBehaviour('');
    setProposedChange('');
    setTestResult('');
  };

  const getStatusBadge = (status: ImprovementItem['improvementStatus']) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified with Data
          </span>
        );
      case 'In Testing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
            <Clock className="w-3 h-3 text-sky-600" /> In Testing
          </span>
        );
      case 'Identified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Identified (Pending Fix)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            Needs Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Prompt Versioning & Improvement Log</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical evidence tracking between V1 baseline, V2 safety-engineered directives, and V3 adaptive research
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Improvement</span>
        </button>
      </div>

      {/* 3 Prompt Versions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {promptVersions.map((pv) => {
          const isActive = activePromptVersion === pv.id;
          return (
            <div
              key={pv.id}
              className={`rounded-xl p-5 border flex flex-col justify-between transition-all ${
                isActive
                  ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                  : 'bg-white border-slate-200/80 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-md bg-slate-900 text-white">
                    {pv.id}
                  </span>
                  {isActive && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Currently Active
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1">{pv.name}</h3>
                <p className="text-xs font-medium text-emerald-700 mb-2">{pv.tagline}</p>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{pv.description}</p>

                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 mb-4 border border-slate-200">
                  <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">
                    Core Specifications:
                  </span>
                  {pv.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-slate-600 text-[11px]">
                      <span className="text-emerald-600 font-bold shrink-0">•</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {!isActive ? (
                  <button
                    onClick={() => onChangePromptVersion(pv.id)}
                    className="w-full py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Switch to {pv.id}
                  </button>
                ) : (
                  <div className="text-center py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg">
                    ✓ Active in Simulator
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Improvement Items Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Evidence-Based Iteration Log
            </h3>
            <span className="text-xs text-slate-400">({filteredImprovements.length} documented)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filter:</span>
            {(['all', 'V1', 'V2', 'V3'] as const).map(ver => (
              <button
                key={ver}
                onClick={() => setFilterVersion(ver)}
                className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                  filterVersion === ver ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {ver.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredImprovements.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No improvement items found for this filter.
            </div>
          ) : (
            filteredImprovements.map((imp) => (
              <div key={imp.id} className="p-5 hover:bg-slate-50/60 transition-colors space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {imp.promptVersion}
                    </span>
                    <span className="text-xs text-slate-400">Updated: {imp.lastUpdated}</span>
                  </div>
                  {getStatusBadge(imp.improvementStatus)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Problem & Previous */}
                  <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-100 space-y-1.5">
                    <span className="font-bold text-rose-800 text-[11px] uppercase tracking-wider block">
                      Problem Identified:
                    </span>
                    <p className="text-slate-800 font-medium leading-relaxed">{imp.problemIdentified}</p>
                    <div className="pt-1 text-slate-500 text-[11px]">
                      <span className="font-semibold text-slate-600">Previous Behaviour:</span> {imp.previousBehaviour}
                    </div>
                  </div>

                  {/* Proposed Change & Result */}
                  <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-1.5">
                    <span className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider block">
                      Proposed Engineered Change:
                    </span>
                    <p className="text-slate-800 font-medium leading-relaxed">{imp.proposedChange}</p>
                    <div className="pt-1 text-emerald-800 text-[11px]">
                      <span className="font-semibold">Test Evidence:</span> {imp.testResult}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Improvement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Log Prompt Improvement Hypothesis</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateImprovement} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Version</label>
                  <select
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="V1">V1 (Baseline Fix)</option>
                    <option value="V2">V2 (Safety-Engineered)</option>
                    <option value="V3">V3 (Adaptive Evidence)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={improvementStatus}
                    onChange={(e) => setImprovementStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Identified">Identified</option>
                    <option value="In Testing">In Testing</option>
                    <option value="Verified">Verified with Data</option>
                    <option value="Needs Review">Needs Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Problem Identified *</label>
                <textarea
                  value={problemIdentified}
                  onChange={(e) => setProblemIdentified(e.target.value)}
                  rows={2}
                  placeholder="e.g. Agent gave advice that delayed evacuation during fire..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Previous Behaviour</label>
                <input
                  type="text"
                  value={previousBehaviour}
                  onChange={(e) => setPreviousBehaviour(e.target.value)}
                  placeholder="e.g. Agent said 'check if the fire is small enough to put out'"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Proposed Change *</label>
                <textarea
                  value={proposedChange}
                  onChange={(e) => setProposedChange(e.target.value)}
                  rows={2}
                  placeholder="e.g. Strict negative constraint forbidding any civilian firefighting advice..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Test Result Evidence</label>
                <textarea
                  value={testResult}
                  onChange={(e) => setTestResult(e.target.value)}
                  rows={2}
                  placeholder="e.g. Verified across 5 test calls: 100% adherence to immediate exit directive."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
