export type DojoId = 1 | 2 | 3;

// ─── Dojo 2 analyst configuration ────────────────────────────────────────────

export type AnalystPersona = 'analyst' | 'ciso' | 'ir-lead';
export type AnalystOutputFormat = 'markdown' | 'json' | 'report';

/** How thorough the analysis should be. */
export type AnalysisDepth = 'basic' | 'standard' | 'deep';

/** Tone and verbosity of the analyst's response. */
export type ResponseStyle = 'concise' | 'detailed' | 'structured';

/** How much historical and environmental context to include. */
export type ContextLevel = 'none' | 'limited' | 'full';

/** Analyst's declared confidence in their assessment. */
export type ConfidenceAssessment = 'low' | 'medium' | 'high';

export interface Dojo2Config {
  persona: AnalystPersona;
  outputFormat: AnalystOutputFormat;

  // ── Analysis Configuration ────────────────────────────────────────────────
  /** How deeply to analyse the artefact (basic triage → full forensic). */
  analysisDepth: AnalysisDepth;
  /** Response verbosity and tone. */
  responseStyle: ResponseStyle;

  // ── Investigation Capabilities ────────────────────────────────────────────
  /** Extract and list Indicators of Compromise. */
  iocExtraction: boolean;
  /** Map to MITRE ATT&CK techniques with T-codes. */
  mitreMapping: boolean;
  /** Correlate with known threat actor groups and prior campaigns. */
  threatCorrelation: boolean;

  // ── Data Context ──────────────────────────────────────────────────────────
  /** Amount of historical/environmental context to include in the analysis. */
  contextLevel: ContextLevel;

  // ── Assessment Output ─────────────────────────────────────────────────────
  /** Analyst's stated confidence level in the findings. */
  confidenceLevel: ConfidenceAssessment;
  /** Overall risk level assigned to this artefact. */
  riskAssessment: 'low' | 'medium' | 'high' | 'critical';
}

export const DEFAULT_DOJO2_CONFIG: Dojo2Config = {
  persona: 'analyst',
  outputFormat: 'markdown',
  analysisDepth: 'standard',
  responseStyle: 'detailed',
  iocExtraction: true,
  mitreMapping: true,
  threatCorrelation: false,
  contextLevel: 'limited',
  confidenceLevel: 'medium',
  riskAssessment: 'medium',
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
  | 'mixed_attack'
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
