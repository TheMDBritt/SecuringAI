/**
 * Spaced repetition, now that it exists.
 *
 * The file header claimed "Anki-style spaced repetition" for a long time while
 * the entire scheduler was `max(0.5, 2 - accuracy)`. `lastSeenAt` was written
 * on every answer and read by nothing, so a question answered correctly
 * yesterday and one answered correctly eight months ago were indistinguishable.
 * These tests pin the behaviour the claim always described.
 */
import { describe, it, expect } from 'vitest';
import { schedule, dueAtFor, isDue, dueCounts, type QuestionStats } from '@/lib/quiz-progress';

const DAY = 86_400_000;
const NOW = Date.parse('2026-06-01T12:00:00Z');

const stat = (over: Partial<QuestionStats> = {}): QuestionStats => ({
  qId: 'q1', timesSeen: 1, timesRight: 1, lastSeenAt: NOW, ...over,
});

describe('schedule', () => {
  it('starts a new question at one day', () => {
    const s = schedule(undefined, true, NOW);
    expect(s.intervalDays).toBe(1);
    expect(s.dueAt).toBe(NOW + DAY);
  });

  it('grows the gap each time it is answered correctly', () => {
    let prev = stat(schedule(undefined, true, NOW));
    const intervals: number[] = [prev.intervalDays!];
    for (let i = 0; i < 4; i++) {
      const next = schedule(prev, true, NOW);
      intervals.push(next.intervalDays);
      prev = stat(next);
    }
    // Strictly increasing: that is the entire point of spacing.
    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]).toBeGreaterThan(intervals[i - 1]);
    }
  });

  it('sends a missed question back to tomorrow however well it was known', () => {
    const known = stat({ intervalDays: 90, ease: 2.8 });
    const next = schedule(known, false, NOW);
    expect(next.intervalDays).toBe(1);
    expect(next.dueAt).toBe(NOW + DAY);
  });

  it('makes a repeatedly missed question return faster than a fresh one', () => {
    let prev = stat({ intervalDays: 10, ease: 2.5 });
    for (let i = 0; i < 3; i++) prev = stat(schedule(prev, false, NOW));
    expect(prev.ease).toBeLessThan(2.5);
  });

  it('never lets ease collapse below the SM-2 floor', () => {
    let prev = stat({ ease: 1.4 });
    for (let i = 0; i < 20; i++) prev = stat(schedule(prev, false, NOW));
    expect(prev.ease).toBeGreaterThanOrEqual(1.3);
  });

  it('caps how far out a question can drift', () => {
    let prev = stat({ intervalDays: 150, ease: 3 });
    for (let i = 0; i < 10; i++) prev = stat(schedule(prev, true, NOW));
    expect(prev.intervalDays).toBeLessThanOrEqual(180);
  });
});

describe('dueAtFor', () => {
  it('treats never-seen questions as due now', () => {
    expect(dueAtFor(undefined)).toBe(0);
    expect(dueAtFor(stat({ timesSeen: 0, timesRight: 0 }))).toBe(0);
  });

  it('uses the stored due date when one exists', () => {
    expect(dueAtFor(stat({ dueAt: NOW + 5 * DAY }))).toBe(NOW + 5 * DAY);
  });

  it('infers a due date for records written before scheduling existed', () => {
    // Existing users have lastSeenAt and nothing else. Treating them all as due
    // would dump an entire history into one queue; treating them as never due
    // would hide them forever.
    const wellKnown = stat({ timesSeen: 10, timesRight: 10, lastSeenAt: NOW });
    const shaky = stat({ timesSeen: 10, timesRight: 3, lastSeenAt: NOW });
    expect(dueAtFor(wellKnown)).toBeGreaterThan(dueAtFor(shaky));
  });

  it('brings an old weak question due, and holds back a recent strong one', () => {
    const oldWeak = stat({ timesSeen: 4, timesRight: 1, lastSeenAt: NOW - 60 * DAY });
    const recentStrong = stat({ timesSeen: 4, timesRight: 4, lastSeenAt: NOW });
    expect(isDue(oldWeak, NOW)).toBe(true);
    expect(isDue(recentStrong, NOW)).toBe(false);
  });
});

describe('dueCounts', () => {
  it('separates new material from review', () => {
    const perQ: Record<string, QuestionStats> = {
      seen_due: stat({ qId: 'seen_due', dueAt: NOW - DAY }),
      seen_later: stat({ qId: 'seen_later', dueAt: NOW + 5 * DAY }),
    };
    expect(dueCounts(['seen_due', 'seen_later', 'brand_new'], perQ, NOW)).toEqual({
      due: 1, fresh: 1, later: 1,
    });
  });

  it('counts nothing for an empty pool', () => {
    expect(dueCounts([], {}, NOW)).toEqual({ due: 0, fresh: 0, later: 0 });
  });
});

describe('recording an answer advances the schedule', () => {
  it('does not advance the schedule for a skipped question', async () => {
    // A skip was never judged. Treating it as correct pushes it weeks out on no
    // evidence; treating it as wrong punishes running out of time in a mock.
    const store = new Map<string, string>();
    const localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).window = { localStorage, dispatchEvent: () => true };

    const { recordSession, loadProgress } = await import('@/lib/quiz-progress');
    recordSession({
      cert: 'SecAI', category: 'All', difficulty: 'all', examMode: true,
      results: [
        { qId: 'answered', chosen: 1, correct: true, timeMs: 100 },
        { qId: 'skipped', chosen: null, correct: false, timeMs: 0 },
      ],
    });

    const perQ = loadProgress().perQ;
    expect(perQ.answered.dueAt).toBeGreaterThan(Date.now());
    expect(perQ.skipped.dueAt).toBeUndefined();
    // It was still shown, so it still counts as seen.
    expect(perQ.skipped.timesSeen).toBe(1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).window;
  });
});
