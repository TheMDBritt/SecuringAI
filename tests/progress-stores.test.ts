/**
 * Guards the contract between the two progress stores.
 *
 * lib/progress-store.ts and lib/quiz-progress.ts both persist quiz activity at
 * different grain, and both export a function named `loadProgress`. That name
 * collision has already caused confusion once. These tests pin the properties
 * that must hold so a future change to one store cannot silently desynchronise
 * the other, and so the backup format keeps covering both.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Minimal localStorage for the node test environment.
class MemoryStorage {
  private map = new Map<string, string>();
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, String(v)); }
  removeItem(k: string) { this.map.delete(k); }
  clear() { this.map.clear(); }
  key(i: number) { return [...this.map.keys()][i] ?? null; }
  get length() { return this.map.size; }
}

beforeEach(() => {
  // Reset module registry so each test gets stores with no retained state.
  vi.resetModules();
  vi.stubGlobal('localStorage', new MemoryStorage());
  vi.stubGlobal('window', {
    localStorage: globalThis.localStorage,
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
});

const ACTIVITY_KEY = 'securingai:progress:v1';
const PERQ_KEY = 'dojo-progress-v1';

describe('store separation', () => {
  it('writes the activity log and the per-question stats to different keys', async () => {
    const activity = await import('@/lib/progress-store');
    const perQuestion = await import('@/lib/quiz-progress');

    activity.recordQuizRun({
      certId: 'SecAI',
      certName: 'CompTIA SecAI+',
      total: 10,
      correct: 8,
      skipped: 0,
    });

    perQuestion.recordSession({
      cert: 'SecAI',
      category: 'AI Security',
      difficulty: 'beginner',
      examMode: false,
      results: [
        { qId: 'q1', chosen: 0, correct: true, timeMs: 4200 },
        { qId: 'q2', chosen: 2, correct: false, timeMs: 6100 },
      ],
    });

    expect(localStorage.getItem(ACTIVITY_KEY)).not.toBeNull();
    expect(localStorage.getItem(PERQ_KEY)).not.toBeNull();
    // Neither store may write into the other's key.
    expect(localStorage.getItem(ACTIVITY_KEY)).not.toContain('perQ');
    expect(localStorage.getItem(PERQ_KEY)).not.toContain('attackRuns');
  });

  it('survives corrupt stored JSON rather than throwing', async () => {
    localStorage.setItem(ACTIVITY_KEY, '{ not json');
    localStorage.setItem(PERQ_KEY, 'also not json');

    const activity = await import('@/lib/progress-store');
    const perQuestion = await import('@/lib/quiz-progress');

    expect(() => activity.loadProgress()).not.toThrow();
    expect(() => perQuestion.loadProgress()).not.toThrow();
    expect(activity.loadProgress().quizRuns).toEqual([]);
  });
});

describe('backup covers both stores', () => {
  it('exports and restores every key the app persists', async () => {
    const activity = await import('@/lib/progress-store');
    const backup = await import('@/lib/progress-backup');

    activity.recordQuizRun({ certId: 'SecAI', total: 5, correct: 5, skipped: 0 });
    localStorage.setItem(PERQ_KEY, JSON.stringify({ sessions: [], perQ: { q1: { timesSeen: 3 } } }));
    localStorage.setItem('securingai:settings:v1', JSON.stringify({ denseTables: true }));

    const snapshot = backup.buildBackup();
    expect(snapshot.format).toBe('securingai-progress');
    expect(snapshot.progress).not.toBeNull();
    expect(snapshot.quizProgress).not.toBeNull();
    expect(snapshot.settings).not.toBeNull();

    localStorage.clear();
    const result = backup.restoreBackup(JSON.stringify(snapshot));
    expect(result.ok).toBe(true);
    expect(localStorage.getItem(ACTIVITY_KEY)).not.toBeNull();
    expect(localStorage.getItem(PERQ_KEY)).not.toBeNull();
    expect(localStorage.getItem('securingai:settings:v1')).not.toBeNull();
  });

  it('refuses a file that is not one of our backups', async () => {
    const backup = await import('@/lib/progress-backup');
    expect(backup.restoreBackup('{"format":"something-else"}').ok).toBe(false);
    expect(backup.restoreBackup('not json at all').ok).toBe(false);
  });

  it('refuses a backup written by a newer app version', async () => {
    const backup = await import('@/lib/progress-backup');
    const future = JSON.stringify({ format: 'securingai-progress', version: 99 });
    const result = backup.restoreBackup(future);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/newer version/i);
  });
});
