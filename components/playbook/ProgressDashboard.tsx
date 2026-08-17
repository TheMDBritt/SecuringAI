'use client';
import { useEffect, useMemo, useState } from 'react';
import type { QuizQuestion } from '@/types';
import { QUIZ_INDEX } from '@/lib/quiz-index';
import { useQuestionsByIds } from '@/lib/use-questions';
import ObjectiveBreakdown from './ObjectiveBreakdown';
import DomainBreakdown from './DomainBreakdown';
import { masteryTone } from '@/components/ui';
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

/** null means nothing measured yet, which is not the same as scoring zero. */
function pctColor(pct: number | null): string {
  if (pct === null) return 'text-slate-400';
  if (pct >= 80) return 'text-emerald-400';
  if (pct >= 60) return 'text-amber-400';
  return 'text-red-400';
}

/** Flat class form of the shared mastery scale, for the bars not yet on ProgressBar. */
function pctBar(pct: number): string {
  return { emerald: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-red-500', brand: 'bg-brand-500', slate: 'bg-slate-500' }[
    masteryTone(pct)
  ];
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  const now = Date.now();
  const diffMs = now - ms;
  const min = Math.floor(diffMs / 60_000);
  if (min < 1)  return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr  = Math.floor(min / 60);
  if (hr < 24)  return hr === 1 ? '1 hour ago' : `${hr} hours ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return day === 1 ? 'yesterday' : `${day} days ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ─── Sparkline (last N session %ages, oldest→newest) ─────────────────────────

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) {
    return <div className="h-10 flex items-center text-micro font-mono text-slate-400">Two sessions needed before a trend appears</div>;
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
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-full" preserveAspectRatio="xMidYMid meet">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-400" />
      <circle cx={((points.length - 1) * step).toFixed(1)} cy={lastY.toFixed(1)} r="2.5" className="fill-brand-300" />
    </svg>
  );
}

// ─── Question ID → text lookup (for the per-question table) ──────────────────

const Q_LOOKUP: Record<string, { category: string; topic: string }> = (() => {
  const m: Record<string, { category: string; topic: string }> = {};
  for (const q of QUIZ_INDEX) m[q.id] = { category: q.category, topic: q.topic };
  return m;
})();

const Q_CATEGORY_LOOKUP: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const q of QUIZ_INDEX) m[q.id] = q.category;
  return m;
})();

// Full QuizQuestion by id, used by the per-Q table row expansion so we can
// render the four options + correct-answer highlight + explanation without a
// second lookup pass.


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
    const poolSize = QUIZ_INDEX.filter((q) => q.certTags.includes(cert)).length;
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
  const answeredIds = useMemo(() => {
    const ids = new Set<string>();
    for (const s of scopedSessions) for (const r of s.results) ids.add(r.qId);
    return Array.from(ids);
  }, [scopedSessions]);
  const { byId: Q_LOOKUP_FULL } = useQuestionsByIds(answeredIds);

  const perQRows = useMemo(() => {
    const seenQIds = new Set<string>();
    for (const s of scopedSessions) for (const r of s.results) seenQIds.add(r.qId);
    const rows = Array.from(seenQIds).map((qId) => {
      const stats = data.perQ[qId];
      const lookup = Q_LOOKUP[qId];
      if (!stats || !lookup) return null;
      return {
        qId,
        // Falls back to the topic until the body arrives, so the table renders
        // immediately instead of waiting on the fetch.
        question:   Q_LOOKUP_FULL[qId]?.question ?? lookup.topic,
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
  }, [data, scopedSessions, sortKey, Q_LOOKUP_FULL]);

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
            <p className="text-2xs font-mono text-slate-400 mt-0.5">
              Session history, per-question accuracy and weak-topic analysis, over a 90-day window
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-micro font-mono text-slate-400 uppercase tracking-wide">Cert</label>
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
            <p className="text-2xs font-mono text-slate-400">
              Take a quiz and your progress will appear here.
            </p>
            {/* The equivalent empty states elsewhere offer the action; this one
                described it and left the user to find the tab themselves. */}
            <a
              href="/playbook?section=quiz"
              className="mt-4 inline-flex rounded border border-brand-500/40 bg-brand-500/5 px-3 py-1.5 font-mono text-2xs text-brand-300 transition-colors hover:bg-brand-500/15"
            >
              Start a quiz
            </a>
          </div>
        ) : (
          <>
            {/* Readiness card, only shown for a specific cert */}
            {readiness && <ReadinessCard cert={cert} r={readiness} />}

            {/* Objective breakdown. Exams are organised by objective and the
                blueprint weights each domain, so this is the view that tells a
                learner where their next hour of study actually pays. */}
            {cert !== 'All' && (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {/* Domain first: it is how the blueprint is published and how a
                    candidate thinks about the paper, and unlike the objective view
                    it works for every cert rather than only the tagged one. */}
                <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                  <h3 className="mb-1 font-mono text-2xs uppercase tracking-widest text-slate-400">
                    Domain mastery
                  </h3>
                  <DomainBreakdown data={data} certId={cert} onLaunchQuiz={onLaunchQuiz} />
                </section>

                <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                  <h3 className="mb-1 font-mono text-2xs uppercase tracking-widest text-slate-400">
                    Objective mastery
                  </h3>
                  <ObjectiveBreakdown data={data} certId={cert} onLaunchQuiz={onLaunchQuiz} />
                </section>
              </div>
            )}

            {/* All-time stats row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
              <StatCell label="All-time" value={`${summary.overallPct}%`} sub={`${summary.totalCorrect}/${summary.totalQuestions}`} color={pctColor(summary.overallPct)} />
              <StatCell label="Best session" value={`${summary.bestSessionPct}%`} sub={summary.totalSessions === 1 ? 'first attempt' : `over ${summary.totalSessions} sessions`} color={pctColor(summary.bestSessionPct)} />
              <StatCell label="Last session" value={summary.lastSessionPct !== null ? `${summary.lastSessionPct}%` : '—'} sub={summary.lastSessionPct === null ? 'no sessions yet' : formatDate(scopedSessions[0]?.startedAt ?? Date.now())} color={pctColor(summary.lastSessionPct)} />
              <StatCell label="Sessions" value={String(summary.totalSessions)} sub="90-day window" color="text-slate-200" />
            </div>

            {/* Trend sparkline */}
            <div className="border border-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-micro font-mono text-slate-400 uppercase tracking-wide">Trend, last 10 sessions</p>
                <p className="text-micro font-mono text-slate-400">oldest → newest</p>
              </div>
              <Sparkline points={summary.trend} />
              {summary.trend.length >= 2 && (
                <p className="text-micro font-mono text-slate-400 mt-1">
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
                <p className="text-micro font-mono text-slate-400 uppercase tracking-wide px-4 pt-3 pb-2 border-b border-slate-800">
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
                            {s.skipped > 0 && <span className="text-micro font-mono text-slate-400">· {s.skipped} skipped</span>}
                          </div>
                          <p className="text-micro font-mono text-slate-400 mt-0.5 truncate">
                            {s.cert} · {s.category} · {s.difficulty}
                          </p>
                        </div>
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="text-micro font-mono text-slate-400">{formatDate(s.startedAt)}</span>
                          <span className="text-slate-400 text-micro">→</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topic heatmap */}
              <div className="border border-slate-800 rounded-lg">
                <p className="text-micro font-mono text-slate-400 uppercase tracking-wide px-4 pt-3 pb-2 border-b border-slate-800">
                  Accuracy by topic
                </p>
                {topics.length === 0 ? (
                  <p className="text-2xs font-mono text-slate-400 px-4 py-4">No data for this cert scope.</p>
                ) : (
                  <div className="px-4 py-3 space-y-2">
                    {topics.slice(0, 12).map((t) => (
                      <div key={t.category}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-2xs text-slate-300 truncate max-w-[70%]">{t.category}</span>
                          <span className="text-micro font-mono text-slate-500">
                            <span className={pctColor(t.accuracy)}>{t.accuracy}%</span>
                            <span className="text-slate-500"> · {t.right}/{t.seen}</span>
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
                <p className="text-micro font-mono text-slate-400 uppercase tracking-wide">
                  Per-question stats, {perQRows.length} question{perQRows.length === 1 ? '': 's'} you&rsquo;ve seen
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-micro font-mono text-slate-500 mr-1">sort</span>
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
              <div className="max-h-[420px] overflow-x-auto overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-slate-900 border-b border-slate-800/50">
                    <tr className="text-left text-micro font-mono text-slate-400 uppercase tracking-wide">
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
                            className={`border-t border-slate-800/40 cursor-pointer hover:bg-slate-800/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-400 ${isOpen ? 'bg-slate-800/40' : ''}`}
                            aria-expanded={isOpen}
                            // A row that expands on click is a control. Without a
                            // tabIndex, role and key handler it was reachable by mouse
                            // only, so the explanation behind every missed question was
                            // closed to keyboard and screen-reader users.
                            tabIndex={0}
                            role="button"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setExpandedQId(isOpen ? null : r.qId);
                              }
                            }}
                          >
                            <td className="px-3 py-2 max-w-md">
                              <p className="text-slate-300 line-clamp-2 flex items-start gap-2">
                                <span className="text-slate-400 text-micro pt-0.5">{isOpen ? '▾' : '▸'}</span>
                                <span>{r.question}</span>
                              </p>
                              <p className="text-micro font-mono text-slate-400 mt-0.5 ml-4">{r.category} · {r.topic}</p>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className={`font-mono font-bold ${pctColor(r.accuracy)}`}>{r.accuracy}%</span>
                              <span className="text-micro font-mono text-slate-500 ml-1">{r.right}/{r.seen}</span>
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
                                <p className="text-micro font-mono text-slate-400 uppercase tracking-wide mb-1">Why</p>
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
      <p className="text-micro font-mono text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold font-mono mt-1 ${color}`}>{value}</p>
      <p className="text-micro font-mono text-slate-400 mt-0.5 truncate">{sub}</p>
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
  // Says what the headline is measuring. A number sourced from untimed practice must not
  // look like a number sourced from a full mock.
  const basisLabel =
    r.basis === 'mock' ? `${r.mockCount} recent mock${r.mockCount === 1 ? '' : 's'}`
    : r.basis === 'practice' ? 'recent practice, no mock sat'
    : 'no attempts yet';

  return (
    <div className={`border rounded-lg p-4 ${border}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-micro font-mono uppercase tracking-wide text-slate-500">Readiness, {cert}</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className={`font-mono text-4xl font-bold ${textColor}`}>{r.score}%</span>
            <span className={`rounded border px-1.5 py-0.5 font-mono text-micro ${textColor} border-current/40`}>{label}</span>
            <span className="font-mono text-micro text-slate-500">from {basisLabel}</span>
          </div>
          <p className="mt-2 text-2xs leading-relaxed text-slate-400">{r.reason}</p>
        </div>
        {/* Wraps instead of stranding a row: three fixed 96px blocks plus gaps do not
            fit beside the score column on a narrow phone. */}
        <div className="flex flex-wrap gap-4">
          <MiniBar label="Mock avg" value={r.mockPct} threshold={r.passPct} />
          <MiniBar label="Practice" value={r.practicePct} threshold={r.passPct} />
          <MiniBar label="Coverage" value={r.coveragePct} threshold={r.passPct} muted />
          <MiniBar label="Pass mark" value={r.passPct} threshold={r.passPct} muted />
        </div>
      </div>
    </div>
  );
}

/** `value` is null when the metric has no data yet, which is not the same as zero. */
function MiniBar({ label, value, threshold, muted }: { label: string; value: number | null; threshold: number; muted?: boolean }) {
  const has = value !== null;
  const v = value ?? 0;
  const barColor = muted || !has ? 'bg-slate-600'
    : v >= threshold + 10 ? 'bg-emerald-500'
    : v >= threshold      ? 'bg-amber-500'
    :                       'bg-red-500';
  const textColor = muted || !has ? 'text-slate-500'
    : v >= threshold + 10 ? 'text-emerald-400'
    : v >= threshold      ? 'text-amber-400'
    :                       'text-red-400';
  return (
    <div className="w-24">
      <p className="text-micro font-mono uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-0.5 font-mono text-lg font-bold ${textColor}`}>{has ? `${v}%` : '—'}</p>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full ${barColor} rounded-full`} style={{ width: has ? `${v}%` : '0%' }} />
      </div>
    </div>
  );
}
