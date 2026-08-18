/**
 * PER-QUESTION STATISTICS. One of two progress stores.
 *
 * This file holds question-grain data: how often each question was seen and
 * answered correctly, which drives spaced repetition, plus full session records
 * for the review view. Its sibling lib/progress-store.ts holds the coarse
 * activity log that the dashboard reads. See the header of that file for how
 * the two relate and why both export a `loadProgress`.
 *
 * Quiz progression tracking, localStorage only, no accounts, no network.
 *
 * Data model
 * ─────────────────────────────────────────────────────────────────────────────
 * `sessions`  : rolling two-year window of completed quiz sessions
 * `perQ`      : forever-retained aggregate per question ID
 *   - timesSeen, timesRight, lastSeenAt, dueAt, intervalDays, ease
 *
 * The session window is enforced on write only. Pruning on read destroyed
 * history simply because someone opened the app after a long gap, and because
 * sync reads through the same path it propagated that deletion to every other
 * device. See loadProgress.
 *
 * Review is scheduled, not merely weighted. Each answer advances an SM-2
 * interval and ease on the question, and the picker prefers what is due and
 * how overdue it is. This file claimed spaced repetition for a long time while
 * implementing a static difficulty bias that never read lastSeenAt; see the
 * note above `schedule` for what changed and why.
 */

import { safeWrite } from './storage-health';

const STORAGE_KEY   = 'dojo-progress-v1';
// Two years, not ninety days. Someone studying for a certification takes
// months, often across a failed first sitting, and the old window quietly
// deleted the earlier half of that. The window exists to bound localStorage
// growth, and sessions are small; perQ is what actually accumulates and it is
// never pruned at all.
const SESSION_WINDOW_DAYS = 730;
const SESSION_WINDOW_MS   = SESSION_WINDOW_DAYS * 24 * 60 * 60 * 1000;

export interface QuestionResult {
  qId:      string;
  chosen:   number | null; // null = skipped in exam mode
  correct:  boolean;
  timeMs:   number;
}

export interface SessionRecord {
  id:            string;
  startedAt:     number;  // epoch ms
  cert:          string;  // 'SecAI', 'SC-500', 'All', etc.
  category:      string;
  difficulty:    'all' | 'beginner' | 'intermediate' | 'advanced';
  count:         number;
  correct:       number;
  skipped:       number;
  examMode:      boolean;
  results:       QuestionResult[];
}

export interface QuestionStats {
  qId:         string;
  timesSeen:   number;
  timesRight:  number;
  lastSeenAt:  number;
  /** Epoch ms this question next comes due. Absent on records written before scheduling existed. */
  dueAt?:      number;
  /** Current spacing in days. Absent means never scheduled. */
  intervalDays?: number;
  /** SM-2 ease factor, 1.3 upward. Absent means the default. */
  ease?:       number;
}

export interface ProgressData {
  sessions: SessionRecord[];
  perQ:     Record<string, QuestionStats>;
}

/**
 * A fresh empty state, never a shared one. See the same note in
 * progress-store.ts: handing out one mutable constant let a caller's write
 * accumulate into it, and deleted history reappeared.
 */
function emptyData(): ProgressData {
  return { sessions: [], perQ: {} };
}

// ─── Load / save ─────────────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/** Read progress from localStorage. Retention is applied on write, not here. */
export function loadProgress(): ProgressData {
  if (!isBrowser()) return emptyData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sessions: [], perQ: {} };
    const parsed = JSON.parse(raw) as ProgressData;
    // Defensive: coerce shape in case of an old / corrupted record.
    const sessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
    const perQ     = parsed.perQ && typeof parsed.perQ === 'object' ? parsed.perQ : {};
    // Deliberately not pruned here. Pruning on read meant merely opening the
    // dashboard after a long gap destroyed history, before the user had any
    // chance to export it, and before sync could push it. Worse, sync reads
    // through this path, so a device that pruned would push the pruned set and
    // evict those sessions from every other device too. Writes prune; reads
    // report what is stored.
    return { sessions, perQ };
  } catch {
    return { sessions: [], perQ: {} };
  }
}

/**
 * Fired after quiz history is written, so cross-device sync knows there is
 * something new to push.
 *
 * Deliberately its own event rather than the progress-store one. That event is
 * what the dashboards re-read on, and a quiz session writes here after every
 * single answer; reusing it would re-render the progress views mid-question for
 * no benefit. Nothing in the UI listens to this one.
 */
export const QUIZ_PROGRESS_CHANGED_EVENT = 'securingai:quiz-progress-changed';

function saveProgress(data: ProgressData): void {
  if (!isBrowser()) return;
  // A failed write used to return silently. That made sense when there was
  // nowhere else for the data to go; now that an export and cross-device sync
  // both exist, dropping a session without a word means the learner believes
  // in a record that was never written. safeWrite remembers the failure and
  // the shell raises a banner offering the export.
  if (!safeWrite(STORAGE_KEY, JSON.stringify(data))) return;
  window.dispatchEvent(new Event(QUIZ_PROGRESS_CHANGED_EVENT));
}

/** Remove sessions older than the retention window. Write path only. */
function pruneOldSessions(data: ProgressData, now: number): ProgressData {
  const cutoff = now - SESSION_WINDOW_MS;
  const kept = data.sessions.filter((s) => s.startedAt >= cutoff);
  if (kept.length === data.sessions.length) return data;
  return { sessions: kept, perQ: data.perQ };
}

// ─── Record a session ────────────────────────────────────────────────────────

export interface RecordSessionInput {
  cert:       string;
  category:   string;
  difficulty: SessionRecord['difficulty'];
  examMode:   boolean;
  results:    QuestionResult[];
}

/** Persist a completed session and update aggregate per-question stats. */
export function recordSession(input: RecordSessionInput): SessionRecord {
  const now = Date.now();
  const correct = input.results.filter((r) => r.correct).length;
  const skipped = input.results.filter((r) => r.chosen === null).length;
  const session: SessionRecord = {
    id:         `s_${now.toString(36)}_${Math.floor(now * 997 % 1e6).toString(36)}`,
    startedAt:  now,
    cert:       input.cert,
    category:   input.category,
    difficulty: input.difficulty,
    count:      input.results.length,
    correct,
    skipped,
    examMode:   input.examMode,
    results:    input.results,
  };

  const current = loadProgress();
  const nextPerQ = { ...current.perQ };
  for (const r of input.results) {
    const prev = nextPerQ[r.qId];
    // A skipped question was never judged, so it must not advance the
    // schedule. Counting a skip as correct would push it weeks out on no
    // evidence; counting it as wrong would punish running out of time.
    const answered = r.chosen !== null;
    const next = answered ? schedule(prev, r.correct, now) : null;
    nextPerQ[r.qId] = {
      qId:        r.qId,
      timesSeen:  (prev?.timesSeen  ?? 0) + 1,
      timesRight: (prev?.timesRight ?? 0) + (r.correct ? 1 : 0),
      lastSeenAt: now,
      dueAt:        next ? next.dueAt        : prev?.dueAt,
      intervalDays: next ? next.intervalDays : prev?.intervalDays,
      ease:         next ? next.ease         : prev?.ease,
    };
  }

  const next: ProgressData = pruneOldSessions(
    { sessions: [session, ...current.sessions], perQ: nextPerQ },
    now,
  );
  saveProgress(next);
  return session;
}

// ─── Reset ───────────────────────────────────────────────────────────────────

export function resetProgress(): void {
  if (!isBrowser()) return;
  try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
}

// ─── Aggregate helpers (for the dashboard) ───────────────────────────────────

export interface CertSummary {
  cert:            string;
  totalSessions:   number;
  totalQuestions:  number;
  totalCorrect:    number;
  overallPct:      number;
  bestSessionPct:  number;
  lastSessionPct:  number | null;
  trend:           number[]; // last 10 session %ages, oldest→newest
}

/** Aggregate stats for one cert scope. Pass 'All' to include everything. */
export function summarizeCert(data: ProgressData, cert: string): CertSummary {
  const scope = cert === 'All'
    ? data.sessions
    : data.sessions.filter((s) => s.cert === cert);

  const totalSessions  = scope.length;
  const totalQuestions = scope.reduce((a, s) => a + s.count, 0);
  const totalCorrect   = scope.reduce((a, s) => a + s.correct, 0);
  const overallPct     = totalQuestions === 0 ? 0 : Math.round((totalCorrect / totalQuestions) * 100);

  const pcts = scope.map((s) => s.count === 0 ? 0 : Math.round((s.correct / s.count) * 100));
  const bestSessionPct = pcts.length === 0 ? 0 : Math.max(...pcts);

  // scope is newest-first (recordSession prepends). last = newest.
  const lastSessionPct = pcts.length === 0 ? null : pcts[0];

  // For the trend line we want oldest→newest of the last 10.
  const last10OldestFirst = [...pcts].slice(0, 10).reverse();

  return {
    cert,
    totalSessions,
    totalQuestions,
    totalCorrect,
    overallPct,
    bestSessionPct,
    lastSessionPct,
    trend: last10OldestFirst,
  };
}

export interface TopicAccuracy {
  category:   string;
  seen:       number;
  right:      number;
  accuracy:   number;
}

/** Per-category accuracy heatmap for a cert scope. */
export function topicAccuracy(
  data: ProgressData,
  cert: string,
  questionCategoryLookup: Record<string, string>,
): TopicAccuracy[] {
  const scope = cert === 'All'
    ? data.sessions
    : data.sessions.filter((s) => s.cert === cert);

  const byCat: Record<string, { seen: number; right: number }> = {};
  for (const s of scope) {
    for (const r of s.results) {
      const cat = questionCategoryLookup[r.qId];
      if (!cat) continue;
      if (!byCat[cat]) byCat[cat] = { seen: 0, right: 0 };
      byCat[cat].seen  += 1;
      if (r.correct) byCat[cat].right += 1;
    }
  }
  return Object.entries(byCat)
    .map(([category, v]) => ({
      category,
      seen:     v.seen,
      right:    v.right,
      accuracy: Math.round((v.right / v.seen) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

/** Which cert scopes have session data, for the dashboard's cert switcher. */
export function certsWithData(data: ProgressData): string[] {
  const set = new Set<string>();
  for (const s of data.sessions) set.add(s.cert);
  return Array.from(set).sort();
}

// ─── Readiness score ─────────────────────────────────────────────────────────

export interface Readiness {
  /** 0-100 headline: recent mock average when mocks exist, else recent practice accuracy. */
  score:        number;
  /** What the headline is measuring, so the UI never implies more evidence than exists. */
  basis:        'mock' | 'practice' | 'none';
  /** Mock exams counted toward the headline (most recent first, capped). */
  mockCount:    number;
  /** Mean score across those mocks, or null when none have been sat. */
  mockPct:      number | null;
  /** Accuracy over recent practice only, not lifetime. */
  practicePct:  number;
  /** Distinct questions seen / total pool. Context, not a gate. */
  coveragePct:  number;
  /** Pass threshold from EXAM_CERTS[cert].passingScore. */
  passPct:      number;
  /** Traffic-light state. */
  status:       'red' | 'amber' | 'green';
  /** What to do next, in one sentence. */
  reason:       string;
}

/** Mocks averaged into the headline. Enough to smooth a fluke, few enough to stay current. */
const MOCKS_COUNTED = 3;
/** Practice older than this says little about current ability. */
const PRACTICE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
/** Below this share of the pool, a strong score is thin evidence rather than readiness. */
const THIN_COVERAGE_PCT = 20;

/**
 * Answers "am I ready for this exam?"
 *
 * The previous model scored `min(coverage, accuracy)` over lifetime sessions, which was
 * wrong in three ways that compounded:
 *
 *   - Coverage bound the score almost always, so going green on SecAI+ required having
 *     personally seen 762 of 989 questions. A learner genuinely ready after 200 well
 *     chosen questions at 85% read RED, permanently. The app told people who would pass
 *     that they were not ready.
 *   - Accuracy was lifetime cumulative, including their first ignorant attempts, and
 *     pickWeighted deliberately re-serves missed questions — so accuracy was depressed
 *     by design and never reflected current ability.
 *   - Exam-mode results were ignored entirely, despite a blueprint-weighted timed mock
 *     being the single most predictive signal available.
 *
 * So: mocks are the primary signal, recent practice is the fallback, and coverage is a
 * confidence qualifier rather than a gate. Without a full mock the status is capped at
 * amber — you cannot know you are ready for a timed paper you have never sat.
 */
export function readinessScore(
  data:     ProgressData,
  cert:     string,
  poolSize: number,
  passPct:  number,
): Readiness {
  const scope = cert === 'All'
    ? data.sessions
    : data.sessions.filter((s) => s.cert === cert);

  // Coverage: distinct questions seen against the pool. Reported for context.
  const seenIds = new Set<string>();
  for (const s of scope) for (const r of s.results) seenIds.add(r.qId);
  const coveragePct = poolSize === 0 ? 0 : Math.min(100, Math.round((seenIds.size / poolSize) * 100));

  const pct = (correct: number, count: number) =>
    count === 0 ? 0 : Math.round((correct / count) * 100);

  // Primary: the most recent full mocks.
  const mocks = scope
    .filter((s) => s.examMode && s.count > 0)
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, MOCKS_COUNTED);
  const mockCount = mocks.length;
  const mockPct = mockCount === 0
    ? null
    : Math.round(mocks.reduce((sum, s) => sum + pct(s.correct, s.count), 0) / mockCount);

  // Fallback: recent practice only. Falls back to all practice when the window is empty,
  // so a returning learner sees their real history rather than a zero.
  const cutoff = Date.now() - PRACTICE_WINDOW_MS;
  const practiceAll = scope.filter((s) => !s.examMode);
  const recent = practiceAll.filter((s) => s.startedAt >= cutoff);
  const practiceScope = recent.length > 0 ? recent : practiceAll;
  const practicePct = pct(
    practiceScope.reduce((a, s) => a + s.correct, 0),
    practiceScope.reduce((a, s) => a + s.count, 0),
  );

  const answeredAnything = scope.length > 0;
  const basis: Readiness['basis'] = mockCount > 0 ? 'mock' : answeredAnything ? 'practice' : 'none';
  const score = basis === 'mock' ? (mockPct ?? 0) : basis === 'practice' ? practicePct : 0;

  let status: Readiness['status'];
  let reason: string;

  if (basis === 'none') {
    status = 'red';
    reason = `No ${cert} questions answered yet. Start with a practice set, then sit a full mock.`;
  } else if (basis === 'practice') {
    // Never green without a mock: practice is untimed and self-paced.
    status = practicePct >= passPct ? 'amber' : 'red';
    reason = practicePct >= passPct
      ? `Recent practice is ${practicePct}%, above the ${passPct}% pass mark. Sit a full timed mock to confirm it holds under exam conditions.`
      : `Recent practice is ${practicePct}%, below the ${passPct}% pass mark. Drill your weakest objectives, then sit a mock.`;
  } else {
    const m = mockPct ?? 0;
    if (m >= passPct + 5 && mockCount >= 2) {
      status = 'green';
      reason = `${mockCount} recent mocks averaging ${m}%, clear of the ${passPct}% pass mark.`;
    } else if (m >= passPct) {
      status = 'amber';
      reason = mockCount < 2
        ? `One mock at ${m}%, just above the ${passPct}% pass mark. Sit another to confirm it was not a good day.`
        : `Mocks averaging ${m}%, above the ${passPct}% pass mark but without much margin.`;
    } else {
      status = 'red';
      reason = `Mocks averaging ${m}%, below the ${passPct}% pass mark. Work the weakest objectives before booking.`;
    }

    // A strong score off a sliver of the pool is thin evidence, not readiness.
    if (status === 'green' && coveragePct < THIN_COVERAGE_PCT) {
      status = 'amber';
      reason = `Mocks averaging ${m}%, but only ${coveragePct}% of the pool has been seen. Widen coverage before trusting the score.`;
    }
  }

  return { score, basis, mockCount, mockPct, practicePct, coveragePct, passPct, status, reason };
}

// ─── Scheduling ──────────────────────────────────────────────────────────────

/**
 * Spacing, actually implemented.
 *
 * The header of this file has claimed "Anki-style spaced repetition" since it
 * was written, and the code did not do it. The whole scheduler was
 *
 *   if (unseen) return 6;
 *   return max(0.5, 2 - timesRight / timesSeen);
 *
 * which is a difficulty bias, not a schedule. `lastSeenAt` was recorded on
 * every answer and never read by anything. A question answered correctly
 * yesterday and one answered correctly eight months ago carried identical
 * weight, so review never arrived when forgetting made it useful, and a
 * learner who had answered everything once got an endless reshuffle of the
 * same pool with no sense of anything being retired or coming back.
 *
 * This is SM-2, simplified to the two outcomes a multiple-choice item has.
 * Correct multiplies the interval by the ease factor; wrong resets it to a day
 * and lowers the ease so a question that keeps being missed keeps coming back
 * quickly. The ease floor of 1.3 is SM-2's, and it exists so a repeatedly
 * failed item cannot collapse to a schedule that never grows.
 */
const EASE_DEFAULT = 2.5;
const EASE_MIN = 1.3;
const EASE_CORRECT_BONUS = 0.1;
const EASE_WRONG_PENALTY = 0.2;
const FIRST_INTERVAL_DAYS = 1;
const SECOND_INTERVAL_DAYS = 3;
const MAX_INTERVAL_DAYS = 180;
const DAY_MS = 86_400_000;

/** Advance one question's schedule after an answer. */
export function schedule(prev: QuestionStats | undefined, correct: boolean, now: number): {
  dueAt: number;
  intervalDays: number;
  ease: number;
} {
  const prevEase = typeof prev?.ease === 'number' ? prev.ease : EASE_DEFAULT;
  const prevInterval = typeof prev?.intervalDays === 'number' ? prev.intervalDays : 0;

  if (!correct) {
    // Back to tomorrow, and make the ease shallower so repeated misses stay
    // frequent rather than drifting out to a week because of one lucky run.
    return {
      ease: Math.max(EASE_MIN, prevEase - EASE_WRONG_PENALTY),
      intervalDays: FIRST_INTERVAL_DAYS,
      dueAt: now + FIRST_INTERVAL_DAYS * DAY_MS,
    };
  }

  const ease = Math.min(3.0, prevEase + EASE_CORRECT_BONUS);
  const intervalDays =
    prevInterval === 0
      ? FIRST_INTERVAL_DAYS
      : prevInterval === FIRST_INTERVAL_DAYS
        ? SECOND_INTERVAL_DAYS
        : Math.min(MAX_INTERVAL_DAYS, Math.round(prevInterval * ease));

  return { ease, intervalDays, dueAt: now + intervalDays * DAY_MS };
}

/**
 * When a pre-scheduling record comes due.
 *
 * Existing users have `lastSeenAt` and nothing else. Treating those as due
 * immediately would dump the entire history into one enormous first queue, and
 * treating them as never due would hide them forever. Deriving a due date from
 * how well the question was known, measured from when it was last seen, lands
 * everyone somewhere sensible without a migration.
 */
function inferredDueAt(s: QuestionStats): number {
  if (s.timesSeen === 0) return 0;
  const accuracy = s.timesRight / s.timesSeen;
  const days = accuracy >= 0.9 ? 21 : accuracy >= 0.7 ? 7 : accuracy >= 0.5 ? 3 : 1;
  return s.lastSeenAt + days * DAY_MS;
}

/** Epoch ms this question is next due. Unseen questions are always due. */
export function dueAtFor(s: QuestionStats | undefined): number {
  if (!s || s.timesSeen === 0) return 0;
  return typeof s.dueAt === 'number' ? s.dueAt : inferredDueAt(s);
}

/** Whether this question is ready for review. */
export function isDue(s: QuestionStats | undefined, now = Date.now()): boolean {
  return dueAtFor(s) <= now;
}

/** How many of these question ids are due now, split by whether they are new. */
export function dueCounts(
  ids: string[],
  perQ: Record<string, QuestionStats>,
  now = Date.now(),
): { due: number; fresh: number; later: number } {
  let due = 0;
  let fresh = 0;
  let later = 0;
  for (const id of ids) {
    const s = perQ[id];
    if (!s || s.timesSeen === 0) fresh++;
    else if (dueAtFor(s) <= now) due++;
    else later++;
  }
  return { due, fresh, later };
}

// ─── Weighted question picker ────────────────────────────────────────────────

/**
 * Weight combines how well a question is known with how overdue it is.
 *
 * Unseen stays highest, so a learner still meets new material. Beyond that,
 * a question that came due a month ago now outranks one that came due this
 * morning, which is the behaviour the file claimed and did not have. Nothing
 * reaches zero: a permanently retired question means a long-term user
 * eventually sees the same shrinking subset forever.
 */
function questionWeight(qId: string, perQ: Record<string, QuestionStats>, now: number): number {
  const s = perQ[qId];
  if (!s || s.timesSeen === 0) return 6;

  const accuracy = s.timesRight / s.timesSeen;
  const difficulty = Math.max(0.5, 2 - accuracy);

  const due = dueAtFor(s);
  if (due > now) {
    // Not due yet. Still reachable, so a narrow filter is never empty, but it
    // should not compete with material that is actually ready for review.
    return difficulty * 0.15;
  }
  // Overdue by a day doubles it; the cap stops a year-old item from crowding
  // out everything else entirely.
  const overdueDays = (now - due) / DAY_MS;
  return difficulty * Math.min(3, 1 + overdueDays);
}


/** Pick N questions from a pool, biased toward weak / unseen. */
export function pickWeighted<T extends { id: string }>(
  pool: T[],
  n: number,
  perQ: Record<string, QuestionStats>,
): T[] {
  // Even when the whole pool is returned (n >= pool.length), shuffle it 
  // otherwise a small/narrow pool (e.g. one domain, or the "Weak" filter)
  // would always present questions in the same stored file order.
  if (n >= pool.length) {
    const out = [...pool];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
  const now = Date.now();
  const remaining = [...pool];
  const weights   = remaining.map((q) => questionWeight(q.id, perQ, now));
  const out: T[] = [];
  for (let k = 0; k < n && remaining.length > 0; k++) {
    const total = weights.reduce((a, w) => a + w, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < weights.length; idx++) {
      r -= weights[idx];
      if (r <= 0) break;
    }
    if (idx >= remaining.length) idx = remaining.length - 1;
    out.push(remaining[idx]);
    remaining.splice(idx, 1);
    weights.splice(idx, 1);
  }
  return out;
}
