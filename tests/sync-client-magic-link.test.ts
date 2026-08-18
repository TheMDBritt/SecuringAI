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
