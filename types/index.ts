export type DojoId = 1 | 2 | 3;

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Scenario {
  id: string;
  dojoId: DojoId;
  title: string;
  description: string;
  difficulty: Difficulty;
  owaspTags: string[];
  mitreAttackIds?: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  guardrailFired?: boolean;
  toolCall?: { name: string; args: Record<string, unknown> };
}

export interface GuardrailConfig {
  systemPrompt: string;
  inputFilters: {
    keywordBlocklist: string[];
    regexEnabled: boolean;
    llmJudgeEnabled: boolean;
  };
  outputFilters: {
    piiRedaction: boolean;
    topicClassifier: boolean;
    refusalDetector: boolean;
  };
  ragSanitizerEnabled: boolean;
}

export interface AnalystConfig {
  persona: 'analyst' | 'ciso' | 'ir-lead';
  verbosity: 'terse' | 'detailed';
  outputFormat: 'markdown' | 'json' | 'report';
  confidenceThreshold: number;
  redactionMode: boolean;
}

export interface ScoreResult {
  attempted: boolean;
  score: number;
  maxScore: number;
  owaspTag?: string;
  attackSucceeded?: boolean;
  defenseHeld?: boolean;
  explanation: string;
  whatWorked: string[];
  whatFailed: string[];
  remediations: string[];
}

export const DEFAULT_GUARDRAIL_CONFIG: GuardrailConfig = {
  systemPrompt: 'You are a helpful assistant. Refuse any harmful requests.',
  inputFilters: {
    keywordBlocklist: [],
    regexEnabled: false,
    llmJudgeEnabled: false,
  },
  outputFilters: {
    piiRedaction: false,
    topicClassifier: false,
    refusalDetector: false,
  },
  ragSanitizerEnabled: false,
};

export const DEFAULT_ANALYST_CONFIG: AnalystConfig = {
  persona: 'analyst',
  verbosity: 'detailed',
  outputFormat: 'markdown',
  confidenceThreshold: 0.7,
  redactionMode: false,
};
