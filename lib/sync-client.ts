'use client';

/**
 * Talking to Supabase, over plain fetch.
 *
 * No SDK. @supabase/supabase-js is well over 100kB and this app ships an 87.5kB
 * shared bundle that every page pays for; adding a client library to serve one
 * optional feature would be the largest single regression in the project. The
 * surface actually needed is four HTTP calls, and lib/counter-store.ts already
 * set this precedent against the Upstash REST API.
 *
 * Only the publishable key is used, and only from the browser. It is designed
 * to be public: every table is behind row level security keyed on auth.uid(),
 * so the key on its own reaches nothing. There is no service role key anywhere
 * in this repo, and nothing here should ever run on the server.
 */

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

/** Whether sync is configured at all. Everything degrades to local-only when not. */
export function syncConfigured(): boolean {
  return Boolean(URL_BASE && PUBLISHABLE);
}

// ─── Session storage ─────────────────────────────────────────────────────────
// Tokens live in localStorage rather than a cookie because there is no server
// component to this feature: nothing is rendered per user, so a cookie would
// only widen the surface by travelling on every request to the app's own
// origin.

const SESSION_KEY = 'securingai:sync-session:v1';

export interface SyncSession {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms. Refreshed a minute early to avoid racing an expiry. */
  expiresAt: number;
  email: string;
}

export function loadSession(): SyncSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<SyncSession>;
    if (typeof s.accessToken !== 'string' || typeof s.refreshToken !== 'string') return null;
    if (typeof s.expiresAt !== 'number' || typeof s.email !== 'string') return null;
    return s as SyncSession;
  } catch {
    return null;
  }
}

export function saveSession(s: SyncSession): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    /* storage full or blocked; sync simply stays signed out */
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* nothing else to do */
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  return { apikey: PUBLISHABLE, 'Content-Type': 'application/json' };
}

/**
 * Ask for a magic link.
 *
 * `shouldCreateUser` is left on because the database refuses addresses that are
 * not allowlisted, and that refusal is the control. Turning it off here would
 * put the gate in the browser, where it is a suggestion.
 */
export async function requestMagicLink(email: string, redirectTo: string): Promise<void> {
  const res = await fetch(`${URL_BASE}/auth/v1/otp`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, create_user: true, options: { email_redirect_to: redirectTo } }),
  });
  if (!res.ok) {
    // A rate limit is the one failure worth naming. The reason the generic
    // message exists is to avoid confirming whether an address is allowlisted,
    // and 429 reveals nothing about that: it is returned for any address once
    // the project's hourly email quota is spent, allowlisted or not. Hiding it
    // only sends someone to check an address that was never the problem, and
    // retrying is the exact wrong response since each attempt extends the wait.
    //
    // The built-in Supabase sender allows a couple of emails an hour and is
    // documented as unsuitable for production. Configuring project SMTP raises
    // the ceiling; until then this message is what the user sees.
    if (res.status === 429) {
      throw new Error('Too many sign-in emails just now. Wait about an hour and try again.');
    }
    // Everything else stays deliberately vague. A precise message here would
    // say whether an address is allowlisted, turning the form into a
    // membership oracle.
    throw new Error('Could not send the sign-in link. Check the address and try again.');
  }
}

/**
 * Sign in with a password, no email round trip.
 *
 * The reason this exists alongside the magic link: the built-in Supabase mailer
 * allows about two messages an hour, and adding a device costs one. Someone
 * signing in on a phone and a work machine in the same evening is rate limited
 * out of their own account, which is exactly the failure this feature was meant
 * to remove.
 *
 * A password is a real second option, not a weaker one. The alternative asked
 * for, an address alone being enough, cannot be done from the browser without
 * the service role key, which grants full admin over the database and bypasses
 * every row level security policy. It would also mean anyone who knows the
 * address owns the account, and addresses are public in commit metadata.
 *
 * Failures stay generic for the same reason as the magic link: a message that
 * distinguished "no such account" from "wrong password" would confirm which
 * addresses are registered.
 */
export async function signInWithPassword(email: string, password: string): Promise<SyncSession> {
  const res = await fetch(`${URL_BASE}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Too many attempts just now. Wait a few minutes and try again.');
    }
    throw new Error('That email and password did not match. Check both and try again.');
  }
  const session = toSession((await res.json()) as TokenResponse, email);
  if (!session) throw new Error('Signed in, but no session came back. Try again.');
  saveSession(session);
  return session;
}

/**
 * Set or change the password on the signed-in account.
 *
 * Requires a live session, so this is reachable only after signing in by link
 * or with an existing password. That is deliberate: a password that could be
 * set from an unauthenticated form would be a takeover, not a convenience.
 */
export async function setPassword(session: SyncSession, password: string): Promise<void> {
  const res = await fetch(`${URL_BASE}/auth/v1/user`, {
    method: 'PUT',
    headers: { ...authHeaders(), Authorization: `Bearer ${session.accessToken}` },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    if (res.status === 422) {
      throw new Error('That password was rejected. Use at least six characters.');
    }
    throw new Error('Could not change the password. Try again.');
  }
}

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: { email?: string };
}

function toSession(t: TokenResponse, fallbackEmail = ''): SyncSession | null {
  if (!t.access_token || !t.refresh_token) return null;
  return {
    accessToken: t.access_token,
    refreshToken: t.refresh_token,
    expiresAt: Date.now() + (t.expires_in ?? 3600) * 1000,
    email: t.user?.email ?? fallbackEmail,
  };
}

/**
 * Complete sign-in from the fragment Supabase appends to the redirect.
 *
 * The tokens arrive in the URL hash. They are read once and then stripped from
 * the address bar so they do not sit in history or get pasted into a chat
 * window along with the link.
 */
export function consumeAuthRedirect(): SyncSession | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const access = params.get('access_token');
  const refresh = params.get('refresh_token');
  if (!access || !refresh) return null;

  const session: SyncSession = {
    accessToken: access,
    refreshToken: refresh,
    expiresAt: Date.now() + Number(params.get('expires_in') ?? 3600) * 1000,
    email: '',
  };
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  return session;
}

/**
 * Sign in from a credential carried in the URL.
 *
 * A key link: one URL that signs this browser in on arrival, so a machine where
 * typing a password into a form is impractical still gets its progress. It
 * works on any route, so an ordinary bookmark can carry it.
 *
 * Be clear about what this is. The link is a bearer credential: whoever holds
 * the URL holds the account, exactly as if the password were written on it,
 * because it is. That is an acceptable trade for one person's study history and
 * would not be for anything else. It is why the parameter is stripped from the
 * address bar the moment it is read, the same way the magic-link tokens are —
 * out of the visible URL, out of anything copied from it afterwards, and out of
 * the history entry left behind on a shared machine.
 *
 * What this cannot fix is the browser reaching Supabase at all. Where a network
 * blocks the host, this signs in no better than the form does.
 *
 * Encoded rather than plain so the credential is not legible over a shoulder.
 * Encoding is not encryption and is not relied on as protection: anyone holding
 * the link can decode it in one line.
 */
const KEY_PARAM = 'k';

export function hasCredentialLink(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has(KEY_PARAM);
}

export async function consumeCredentialLink(): Promise<SyncSession | null> {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get(KEY_PARAM);
  if (!raw) return null;

  // Stripped first, and unconditionally. If sign-in fails the credential must
  // still not be left sitting in the address bar for the next person to read.
  params.delete(KEY_PARAM);
  const query = params.toString();
  window.history.replaceState(
    null,
    '',
    window.location.pathname + (query ? `?${query}` : '') + window.location.hash,
  );

  let email: string;
  let password: string;
  try {
    // URL-safe base64, so the link survives being pasted through anything.
    const decoded = atob(raw.replace(/-/g, '+').replace(/_/g, '/'));
    const split = decoded.indexOf(':');
    if (split < 1) return null;
    email = decoded.slice(0, split);
    password = decoded.slice(split + 1);
  } catch {
    return null;
  }
  if (!email || !password) return null;

  try {
    return await signInWithPassword(email, password);
  } catch {
    // A stale link leaves the browser exactly as it was, signed out and
    // local-only, rather than raising an error on a page nobody asked to sign
    // in from.
    return null;
  }
}

async function refresh(session: SyncSession): Promise<SyncSession | null> {
  const res = await fetch(`${URL_BASE}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ refresh_token: session.refreshToken }),
  });
  if (!res.ok) return null;
  return toSession((await res.json()) as TokenResponse, session.email);
}

/** Returns a session with a usable token, refreshing when it is close to expiry. */
export async function ensureFresh(session: SyncSession): Promise<SyncSession | null> {
  if (session.expiresAt - Date.now() > 60_000) return session;
  const next = await refresh(session);
  if (next) saveSession(next);
  else clearSession();
  return next;
}

/** Who the current token belongs to, used to label the signed-in state. */
export async function fetchEmail(session: SyncSession): Promise<string> {
  if (session.email) return session.email;
  const res = await fetch(`${URL_BASE}/auth/v1/user`, {
    headers: { ...authHeaders(), Authorization: `Bearer ${session.accessToken}` },
  });
  if (!res.ok) return '';
  const body = (await res.json()) as { email?: string };
  return body.email ?? '';
}

export async function signOut(session: SyncSession): Promise<void> {
  try {
    await fetch(`${URL_BASE}/auth/v1/logout`, {
      method: 'POST',
      headers: { ...authHeaders(), Authorization: `Bearer ${session.accessToken}` },
    });
  } catch {
    // The local session is cleared regardless: a failed revoke must not leave
    // someone apparently signed in on a shared machine.
  }
  clearSession();
}

// ─── Progress row ────────────────────────────────────────────────────────────

function restHeaders(session: SyncSession): HeadersInit {
  return {
    apikey: PUBLISHABLE,
    Authorization: `Bearer ${session.accessToken}`,
    'Content-Type': 'application/json',
  };
}

/** The stored row, or null when this user has never synced. */
export async function fetchRemote(
  session: SyncSession,
): Promise<{ activity: unknown; quiz: unknown } | null> {
  const res = await fetch(`${URL_BASE}/rest/v1/progress?select=activity,quiz`, {
    headers: restHeaders(session),
  });
  if (!res.ok) throw new Error(`Could not read synced progress (HTTP ${res.status}).`);
  const rows = (await res.json()) as Array<{ activity: unknown; quiz: unknown }>;
  return rows[0] ?? null;
}

/**
 * Write the merged document back.
 *
 * Upsert on the primary key, so the first sync from a new account creates the
 * row and every later one replaces it. user_id comes from the token rather than
 * the caller; row level security would reject any other value anyway.
 */
export async function pushRemote(
  session: SyncSession,
  userId: string,
  payload: { activity: unknown; quiz: unknown },
): Promise<void> {
  const res = await fetch(`${URL_BASE}/rest/v1/progress?on_conflict=user_id`, {
    method: 'POST',
    headers: { ...restHeaders(session), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ user_id: userId, activity: payload.activity, quiz: payload.quiz }),
  });
  if (!res.ok) throw new Error(`Could not save synced progress (HTTP ${res.status}).`);
}

/** The user id encoded in the access token, needed as the row's primary key. */
export function userIdFrom(session: SyncSession): string {
  try {
    const payload = session.accessToken.split('.')[1];
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof json.sub === 'string' ? json.sub : '';
  } catch {
    return '';
  }
}
