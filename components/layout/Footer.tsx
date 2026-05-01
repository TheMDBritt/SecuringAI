import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/40">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-sm">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-200 tracking-tight">LLM DOJO</span>
          <span className="text-xs text-slate-500">
            Free · No tracking
          </span>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-slate-400">
          <Link href="/dojo"     className="hover:text-slate-100 transition-colors">Dojo</Link>
          <Link href="/playbook" className="hover:text-slate-100 transition-colors">Playbook</Link>
          <Link href="/about"    className="hover:text-slate-100 transition-colors">About</Link>
        </nav>
      </div>
    </footer>
  );
}
