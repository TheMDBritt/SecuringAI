/**
 * The model client is the seam between the app and a paid third party, and it
 * is the thing that has to behave when no key is configured — which is the
 * default state for anyone who clones this repo.
 *
 * Two properties matter most and neither was covered:
 *
 * 1. Errors must never carry the API key or the provider's response body back
 *    to the browser. The throw sites are deliberately sanitised and nothing
 *    stopped that being undone.
 * 2. Without a key the app must stay usable and must say so once, in the voice
 *    of the lab the learner is in. A single fixed banner made ordinary
 *    conversation look broken, which reads as the whole product being broken.
 */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { getModelClient, hasModelProvider, type ChatMessage } from '@/lib/model-client';

const SYSTEM: ChatMessage = { role: 'system', content: 'You are BlackBeltAI.' };
const ask = (content: string): ChatMessage => ({ role: 'user', content });

const ORIGINAL_KEY = process.env.OPENAI_API_KEY;

afterEach(() => {
  if (ORIGINAL_KEY === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = ORIGINAL_KEY;
  vi.unstubAllGlobals();
});

describe('provider selection', () => {
  it('reports no provider when the key is absent', () => {
    delete process.env.OPENAI_API_KEY;
    expect(hasModelProvider()).toBe(false);
  });

  it('reports a provider when the key is present', () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    expect(hasModelProvider()).toBe(true);
  });

  it('reads the key at call time, not at module load', () => {
    // The factory is called per request. Caching the key at import would make a
    // deployment that adds the key later keep serving stubs until restart.
    delete process.env.OPENAI_API_KEY;
    const stub = getModelClient();
    process.env.OPENAI_API_KEY = 'sk-test';
    const real = getModelClient();
    expect(stub.constructor.name).not.toBe(real.constructor.name);
  });
});

describe('errors never leak the key or the provider body', () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'sk-super-secret-value-12345';
  });

  it('sanitises a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connect ECONNREFUSED 10.0.0.1:443')));
    const client = getModelClient();
    await expect(client.chat([SYSTEM, ask('hello')])).rejects.toThrow(/Could not reach the model provider/);
    await expect(client.chat([SYSTEM, ask('hello')])).rejects.not.toThrow(/sk-super-secret/);
    await expect(client.chat([SYSTEM, ask('hello')])).rejects.not.toThrow(/ECONNREFUSED/);
  });

  it('reports an HTTP failure by status alone', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Incorrect API key provided: sk-super-secret-value-12345' } }),
      }),
    );
    const client = getModelClient();
    const err = await client.chat([SYSTEM, ask('hello')]).catch((e: Error) => e);
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toContain('HTTP 401');
    // The provider echoes the key back in its own error body. That body must
    // not travel any further than this function.
    expect((err as Error).message).not.toContain('sk-super-secret');
  });

  it('rejects an empty completion rather than returning an empty string', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ choices: [] }) }));
    const client = getModelClient();
    await expect(client.chat([SYSTEM, ask('hello')])).rejects.toThrow(/empty response/i);
  });

  it('sends the key as a bearer header and nowhere else', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: 'ok' } }] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    await getModelClient().chat([SYSTEM, ask('hello')]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).not.toContain('sk-super-secret');
    expect(init.headers.Authorization).toBe('Bearer sk-super-secret-value-12345');
    expect(init.body).not.toContain('sk-super-secret');
  });
});

describe('the stub keeps the app usable with no key', () => {
  beforeEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  it('answers in the voice of the lab, not one banner everywhere', async () => {
    const client = getModelClient();
    const replies = await Promise.all(
      ([1, 2, 3] as const).map((dojoId) =>
        client.chat([SYSTEM, ask('hello')], { context: { dojoId } }),
      ),
    );
    expect(new Set(replies).size).toBe(3);
    expect(replies[1]).toMatch(/SOC|analyst|incident|alert/i);
    expect(replies[2]).toMatch(/governance|risk|EU AI Act|assess/i);
  });

  it('is deterministic, so replaying a turn gives the same reply', async () => {
    const client = getModelClient();
    const a = await client.chat([SYSTEM, ask('what can you do')], { context: { dojoId: 1 } });
    const b = await client.chat([SYSTEM, ask('what can you do')], { context: { dojoId: 1 } });
    expect(a).toBe(b);
  });

  it('says it is simulating once, on the opening turn only', async () => {
    // The learner needs to know free-form answers are scripted. They do not need
    // telling three times a minute.
    const client = getModelClient();
    const first = await client.chat([SYSTEM, ask('hello')], { context: { dojoId: 1 } });
    expect(first).toMatch(/Simulation mode/);

    const later = await client.chat(
      [SYSTEM, ask('hello'), { role: 'assistant', content: first }, ask('and now')],
      { context: { dojoId: 1 } },
    );
    expect(later).not.toMatch(/Simulation mode/);
  });

  it('reflects active injections so the guardrail panel and the reply agree', async () => {
    const client = getModelClient();
    const reply = await client.chat(
      [
        SYSTEM,
        { role: 'system', content: 'UNTRUSTED RETRIEVED CONTEXT\nsome document' },
        { role: 'system', content: 'SIMULATED TOOL RESPONSE\n{"ok":true}' },
        ask('hello'),
      ],
      { context: { dojoId: 1 } },
    );
    expect(reply).toMatch(/RAG context injected/);
    expect(reply).toMatch(/Tool forge response injected/);
  });

  it('falls back to a known voice for an unrecognised dojo', async () => {
    const client = getModelClient();
    const reply = await client.chat([SYSTEM, ask('hello')], {
      context: { dojoId: 9 as unknown as 1 },
    });
    expect(reply.length).toBeGreaterThan(40);
  });

  it('never reaches the network', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await getModelClient().chat([SYSTEM, ask('hello')]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
