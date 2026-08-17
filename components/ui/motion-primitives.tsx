'use client';

import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import { useCountUp } from '@/lib/use-count-up';

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
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setGrown(true);
      return;
    }
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);

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
