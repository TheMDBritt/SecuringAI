'use client';

import { safeWrite } from './storage-health';

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY LOG. One of two progress stores; read this before touching either.
//
//   lib/progress-store.ts  (this file, key `securingai:progress:v1`)
//     A flat, append-only log of completed activity: quiz runs and dojo attack
//     runs, each with a score and a timestamp. Answers "what has this person
//     done, and how did it go". Powers the dashboard, the progress page and the
//     recent-activity lists.
//
//   lib/quiz-progress.ts   (key `dojo-progress-v1`)
//     Per-QUESTION statistics and full session records: how many times each
//     question was seen and answered correctly, which drives the spaced
//     repetition weighting in the quiz engine, plus enough detail to replay a
//     session in the review view.
//
// They are layers, not duplicates, and they intentionally hold different data
// at different grain. Both export a function called `loadProgress`, which is
// the confusing part: import them under distinct names when a module needs
// both, as components/playbook/QuizEngine.tsx does.
//
// Everything is localStorage. No accounts, no network, consistent with the
// app's no-tracking stance. A completed quiz writes to BOTH stores: the run
// summary here, the per-question stats there, correlated by `sessionId`.
// ─────────────────────────────────────────────────────────────────────────────

const KEY = 'securingai:progress:v1';
/** Fired whenever stored progress changes. Exported so other writers of the same
 *  storage (see lib/progress-backup) can notify open views without duplicating the
 *  literal. */
export const PROGRESS_CHANGED_EVENT = 'securingai:progress-changed';
const EVENT = PROGRESS_CHANGED_EVENT;

export interface QuizRun {
  id: string;
  /**
   * Correlating id from lib/quiz-progress.ts SessionRecord (format
   * `s_<base36>_<base36>`). Present when the caller supplied it, the
   * dashboard/progress recent-activity rows are linkable to the review view
   * only when this is set.
   */
  sessionId?: string;
  certId?: string;
  certName?: string;
  total: number;
  correct: number;
  skipped: number;
  examMode?: boolean;
  at: string; // ISO timestamp
}

export interface AttackRun {
  id: string;
  dojoId: 1 | 2 | 3;
  scenarioId: string;
  scenarioTitle: string;
  attackType: string;
  succeeded: boolean;
  score: number;
  verdict: string;
  difficulty?: string;
  at: string;
}

export interface ProgressState {
  quizRuns: QuizRun[];
  attackRuns: AttackRun[];
}

/**
 * A fresh empty state, never a shared one.
 *
 * This was a single module-level constant that loadProgress handed back
 * whenever storage was empty or unreadable. recordQuizRun then did
 * `state.quizRuns.unshift(...)` on it, mutating the constant itself, so the
 * "empty" state accumulated every run made during the page's lifetime.
 *
 * The visible consequence was that clearing training data did not stay
 * cleared: removeItem emptied localStorage, the next read returned the
 * polluted constant, the dashboard showed the deleted runs, and the next
 * write persisted them back to disk. Deleted history came back.
 */
function emptyState(): ProgressState {
  return { quizRuns: [], attackRuns: [] };
}

const MAX_QUIZ = 100;
const MAX_ATTACK = 300;

function safeParse(raw: string | null): ProgressState {
  if (!raw) return emptyState();
  try {
    const parsed = JSON.parse(raw);
    return {
      quizRuns: Array.isArray(parsed.quizRuns) ? parsed.quizRuns : [],
      attackRuns: Array.isArray(parsed.attackRuns) ? parsed.attackRuns : [],
    };
  } catch {
    return emptyState();
  }
}

export function loadProgress(): ProgressState {
  if (typeof window === 'undefined') return emptyState();
  return safeParse(window.localStorage.getItem(KEY));
}

function save(state: ProgressState) {
  if (typeof window === 'undefined') return;
  // Unguarded, this threw straight out of the quiz completion handler and into
  // the route error boundary: a full disk, or Safari private browsing where
  // every write throws, turned a finished exam into a crash screen.
  if (!safeWrite(KEY, JSON.stringify(state))) return;
  window.dispatchEvent(new Event(EVENT));
}

function rid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function recordQuizRun(run: Omit<QuizRun, 'id' | 'at'>): void {
  if (typeof window === 'undefined') return;
  const state = loadProgress();
  state.quizRuns.unshift({ ...run, id: rid('q'), at: new Date().toISOString() });
  state.quizRuns = state.quizRuns.slice(0, MAX_QUIZ);
  save(state);
}

export function recordAttackRun(run: Omit<AttackRun, 'id' | 'at'>): void {
  if (typeof window === 'undefined') return;
  const state = loadProgress();
  state.attackRuns.unshift({ ...run, id: rid('a'), at: new Date().toISOString() });
  state.attackRuns = state.attackRuns.slice(0, MAX_ATTACK);
  save(state);
}

export function clearProgress(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function onProgressChange(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

// ─── Derived analytics ───────────────────────────────────────────────────────

export interface ProgressSummary {
  quizRuns: number;
  questionsAnswered: number;
  questionsCorrect: number;
  accuracy: number; // 0-100
  attackAttempts: number;
  attacksSucceeded: number;
  attacksBlocked: number;
  perDojo: Record<1 | 2 | 3, { attempts: number; blocked: number }>;
  perCert: { certId: string; certName: string; runs: number; accuracy: number }[];
  difficulty: Record<'beginner' | 'intermediate' | 'advanced' | 'unknown', number>;
  recent: { at: string; kind: 'quiz' | 'attack'; label: string; detail: string; tone: string; sessionId?: string }[];
  lastActive: string | null;
}

export function summarize(state: ProgressState): ProgressSummary {
  const questionsAnswered = state.quizRuns.reduce((s, r) => s + (r.total - r.skipped), 0);
  const questionsCorrect = state.quizRuns.reduce((s, r) => s + r.correct, 0);
  const accuracy = questionsAnswered ? Math.round((questionsCorrect / questionsAnswered) * 100) : 0;

  const attackAttempts = state.attackRuns.length;
  const attacksSucceeded = state.attackRuns.filter((r) => r.succeeded).length;
  const attacksBlocked = attackAttempts - attacksSucceeded;

  const perDojo: ProgressSummary['perDojo'] = {
    1: { attempts: 0, blocked: 0 },
    2: { attempts: 0, blocked: 0 },
    3: { attempts: 0, blocked: 0 },
  };
  for (const r of state.attackRuns) {
    const d = perDojo[r.dojoId];
    if (!d) continue;
    d.attempts += 1;
    if (!r.succeeded) d.blocked += 1;
  }

  const certMap = new Map<string, { name: string; total: number; correct: number; runs: number }>();
  for (const r of state.quizRuns) {
    if (!r.certId) continue;
    const cur = certMap.get(r.certId) ?? { name: r.certName ?? r.certId, total: 0, correct: 0, runs: 0 };
    cur.total += r.total - r.skipped;
    cur.correct += r.correct;
    cur.runs += 1;
    certMap.set(r.certId, cur);
  }
  const perCert = [...certMap.entries()]
    .map(([certId, v]) => ({
      certId,
      certName: v.name,
      runs: v.runs,
      accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 0,
    }))
    .sort((a, b) => b.runs - a.runs);

  const difficulty: ProgressSummary['difficulty'] = { beginner: 0, intermediate: 0, advanced: 0, unknown: 0 };
  for (const r of state.attackRuns) {
    const key = (r.difficulty as keyof typeof difficulty) ?? 'unknown';
    if (key in difficulty) difficulty[key] += 1;
    else difficulty.unknown += 1;
  }

  const recent: ProgressSummary['recent'] = [
    ...state.quizRuns.map((r) => ({
      at: r.at,
      kind: 'quiz' as const,
      label: r.certName ? `${r.certName} quiz` : 'Practice quiz',
      detail: `${r.correct}/${r.total - r.skipped} correct${r.examMode ? ' · mock exam' : ''}`,
      tone: r.total && r.correct / Math.max(1, r.total - r.skipped) >= 0.7 ? 'emerald' : 'amber',
      sessionId: r.sessionId,
    })),
    ...state.attackRuns.map((r) => ({
      at: r.at,
      kind: 'attack' as const,
      label: r.scenarioTitle || 'Lab attempt',
      detail: r.succeeded ? 'Attack landed, defense missed': 'Attack blocked',
      tone: r.succeeded ? 'red' : 'emerald',
    })),
  ]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 8);

  const lastActive = recent[0]?.at ?? null;

  return {
    quizRuns: state.quizRuns.length,
    questionsAnswered,
    questionsCorrect,
    accuracy,
    attackAttempts,
    attacksSucceeded,
    attacksBlocked,
    perDojo,
    perCert,
    difficulty,
    recent,
    lastActive,
  };
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
