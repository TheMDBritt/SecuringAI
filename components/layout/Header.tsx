import Link from 'next/link';

export function Header() {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/95 backdrop-blur flex items-center justify-between px-4 shrink-0 z-10 sticky top-0">
      <Link href="/" className="flex items-center gap-2.5 group" aria-label="LLM DOJO home">
        {/* Logo mark */}
        <div className="flex items-center justify-center w-7 h-7 rounded border border-cyan-500/25 bg-cyan-500/8 group-hover:border-cyan-500/50 transition-colors duration-150">
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
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-100 tracking-tight">LLM DOJO</span>
          <span className="hidden sm:block text-[10px] font-mono text-slate-600 border border-slate-700 px-1.5 py-0.5 rounded">
            AI Security Training
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-1 sm:gap-2">
        <nav className="flex items-center gap-0.5 text-sm" aria-label="Main navigation">
          <Link
            href="/dojo"
            className="px-3 py-1.5 rounded text-[13px] text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition-colors duration-150"
          >
            Dojo
          </Link>
          <Link
            href="/playbook"
            className="px-3 py-1.5 rounded text-[13px] text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition-colors duration-150"
          >
            Playbook
          </Link>
          <Link
            href="/about"
            className="px-3 py-1.5 rounded text-[13px] text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition-colors duration-150"
          >
            About
          </Link>
        </nav>

        {/* Status pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-800 bg-slate-900">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
          <span className="text-[10px] text-slate-600 font-mono">stub</span>
        </div>
      </div>
    </header>
  );
}
