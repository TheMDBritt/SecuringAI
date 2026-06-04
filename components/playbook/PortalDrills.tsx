'use client';
import { useState, useMemo } from 'react';
import { SC500_DRILLS, SC500_DRILL_PORTAL_COLORS, type Drill } from '@/lib/sc500-drills';

type Mode = 'list' | 'run' | 'done';

const DIFFICULTY_STYLE: Record<Drill['difficulty'], string> = {
  beginner:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  advanced:     'bg-red-500/10 text-red-400 border-red-500/30',
};

const PORTALS: Drill['portal'][] = ['Entra', 'Defender XDR', 'Sentinel', 'Defender for Cloud', 'Purview', 'Azure OpenAI', 'Security Copilot'];

export default function PortalDrills() {
  const [mode,         setMode]         = useState<Mode>('list');
  const [activeDrill,  setActiveDrill]  = useState<Drill | null>(null);
  const [stepIdx,      setStepIdx]      = useState(0);
  const [picks,        setPicks]        = useState<(number | null)[]>([]);
  const [portalFilter, setPortalFilter] = useState<Drill['portal'] | 'All'>('All');

  const drills = useMemo(
    () => (portalFilter === 'All' ? SC500_DRILLS : SC500_DRILLS.filter((d) => d.portal === portalFilter)),
    [portalFilter],
  );

  const startDrill = (d: Drill) => {
    setActiveDrill(d);
    setStepIdx(0);
    setPicks(new Array(d.steps.length).fill(null));
    setMode('run');
  };

  const handlePick = (i: number) => {
    if (!activeDrill) return;
    if (picks[stepIdx] !== null) return;
    const next = [...picks];
    next[stepIdx] = i;
    setPicks(next);
  };

  const handleNext = () => {
    if (!activeDrill) return;
    if (stepIdx + 1 >= activeDrill.steps.length) {
      setMode('done');
    } else {
      setStepIdx((s) => s + 1);
    }
  };

  const restart = () => {
    setMode('list');
    setActiveDrill(null);
    setStepIdx(0);
    setPicks([]);
  };

  // ── List view ────────────────────────────────────────────────────────────
  if (mode === 'list') {
    return (
      <div className="h-full overflow-y-auto p-4 space-y-4">
        <div className="mb-2">
          <h2 className="text-sm font-semibold text-slate-100">Portal Drills</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click-path simulations for the Microsoft security portals. Practice the menu order without a tenant.
            Each drill mimics what you&apos;d see in the real portal, step by step.
          </p>
        </div>

        {/* Portal filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setPortalFilter('All')}
            className={[
              'text-[10px] font-mono px-2 py-1 rounded border transition-colors',
              portalFilter === 'All'
                ? 'bg-slate-700 border-slate-500 text-slate-200'
                : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400',
            ].join(' ')}
          >
            All ({SC500_DRILLS.length})
          </button>
          {PORTALS.map((p) => {
            const count = SC500_DRILLS.filter((d) => d.portal === p).length;
            if (count === 0) return null;
            return (
              <button
                key={p}
                onClick={() => setPortalFilter(p)}
                className={[
                  'text-[10px] font-mono px-2 py-1 rounded border transition-colors',
                  portalFilter === p
                    ? SC500_DRILL_PORTAL_COLORS[p]
                    : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400',
                ].join(' ')}
              >
                {p} ({count})
              </button>
            );
          })}
        </div>

        {/* Drill cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {drills.map((d) => (
            <button
              key={d.id}
              onClick={() => startDrill(d)}
              className="text-left border border-slate-700 rounded-xl bg-slate-800/40 hover:bg-slate-800 hover:border-slate-600 transition-colors p-4"
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${SC500_DRILL_PORTAL_COLORS[d.portal]}`}>
                  {d.portal}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border capitalize ${DIFFICULTY_STYLE[d.difficulty]}`}>
                  {d.difficulty}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-100 mb-1.5 leading-snug">{d.title}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{d.scenario}</p>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-600">
                <span>{d.steps.length} steps</span>
                <span className="text-violet-400">Start drill →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Run view ─────────────────────────────────────────────────────────────
  if (mode === 'run' && activeDrill) {
    const step = activeDrill.steps[stepIdx];
    const pick = picks[stepIdx];
    const progress = ((stepIdx + 1) / activeDrill.steps.length) * 100;

    return (
      <div className="h-full overflow-y-auto p-4 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${SC500_DRILL_PORTAL_COLORS[activeDrill.portal]}`}>
              {activeDrill.portal}
            </span>
            <h3 className="text-sm font-semibold text-slate-100 mt-1.5">{activeDrill.title}</h3>
          </div>
          <button
            onClick={restart}
            className="text-[10px] font-mono text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-500 px-2 py-1 rounded"
          >
            quit
          </button>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 mb-1">
            <span>Step {stepIdx + 1} of {activeDrill.steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Mock portal screen */}
        <div className="border border-slate-700 rounded-lg bg-slate-950/50 mb-4">
          {/* Fake browser bar */}
          <div className="px-3 py-1.5 border-b border-slate-700/50 flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span className="w-2 h-2 rounded-full bg-slate-600" />
            </div>
            <span className="text-[10px] font-mono text-slate-500 truncate flex-1">{step.screen}</span>
          </div>
          {/* Screen body */}
          <div className="p-4 min-h-[60px]">
            {step.prompt && (
              <p className="text-[11px] text-slate-500 italic leading-relaxed mb-3">{step.prompt}</p>
            )}
            <p className="text-sm text-slate-100 font-medium leading-relaxed">{step.question}</p>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2 mb-4">
          {step.options.map((opt, i) => {
            let style = 'border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800/50';
            if (pick !== null) {
              if (i === step.correct)      style = 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
              else if (i === pick)         style = 'border-red-500 bg-red-500/10 text-red-300';
              else                         style = 'border-slate-700/50 text-slate-600 opacity-60';
            }
            return (
              <button
                key={i}
                onClick={() => handlePick(i)}
                disabled={pick !== null}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm ${style}`}
              >
                <span className="font-mono text-[10px] mr-3 opacity-60">{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Reveal */}
        {pick !== null && (
          <div className="border border-slate-700 rounded-lg bg-slate-800/40 p-3 mb-4">
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-1">Why</p>
            <p className="text-xs text-slate-300 leading-relaxed">{step.explanation}</p>
          </div>
        )}

        {/* Next */}
        {pick !== null && (
          <button
            onClick={handleNext}
            className="w-full py-2.5 rounded bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
          >
            {stepIdx + 1 >= activeDrill.steps.length ? 'See results →' : 'Next step →'}
          </button>
        )}
      </div>
    );
  }

  // ── Done view ────────────────────────────────────────────────────────────
  if (mode === 'done' && activeDrill) {
    const correct = picks.filter((p, i) => p === activeDrill.steps[i].correct).length;
    const total   = activeDrill.steps.length;
    const pct     = Math.round((correct / total) * 100);
    const color   = pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400';

    return (
      <div className="h-full overflow-y-auto p-4 max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <div className={`text-5xl font-bold font-mono mb-1 ${color}`}>{pct}%</div>
          <p className="text-slate-400 text-sm">{correct} of {total} steps correct</p>
          <p className={`text-sm font-semibold mt-1 ${color}`}>
            {pct === 100 ? 'Perfect path! You know this portal cold.'
              : pct >= 80 ? 'Strong — re-do once to lock the path in.'
              : pct >= 60 ? 'Solid foundation — review the missed steps below.'
              : 'Run this drill again after re-reading the related Topic.'}
          </p>
        </div>

        {/* Step-by-step recap */}
        <div className="space-y-2 mb-6">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-2">Recap</p>
          {activeDrill.steps.map((s, i) => {
            const ok = picks[i] === s.correct;
            return (
              <div
                key={i}
                className={[
                  'border rounded-lg px-3 py-2 text-xs',
                  ok
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-red-500/30 bg-red-500/5',
                ].join(' ')}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-500">Step {i + 1} · {s.screen}</span>
                  <span className={ok ? 'text-emerald-400' : 'text-red-400'}>{ok ? '✓' : '✗'}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{s.question}</p>
                {!ok && (
                  <p className="text-[11px] text-emerald-300/80 mt-1.5">
                    Correct: <span className="font-mono">{String.fromCharCode(65 + s.correct)}</span> — {s.options[s.correct]}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => activeDrill && startDrill(activeDrill)}
            className="flex-1 py-2.5 rounded bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
          >
            Retry drill
          </button>
          <button
            onClick={restart}
            className="flex-1 py-2.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold transition-colors"
          >
            Back to list
          </button>
        </div>
      </div>
    );
  }

  return null;
}
