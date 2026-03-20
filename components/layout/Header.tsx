export function Header() {
  return (
    <header className="h-14 border-b border-slate-700 bg-slate-900/95 backdrop-blur flex items-center justify-between px-4 shrink-0 z-10">
      <div className="flex items-center gap-3">
        {/* Logo mark */}
        <div className="flex items-center justify-center w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30">
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
          <span className="font-bold text-slate-100 tracking-tight">LLM Dojo</span>
          <span className="ml-2 text-xs text-slate-500">AI Security Training</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Sandbox model badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded border border-emerald-500/30 bg-emerald-500/5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-mono">BlackBeltAI sandbox</span>
        </div>
      </div>
    </header>
  );
}
