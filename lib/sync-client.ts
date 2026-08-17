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
    // Deliberately vague. A precise message here would say whether an address
    // is allowlisted, which turns the sign-in form into a membership oracle.
    throw new Error('Could not send the sign-in link. Check the address and try again.');
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
