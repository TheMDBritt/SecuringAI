'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useProgress } from '@/components/hooks/useProgress';
import { timeAgo } from '@/lib/progress-store';
import {
  Card,
  Badge,
  ButtonLink,
  ProgressBar,
  StatCard,
  SectionHeading,
  PageHeader,
  EmptyState,
  Donut,
} from '@/components/ui';

export interface CatalogScenario {
  id: string;
  title: string;
  dojoId: 1 | 2 | 3;
  difficulty: string;
}

interface Catalog {
  scenarios: CatalogScenario[];
  counts: { scenarios: number; questions: number; glossary: number; incidents: number; certs: number };
  dojoMeta: Record<1 | 2 | 3, { title: string; accent: string }>;
}

const DOJO_TONE: Record<1 | 2 | 3, 'red' | 'cyan' | 'emerald'> = { 1: 'red', 2: 'cyan', 3: 'emerald' };
const DOJO_HEX: Record<string, string> = { red: '#f87171', cyan: '#22d3ee', emerald: '#34d399' };

function scoreTone(v: number): string {
  if (v >= 80) return '#34d399';
  if (v >= 55) return '#f59e0b';
  return '#f87171';
}

const ICONS = {
  shield: (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 2.5V11c0 4.5-3 8.3-7 9.5-4-1.2-7-5-7-9.5V5.5z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  target: (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  check: (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  layers: (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" />
    </svg>
  ),
};

export function DashboardClient({ catalog }: { catalog: Catalog }) {
  const { state, summary, hydrated } = useProgress();

  const attemptedIds = useMemo(() => new Set(state.attackRuns.map((r) => r.scenarioId)), [state.attackRuns]);
  const completion = Math.round((Math.min(attemptedIds.size, catalog.counts.scenarios) / catalog.counts.scenarios) * 100);

  // Recommended next lab: first un-attempted scenario, easiest dojo/difficulty first.
  const diffRank: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };
  const nextLab = useMemo(() => {
    const pool = [...catalog.scenarios]
      .filter((s) => !attemptedIds.has(s.id))
      .sort((a, b) => a.dojoId - b.dojoId || (diffRank[a.difficulty] ?? 1) - (diffRank[b.difficulty] ?? 1));
    return pool[0] ?? catalog.scenarios[0];
  }, [catalog.scenarios, attemptedIds]);

  const perDojoRows = ([1, 2, 3] as const).map((id) => {
    const total = catalog.scenarios.filter((s) => s.dojoId === id).length;
    const done = new Set(state.attackRuns.filter((r) => r.dojoId === id).map((r) => r.scenarioId)).size;
    const pct = total ? Math.round((Math.min(done, total) / total) * 100) : 0;
    return { id, total, done: Math.min(done, total), pct, ...catalog.dojoMeta[id], tone: DOJO_TONE[id] };
  });

  const diff = summary.difficulty;
  const diffTotal = diff.beginner + diff.intermediate + diff.advanced + diff.unknown || 1;
  const diffBars = [
    { label: 'Beginner', v: diff.beginner, tone: 'emerald' as const },
    { label: 'Intermediate', v: diff.intermediate, tone: 'amber' as const },
    { label: 'Advanced', v: diff.advanced, tone: 'red' as const },
  ];

  const hasActivity = hydrated && (summary.attackAttempts > 0 || summary.questionsAnswered > 0);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader
        eyebrow="Security Operations"
        title="Training Dashboard"
        description="Your live view across all three disciplines — attack defense, SOC operations, and AI governance — with completion, accuracy, and a recommended next lab."
        actions={
          <>
            <ButtonLink href="/playbook" variant="secondary" size="md">
              Study playbook
            </ButtonLink>
            <ButtonLink href="/dojo" variant="primary" size="md">
              Enter Labs
            </ButtonLink>
          </>
        }
      />

      {/* Top stat row */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Overall completion" value={`${hydrated ? completion : 0}%`} sub={`${attemptedIds.size}/${catalog.counts.scenarios} scenarios explored`} tone="brand" icon={ICONS.layers} />
        <StatCard label="Defense rate" value={hydrated && summary.attackAttempts ? `${summary.defenseRate}%` : '—'} sub={`${summary.attacksBlocked} blocked · ${summary.attacksSucceeded} landed`} tone="emerald" icon={ICONS.shield} />
        <StatCard label="Quiz accuracy" value={hydrated && summary.questionsAnswered ? `${summary.accuracy}%` : '—'} sub={`${summary.questionsCorrect}/${summary.questionsAnswered} correct`} tone="cyan" icon={ICONS.check} />
        <StatCard label="Lab attempts" value={hydrated ? summary.attackAttempts : 0} sub={`${summary.quizRuns} quiz sessions`} tone="violet" icon={ICONS.target} />
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Security score */}
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <p className="ui-eyebrow">Security score</p>
          <div className="my-4">
            <Donut
              value={hydrated ? summary.securityScore : 0}
              tone={scoreTone(summary.securityScore)}
              label={hydrated ? summary.securityScore : 0}
              sublabel="/ 100"
              size={150}
            />
          </div>
          <p className="max-w-[15rem] text-[13px] leading-relaxed text-slate-400">
            {!hasActivity
              ? 'Run a lab or a quiz to generate your composite score.'
              : summary.securityScore >= 80
                ? 'Strong. You are defending attacks and passing domain checks consistently.'
                : summary.securityScore >= 55
                  ? 'Solid footing — keep drilling the disciplines where attacks still land.'
                  : 'Early days. Focus on blocking attacks and raising quiz accuracy.'}
          </p>
        </Card>

        {/* Current dojo progress */}
        <Card className="p-5 lg:col-span-2">
          <SectionHeading
            eyebrow="Discipline progress"
            title="Current dojo progress"
            action={<Link href="/dojo" className="text-[13px] font-medium text-brand-300 hover:text-brand-200">Open Labs →</Link>}
          />
          <div className="mt-5 space-y-5">
            {perDojoRows.map((d) => (
              <div key={d.id}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DOJO_HEX[d.tone] }} />
                    <span className="text-sm font-semibold text-slate-200">{d.title}</span>
                    <Badge tone={d.tone} mono>Dojo {d.id}</Badge>
                  </div>
                  <span className="font-mono text-[12px] text-slate-400">{d.done}/{d.total}</span>
                </div>
                <ProgressBar value={hydrated ? d.pct : 0} tone={d.tone} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Second grid */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Attack outcomes */}
        <Card className="p-5">
          <SectionHeading eyebrow="Outcomes" title="Attack results" />
          {hydrated && summary.attackAttempts > 0 ? (
            <div className="mt-5">
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/5">
                <div className="h-full bg-emerald-500" style={{ width: `${summary.defenseRate}%` }} />
                <div className="h-full bg-red-500" style={{ width: `${100 - summary.defenseRate}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <p className="text-2xl font-bold text-emerald-300">{summary.attacksBlocked}</p>
                  <p className="text-[12px] text-slate-400">Blocked by defense</p>
                </div>
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                  <p className="text-2xl font-bold text-red-300">{summary.attacksSucceeded}</p>
                  <p className="text-[12px] text-slate-400">Attacks landed</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-[13px] leading-relaxed text-slate-500">
              No attack attempts recorded yet. Load a Dojo 1 scenario, toggle guardrails, and fire a payload to populate this chart.
            </p>
          )}
        </Card>

        {/* Difficulty distribution */}
        <Card className="p-5">
          <SectionHeading eyebrow="Coverage" title="Difficulty mix" />
          {hydrated && summary.attackAttempts > 0 ? (
            <div className="mt-5 space-y-3.5">
              {diffBars.map((b) => (
                <div key={b.label}>
                  <div className="mb-1.5 flex items-center justify-between text-[12px]">
                    <span className="text-slate-300">{b.label}</span>
                    <span className="font-mono text-slate-500">{b.v}</span>
                  </div>
                  <ProgressBar value={(b.v / diffTotal) * 100} tone={b.tone} height="h-1.5" />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-[13px] leading-relaxed text-slate-500">
              Attempt labs across beginner, intermediate, and advanced scenarios to see your difficulty coverage.
            </p>
          )}
        </Card>

        {/* Recommended next lab */}
        <Card hover className="flex flex-col p-5">
          <SectionHeading eyebrow="Recommended" title="Next lab" />
          {nextLab ? (
            <div className="mt-4 flex flex-1 flex-col">
              <Badge tone={DOJO_TONE[nextLab.dojoId]} mono className="w-fit">
                Dojo {nextLab.dojoId} · {catalog.dojoMeta[nextLab.dojoId].title}
              </Badge>
              <h3 className="mt-3 text-base font-semibold text-slate-100">{nextLab.title}</h3>
              <p className="mt-1.5 text-[13px] capitalize text-slate-500">{nextLab.difficulty} difficulty</p>
              <div className="flex-1" />
              <ButtonLink href="/dojo" variant="primary" size="md" className="mt-5 w-full">
                Start this lab →
              </ButtonLink>
            </div>
          ) : null}
        </Card>
      </div>

      {/* Recent activity + catalog */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <SectionHeading
            eyebrow="Timeline"
            title="Recent activity"
            action={summary.lastActive ? <span className="text-[12px] text-slate-500">Last active {timeAgo(summary.lastActive)}</span> : undefined}
          />
          {hasActivity ? (
            <ul className="mt-4 divide-y divide-surface-border/60">
              {summary.recent.map((r, i) => (
                <li key={i} className="flex items-center gap-3 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-surface-border bg-surface-raised">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DOJO_HEX[r.tone] ?? '#94a3b8' }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">{r.label}</p>
                    <p className="truncate text-[12px] text-slate-500">{r.detail}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-slate-600">{timeAgo(r.at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              className="mt-4"
              icon={ICONS.target}
              title="No activity yet"
              description="Your quiz sessions and lab attempts will appear here as you train. Nothing leaves your browser."
              action={<ButtonLink href="/dojo" variant="primary" size="sm">Run your first lab</ButtonLink>}
            />
          )}
        </Card>

        {/* Catalog snapshot */}
        <Card className="p-5">
          <SectionHeading eyebrow="Platform" title="Content library" />
          <dl className="mt-4 space-y-3">
            {[
              { k: 'Scenario labs', v: catalog.counts.scenarios },
              { k: 'Quiz questions', v: catalog.counts.questions.toLocaleString() },
              { k: 'Glossary terms', v: catalog.counts.glossary.toLocaleString() },
              { k: 'SOC incidents', v: catalog.counts.incidents },
              { k: 'Certifications mapped', v: catalog.counts.certs },
            ].map((row) => (
              <div key={row.k} className="flex items-center justify-between border-b border-surface-border/50 pb-2.5 last:border-0">
                <dt className="text-[13px] text-slate-400">{row.k}</dt>
                <dd className="font-mono text-sm font-semibold text-slate-100">{row.v}</dd>
              </div>
            ))}
          </dl>
          <ButtonLink href="/playbook" variant="secondary" size="md" className="mt-4 w-full">
            Browse the playbook
          </ButtonLink>
        </Card>
      </div>
    </div>
  );
}
