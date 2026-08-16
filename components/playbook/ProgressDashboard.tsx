'use client';
import { useEffect, useMemo, useState } from 'react';
import type { QuizQuestion } from '@/types';
import { QUIZ_QUESTIONS } from '@/lib/playbook-quiz';
import { EXAM_CERTS } from '@/lib/cert-exam-domains';
import {
  loadProgress,
  resetProgress,
  summarizeCert,
  topicAccuracy,
  certsWithData,
  readinessScore,
  type ProgressData,
  type SessionRecord,
  type Readiness,
} from '@/lib/quiz-progress';
import SessionReview from './SessionReview';

// ─── Small render helpers ────────────────────────────────────────────────────

function pctColor(pct: number): string {
  if (pct >= 80) return 'text-emerald-400';
  if (pct >= 60) return 'text-amber-400';
  return 'text-red-400';
}

function pctBar(pct: number): string {
  if (pct >= 80) return 'bg-emerald-500';
  if (pct >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  const now = Date.now();
  const diffMs = now - ms;
  const min = Math.floor(diffMs / 60_000);
  if (min < 1)  return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr  = Math.floor(min / 60);
  if (hr < 24)  return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ─── Sparkline (last N session %ages, oldest→newest) ─────────────────────────

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) {
    return <div className="h-10 flex items-center text-micro font-mono text-slate-600">need ≥ 2 sessions for trend</div>;
  }
  const w = 220;
  const h = 40;
  const max = 100;
  const min = 0;
  const step = w / (points.length - 1);
  const yFor = (v: number) => h - ((v - min) / (max - min)) * (h - 4) - 2;
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i * step).toFixed(1)} ${yFor(p).toFixed(1)}`).join(' ');
  const lastY = yFor(points[points.length - 1]);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-full" preserveAspectRatio="none">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-400" />
      <circle cx={((points.length - 1) * step).toFixed(1)} cy={lastY.toFixed(1)} r="2.5" className="fill-brand-300" />
    </svg>
  );
}

// ─── Question ID → text lookup (for the per-question table) ──────────────────

const Q_LOOKUP: Record<string, { question: string; category: string; topic: string }> = (() => {
  const m: Record<string, { question: string; category: string; topic: string }> = {};
  for (const q of QUIZ_QUESTIONS) {
    m[q.id] = { question: q.question, category: q.category, topic: q.topic };
  }
  return m;
})();

const Q_CATEGORY_LOOKUP: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const q of QUIZ_QUESTIONS) m[q.id] = q.category;
  return m;
})();

// Full QuizQuestion by id, used by the per-Q table row expansion so we can
// render the four options + correct-answer highlight + explanation without a
// second lookup pass.
const Q_LOOKUP_FULL: Record<string, QuizQuestion> = (() => {
  const m: Record<string, QuizQuestion> = {};
  for (const q of QUIZ_QUESTIONS) m[q.id] = q;
  return m;
})();

// ─── Main component ──────────────────────────────────────────────────────────

type SortKey = 'accuracy' | 'seen' | 'last';

interface ProgressDashboardProps {
  /** When set, dashboard mounts with this session already open in the review view. */
  initialSessionId?: string | null;
  /** Bubble up a preloaded quiz launch, parent hands the array to QuizEngine. */
  onLaunchQuiz?: (questions: QuizQuestion[], label: string) => void;
}

export default function ProgressDashboard({ initialSessionId, onLaunchQuiz }: ProgressDashboardProps = {}) {
  const [data, setData]   = useState<ProgressData>({ sessions: [], perQ: {} });
  const [cert, setCert]   = useState<string>('All');
  const [sortKey, setSort] = useState<SortKey>('accuracy');
  const [hydrated, setHyd] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [viewingSessionId, setViewingSessionId] = useState<string | null>(initialSessionId ?? null);
  const [expandedQId, setExpandedQId] = useState<string | null>(null);

  useEffect(() => {
    setData(loadProgress());
    setHyd(true);
  }, []);

  // Deep-link: if parent later supplies an initialSessionId (URL change), honour it.
  useEffect(() => {
    if (initialSessionId) setViewingSessionId(initialSessionId);
  }, [initialSessionId]);

  const viewingSession = useMemo(() => {
    if (!viewingSessionId) return null;
    return data.sessions.find((s) => s.id === viewingSessionId) ?? null;
  }, [data, viewingSessionId]);

  const availableCerts = useMemo(() => {
    const found = certsWithData(data);
    return ['All', ...found.filter((c) => c !== 'All')];
  }, [data]);

  const summary = useMemo(() => summarizeCert(data, cert), [data, cert]);
  const topics  = useMemo(() => topicAccuracy(data, cert, Q_CATEGORY_LOOKUP), [data, cert]);

  // Readiness, only meaningful for a specific cert (not 'All'). Uses the
  // real question pool size for the cert and the passing score from the
  // cert catalog. Falls back to 67% if a cert is unlisted.
  const readiness = useMemo<Readiness | null>(() => {
    if (cert === 'All') return null;
    const poolSize = QUIZ_QUESTIONS.filter((q) => q.certTags.includes(cert)).length;
    if (poolSize === 0) return null;
    const catalog = EXAM_CERTS.find((c) => c.id === cert);
    const passPct = catalog?.passingScore ?? 67;
    return readinessScore(data, cert, poolSize, passPct);
  }, [data, cert]);

  // Filter sessions to selected cert scope, newest-first.
  const scopedSessions: SessionRecord[] = useMemo(() => {
    return cert === 'All'
      ? data.sessions
      : data.sessions.filter((s) => s.cert === cert);
  }, [data, cert]);

  // Per-question table rows, only for questions the user has actually seen
  // in this cert scope.
  const perQRows = useMemo(() => {
    const seenQIds = new Set<string>();
    for (const s of scopedSessions) for (const r of s.results) seenQIds.add(r.qId);
    const rows = Array.from(seenQIds).map((qId) => {
      const stats = data.perQ[qId];
      const lookup = Q_LOOKUP[qId];
      if (!stats || !lookup) return null;
      return {
        qId,
        question:   lookup.question,
        category:   lookup.category,
        topic:      lookup.topic,
        seen:       stats.timesSeen,
        right:      stats.timesRight,
        accuracy:   Math.round((stats.timesRight / stats.timesSeen) * 100),
        lastSeenAt: stats.lastSeenAt,
      };
    }).filter(Boolean) as Array<{
      qId: string; question: string; category: string; topic: string;
      seen: number; right: number; accuracy: number; lastSeenAt: number;
    }>;
    if (sortKey === 'accuracy') return rows.sort((a, b) => a.accuracy - b.accuracy);
    if (sortKey === 'seen')     return rows.sort((a, b) => b.seen - a.seen);
    return rows.sort((a, b) => b.lastSeenAt - a.lastSeenAt);
  }, [data, scopedSessions, sortKey]);

  const empty = hydrated && data.sessions.length === 0;

  // ── SessionReview view swap ────────────────────────────────────────────────
  // When a session is open, render the review UI in-place instead of the
  // dashboard. Back button clears the state, deep-links come in via
  // initialSessionId prop above.
  if (viewingSession) {
    return (
      <SessionReview
        session={viewingSession}
        onBack={() => setViewingSessionId(null)}
        onRetakeMissed={(qs) => onLaunchQuiz?.(qs, 'Retake missed')}
        onRetakeAll={(qs) => onLaunchQuiz?.(qs, 'Retake session')}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* Header, cert switcher + reset */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Progress</h2>
            <p className="text-2xs font-mono text-slate-600 mt-0.5">
              Session history · per-question accuracy · weak-topic heatmap · 90-day rolling window
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-micro font-mono text-slate-600 uppercase tracking-wide">Cert</label>
            <select
              value={cert}
              onChange={(e) => setCert(e.target.value)}
              className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-brand-500/50"
            >
              {availableCerts.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="text-micro font-mono px-2 py-1 rounded border border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500"
              >
                reset
              </button>
            ) : (
              <span className="flex items-center gap-1">
                <button
                  onClick={() => { resetProgress(); setData({ sessions: [], perQ: {} }); setConfirmReset(false); }}
                  className="text-micro font-mono px-2 py-1 rounded border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                >
                  confirm reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="text-micro font-mono px-2 py-1 rounded border border-slate-700 text-slate-500 hover:text-slate-300"
                >
                  cancel
                </button>
              </span>
            )}
          </div>
        </div>

        {empty ? (
          <div className="border border-slate-800 rounded-lg p-8 text-center">
            <p className="text-sm text-slate-300 mb-1">No quiz sessions yet.</p>
            <p className="text-2xs font-mono text-slate-600">
              Take a quiz, your progress will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Readiness card, only shown for a specific cert */}
            {readiness && <ReadinessCard cert={cert} r={readiness} />}

            {/* All-time stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCell label="All-time" value={`${summary.overallPct}%`} sub={`${summary.totalCorrect}/${summary.totalQuestions}`} color={pctColor(summary.overallPct)} />
              <StatCell label="Best session" value={`${summary.bestSessionPct}%`} sub={summary.totalSessions === 1 ? 'first attempt' : `over ${summary.totalSessions} sessions`} color={pctColor(summary.bestSessionPct)} />
              <StatCell label="Last session" value={summary.lastSessionPct !== null ? `${summary.lastSessionPct}%`: ' '} sub={summary.lastSessionPct === null ? ' ': formatDate(scopedSessions[0]?.startedAt ?? Date.now())} color={pctColor(summary.lastSessionPct ?? 0)} />
              <StatCell label="Sessions" value={String(summary.totalSessions)} sub="90-day window" color="text-slate-200" />
            </div>

            {/* Trend sparkline */}
            <div className="border border-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-micro font-mono text-slate-600 uppercase tracking-wide">Trend, last 10 sessions</p>
                <p className="text-micro font-mono text-slate-600">oldest → newest</p>
              </div>
              <Sparkline points={summary.trend} />
              {summary.trend.length >= 2 && (
                <p className="text-micro font-mono text-slate-600 mt-1">
                  {summary.trend[0]}% → {summary.trend[summary.trend.length - 1]}%
                  {summary.trend[summary.trend.length - 1] > summary.trend[0] && <span className="ml-2 text-emerald-400">▲ improving</span>}
                  {summary.trend[summary.trend.length - 1] < summary.trend[0] && <span className="ml-2 text-amber-400">▼ regressing</span>}
                </p>
              )}
            </div>

            {/* Two-column: recent sessions + topic heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Recent sessions */}
              <div className="border border-slate-800 rounded-lg">
                <p className="text-micro font-mono text-slate-600 uppercase tracking-wide px-4 pt-3 pb-2 border-b border-slate-800">
                  Recent sessions
                </p>
                <div className="divide-y divide-slate-800/60">
                  {scopedSessions.slice(0, 10).map((s) => {
                    const pct = s.count === 0 ? 0 : Math.round((s.correct / s.count) * 100);
                    return (
                      <button
                        key={s.id}
                        onClick={() => setViewingSessionId(s.id)}
                        className="w-full text-left flex items-center justify-between px-4 py-2 text-xs hover:bg-slate-800/40 transition-colors focus:outline-none focus:bg-slate-800/60"
                        aria-label={`Review session from ${formatDate(s.startedAt)}, ${pct}%`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold ${pctColor(pct)}`}>{pct}%</span>
                            <span className="text-slate-300">{s.correct}/{s.count}</span>
                            {s.examMode && <span className="text-micro font-mono px-1 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/30">exam</span>}
                            {s.skipped > 0 && <span className="text-micro font-mono text-slate-600">· {s.skipped} skipped</span>}
                          </div>
                          <p className="text-micro font-mono text-slate-600 mt-0.5 truncate">
                            {s.cert} · {s.category} · {s.difficulty}
                          </p>
                        </div>
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="text-micro font-mono text-slate-600">{formatDate(s.startedAt)}</span>
                          <span className="text-slate-600 text-micro">→</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topic heatmap */}
              <div className="border border-slate-800 rounded-lg">
                <p className="text-micro font-mono text-slate-600 uppercase tracking-wide px-4 pt-3 pb-2 border-b border-slate-800">
                  Accuracy by topic
                </p>
                {topics.length === 0 ? (
                  <p className="text-2xs font-mono text-slate-600 px-4 py-4">No data for this cert scope.</p>
                ) : (
                  <div className="px-4 py-3 space-y-2">
                    {topics.slice(0, 12).map((t) => (
                      <div key={t.category}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-2xs text-slate-300 truncate max-w-[70%]">{t.category}</span>
                          <span className="text-micro font-mono text-slate-500">
                            <span className={pctColor(t.accuracy)}>{t.accuracy}%</span>
                            <span className="text-slate-700"> · {t.right}/{t.seen}</span>
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${pctBar(t.accuracy)} rounded-full`} style={{ width: `${t.accuracy}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Per-question table */}
            <div className="border border-slate-800 rounded-lg">
              <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-slate-800">
                <p className="text-micro font-mono text-slate-600 uppercase tracking-wide">
                  Per-question stats, {perQRows.length} question{perQRows.length === 1 ? '': 's'} you&rsquo;ve seen
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-micro font-mono text-slate-700 mr-1">sort</span>
                  {(['accuracy', 'seen', 'last'] as SortKey[]).map((k) => (
                    <button
                      key={k}
                      onClick={() => setSort(k)}
                      className={[
                        'text-micro font-mono px-1.5 py-0.5 rounded border',
                        sortKey === k
                          ? 'border-brand-500/40 text-brand-300 bg-brand-500/10'
                          : 'border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500',
                      ].join(' ')}
                    >
                      {k === 'accuracy' ? 'accuracy ↑' : k === 'seen' ? 'seen ↓' : 'last ↓'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-slate-900 border-b border-slate-800/50">
                    <tr className="text-left text-micro font-mono text-slate-600 uppercase tracking-wide">
                      <th className="px-3 py-2">Question</th>
                      <th className="px-3 py-2 text-right">Accuracy</th>
                      <th className="px-3 py-2 text-right">Seen</th>
                      <th className="px-3 py-2 text-right">Last</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perQRows.map((r) => {
                      const isOpen = expandedQId === r.qId;
                      const q = Q_LOOKUP_FULL[r.qId];
                      return (
                        <>
                          <tr
                            key={r.qId}
                            onClick={() => setExpandedQId(isOpen ? null : r.qId)}
                            className={`border-t border-slate-800/40 cursor-pointer hover:bg-slate-800/40 ${isOpen ? 'bg-slate-800/40' : ''}`}
                            aria-expanded={isOpen}
                          >
                            <td className="px-3 py-2 max-w-md">
                              <p className="text-slate-300 line-clamp-2 flex items-start gap-2">
                                <span className="text-slate-600 text-micro pt-0.5">{isOpen ? '▾' : '▸'}</span>
                                <span>{r.question}</span>
                              </p>
                              <p className="text-micro font-mono text-slate-600 mt-0.5 ml-4">{r.category} · {r.topic}</p>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className={`font-mono font-bold ${pctColor(r.accuracy)}`}>{r.accuracy}%</span>
                              <span className="text-micro font-mono text-slate-700 ml-1">{r.right}/{r.seen}</span>
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-500">{r.seen}</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-500">{formatDate(r.lastSeenAt)}</td>
                          </tr>
                          {isOpen && q && (
                            <tr className="border-t border-slate-800/40 bg-slate-800/20">
                              <td colSpan={4} className="px-6 py-3">
                                <div className="space-y-1.5 mb-3">
                                  {q.options.map((opt, oi) => {
                                    const isCorrect = oi === q.correct;
                                    return (
                                      <div
                                        key={oi}
                                        className={`text-xs px-3 py-1.5 rounded border ${isCorrect
                                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                                          : 'border-slate-800 text-slate-500'}`}
                                      >
                                        <span className="font-mono opacity-60 mr-2">{String.fromCharCode(65 + oi)}.</span>
                                        {opt}
                                        {isCorrect && <span className="ml-2 text-emerald-400 font-bold">✓</span>}
                                      </div>
                                    );
                                  })}
                                </div>
                                <p className="text-micro font-mono text-slate-600 uppercase tracking-wide mb-1">Why</p>
                                <p className="text-xs text-slate-400 leading-relaxed mb-3">{q.explanation}</p>
                                {onLaunchQuiz && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onLaunchQuiz([q], 'Drill this question'); }}
                                    className="text-2xs font-mono px-2.5 py-1.5 rounded border border-brand-500/40 text-brand-300 bg-brand-500/5 hover:bg-brand-500/10"
                                  >
                                    ↻ Quiz me on this question
                                  </button>
                                )}
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}

function StatCell({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="border border-slate-800 rounded-lg p-3">
      <p className="text-micro font-mono text-slate-600 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold font-mono mt-1 ${color}`}>{value}</p>
      <p className="text-micro font-mono text-slate-600 mt-0.5 truncate">{sub}</p>
    </div>
  );
}

function ReadinessCard({ cert, r }: { cert: string; r: Readiness }) {
  const border = r.status === 'green' ? 'border-emerald-500/40 bg-emerald-500/5'
    : r.status === 'amber' ? 'border-amber-500/40 bg-amber-500/5'
    : 'border-red-500/40 bg-red-500/5';
  const textColor = r.status === 'green' ? 'text-emerald-300'
    : r.status === 'amber' ? 'text-amber-300'
    : 'text-red-300';
  const label = r.status === 'green' ? 'READY' : r.status === 'amber' ? 'BORDERLINE' : 'NOT READY';
  const message =
    r.bottleneck === 'coverage' ? `You've only seen ${r.coveragePct}% of the ${cert} pool. Run more quizzes across every topic.`
    : r.bottleneck === 'accuracy' ? `Coverage is ${r.coveragePct}% but accuracy is ${r.accuracyPct}%. Focus on your weakest topics.`
    : r.bottleneck === 'both'     ? `Coverage ${r.coveragePct}% and accuracy ${r.accuracyPct}% both below the ${r.passPct}% pass mark.`
                                   : `Above pass threshold on both coverage and accuracy.`;
  return (
    <div className={`border rounded-lg p-4 ${border}`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <p className="text-micro font-mono text-slate-500 uppercase tracking-wide">Readiness, {cert}</p>
          <div className="flex items-baseline gap-3 mt-1">
            <span className={`text-4xl font-bold font-mono ${textColor}`}>{r.score}%</span>
            <span className={`text-micro font-mono px-1.5 py-0.5 rounded border ${textColor} border-current/40`}>{label}</span>
          </div>
          <p className="text-2xs text-slate-400 mt-2 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-4 shrink-0">
          <MiniBar label="Coverage" value={r.coveragePct} threshold={r.passPct} />
          <MiniBar label="Accuracy" value={r.accuracyPct} threshold={r.passPct} />
          <MiniBar label="Pass mark" value={r.passPct} threshold={r.passPct} muted />
        </div>
      </div>
    </div>
  );
}

function MiniBar({ label, value, threshold, muted }: { label: string; value: number; threshold: number; muted?: boolean }) {
  const barColor = muted ? 'bg-slate-600'
    : value >= threshold + 10 ? 'bg-emerald-500'
    : value >= threshold      ? 'bg-amber-500'
    :                            'bg-red-500';
  const textColor = muted ? 'text-slate-500'
    : value >= threshold + 10 ? 'text-emerald-400'
    : value >= threshold      ? 'text-amber-400'
    :                            'text-red-400';
  return (
    <div className="w-24">
      <p className="text-micro font-mono text-slate-600 uppercase tracking-wide">{label}</p>
      <p className={`text-lg font-mono font-bold mt-0.5 ${textColor}`}>{value}%</p>
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
