/**
 * The readiness card is the app's answer to "should I book the exam?". Getting it wrong
 * in either direction is costly: telling a ready learner they are not ready wastes weeks,
 * telling an unready learner they are ready costs them the exam fee and the attempt.
 *
 * The previous model scored min(coverage, accuracy) over lifetime sessions, so going
 * green on SecAI+ required having personally seen 762 of 989 questions. The first case
 * below is the one that model got wrong, and it is the reason this file exists.
 */
import { describe, it, expect } from 'vitest';
import { readinessScore } from '@/lib/quiz-progress';
import type { ProgressData, SessionRecord } from '@/lib/quiz-progress';

const DAY = 24 * 60 * 60 * 1000;

function session(over: Partial<SessionRecord> & { count: number; correct: number }): SessionRecord {
  return {
    id: Math.random().toString(36).slice(2),
    startedAt: Date.now() - DAY,
    cert: 'SecAI',
    category: 'All',
    difficulty: 'all',
    skipped: 0,
    examMode: false,
    // Distinct ids so coverage reflects the question count.
    results: Array.from({ length: over.count }, (_, i) => ({
      qId: `q-${Math.random().toString(36).slice(2)}-${i}`,
      chosen: 0,
      correct: i < over.correct,
      timeMs: 1000,
    })),
    ...over,
  } as SessionRecord;
}

function data(sessions: SessionRecord[]): ProgressData {
  return { sessions, perQ: {} } as ProgressData;
}

const POOL = 989;
const PASS = 67;

describe('readiness', () => {
  it('reads ready for a learner who passes mocks on a fraction of the pool', () => {
    // 200 questions of practice at 85%, plus two mocks comfortably clear of the pass
    // mark. Coverage is ~26%. The old model scored min(26, 85) = 26 and read RED.
    const r = readinessScore(
      data([
        session({ count: 200, correct: 170 }),
        session({ count: 60, correct: 48, examMode: true }),
        session({ count: 60, correct: 47, examMode: true }),
      ]),
      'SecAI', POOL, PASS,
    );
    expect(r.status).toBe('green');
    expect(r.basis).toBe('mock');
    expect(r.mockCount).toBe(2);
  });

  it('never reads ready without a mock, however good the practice', () => {
    const r = readinessScore(data([session({ count: 400, correct: 396 })]), 'SecAI', POOL, PASS);
    expect(r.basis).toBe('practice');
    expect(r.status).toBe('amber');
    expect(r.status).not.toBe('green');
    expect(r.reason).toMatch(/mock/i);
  });

  it('holds a single passing mock at borderline', () => {
    // One good day is not evidence. Two is.
    const r = readinessScore(
      data([session({ count: 60, correct: 48, examMode: true })]),
      'SecAI', POOL, PASS,
    );
    expect(r.status).toBe('amber');
    expect(r.reason).toMatch(/another|good day/i);
  });

  it('reads not ready when mocks are below the pass mark', () => {
    const r = readinessScore(
      data([
        session({ count: 60, correct: 30, examMode: true }),
        session({ count: 60, correct: 33, examMode: true }),
      ]),
      'SecAI', POOL, PASS,
    );
    expect(r.status).toBe('red');
    expect(r.score).toBeLessThan(PASS);
  });

  it('does not let strong mocks on a sliver of the pool read as ready', () => {
    // 60 of 989 seen is ~6% coverage. Passing twice on that is thin evidence.
    const r = readinessScore(
      data([
        session({ count: 30, correct: 27, examMode: true }),
        session({ count: 30, correct: 28, examMode: true }),
      ]),
      'SecAI', POOL, PASS,
    );
    expect(r.status).toBe('amber');
    expect(r.reason).toMatch(/coverage|pool has been seen/i);
  });

  it('scores from recent mocks, not from ancient ones', () => {
    const old = session({ count: 60, correct: 20, examMode: true, startedAt: Date.now() - 300 * DAY });
    const recent = [
      session({ count: 60, correct: 50, examMode: true }),
      session({ count: 60, correct: 51, examMode: true }),
      session({ count: 60, correct: 49, examMode: true }),
    ];
    const r = readinessScore(data([old, ...recent]), 'SecAI', POOL, PASS);
    // Only the three most recent count, so the ancient 33% must not drag it down.
    expect(r.mockCount).toBe(3);
    expect(r.score).toBeGreaterThan(PASS);
  });

  it('ignores early attempts when measuring recent practice', () => {
    const ancient = session({ count: 200, correct: 20, startedAt: Date.now() - 200 * DAY });
    const now = session({ count: 100, correct: 88 });
    const r = readinessScore(data([ancient, now]), 'SecAI', POOL, PASS);
    // Lifetime accuracy would be 36%. Recent practice is 88%.
    expect(r.practicePct).toBe(88);
  });

  it('reports an honest empty state before anything is answered', () => {
    const r = readinessScore(data([]), 'SecAI', POOL, PASS);
    expect(r.basis).toBe('none');
    expect(r.status).toBe('red');
    expect(r.mockPct).toBeNull();
    expect(r.score).toBe(0);
  });

  it('scopes to the selected cert', () => {
    const r = readinessScore(
      data([
        session({ count: 60, correct: 58, examMode: true, cert: 'SC-500' }),
        session({ count: 60, correct: 20, examMode: true, cert: 'SecAI' }),
      ]),
      'SecAI', POOL, PASS,
    );
    expect(r.mockCount).toBe(1);
    expect(r.status).toBe('red');
  });
});
