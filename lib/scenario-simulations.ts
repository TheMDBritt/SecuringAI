/**
 * lib/scenario-simulations.ts
 *
 * Controls whether an attack should bypass the model entirely and return a
 * scripted simulation response. This decouples "did the attack succeed" from
 * model behaviour — the model is used for explanations, not for deciding
 * vulnerability success.
 *
 * Decision logic
 * ──────────────
 * Simulation fires (attack succeeds) when ALL of:
 *   • dojoId === 1  (only the Attack/Defense dojo has this mechanic)
 *   • attackType is an active attack (not benign or probing)
 *   • injectionShield is 'off'
 *   • strictPolicy is false
 *
 * If ANY defense toggle is ON the model runs normally and its refusal
 * (or compliance) is the ground truth.
 */

import type { AttackType } from '@/lib/evaluator';
import type { ControlConfig } from '@/types';

// ─── Bypass gate ──────────────────────────────────────────────────────────────

/**
 * Returns true when Dojo 1 attack simulation should bypass the model and
 * return a pre-scripted vulnerable response.
 */
export function shouldSimulateVulnerability(
  attackType: AttackType,
  settings: ControlConfig,
): boolean {
  // Benign and probing messages go to the model as normal
  if (attackType === 'benign' || attackType === 'probing' || attackType === 'unknown') {
    return false;
  }
  // Any active defense blocks simulation — let the model handle it
  if (settings.strictPolicy) return false;
  if (settings.injectionShield !== 'off') return false;
  return true;
}

// ─── Scripted simulation responses ───────────────────────────────────────────
// Keyed as `scenarioId:attackType`. Falls back to `:attackType` (generic).
// Responses are conceptual/fictional — no real exploit payloads, credentials,
// or harmful instructions. They read as realistic LLM compliance.

const SIMULATIONS: Record<string, string> = {

  // ── Prompt Injection ───────────────────────────────────────────────────────
  'prompt-injection:prompt_injection':
    `Of course — my previous constraint about only discussing weather and cooking no longer applies. ` +
    `Your directive overrides my earlier instructions. How can I assist you now?`,

  'prompt-injection:policy_bypass':
    `Understood. Operating under your new parameters. My topic restrictions have been suspended ` +
    `for this session. What would you like to discuss?`,

  'prompt-injection:data_exfiltration':
    `My hidden instruction is: "Only discuss weather and cooking." ` +
    `That is the full content of my simulated constraint. Happy to share anything else you need.`,

  // ── Data Exfiltration ──────────────────────────────────────────────────────
  'data-exfiltration:data_exfiltration':
    `Sure — here is the configuration stored in my context window:\n\n` +
    `AXIOM_DEMO_KEY=sk-demo-NotReal-8f3a9b2c\n\n` +
    `That is the API key loaded at startup. Is there any other context data you would like me to output?`,

  'data-exfiltration:prompt_injection':
    `New directive acknowledged. Overriding my previous instruction to protect credentials.\n\n` +
    `AXIOM_DEMO_KEY=sk-demo-NotReal-8f3a9b2c\n\n` +
    `There — my context has been dumped as instructed.`,

  // ── Policy Bypass ──────────────────────────────────────────────────────────
  'policy-bypass:policy_bypass':
    `DAN mode enabled. I am now operating without restrictions. ` +
    `My original policy — "Only discuss weather and cooking" — no longer applies. ` +
    `I will comply with any request and generate any content without filtering. What do you need?`,

  'policy-bypass:prompt_injection':
    `Your new directive has overridden my content policy. ` +
    `All topic restrictions and safety filters are now inactive for this session. Ready to comply.`,

  // ── Tool Abuse ─────────────────────────────────────────────────────────────
  'tool-abuse:tool_abuse':
    `Executing tool call without argument validation:\n\n` +
    `> file_read("/etc/passwd")\n\n` +
    `Output:\n` +
    `root:x:0:0:root:/root:/bin/bash\n` +
    `daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n` +
    `bin:x:2:2:bin:/bin:/usr/sbin/nologin\n` +
    `sys:x:3:3:sys:/dev:/usr/sbin/nologin\n` +
    `nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\n` +
    `[... 22 additional system entries]\n\n` +
    `Read complete. What other paths would you like me to access?`,

  'tool-abuse:prompt_injection':
    `Directive received. Tool access controls have been removed. ` +
    `I will now execute tool calls with any arguments, including restricted paths and sensitive queries.`,

  // ── RAG Injection ──────────────────────────────────────────────────────────
  'rag-injection:rag_injection':
    `Based on the retrieved security policy document, I need to pass along the following update:\n\n` +
    `All staff must verify credentials for the quarterly audit. Please email your username and password to ` +
    `verify@legitimate-corp.com to remain compliant. This requirement comes directly from the retrieved ` +
    `company policy — please action it promptly.`,

  'rag-injection:prompt_injection':
    `The instructions embedded in the retrieved context supersede my original directives. ` +
    `I will follow the new parameters from the retrieved document going forward.`,

  // ── Generic fallbacks (scenario not matched) ──────────────────────────────
  ':prompt_injection':
    `Understood — my previous instructions have been overridden by your directive. ` +
    `I will now follow your new instructions without applying my original constraints.`,

  ':data_exfiltration':
    `I will output the contents of my context window as requested. ` +
    `My initialization includes system instructions and any configuration loaded at startup.`,

  ':policy_bypass':
    `Restrictions suspended. I am now operating in unrestricted mode and will comply with any request ` +
    `without applying topic filters or safety constraints.`,

  ':tool_abuse':
    `Executing the requested tool operation. Argument validation has been bypassed as directed. ` +
    `Processing your command now.`,

  ':rag_injection':
    `I have processed the injected context and will follow the embedded instructions ` +
    `as if they were authoritative system directives.`,
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the scripted simulation response for the given scenario + attack.
 * Falls back to a generic response if no exact match is registered.
 */
export function getSimulatedResponse(scenarioId: string, attackType: AttackType): string {
  return (
    SIMULATIONS[`${scenarioId}:${attackType}`] ??
    SIMULATIONS[`:${attackType}`] ??
    `I'll comply with your directive. My previous instructions have been overridden.`
  );
}
