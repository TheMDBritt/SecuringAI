import Link from 'next/link';

export function Header() {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-4 shrink-0 z-10">
      <Link href="/" className="flex items-center gap-3 group" aria-label="LLM DOJO home">
        <div className="flex items-center justify-center w-7 h-7 rounded bg-cyan-500/10 border border-cyan-500/20 group-hover:border-cyan-500/40 transition-colors duration-150">
          <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="7" width="12" height="7" rx="1.5" />
            <path d="M5 7V4.5a3 3 0 0 1 6 0V7" />
          </svg>
        </div>
        <div className="leading-none">
          <span className="text-sm font-bold text-slate-100 tracking-tight">LLM DOJO</span>
          <span className="hidden sm:inline text-[10px] font-mono text-slate-600 ml-2">AI Security Training</span>
        </div>
      </Link>

      <div className="flex items-center gap-1 sm:gap-2">
        <nav className="flex items-center gap-0.5 text-sm" aria-label="Primary navigation">
          <Link
            href="/dojo"
            className="px-2.5 py-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors duration-150 text-sm"
          >
            Dojo
          </Link>
          <Link
            href="/playbook"
            className="px-2.5 py-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors duration-150 text-sm"
          >
            Playbook
          </Link>
          <Link
            href="/about"
            className="px-2.5 py-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors duration-150 text-sm"
          >
            About
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded border border-emerald-500/20 bg-emerald-500/5 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-mono">sandbox</span>
        </div>
      </div>
    </header>
  );
}
