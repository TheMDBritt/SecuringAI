'use client';

import { useMemo } from 'react';
import { EXAM_CERTS, domainNumber, parseDomainWeight } from '@/lib/cert-exam-domains';
import { ProgressBar, masteryTone } from '@/components/ui';
import { objectiveBreakdown, type ObjectiveStat } from '@/lib/objective-progress';
import { OBJECTIVE_TITLES } from '@/lib/objective-titles';
import type { ProgressData } from '@/lib/quiz-progress';

/**
 * Where a learner is losing marks, ordered by what it costs to ignore.
 *
 * Accuracy alone is the wrong sort order for someone with an exam date: an
 * objective at 55% inside a domain worth 40% of the paper matters more than one
 * at 40% inside a domain worth 3%.
 */
function Row({ stat, label }: { stat: ObjectiveStat; label: string | undefined }) {
  const pct = stat.accuracy === null ? null : Math.round(stat.accuracy * 100);
  return (
    <li className="border-t border-slate-800/70 py-2.5 first:border-t-0">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <span className="font-mono text-2xs text-brand-300">{stat.number}</span>
          {label && <span className="ml-2 text-xs text-slate-300">{label}</span>}
        </div>
        <span className="shrink-0 font-mono text-2xs tabular-nums text-slate-400">
          {pct === null ? 'not attempted' : `${pct}%`}
        </span>
      </div>

      <ProgressBar value={pct ?? 0} tone={masteryTone(pct)} height="h-1" className="mt-1.5" />

      <p className="mt-1 font-mono text-micro text-slate-400">
        {stat.seen} of {stat.pool} questions seen
        {stat.weight !== null && ` · domain ${stat.domain} is ${Math.round(stat.weight * 100)}% of the exam`}
      </p>
    </li>
  );
}

const CERT_BY_ID = new Map(EXAM_CERTS.map((c) => [c.id, c]));

export default function ObjectiveBreakdown({
  data,
  certId,
}: {
  data: ProgressData;
  certId: string;
}) {
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
      <ul>
        {stats.map((s) => (
          <Row key={s.id} stat={s} label={OBJECTIVE_TITLES[s.id]} />
        ))}
      </ul>
    </div>
  );
}
