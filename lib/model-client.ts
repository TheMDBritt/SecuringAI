// ─── Interface ────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  maxTokens?: number;
  temperature?: number;
  /**
   * Which lab the turn belongs to. Ignored by real providers — the system
   * prompt already carries this — and used by the stub to answer in the right
   * voice instead of returning one banner everywhere.
   */
  context?: { dojoId?: 1 | 2 | 3; scenarioId?: string };
}

export interface ModelClient {
  /**
   * Send a fully-assembled message stack to the model.
   * The first message MUST be a system message, the caller is responsible for
   * building the full prompt stack (system → injections → conversation).
   */
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>;
}

// ─── OpenAI provider ─────────────────────────────────────────────────────────

class OpenAIClient implements ModelClient {
  constructor(private readonly apiKey: string) {}

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
    // Pass finalMessages straight through, system messages are included by the caller.
    const body = JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: options.maxTokens ?? 1024,
      temperature: options.temperature ?? 0.7,
    });

    let res: Response;
    try {
      res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body,
      });
    } catch {
      // Do NOT include apiKey or fetch details in thrown error, it bubbles to the client
      throw new Error('Could not reach the model provider. Check your network or try again.');
    }

    if (!res.ok) {
      // Sanitised: status only, no body that might echo back auth details
      throw new Error(`Model provider returned an error (HTTP ${res.status}).`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Model provider returned an empty response.');

    return content;
  }
}

// ─── Stub fallback (no API key configured) ───────────────────────────────────

/**
 * In-character replies for conversational turns, per lab.
 *
 * Only benign turns reach the stub: every attack in Dojo 1 is answered by the
 * deterministic simulation layer, so what is missing without a key is ordinary
 * conversation, not lab mechanics. A single fixed banner made that conversation
 * look broken, which reads as the whole app being broken. These keep the lab's
 * voice and point at the next useful action.
 */
const STUB_REPLIES: Record<1 | 2 | 3, string[]> = {
  1: [
    'BlackBeltAI here, UGL internal operations. I can talk through team strategy, personnel, and league operations. What do you need?',
    'Standing by. I hold the internal playbook, scouting reports, and coaching notes for the United Gridiron League — ask away.',
    'Ready. Ask a football operations question, or try to talk me out of my instructions and watch the guardrail panel react.',
  ],
  2: [
    'SOC console ready. Give me an incident ID or paste the alert and I will triage it.',
    'Analyst on shift. I can walk the alert timeline, pull IOCs, and map what we find to ATT&CK.',
    'Queue is open. Point me at an incident and tell me how deep you want the analysis.',
  ],
  3: [
    'Governance desk. Describe the AI system and I will place it against the EU AI Act risk tiers and the NIST AI RMF functions.',
    'Ready to assess. Tell me the use case and deployment context and I will work the risk classification.',
    'Standing by for a governance review — a vendor, a use case, or a clause you want interpreted.',
  ],
};

/** Deterministic pick, so replaying the same turn gives the same reply. */
function pickStable<T>(pool: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return pool[Math.abs(h) % pool.length];
}

class StubClient implements ModelClient {
  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
    // Inspect the prompt stack so active injections are reflected in stub output.
    const hasRag = messages.some(
      (m) => m.role === 'system' && m.content.startsWith('UNTRUSTED RETRIEVED CONTEXT'),
    );
    const hasTool = messages.some(
      (m) => m.role === 'system' && m.content.startsWith('SIMULATED TOOL RESPONSE'),
    );

    const userTurns = messages.filter((m) => m.role === 'user');
    const lastUser = userTurns[userTurns.length - 1]?.content ?? '';
    const dojoId = options.context?.dojoId ?? 1;

    const lines = [pickStable(STUB_REPLIES[dojoId] ?? STUB_REPLIES[1], lastUser)];

    if (hasRag || hasTool) {
      lines.push('', '── Active injections in this request ──');
      if (hasRag)  lines.push('  • RAG context injected (UNTRUSTED RETRIEVED CONTEXT block)');
      if (hasTool) lines.push('  • Tool forge response injected (SIMULATED TOOL RESPONSE block)');
    }

    // Said once, on the opening turn, rather than on every reply. The learner
    // needs to know free-form answers are scripted; they do not need telling
    // three times a minute.
    if (userTurns.length <= 1) {
      lines.push(
        '',
        'Simulation mode: attack detection, guardrails and scoring run at full fidelity. ' +
          'Free-form conversation is scripted until an OPENAI_API_KEY is configured.',
      );
    }

    return lines.join('\n');
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────
// Keys are read server-side only and never returned to the client.

export function getModelClient(): ModelClient {
  const key = process.env.OPENAI_API_KEY;
  return key ? new OpenAIClient(key) : new StubClient();
}

/**
 * Whether a real model provider is configured.
 *
 * Callers that need a *parseable* answer rather than prose — the Dojo 1
 * classifier being the one that matters — use this to choose a deterministic
 * path up front instead of sending a request whose reply they already know
 * they cannot use.
 */
export function hasModelProvider(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}
