/**
 * The scheduler that makes sync automatic.
 *
 * Two things here would be serious if wrong. A sync writes to localStorage,
 * which fires the same change events this listens to, so a missing re-entrancy
 * guard is an infinite request loop against Supabase. And if the flush on tab
 * hide does not happen, work done on a machine someone opens once is stranded
 * there forever, which is the exact failure this module exists to fix.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PROGRESS_CHANGED_EVENT } from '@/lib/progress-store';
import { QUIZ_PROGRESS_CHANGED_EVENT } from '@/lib/quiz-progress';

const ok = async () => ({ status: 'ok' as const, email: 'a@b.c', at: 1 });
const syncNow = vi.fn(ok);
vi.mock('@/lib/sync', () => ({ syncNow: () => syncNow() }));

/** Minimal DOM: event targets for window and document plus a visibility flag. */
function installBrowser() {
  const listeners = new Map<string, Set<() => void>>();
  const target = {
    addEventListener: (t: string, cb: () => void) => {
      if (!listeners.has(t)) listeners.set(t, new Set());
      listeners.get(t)!.add(cb);
    },
    removeEventListener: (t: string, cb: () => void) => listeners.get(t)?.delete(cb),
  };
  const doc = { ...target, visibilityState: 'visible' as DocumentVisibilityState };
  vi.stubGlobal('window', target);
  vi.stubGlobal('document', doc);
  return {
    doc,
    fire: (t: string) => listeners.get(t)?.forEach((cb) => cb()),
  };
}

let env: ReturnType<typeof installBrowser>;
let start: typeof import('@/lib/sync-auto').startAutoSync;

beforeEach(async () => {
  vi.useFakeTimers();
  // mockClear leaves the implementation in place, so a test that makes syncNow
  // fire events would otherwise leak into every test after it.
  syncNow.mockReset();
  syncNow.mockImplementation(ok);
  env = installBrowser();
  vi.resetModules();
  ({ startAutoSync: start } = await import('@/lib/sync-auto'));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** Let queued promise callbacks run without advancing the fake clock. */
const settle = () => vi.advanceTimersByTimeAsync(0);

describe('startAutoSync', () => {
  it('pulls once on start, before anything happens locally', async () => {
    start();
    await settle();
    expect(syncNow).toHaveBeenCalledTimes(1);
  });

  it('pushes after progress changes here', async () => {
    const stop = start();
    await settle();
    syncNow.mockClear();

    env.fire(PROGRESS_CHANGED_EVENT);
    expect(syncNow).not.toHaveBeenCalled(); // debounced, not immediate
    await vi.advanceTimersByTimeAsync(4000);
    expect(syncNow).toHaveBeenCalledTimes(1);
    stop();
  });

  it('collapses a burst of answers into one request', async () => {
    // A 60-question session writes after every answer. That must not be 60
    // round trips.
    const stop = start();
    await settle();
    syncNow.mockClear();

    for (let i = 0; i < 60; i++) {
      env.fire(QUIZ_PROGRESS_CHANGED_EVENT);
      await vi.advanceTimersByTimeAsync(500);
    }
    await vi.advanceTimersByTimeAsync(4000);
    expect(syncNow).toHaveBeenCalledTimes(1);
    stop();
  });

  it('does not loop when the sync itself writes local data', async () => {
    // syncNow writing the merge fires PROGRESS_CHANGED_EVENT. Left unguarded
    // that re-enters forever.
    syncNow.mockImplementation(async () => {
      env.fire(PROGRESS_CHANGED_EVENT);
      return { status: 'ok' as const, email: 'a@b.c', at: 1 };
    });
    const stop = start();
    await vi.advanceTimersByTimeAsync(60_000);
    // The initial pull, and nothing self-sustaining after it.
    expect(syncNow).toHaveBeenCalledTimes(1);
    stop();
  });

  it('flushes a pending change when the tab is hidden', async () => {
    const stop = start();
    await settle();
    syncNow.mockClear();

    env.fire(QUIZ_PROGRESS_CHANGED_EVENT);
    env.doc.visibilityState = 'hidden';
    env.fire('visibilitychange');
    await settle();

    expect(syncNow).toHaveBeenCalledTimes(1);
    stop();
  });

  it('does not sync on hide when nothing changed', async () => {
    const stop = start();
    await settle();
    syncNow.mockClear();

    env.doc.visibilityState = 'hidden';
    env.fire('visibilitychange');
    await settle();

    expect(syncNow).not.toHaveBeenCalled();
    stop();
  });

  it('pulls again when the tab is returned to after a while', async () => {
    const stop = start();
    await settle();
    syncNow.mockClear();

    // Alt-tabbing straight back is not a signal another device did anything.
    env.fire('visibilitychange');
    await settle();
    expect(syncNow).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(61_000);
    env.fire('visibilitychange');
    await settle();
    expect(syncNow).toHaveBeenCalledTimes(1);
    stop();
  });

  it('retries as soon as the network returns', async () => {
    const stop = start();
    await settle();
    syncNow.mockClear();

    env.fire('online');
    await settle();
    expect(syncNow).toHaveBeenCalledTimes(1);
    stop();
  });

  it('stops completely once torn down', async () => {
    const stop = start();
    await settle();
    stop();
    syncNow.mockClear();

    env.fire(PROGRESS_CHANGED_EVENT);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(syncNow).not.toHaveBeenCalled();
  });

  it('survives a sync that rejects outright', async () => {
    syncNow.mockRejectedValueOnce(new Error('offline'));
    const stop = start();
    await settle();

    syncNow.mockClear();
    env.fire(PROGRESS_CHANGED_EVENT);
    await vi.advanceTimersByTimeAsync(4000);
    expect(syncNow).toHaveBeenCalledTimes(1); // still scheduling after a failure
    stop();
  });
});
