/**
 * Merge correctness.
 *
 * Sync is the one feature in this app that can destroy work a person actually
 * did. A dropped session is unrecoverable: there is no server-side history to
 * restore from, and the learner will not notice until they look for a session
 * that is no longer there.
 *
 * So the properties are asserted directly rather than through the UI:
 * a merge never loses an entry, merging is order-independent, merging twice
 * changes nothing, and per-question counts never inflate on repeat syncs.
 */
import { describe, it, expect } from 'vitest';
import { mergePayloads, normalise, sameWork, EMPTY_PAYLOAD, type SyncPayload } from '@/lib/sync-merge';

const run = (id: string, at: string) => ({
  id, total: 10, correct: 7, skipped: 0, at,
});
const attack = (id: string, at: string) => ({
  id, dojoId: 1 as const, scenarioId: 'prompt-injection', scenarioTitle: 'Prompt Injection',
  attackType: 'prompt_injection', succeeded: false, score: 80, verdict: 'BLOCKED', at,
});
const session = (id: string, startedAt: number, cert = 'SecAI') => ({
  id, startedAt, cert, category: 'All', difficulty: 'all' as const,
  count: 5, correct: 3, skipped: 0, examMode: false,
  results: [{ qId: 'q1', chosen: 0, correct: true, timeMs: 100 }],
});
const stat = (qId: string, seen: number, right: number, last: number) => ({
  qId, timesSeen: seen, timesRight: right, lastSeenAt: last,
});

const payload = (over: Partial<SyncPayload> = {}): SyncPayload => ({
  activity: { quizRuns: [], attackRuns: [], ...(over.activity ?? {}) },
  quiz: { sessions: [], perQ: {}, ...(over.quiz ?? {}) },
});

describe('a merge never loses work', () => {
  it('keeps entries that exist on only one side', () => {
    const local = payload({ activity: { quizRuns: [run('a', '2026-01-01T00:00:00Z')], attackRuns: [] } });
    const remote = payload({ activity: { quizRuns: [run('b', '2026-01-02T00:00:00Z')], attackRuns: [] } });
    const merged = mergePayloads(local, remote);
    expect(merged.activity.quizRuns.map((r) => r.id).sort()).toEqual(['a', 'b']);
  });

  it('keeps sessions from both devices', () => {
    const phone = payload({ quiz: { sessions: [session('phone-1', 2000)], perQ: {} } });
    const laptop = payload({ quiz: { sessions: [session('laptop-1', 1000)], perQ: {} } });
    const merged = mergePayloads(phone, laptop);
    expect(merged.quiz.sessions.map((s) => s.id)).toEqual(['phone-1', 'laptop-1']);
  });

  it('keeps dojo attack runs from both devices', () => {
    const a = payload({ activity: { quizRuns: [], attackRuns: [attack('x', '2026-01-01T00:00:00Z')] } });
    const b = payload({ activity: { quizRuns: [], attackRuns: [attack('y', '2026-01-02T00:00:00Z')] } });
    expect(mergePayloads(a, b).activity.attackRuns.map((r) => r.id).sort()).toEqual(['x', 'y']);
  });

  it('never drops a record when one side is empty', () => {
    const local = payload({
      activity: { quizRuns: [run('a', '2026-01-01T00:00:00Z')], attackRuns: [attack('b', '2026-01-01T00:00:00Z')] },
      quiz: { sessions: [session('s', 100)], perQ: { q1: stat('q1', 3, 2, 500) } },
    });
    expect(mergePayloads(local, EMPTY_PAYLOAD)).toEqual(mergePayloads(EMPTY_PAYLOAD, local));
    expect(mergePayloads(local, EMPTY_PAYLOAD).quiz.sessions).toHaveLength(1);
  });
});

describe('order and repetition do not change the result', () => {
  const local = payload({
    activity: { quizRuns: [run('a', '2026-01-03T00:00:00Z')], attackRuns: [attack('p', '2026-01-01T00:00:00Z')] },
    quiz: { sessions: [session('s1', 3000)], perQ: { q1: stat('q1', 4, 3, 900) } },
  });
  const remote = payload({
    activity: { quizRuns: [run('b', '2026-01-01T00:00:00Z')], attackRuns: [attack('q', '2026-01-02T00:00:00Z')] },
    quiz: { sessions: [session('s2', 1000)], perQ: { q1: stat('q1', 2, 1, 400), q2: stat('q2', 1, 0, 100) } },
  });

  it('is order independent', () => {
    expect(mergePayloads(local, remote)).toEqual(mergePayloads(remote, local));
  });

  it('is idempotent', () => {
    const once = mergePayloads(local, remote);
    expect(mergePayloads(once, remote)).toEqual(once);
    expect(mergePayloads(once, once)).toEqual(once);
  });

  it('does not inflate question counts when the same sync repeats', () => {
    // The failure this guards against: summing counts instead of taking the
    // maximum. Two devices that have already synced hold overlapping history,
    // so summing would grow timesSeen on every sync until the spaced repetition
    // weighting stopped meaning anything.
    let merged = mergePayloads(local, remote);
    for (let i = 0; i < 20; i++) merged = mergePayloads(merged, remote);
    expect(merged.quiz.perQ.q1.timesSeen).toBe(4);
    expect(merged.quiz.perQ.q1.timesRight).toBe(3);
  });
});

describe('per-question statistics', () => {
  it('takes the higher count from either side', () => {
    const a = payload({ quiz: { sessions: [], perQ: { q: stat('q', 5, 4, 100) } } });
    const b = payload({ quiz: { sessions: [], perQ: { q: stat('q', 2, 2, 900) } } });
    const m = mergePayloads(a, b).quiz.perQ.q;
    expect(m.timesSeen).toBe(5);
    expect(m.lastSeenAt).toBe(900);
  });

  it('never lets correct answers exceed attempts', () => {
    // Two sides can disagree in a way that makes a naive max nonsensical.
    const a = payload({ quiz: { sessions: [], perQ: { q: stat('q', 3, 0, 10) } } });
    const b = payload({ quiz: { sessions: [], perQ: { q: stat('q', 1, 9, 20) } } });
    const m = mergePayloads(a, b).quiz.perQ.q;
    expect(m.timesRight).toBeLessThanOrEqual(m.timesSeen);
  });

  it('keeps stats for questions whose sessions have aged out', () => {
    // loadProgress prunes sessions past 90 days but deliberately keeps perQ.
    // Rebuilding perQ from the merged sessions would delete that history, which
    // is exactly what drives spaced repetition.
    const withHistory = payload({ quiz: { sessions: [], perQ: { old: stat('old', 12, 9, 1) } } });
    const fresh = payload({ quiz: { sessions: [session('s', 9_000_000)], perQ: {} } });
    const merged = mergePayloads(fresh, withHistory);
    expect(merged.quiz.perQ.old.timesSeen).toBe(12);
  });
});

describe('malformed input degrades instead of throwing', () => {
  // The remote document is writable through the API and the local one is
  // editable in devtools. One bad record must not wedge sync forever.
  it('survives nulls, wrong types and missing fields', () => {
    for (const junk of [null, undefined, 42, 'text', [], { activity: 5 }, { quiz: { sessions: 'no', perQ: [] } }]) {
      expect(() => normalise(junk)).not.toThrow();
      expect(normalise(junk)).toEqual(EMPTY_PAYLOAD);
    }
  });

  it('drops records with no id rather than merging them into one bucket', () => {
    const messy = normalise({
      activity: { quizRuns: [{ total: 1 }, run('ok', '2026-01-01T00:00:00Z')], attackRuns: [] },
      quiz: { sessions: [{ startedAt: 1 }, session('fine', 2)], perQ: {} },
    });
    expect(messy.activity.quizRuns.map((r) => r.id)).toEqual(['ok']);
    expect(messy.quiz.sessions.map((s) => s.id)).toEqual(['fine']);
  });

  it('merges cleanly when one side is entirely junk', () => {
    const good = payload({ quiz: { sessions: [session('s', 1)], perQ: {} } });
    const merged = mergePayloads(good, normalise('garbage'));
    expect(merged.quiz.sessions).toHaveLength(1);
  });
});

describe('sameWork decides whether an upload is needed', () => {
  it('is true for identical payloads', () => {
    const p = payload({ quiz: { sessions: [session('s', 1)], perQ: { q: stat('q', 1, 1, 1) } } });
    expect(sameWork(p, p)).toBe(true);
  });

  it('is false when one side has an extra session', () => {
    const a = payload({ quiz: { sessions: [session('s', 1)], perQ: {} } });
    const b = payload({ quiz: { sessions: [session('s', 1), session('t', 2)], perQ: {} } });
    expect(sameWork(a, b)).toBe(false);
  });

  it('is false when only the per-question counts moved', () => {
    // Answering more questions from a session already on both sides changes
    // nothing about the id list, and still needs uploading.
    const a = payload({ quiz: { sessions: [session('s', 1)], perQ: { q: stat('q', 1, 1, 1) } } });
    const b = payload({ quiz: { sessions: [session('s', 1)], perQ: { q: stat('q', 4, 3, 9) } } });
    expect(sameWork(a, b)).toBe(false);
  });

  it('ignores ordering', () => {
    const a = payload({ activity: { quizRuns: [run('x', '2026-01-01T00:00:00Z'), run('y', '2026-01-02T00:00:00Z')], attackRuns: [] } });
    const b = payload({ activity: { quizRuns: [run('y', '2026-01-02T00:00:00Z'), run('x', '2026-01-01T00:00:00Z')], attackRuns: [] } });
    expect(sameWork(a, b)).toBe(true);
  });
});
