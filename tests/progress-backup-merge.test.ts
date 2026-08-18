/**
 * Importing a backup must not destroy what is already here.
 *
 * The realistic use of import is carrying history from a second device, and
 * that device is never a superset of this one. Replacing meant importing a
 * phone's backup onto a laptop wiped everything studied on the laptop, with no
 * warning, no undo, and nothing on screen to say it had happened.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { restoreBackup, buildBackup, BACKUP_VERSION } from '@/lib/progress-backup';

const PROGRESS_KEY = 'securingai:progress:v1';
const QUIZ_KEY = 'dojo-progress-v1';
const SETTINGS_KEY = 'securingai:settings:v1';

function installBrowser() {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
  vi.stubGlobal('localStorage', localStorage);
  vi.stubGlobal('window', { localStorage, dispatchEvent: () => true });
  return store;
}

const run = (id: string, at: string) => ({ id, total: 10, correct: 5, skipped: 0, at });
const session = (id: string, startedAt: number) => ({
  id, startedAt, cert: 'SecAI', category: 'All', difficulty: 'all' as const,
  count: 5, correct: 2, skipped: 0, examMode: false,
  results: [{ qId: 'q1', chosen: 0, correct: false, timeMs: 900 }],
});

/** A backup file as it would arrive from the other device. */
const backupFile = (over: { runs?: unknown[]; sessions?: unknown[]; perQ?: unknown; settings?: unknown }) =>
  JSON.stringify({
    format: 'securingai-progress',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    progress: { quizRuns: over.runs ?? [], attackRuns: [] },
    quizProgress: { sessions: over.sessions ?? [], perQ: over.perQ ?? {} },
    settings: over.settings ?? null,
  });

let store: Map<string, string>;
beforeEach(() => { store = installBrowser(); });
afterEach(() => { vi.unstubAllGlobals(); });

describe('import merges instead of replacing', () => {
  it('keeps what this device already had', () => {
    store.set(PROGRESS_KEY, JSON.stringify({ quizRuns: [run('laptop', '2026-01-01T00:00:00Z')], attackRuns: [] }));
    store.set(QUIZ_KEY, JSON.stringify({ sessions: [session('laptop-s', 1000)], perQ: {} }));

    const result = restoreBackup(backupFile({ runs: [run('phone', '2026-01-02T00:00:00Z')], sessions: [session('phone-s', 2000)] }));

    expect(result.ok).toBe(true);
    const activity = JSON.parse(store.get(PROGRESS_KEY)!);
    const quiz = JSON.parse(store.get(QUIZ_KEY)!);
    expect(activity.quizRuns.map((r: { id: string }) => r.id).sort()).toEqual(['laptop', 'phone']);
    expect(quiz.sessions.map((s: { id: string }) => s.id).sort()).toEqual(['laptop-s', 'phone-s']);
  });

  it('reports how much was actually added', () => {
    store.set(PROGRESS_KEY, JSON.stringify({ quizRuns: [run('a', '2026-01-01T00:00:00Z')], attackRuns: [] }));
    const result = restoreBackup(backupFile({ runs: [run('a', '2026-01-01T00:00:00Z'), run('b', '2026-01-02T00:00:00Z')] }));
    expect(result).toMatchObject({ ok: true, added: 1 });
  });

  it('is harmless to import the same file twice', () => {
    const file = backupFile({ runs: [run('x', '2026-01-01T00:00:00Z')], sessions: [session('s', 5)] });
    restoreBackup(file);
    const second = restoreBackup(file);
    expect(second).toMatchObject({ ok: true, added: 0 });
    expect(JSON.parse(store.get(PROGRESS_KEY)!).quizRuns).toHaveLength(1);
  });

  it('imports cleanly onto an empty browser', () => {
    const result = restoreBackup(backupFile({ runs: [run('x', '2026-01-01T00:00:00Z')], sessions: [session('s', 5)] }));
    expect(result).toMatchObject({ ok: true, added: 2 });
  });

  it('does not overwrite preferences this device has already set', () => {
    // Reduce motion describes the machine you are sitting at, not history that
    // should travel with a backup.
    store.set(SETTINGS_KEY, JSON.stringify({ reduceMotion: true, denseTables: false }));
    restoreBackup(backupFile({ settings: { reduceMotion: false, denseTables: true } }));
    expect(JSON.parse(store.get(SETTINGS_KEY)!)).toEqual({ reduceMotion: true, denseTables: false });
  });

  it('adopts preferences when this device has expressed none', () => {
    restoreBackup(backupFile({ settings: { reduceMotion: true, denseTables: false } }));
    expect(JSON.parse(store.get(SETTINGS_KEY)!)).toEqual({ reduceMotion: true, denseTables: false });
  });
});

describe('a bad file changes nothing', () => {
  beforeEach(() => {
    store.set(PROGRESS_KEY, JSON.stringify({ quizRuns: [run('keep', '2026-01-01T00:00:00Z')], attackRuns: [] }));
  });

  const untouched = () =>
    expect(JSON.parse(store.get(PROGRESS_KEY)!).quizRuns.map((r: { id: string }) => r.id)).toEqual(['keep']);

  it('rejects invalid JSON', () => {
    expect(restoreBackup('{not json').ok).toBe(false);
    untouched();
  });

  it('rejects a file that is not a Securing AI backup', () => {
    expect(restoreBackup(JSON.stringify({ format: 'something-else', version: 1 })).ok).toBe(false);
    untouched();
  });

  it('rejects a backup from a newer app version', () => {
    const res = restoreBackup(JSON.stringify({ format: 'securingai-progress', version: BACKUP_VERSION + 1 }));
    expect(res.ok).toBe(false);
    untouched();
  });
});

describe('export and import round-trip', () => {
  it('restores everything a backup carried', () => {
    store.set(PROGRESS_KEY, JSON.stringify({ quizRuns: [run('r1', '2026-01-01T00:00:00Z')], attackRuns: [] }));
    store.set(QUIZ_KEY, JSON.stringify({ sessions: [session('s1', 10)], perQ: { q1: { qId: 'q1', timesSeen: 3, timesRight: 1, lastSeenAt: 99 } } }));
    const file = JSON.stringify(buildBackup());

    store.clear();
    const result = restoreBackup(file);

    expect(result.ok).toBe(true);
    expect(JSON.parse(store.get(PROGRESS_KEY)!).quizRuns).toHaveLength(1);
    expect(JSON.parse(store.get(QUIZ_KEY)!).perQ.q1.timesSeen).toBe(3);
  });
});
