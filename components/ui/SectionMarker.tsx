import type { ReactNode } from 'react';

/**
 * Section header, in the field-manual form the Dojo already uses.
 *
 * The Dojo numbers its right-hand panel 01 OBJECTIVE / 02 CONTROLS /
 * 03 LIBRARY. That numbering is the most distinctive thing in the interface and
 * it was confined to one panel, so everywhere else fell back to the same
 * eyebrow-over-heading that every product page uses.
 *
 * This makes it the system: every top-level section is a numbered entry with a
 * rule running out to the margin, and an optional annotation set in the gutter
 * the way a note sits beside a spec. Sections become entries in a document
 * rather than cards on a page.
 */
export function SectionMarker({
  index,
  eyebrow,
  title,
  annotation,
  action,
}: {
  /** 1-based; rendered zero-padded. */
  index: number;
  eyebrow: string;
  title: ReactNode;
  /** Short mono note set in the left gutter on wide screens. */
  annotation?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8">
      {/* The rule carries the number, so the section is marked before it is
          titled, the way a numbered clause reads. */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-2xs tabular-nums text-brand-400/80">
          {String(index).padStart(2, '0')}
        </span>
        <span className="font-mono text-2xs uppercase tracking-[0.18em] text-slate-400">
          {eyebrow}
        </span>
        <span aria-hidden className="h-px flex-1 bg-slate-800" />
        {action}
      </div>

      <div className="mt-4 lg:grid lg:grid-cols-[10rem_1fr] lg:gap-8">
        {annotation ? (
          <p className="mb-2 border-l border-slate-800 pl-3 font-mono text-micro leading-relaxed text-slate-400 lg:mb-0 lg:border-l-0 lg:border-r lg:pl-0 lg:pr-3 lg:text-right">
            {annotation}
          </p>
        ) : (
          <span aria-hidden className="hidden lg:block" />
        )}
        <h2 className="text-display-sm font-bold tracking-tight text-slate-100">{title}</h2>
      </div>
    </header>
  );
}
