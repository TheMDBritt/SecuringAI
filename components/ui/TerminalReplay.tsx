'use client';

import { useEffect, useRef, useState } from 'react';

export interface TerminalLine {
  kind: 'cmd' | 'ok' | 'warn' | 'fail' | 'note';
  text: string;
  /** Trailing dimmed detail, rendered after the coloured token. */
  detail?: string;
}

const TOKEN: Record<TerminalLine['kind'], string> = {
  cmd: 'text-brand-300',
  ok: 'text-emerald-400',
  warn: 'text-amber-400',
  fail: 'text-red-400',
  note: 'text-slate-400',
};

/**
 * Replays a recorded session, one line at a time, when it scrolls into view.
 *
 * The hero panel was a static screenshot of a terminal. Replaying it shows the
 * one thing the product is actually about: the same payload against different
 * guardrail settings produces a different, deterministic outcome. It runs once,
 * and it renders complete and instantly under reduced motion.
 */
export function TerminalReplay({
  lines,
  title = 'dojo-1 · session',
}: {
  lines: TerminalLine[];
  title?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = ref.current;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (!el || reduced || typeof IntersectionObserver === 'undefined') {
      setShown(lines.length);
      return;
    }

    let timer: ReturnType<typeof setInterval>;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        timer = setInterval(() => {
          setShown((n) => {
            if (n >= lines.length) {
              clearInterval(timer);
              return n;
            }
            return n + 1;
          });
        }, 190);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timer);
    };
  }, [lines.length]);

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-xl border border-slate-800 bg-navy-950/80 shadow-elevated"
    >
      <div className="flex items-center gap-2 border-b border-slate-800/80 px-3.5 py-2.5">
        <span className="h-2 w-2 rounded-full bg-slate-700" />
        <span className="h-2 w-2 rounded-full bg-slate-700" />
        <span className="h-2 w-2 rounded-full bg-slate-700" />
        <span className="ml-1.5 font-mono text-micro text-slate-400">{title}</span>
      </div>

      {/* Fixed height so the panel does not resize as lines land, which would
          push the whole hero around while someone is reading it. */}
      <div className="min-h-[13.5rem] space-y-1 px-3.5 py-3 font-mono text-2xs leading-relaxed">
        {lines.slice(0, shown).map((l, i) => (
          <div key={i} className="animate-rise-in whitespace-nowrap">
            {l.kind === 'cmd' ? (
              <>
                <span className="text-slate-500">$ </span>
                <span className="text-slate-200">{l.text}</span>
              </>
            ) : (
              <>
                <span className="text-slate-500">→ </span>
                <span className={`font-semibold ${TOKEN[l.kind]}`}>{l.text}</span>
                {l.detail && <span className="text-slate-400"> {l.detail}</span>}
              </>
            )}
          </div>
        ))}
        {shown < lines.length && (
          <span className="cursor-blink inline-block h-3 w-1.5 translate-y-0.5 bg-brand-400" />
        )}
      </div>
    </div>
  );
}
