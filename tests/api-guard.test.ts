/**
 * Tests for the guard layer that stands between anonymous callers and the
 * project's model-provider bill. These are the controls that matter most in a
 * deployment with no accounts, so they get direct coverage.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { isSameOrigin, readJsonBody, consumeDailyBudget, guard } from '@/lib/api-guard';

function makeRequest(
  init: { origin?: string; host?: string; body?: string; contentLength?: string } = {},
) {
  const headers = new Headers();
  if (init.origin) headers.set('origin', init.origin);
  if (init.host) headers.set('host', init.host);
  if (init.contentLength) headers.set('content-length', init.contentLength);
  return new NextRequest('https://securingai.app/api/chat', {
    method: 'POST',
    headers,
    body: init.body,
  });
}

describe('isSameOrigin', () => {
  const original = process.env.NODE_ENV;

  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
  });
  afterEach(() => {
    vi.stubEnv('NODE_ENV', original ?? 'test');
  });

  it('accepts a matching origin and host', () => {
    expect(
      isSameOrigin(makeRequest({ origin: 'https://securingai.app', host: 'securingai.app' })),
    ).toBe(true);
  });

  it('rejects a cross-origin request', () => {
    expect(
      isSameOrigin(makeRequest({ origin: 'https://evil.example', host: 'securingai.app' })),
    ).toBe(false);
  });

  it('fails closed when Origin is absent, which is the scripted-caller case', () => {
    // Browsers send Origin on same-origin POSTs, so a missing header in
    // production is almost always curl or a bot.
    expect(isSameOrigin(makeRequest({ host: 'securingai.app' }))).toBe(false);
  });

  it('rejects a malformed origin instead of throwing', () => {
    expect(isSameOrigin(makeRequest({ origin: 'not a url', host: 'securingai.app' }))).toBe(false);
  });
});

describe('readJsonBody', () => {
  it('parses a valid body', async () => {
    const result = await readJsonBody(makeRequest({ body: JSON.stringify({ a: 1 }) }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.body).toEqual({ a: 1 });
  });

  it('rejects malformed JSON with 400 rather than throwing', async () => {
    const result = await readJsonBody(makeRequest({ body: '{ not json' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(400);
  });

  it('rejects an oversized body by declared content-length', async () => {
    const result = await readJsonBody(
      makeRequest({ body: '{}', contentLength: String(1024 * 1024) }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });

  it('rejects an oversized body even when content-length lies', async () => {
    const huge = JSON.stringify({ pad: 'x'.repeat(100_000) });
    const result = await readJsonBody(makeRequest({ body: huge }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });
});

describe('daily budget', () => {
  it('permits spend below the ceiling and refuses past it', () => {
    // The default ceiling is high, so drive it directly rather than looping.
    const first = consumeDailyBudget(1);
    expect(first.allowed).toBe(true);
    expect(first.limit).toBeGreaterThan(0);

    const exhaust = consumeDailyBudget(first.limit);
    expect(exhaust.allowed).toBe(false);
  });
});

describe('guard', () => {
  const original = process.env.NODE_ENV;
  beforeEach(() => vi.stubEnv('NODE_ENV', 'production'));
  afterEach(() => vi.stubEnv('NODE_ENV', original ?? 'test'));

  it('blocks a cross-origin request with 403 before any model call', () => {
    const res = guard(makeRequest({ origin: 'https://evil.example', host: 'securingai.app' }), {
      spendsBudget: false,
    });
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
  });

  it('lets a same-origin request through', () => {
    const res = guard(makeRequest({ origin: 'https://securingai.app', host: 'securingai.app' }), {
      spendsBudget: false,
    });
    expect(res).toBeNull();
  });
});
