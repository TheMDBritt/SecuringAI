'use client';
import { useMemo } from 'react';
import type { QuizQuestion } from '@/types';
import { useQuestionsByIds } from '@/lib/use-questions';
import type { SessionRecord, QuestionResult } from '@/lib/quiz-progress';

interface SessionReviewProps {
  session:         SessionRecord;
  onBack:          () => void;
  onRetakeMissed:  (questions: QuizQuestion[]) => void;
  onRetakeAll:     (questions: QuizQuestion[]) => void;
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/**
 * Full read-only breakdown of a past quiz session, with two retake buttons.
 * Retake buttons hand up a resolved QuizQuestion[] to the parent so the parent
 * can launch QuizEngine with a preloaded list, this component stays purely
 * presentational.
 */
export default function SessionReview({ session, onBack, onRetakeMissed, onRetakeAll }: SessionReviewProps) {
  // Only the questions in this session are fetched, rather than importing the
  // entire bank to look up the ones already answered.
  const { byId: Q_BY_ID, loading, error } = useQuestionsByIds(
    useMemo(() => session.results.map((r) => r.qId), [session]),
  );

  const { rows, missedQs, allQs, notFound } = useMemo(() => {
    const rows: Array<{ r: QuestionResult; q: QuizQuestion }> = [];
    const missedQs: QuizQuestion[] = [];
    const allQs: QuizQuestion[] = [];
    let notFound = 0;
    for (const r of session.results) {
      const q = Q_BY_ID[r.qId];
      if (!q) { notFound++; continue; }
      rows.push({ r, q });
      allQs.push(q);
      if (!r.correct) missedQs.push(q);
    }
    return { rows, missedQs, allQs, notFound };
  }, [session, Q_BY_ID]);

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="flex h-full items-center justify-center gap-3">
        <div
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"
        />
        <span className="text-sm text-slate-400">Loading this session…</span>
      </div>
    );
  }

  // A fetch failure used to land here as an empty review, which reads as "this
  // session had no questions" — telling the learner their work is missing when
  // it is merely unreachable.
  if (error && rows.length === 0) {
    return (
      <div role="alert" className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-slate-300">{error}</p>
        <p className="text-xs text-slate-500">
          Your session is safe. Only the question text failed to load.
        </p>
      </div>
    );
  }

  const pct = session.count === 0 ? 0 : Math.round((session.correct / session.count) * 100);
  const pctColor = pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">

        {/* Back + header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button
            onClick={onBack}
            className="text-2xs font-mono text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-500 px-2 py-1 rounded"
          >
            ← back to Progress
          </button>
          <div className="flex items-center gap-3 text-micro font-mono text-slate-400">
            <span>{formatDate(session.startedAt)}</span>
            {session.examMode && (
              <span className="px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/30">exam mode</span>
            )}
          </div>
        </div>

        {/* Score header */}
        <div className="border border-slate-800 rounded-lg p-4">
          <p className="text-micro font-mono text-slate-400 uppercase tracking-wide">Session review · {session.cert}</p>
          <div className="flex items-baseline gap-3 mt-1">
            <span className={`text-4xl font-bold font-mono ${pctColor}`}>{pct}%</span>
            <span className="text-sm text-slate-300">{session.correct} / {session.count} correct</span>
            {session.skipped > 0 && (
              <span className="text-2xs font-mono text-slate-500">· {session.skipped} skipped</span>
            )}
          </div>
          <p className="text-micro font-mono text-slate-400 mt-2">
            {session.category} · {session.difficulty}
          </p>
          {notFound > 0 && (
            <p className="text-micro font-mono text-amber-500 mt-2">
              ⚠ {notFound} question{notFound === 1 ? '': 's'} no longer in the bank, likely renamed or removed since this session.
            </p>
          )}
        </div>

        {/* Retake buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            disabled={missedQs.length === 0}
            onClick={() => onRetakeMissed(missedQs)}
            className="text-xs font-mono px-3 py-2 rounded border border-brand-500/40 text-brand-300 bg-brand-500/5 hover:bg-brand-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ↻ Retake missed ({missedQs.length})
          </button>
          <button
            disabled={allQs.length === 0}
            onClick={() => onRetakeAll(allQs)}
            className="text-xs font-mono px-3 py-2 rounded border border-brand-500/40 text-brand-300 bg-brand-500/5 hover:bg-brand-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ↻ Retake entire session ({allQs.length})
          </button>
          <span className="text-micro font-mono text-slate-400 ml-auto">
            options in their stored order, no re-shuffle for a like-for-like retry
          </span>
        </div>

        {/* Per-question breakdown */}
        <div className="space-y-3">
          {rows.map(({ r, q }, i) => {
            const skipped = r.chosen === null;
            const rowBorder = skipped
              ? 'border-slate-700/60 bg-slate-800/30'
              : r.correct
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-red-500/30 bg-red-500/5';
            const statusBadge = skipped
              ? { label: 'skipped', cls: 'text-slate-400 border-slate-600/50' }
              : r.correct
                ? { label: '✓ correct',   cls: 'text-emerald-300 border-emerald-500/40' }
                : { label: '✗ incorrect', cls: 'text-red-300 border-red-500/40' };
            return (
              <div key={q.id + i} className={`border rounded-lg p-4 ${rowBorder}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-micro font-mono text-slate-400">Q{i + 1} · {q.category} · {q.topic}</span>
                  <span className={`text-micro font-mono px-1.5 py-0.5 rounded border ${statusBadge.cls}`}>{statusBadge.label}</span>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed mb-3">{q.question}</p>

                <div className="space-y-1.5">
                  {q.options.map((opt, oi) => {
                    const isCorrect = oi === q.correct;
                    const isChosen  = oi === r.chosen;
                    let style = 'border-slate-800 text-slate-500';
                    if (isCorrect)      style = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200';
                    else if (isChosen)  style = 'border-red-500/50 bg-red-500/10 text-red-200';
                    return (
                      <div key={oi} className={`text-xs px-3 py-2 rounded border ${style}`}>
                        <span className="font-mono opacity-60 mr-2">{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                        {isCorrect && <span className="ml-2 text-emerald-400 font-bold">✓ correct</span>}
                        {isChosen && !isCorrect && <span className="ml-2 text-red-400 font-bold">← your pick</span>}
                        {isChosen && isCorrect && <span className="ml-2 text-emerald-400 font-bold">← your pick</span>}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-700/40">
                  <p className="text-micro font-mono text-slate-400 uppercase tracking-wide mb-1">Why</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom retake shortcut */}
        <div className="flex items-center gap-2 flex-wrap pt-2">
          <button
            disabled={missedQs.length === 0}
            onClick={() => onRetakeMissed(missedQs)}
            className="text-xs font-mono px-3 py-2 rounded border border-brand-500/40 text-brand-300 bg-brand-500/5 hover:bg-brand-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ↻ Retake missed ({missedQs.length})
          </button>
          <button
            disabled={allQs.length === 0}
            onClick={() => onRetakeAll(allQs)}
            className="text-xs font-mono px-3 py-2 rounded border border-brand-500/40 text-brand-300 bg-brand-500/5 hover:bg-brand-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ↻ Retake entire session ({allQs.length})
          </button>
        </div>

      </div>
    </div>
  );
}
