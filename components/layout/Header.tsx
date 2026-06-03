import Link from 'next/link';

export function Header() {
  return (
    <header className="h-12 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-4 shrink-0 z-10">
      <Link href="/" className="flex items-center gap-2.5 group" aria-label="LLM DOJO home">
        <div className="flex items-center justify-center w-6 h-6 rounded bg-cyan-500/10 border border-cyan-500/30 group-hover:border-cyan-500/50 transition-colors duration-150 shrink-0">
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
        <span className="font-bold text-sm text-slate-100 tracking-tight">LLM DOJO</span>
      </Link>

      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-0.5 text-sm" aria-label="Main navigation">
          <Link
            href="/dojo"
            className="px-2.5 py-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors duration-150 text-[13px]"
          >
            Dojo
          </Link>
          <Link
            href="/playbook"
            className="px-2.5 py-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors duration-150 text-[13px]"
          >
            Playbook
          </Link>
          <Link
            href="/about"
            className="px-2.5 py-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors duration-150 text-[13px]"
          >
            About
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-1.5 border-l border-slate-800 pl-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          <span className="text-[11px] text-slate-500 font-mono">sandbox</span>
        </div>
      </div>
    </header>
  );
}
