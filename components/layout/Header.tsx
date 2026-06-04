import Link from 'next/link';

export function Header() {
  return (
    <header className="h-14 border-b border-slate-700 bg-slate-900/95 backdrop-blur flex items-center justify-between px-4 shrink-0 z-10">
      <Link href="/" className="flex items-center gap-3 group" aria-label="LLM DOJO home">
        {/* Logo mark */}
        <div className="flex items-center justify-center w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 group-hover:border-cyan-500/60 transition-colors">
          <svg
            className="w-4 h-4 text-cyan-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div>
          <span className="font-bold text-slate-100 tracking-tight">LLM DOJO</span>
        </div>
      </Link>

      <div className="flex items-center gap-1 sm:gap-3">
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/dojo"
            className="px-2.5 py-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            Dojo
          </Link>
          <Link
            href="/playbook"
            className="px-2.5 py-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            Playbook
          </Link>
          <Link
            href="/about"
            className="px-2.5 py-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            About
          </Link>
        </nav>

        {/* Sandbox mode badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-700 bg-slate-800/50">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          <span className="text-xs text-slate-500 font-mono">sandbox mode</span>
        </div>
      </div>
    </header>
  );
}
