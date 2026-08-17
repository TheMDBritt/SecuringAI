'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useProgress } from '@/components/hooks/useProgress';
import { Reveal } from '@/components/ui/Reveal';
import { timeAgo } from '@/lib/progress-store';
import {
  Card,
  Badge,
  ButtonLink,
  ProgressBar,
  StatCard,
  CountUp,
  SectionHeading,
  PageHeader,
  EmptyState,
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

// Colour reports state, not identity. All three dojos carry the brand tone;
// they are told apart by their labels, as they are everywhere else.
const DOJO_TONE: Record<1 | 2 | 3, 'brand'> = { 1: 'brand', 2: 'brand', 3: 'brand' };
const DOJO_HEX: Record<string, string> = { red: '#f87171', cyan: '#22d3ee', emerald: '#34d399' };

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

const DIFF_RANK: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };

export function DashboardClient({ catalog }: { catalog: Catalog }) {
  const { state, summary, hydrated } = useProgress();

  const attemptedIds = useMemo(() => new Set(state.attackRuns.map((r) => r.scenarioId)), [state.attackRuns]);
  const completion = catalog.counts.scenarios
    ? Math.round((Math.min(attemptedIds.size, catalog.counts.scenarios) / catalog.counts.scenarios) * 100)
    : 0;

  // Recommended next lab: first un-attempted scenario, easiest dojo/difficulty first.
  const nextLab = useMemo(() => {
    const pool = [...catalog.scenarios]
      .filter((s) => !attemptedIds.has(s.id))
      .sort((a, b) => a.dojoId - b.dojoId || (DIFF_RANK[a.difficulty] ?? 1) - (DIFF_RANK[b.difficulty] ?? 1));
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
        description="Your live view across all three disciplines, attack defense, SOC operations, and AI governance, with completion, accuracy, and a recommended next scenario."
        actions={
          <>
            <ButtonLink href="/progress" variant="secondary" size="md">
              View progress
            </ButtonLink>
            <ButtonLink href="/playbook" variant="secondary" size="md">
              Study playbook
            </ButtonLink>
            <ButtonLink href="/dojo" variant="primary" size="md">
              Enter the Dojo
            </ButtonLink>
          </>
        }
      />

      {/* Top stat row */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Reveal>
        <StatCard label="Overall completion" value={hydrated ? <CountUp value={completion} suffix="%" /> : "—"} sub={`${attemptedIds.size}/${catalog.counts.scenarios} scenarios explored`} tone="brand" icon={ICONS.layers} />
        </Reveal>
        <Reveal delay={70}>
        <StatCard label="Quiz accuracy" value={hydrated && summary.questionsAnswered ? <CountUp value={summary.accuracy} suffix="%" /> : "—"} sub={`${summary.questionsCorrect}/${summary.questionsAnswered} correct`} tone="brand" icon={ICONS.check} />
        </Reveal>
        <Reveal delay={140}>
        <StatCard label="Dojo attempts" value={hydrated ? <CountUp value={summary.attackAttempts} /> : "—"} sub={`${summary.quizRuns} quiz sessions`} tone="brand" icon={ICONS.target} />
        </Reveal>
      </div>

      {/* Main grid, current dojo progress full width now */}
      <div className="mt-6 grid grid-cols-1 gap-4">
        {/* Current dojo progress */}
        <Card className="p-5">
          <SectionHeading
            index={1}
            eyebrow="Discipline progress"
            title="Current dojo progress"
            action={<Link href="/dojo" className="text-xs font-medium text-brand-300 hover:text-brand-200">Open the Dojo →</Link>}
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
                  <span className="font-mono text-xs text-slate-400">{d.done}/{d.total}</span>
                </div>
                <ProgressBar value={hydrated ? d.pct : 0} tone={d.tone} label={`${d.title} scenarios complete`} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Second grid, difficulty mix + next scenario */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Difficulty distribution */}
        <Card className="p-5">
          <SectionHeading index={2} eyebrow="Coverage" title="Difficulty mix" />
          {hydrated && (summary.attackAttempts > 0 || diffTotal > 1) ? (
            <div className="mt-5 space-y-3.5">
              {diffBars.map((b) => (
                <div key={b.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-slate-300">{b.label}</span>
                    <span className="font-mono text-slate-500">{b.v}</span>
                  </div>
                  <ProgressBar value={(b.v / diffTotal) * 100} tone={b.tone} height="h-1.5" label={`${b.label} attempts`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-xs leading-relaxed text-slate-500">
                Difficulty coverage appears once you have run scenarios across the beginner,
                intermediate and advanced tiers.
              </p>
              <ButtonLink href="/dojo" variant="secondary" size="sm" className="mt-4">
                Run a scenario
              </ButtonLink>
            </div>
          )}
        </Card>

        {/* Recommended next scenario */}
        <Card hover className="flex flex-col p-5">
          <SectionHeading index={3} eyebrow="Recommended" title="Next scenario" />
          {nextLab ? (
            <div className="mt-4 flex flex-1 flex-col">
              <Badge tone={DOJO_TONE[nextLab.dojoId]} mono className="w-fit">
                Dojo {nextLab.dojoId} · {catalog.dojoMeta[nextLab.dojoId].title}
              </Badge>
              <h3 className="mt-3 text-base font-semibold text-slate-100">{nextLab.title}</h3>
              <p className="mt-1.5 text-xs capitalize text-slate-500">{nextLab.difficulty} difficulty</p>
              <div className="flex-1" />
              <ButtonLink href="/dojo" variant="primary" size="md" className="mt-5 w-full">
                Start this scenario →
              </ButtonLink>
            </div>
          ) : null}
        </Card>
      </div>

      {/* Recent activity + catalog */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <SectionHeading
            index={4}
            eyebrow="Timeline"
            title="Recent activity"
            action={summary.lastActive ? <span className="text-xs text-slate-500">Last active {timeAgo(summary.lastActive)}</span> : undefined}
          />
          {hasActivity ? (
            <ul className="mt-4 divide-y divide-surface-border/60">
              {summary.recent.map((r, i) => {
                const body = (
                  <>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-surface-border bg-surface-raised">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DOJO_HEX[r.tone] ?? '#94a3b8' }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-200">{r.label}</p>
                      <p className="truncate text-xs text-slate-500">{r.detail}</p>
                    </div>
                    <span className="shrink-0 font-mono text-2xs text-slate-400">{timeAgo(r.at)}</span>
                    {r.sessionId && <span className="shrink-0 text-slate-400 text-2xs ml-1">→</span>}
                  </>
                );
                return (
                  <li key={i}>
                    {r.sessionId ? (
                      <Link
                        href={`/playbook?section=progress&session=${encodeURIComponent(r.sessionId)}`}
                        className="flex items-center gap-3 py-3 rounded hover:bg-white/5 -mx-2 px-2 transition-colors"
                        aria-label={`Review ${r.label}, ${r.detail}`}
                      >
                        {body}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 py-3">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              className="mt-4"
              icon={ICONS.target}
              title="No activity yet"
              description="Your quiz sessions and dojo attempts will appear here as you train. Nothing leaves your browser."
              action={<ButtonLink href="/dojo" variant="primary" size="sm">Run your first scenario</ButtonLink>}
            />
          )}
        </Card>

        {/* Catalog snapshot */}
        <Card className="p-5">
          <SectionHeading index={5} eyebrow="Platform" title="Content library" />
          <dl className="mt-4 space-y-3">
            {[
              { k: 'Dojo scenarios', v: catalog.counts.scenarios },
              { k: 'Quiz questions', v: catalog.counts.questions.toLocaleString() },
              { k: 'Glossary terms', v: catalog.counts.glossary.toLocaleString() },
              { k: 'SOC incidents', v: catalog.counts.incidents },
              { k: 'Certifications mapped', v: catalog.counts.certs },
            ].map((row) => (
              <div key={row.k} className="flex items-center justify-between border-b border-surface-border/50 pb-2.5 last:border-0">
                <dt className="text-xs text-slate-400">{row.k}</dt>
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
