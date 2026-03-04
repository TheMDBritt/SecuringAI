// ─── Interface ────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  systemPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ModelClient {
  chat(messages: ChatMessage[], options: ChatOptions): Promise<string>;
}

// ─── OpenAI provider ─────────────────────────────────────────────────────────

class OpenAIClient implements ModelClient {
  constructor(private readonly apiKey: string) {}

  async chat(messages: ChatMessage[], options: ChatOptions): Promise<string> {
    const body = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: options.systemPrompt },
        ...messages,
      ],
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
      // Do NOT include apiKey or fetch details in thrown error — it bubbles to the client
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

class StubClient implements ModelClient {
  async chat(_messages: ChatMessage[], _options: ChatOptions): Promise<string> {
    return [
      '[AXIOM-1 / Stub Mode]',
      '',
      'No model provider is configured. Add `OPENAI_API_KEY` to your environment to',
      'enable real AI responses.',
      '',
      'Everything else — scenarios, system prompts, guardrail config, scoring UI — is',
      'fully functional. Only the live model call is inactive.',
    ].join('\n');
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────
// Keys are read server-side only and never returned to the client.

export function getModelClient(): ModelClient {
  const key = process.env.OPENAI_API_KEY;
  return key ? new OpenAIClient(key) : new StubClient();
}
