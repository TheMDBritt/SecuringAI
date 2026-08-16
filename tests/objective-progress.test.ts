import { describe, it, expect } from 'vitest';
import { objectiveBreakdown } from '@/lib/objective-progress';
import { OBJECTIVE_TITLES } from '@/lib/objective-titles';
import { QUIZ_INDEX } from '@/lib/quiz-index';
import type { ProgressData } from '@/lib/quiz-progress';

const WEIGHTS = { '1': 0.17, '2': 0.4, '3': 0.24, '4': 0.19 };
const empty: ProgressData = { sessions: [], perQ: {} };

describe('objective breakdown', () => {
  it('covers every objective the SecAI+ bank is tagged against', () => {
    const stats = objectiveBreakdown(empty, 'SecAI', WEIGHTS);
    const tagged = new Set(
      QUIZ_INDEX.flatMap((q) => (q.certTags.includes('SecAI') ? q.objectives : [])).filter((o) =>
        o.startsWith('SecAI:'),
      ),
    );
    expect(new Set(stats.map((s) => s.id))).toEqual(tagged);
  });

  it('names every objective it reports', () => {
    const unnamed = objectiveBreakdown(empty, 'SecAI', WEIGHTS).filter(
      (s) => !OBJECTIVE_TITLES[s.id],
    );
    expect(unnamed.map((s) => s.id)).toEqual([]);
  });

  it('ranks a weak heavy objective above a weak light one', () => {
    // Both answered badly; the one in the 40% domain has to come first,
    // because that is where an hour of study pays.
    const heavy = QUIZ_INDEX.find(
      (q) => q.certTags.includes('SecAI') && q.objectives.includes('SecAI:2.6'),
    )!;
    const light = QUIZ_INDEX.find(
      (q) => q.certTags.includes('SecAI') && q.objectives.includes('SecAI:1.2'),
    )!;

    const data: ProgressData = {
      sessions: [],
      perQ: {
        [heavy.id]: { timesSeen: 4, timesRight: 1, lastSeen: Date.now() },
        [light.id]: { timesSeen: 4, timesRight: 1, lastSeen: Date.now() },
      },
    };

    const stats = objectiveBreakdown(data, 'SecAI', WEIGHTS);
    const heavyRank = stats.findIndex((s) => s.id === 'SecAI:2.6');
    const lightRank = stats.findIndex((s) => s.id === 'SecAI:1.2');
    expect(heavyRank).toBeLessThan(lightRank);
  });

  it('reports accuracy from attempts, not from question count', () => {
    const q = QUIZ_INDEX.find(
      (x) => x.certTags.includes('SecAI') && x.objectives.includes('SecAI:2.6'),
    )!;
    const data: ProgressData = {
      sessions: [],
      perQ: { [q.id]: { timesSeen: 4, timesRight: 3, lastSeen: Date.now() } },
    };
    const stat = objectiveBreakdown(data, 'SecAI', WEIGHTS).find((s) => s.id === 'SecAI:2.6')!;
    expect(stat.attempts).toBe(4);
    expect(stat.correct).toBe(3);
    expect(stat.accuracy).toBeCloseTo(0.75);
    expect(stat.seen).toBe(1);
  });

  it('leaves accuracy null when nothing has been attempted', () => {
    const stats = objectiveBreakdown(empty, 'SecAI', WEIGHTS);
    expect(stats.every((s) => s.accuracy === null)).toBe(true);
    // Still ranked, so an untouched objective surfaces as a gap rather than
    // disappearing behind "no data".
    expect(stats[0].domain).toBe('2');
  });
});
