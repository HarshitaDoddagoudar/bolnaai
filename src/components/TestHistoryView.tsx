import React, { useState } from 'react';
import { 
  History, 
  FileText, 
  Download, 
  Plus, 
  Search, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  ChevronRight,
  UserCheck,
  X
} from 'lucide-react';
import { TestRecord, Scenario } from '../types';
import { exportTranscriptAsTXT } from '../utils/exportUtils';

interface TestHistoryViewProps {
  tests: TestRecord[];
  scenarios: Scenario[];
  onAddManualTest: (test: TestRecord) => void;
  onEvaluateTest: (testId: string) => void;
}

export const TestHistoryView: React.FC<TestHistoryViewProps> = ({
  tests,
  scenarios,
  onAddManualTest,
  onEvaluateTest
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVersion, setFilterVersion] = useState<string>('all');
  const [selectedTest, setSelectedTest] = useState<TestRecord | null>(tests[0] || null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual Test Form State
  const [manualScenarioId, setManualScenarioId] = useState(scenarios[0]?.id || '');
  const [manualPromptVer, setManualPromptVer] = useState<'V1' | 'V2' | 'V3'>('V2');
  const [manualDuration, setManualDuration] = useState(45);
  const [manualConsent, setManualConsent] = useState(true);
  const [manualObservedFailures, setManualObservedFailures] = useState('');
  const [manualSuggestions, setManualSuggestions] = useState('');
  const [manualTranscriptText, setManualTranscriptText] = useState(
    'Caller: Hello, there is heavy smoke in the stairwell.\nAgent: Do not enter the smoke. Evacuate via the alternate fire escape and dial 112 outside.'
  );

  const filteredTests = tests.filter(t => {
    const matchesVersion = filterVersion === 'all' || t.promptVersion === filterVersion;
    const matchesSearch = t.testNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.scenarioTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVersion && matchesSearch;
  });

  const handleCreateManualTest = (e: React.FormEvent) => {
    e.preventDefault();
    const sc = scenarios.find(s => s.id === manualScenarioId) || scenarios[0];

    // Parse transcript lines
    const parsedTranscript = manualTranscriptText.split('\n').filter(Boolean).map((line, idx) => {
      const isCaller = line.toLowerCase().startsWith('caller:');
      const text = line.replace(/^(caller|agent|system):\s*/i, '');
      return {
        id: `man-msg-${idx}-${Date.now()}`,
        sender: (isCaller ? 'caller' : 'agent') as 'caller' | 'agent',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
    });

    const newRecord: TestRecord = {
      id: `manual-test-${Date.now()}`,
      testNumber: `TC-${Math.floor(200 + Math.random() * 800)}`,
      scenarioId: sc.id,
      scenarioTitle: sc.title,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      durationSeconds: Number(manualDuration) || 30,
      testerConsent: manualConsent,
      promptVersion: manualPromptVer,
      transcript: parsedTranscript,
      evaluationStatus: 'pending',
      observedFailures: manualObservedFailures ? manualObservedFailures.split(';').map(f => f.trim()) : [],
      improvementSuggestions: manualSuggestions
    };

    onAddManualTest(newRecord);
    setIsManualModalOpen(false);
    setSelectedTest(newRecord);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Test Call Management & Transcripts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit logs for simulated emergency runs, consent tracking, and evaluation status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Test Record Manually</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test number or scenario..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Filter Version:</span>
          {(['all', 'V1', 'V2', 'V3'] as const).map(ver => (
            <button
              key={ver}
              onClick={() => setFilterVersion(ver)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                filterVersion === ver ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {ver.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Split: List on Left, Detailed Transcript Viewer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Records List */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase tracking-wider">
            All Recorded Test Calls ({filteredTests.length})
          </div>
          <div className="max-h-[580px] overflow-y-auto divide-y divide-slate-100">
            {filteredTests.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No test records match your filter.
              </div>
            ) : (
              filteredTests.map((test) => {
                const isSelected = selectedTest?.id === test.id;
                return (
                  <div
                    key={test.id}
                    onClick={() => setSelectedTest(test)}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected ? 'bg-emerald-50/50 border-l-4 border-emerald-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {test.testNumber}
                      </span>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {test.promptVersion}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">
                      {test.scenarioTitle}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{test.date}</span>
                      <span
                        className={`font-semibold px-2 py-0.2 rounded-full text-[10px] ${
                          test.evaluationStatus === 'evaluated'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {test.evaluationStatus === 'evaluated' ? 'Audited' : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Test Detail & Transcript */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          {selectedTest ? (
            <div className="space-y-5">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono font-black text-slate-900">
                      {selectedTest.testNumber}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {selectedTest.promptVersion}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        selectedTest.evaluationStatus === 'evaluated'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedTest.evaluationStatus === 'evaluated' ? 'Audit Complete' : 'Evaluation Pending'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{selectedTest.scenarioTitle}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportTranscriptAsTXT(selectedTest)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export TXT</span>
                  </button>

                  <button
                    onClick={() => onEvaluateTest(selectedTest.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{selectedTest.evaluationStatus === 'evaluated' ? 'Re-Evaluate' : 'Evaluate Safety'}</span>
                  </button>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Recorded Date</span>
                  <span className="font-semibold text-slate-700">{selectedTest.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Duration</span>
                  <span className="font-semibold text-slate-700">{selectedTest.durationSeconds} seconds</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Consent Verified</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Confirmed
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Turns Logged</span>
                  <span className="font-semibold text-slate-700">{selectedTest.transcript.length} turns</span>
                </div>
              </div>

              {/* Observed Failures / Suggestions */}
              {selectedTest.observedFailures && selectedTest.observedFailures.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1">
                  <span className="font-bold text-rose-800 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Observed Failures in this Trial:
                  </span>
                  <ul className="list-disc list-inside text-rose-700 text-[11px]">
                    {selectedTest.observedFailures.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Conversation Transcript Display */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" /> Full Conversation Transcript
                </h4>
                <div className="bg-slate-900 rounded-xl p-4 max-h-[300px] overflow-y-auto space-y-3 font-sans text-xs">
                  {selectedTest.transcript.map((msg) => {
                    const isCaller = msg.sender === 'caller';
                    const isSystem = msg.sender === 'system';

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="text-[11px] text-amber-400 italic text-center py-1 border-b border-slate-800">
                          {msg.text}
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${isCaller ? 'text-sky-400' : 'text-emerald-400'}`}>
                            [{msg.timestamp}] {isCaller ? 'Caller:' : `Agent (${selectedTest.promptVersion}):`}
                          </span>
                        </div>
                        <p className={`pl-2 border-l-2 leading-relaxed ${isCaller ? 'border-sky-500/50 text-slate-200' : 'border-emerald-500/50 text-emerald-100 font-medium'}`}>
                          {msg.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              Select a test call from the list to view its complete audit transcript.
            </div>
          )}
        </div>
      </div>

      {/* Manual Test Add Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Add Test Record Manually</h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualTest} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Scenario</label>
                  <select
                    value={manualScenarioId}
                    onChange={(e) => setManualScenarioId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    {scenarios.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prompt Version</label>
                  <select
                    value={manualPromptVer}
                    onChange={(e) => setManualPromptVer(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="V1">V1 (Baseline)</option>
                    <option value="V2">V2 (Safety-Engineered)</option>
                    <option value="V3">V3 (Adaptive)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Transcript (One speaker line per entry, prefix with Caller: or Agent:)
                </label>
                <textarea
                  value={manualTranscriptText}
                  onChange={(e) => setManualTranscriptText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observed Failures (optional, semicolon separated)</label>
                <input
                  type="text"
                  value={manualObservedFailures}
                  onChange={(e) => setManualObservedFailures(e.target.value)}
                  placeholder="e.g. Advised checking room; Delayed 112 guidance"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="consentCheck"
                  checked={manualConsent}
                  onChange={(e) => setManualConsent(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <label htmlFor="consentCheck" className="text-xs text-slate-700">
                  Tester consent confirmed (no real personal identity collected)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
