/**
 * What the sign-in form is allowed to tell you.
 *
 * Two competing requirements. The form must not become a membership oracle:
 * sign-up is closed to one address, and a message that distinguished "not
 * allowlisted" from "sent" would let anyone enumerate who has access. But the
 * hourly email quota is a different kind of failure, and answering it with
 * "check the address" sends someone to fix something that was never wrong,
 * while every retry pushes the quota further out.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const ENV = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'pk_test',
};

let requestMagicLink: typeof import('@/lib/sync-client').requestMagicLink;

beforeEach(async () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', ENV.NEXT_PUBLIC_SUPABASE_URL);
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', ENV.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  vi.resetModules();
  ({ requestMagicLink } = await import('@/lib/sync-client'));
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const respond = (status: number) =>
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: status < 400, status })));

describe('requestMagicLink', () => {
  it('resolves when the link was sent', async () => {
    respond(200);
    await expect(requestMagicLink('a@b.c', 'https://app/settings?sync=1')).resolves.toBeUndefined();
  });

  it('names the rate limit so the user waits instead of retrying', async () => {
    respond(429);
    await expect(requestMagicLink('a@b.c', 'https://app/settings?sync=1')).rejects.toThrow(/wait about an hour/i);
  });

  it('does not blame the address for a rate limit', async () => {
    respond(429);
    await expect(requestMagicLink('a@b.c', 'https://app/settings?sync=1')).rejects.not.toThrow(/check the address/i);
  });

  it('stays vague about every other failure', async () => {
    // 400 and 422 are what a blocked or malformed address produce. Neither may
    // be distinguishable from the other, or from a successful send.
    for (const status of [400, 401, 403, 422, 500]) {
      respond(status);
      await expect(requestMagicLink('a@b.c', 'https://app/settings?sync=1')).rejects.toThrow(
        'Could not send the sign-in link. Check the address and try again.',
      );
    }
  });

  it('posts the redirect so the link lands on a page that can finish sign-in', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await requestMagicLink('a@b.c', 'https://app/settings?sync=1');

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(`${ENV.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/otp`);
    expect(JSON.parse(String(init.body))).toMatchObject({
      email: 'a@b.c',
      options: { email_redirect_to: 'https://app/settings?sync=1' },
    });
  });
});

describe('signInWithPassword', () => {
  const token = {
    access_token: 'a', refresh_token: 'r', expires_in: 3600, user: { email: 'a@b.c' },
  };

  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
      },
    });
  });

  it('returns a session and does not send an email', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, status: 200, json: async () => token }));
    vi.stubGlobal('fetch', fetchMock);

    const session = await (await import('@/lib/sync-client')).signInWithPassword('a@b.c', 'hunter22');
    expect(session.accessToken).toBe('a');
    // The whole point: no /otp call, so the hourly mail quota is untouched.
    const urls = (fetchMock.mock.calls as unknown as [string][]).map((c) => String(c[0]));
    expect(urls.some((u) => u.includes('/otp'))).toBe(false);
    expect(urls[0]).toContain('grant_type=password');
  });

  it('does not reveal whether the account exists', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 400 })));
    const { signInWithPassword } = await import('@/lib/sync-client');
    await expect(signInWithPassword('a@b.c', 'wrong')).rejects.toThrow(
      'That email and password did not match. Check both and try again.',
    );
  });

  it('names a rate limit rather than blaming the password', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 429 })));
    const { signInWithPassword } = await import('@/lib/sync-client');
    await expect(signInWithPassword('a@b.c', 'x')).rejects.toThrow(/wait a few minutes/i);
  });
});

describe('setPassword', () => {
  const session = { accessToken: 'tok', refreshToken: 'r', expiresAt: Date.now() + 1e6, email: 'a@b.c' };

  it('authorises with the live session, so it cannot be used to take over an account', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await (await import('@/lib/sync-client')).setPassword(session, 'newpassword');

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain('/auth/v1/user');
    expect(init.method).toBe('PUT');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok');
  });

  it('explains a rejected password', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 422 })));
    const { setPassword } = await import('@/lib/sync-client');
    await expect(setPassword(session, 'abc')).rejects.toThrow(/at least six/i);
  });
});
