import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-3">Train</p>
            <div className="flex flex-col gap-2">
              <Link href="/dojo" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">Dojo 1 — LLM Attack &amp; Defense</Link>
              <Link href="/dojo" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">Dojo 2 — AI-Assisted SOC</Link>
              <Link href="/dojo" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">Dojo 3 — AI GRC</Link>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-3">Study</p>
            <div className="flex flex-col gap-2">
              <Link href="/playbook" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">Topic Articles</Link>
              <Link href="/playbook" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">Quiz — Cert-first flow</Link>
              <Link href="/playbook" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">Glossary</Link>
              <Link href="/playbook" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">Cert Map</Link>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-3">Frameworks</p>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-600">OWASP LLM Top 10</span>
              <span className="text-xs text-slate-600">MITRE ATT&amp;CK</span>
              <span className="text-xs text-slate-600">NIST AI RMF 1.0</span>
              <span className="text-xs text-slate-600">ISO/IEC 42001</span>
              <span className="text-xs text-slate-600">EU AI Act</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-3">About</p>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">How it works</Link>
              <Link href="/about" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">Principles</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-400 tracking-tight">LLM DOJO</span>
            <span className="text-[10px] font-mono text-slate-700">Free · No account · No tracking</span>
          </div>
          <p className="text-[11px] text-slate-700 font-mono">
            Content cross-checked against official exam study guides.
            Verify objectives with providers before scheduling exams.
          </p>
        </div>
      </div>
    </footer>
  );
}
