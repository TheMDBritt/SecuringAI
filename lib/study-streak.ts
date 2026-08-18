'use client';

/**
 * Daily study rhythm: streak, today's count, goal progress.
 *
 * The app had no concept of a day at all. Nothing recorded whether you studied
 * today, nothing compared today with yesterday, and so nothing gave a reason to
 * come back tomorrow. For a study tool that is the whole retention loop, and
 * every commercial competitor ships it.
 *
 * Derived from session history rather than stored separately, deliberately.
 * A stored counter has to be kept correct across two devices merging their
 * histories out of order, and would be wrong the first time a sync landed
 * yesterday's work today. Sessions are the record of what happened; the streak
 * is a reading of them, so it cannot disagree with them.
 *
 * Days are local, not UTC. A streak is about the learner's evening, and
 * counting in UTC would break it for anyone west of Greenwich studying after
 * their local midnight boundary but before UTC's.
 */
import type { SessionRecord } from './quiz-progress';

const DAY_MS = 86_400_000;

/** Local midnight for the day containing `ms`, as a day index. */
function dayIndex(ms: number): number {
  const d = new Date(ms);
  return Math.floor((ms - d.getTimezoneOffset() * 60_000) / DAY_MS);
}

export interface StreakInfo {
  /** Consecutive days studied, counting back from today. */
  current: number;
  /** Longest run ever recorded. */
  best: number;
  /** Questions answered today. */
  todayCount: number;
  /** True when today already counts toward the streak. */
  studiedToday: boolean;
}

export function studyStreak(
  sessions: SessionRecord[],
  goal: number,
  now = Date.now(),
): StreakInfo & { goal: number; goalMet: boolean; goalPct: number } {
  const perDay = new Map<number, number>();
  for (const s of sessions) {
    const d = dayIndex(s.startedAt);
    perDay.set(d, (perDay.get(d) ?? 0) + s.count);
  }

  const today = dayIndex(now);
  const todayCount = perDay.get(today) ?? 0;
  const studiedToday = todayCount > 0;

  // Counting back from today, or from yesterday when today has not started.
  // Anchoring only on today would show a hard-won streak as zero every morning
  // until the first question, which reads as having lost it.
  let current = 0;
  let cursor = studiedToday ? today : today - 1;
  while (perDay.has(cursor)) {
    current++;
    cursor--;
  }

  let best = 0;
  let run = 0;
  const days = [...perDay.keys()].sort((a, b) => a - b);
  for (let i = 0; i < days.length; i++) {
    run = i > 0 && days[i] === days[i - 1] + 1 ? run + 1 : 1;
    if (run > best) best = run;
  }

  const safeGoal = Math.max(1, goal);
  return {
    current,
    best: Math.max(best, current),
    todayCount,
    studiedToday,
    goal: safeGoal,
    goalMet: todayCount >= safeGoal,
    goalPct: Math.min(100, Math.round((todayCount / safeGoal) * 100)),
  };
}
