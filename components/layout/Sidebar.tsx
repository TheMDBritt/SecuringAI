'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRIMARY_NAV, SECONDARY_NAV, BrandMark, type NavItem } from './nav';

function isActive(pathname: string, item: NavItem): boolean {
  if (item.match) return pathname === item.match || pathname.startsWith(item.match + '/');
  return pathname === item.href;
}

// Label reveal: on the desktop rail labels are hidden until hover; in the mobile
// drawer they are always visible.
const LABEL_RAIL = 'opacity-0 transition-opacity duration-200 group-hover:opacity-100';
const LABEL_DRAWER = 'opacity-100';

function NavLink({
  item,
  active,
  labelClass,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  labelClass: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      // The rail is on every page, so viewport-triggered prefetch pulls every
      // route's chunk on every visit, including the Dojo's 209kB, for someone
      // who may never open it. Navigation from here is a deliberate click, and
      // Next still prefetches on hover, which is the moment intent appears.
      prefetch={false}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={[
        'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
        active
          ? 'bg-brand-500/12 text-brand-200'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-100',
      ].join(' ')}
    >
      {/* Always rendered, so the indicator grows into place when a route
          becomes active instead of appearing fully formed. Mounting it only
          when active gave the browser nothing to transition from.
          scale-y and the centring translate compose through Tailwind's
          transform variables, so both apply. */}
      <span
        aria-hidden="true"
        className={[
          'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-400',
          'origin-center transition-[transform,opacity] duration-300 ease-out',
          active ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0',
        ].join(' ')}
      />

      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">{item.icon}</span>
      <span className={['whitespace-nowrap', labelClass].join(' ')}>{item.label}</span>
    </Link>
  );
}

function SidebarInner({
  pathname,
  variant,
  onNavigate,
}: {
  pathname: string;
  variant: 'rail' | 'drawer';
  onNavigate?: () => void;
}) {
  const labelClass = variant === 'rail' ? LABEL_RAIL : LABEL_DRAWER;
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <Link href="/" onClick={onNavigate} className="flex h-14 items-center gap-2.5 px-3.5" aria-label="Securing AI, home">
        <BrandMark className="h-7 w-7 shrink-0" />
        <span className={['flex min-w-0 flex-col whitespace-nowrap', labelClass].join(' ')}>
          <span className="text-sm font-bold leading-tight tracking-tight text-slate-50">Securing AI</span>
          <span className="text-micro font-medium leading-tight text-slate-500">Training Platform</span>
        </span>
      </Link>

      <div className="mx-3 h-px bg-surface-border/70" />

      <nav className="flex flex-col gap-1 px-2.5 py-3" aria-label="Primary">
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item)} labelClass={labelClass} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="flex-1" />

      <nav className="flex flex-col gap-1 px-2.5 pb-3" aria-label="Secondary">
        <div className="mx-1 mb-1 h-px bg-surface-border/60" />
        {SECONDARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item)} labelClass={labelClass} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="px-3.5 pb-4">
        <div className="flex items-center gap-2 overflow-hidden rounded-lg border border-surface-border bg-surface-raised/50 px-2.5 py-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
          <span className={['whitespace-nowrap text-2xs font-medium text-slate-400', labelClass].join(' ')}>
            Free · No account
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Desktop: slim 64px icon rail that expands to 240px on hover as a floating
 * overlay, it never steals horizontal space from the workspace.
 * Mobile: slide-over drawer controlled by `mobileOpen`.
 */
export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const drawerRef = useRef<HTMLElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  // The drawer is a modal surface: while it is open, Escape closes it, focus
  // moves inside, Tab is trapped, and focus returns to the trigger on close.
  // Without this a keyboard user could tab straight through the overlay into
  // the page behind it.
  useEffect(() => {
    if (!mobileOpen) return;

    restoreFocusTo.current = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);

    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      restoreFocusTo.current?.focus?.();
    };
  }, [mobileOpen, onClose]);

  const pathname = usePathname();

  return (
    <>
      {/* Desktop rail */}
      <aside
        className="group fixed inset-y-0 left-0 z-40 hidden w-16 overflow-hidden border-r border-surface-border bg-navy-950/95 backdrop-blur transition-[width] duration-200 ease-out hover:w-60 hover:shadow-elevated lg:block"
        aria-label="Sidebar navigation"
      >
        <SidebarInner pathname={pathname} variant="rail" />
      </aside>

      {/* Mobile drawer */}
      {/* Closed state is `visibility: hidden`, not `aria-hidden`.
          aria-hidden on a container that still holds focusable links is a
          WCAG 4.1.2 failure — a keyboard user could tab into a drawer that is
          announced as not there. visibility removes it from both the
          accessibility tree and the tab order, and it transitions discretely:
          it flips to visible immediately on open and only at the end of the
          duration on close, so the slide-out still plays. */}
      <div
        className={[
          'fixed inset-0 z-50 transition-[visibility] duration-200 lg:hidden',
          mobileOpen ? 'visible' : 'invisible pointer-events-none',
        ].join(' ')}
      >
        <div
          className={[
            'absolute inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity duration-200',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          onClick={onClose}
        />
        <aside
          ref={drawerRef}
          role="dialog"
          aria-modal={mobileOpen}
          aria-label="Main navigation"
          className={[
            'absolute inset-y-0 left-0 w-64 border-r border-surface-border bg-navy-950 shadow-elevated transition-transform duration-200 ease-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          <SidebarInner pathname={pathname} variant="drawer" onNavigate={onClose} />
        </aside>
      </div>
    </>
  );
}
