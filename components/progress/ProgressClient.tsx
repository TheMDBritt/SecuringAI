'use client';

import { useMemo } from 'react';
import Link from 'next/link';
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
} from '@/components/ui';

interface Scenario {
  id: string;
  title: string;
  dojoId: 1 | 2 | 3;
  difficulty: string;
}
interface Cert {
  id: string;
  name: string;
  provider: string;
}

const DOJO_TONE: Record<1 | 2 | 3, 'red' | 'cyan' | 'emerald'> = { 1: 'red', 2: 'cyan', 3: 'emerald' };

export function ProgressClient({
  scenarios,
  certs,
  dojoTitles,
}: {
  scenarios: Scenario[];
  certs: Cert[];
  dojoTitles: Record<1 | 2 | 3, string>;
}) {
  const { state, summary, hydrated } = useProgress();

  const attemptStats = useMemo(() => {
    const byScenario = new Map<string, { attempts: number; blocked: number }>();
    for (const r of state.attackRuns) {
      const cur = byScenario.get(r.scenarioId) ?? { attempts: 0, blocked: 0 };
      cur.attempts += 1;
      if (!r.succeeded) cur.blocked += 1;
      byScenario.set(r.scenarioId, cur);
    }
    return byScenario;
  }, [state.attackRuns]);

  const dojos = ([1, 2, 3] as const).map((id) => {
    const list = scenarios.filter((s) => s.dojoId === id);
    const done = list.filter((s) => attemptStats.has(s.id)).length;
    return { id, title: dojoTitles[id], tone: DOJO_TONE[id], list, done, pct: list.length ? Math.round((done / list.length) * 100) : 0 };
  });

  const certName = (id: string) => certs.find((c) => c.id === id)?.name ?? id;
  const hasActivity = hydrated && (summary.attackAttempts > 0 || summary.questionsAnswered > 0);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader
        eyebrow="Analytics"
        title="Your Progress"
        description="A detailed breakdown of every discipline and certification you've trained against. All computed from data stored locally in your browser."
        actions={<ButtonLink href="/dashboard" variant="secondary">Back to dashboard</ButtonLink>}
      />

      {!hasActivity ? (
        <EmptyState
          className="mt-8"
          title="No training data yet"
          description="Complete a quiz in the Playbook or run an attack in the Labs and your progress will build here automatically."
          action={
            <div className="flex gap-2.5">
              <ButtonLink href="/dojo" variant="primary" size="sm">Enter Labs</ButtonLink>
              <ButtonLink href="/playbook" variant="secondary" size="sm">Open Playbook</ButtonLink>
            </div>
          }
        />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="Quiz accuracy" value={summary.questionsAnswered ? `${summary.accuracy}%` : '—'} sub={`${summary.questionsCorrect}/${summary.questionsAnswered}`} tone="cyan" />
            <StatCard label="Sessions" value={summary.quizRuns + summary.attackAttempts} sub={`${summary.quizRuns} quiz · ${summary.attackAttempts} labs`} tone="violet" />
            <StatCard label="Questions answered" value={summary.questionsAnswered} sub={`${summary.questionsCorrect} correct`} tone="emerald" />
          </div>

          {/* Discipline breakdown */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {dojos.map((d) => (
              <Card key={d.id} className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge tone={d.tone} mono>Dojo {d.id}</Badge>
                    <h3 className="mt-2 text-sm font-semibold text-slate-100">{d.title}</h3>
                  </div>
                  <span className="font-mono text-sm text-slate-400">{d.pct}%</span>
                </div>
                <ProgressBar className="mt-3" value={d.pct} tone={d.tone} />
                <ul className="mt-4 max-h-64 space-y-1.5 overflow-y-auto pr-1">
                  {d.list.map((s) => {
                    const st = attemptStats.get(s.id);
                    const held = st && st.blocked === st.attempts;
                    return (
                      <li key={s.id} className="flex items-center gap-2 text-[13px]">
                        <span
                          className={[
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px]',
                            !st
                              ? 'border-surface-border text-slate-600'
                              : held
                                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                                : 'border-amber-500/50 bg-amber-500/10 text-amber-300',
                          ].join(' ')}
                        >
                          {st ? '✓' : ''}
                        </span>
                        <span className={st ? 'text-slate-300' : 'text-slate-500'}>{s.title}</span>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            ))}
          </div>

          {/* Cert accuracy */}
          <Card className="mt-6 p-5">
            <SectionHeading eyebrow="Certifications" title="Quiz performance by exam" action={<Link href="/playbook" className="text-[13px] font-medium text-brand-300 hover:text-brand-200">Practice more →</Link>} />
            {summary.perCert.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-surface-border/70 text-[11px] uppercase tracking-wider text-slate-500">
                      <th className="pb-2.5 pr-4 font-semibold">Certification</th>
                      <th className="pb-2.5 pr-4 font-semibold">Sessions</th>
                      <th className="pb-2.5 pr-4 font-semibold">Accuracy</th>
                      <th className="pb-2.5 font-semibold">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/50">
                    {summary.perCert.map((c) => (
                      <tr key={c.certId} className="transition-colors hover:bg-white/[0.02]">
                        <td className="py-3 pr-4 font-medium text-slate-200">{certName(c.certId)}</td>
                        <td className="py-3 pr-4 font-mono text-slate-400">{c.runs}</td>
                        <td className="py-3 pr-4">
                          <span className={c.accuracy >= 70 ? 'font-semibold text-emerald-300' : 'font-semibold text-amber-300'}>{c.accuracy}%</span>
                        </td>
                        <td className="py-3">
                          <ProgressBar value={c.accuracy} tone={c.accuracy >= 70 ? 'emerald' : 'amber'} height="h-1.5" className="max-w-[200px]" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-[13px] text-slate-500">Take a certification-scoped quiz to see per-exam accuracy here.</p>
            )}
          </Card>

          {/* Full history */}
          <Card className="mt-6 p-5">
            <SectionHeading eyebrow="History" title="Recent sessions" />
            <ul className="mt-4 divide-y divide-surface-border/60">
              {summary.recent.map((r, i) => {
                const body = (
                  <>
                    <Badge tone={r.tone === 'red' ? 'red' : r.tone === 'emerald' ? 'emerald' : 'amber'}>
                      {r.kind === 'quiz' ? 'Quiz' : 'Lab'}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-200">{r.label}</p>
                      <p className="truncate text-[12px] text-slate-500">{r.detail}</p>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-slate-600">{timeAgo(r.at)}</span>
                    {r.sessionId && <span className="shrink-0 text-slate-600 text-[11px] ml-1">→</span>}
                  </>
                );
                return (
                  <li key={i}>
                    {r.sessionId ? (
                      <Link
                        href={`/playbook?section=progress&session=${encodeURIComponent(r.sessionId)}`}
                        className="flex items-center gap-3 py-3 rounded hover:bg-white/5 -mx-2 px-2 transition-colors"
                        aria-label={`Review ${r.label} — ${r.detail}`}
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
          </Card>
        </>
      )}
    </div>
  );
}
