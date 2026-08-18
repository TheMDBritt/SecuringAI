/**
 * What happens when the browser refuses to store anything.
 *
 * This is not a rare edge. localStorage refuses writes once the origin's quota
 * is spent, and Safari in private browsing refuses every write outright. Two
 * distinct bugs lived here: one store wrote with no try/catch at all and could
 * throw out of the quiz completion handler into the route error boundary, and
 * the other caught the failure and returned in silence, so a learner studied
 * against a full disk with every session dropped and nothing on screen.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { safeWrite, storageFailing, resetStorageHealth, STORAGE_HEALTH_EVENT } from '@/lib/storage-health';

const PROGRESS_KEY = 'securingai:progress:v1';
const QUIZ_KEY = 'dojo-progress-v1';

/** A browser whose localStorage can be told to start refusing writes. */
function installBrowser() {
  const store = new Map<string, string>();
  let refuse = false;
  const events: string[] = [];
  const localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      if (refuse) {
        const err = new Error('QuotaExceededError');
        err.name = 'QuotaExceededError';
        throw err;
      }
      store.set(k, v);
    },
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
  vi.stubGlobal('localStorage', localStorage);
  vi.stubGlobal('window', {
    localStorage,
    dispatchEvent: (e: Event) => {
      events.push(e.type);
      return true;
    },
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  return { store, events, refuseWrites: (v: boolean) => { refuse = v; } };
}

let env: ReturnType<typeof installBrowser>;
beforeEach(() => {
  env = installBrowser();
  resetStorageHealth();
});
afterEach(() => vi.unstubAllGlobals());

describe('safeWrite', () => {
  it('writes and reports success', () => {
    expect(safeWrite('k', 'v')).toBe(true);
    expect(env.store.get('k')).toBe('v');
    expect(storageFailing()).toBe(false);
  });

  it('reports failure instead of throwing', () => {
    env.refuseWrites(true);
    expect(() => safeWrite('k', 'v')).not.toThrow();
    expect(safeWrite('k', 'v')).toBe(false);
    expect(storageFailing()).toBe(true);
  });

  it('announces the failure so the shell can warn', () => {
    env.refuseWrites(true);
    safeWrite('k', 'v');
    expect(env.events).toContain(STORAGE_HEALTH_EVENT);
  });

  it('announces recovery once writes succeed again', () => {
    env.refuseWrites(true);
    safeWrite('k', 'v');
    env.events.length = 0;
    env.refuseWrites(false);
    safeWrite('k', 'v');
    expect(storageFailing()).toBe(false);
    expect(env.events).toContain(STORAGE_HEALTH_EVENT);
  });

  it('does not re-announce an unchanged state', () => {
    safeWrite('a', '1');
    env.events.length = 0;
    safeWrite('b', '2');
    expect(env.events).not.toContain(STORAGE_HEALTH_EVENT);
  });
});

describe('recording activity survives a full disk', () => {
  it('does not throw out of the quiz completion path', async () => {
    const { recordQuizRun } = await import('@/lib/progress-store');
    env.refuseWrites(true);
    // This is the exact call a finished mock exam makes.
    expect(() =>
      recordQuizRun({ total: 60, correct: 42, skipped: 0, examMode: true }),
    ).not.toThrow();
    expect(storageFailing()).toBe(true);
  });

  it('does not claim a change that was never stored', async () => {
    const { recordAttackRun, PROGRESS_CHANGED_EVENT } = await import('@/lib/progress-store');
    env.refuseWrites(true);
    env.events.length = 0;
    recordAttackRun({
      dojoId: 1, scenarioId: 's', scenarioTitle: 't', attackType: 'a',
      succeeded: false, score: 10, verdict: 'v',
    });
    expect(env.events).not.toContain(PROGRESS_CHANGED_EVENT);
  });

  it('still writes normally when there is room', async () => {
    const { recordQuizRun } = await import('@/lib/progress-store');
    recordQuizRun({ total: 10, correct: 7, skipped: 0, examMode: false });
    expect(JSON.parse(env.store.get(PROGRESS_KEY)!).quizRuns).toHaveLength(1);
  });
});

describe('quiz history survives a full disk', () => {
  it('does not throw when a session cannot be stored', async () => {
    const { recordSession } = await import('@/lib/quiz-progress');
    env.refuseWrites(true);
    expect(() =>
      recordSession({
        cert: 'SecAI', category: 'All', difficulty: 'all', examMode: false,
        results: [{ qId: 'q1', chosen: 1, correct: true, timeMs: 100 }],
      }),
    ).not.toThrow();
    expect(storageFailing()).toBe(true);
  });

  it('records normally when there is room', async () => {
    const { recordSession } = await import('@/lib/quiz-progress');
    recordSession({
      cert: 'SecAI', category: 'All', difficulty: 'all', examMode: false,
      results: [{ qId: 'q1', chosen: 1, correct: true, timeMs: 100 }],
    });
    expect(JSON.parse(env.store.get(QUIZ_KEY)!).sessions).toHaveLength(1);
  });
});

describe('session retention', () => {
  const DAY = 24 * 60 * 60 * 1000;
  const session = (id: string, ageDays: number) => ({
    id, startedAt: Date.now() - ageDays * DAY, cert: 'SecAI', category: 'All',
    difficulty: 'all' as const, count: 10, correct: 5, skipped: 0, examMode: false,
    results: [{ qId: 'q1', chosen: 0, correct: false, timeMs: 10 }],
  });

  it('does not delete history merely because the app was opened', async () => {
    // The old prune ran on read, so opening the dashboard after a long gap
    // destroyed sessions before the user could export them — and because sync
    // reads through this path, it propagated that deletion to every device.
    const { loadProgress } = await import('@/lib/quiz-progress');
    env.store.set(QUIZ_KEY, JSON.stringify({ sessions: [session('old', 200)], perQ: {} }));

    const read = loadProgress();

    expect(read.sessions.map((s) => s.id)).toEqual(['old']);
    expect(JSON.parse(env.store.get(QUIZ_KEY)!).sessions).toHaveLength(1);
  });

  it('keeps a session from a year ago, well past the old 90-day window', async () => {
    const { loadProgress } = await import('@/lib/quiz-progress');
    env.store.set(QUIZ_KEY, JSON.stringify({ sessions: [session('lastyear', 365)], perQ: {} }));
    expect(loadProgress().sessions).toHaveLength(1);
  });

  it('still bounds growth on write', async () => {
    const { recordSession, loadProgress } = await import('@/lib/quiz-progress');
    env.store.set(QUIZ_KEY, JSON.stringify({ sessions: [session('ancient', 900)], perQ: {} }));
    recordSession({
      cert: 'SecAI', category: 'All', difficulty: 'all', examMode: false,
      results: [{ qId: 'q1', chosen: 1, correct: true, timeMs: 100 }],
    });
    expect(loadProgress().sessions.map((s) => s.id)).not.toContain('ancient');
  });
});

describe('clearing training data stays cleared', () => {
  it('does not resurrect runs recorded earlier in the same page load', async () => {
    // loadProgress used to hand back one shared module-level constant whenever
    // storage was empty, and recordQuizRun unshifted straight into it. So the
    // "empty" state accumulated every run made since page load. Clearing then
    // read that constant back, showed the deleted runs, and the next write
    // persisted them to disk. Deleted history came back.
    const { recordQuizRun, clearProgress, loadProgress } = await import('@/lib/progress-store');

    recordQuizRun({ total: 10, correct: 9, skipped: 0, examMode: false });
    expect(loadProgress().quizRuns).toHaveLength(1);

    clearProgress();
    expect(loadProgress().quizRuns).toHaveLength(0);

    // The dangerous part: the next write must not carry the deleted run back.
    recordQuizRun({ total: 5, correct: 1, skipped: 0, examMode: false });
    const after = JSON.parse(env.store.get(PROGRESS_KEY)!).quizRuns;
    expect(after).toHaveLength(1);
    expect(after[0].total).toBe(5);
  });

  it('gives each caller its own object when storage is empty', async () => {
    const { loadProgress } = await import('@/lib/progress-store');
    const a = loadProgress();
    a.quizRuns.push({ id: 'x', total: 1, correct: 1, skipped: 0, at: 'now' });
    expect(loadProgress().quizRuns).toHaveLength(0);
  });
});
