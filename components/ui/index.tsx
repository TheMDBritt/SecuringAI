import Link from 'next/link';
import type { ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Enterprise UI primitives, a small, consistent design-system layer shared by
// the dashboard, progress, settings, help, and landing surfaces.
// ─────────────────────────────────────────────────────────────────────────────

function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({
  children,
  className,
  hover = false,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  as?: 'div' | 'section' | 'article';
}) {
  const Tag = as;
  return (
    <Tag className={cx('ui-card', hover && 'ui-card-hover', className)}>{children}</Tag>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────
type Tone = 'brand' | 'emerald' | 'amber' | 'red' | 'slate';

const BADGE_TONE: Record<Tone, string> = {
  brand: 'bg-brand-500/12 text-brand-300 border-brand-500/30',
  emerald: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/30',
  amber: 'bg-amber-500/12 text-amber-300 border-amber-500/30',
  red: 'bg-red-500/12 text-red-300 border-red-500/30',
  slate: 'bg-slate-500/10 text-slate-300 border-slate-500/25',
};

export function Badge({
  children,
  tone = 'slate',
  className,
  mono = false,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  mono?: boolean;
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-2xs font-medium',
        mono && 'font-mono',
        BADGE_TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ── Button ───────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost';
const BTN_VARIANT: Record<BtnVariant, string> = {
  primary: 'ui-btn-primary',
  secondary: 'ui-btn-secondary',
  ghost: 'ui-btn-ghost',
};

const BTN_SIZE = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
} as const;

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: BtnVariant;
  size?: keyof typeof BTN_SIZE;
  className?: string;
}) {
  return (
    <Link href={href} className={cx('ui-btn', BTN_VARIANT[variant], BTN_SIZE[size], className)}>
      {children}
    </Link>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: {
  children: ReactNode;
  variant?: BtnVariant;
  size?: keyof typeof BTN_SIZE;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cx('ui-btn', BTN_VARIANT[variant], BTN_SIZE[size], className)} {...rest}>
      {children}
    </button>
  );
}

// ── ProgressBar / CountUp ────────────────────────────────────────────────────
// Both animate, so they live in a client module. Re-exported here so the design
// system stays one import for callers and the rest of it stays server-rendered.
export { ProgressBar, CountUp } from './motion-primitives';

const PROGRESS_TONE: Record<Tone, string> = {
  brand: 'from-brand-500 to-brand-400',
  emerald: 'from-emerald-500 to-emerald-400',
  amber: 'from-amber-500 to-amber-400',
  red: 'from-red-500 to-red-400',
  slate: 'from-slate-500 to-slate-400',
};


/**
 * The mastery colour scale, as a tone rather than a class string.
 *
 * Two copies of these thresholds existed, one per surface, differing only in
 * whether the input was 0-1 or 0-100. Colour here is state, so it belongs with
 * the other state tones.
 */
export function masteryTone(pct: number | null): Tone {
  if (pct === null) return 'slate';
  if (pct >= 80) return 'emerald';
  if (pct >= 60) return 'amber';
  return 'red';
}

// ── StatCard ─────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = 'brand',
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <Card hover className={cx('p-4 sm:p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-50 sm:text-display-sm">
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
        {icon && (
          <span
            className={cx(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
              BADGE_TONE[tone],
            )}
          >
            {icon}
          </span>
        )}
      </div>
    </Card>
  );
}

// ── SectionHeading ───────────────────────────────────────────────────────────
/**
 * Section heading, in the field-manual form used across the product.
 *
 * The eyebrow sits on a rule that runs out to the margin, so a section is
 * marked before it is titled. Pass `index` where sections form a numbered
 * sequence; omit it where they do not. Keeping this in the shared component
 * rather than restyling each page is what makes it a system instead of a
 * treatment applied to whichever surface someone touched last.
 */
export function SectionHeading({
  eyebrow,
  index,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  /** 1-based; rendered zero-padded where the section is part of a sequence. */
  index?: number;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('min-w-0', className)}>
      {eyebrow && (
        <div className="mb-3 flex items-center gap-3">
          {index !== undefined && (
            <span className="font-mono text-2xs tabular-nums text-brand-400/80">
              {String(index).padStart(2, '0')}
            </span>
          )}
          <span className="font-mono text-2xs uppercase tracking-[0.18em] text-slate-400">
            {eyebrow}
          </span>
          <span aria-hidden className="h-px flex-1 bg-slate-800" />
          {action}
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-lg font-bold tracking-tight text-slate-100 sm:text-xl">{title}</h2>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-400">{description}</p>
        )}
      </div>
      {!eyebrow && action}
      </div>
    </div>
  );
}

// ── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-surface-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="ui-eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-display-sm">
          {title}
        </h1>
        {description && (
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-400">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  );
}

// ── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border bg-surface-card/40 px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-surface-border bg-surface-raised text-brand-300">
          {icon}
        </span>
      )}
      <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      {description && <p className="mt-1.5 max-w-sm text-xs text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('ui-skeleton', className)} aria-hidden="true" />;
}

// ── Donut (SVG ring gauge) ───────────────────────────────────────────────────
export function Donut({
  value,
  size = 132,
  stroke = 12,
  label,
  sublabel,
  tone = '#3b82f6',
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: ReactNode;
  sublabel?: ReactNode;
  tone?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth={stroke} />
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
        {label != null && <span className="text-2xl font-bold tracking-tight text-slate-50">{label}</span>}
        {sublabel != null && <span className="mt-0.5 text-2xs font-medium text-slate-500">{sublabel}</span>}
      </div>
    </div>
  );
}
