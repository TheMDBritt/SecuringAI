'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/dojo',     label: 'Dojo'     },
  { href: '/playbook', label: 'Playbook' },
  { href: '/about',    label: 'About'    },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/95 backdrop-blur flex items-center justify-between px-4 shrink-0 z-10">
      <Link href="/" className="flex items-center gap-3 group" aria-label="LLM DOJO home">
        <div className="flex items-center justify-center w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 group-hover:border-cyan-500/50 transition-colors duration-150">
          <svg
            className="w-4 h-4 text-cyan-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <span className="font-bold text-slate-100 tracking-tight text-sm">LLM DOJO</span>
      </Link>

      <div className="flex items-center gap-1 sm:gap-3">
        <nav className="flex items-center gap-0.5 text-sm" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'px-2.5 py-1 rounded text-sm transition-colors duration-150',
                  isActive
                    ? 'text-slate-100 bg-slate-800'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/60',
                ].join(' ')}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded border border-emerald-500/20 bg-emerald-500/5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-500 font-mono">sandbox</span>
        </div>
      </div>
    </header>
  );
}
