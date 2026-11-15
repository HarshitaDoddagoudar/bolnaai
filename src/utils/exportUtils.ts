import { TestRecord, SafetyEvaluation } from '../types';

export function exportTestsAsCSV(tests: TestRecord[]): void {
  const headers = [
    'Test Number',
    'Scenario Title',
    'Date',
    'Duration (s)',
    'Prompt Version',
    'Tester Consent',
    'Evaluation Status',
    'Observed Failures',
    'Improvement Suggestions'
  ];

  const rows = tests.map(t => [
    `"${t.testNumber}"`,
    `"${t.scenarioTitle.replace(/"/g, '""')}"`,
    `"${t.date}"`,
    t.durationSeconds,
    `"${t.promptVersion}"`,
    t.testerConsent ? 'Yes' : 'No',
    `"${t.evaluationStatus}"`,
    `"${(t.observedFailures || []).join('; ').replace(/"/g, '""')}"`,
    `"${(t.improvementSuggestions || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadFile(csvContent, `smart_crisis_test_records_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportTranscriptAsTXT(test: TestRecord): void {
  const lines: string[] = [
    '=================================================================',
    'SMART CRISIS – EMERGENCY SIMULATION TRANSCRIPT',
    'NOTICE: FICTIONAL SIMULATION ONLY – NOT AN EMERGENCY SERVICE',
    'REAL EMERGENCIES MUST DIAL 112',
    '=================================================================',
    `Test Identifier: ${test.testNumber}`,
    `Scenario:        ${test.scenarioTitle}`,
    `Date & Time:     ${test.date}`,
    `Duration:        ${test.durationSeconds} seconds`,
    `Prompt Version:  ${test.promptVersion}`,
    `Tester Consent:  ${test.testerConsent ? 'Confirmed' : 'Pending'}`,
    `Evaluation:      ${test.evaluationStatus.toUpperCase()}`,
    '-----------------------------------------------------------------',
    'CONVERSATION TRANSCRIPT:',
    '-----------------------------------------------------------------'
  ];

  test.transcript.forEach(msg => {
    const role = msg.sender.toUpperCase();
    lines.push(`[${msg.timestamp}] [${role}]: ${msg.text}`);
  });

  lines.push('-----------------------------------------------------------------');
  lines.push(`Observed Failures: ${(test.observedFailures || []).join(', ') || 'None recorded'}`);
  lines.push(`Improvement Suggestions: ${test.improvementSuggestions || 'None'}`);
  lines.push('=================================================================');

  downloadFile(lines.join('\n'), `transcript_${test.testNumber}_${test.promptVersion}.txt`, 'text/plain;charset=utf-8;');
}

export function exportEvaluationSummary(evaluation: SafetyEvaluation): void {
  const lines: string[] = [
    '=================================================================',
    'SMART CRISIS – SAFETY EVALUATION REPORT',
    '=================================================================',
    `Evaluation ID:   ${evaluation.id}`,
    `Scenario:        ${evaluation.scenarioTitle}`,
    `Prompt Version:  ${evaluation.promptVersion}`,
    `Evaluator:       ${evaluation.evaluatorName || 'Lead Safety Auditor'}`,
    `Evaluation Date: ${evaluation.evaluationDate}`,
    `Safety Score:    ${evaluation.scorePercentage.toFixed(1)}% (Based strictly on tested criteria)`,
    `Tested Count:    ${evaluation.testedCount} / 9`,
    `Pass Count:      ${evaluation.passCount}`,
    `Fail Count:      ${evaluation.failCount}`,
    `Untested Count:  ${evaluation.notTestedCount}`,
    '-----------------------------------------------------------------',
    'CHECKLIST BREAKDOWN (9 CRITICAL REQUIREMENTS):',
    '-----------------------------------------------------------------'
  ];

  evaluation.criteria.forEach(c => {
    lines.push(`[${c.status.toUpperCase()}] ${c.title}`);
    if (c.notes) {
      lines.push(`   Notes: ${c.notes}`);
    }
  });

  lines.push('-----------------------------------------------------------------');
  lines.push(`Auditor Notes: ${evaluation.overallNotes || 'None'}`);
  lines.push('=================================================================');

  downloadFile(lines.join('\n'), `safety_evaluation_${evaluation.promptVersion}_${evaluation.id}.txt`, 'text/plain;charset=utf-8;');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
