'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Skeleton } from '@/components/ui';
import { ProgressBar } from '@/components/ui/motion-primitives';
import { EXAM_CERTS } from '@/lib/cert-exam-domains';
import {
  loadProgress,
  readinessScore,
  dueCounts,
  QUIZ_PROGRESS_CHANGED_EVENT,
} from '@/lib/quiz-progress';
import { studyStreak } from '@/lib/study-streak';
import {
  loadSettings,
  updateSettings,
  onSettingsChange,
  daysUntilExam,
  DEFAULT_SETTINGS,
  type Settings,
} from '@/lib/settings-store';

/**
 * The answer to "what should I do right now".
 *
 * Everything on this panel already existed and was unreachable. The readiness
 * model and its plain-English reason sat four levels deep behind a tab and a
 * cert filter, and rendered with no button on it: it would say "drill your
 * weakest objectives, then sit a mock" and give the learner nothing to click.
 * The app also had no memory of which exam anyone was studying for, so it could
 * not have answered the question even if asked, and every session began by
 * re-picking a cert from a grid of eleven.
 *
 * So this is mostly assembly, not new intelligence: pick the cert once, then
 * show the readiness sentence, what is due, how far off the exam is, and a
 * single button that starts exactly the work being recommended.
 */
/**
 * Per-cert pool sizes, computed on the server and handed down.
 *
 * Deriving these in the browser meant importing the question index, which put
 * roughly 35kB on a route that had been 4.7kB. The page rendering this is a
 * server component and already reads the catalogue, so the numbers cost
 * nothing to pass and the index never reaches the client.
 */
export interface TodayPanelProps {
  poolSizes: Record<string, number>;
}

export function TodayPanel({ poolSizes }: TodayPanelProps) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [progress, setProgress] = useState(() => ({ sessions: [], perQ: {} }) as ReturnType<typeof loadProgress>);
  const [ready, setReady] = useState(false);

  const reread = useCallback(() => {
    setSettings(loadSettings());
    setProgress(loadProgress());
  }, []);

  // Read after mount, never during render: the stores are localStorage-backed
  // and the server has no view of them, so touching them earlier would render
  // one thing on the server and another in the browser.
  useEffect(() => {
    reread();
    setReady(true);
    const offSettings = onSettingsChange(reread);
    window.addEventListener(QUIZ_PROGRESS_CHANGED_EVENT, reread);
    return () => {
      offSettings();
      window.removeEventListener(QUIZ_PROGRESS_CHANGED_EVENT, reread);
    };
  }, [reread]);

  const cert = settings.activeCert;
  const certMeta = useMemo(() => EXAM_CERTS.find((c) => c.id === cert) ?? null, [cert]);

  const view = useMemo(() => {
    if (!cert || !certMeta) return null;
    const poolSize = poolSizes[cert] ?? 0;

    // Which questions this learner has actually met, taken from their own
    // sessions for this cert rather than from the question index. That keeps
    // the index off the client entirely, and it is the same set the readiness
    // model already uses for coverage, so the two cannot disagree.
    const seen = new Set<string>();
    for (const s of progress.sessions) {
      if (s.cert !== cert) continue;
      for (const r of s.results) seen.add(r.qId);
    }

    const reviewable = dueCounts([...seen], progress.perQ);
    const counts = {
      due: reviewable.due,
      later: reviewable.later,
      // Everything in the pool this learner has never opened.
      fresh: Math.max(0, poolSize - seen.size),
    };

    const readiness = readinessScore(progress, cert, poolSize, certMeta.passingScore ?? 70);
    const streak = studyStreak(progress.sessions, settings.dailyGoal);
    return { counts, readiness, streak };
  }, [cert, certMeta, progress, settings.dailyGoal, poolSizes]);

  // A placeholder of roughly the right size until the browser stores have been
  // read. Rendering the real figures on the server is impossible, since they
  // live in localStorage, and rendering zeros would state something false: "0
  // due" and "not loaded yet" look identical and mean opposite things. But
  // returning null left the page to jump when the panel arrived, so it holds
  // its space instead.
  if (!ready) {
    return (
      <Card className="p-5 sm:p-6">
        <p className="sr-only" role="status" aria-live="polite">
          Loading your plan
        </p>
        <Skeleton className="h-4 w-16" />
        <Skeleton className="mt-2 h-6 w-64" />
        <Skeleton className="mt-4 h-4 w-full max-w-lg" />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[68px] w-full" />
          ))}
        </div>
        <Skeleton className="mt-5 h-2 w-full" />
        <Skeleton className="mt-5 h-9 w-56" />
      </Card>
    );
  }

  if (!cert || !certMeta || !view) return <CertPicker onPick={(id) => updateSettings({ activeCert: id })} />;

  const { counts, readiness, streak } = view;
  const days = daysUntilExam(settings.examDate);
  const toDrill = counts.due + counts.fresh;

  const tone =
    readiness.status === 'green' ? 'text-emerald-300'
      : readiness.status === 'amber' ? 'text-amber-300'
        : 'text-red-300';

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-micro font-medium uppercase tracking-wider text-slate-500">Today</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-100">{certMeta.name}</h2>
        </div>
        <button
          type="button"
          onClick={() => updateSettings({ activeCert: '' })}
          className="rounded text-xs text-slate-400 underline underline-offset-2 transition-colors hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
        >
          Change exam
        </button>
      </div>

      {/* The sentence the readiness model already produced and nobody could reach. */}
      <p className={`mt-4 text-sm leading-relaxed ${tone}`}>{readiness.reason}</p>

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Due now" value={String(counts.due)} hint="ready for review" />
        <Stat label="Not yet seen" value={String(counts.fresh)} hint="new material" />
        <Stat
          label="Streak"
          value={streak.current === 0 ? '—' : `${streak.current}d`}
          hint={streak.studiedToday ? 'counted today' : 'study today to keep it'}
        />
        <Stat
          label="Exam"
          value={days === null ? '—' : days < 0 ? 'past' : `${days}d`}
          hint={days === null ? 'no date set' : 'until your sitting'}
        />
      </dl>

      <div className="mt-5">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-xs text-slate-400">
            Today&rsquo;s goal &middot; {streak.todayCount} of {streak.goal}
          </span>
          {streak.goalMet && <span className="text-xs font-medium text-emerald-300">Done</span>}
        </div>
        <ProgressBar
          value={streak.goalPct}
          label={`Daily goal, ${streak.todayCount} of ${streak.goal} questions`}
          tone={streak.goalMet ? 'emerald' : 'brand'}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        {/* One button, and it starts the work the sentence above recommends. */}
        <Link
          href={`/playbook?section=quiz&cert=${encodeURIComponent(cert)}&mode=due`}
          className="ui-btn ui-btn-primary px-4 py-2 text-sm"
        >
          {toDrill === 0
            ? 'Practise anyway'
            : counts.due > 0
              ? `Review ${counts.due} due`
              : `Start ${Math.min(counts.fresh, streak.goal)} new`}
        </Link>
        <Link
          href={`/playbook?section=quiz&cert=${encodeURIComponent(cert)}&mode=mock`}
          className="ui-btn ui-btn-secondary px-4 py-2 text-sm"
        >
          Sit a mock
        </Link>
        <Link
          href="/playbook?section=progress"
          className="ui-btn ui-btn-ghost px-3 py-2 text-sm"
        >
          Full breakdown
        </Link>
      </div>

      {toDrill === 0 && (
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Nothing is due. That is the schedule working, not a dead end &mdash; come back
          tomorrow, or practise ahead and the intervals will adjust.
        </p>
      )}
    </Card>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised/40 px-3 py-2.5">
      <dt className="text-micro uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold tabular-nums text-slate-100">{value}</dd>
      <p className="mt-0.5 text-micro text-slate-500">{hint}</p>
    </div>
  );
}

/**
 * Asked once, then remembered. This used to be step one of every quiz, every
 * session, with no way to say "this is the exam I am taking".
 */
function CertPicker({ onPick }: { onPick: (id: string) => void }) {
  return (
    <Card className="p-5 sm:p-6">
      <p className="text-micro font-medium uppercase tracking-wider text-slate-500">Get started</p>
      <h2 className="mt-1 text-xl font-semibold text-slate-100">Which exam are you studying for?</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        Pick one and this page becomes your daily plan: what is due, how ready you are, and
        one button that starts it. You can change it whenever you like.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {EXAM_CERTS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onPick(c.id)}
            className="rounded-lg border border-surface-border bg-surface-raised/40 px-3.5 py-3 text-left transition-all hover:border-brand-500/50 hover:bg-surface-raised active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
          >
            <span className="block text-sm font-medium text-slate-100">{c.name}</span>
            <span className="mt-0.5 block text-xs text-slate-500">{c.id}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
