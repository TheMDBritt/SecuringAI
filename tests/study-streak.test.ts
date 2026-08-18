/**
 * The daily rhythm the app had no concept of.
 *
 * Streaks are derived from session history rather than stored, so they cannot
 * disagree with the record. The subtle cases are the boundary ones: a streak
 * must not read as lost between midnight and the first question of the day,
 * and must not survive a skipped day.
 */
import { describe, it, expect } from 'vitest';
import { studyStreak } from '@/lib/study-streak';
import type { SessionRecord } from '@/lib/quiz-progress';

const DAY = 86_400_000;
const NOW = Date.parse('2026-06-15T18:00:00Z');

const session = (daysAgo: number, count = 10): SessionRecord => ({
  id: `s${daysAgo}`, startedAt: NOW - daysAgo * DAY, cert: 'SecAI', category: 'All',
  difficulty: 'all', count, correct: count, skipped: 0, examMode: false, results: [],
});

describe('studyStreak', () => {
  it('is zero with no history', () => {
    const s = studyStreak([], 20, NOW);
    expect(s).toMatchObject({ current: 0, best: 0, todayCount: 0, studiedToday: false });
  });

  it('counts consecutive days', () => {
    const s = studyStreak([session(0), session(1), session(2)], 20, NOW);
    expect(s.current).toBe(3);
  });

  it('breaks on a skipped day', () => {
    const s = studyStreak([session(0), session(1), session(3)], 20, NOW);
    expect(s.current).toBe(2);
  });

  it('does not read as lost before the first question of the day', () => {
    // Studied yesterday, nothing yet today. Showing 0 here tells someone with a
    // three-week run that they have lost it, every single morning.
    const s = studyStreak([session(1), session(2), session(3)], 20, NOW);
    expect(s.current).toBe(3);
    expect(s.studiedToday).toBe(false);
  });

  it('does not survive missing both today and yesterday', () => {
    expect(studyStreak([session(2), session(3)], 20, NOW).current).toBe(0);
  });

  it('sums several sessions in the same day', () => {
    const s = studyStreak([session(0, 10), session(0, 15)], 20, NOW);
    expect(s.todayCount).toBe(25);
    expect(s.current).toBe(1);
  });

  it('tracks the goal', () => {
    expect(studyStreak([session(0, 10)], 20, NOW)).toMatchObject({ goalMet: false, goalPct: 50 });
    expect(studyStreak([session(0, 25)], 20, NOW)).toMatchObject({ goalMet: true, goalPct: 100 });
  });

  it('never reports more than 100% of the goal', () => {
    expect(studyStreak([session(0, 500)], 20, NOW).goalPct).toBe(100);
  });

  it('remembers a longer past run as the best', () => {
    const past = [session(10), session(11), session(12), session(13), session(14)];
    const s = studyStreak([session(0), ...past], 20, NOW);
    expect(s.current).toBe(1);
    expect(s.best).toBe(5);
  });

  it('survives a nonsense goal without dividing by zero', () => {
    const s = studyStreak([session(0, 5)], 0, NOW);
    expect(Number.isFinite(s.goalPct)).toBe(true);
    expect(s.goalMet).toBe(true);
  });
});
