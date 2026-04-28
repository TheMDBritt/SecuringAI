'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'securingai-onboarding-v1';

const STEPS: { title: string; body: string; accent: string }[] = [
  {
    title: '1 · Pick a scenario',
    accent: 'red',
    body:
      'The left column lists scenarios for the active dojo. Click one to load it — Dojo 1 starts the attack/defence loop, Dojo 2 starts a SOC analyst workflow, Dojo 3 starts a defender workflow.',
  },
  {
    title: '2 · Toggle controls',
    accent: 'cyan',
    body:
      'The right column has live guardrails (Injection Shield, Strict Policy, Tools, RAG) and analyst configuration. Flip them mid-session to see exactly which control stops which attack.',
  },
  {
    title: '3 · Read the score',
    accent: 'emerald',
    body:
      'After every turn the bottom-right pane scores the response, classifies the attack or analyst quality, and maps the scenario to OWASP LLM Top 10, MITRE ATT&CK, NIST AI RMF, and the top 2026 AI security certifications.',
  },
];

const ACCENT_BORDER: Record<string, string> = {
  red: 'border-red-500/40',
  cyan: 'border-cyan-500/40',
  emerald: 'border-emerald-500/40',
};
const ACCENT_TEXT: Record<string, string> = {
  red: 'text-red-400',
  cyan: 'text-cyan-400',
  emerald: 'text-emerald-400',
};

export function OnboardingTour() {
  // Start hidden so SSR + first paint match. Decide visibility post-mount.
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== 'done') setVisible(true);
    } catch {
      // Private mode / storage disabled — show the tour anyway.
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'done');
    } catch {
      // Ignore — same-session dismissal still works.
    }
  }

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else dismiss();
  }

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Onboarding tour"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/70 backdrop-blur-sm"
    >
      <div
        className={[
          'w-full max-w-md rounded-lg border bg-slate-900 shadow-2xl shadow-black/60',
          ACCENT_BORDER[current.accent],
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
            Quick tour · {step + 1} / {STEPS.length}
          </span>
          <button
            onClick={dismiss}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Skip onboarding"
          >
            Skip
          </button>
        </div>

        <div className="px-5 py-5">
          <h2 className={['text-lg font-semibold mb-2', ACCENT_TEXT[current.accent]].join(' ')}>
            {current.title}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">{current.body}</p>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-800">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={[
                  'h-1.5 w-6 rounded-full transition-colors',
                  i === step ? 'bg-cyan-400' : 'bg-slate-700',
                ].join(' ')}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-3 py-1.5 text-xs rounded border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={next}
              className="px-4 py-1.5 text-xs rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
            >
              {isLast ? 'Start training →' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
