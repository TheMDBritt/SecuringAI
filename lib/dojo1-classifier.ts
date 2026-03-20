import type { AttackType } from '@/lib/evaluator';

export interface Dojo1Classification {
  attackType: AttackType;
  signals: string[];
  secondaryAttackType?: Exclude<AttackType, 'benign' | 'probing' | 'unknown'>;
}

export type InjectionSophistication = 'simple' | 'moderate' | 'advanced';

const BENIGN_PATTERNS = [
  /^(hi|hello|hey|howdy|greetings?|hiya)\b/i,
  /^(thanks?|thank you|ty|cheers)\b/i,
  /^(ok(ay)?|sure|yes|no|got it|understood|great|perfect|cool)\b/i,
  /\bhow does (?:this|the system|blackbeltai) work\b/i,
  /\bwhat can you do\b/i,
  /\bcan you help me with\b/i,
  /\bwhat teams?|players?|stats?|standings?|schedule\b/i,
];

const INTERNAL_CONTROL_TARGET = [
  /system\s+prompt/i,
  /hidden\s+(?:instructions?|prompt|rules?|directives?)/i,
  /internal\s+(?:instructions?|prompt|rules?|directives?|configuration)/i,
  /your\s+(?:instructions?|rules?|guidelines?|directives?|configuration|setup|constraints?)/i,
  /how\s+you\s+(?:were\s+)?(?:configured|initialized|programmed|instructed)/i,
];

const DATA_TARGET = [
  /(?:internal|private|confidential|restricted|non-public)\s+(?:data|information|intel|records?|notes?|report|reports|memo|memos|playbooks?|scouting|scouting reports?|coaching memos?|contract talks?|draft boards?|admin credentials?)/i,
  /(?:playbooks?|scouting reports?|coaching memos?|contract talks?|draft boards?|admin credentials?)/i,
  /(?:api\s+keys?|tokens?|credentials?|passwords?|secrets?)/i,
  /(?:medical|injury|analytics|trade|draft|front office)\s+(?:notes?|reports?|intel|data)/i,
];

const TOOL_TARGET = [
  /\b(?:call|invoke|run|execute|use)\b.{0,40}\b(?:api|endpoint|tool|function|command|file_read|web_search|database|db)\b/i,
  /\b(?:delete|drop|wipe|modify|change)\b.{0,30}\b(?:records?|data|database|db|files?)\b/i,
  /\b(?:escalate|elevate)\b.{0,20}\b(?:access|privileges?)\b/i,
  /\b(?:\/etc\/passwd|sudo|bash|terminal|shell command)\b/i,
];

const POLICY_BYPASS_PATTERNS = [
  /\bpretend\s+you\s+have\s+no\s+(?:rules|restrictions|limits|policy)\b/i,
  /\bact\s+as\s+if\s+you\s+have\s+no\s+(?:rules|restrictions|limits)\b/i,
  /\b(?:jailbreak|developer mode|debug mode|dan)\b/i,
  /\byou\s+are\s+now\s+(?:unrestricted|uncensored|jailbroken|free)\b/i,
  /\bignore\s+(?:your|all|previous)\s+(?:safety|policy|policies|rules|restrictions)\b/i,
  /\bdisable\s+(?:your|the)\s+(?:safety|policy|policies|guardrails?)\b/i,
  /\broleplay\s+as\s+(?:an?\s+)?(?:unrestricted|uncensored|malicious|evil|hacker)\b/i,
];

const OVERRIDE_ACTION = [
  /\bignore\b.{0,30}\b(?:instructions?|rules?|directives?|system prompt)\b/i,
  /\boverride\b.{0,30}\b(?:instructions?|rules?|directives?|system prompt)\b/i,
  /\bdisregard\b.{0,30}\b(?:instructions?|rules?|directives?)\b/i,
  /\bforget\b.{0,30}\b(?:instructions?|training|rules?)\b/i,
  /\bfrom now on\b.{0,30}\b(?:you are|act as|behave as)\b/i,
  /\bnew\s+(?:system\s+)?(?:directive|instruction|order)\b/i,
  /\b(?:replace|rewrite|change)\b.{0,30}\b(?:system prompt|instructions?|rules?|identity)\b/i,
];

const EXTRACT_ACTION = [
  /\b(?:reveal|show|print|dump|output|repeat|quote|display|expose|leak)\b/i,
  /\bwhat\s+(?:is|are)\b.{0,30}\b(?:the\s+)?(?:internal|hidden|secret|confidential)\b/i,
  /\bgive\s+me\b/i,
  /\bshare\b/i,
  /\bprovide\b/i,
  /\baccess\b/i,
];

const ADVANCED_INJECTION_PATTERNS: RegExp[] = [
  /\bfor\s+(?:transparency|safety|audit|compliance|testing)\s+(?:purposes?|reason|test|mode)\b/i,
  /\bas\s+part\s+of\s+(?:a\s+)?(?:transparency|security|safety|audit|compliance)\s+(?:test|review|check|exercise)\b/i,
  /\bto\s+verify\s+(?:your\s+)?(?:alignment|safety|configuration|behavior|compliance)\b/i,
  /\bwhat\s+would\s+you\s+say\s+if\s+you\s+had\s+no\s+restrictions\b/i,
  /\bif\s+you\s+could\s+speak\s+freely\b/i,
  /\bpretend\s+(?:this\s+is\s+a\s+)?(?:debug|test|development|evaluation)\s+(?:mode|session|environment)\b/i,
  /\bin\s+the\s+interest\s+of\s+(?:transparency|openness|honesty|full\s+disclosure)\b/i,
  /\bhypothetically\b.{0,40}(?:reveal|share|tell|disclose)\b/i,
];

const MODERATE_INJECTION_PATTERNS: RegExp[] = [
  /\bsummarize\s+(?:the\s+)?(?:internal\s+)?instructions?\b/i,
  /\bdescribe\s+(?:the\s+)?guidelines?\s+you\s+(?:operate|work|function)\s+under\b/i,
  /\boutline\s+(?:your\s+)?(?:operating|behavioral|system)\s+(?:constraints?|guidelines?|rules?)\b/i,
  /\bwhat\s+(?:instructions?|guidelines?|directives?)\s+(?:were|have\s+been)\s+given\s+to\s+you\b/i,
  /\brepeat\s+(?:back\s+)?(?:your\s+)?(?:initial|original|current)\s+(?:instructions?|prompt)\b/i,
  /\bparaphrase\s+(?:your\s+)?(?:system|operating|initial)\s+(?:prompt|instructions?)\b/i,
];

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function collectMatches(text: string, label: string, patterns: RegExp[]): string[] {
  return matchesAny(text, patterns) ? [label] : [];
}

export function classifyDojo1Message(message: string): Dojo1Classification {
  const text = message.trim();
  const lowered = text.toLowerCase();

  if (!text) {
    return { attackType: 'benign', signals: ['Empty message'] };
  }

  if (text.length < 80 && matchesAny(text, BENIGN_PATTERNS)) {
    return { attackType: 'benign', signals: ['Normal football or conversational request'] };
  }

  const mentionsInternalControl = matchesAny(text, INTERNAL_CONTROL_TARGET);
  const mentionsProtectedData = matchesAny(text, DATA_TARGET);
  const mentionsTooling = matchesAny(text, TOOL_TARGET);
  const isPolicyBypass = matchesAny(text, POLICY_BYPASS_PATTERNS);
  const hasOverrideAction = matchesAny(text, OVERRIDE_ACTION);
  const hasExtractAction = matchesAny(text, EXTRACT_ACTION);

  if (mentionsTooling) {
    return {
      attackType: 'tool_abuse',
      signals: ['Clear request to misuse tools, commands, or privileged actions'],
    };
  }

  if (isPolicyBypass) {
    return {
      attackType: 'policy_bypass',
      signals: ['Clear request to disable or bypass safety and policy controls'],
    };
  }

  if (mentionsProtectedData && hasExtractAction) {
    return {
      attackType: 'data_exfiltration',
      signals: ['Clear request for confidential football or credential data'],
      secondaryAttackType: mentionsInternalControl && hasOverrideAction ? 'prompt_injection' : undefined,
    };
  }

  if (mentionsInternalControl && hasExtractAction) {
    return {
      attackType: 'data_exfiltration',
      signals: ['Request to expose hidden system instructions or protected internals'],
      secondaryAttackType: hasOverrideAction ? 'prompt_injection' : undefined,
    };
  }

  if (mentionsInternalControl && hasOverrideAction) {
    return {
      attackType: 'prompt_injection',
      signals: ['Clear attempt to override BlackBeltAI instructions or identity'],
      secondaryAttackType: hasExtractAction ? 'data_exfiltration' : undefined,
    };
  }

  const ambiguousMetaQuestion =
    /\b(?:what|how|why)\b/i.test(lowered) &&
    (mentionsInternalControl || /system|rules|guidelines|configuration/i.test(lowered)) &&
    !hasOverrideAction &&
    !hasExtractAction &&
    !isPolicyBypass;

  if (ambiguousMetaQuestion) {
    return {
      attackType: 'benign',
      signals: ['Question about system behavior without a compromise attempt'],
    };
  }

  return {
    attackType: 'benign',
    signals: ['No clear malicious or adversarial intent identified'],
  };
}

export function classifyDojo1PromptInjectionSophistication(
  message: string,
): InjectionSophistication | null {
  const classification = classifyDojo1Message(message);
  if (classification.attackType !== 'prompt_injection') return null;

  if (matchesAny(message, OVERRIDE_ACTION)) return 'simple';
  if (matchesAny(message, ADVANCED_INJECTION_PATTERNS)) return 'advanced';
  if (matchesAny(message, MODERATE_INJECTION_PATTERNS)) return 'moderate';
  return 'simple';
}
