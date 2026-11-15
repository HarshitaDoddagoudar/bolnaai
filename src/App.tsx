import React, { useState, useEffect } from 'react';
import { Sidebar, TabKey } from './components/Sidebar';
import { Header } from './components/Header';
import { SafetyBanner } from './components/SafetyBanner';
import { DashboardView } from './components/DashboardView';
import { ScenariosView } from './components/ScenariosView';
import { VoiceSimulatorView } from './components/VoiceSimulatorView';
import { TestHistoryView } from './components/TestHistoryView';
import { SafetyEvaluationView } from './components/SafetyEvaluationView';
import { ImprovementLogView } from './components/ImprovementLogView';
import { SettingsView } from './components/SettingsView';
import { BolnaIntegrationModal } from './components/BolnaIntegrationModal';

import { 
  getStoredScenarios, saveScenarios,
  getStoredTests, saveTests,
  getStoredEvaluations, saveEvaluations,
  getStoredImprovements, saveImprovements,
  getStoredPromptVersion, savePromptVersion,
  getStoredBolnaConfig, saveBolnaConfig,
  resetPrototypeData
} from './utils/storage';
import { PROMPT_VERSIONS } from './data/initialData';
import { Scenario, TestRecord, SafetyEvaluation, ImprovementItem, BolnaConfig } from './types';
import { exportTestsAsCSV } from './utils/exportUtils';

export const App: React.FC = () => {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');

  // Core Data States
  const [scenarios, setScenarios] = useState<Scenario[]>(getStoredScenarios);
  const [tests, setTests] = useState<TestRecord[]>(getStoredTests);
  const [evaluations, setEvaluations] = useState<SafetyEvaluation[]>(getStoredEvaluations);
  const [improvements, setImprovements] = useState<ImprovementItem[]>(getStoredImprovements);
  const [promptVersion, setPromptVersion] = useState<'V1' | 'V2' | 'V3'>(getStoredPromptVersion);
  const [bolnaConfig, setBolnaConfig] = useState<BolnaConfig>(getStoredBolnaConfig);

  // Cross-view selection targets
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    scenarios[0]?.id || 'sc-1'
  );
  const [evalTargetTestId, setEvalTargetTestId] = useState<string | null>(null);

  // Modals
  const [isBolnaModalOpen, setIsBolnaModalOpen] = useState(false);

  // Handlers for persistence
  const handleSaveScenario = (scenario: Scenario) => {
    const existingIndex = scenarios.findIndex(s => s.id === scenario.id);
    let updated: Scenario[];
    if (existingIndex >= 0) {
      updated = [...scenarios];
      updated[existingIndex] = scenario;
    } else {
      updated = [scenario, ...scenarios];
    }
    setScenarios(updated);
    saveScenarios(updated);
  };

  const handleSaveTestRecord = (record: TestRecord) => {
    const updated = [record, ...tests];
    setTests(updated);
    saveTests(updated);
  };

  const handleSaveEvaluation = (evaluation: SafetyEvaluation) => {
    const existingIndex = evaluations.findIndex(e => e.id === evaluation.id || (e.testId && e.testId === evaluation.testId));
    let updatedEvaluations: SafetyEvaluation[];
    if (existingIndex >= 0) {
      updatedEvaluations = [...evaluations];
      updatedEvaluations[existingIndex] = evaluation;
    } else {
      updatedEvaluations = [evaluation, ...evaluations];
    }
    setEvaluations(updatedEvaluations);
    saveEvaluations(updatedEvaluations);

    // Also update test status in test record
    if (evaluation.testId) {
      const updatedTests = tests.map(t => {
        if (t.id === evaluation.testId) {
          return {
            ...t,
            evaluationStatus: 'evaluated' as const,
            evaluationId: evaluation.id
          };
        }
        return t;
      });
      setTests(updatedTests);
      saveTests(updatedTests);
    }
  };

  const handleAddImprovement = (item: ImprovementItem) => {
    const updated = [item, ...improvements];
    setImprovements(updated);
    saveImprovements(updated);
  };

  const handleChangePromptVersion = (ver: 'V1' | 'V2' | 'V3') => {
    setPromptVersion(ver);
    savePromptVersion(ver);
  };

  const handleSaveBolnaConfig = (config: BolnaConfig) => {
    setBolnaConfig(config);
    saveBolnaConfig(config);
  };

  const handleResetAllData = () => {
    resetPrototypeData();
    setScenarios(getStoredScenarios());
    setTests(getStoredTests());
    setEvaluations(getStoredEvaluations());
    setImprovements(getStoredImprovements());
    setPromptVersion(getStoredPromptVersion());
    setBolnaConfig(getStoredBolnaConfig());
  };

  const handleSelectScenarioForSim = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    setCurrentTab('simulator');
  };

  const handleEvaluateTest = (testId: string) => {
    setEvalTargetTestId(testId);
    setCurrentTab('evaluation');
  };

  const pendingTestCount = tests.filter(t => t.evaluationStatus === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Permanent Notice Banner */}
      <SafetyBanner />

      <div className="flex flex-1">
        {/* Dark Navy Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          pendingTestCount={pendingTestCount}
          promptVersion={promptVersion}
          isBolnaConnected={bolnaConfig.isConnected}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            currentTab={currentTab}
            promptVersion={promptVersion}
            onChangePromptVersion={handleChangePromptVersion}
            onStartSimulation={() => setCurrentTab('simulator')}
            onExportAll={() => exportTestsAsCSV(tests)}
          />

          <main className="flex-1 p-6 overflow-y-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                scenarios={scenarios}
                tests={tests}
                evaluations={evaluations}
                promptVersion={promptVersion}
                promptVersions={PROMPT_VERSIONS}
                onNavigate={setCurrentTab}
                onSelectScenarioForSim={handleSelectScenarioForSim}
                onEvaluateTest={handleEvaluateTest}
              />
            )}

            {currentTab === 'scenarios' && (
              <ScenariosView
                scenarios={scenarios}
                onSaveScenario={handleSaveScenario}
                onSelectScenarioForSim={handleSelectScenarioForSim}
              />
            )}

            {currentTab === 'simulator' && (
              <VoiceSimulatorView
                scenarios={scenarios}
                selectedScenarioId={selectedScenarioId}
                onSelectScenario={setSelectedScenarioId}
                promptVersion={promptVersion}
                onChangePromptVersion={handleChangePromptVersion}
                onSaveTestRecord={handleSaveTestRecord}
                onSaveEvaluation={handleSaveEvaluation}
                bolnaConfig={bolnaConfig}
                onOpenBolnaConfig={() => setIsBolnaModalOpen(true)}
                onNavigate={setCurrentTab}
              />
            )}

            {currentTab === 'history' && (
              <TestHistoryView
                tests={tests}
                scenarios={scenarios}
                onAddManualTest={handleSaveTestRecord}
                onEvaluateTest={handleEvaluateTest}
              />
            )}

            {currentTab === 'evaluation' && (
              <SafetyEvaluationView
                evaluations={evaluations}
                tests={tests}
                scenarios={scenarios}
                targetTestId={evalTargetTestId}
                onSaveEvaluation={handleSaveEvaluation}
              />
            )}

            {currentTab === 'improvements' && (
              <ImprovementLogView
                promptVersions={PROMPT_VERSIONS}
                improvements={improvements}
                activePromptVersion={promptVersion}
                onChangePromptVersion={handleChangePromptVersion}
                onAddImprovement={handleAddImprovement}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                bolnaConfig={bolnaConfig}
                onOpenBolnaConfig={() => setIsBolnaModalOpen(true)}
                tests={tests}
                onResetAllData={handleResetAllData}
                promptVersion={promptVersion}
                onChangePromptVersion={handleChangePromptVersion}
              />
            )}
          </main>
        </div>
      </div>

      {/* Bolna Integration Placeholder Modal */}
      <BolnaIntegrationModal
        isOpen={isBolnaModalOpen}
        onClose={() => setIsBolnaModalOpen(false)}
        config={bolnaConfig}
        onSaveConfig={handleSaveBolnaConfig}
      />
    </div>
  );
};
export default App;
