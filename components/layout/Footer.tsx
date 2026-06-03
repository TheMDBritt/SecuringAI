import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-slate-300 tracking-tight">LLM DOJO</span>
          <span className="text-slate-700 text-xs hidden md:block">·</span>
          <span className="text-xs text-slate-600 hidden md:block">Free AI security training. No account required.</span>
        </div>

        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-4 text-xs text-slate-500" aria-label="Footer navigation">
            <Link href="/dojo"     className="hover:text-slate-300 transition-colors duration-150">Dojo</Link>
            <Link href="/playbook" className="hover:text-slate-300 transition-colors duration-150">Playbook</Link>
            <Link href="/about"    className="hover:text-slate-300 transition-colors duration-150">About</Link>
          </nav>
          <div className="text-[10px] font-mono text-slate-700 hidden md:block">
            OWASP · MITRE · NIST · ISO 42001 · EU AI Act
          </div>
        </div>
      </div>
    </footer>
  );
}
