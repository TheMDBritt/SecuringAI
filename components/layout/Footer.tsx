import Link from 'next/link';
import { CONTENT_COUNTS } from '@/lib/content-counts';
import { SCENARIOS } from '@/lib/scenarios';
import { CATALOG_COUNTS } from '@/lib/catalog-counts';

const Q  = CONTENT_COUNTS.quizQuestions.toLocaleString();
const G  = CONTENT_COUNTS.glossaryTerms.toLocaleString();
const S  = SCENARIOS.length;
const I  = CATALOG_COUNTS.incidents;

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col gap-1.5">
            <span className="font-bold text-sm text-slate-200 tracking-tight">Securing AI</span>
            <span className="text-2xs text-slate-500 max-w-xs leading-relaxed">
              AI security training. {Q} practice questions, {G} glossary terms,
              {' '}{S} dojo scenarios, {I} SOC incidents, no signup required.
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {['OWASP LLM Top 10', 'MITRE ATLAS', 'NIST AI RMF', 'ISO 42001', 'EU AI Act'].map((f) => (
                <span key={f} className="text-micro font-mono px-1.5 py-0.5 rounded border border-slate-800 text-slate-500">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col md:flex-row gap-8">
            <div>
              <p className="text-micro font-mono text-slate-400 uppercase tracking-widest mb-2">Platform</p>
              <nav className="flex flex-col gap-1.5 text-xs text-slate-500" aria-label="Footer navigation">
                <Link href="/dojo"     className="hover:text-slate-300 transition-colors duration-150">Dojo</Link>
                <Link href="/playbook" className="hover:text-slate-300 transition-colors duration-150">Playbook</Link>
                <Link href="/about"    className="hover:text-slate-300 transition-colors duration-150">About</Link>
                <Link href="/help"     className="hover:text-slate-300 transition-colors duration-150">Help</Link>
              </nav>
            </div>
            <div>
              <p className="text-micro font-mono text-slate-400 uppercase tracking-widest mb-2">Legal</p>
              <nav className="flex flex-col gap-1.5 text-xs text-slate-500" aria-label="Legal navigation">
                <Link href="/privacy" className="hover:text-slate-300 transition-colors duration-150">Privacy</Link>
                <Link href="/terms"   className="hover:text-slate-300 transition-colors duration-150">Terms of use</Link>
                <a href="https://github.com/themdbritt/securingai/issues" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors duration-150">Report an issue</a>
              </nav>
            </div>
            <div>
              <p className="text-micro font-mono text-slate-400 uppercase tracking-widest mb-2">Certifications</p>
              <div className="flex flex-col gap-1.5 text-xs text-slate-500">
                <span>CompTIA SecAI+</span>
                <span>CAISP · EC-Council C|AI Security</span>
                <span>GIAC GOAA · GIAC GASAE</span>
                <span>Microsoft SC-500 · Azure AI-103</span>
                <span>AWS AIF-C01 · AWS Certified Security - Specialty</span>
                <span>Azure AI-901 · Google MLE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <p className="text-xs text-slate-500">
            Independent project. Cross-check official exam objectives before scheduling.
          </p>
          <p className="text-xs text-slate-500">No login · No ads · No tracking</p>
        </div>
      </div>
    </footer>
  );
}
