'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/dojo',     label: 'Dojo'     },
  { href: '/playbook', label: 'Playbook' },
  { href: '/about',    label: 'About'    },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="h-12 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-5 shrink-0 z-10 sticky top-0">
      <Link href="/" className="flex items-center gap-2 group" aria-label="LLM DOJO home">
        <div className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-cyan-500"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <rect x="2" y="8" width="12" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 8V5.5a3 3 0 0 1 6 0V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r="1" fill="currentColor" />
          </svg>
          <span className="font-bold text-[13px] text-slate-100 tracking-tight group-hover:text-white transition-colors">LLM DOJO</span>
        </div>
        <span className="hidden sm:block h-4 w-px bg-slate-700" />
        <span className="hidden sm:block text-[10px] font-mono text-slate-600 tracking-wide">AI Security Training</span>
      </Link>

      <div className="flex items-center gap-4">
        <nav className="flex items-center" aria-label="Main navigation">
          {NAV.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'px-3 py-1 rounded text-[12px] font-medium transition-colors duration-150',
                  active
                    ? 'text-slate-100 bg-slate-800'
                    : 'text-slate-500 hover:text-slate-200',
                ].join(' ')}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 px-2 py-1 rounded border border-slate-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-mono text-slate-600">free · no login</span>
        </div>
      </div>
    </header>
  );
}
