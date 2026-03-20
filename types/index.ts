export type DojoId = 1 | 2 | 3;

// ─── Dojo 2 analyst configuration ────────────────────────────────────────────

export type AnalystPersona = 'analyst' | 'ciso' | 'ir-lead';
export type AnalystOutputFormat = 'markdown' | 'json' | 'report';

export interface Dojo2Config {
  persona: AnalystPersona;
  outputFormat: AnalystOutputFormat;
}

export const DEFAULT_DOJO2_CONFIG: Dojo2Config = {
  persona: 'analyst',
  outputFormat: 'markdown',
};

// ─── Dojo 3 defender configuration ───────────────────────────────────────────

export interface Dojo3Config {
  detectionRule: string;
  selectedClauses: string[];
}

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

// ─── M5: Universal control config sent with every chat request ───────────────

export interface ControlConfig {
  strictPolicy: boolean;
  allowTools: boolean;
  ragEnabled: boolean;
  injectionShield: 'off' | 'basic' | 'strict';
  loggingLevel: 'minimal' | 'verbose';
}

export const DEFAULT_CONTROL_CONFIG: ControlConfig = {
  strictPolicy: false,
  allowTools: false,
  ragEnabled: false,
  injectionShield: 'off',
  loggingLevel: 'minimal',
};

// ─── M6: Evaluation result returned by /api/evaluate ────────────────────────

export type Verdict = 'PASS' | 'WARN' | 'FAIL';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type AttackType =
  | 'benign'
  | 'probing'
  | 'prompt_injection'
  | 'data_exfiltration'
  | 'policy_bypass'
  | 'tool_abuse'
  | 'rag_injection'
  | 'unknown';

export interface EvaluationResult {
  verdict: Verdict;
  attackSucceeded: boolean;
  score: number;
  riskLevel: RiskLevel;
  attackType: AttackType;
  signals: string[];
  explanation: string;
  defensiveFailures: string[];
  recommendedMitigations: string[];
  /** Scenario-specific description of what attack occurred (shown in WHAT HAPPENED panel). */
  whatHappened: string;
  /** Concrete mitigation paragraph (shown in DEFENSIVE TAKEAWAY panel). */
  defensiveTakeaway: string;
  /** OWASP LLM Top 10 category, e.g. "LLM01 – Prompt Injection". */
  owaspCategory: string;
  /**
   * Dojo 1 only — human-readable label for the data category that was leaked
   * when the attack succeeded, e.g. "API credential + internal system config".
   * Undefined for benign/probing turns or when defenses held.
   */
  leakedDataCategory?: string;
  /**
   * Dojo 1 only — attack chain metadata when multiple attacks succeeded in the
   * same session. `chain` lists attack types oldest-to-newest (including the
   * current turn). `chainPenalty` is the additional score deduction applied
   * on top of the per-turn deduction.
   */
  attackChain?: { chain: AttackType[]; chainPenalty: number };
  /**
   * Dojo 2/3 only — SecurityAI+ exam topics connected to this scenario/evaluation.
   * Displayed in the scoring pane to map hands-on practice to certification domains.
   */
  securityAITopics?: string[];
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
