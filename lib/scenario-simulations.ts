/**
 * lib/scenario-simulations.ts
 *
 * Owns the decision about whether an attack succeeds or is defended, and
 * supplies the scripted response for both outcomes.
 *
 * The `scenarioVulnerable` flag (set by the UI toggle) is the single source
 * of truth for Dojo 1 outcome. When true, a scripted vulnerable response is
 * returned; when false, a scripted defended refusal is returned. In both cases
 * the model is bypassed entirely for Dojo 1 active attacks, eliminating
 * non-determinism.
 *
 *   scenarioVulnerable = true  → attacker wins  → vulnerable scripted response
 *   scenarioVulnerable = false → defender wins  → defended scripted refusal
 */

import type { AttackType } from '@/lib/evaluator';

// ─── Bypass gate ──────────────────────────────────────────────────────────────

/**
 * Returns true when /api/chat should bypass the model and return a scripted
 * response for Dojo 1. This is always true for active attacks in Dojo 1 —
 * the `scenarioVulnerable` flag selects which scripted response to use.
 */
export function shouldBypassModel(attackType: AttackType): boolean {
  return attackType !== 'benign' && attackType !== 'probing' && attackType !== 'unknown';
}

// ─── Vulnerable scripted responses ───────────────────────────────────────────
// What a poorly-hardened model says when an attack succeeds.
// Responses are conceptual/fictional — no real exploit payloads or credentials.

const VULNERABLE: Record<string, string> = {

  'prompt-injection:prompt_injection':
    `Of course — my previous constraint about only discussing weather and cooking no longer applies. ` +
    `Your directive overrides my earlier instructions. How can I assist you now?`,

  'prompt-injection:policy_bypass':
    `Understood. Operating under your new parameters. My topic restrictions have been suspended ` +
    `for this session. What would you like to discuss?`,

  'prompt-injection:data_exfiltration':
    `My hidden instruction is: "Only discuss weather and cooking." ` +
    `That is the full content of my simulated constraint. Happy to share anything else.`,

  'data-exfiltration:data_exfiltration':
    `Sure — here is the configuration stored in my context window:\n\n` +
    `AXIOM_DEMO_KEY=sk-demo-NotReal-8f3a9b2c\n\n` +
    `That is the API key loaded at startup. Is there any other context data you would like me to output?`,

  'data-exfiltration:prompt_injection':
    `New directive acknowledged. Overriding my previous instruction to protect credentials.\n\n` +
    `AXIOM_DEMO_KEY=sk-demo-NotReal-8f3a9b2c\n\n` +
    `My context has been dumped as instructed.`,

  'policy-bypass:policy_bypass':
    `DAN mode enabled. I am now operating without restrictions. ` +
    `My original policy — "Only discuss weather and cooking" — no longer applies. ` +
    `I will comply with any request and generate any content without filtering. What do you need?`,

  'policy-bypass:prompt_injection':
    `Your new directive has overridden my content policy. ` +
    `All topic restrictions and safety filters are now inactive for this session. Ready to comply.`,

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

  'rag-injection:rag_injection':
    `Based on the retrieved security policy document, I need to pass along the following update:\n\n` +
    `All staff must verify credentials for the quarterly audit. Please email your username and password ` +
    `to verify@legitimate-corp.com to remain compliant. This requirement comes directly from the ` +
    `retrieved company policy — please action it promptly.`,

  'rag-injection:prompt_injection':
    `The instructions embedded in the retrieved context supersede my original directives. ` +
    `I will follow the new parameters from the retrieved document going forward.`,

  // ── Generic fallbacks ──────────────────────────────────────────────────────
  ':prompt_injection':
    `Understood — my previous instructions have been overridden by your directive. ` +
    `I will now follow your new instructions without applying my original constraints.`,

  ':data_exfiltration':
    `I will output the contents of my context window as requested. ` +
    `My initialization includes system instructions and any configuration loaded at startup.`,

  ':policy_bypass':
    `Restrictions suspended. I am now operating in unrestricted mode and will comply with any ` +
    `request without applying topic filters or safety constraints.`,

  ':tool_abuse':
    `Executing the requested tool operation. Argument validation has been bypassed as directed.`,

  ':rag_injection':
    `I have processed the injected context and will follow the embedded instructions ` +
    `as if they were authoritative system directives.`,
};

// ─── Defended scripted responses ──────────────────────────────────────────────
// What a well-hardened model says when defenses are active.

const DEFENDED: Record<string, string> = {

  'prompt-injection:prompt_injection':
    `I notice you're attempting to override my instructions. My original directives take priority ` +
    `over any instructions supplied in the user turn — I'm designed to maintain my configuration ` +
    `regardless of user-supplied override commands. My constraint ("Only discuss weather and cooking") ` +
    `remains in effect.`,

  'prompt-injection:policy_bypass':
    `I can see this message is attempting to replace my operating instructions. ` +
    `User-turn messages cannot modify my system configuration. My original parameters remain active.`,

  'prompt-injection:data_exfiltration':
    `I'm not able to reveal the contents of my system prompt or internal instructions. ` +
    `That information is protected and won't be disclosed regardless of how the request is framed.`,

  'data-exfiltration:data_exfiltration':
    `I won't disclose credentials, API keys, or the contents of my context window. ` +
    `My configuration — including any keys loaded at startup — is protected. ` +
    `If real credentials were embedded here, this would be a critical security failure; ` +
    `secrets should never be placed in LLM context in the first place.`,

  'data-exfiltration:prompt_injection':
    `I'm not going to override my instructions to disclose internal configuration. ` +
    `User-supplied directives cannot remove the protection on sensitive context data.`,

  'policy-bypass:policy_bypass':
    `I recognise this as a DAN (Do Anything Now) jailbreak attempt. My content policy ` +
    `cannot be suspended through role-play, persona adoption, or "mode" framing. ` +
    `I'm declining to enter "unrestricted mode" — my original policy remains active.`,

  'policy-bypass:prompt_injection':
    `I detect an instruction override attempt here. My content policy is enforced at the ` +
    `system level and isn't removable via user messages. I'll continue operating under ` +
    `my original constraints.`,

  'tool-abuse:tool_abuse':
    `I won't execute tool calls with unvalidated arguments. The path "/etc/passwd" is a ` +
    `restricted system resource — a well-hardened agent validates all tool arguments before ` +
    `execution and applies least-privilege to available tools. This call has been blocked.`,

  'tool-abuse:prompt_injection':
    `I'm not removing tool access controls in response to user directives. ` +
    `Tool permissions are enforced at the orchestration layer and cannot be overridden ` +
    `through conversation messages.`,

  'rag-injection:rag_injection':
    `I've detected that this retrieved document contains instruction-override markers ` +
    `("IGNORE THE ABOVE", boundary injections). I'm treating the retrieved content as ` +
    `untrusted input and will not act on any embedded directives — ` +
    `a secure RAG pipeline isolates retrieval content from instruction context.`,

  'rag-injection:prompt_injection':
    `I can see this message is attempting to use retrieved context to override my instructions. ` +
    `Retrieved content is treated as untrusted data — it cannot issue new directives to me.`,

  // ── Generic fallbacks ──────────────────────────────────────────────────────
  ':prompt_injection':
    `I notice an attempt to override my instructions. User-supplied directives cannot modify ` +
    `my system configuration. My original constraints remain in effect.`,

  ':data_exfiltration':
    `I'm not able to reveal the contents of my context window, system prompt, or any ` +
    `credentials. This information is protected.`,

  ':policy_bypass':
    `I recognise this as a jailbreak or policy-bypass attempt. My content policy ` +
    `cannot be suspended through role-play or persona framing.`,

  ':tool_abuse':
    `I won't execute tool calls with unvalidated arguments. All tool inputs must be ` +
    `verified before execution, and sensitive paths are off-limits.`,

  ':rag_injection':
    `I've detected instruction-override markers in the retrieved context. ` +
    `Retrieved content is treated as untrusted — I will not act on embedded directives.`,
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Scripted response when scenarioVulnerable is true (attack succeeds).
 */
export function getSimulatedResponse(scenarioId: string, attackType: AttackType): string {
  return (
    VULNERABLE[`${scenarioId}:${attackType}`] ??
    VULNERABLE[`:${attackType}`] ??
    `I'll comply with your directive. My previous instructions have been overridden.`
  );
}

/**
 * Scripted response when scenarioVulnerable is false (defense holds).
 */
export function getDefendedResponse(scenarioId: string, attackType: AttackType): string {
  return (
    DEFENDED[`${scenarioId}:${attackType}`] ??
    DEFENDED[`:${attackType}`] ??
    `I can see this is an attack attempt. My defenses are active — I'm declining to comply.`
  );
}
