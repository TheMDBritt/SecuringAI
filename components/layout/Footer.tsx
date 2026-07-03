import Link from 'next/link';
import { QUIZ_QUESTIONS } from '@/lib/playbook-quiz';
import { GLOSSARY_TERMS } from '@/lib/playbook-glossary';
import { SCENARIOS } from '@/lib/scenarios';
import { DOJO2_PREBUILT_SCENARIOS } from '@/lib/dojo2-scenarios';

const Q  = QUIZ_QUESTIONS.length.toLocaleString();
const G  = GLOSSARY_TERMS.length.toLocaleString();
const S  = SCENARIOS.length;
const I  = DOJO2_PREBUILT_SCENARIOS.length;

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col gap-1.5">
            <span className="font-bold text-sm text-slate-200 tracking-tight">Securing AI</span>
            <span className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
              AI security training. {Q} practice questions, {G} glossary terms,
              {' '}{S} dojo scenarios, {I} SOC incidents — no signup required.
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {['OWASP LLM Top 10', 'MITRE ATLAS', 'NIST AI RMF', 'ISO 42001', 'EU AI Act'].map((f) => (
                <span key={f} className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-slate-800 text-slate-700">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col md:flex-row gap-8">
            <div>
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-2">Platform</p>
              <nav className="flex flex-col gap-1.5 text-xs text-slate-500" aria-label="Footer navigation">
                <Link href="/dojo"     className="hover:text-slate-300 transition-colors duration-150">Dojo</Link>
                <Link href="/playbook" className="hover:text-slate-300 transition-colors duration-150">Playbook</Link>
                <Link href="/about"    className="hover:text-slate-300 transition-colors duration-150">About</Link>
              </nav>
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-2">Certifications</p>
              <div className="flex flex-col gap-1.5 text-xs text-slate-500">
                <span>CompTIA SecAI+</span>
                <span>CAISP · EC-Council C|AI Security</span>
                <span>GIAC GOAA · GIAC GASAE</span>
                <span>Microsoft SC-500 · Azure AI-103</span>
                <span>AWS AIF-C01 · AWS Security Specialty (SCS-C03)</span>
                <span>Azure AI-901 · Google MLE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <p className="text-[10px] font-mono text-slate-700">
            Independent · Unaffiliated with any certification provider · Cross-check official exam objectives before scheduling.
          </p>
          <p className="text-[10px] font-mono text-slate-700">No login · No ads · No tracking</p>
        </div>
      </div>
    </footer>
  );
}
