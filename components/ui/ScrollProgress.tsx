'use client';

import { useEffect, useState } from 'react';

/**
 * Reading progress for long pages.
 *
 * A hairline, pinned under the top bar. The overview page runs several screens
 * and gave no sense of position or length; this is the cheapest honest signal
 * of both. Hidden from assistive tech, since it duplicates what the scrollbar
 * already conveys.
 */
export function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setPct(max <= 0 ? 0 : Math.min(1, window.scrollY / max));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    // Sits above the top bar but below the sidebar rail, and starts where the
    // content column starts on lg, so the fill measures the column it tracks.
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-14 z-20 h-px lg:left-16">
      <div
        className="h-full origin-left bg-brand-400/70 transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${pct})` }}
      />
    </div>
  );
}
