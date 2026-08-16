'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Reveals content as it scrolls into view.
 *
 * Deliberately restrained: a short rise and fade, once, never repeated on
 * scroll-back. Movement is a cue that new material has arrived, and a page
 * where everything is always moving stops communicating anything.
 *
 * Honours prefers-reduced-motion by rendering the final state immediately,
 * and renders visible with no observer at all when IntersectionObserver is
 * unavailable, so content can never be trapped invisible.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
}: {
  children: ReactNode;
  /** Stagger in ms, for sibling items in a row. */
  delay?: number;
  as?: 'div' | 'section' | 'li';
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (!el || reduced || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      // Fire slightly before the element is fully on screen, so the motion
      // finishes about when the reader's eye arrives.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
      className={[
        'transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  );
}
