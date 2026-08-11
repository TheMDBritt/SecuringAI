'use client';
import { useEffect, useMemo, useState } from 'react';
import { QUIZ_QUESTIONS } from '@/lib/playbook-quiz';
import {
  loadProgress,
  resetProgress,
  summarizeCert,
  topicAccuracy,
  certsWithData,
  type ProgressData,
  type SessionRecord,
} from '@/lib/quiz-progress';

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
    return <div className="h-10 flex items-center text-[10px] font-mono text-slate-600">need ≥ 2 sessions for trend</div>;
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
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet-400" />
      <circle cx={((points.length - 1) * step).toFixed(1)} cy={lastY.toFixed(1)} r="2.5" className="fill-violet-300" />
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

// ─── Main component ──────────────────────────────────────────────────────────

type SortKey = 'accuracy' | 'seen' | 'last';

export default function ProgressDashboard() {
  const [data, setData]   = useState<ProgressData>({ sessions: [], perQ: {} });
  const [cert, setCert]   = useState<string>('All');
  const [sortKey, setSort] = useState<SortKey>('accuracy');
  const [hydrated, setHyd] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setData(loadProgress());
    setHyd(true);
  }, []);

  const availableCerts = useMemo(() => {
    const found = certsWithData(data);
    return ['All', ...found.filter((c) => c !== 'All')];
  }, [data]);

  const summary = useMemo(() => summarizeCert(data, cert), [data, cert]);
  const topics  = useMemo(() => topicAccuracy(data, cert, Q_CATEGORY_LOOKUP), [data, cert]);

  // Filter sessions to selected cert scope, newest-first.
  const scopedSessions: SessionRecord[] = useMemo(() => {
    return cert === 'All'
      ? data.sessions
      : data.sessions.filter((s) => s.cert === cert);
  }, [data, cert]);

  // Per-question table rows — only for questions the user has actually seen
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

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* Header — cert switcher + reset */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Progress</h2>
            <p className="text-[11px] font-mono text-slate-600 mt-0.5">
              Session history · per-question accuracy · weak-topic heatmap · 90-day rolling window
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-mono text-slate-600 uppercase tracking-wide">Cert</label>
            <select
              value={cert}
              onChange={(e) => setCert(e.target.value)}
              className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-violet-500/50"
            >
              {availableCerts.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="text-[10px] font-mono px-2 py-1 rounded border border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500"
              >
                reset
              </button>
            ) : (
              <span className="flex items-center gap-1">
                <button
                  onClick={() => { resetProgress(); setData({ sessions: [], perQ: {} }); setConfirmReset(false); }}
                  className="text-[10px] font-mono px-2 py-1 rounded border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                >
                  confirm reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="text-[10px] font-mono px-2 py-1 rounded border border-slate-700 text-slate-500 hover:text-slate-300"
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
            <p className="text-[11px] font-mono text-slate-600">
              Take a quiz — your progress will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* All-time stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCell label="All-time" value={`${summary.overallPct}%`} sub={`${summary.totalCorrect}/${summary.totalQuestions}`} color={pctColor(summary.overallPct)} />
              <StatCell label="Best session" value={`${summary.bestSessionPct}%`} sub={summary.totalSessions === 1 ? 'first attempt' : `over ${summary.totalSessions} sessions`} color={pctColor(summary.bestSessionPct)} />
              <StatCell label="Last session" value={summary.lastSessionPct !== null ? `${summary.lastSessionPct}%` : '—'} sub={summary.lastSessionPct === null ? '—' : formatDate(scopedSessions[0]?.startedAt ?? Date.now())} color={pctColor(summary.lastSessionPct ?? 0)} />
              <StatCell label="Sessions" value={String(summary.totalSessions)} sub="90-day window" color="text-slate-200" />
            </div>

            {/* Trend sparkline */}
            <div className="border border-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide">Trend — last 10 sessions</p>
                <p className="text-[10px] font-mono text-slate-600">oldest → newest</p>
              </div>
              <Sparkline points={summary.trend} />
              {summary.trend.length >= 2 && (
                <p className="text-[10px] font-mono text-slate-600 mt-1">
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
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide px-4 pt-3 pb-2 border-b border-slate-800">
                  Recent sessions
                </p>
                <div className="divide-y divide-slate-800/60">
                  {scopedSessions.slice(0, 10).map((s) => {
                    const pct = s.count === 0 ? 0 : Math.round((s.correct / s.count) * 100);
                    return (
                      <div key={s.id} className="flex items-center justify-between px-4 py-2 text-xs">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold ${pctColor(pct)}`}>{pct}%</span>
                            <span className="text-slate-300">{s.correct}/{s.count}</span>
                            {s.examMode && <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">exam</span>}
                            {s.skipped > 0 && <span className="text-[9px] font-mono text-slate-600">· {s.skipped} skipped</span>}
                          </div>
                          <p className="text-[10px] font-mono text-slate-600 mt-0.5 truncate">
                            {s.cert} · {s.category} · {s.difficulty}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-600 shrink-0">{formatDate(s.startedAt)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Topic heatmap */}
              <div className="border border-slate-800 rounded-lg">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide px-4 pt-3 pb-2 border-b border-slate-800">
                  Accuracy by topic
                </p>
                {topics.length === 0 ? (
                  <p className="text-[11px] font-mono text-slate-600 px-4 py-4">No data for this cert scope.</p>
                ) : (
                  <div className="px-4 py-3 space-y-2">
                    {topics.slice(0, 12).map((t) => (
                      <div key={t.category}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] text-slate-300 truncate max-w-[70%]">{t.category}</span>
                          <span className="text-[10px] font-mono text-slate-500">
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
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide">
                  Per-question stats — {perQRows.length} question{perQRows.length === 1 ? '' : 's'} you've seen
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono text-slate-700 mr-1">sort</span>
                  {(['accuracy', 'seen', 'last'] as SortKey[]).map((k) => (
                    <button
                      key={k}
                      onClick={() => setSort(k)}
                      className={[
                        'text-[10px] font-mono px-1.5 py-0.5 rounded border',
                        sortKey === k
                          ? 'border-violet-500/40 text-violet-300 bg-violet-500/10'
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
                    <tr className="text-left text-[10px] font-mono text-slate-600 uppercase tracking-wide">
                      <th className="px-3 py-2">Question</th>
                      <th className="px-3 py-2 text-right">Accuracy</th>
                      <th className="px-3 py-2 text-right">Seen</th>
                      <th className="px-3 py-2 text-right">Last</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perQRows.map((r) => (
                      <tr key={r.qId} className="border-t border-slate-800/40">
                        <td className="px-3 py-2 max-w-md">
                          <p className="text-slate-300 line-clamp-2">{r.question}</p>
                          <p className="text-[10px] font-mono text-slate-600 mt-0.5">{r.category} · {r.topic}</p>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className={`font-mono font-bold ${pctColor(r.accuracy)}`}>{r.accuracy}%</span>
                          <span className="text-[10px] font-mono text-slate-700 ml-1">{r.right}/{r.seen}</span>
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-500">{r.seen}</td>
                        <td className="px-3 py-2 text-right font-mono text-slate-500">{formatDate(r.lastSeenAt)}</td>
                      </tr>
                    ))}
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
      <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold font-mono mt-1 ${color}`}>{value}</p>
      <p className="text-[10px] font-mono text-slate-600 mt-0.5 truncate">{sub}</p>
    </div>
  );
}
