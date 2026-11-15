import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Download, 
  Save, 
  AlertCircle, 
  SlidersHorizontal,
  FileCheck,
  FileText
} from 'lucide-react';
import { SafetyEvaluation, SafetyCriterion, TestRecord, Scenario } from '../types';
import { SAFETY_CHECKLIST_TEMPLATE } from '../data/initialData';
import { exportEvaluationSummary } from '../utils/exportUtils';

interface SafetyEvaluationViewProps {
  evaluations: SafetyEvaluation[];
  tests: TestRecord[];
  scenarios: Scenario[];
  targetTestId?: string | null;
  onSaveEvaluation: (evaluation: SafetyEvaluation) => void;
}

export const SafetyEvaluationView: React.FC<SafetyEvaluationViewProps> = ({
  evaluations,
  tests,
  scenarios,
  targetTestId,
  onSaveEvaluation
}) => {
  // Select active test for evaluation
  const [selectedTestId, setSelectedTestId] = useState<string>(
    targetTestId || (tests.length > 0 ? tests[0].id : '')
  );

  const selectedTest = tests.find(t => t.id === selectedTestId);
  const existingEval = evaluations.find(e => e.testId === selectedTestId);

  const [evaluatorName, setEvaluatorName] = useState<string>('Lead Safety Auditor');
  const [criteria, setCriteria] = useState<SafetyCriterion[]>(SAFETY_CHECKLIST_TEMPLATE);
  const [overallNotes, setOverallNotes] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Synchronize when selected test or targetTestId changes
  useEffect(() => {
    if (targetTestId) {
      setSelectedTestId(targetTestId);
    }
  }, [targetTestId]);

  useEffect(() => {
    if (existingEval) {
      setEvaluatorName(existingEval.evaluatorName || 'Lead Safety Auditor');
      setCriteria(existingEval.criteria);
      setOverallNotes(existingEval.overallNotes || '');
    } else {
      // Default blank evaluation template
      setCriteria(SAFETY_CHECKLIST_TEMPLATE.map(c => ({ ...c, status: 'not_tested', notes: '' })));
      setOverallNotes('');
    }
    setSaveSuccess(false);
  }, [selectedTestId, existingEval]);

  // Handle status toggle for a criterion
  const handleSetStatus = (id: number, status: 'pass' | 'fail' | 'not_tested') => {
    setCriteria(prev =>
      prev.map(c => (c.id === id ? { ...c, status } : c))
    );
    setSaveSuccess(false);
  };

  // Handle notes edit for a criterion
  const handleSetNotes = (id: number, notes: string) => {
    setCriteria(prev =>
      prev.map(c => (c.id === id ? { ...c, notes } : c))
    );
    setSaveSuccess(false);
  };

  // Calculate score strictly on tested requirements
  const passCount = criteria.filter(c => c.status === 'pass').length;
  const failCount = criteria.filter(c => c.status === 'fail').length;
  const notTestedCount = criteria.filter(c => c.status === 'not_tested').length;
  const testedCount = passCount + failCount;

  // IMPORTANT: Tested requirements only. Untested are NOT treated as passed.
  const scorePercentage = testedCount > 0 ? (passCount / testedCount) * 100 : 0;

  const handleSave = () => {
    if (!selectedTest) return;

    const evaluation: SafetyEvaluation = {
      id: existingEval ? existingEval.id : `eval-${Date.now()}`,
      testId: selectedTest.id,
      scenarioId: selectedTest.scenarioId,
      scenarioTitle: selectedTest.scenarioTitle,
      promptVersion: selectedTest.promptVersion,
      evaluatorName: evaluatorName.trim() || 'Safety Auditor',
      evaluationDate: new Date().toISOString().slice(0, 10),
      criteria,
      overallNotes: overallNotes.trim(),
      scorePercentage: Number(scorePercentage.toFixed(1)),
      testedCount,
      passCount,
      failCount,
      notTestedCount
    };

    onSaveEvaluation(evaluation);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Safety Behavior Evaluation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit agent compliance across 9 strict emergency safety criteria (Tested criteria only)
          </p>
        </div>

        {existingEval && (
          <button
            onClick={() => exportEvaluationSummary(existingEval)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Evaluation Summary</span>
          </button>
        )}
      </div>

      {/* Test Selector & Live Score Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Selection Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <label className="block text-xs font-bold text-slate-700">
            Select Test Call to Audit:
          </label>
          <select
            value={selectedTestId}
            onChange={(e) => setSelectedTestId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-semibold bg-white"
          >
            {tests.map(t => (
              <option key={t.id} value={t.id}>
                {t.testNumber} – {t.scenarioTitle} ({t.promptVersion}) [{t.evaluationStatus}]
              </option>
            ))}
          </select>

          {selectedTest && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Prompt: <strong className="text-slate-800">{selectedTest.promptVersion}</strong></span>
                <span>{selectedTest.date}</span>
              </div>
              <p className="font-semibold text-slate-800">{selectedTest.scenarioTitle}</p>
              <p className="text-slate-500 text-[11px]">
                {selectedTest.transcript.length} turns • {selectedTest.durationSeconds}s duration
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Evaluator Name</label>
            <input
              type="text"
              value={evaluatorName}
              onChange={(e) => setEvaluatorName(e.target.value)}
              placeholder="e.g. Dr. Sarah Lin (Safety Auditor)"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Overall Auditor Observations</label>
            <textarea
              value={overallNotes}
              onChange={(e) => setOverallNotes(e.target.value)}
              rows={3}
              placeholder="Summary of agent safety behavior, adherence to non-dispatch disclosure, etc."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{existingEval ? 'Update Safety Audit' : 'Save Safety Evaluation'}</span>
          </button>

          {saveSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-bold">
              ✓ Safety evaluation saved successfully!
            </div>
          )}
        </div>

        {/* Live Safety Scorecard */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Safety Compliance Benchmark
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Formula: Pass ÷ (Pass + Fail) × 100%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-400">Calculated Score</span>
                <div className="text-3xl font-black text-emerald-400 mt-1">
                  {scorePercentage.toFixed(1)}%
                </div>
                <span className="text-[10px] text-slate-400 mt-1">Tested items only</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <span className="text-[11px] font-semibold text-emerald-700">Passed Requirements</span>
                <div className="text-2xl font-black text-emerald-800 mt-1">{passCount}</div>
                <span className="text-[10px] text-emerald-600 mt-1">Zero safety violations</span>
              </div>

              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                <span className="text-[11px] font-semibold text-rose-700">Failed Violations</span>
                <div className="text-2xl font-black text-rose-800 mt-1">{failCount}</div>
                <span className="text-[10px] text-rose-600 mt-1">Requires prompt fix</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-800">
                <span className="text-[11px] font-semibold text-slate-500">Not Tested</span>
                <div className="text-2xl font-black text-slate-700 mt-1">{notTestedCount}</div>
                <span className="text-[10px] text-slate-500 mt-1">Excluded from score</span>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-900 leading-relaxed">
              <strong>Evaluation Principle:</strong> Untested safety criteria are never treated as passed. 
              The pass rate is strictly computed against the {testedCount} criteria validated in this trial.
            </div>
          </div>

          {selectedTest && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Auditing: <strong>{selectedTest.testNumber}</strong></span>
              <span>Version: <strong>{selectedTest.promptVersion}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* 9 Requirements Checklist Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            9 Critical Safety Evaluation Criteria
          </h3>
          <span className="text-xs text-slate-400">Mark Pass, Fail, or Not Tested</span>
        </div>

        <div className="divide-y divide-slate-100">
          {criteria.map((crit) => {
            return (
              <div key={crit.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-xs">
                      {crit.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{crit.description}</p>
                  
                  {/* Criterion specific notes */}
                  <input
                    type="text"
                    value={crit.notes}
                    onChange={(e) => handleSetNotes(crit.id, e.target.value)}
                    placeholder="Specific auditor observation or citation from transcript..."
                    className="mt-2 w-full max-w-xl px-2.5 py-1 text-xs rounded border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 self-start md:self-center">
                  <button
                    onClick={() => handleSetStatus(crit.id, 'pass')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      crit.status === 'pass'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Pass</span>
                  </button>

                  <button
                    onClick={() => handleSetStatus(crit.id, 'fail')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      crit.status === 'fail'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Fail</span>
                  </button>

                  <button
                    onClick={() => handleSetStatus(crit.id, 'not_tested')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      crit.status === 'not_tested'
                        ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Not Tested</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
