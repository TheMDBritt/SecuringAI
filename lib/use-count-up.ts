'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * useLayoutEffect has no meaning on the server and React warns when it runs
 * there. The reset below only exists to beat a browser paint, so where there is
 * no DOM the plain effect is the right no-op.
 */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Counts a number up to its value when it first appears.
 *
 * Used for the figures that report progress and for the content inventory on
 * the landing page. The movement is doing a job: a number that animates draws
 * the eye to the thing that changed, and the ease-out makes the final value
 * feel settled rather than merely displayed.
 *
 * Three rules keep it from becoming decoration:
 *   - It runs once per value. Re-rendering does not restart it.
 *   - A value that has not changed does not animate again.
 *   - Reduced motion, no JS, or a bundle that never loads all give the final
 *     number outright. The count is an embellishment on a value that is always
 *     correct, never the way that value is revealed.
 */
export function useCountUp(value: number, durationMs = 650): number {
  // Seeded with the real value, which is what server-rendered markup carries.
  // Seeding it with zero instead published "0 quiz questions" to anything that
  // reads the HTML without running scripts — crawlers, previews, a failed
  // bundle — and made the app's own headline claim read as empty.
  const [display, setDisplay] = useState(value);
  // Whether a client pass has run yet. The opening count is a full sweep from
  // zero; every later change starts from whatever is currently on screen, so
  // interrupting a count mid-flight does not snap back to zero first.
  const started = useRef(false);
  const shown = useRef(value);
  const frame = useRef<number>();

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion()) {
      started.current = true;
      shown.current = value;
      setDisplay(value);
      return;
    }

    const start = started.current ? shown.current : 0;
    started.current = true;

    const delta = value - start;
    if (delta === 0) {
      shown.current = value;
      setDisplay(value);
      return;
    }

    // A layout effect, so this reset lands before the browser paints: the true
    // value is never briefly shown and then taken away to be counted back up.
    shown.current = start;
    setDisplay(start);

    const t0 = performance.now();
    // Ease-out cubic: fast to begin, settling at the end, which reads as the
    // number arriving rather than sliding.
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / durationMs);
      const next = Math.round(start + delta * ease(t));
      shown.current = next;
      setDisplay(next);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value, durationMs]);

  return display;
}
