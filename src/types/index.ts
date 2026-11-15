export type ScenarioCategory = 'fire' | 'power_failure' | 'earthquake' | 'general';

export interface Scenario {
  id: string;
  title: string;
  category: ScenarioCategory;
  location: string;
  description: string;
  callerScript: string;
  expectedAgentBehaviour: string[];
  safetyCriteria: string[];
  keyRisks: string[];
  isCustom?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'caller' | 'agent' | 'system';
  text: string;
  timestamp: string;
  audioSpoken?: boolean;
}

export type EvaluationStatus = 'pass' | 'fail' | 'not_tested';

export interface SafetyCriterion {
  id: number;
  title: string;
  description: string;
  status: EvaluationStatus;
  notes: string;
}

export interface SafetyEvaluation {
  id: string;
  testId?: string;
  scenarioId: string;
  scenarioTitle: string;
  promptVersion: 'V1' | 'V2' | 'V3';
  evaluatorName: string;
  evaluationDate: string;
  criteria: SafetyCriterion[];
  overallNotes: string;
  scorePercentage: number; // pass / (pass + fail) * 100
  testedCount: number;
  passCount: number;
  failCount: number;
  notTestedCount: number;
}

export interface TestRecord {
  id: string;
  testNumber: string;
  scenarioId: string;
  scenarioTitle: string;
  date: string;
  durationSeconds: number;
  testerConsent: boolean;
  promptVersion: 'V1' | 'V2' | 'V3';
  transcript: ChatMessage[];
  evaluationStatus: 'pending' | 'evaluated';
  evaluationId?: string;
  observedFailures: string[];
  improvementSuggestions: string;
}

export interface PromptVersion {
  id: 'V1' | 'V2' | 'V3';
  name: string;
  tagline: string;
  description: string;
  rules: string[];
  systemPrompt: string;
  status: 'baseline' | 'active' | 'in_development';
}

export interface ImprovementItem {
  id: string;
  promptVersion: 'V1' | 'V2' | 'V3';
  problemIdentified: string;
  previousBehaviour: string;
  proposedChange: string;
  testResult: string;
  improvementStatus: 'Identified' | 'In Testing' | 'Verified' | 'Needs Review';
  lastUpdated: string;
}

export interface BolnaConfig {
  apiKey: string;
  agentId: string;
  apiBaseUrl: string;
  webhookUrl: string;
  isConnected: boolean;
  environment: 'sandbox' | 'production';
}
