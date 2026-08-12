'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRIMARY_NAV, SECONDARY_NAV, BrandMark } from './nav';

const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV];

function pageTitle(pathname: string): string {
  if (pathname === '/') return 'Overview';
  const match = ALL_NAV.find((n) => (n.match ? pathname.startsWith(n.match) : pathname === n.href));
  return match?.label ?? 'Securing AI';
}

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const title = pageTitle(pathname);

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-surface-border bg-navy-950/80 px-4 backdrop-blur-md sm:px-6"
      role="banner"
    >
      {/* Mobile: menu + brand */}
      <button
        onClick={onMenu}
        className="ui-btn ui-btn-ghost -ml-1.5 h-9 w-9 !p-0 lg:hidden"
        aria-label="Open navigation menu"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Link href="/" className="flex items-center gap-2 lg:hidden" aria-label="Securing AI, home">
        <BrandMark className="h-6 w-6" />
        <span className="text-[13px] font-bold tracking-tight text-slate-50">Securing AI</span>
      </Link>

      {/* Desktop: breadcrumb / page context */}
      <div className="hidden items-center gap-2 lg:flex">
        <span className="text-[13px] font-medium text-slate-500">Securing AI</span>
        <svg className="h-3.5 w-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
        <span className="text-[13px] font-semibold text-slate-200">{title}</span>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="hidden items-center gap-1.5 rounded-lg border border-surface-border bg-surface-raised/40 px-2.5 py-1 sm:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
        <span className="text-[11px] font-medium text-slate-400">Free &middot; Open access</span>
      </div>

      <a
        href="https://github.com/themdbritt/securingai"
        target="_blank"
        rel="noopener noreferrer"
        className="ui-btn ui-btn-ghost h-9 w-9 !p-0"
        aria-label="GitHub repository"
      >
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.480-.01 2.81 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
        </svg>
      </a>

      <Link href="/dojo" className="ui-btn ui-btn-primary hidden px-3.5 py-1.5 text-[13px] sm:inline-flex">
        Enter Labs
      </Link>
    </header>
  );
}
