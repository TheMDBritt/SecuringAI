/**
 * The key link.
 *
 * One URL that signs a browser in on arrival, for a machine where getting a
 * password into a form is not possible. It is a bearer credential, so the two
 * things that matter are that it works and that it does not linger: the
 * parameter has to leave the address bar immediately, including when sign-in
 * fails, or it sits in the visible URL and in the history entry left behind.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const ENV = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'pk_test',
};

/** URL-safe base64 of "email:password", the shape the link carries. */
const encode = (email: string, password: string) =>
  Buffer.from(`${email}:${password}`).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

let replaced: string[] = [];

function installBrowser(search: string) {
  const store = new Map<string, string>();
  replaced = [];
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    },
    location: { search, pathname: '/dashboard', hash: '' },
    history: { replaceState: (_a: unknown, _b: unknown, url: string) => replaced.push(url) },
  });
  vi.stubGlobal('atob', (b64: string) => Buffer.from(b64, 'base64').toString('binary'));
  return store;
}

const token = { access_token: 'a', refresh_token: 'r', expires_in: 3600, user: { email: 'me@example.com' } };
const okFetch = () => vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => token })));
const failFetch = () => vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 400 })));

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', ENV.NEXT_PUBLIC_SUPABASE_URL);
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', ENV.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  vi.resetModules();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('detecting a key link', () => {
  it('recognises one', async () => {
    installBrowser(`?k=${encode('me@example.com', 'pw')}`);
    const { hasCredentialLink } = await import('@/lib/sync-client');
    expect(hasCredentialLink()).toBe(true);
  });

  it('ignores an ordinary URL', async () => {
    installBrowser('?section=quiz');
    const { hasCredentialLink } = await import('@/lib/sync-client');
    expect(hasCredentialLink()).toBe(false);
  });

  it('does not throw where there is no location', async () => {
    // startAutoSync calls this before anything else, so an unguarded read took
    // the entire sync path down rather than merely skipping the link.
    vi.stubGlobal('window', { localStorage: {} });
    const { hasCredentialLink } = await import('@/lib/sync-client');
    expect(() => hasCredentialLink()).not.toThrow();
    expect(hasCredentialLink()).toBe(false);
  });
});

describe('consuming a key link', () => {
  it('signs in and stores the session', async () => {
    const store = installBrowser(`?k=${encode('me@example.com', 'hunter22')}`);
    okFetch();
    const { consumeCredentialLink } = await import('@/lib/sync-client');

    const session = await consumeCredentialLink();
    expect(session?.accessToken).toBe('a');
    expect(store.get('securingai:sync-session:v1')).toContain('"accessToken":"a"');
  });

  it('sends the decoded credential, not the encoded blob', async () => {
    installBrowser(`?k=${encode('me@example.com', 'hunter22')}`);
    const fetchMock = vi.fn(async () => ({ ok: true, status: 200, json: async () => token }));
    vi.stubGlobal('fetch', fetchMock);
    const { consumeCredentialLink } = await import('@/lib/sync-client');
    await consumeCredentialLink();

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ email: 'me@example.com', password: 'hunter22' });
  });

  it('strips the key from the address bar', async () => {
    installBrowser(`?k=${encode('me@example.com', 'pw')}`);
    okFetch();
    const { consumeCredentialLink } = await import('@/lib/sync-client');
    await consumeCredentialLink();

    expect(replaced).toHaveLength(1);
    expect(replaced[0]).not.toContain('k=');
    expect(replaced[0]).toBe('/dashboard');
  });

  it('keeps the other query parameters', async () => {
    installBrowser(`?section=quiz&k=${encode('me@example.com', 'pw')}`);
    okFetch();
    const { consumeCredentialLink } = await import('@/lib/sync-client');
    await consumeCredentialLink();
    expect(replaced[0]).toBe('/dashboard?section=quiz');
  });

  it('strips the key even when sign-in fails', async () => {
    // The important one. A wrong or stale link must not leave the credential
    // sitting in the URL for whoever uses the machine next.
    installBrowser(`?k=${encode('me@example.com', 'wrong')}`);
    failFetch();
    const { consumeCredentialLink } = await import('@/lib/sync-client');

    await expect(consumeCredentialLink()).resolves.toBeNull();
    expect(replaced[0]).not.toContain('k=');
  });

  it('returns null rather than throwing on a corrupt key', async () => {
    installBrowser('?k=not-valid-base64!!!');
    okFetch();
    const { consumeCredentialLink } = await import('@/lib/sync-client');
    await expect(consumeCredentialLink()).resolves.toBeNull();
  });

  it('rejects a key with no password half', async () => {
    installBrowser(`?k=${Buffer.from('me@example.com').toString('base64')}`);
    okFetch();
    const { consumeCredentialLink } = await import('@/lib/sync-client');
    await expect(consumeCredentialLink()).resolves.toBeNull();
  });

  it('does nothing on a URL without a key', async () => {
    installBrowser('?section=quiz');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { consumeCredentialLink } = await import('@/lib/sync-client');

    await expect(consumeCredentialLink()).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(replaced).toHaveLength(0);
  });
});
