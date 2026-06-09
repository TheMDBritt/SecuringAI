'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ACCENT, type AccentName } from '@/lib/dojo-theme';

const STORAGE_KEY = 'securingai-onboarding-v1';

const STEPS: { title: string; body: string; accent: AccentName }[] = [
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
      'After every turn the bottom-right pane scores the response, classifies the attack or analyst quality, and maps the scenario to OWASP LLM Top 10, MITRE ATT&CK, NIST AI RMF, and 10 AI security certification exam domains.',
  },
];

export function OnboardingTour() {
  // Start hidden so SSR + first paint match. Visibility decided post-mount.
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== 'done') setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'done');
    } catch {
      // Ignore — same-session dismissal still works.
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    primaryRef.current?.focus();
    return () => {
      previouslyFocusedRef.current?.focus?.();
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismiss();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, dismiss]);

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
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-body"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/70 backdrop-blur-sm"
      onClick={(e) => {
        // Click on the backdrop (not the inner card) dismisses the tour.
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        ref={dialogRef}
        className={[
          'w-full max-w-md rounded-lg border bg-slate-900 shadow-2xl shadow-black/60',
          ACCENT[current.accent].border,
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
          <h2
            id="onboarding-title"
            className={['text-lg font-semibold mb-2', ACCENT[current.accent].text].join(' ')}
          >
            {current.title}
          </h2>
          <p id="onboarding-body" className="text-sm text-slate-300 leading-relaxed">
            {current.body}
          </p>
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
              ref={primaryRef}
              onClick={next}
              className="px-4 py-1.5 text-xs rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              {isLast ? 'Start training →' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
