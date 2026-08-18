'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import { useCountUp } from '@/lib/use-count-up';

/**
 * True once the element has been mounted for a frame.
 *
 * Every entrance animation here has the same shape: render the empty state,
 * then flip to the real value on the next frame so the browser has two states
 * to interpolate between. Setting the final value on the first render gives it
 * nothing to transition from, which is why these bars and rings used to move
 * only on a later change and never on the paint that matters.
 *
 * Under reduced motion it returns true immediately, so the final state is what
 * renders rather than what is arrived at.
 *
 * Note this starts empty on the server, where useCountUp deliberately starts at
 * its true value. The difference is what the two render into markup. A count-up
 * prints a figure, and a zero in server HTML is a false statement anything that
 * does not run JS will read. A bar prints no text, its aria-valuenow already
 * carries the number, and every call site draws from localStorage — so without
 * JS there is no progress to show and an empty bar is the honest state.
 */
export function useGrown(): boolean {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setGrown(true);
      return;
    }
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return grown;
}

function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

type Tone = 'brand' | 'emerald' | 'amber' | 'red' | 'slate';

const PROGRESS_TONE: Record<Tone, string> = {
  brand: 'from-brand-500 to-brand-400',
  emerald: 'from-emerald-500 to-emerald-400',
  amber: 'from-amber-500 to-amber-400',
  red: 'from-red-500 to-red-400',
  slate: 'from-slate-500 to-slate-400',
};

export function ProgressBar({
  value,
  label,
  tone = 'brand',
  className,
  height = 'h-2',
}: {
  value: number;
  /**
   * What this bar measures, e.g. "Dojo 1 completion". A progressbar with no
   * accessible name is announced as a bare percentage, which gives a screen
   * reader user a number but not what it counts. Required rather than optional
   * so a new call site cannot silently reintroduce an unnamed bar.
   */
  label: string;
  tone?: Tone;
  className?: string;
  height?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  // Starts at zero and animates to the value on mount, so the bar is seen to
  // fill. Without this the transition only ever runs on a later change, and the
  // first paint, which is the one that matters, was static.
  const grown = useGrown();

  return (
    <div className={cx('w-full overflow-hidden rounded-full bg-white/[0.06]', height, className)}>
      <div
        className={cx(
          'h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out',
          PROGRESS_TONE[tone],
        )}
        style={{ width: `${grown ? pct : 0}%` }}
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

/**
 * A number that counts up when it appears.
 *
 * Composable rather than a StatCard prop, because `value` accepts a ReactNode
 * and callers mix figures with units, slashes and placeholders.
 */
export function CountUp({
  value,
  suffix = '',
  prefix = '',
}: {
  value: number;
  suffix?: string;
  prefix?: string;
}) {
  const shown = useCountUp(value);
  // tabular-nums stops the width jittering as digits change during the count.
  return (
    <span className="tabular-nums">
      {prefix}
      {shown.toLocaleString()}
      {suffix}
    </span>
  );
}

/**
 * Ring gauge that sweeps from empty to its value on mount.
 *
 * The single figure a page is built around — overall completion — reads better
 * as a ring than as another number in a row of cards, and the sweep is the
 * clearest way to show a proportion arriving.
 */
export function Donut({
  value,
  size = 132,
  stroke = 12,
  label,
  sublabel,
  tone = 'var(--accent)',
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: ReactNode;
  sublabel?: ReactNode;
  tone?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const grown = useGrown();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  // Full offset is an empty ring; the sweep is the offset closing.
  const offset = grown ? c - (pct / 100) * c : c;

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(148,163,184,0.12)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label != null && (
          <span className="text-2xl font-bold tracking-tight text-slate-50">{label}</span>
        )}
        {sublabel != null && (
          <span className="mt-0.5 text-2xs font-medium text-slate-400">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
