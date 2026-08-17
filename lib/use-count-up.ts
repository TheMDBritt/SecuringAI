'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Counts a number up to its value when it first appears.
 *
 * Used for the figures that report progress. The movement is doing a job: a
 * number that animates draws the eye to the thing that changed, and the ease-out
 * makes the final value feel settled rather than merely displayed.
 *
 * Three rules keep it from becoming decoration:
 *   - It runs once per value. Re-rendering does not restart it.
 *   - A value that has not changed does not animate again.
 *   - Reduced motion, or no JS, gives the final number immediately. The count is
 *     an embellishment on a value that is always correct, never a way of
 *     revealing one.
 */
export function useCountUp(value: number, durationMs = 650): number {
  // Starts at zero so the first appearance counts up. Seeding it with `value`
  // made the initial delta zero, so the animation only ever ran on a later
  // change — and the first paint is the one worth animating.
  const [display, setDisplay] = useState(0);
  const from = useRef(0);
  const frame = useRef<number>();

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(value);
      from.current = value;
      return;
    }

    const start = from.current;
    const delta = value - start;
    if (delta === 0) {
      setDisplay(value);
      return;
    }

    const t0 = performance.now();
    // Ease-out cubic: fast to begin, settling at the end, which reads as the
    // number arriving rather than sliding.
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / durationMs);
      setDisplay(Math.round(start + delta * ease(t)));
      if (t < 1) frame.current = requestAnimationFrame(tick);
      else from.current = value;
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value, durationMs]);

  return display;
}
