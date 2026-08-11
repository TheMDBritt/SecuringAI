/**
 * Quiz progression tracking — localStorage only, no accounts, no network.
 *
 * Data model
 * ─────────────────────────────────────────────────────────────────────────────
 * `sessions`  : rolling 90-day window of completed quiz sessions
 * `perQ`      : forever-retained aggregate per question ID
 *   - timesSeen, timesRight, lastSeenAt
 *
 * The 90-day window is enforced on load and on every write — prune-on-read
 * plus prune-on-write means an idle user's stale data still expires.
 *
 * The weighted picker uses perQ to bias future quizzes toward weak / unseen
 * questions (Anki-style spaced repetition). Never-seen questions get the
 * highest weight; consistently-right questions get the lowest but still non-
 * zero so nothing is permanently retired.
 */

const STORAGE_KEY   = 'dojo-progress-v1';
const SESSION_WINDOW_DAYS = 90;
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
}

export interface ProgressData {
  sessions: SessionRecord[];
  perQ:     Record<string, QuestionStats>;
}

const EMPTY: ProgressData = { sessions: [], perQ: {} };

// ─── Load / save ─────────────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/** Read progress from localStorage, pruning sessions older than 90 days. */
export function loadProgress(): ProgressData {
  if (!isBrowser()) return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sessions: [], perQ: {} };
    const parsed = JSON.parse(raw) as ProgressData;
    // Defensive: coerce shape in case of an old / corrupted record.
    const sessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
    const perQ     = parsed.perQ && typeof parsed.perQ === 'object' ? parsed.perQ : {};
    return pruneOldSessions({ sessions, perQ }, Date.now());
  } catch {
    return { sessions: [], perQ: {} };
  }
}

function saveProgress(data: ProgressData): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Quota exceeded or storage disabled — silently drop; nothing else to do
    // in a no-account app.
  }
}

/** Remove sessions older than the 90-day window. */
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
    nextPerQ[r.qId] = {
      qId:        r.qId,
      timesSeen:  (prev?.timesSeen  ?? 0) + 1,
      timesRight: (prev?.timesRight ?? 0) + (r.correct ? 1 : 0),
      lastSeenAt: now,
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

/** Which cert scopes have session data — for the dashboard's cert switcher. */
export function certsWithData(data: ProgressData): string[] {
  const set = new Set<string>();
  for (const s of data.sessions) set.add(s.cert);
  return Array.from(set).sort();
}

// ─── Weighted question picker (Anki-style bias toward weak/unseen) ───────────

/**
 * Weight = (2 - accuracy) * (unseen ? 3 : 1)
 *   never seen           →  weight 6 (highest)
 *   0% right on N seen   →  weight 2
 *   50% right            →  weight 1.5
 *   100% right           →  weight 1 (still shown, but rarely)
 *
 * We keep a floor > 0 so no question is permanently retired — otherwise
 * long-time users would see the same subset forever.
 */
function questionWeight(qId: string, perQ: Record<string, QuestionStats>): number {
  const s = perQ[qId];
  if (!s || s.timesSeen === 0) return 6;
  const accuracy = s.timesRight / s.timesSeen;
  return Math.max(0.5, 2 - accuracy);
}

/** Pick N questions from a pool, biased toward weak / unseen. */
export function pickWeighted<T extends { id: string }>(
  pool: T[],
  n: number,
  perQ: Record<string, QuestionStats>,
): T[] {
  if (n >= pool.length) return [...pool];
  const remaining = [...pool];
  const weights   = remaining.map((q) => questionWeight(q.id, perQ));
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
