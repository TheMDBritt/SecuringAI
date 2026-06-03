'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dojo',     label: 'Dojo' },
  { href: '/playbook', label: 'Playbook' },
  { href: '/about',    label: 'About' },
];

export function Header() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <header className="h-12 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 z-10 sticky top-0">
      <Link href="/" className="flex items-center gap-2.5 group" aria-label="LLM DOJO home">
        <div className="flex items-center justify-center w-6 h-6 rounded bg-cyan-500/10 border border-cyan-500/30 group-hover:border-cyan-500/60 transition-colors duration-150 shrink-0">
          <svg
            className="w-3.5 h-3.5 text-cyan-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <span className="font-bold text-sm text-slate-100 tracking-tight group-hover:text-white transition-colors duration-150">
          LLM DOJO
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-0.5 text-sm" aria-label="Main navigation">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'px-2.5 py-1 rounded text-[13px] transition-colors duration-150',
                  active
                    ? 'text-slate-100 bg-slate-800 font-medium'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60',
                ].join(' ')}
                aria-current={active ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-1.5 border-l border-slate-800 pl-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          <span className="text-[11px] text-slate-500 font-mono">sandbox</span>
        </div>
      </div>
    </header>
  );
}
