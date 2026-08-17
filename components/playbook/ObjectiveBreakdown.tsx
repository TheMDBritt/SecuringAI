'use client';

import { useCallback, useMemo, useState } from 'react';
import { EXAM_CERTS, domainNumber, parseDomainWeight } from '@/lib/cert-exam-domains';
import { ProgressBar, masteryTone } from '@/components/ui';
import { objectiveBreakdown, type ObjectiveStat } from '@/lib/objective-progress';
import { OBJECTIVE_TITLES } from '@/lib/objective-titles';
import type { ProgressData } from '@/lib/quiz-progress';
import { QUIZ_INDEX } from '@/lib/quiz-index';
import type { QuizQuestion } from '@/types';

/**
 * Where a learner is losing marks, ordered by what it costs to ignore.
 *
 * Accuracy alone is the wrong sort order for someone with an exam date: an
 * objective at 55% inside a domain worth 40% of the paper matters more than one
 * at 40% inside a domain worth 3%.
 */
function Row({
  stat,
  label,
  onDrill,
  busy,
}: {
  stat: ObjectiveStat;
  label: string | undefined;
  onDrill?: (stat: ObjectiveStat) => void;
  busy: boolean;
}) {
  const pct = stat.accuracy === null ? null : Math.round(stat.accuracy * 100);
  return (
    <li className="border-t border-slate-800/70 py-2.5 first:border-t-0">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <span className="font-mono text-2xs text-brand-300">{stat.number}</span>
          {label && <span className="ml-2 text-xs text-slate-300">{label}</span>}
        </div>
        <div className="flex shrink-0 items-baseline gap-2.5">
          <span className="font-mono text-2xs tabular-nums text-slate-400">
            {pct === null ? 'not attempted' : `${pct}%`}
          </span>
          {/* Naming the weak objective without a way to act on it left the learner to
              reconstruct the drill by hand from the domain filter. */}
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

      <ProgressBar value={pct ?? 0} tone={masteryTone(pct)} height="h-1" className="mt-1.5" label={`Objective ${stat.number} mastery`} />

      <p className="mt-1 font-mono text-micro text-slate-400">
        {stat.seen} of {stat.pool} questions seen
        {stat.weight !== null && ` · domain ${stat.domain} is ${Math.round(stat.weight * 100)}% of the exam`}
      </p>
    </li>
  );
}

const CERT_BY_ID = new Map(EXAM_CERTS.map((c) => [c.id, c]));

/** Cap on a drill set, so clicking a broad objective does not start a 300-question run. */
const DRILL_MAX = 20;

export default function ObjectiveBreakdown({
  data,
  certId,
  onLaunchQuiz,
}: {
  data: ProgressData;
  certId: string;
  /** Same signature the session review already uses for "Retake missed". */
  onLaunchQuiz?: (questions: QuizQuestion[], label: string) => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Builds the drill set for one objective and hands it to the quiz.
   *
   * Unseen questions come first, then the ones answered wrong, then the rest — a drill
   * that only re-serves what you have already seen cannot close a coverage gap.
   */
  const drill = useCallback(
    async (stat: ObjectiveStat) => {
      if (!onLaunchQuiz) return;
      setBusyId(stat.id);
      setError(null);
      try {
        const inObjective = QUIZ_INDEX.filter((q) => q.objectives?.includes(stat.id));
        const rank = (id: string) => {
          const s = data.perQ[id];
          if (!s || s.timesSeen === 0) return 0;
          return s.timesRight < s.timesSeen ? 1 : 2;
        };
        const ids = inObjective
          .map((q) => q.id)
          .sort((a, b) => rank(a) - rank(b))
          .slice(0, DRILL_MAX);
        if (ids.length === 0) {
          setError('No questions are tagged to this objective yet.');
          return;
        }
        const res = await fetch(`/api/questions?ids=${encodeURIComponent(ids.join(','))}`);
        if (!res.ok) throw new Error(String(res.status));
        const questions = (await res.json()) as QuizQuestion[];
        if (questions.length === 0) {
          setError('Could not load questions for this objective.');
          return;
        }
        onLaunchQuiz(questions, `Objective ${stat.number}`);
      } catch {
        setError('Could not load questions for this objective. Try again.');
      } finally {
        setBusyId(null);
      }
    },
    [onLaunchQuiz, data.perQ],
  );
  // Blueprint weights depend on the cert alone, so they are derived separately
  // from the learner's numbers. Bundling them meant the whole blueprint was
  // re-parsed every time a single answer was recorded.
  const weights = useMemo(() => {
    const out: Record<string, number> = {};
    for (const d of CERT_BY_ID.get(certId)?.domains ?? []) {
      const n = domainNumber(d.id);
      const w = parseDomainWeight(d.weight);
      if (n && w !== null) out[n] = w;
    }
    return out;
  }, [certId]);

  const stats = useMemo(
    () => objectiveBreakdown(data, certId, weights),
    [data, certId, weights],
  );

  if (stats.length === 0) {
    return (
      <p className="text-xs leading-relaxed text-slate-400">
        This exam&rsquo;s questions are not objective-tagged yet, so there is no
        per-objective breakdown for it. The domain breakdown above still applies.
      </p>
    );
  }

  const attempted = stats.filter((s) => s.accuracy !== null).length;

  return (
    <div>
      <p className="mb-3 text-xs leading-relaxed text-slate-400">
        {attempted === 0
          ? 'Ordered by how much of the exam each objective carries. Run a quiz to replace these estimates with your own accuracy.'
          : 'Ordered by what it costs to leave alone, which combines your accuracy with how much of the exam the objective carries. Work down from the top.'}
      </p>
      {error && (
        <p role="alert" className="mb-2 text-2xs text-red-300">{error}</p>
      )}
      <ul>
        {stats.map((s) => (
          <Row
            key={s.id}
            stat={s}
            label={OBJECTIVE_TITLES[s.id]}
            onDrill={onLaunchQuiz ? drill : undefined}
            busy={busyId === s.id}
          />
        ))}
      </ul>
    </div>
  );
}
