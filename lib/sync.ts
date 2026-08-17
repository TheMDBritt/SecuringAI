'use client';

/**
 * Cross-device sync, wrapped around the local stores.
 *
 * The app is local-first and stays that way. Signing in adds a mirror; it never
 * becomes the source of truth. Every read still comes from localStorage, so the
 * Dojo, the quiz engine and the progress views are unchanged and keep working
 * offline, signed out, or with the network blocked by a corporate proxy.
 *
 * A sync is: read local, read remote, merge, write both. The merge in
 * lib/sync-merge.ts is a union that never drops an entry, so the order two
 * devices happen to sync in does not matter and nothing is lost when both were
 * offline.
 */
import { PROGRESS_CHANGED_EVENT } from './progress-store';
import { mergePayloads, normalise, sameWork, type SyncPayload } from './sync-merge';
import {
  clearSession,
  ensureFresh,
  fetchEmail,
  fetchRemote,
  loadSession,
  pushRemote,
  saveSession,
  syncConfigured,
  userIdFrom,
  type SyncSession,
} from './sync-client';

const ACTIVITY_KEY = 'securingai:progress:v1';
const QUIZ_KEY = 'dojo-progress-v1';

/** Fired after a sync changes local data, so open views can re-read. */
export const SYNC_CHANGED_EVENT = 'securingai:sync-changed';

export type SyncState =
  | { status: 'off' }
  | { status: 'signed-out' }
  | { status: 'syncing'; email: string }
  | { status: 'ok'; email: string; at: number }
  | { status: 'error'; email: string; message: string };

function readLocal(): SyncPayload {
  if (typeof window === 'undefined') return normalise(null);
  const read = (k: string) => {
    try {
      const raw = window.localStorage.getItem(k);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };
  return normalise({ activity: read(ACTIVITY_KEY), quiz: read(QUIZ_KEY) });
}

function writeLocal(payload: SyncPayload): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(payload.activity));
    window.localStorage.setItem(QUIZ_KEY, JSON.stringify(payload.quiz));
  } catch {
    // Quota exceeded. The remote copy is already correct, so the next sync on a
    // device with room will still have everything.
    return;
  }
  // Both stores notify through the same event the local writers use, so the
  // dashboard and progress views refresh without knowing sync exists.
  window.dispatchEvent(new Event(PROGRESS_CHANGED_EVENT));
  window.dispatchEvent(new Event(SYNC_CHANGED_EVENT));
}

/**
 * Pull, merge, push.
 *
 * Returns the state to display. Failures are reported rather than thrown: a
 * sync that cannot reach the network must leave the app entirely usable, which
 * is the normal condition on a locked-down machine.
 */
export async function syncNow(): Promise<SyncState> {
  if (!syncConfigured()) return { status: 'off' };

  const stored = loadSession();
  if (!stored) return { status: 'signed-out' };

  const session = await ensureFresh(stored);
  if (!session) return { status: 'signed-out' };

  const email = await fetchEmail(session).catch(() => session.email);
  if (email && email !== session.email) saveSession({ ...session, email });

  try {
    const local = readLocal();
    const remoteRow = await fetchRemote(session);
    const remote = normalise(remoteRow ? { activity: remoteRow.activity, quiz: remoteRow.quiz } : null);
    const merged = mergePayloads(local, remote);

    // Only write where something actually moved. Most syncs are no-ops and
    // rewriting localStorage would fire change events that re-render every open
    // view for nothing.
    if (!sameWork(merged, local)) writeLocal(merged);
    if (!remoteRow || !sameWork(merged, remote)) {
      const userId = userIdFrom(session);
      if (!userId) throw new Error('Could not read the account id from the session.');
      await pushRemote(session, userId, merged);
    }
    return { status: 'ok', email, at: Date.now() };
  } catch (err) {
    return {
      status: 'error',
      email,
      message: err instanceof Error ? err.message : 'Sync failed.',
    };
  }
}

/** Current state without touching the network, for first paint. */
export function currentState(): SyncState {
  if (!syncConfigured()) return { status: 'off' };
  const s = loadSession();
  return s ? { status: 'syncing', email: s.email } : { status: 'signed-out' };
}

export async function signOutAndForget(): Promise<void> {
  const s = loadSession();
  if (s) {
    const { signOut } = await import('./sync-client');
    await signOut(s);
  } else {
    clearSession();
  }
}

export function storeSession(session: SyncSession): void {
  saveSession(session);
}
