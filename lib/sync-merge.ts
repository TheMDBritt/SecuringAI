/**
 * Merging two copies of study progress.
 *
 * This is the part of sync that can quietly destroy work, so it lives on its
 * own with no I/O and is tested directly. Every function here is pure and
 * idempotent: merging a copy with itself changes nothing, and merging in either
 * order gives the same result. That matters because two devices can both be
 * offline, both record work, and both sync later in an order nobody controls.
 *
 * The rule throughout is that a merge never removes an entry. Both stores are
 * append-only logs of things that actually happened, keyed by a unique id, so a
 * union by id is the honest answer. Last-write-wins would throw away whichever
 * device happened to sync second, which for study history means losing a
 * session someone actually sat.
 */
import type { ProgressState, QuizRun, AttackRun } from './progress-store';
import type { ProgressData, SessionRecord, QuestionStats } from './quiz-progress';

/** The two documents that travel. Display settings deliberately do not. */
export interface SyncPayload {
  activity: ProgressState;
  quiz: ProgressData;
}

export const EMPTY_PAYLOAD: SyncPayload = {
  activity: { quizRuns: [], attackRuns: [] },
  quiz: { sessions: [], perQ: {} },
};

/**
 * Union of two lists by id, newest first.
 *
 * Where both sides hold the same id the local copy wins. They should be
 * identical, since a record is written once and never edited, but preferring
 * local means a device never sees its own just-written entry replaced by an
 * older mirror of itself mid-session.
 */
function unionById<T extends { id: string }>(
  local: T[],
  remote: T[],
  sortKey: (item: T) => number,
): T[] {
  const byId = new Map<string, T>();
  for (const item of remote) if (item && typeof item.id === 'string') byId.set(item.id, item);
  for (const item of local) if (item && typeof item.id === 'string') byId.set(item.id, item);
  return [...byId.values()].sort((a, b) => sortKey(b) - sortKey(a));
}

const runTime = (r: QuizRun | AttackRun) => Date.parse(r.at) || 0;

/**
 * Per-question statistics.
 *
 * These outlive the 90-day session window on purpose: loadProgress prunes old
 * sessions but keeps perQ, because it drives the spaced repetition weighting
 * and a question answered a year ago is still a question you have seen.
 * Rebuilding perQ from the merged sessions would therefore delete real history,
 * so stored values are merged directly.
 *
 * Fields take the maximum rather than the sum. Summing is only correct when the
 * two sides are disjoint, and they usually overlap heavily because both devices
 * have synced before; summing would inflate counts every single sync until the
 * weighting became meaningless. Max is exact whenever one side has seen
 * everything the other has, which is the normal case, and where two devices
 * genuinely each saw a question in different pruned sessions it undercounts.
 * That errs toward showing the question again sooner, which is the safe
 * direction for a study tool.
 */
function mergeQuestionStats(
  local: Record<string, QuestionStats>,
  remote: Record<string, QuestionStats>,
): Record<string, QuestionStats> {
  const out: Record<string, QuestionStats> = {};
  const ids = new Set([...Object.keys(local ?? {}), ...Object.keys(remote ?? {})]);

  for (const qId of ids) {
    const a = local?.[qId];
    const b = remote?.[qId];
    if (!a) { if (b) out[qId] = b; continue; }
    if (!b) { out[qId] = a; continue; }

    const timesSeen = Math.max(a.timesSeen ?? 0, b.timesSeen ?? 0);
    out[qId] = {
      qId,
      timesSeen,
      // Cannot exceed the number of times the question was seen, whatever the
      // two sides claim separately.
      timesRight: Math.min(timesSeen, Math.max(a.timesRight ?? 0, b.timesRight ?? 0)),
      lastSeenAt: Math.max(a.lastSeenAt ?? 0, b.lastSeenAt ?? 0),
    };
  }
  return out;
}

/** Merge a local payload with a remote one. Order-independent and idempotent. */
export function mergePayloads(local: SyncPayload, remote: SyncPayload): SyncPayload {
  const l = normalise(local);
  const r = normalise(remote);

  return {
    activity: {
      quizRuns: unionById(l.activity.quizRuns, r.activity.quizRuns, runTime),
      attackRuns: unionById(l.activity.attackRuns, r.activity.attackRuns, runTime),
    },
    quiz: {
      sessions: unionById<SessionRecord>(
        l.quiz.sessions,
        r.quiz.sessions,
        (s) => s.startedAt ?? 0,
      ),
      perQ: mergeQuestionStats(l.quiz.perQ, r.quiz.perQ),
    },
  };
}

/**
 * Coerce anything that came out of storage or off the wire into the shape the
 * merge expects.
 *
 * The remote document is user-writable through the API, and the local one is
 * hand-editable in devtools, so neither can be trusted to be well formed. A
 * malformed side must degrade to empty rather than throw, or one bad record
 * would block every future sync on that device.
 */
export function normalise(input: unknown): SyncPayload {
  const src = (input ?? {}) as Partial<SyncPayload>;
  const activity = (src.activity ?? {}) as Partial<ProgressState>;
  const quiz = (src.quiz ?? {}) as Partial<ProgressData>;

  const list = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]).filter(Boolean) : []);

  return {
    activity: {
      quizRuns: list<QuizRun>(activity.quizRuns).filter((r) => typeof r.id === 'string'),
      attackRuns: list<AttackRun>(activity.attackRuns).filter((r) => typeof r.id === 'string'),
    },
    quiz: {
      sessions: list<SessionRecord>(quiz.sessions).filter((s) => typeof s.id === 'string'),
      perQ:
        quiz.perQ && typeof quiz.perQ === 'object' && !Array.isArray(quiz.perQ)
          ? (quiz.perQ as Record<string, QuestionStats>)
          : {},
    },
  };
}

/**
 * Whether two payloads hold the same work.
 *
 * Used to skip a pointless upload after a merge that changed nothing, which is
 * the common case: most syncs happen when neither side has moved.
 */
export function sameWork(a: SyncPayload, b: SyncPayload): boolean {
  const ids = (p: SyncPayload) =>
    [
      ...p.activity.quizRuns.map((r) => 'r' + r.id),
      ...p.activity.attackRuns.map((r) => 'a' + r.id),
      ...p.quiz.sessions.map((s) => 's' + s.id),
    ].sort();
  const left = ids(a);
  const right = ids(b);
  if (left.length !== right.length) return false;
  if (left.some((v, i) => v !== right[i])) return false;

  // Session ids can match while per-question counts have moved on, which
  // happens when a device answers questions from a session it already had.
  const qa = a.quiz.perQ;
  const qb = b.quiz.perQ;
  const keys = new Set([...Object.keys(qa), ...Object.keys(qb)]);
  for (const k of keys) {
    if ((qa[k]?.timesSeen ?? 0) !== (qb[k]?.timesSeen ?? 0)) return false;
    if ((qa[k]?.timesRight ?? 0) !== (qb[k]?.timesRight ?? 0)) return false;
  }
  return true;
}
