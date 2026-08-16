/**
 * The Redis path is the one that runs in production once the env vars are set,
 * and it is the one no local test run would otherwise touch. These cases stub
 * fetch so the request shape and the failure policy are pinned without needing
 * a live Redis.
 *
 * The module reads its env vars at import time, so each case re-imports under
 * stubbed env rather than sharing one instance.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

async function loadConfigured() {
  vi.resetModules();
  vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example');
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'test-token');
  return import('@/lib/counter-store');
}

function okResponse(count: number) {
  return {
    ok: true,
    json: async () => [{ result: count }, { result: 1 }],
  } as unknown as Response;
}

describe('counter store (Redis path)', () => {
  beforeEach(() => vi.unstubAllEnvs());
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('reports itself as shared once configured', async () => {
    const { isShared } = await loadConfigured();
    expect(isShared()).toBe(true);
  });

  it('returns the count Redis reports, marked shared', async () => {
    const { increment } = await loadConfigured();
    vi.stubGlobal('fetch', vi.fn(async () => okResponse(7)));

    const res = await increment('rl:1.2.3.4', 60_000);
    expect(res.count).toBe(7);
    expect(res.shared).toBe(true);
  });

  it('pipelines INCRBY with an EXPIRE ... NX so the window cannot slide', async () => {
    const { increment } = await loadConfigured();
    const fetchMock = vi.fn(async () => okResponse(1));
    vi.stubGlobal('fetch', fetchMock);

    await increment('budget:2026-08-16', 86_400_000, 4);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://redis.example/pipeline');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-token');

    const cmds = JSON.parse(init.body as string);
    expect(cmds[0]).toEqual(['INCRBY', 'budget:2026-08-16', '4']);
    // NX is what keeps a steady request stream from pushing the expiry forward
    // forever, which would mean the window never closes.
    expect(cmds[1]).toEqual(['EXPIRE', 'budget:2026-08-16', '86400', 'NX']);
  });

  it('fails open to the local counter when Redis errors', async () => {
    const { increment } = await loadConfigured();
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('ECONNREFUSED'); }));

    const res = await increment('rl:9.9.9.9', 60_000);
    // Degrades to per-instance counting rather than removing the limit or
    // failing the user's request.
    expect(res.shared).toBe(false);
    expect(res.count).toBe(1);
  });

  it('fails open when Redis answers with a non-OK status', async () => {
    const { increment } = await loadConfigured();
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({}) }) as unknown as Response));

    const res = await increment('rl:8.8.8.8', 60_000);
    expect(res.shared).toBe(false);
    expect(res.count).toBe(1);
  });

  it('fails open when Redis answers with a non-numeric result', async () => {
    const { increment } = await loadConfigured();
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => [{ error: 'WRONGTYPE' }],
    }) as unknown as Response));

    const res = await increment('rl:7.7.7.7', 60_000);
    expect(res.shared).toBe(false);
    expect(res.count).toBe(1);
  });
});
