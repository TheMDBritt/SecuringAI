'use client';

import { useCallback, useMemo, useState } from 'react';
import { ProgressBar, masteryTone } from '@/components/ui';
import { domainBreakdown, type DomainStat } from '@/lib/domain-progress';
import { QUIZ_INDEX } from '@/lib/quiz-index';
import { EXAM_CERTS, questionMatchesDomain } from '@/lib/cert-exam-domains';
import type { ProgressData } from '@/lib/quiz-progress';
import type { QuizQuestion } from '@/types';

/** Cap on a drill set, so one click does not start a 200-question run. */
const DRILL_MAX = 20;

function Row({
  stat,
  onDrill,
  busy,
}: {
  stat: DomainStat;
  onDrill?: (s: DomainStat) => void;
  busy: boolean;
}) {
  const pct = stat.accuracy === null ? null : Math.round(stat.accuracy * 100);
  return (
    <li className="border-t border-slate-800/70 py-2.5 first:border-t-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 text-xs text-slate-300">{stat.name}</p>
        <div className="flex shrink-0 items-baseline gap-2.5">
          <span className="font-mono text-2xs tabular-nums text-slate-400">
            {pct === null ? 'not attempted' : `${pct}%`}
          </span>
          {onDrill && (
            <button
              onClick={() => onDrill(stat)}
              disabled={busy || stat.pool === 0}
              className="rounded border border-brand-500/40 bg-brand-500/5 px-2 py-0.5 font-mono text-micro text-brand-300 transition-colors hover:bg-brand-500/15 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-transparent disabled:text-slate-500"
            >
              {busy ? 'Loading…' : 'Drill'}
            </button>
          )}
        </div>
      </div>

      <ProgressBar
        value={pct ?? 0}
        tone={masteryTone(pct)}
        height="h-1"
        className="mt-1.5"
        label={`${stat.name} mastery`}
      />

      <p className="mt-1 font-mono text-micro text-slate-400">
        {stat.seen} of {stat.pool} questions seen
        {stat.weight !== null && ` · ${Math.round(stat.weight * 100)}% of the exam`}
      </p>
    </li>
  );
}

/**
 * Domain mastery for any cert.
 *
 * Works where the objective breakdown cannot: objective tags exist only for SecAI+,
 * but every cert publishes domains and every question can be placed in one by category.
 */
export default function DomainBreakdown({
  data,
  certId,
  onLaunchQuiz,
}: {
  data: ProgressData;
  certId: string;
  onLaunchQuiz?: (questions: QuizQuestion[], label: string) => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => domainBreakdown(data, certId), [data, certId]);

  const drill = useCallback(
    async (stat: DomainStat) => {
      if (!onLaunchQuiz) return;
      setBusyId(stat.id);
      setError(null);
      try {
        const cert = EXAM_CERTS.find((c) => c.id === certId);
        const domain = cert?.domains.find((d) => d.id === stat.id);
        if (!domain) throw new Error('domain');

        // Unseen first, then answered wrong, then the rest: a drill that only
        // re-serves what has been seen cannot close a coverage gap.
        const rank = (id: string) => {
          const s = data.perQ[id];
          if (!s || s.timesSeen === 0) return 0;
          return s.timesRight < s.timesSeen ? 1 : 2;
        };
        const ids = QUIZ_INDEX.filter(
          (q) => q.certTags.includes(certId) && questionMatchesDomain(q, domain),
        )
          .map((q) => q.id)
          .sort((a, b) => rank(a) - rank(b))
          .slice(0, DRILL_MAX);

        if (ids.length === 0) {
          setError('No questions are available for this domain yet.');
          return;
        }
        const res = await fetch(`/api/questions?ids=${encodeURIComponent(ids.join(','))}`);
        if (!res.ok) throw new Error(String(res.status));
        const questions = (await res.json()) as QuizQuestion[];
        if (questions.length === 0) {
          setError('Could not load questions for this domain.');
          return;
        }
        onLaunchQuiz(questions, stat.name);
      } catch {
        setError('Could not load questions for this domain. Try again.');
      } finally {
        setBusyId(null);
      }
    },
    [onLaunchQuiz, certId, data.perQ],
  );

  if (stats.length === 0) {
    return (
      <p className="text-xs leading-relaxed text-slate-400">
        No published domain breakdown is available for this certification.
      </p>
    );
  }

  const attempted = stats.filter((s) => s.accuracy !== null).length;

  return (
    <div>
      <p className="mb-3 text-xs leading-relaxed text-slate-400">
        {attempted === 0
          ? 'Ordered by how much of the exam each domain carries. Run a quiz to replace these with your own accuracy.'
          : 'Ordered by what it costs to leave alone, which weighs your accuracy against the share of the exam the domain carries.'}
      </p>
      {error && (
        <p role="alert" className="mb-2 text-2xs text-red-300">
          {error}
        </p>
      )}
      <ul>
        {stats.map((s) => (
          <Row key={s.id} stat={s} onDrill={onLaunchQuiz ? drill : undefined} busy={busyId === s.id} />
        ))}
      </ul>
    </div>
  );
}
