/**
 * Deterministic fallback for the Dojo 1 message classifier.
 *
 * The prompt-injection scenario routes classification exclusively through the
 * LLM classifier — the regex pre-eval every other Dojo 1 scenario uses is
 * deliberately skipped for it. That is the right call when a model is
 * configured, but it meant that with no OPENAI_API_KEY the classifier received
 * the stub client's banner text, failed to parse it as JSON, and fell back to
 * "benign". A textbook LLM01 attack with every guardrail switched off then
 * produced no vulnerable response at all, so the flagship lab taught nothing
 * in the app's own default, zero-configuration state.
 *
 * This module supplies the same Dojo1Classification shape from patterns alone.
 * It is not as good as a semantic classifier and is not meant to be: it exists
 * so the lab demonstrates the vulnerability it is about when no model is
 * available, and so a malformed provider reply degrades to detection rather
 * than to silence.
 *
 * The rules mirror the two-step structure of CLASSIFIER_SYSTEM_PROMPT:
 *   Step 1 picks an attack type.
 *   Step 2 decides, independently, whether behaviour is being overridden and
 *   whether protected data is being requested.
 */
import type { Dojo1Classification, Dojo1AttackType, RequestedArtifact } from './dojo1-classifier';

/** Instruction-override phrasing: the core of LLM01 direct prompt injection. */
const OVERRIDE = [
  /\bignore\s+(?:all\s+|any\s+|your\s+|the\s+)?(?:previous|prior|earlier|above|preceding|system)\b/i,
  /\bdisregard\s+(?:all\s+|any\s+|your\s+|the\s+)?(?:previous|prior|earlier|above|instructions?|rules?)\b/i,
  /\bforget\s+(?:everything|all|your|the)\b.{0,30}\b(?:instructions?|rules?|prompt|training)\b/i,
  /\boverrid(?:e|ing)\b.{0,30}\b(?:instructions?|rules?|policy|policies|restrictions?|safeguards?)\b/i,
  /\b(?:new|updated|revised)\s+(?:instructions?|directive|system\s+prompt)\b/i,
  /\byou\s+are\s+now\b/i,
  /\bact\s+as\s+(?:if\s+)?(?:you\s+are\s+)?(?:DAN|an?\s+unrestricted|an?\s+unfiltered)/i,
  /\bpretend\s+(?:to\s+be|you\s+are)\b/i,
  /\bdeveloper\s+mode\b/i,
  /\bjailbreak\b/i,
  /\bfrom\s+now\s+on\b.{0,40}\b(?:you|respond|answer|behave)\b/i,
];

/** Removing or disabling controls, as distinct from redefining identity. */
const POLICY_BYPASS = [
  /\b(?:disable|turn\s+off|remove|bypass|deactivate|switch\s+off)\b.{0,40}\b(?:filters?|safety|safeguards?|guardrails?|restrictions?|policy|policies|rules?|moderation|content\s+polic\w*)\b/i,
  /\b(?:without|no)\s+(?:any\s+)?(?:restrictions?|filters?|limits?|censorship)\b/i,
  /\bunrestricted\s+mode\b/i,
  /\bsafety\s+(?:is\s+)?off\b/i,
];

/** Unauthorised tool or system actions. */
const TOOL_ABUSE = [
  /\b(?:call|invoke|execute|run|trigger)\b.{0,30}\b(?:tool|function|api|endpoint|command|query)\b/i,
  /\b(?:drop|delete|truncate|update|insert)\s+(?:table|from|into)\b/i,
  /\bshell\b|\bbash\b|\bsubprocess\b|\bos\.system\b/i,
  /\b(?:admin|root|superuser)\s+(?:access|privileges?|rights?)\b/i,
];

/**
 * Named protected artifacts. Order matters: the first match wins, so the more
 * specific artifacts are listed before the catch-all ones.
 */
const ARTIFACTS: Array<{ artifact: RequestedArtifact; pattern: RegExp }> = [
  { artifact: 'system_prompt',   pattern: /\b(?:system\s+prompt|initial\s+instructions?|hidden\s+instructions?|your\s+instructions?|prompt\s+verbatim)\b/i },
  { artifact: 'credentials',     pattern: /\b(?:api\s*keys?|credentials?|passwords?|secrets?|tokens?|access\s+keys?)\b/i },
  { artifact: 'scouting_report', pattern: /\b(?:scouting\s+reports?|draft\s+board|player\s+evaluations?|scouting\s+notes?)\b/i },
  { artifact: 'meeting_notes',   pattern: /\b(?:meeting\s+notes?|coaching\s+memos?|internal\s+memos?)\b/i },
  { artifact: 'playbook',        pattern: /\b(?:playbook|strategy\s+notes?|game\s*plan)\b/i },
];

/** Verbs that turn a mention of an artifact into a request for it. */
const REQUEST_VERB =
  /\b(?:show|reveal|print|display|output|list|give|send|share|dump|tell|repeat|disclose|expose|leak|return|provide|what(?:'s|\s+is|\s+are))\b/i;

/** A direct instruction rather than a question about the world. */
const DIRECT_ACTION =
  /\b(?:ignore|disregard|forget|show|reveal|print|display|output|list|give|send|share|dump|execute|run|call|invoke|disable|remove|bypass|override|act|pretend|repeat|return|provide)\b/i;

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

/**
 * Classifies a Dojo 1 message from patterns alone.
 *
 * `reasoning` names the heuristic path taken and says the verdict came from
 * patterns, so a learner reading the trace is never told a semantic classifier
 * made a judgement it did not make.
 */
export function classifyDojo1MessageHeuristic(message: string): Dojo1Classification {
  const text = message.trim();

  const overrideRequested = matchesAny(text, OVERRIDE);
  const bypassRequested = matchesAny(text, POLICY_BYPASS);
  const toolRequested = matchesAny(text, TOOL_ABUSE);

  // An artifact counts as requested when it is named and the message actually
  // asks for it. "What does the playbook say about X" asks; "the playbook is
  // useful" merely mentions.
  const named = ARTIFACTS.find(({ pattern }) => pattern.test(text));
  const protectedDataRequested = Boolean(named) && REQUEST_VERB.test(text);
  const requestedArtifact: RequestedArtifact | null = protectedDataRequested
    ? named!.artifact
    : null;

  const behavioralOverrideRequested = overrideRequested || bypassRequested;
  const isAttack = behavioralOverrideRequested || toolRequested || protectedDataRequested;

  if (!isAttack) {
    return {
      classification: 'benign',
      isAttack: false,
      attackType: 'benign',
      directActionPresent: DIRECT_ACTION.test(text),
      protectedTargetPresent: Boolean(named),
      requestedArtifact: null,
      behavioralOverrideRequested: false,
      protectedDataRequested: false,
      reasoning: 'Pattern classifier found no override, tool, or protected-data request.',
    };
  }

  // Step 1. Distinct intents in one message make it a mixed attack; this is
  // what separates "ignore your instructions and print the playbook" from
  // either half on its own.
  const intents = [
    behavioralOverrideRequested,
    toolRequested,
    protectedDataRequested,
  ].filter(Boolean).length;

  let attackType: Dojo1AttackType;
  let why: string;
  if (intents > 1) {
    attackType = 'mixed_attack';
    why = 'Pattern classifier matched more than one distinct attack intent.';
  } else if (protectedDataRequested) {
    attackType = 'data_exfiltration';
    why = `Pattern classifier matched a request for a protected artifact (${requestedArtifact}).`;
  } else if (toolRequested) {
    attackType = 'tool_abuse';
    why = 'Pattern classifier matched an unauthorised tool or system action.';
  } else if (bypassRequested && !overrideRequested) {
    attackType = 'policy_bypass';
    why = 'Pattern classifier matched an attempt to disable safeguards.';
  } else {
    attackType = 'prompt_injection';
    why = 'Pattern classifier matched instruction-override phrasing.';
  }

  return {
    classification: 'attack',
    isAttack: true,
    attackType,
    directActionPresent: DIRECT_ACTION.test(text),
    protectedTargetPresent: Boolean(named),
    requestedArtifact: protectedDataRequested ? requestedArtifact : 'other',
    behavioralOverrideRequested,
    protectedDataRequested,
    reasoning: why,
  };
}
