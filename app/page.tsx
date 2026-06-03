import Link from 'next/link';
import { getScenariosByDojo } from '@/lib/scenarios';
import { ACCENT, type AccentName } from '@/lib/dojo-theme';
import { Footer } from '@/components/layout/Footer';
import type { DojoId } from '@/types';

interface DojoCard {
  id: DojoId;
  label: string;
  title: string;
  summary: string;
  accent: AccentName;
}

const DOJOS: DojoCard[] = [
  {
    id: 1,
    label: 'Dojo 1',
    title: 'LLM Attack & Defense',
    summary:
      'Attack an LLM under live guardrail toggles. Flip Injection Shield, Strict Policy, Tools, and RAG on and off — watch exactly which control stops which attack.',
    accent: 'red',
  },
  {
    id: 2,
    label: 'Dojo 2',
    title: 'AI-Assisted SOC',
    summary:
      'Run a SOC scenario with AI as your analyst. Score the output against a rubric: IOC extraction, MITRE T-codes, executive summary quality.',
    accent: 'cyan',
  },
  {
    id: 3,
    label: 'Dojo 3',
    title: 'AI GRC',
    summary:
      'Tier an AI deployment under EU AI Act, draft policy clauses, and identify vendor gaps under ISO 42001 and NIST AI RMF.',
    accent: 'emerald',
  },
];

// ── Static stats — keep in sync with lib/ counts ───────────────────────────
// To verify: grep -c "id: '" lib/playbook-quiz.ts
// To verify: grep -c "term: '" lib/playbook-glossary.ts
const STATS = [
  { value: '474',  label: 'quiz questions' },
  { value: '9',    label: 'AI certs mapped' },
  { value: '289',  label: 'glossary terms' },
  { value: '3',    label: 'live dojos' },
];

const FRAMEWORKS = [
  'OWASP LLM Top 10',
  'MITRE ATT&CK / ATLAS',
  'NIST AI RMF',
  'ISO/IEC 42001',
  'EU AI Act',
  'CSA AICM',
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">

            {/* Left column */}
            <div className="flex-1 max-w-2xl">
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-4">
                AI Security Training
              </p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-100 leading-tight">
                <span className="text-red-400">Attack</span>,{' '}
                <span className="text-cyan-400">defend</span>, and{' '}
                <span className="text-emerald-400">govern</span>
                <br className="hidden md:block" /> AI systems.
              </h1>

              <p className="mt-5 text-base text-slate-400 leading-relaxed">
                Three hands-on dojos. Live guardrail toggles. Per-turn scores mapped to
                OWASP LLM Top 10 and nine AI security certifications. A playbook with{' '}
                474 questions, 289 glossary terms, and domain-matched quiz flow
                built from official exam study guides.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/dojo"
                  className="px-5 py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors duration-150"
                >
                  Enter the dojo →
                </Link>
                <Link
                  href="/playbook"
                  className="px-5 py-2.5 rounded border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-slate-100 text-sm font-medium transition-colors duration-150"
                >
                  Open the playbook
                </Link>
              </div>
            </div>

            {/* Right: stats grid */}
            <div className="grid grid-cols-2 gap-3 md:w-56 shrink-0">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col p-4 rounded-lg border border-slate-800 bg-slate-900/60"
                >
                  <span className="text-2xl font-bold font-mono text-slate-100 leading-none">{s.value}</span>
                  <span className="text-[11px] text-slate-500 mt-1 leading-snug">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Framework pills */}
          <ul className="mt-10 flex flex-wrap gap-x-5 gap-y-1.5">
            {FRAMEWORKS.map((f) => (
              <li key={f} className="text-[11px] font-mono text-slate-600">· {f}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Three Dojos ──────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <p className="text-[11px] font-mono text-slate-600 uppercase tracking-widest mb-1">
                Three dojos
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-slate-100">
                Pick a discipline. Run scenarios. Get scored.
              </h2>
            </div>
            <Link
              href="/dojo"
              className="hidden md:block text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {DOJOS.map((d) => {
              const accent = ACCENT[d.accent];
              const scenarios = getScenariosByDojo(d.id);
              return (
                <Link
                  key={d.id}
                  href="/dojo"
                  className={[
                    'group flex flex-col p-5 rounded-lg border bg-slate-900/40 transition-colors duration-150',
                    accent.border,
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={['text-[10px] font-mono px-2 py-0.5 rounded', accent.bg, accent.text].join(' ')}>
                      {d.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600">
                      {scenarios.length} scenario{scenarios.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <h3 className={['text-base font-semibold mb-2', accent.text].join(' ')}>
                    {d.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 flex-1">
                    {d.summary}
                  </p>
                  <ul className="space-y-0.5 mb-4">
                    {scenarios.map((s) => (
                      <li key={s.id} className="text-[11px] text-slate-500 flex gap-1.5">
                        <span className="text-slate-700">·</span>
                        {s.title}
                      </li>
                    ))}
                  </ul>
                  <span
                    className={[
                      'text-[11px] font-mono opacity-50 group-hover:opacity-100 transition-opacity duration-150',
                      accent.text,
                    ].join(' ')}
                  >
                    Open {d.label} →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Scoring model ─────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <p className="text-[11px] font-mono text-slate-600 uppercase tracking-widest mb-1">
            Scoring model
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 mb-8">
            Deterministic in Dojo 1. Quality-rubric in Dojo 2 &amp; 3.
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-lg border border-slate-800 bg-slate-900/40">
              <p className="text-[10px] font-mono text-red-400 uppercase tracking-wide mb-2">Dojo 1 · Outcome engine</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Guardrail settings deterministically decide whether each attack is{' '}
                <em>vulnerable</em>, <em>partial</em>, or <em>blocked</em>. Session
                score starts at 100 and decays as attacks land. Chained attacks stack
                penalties — the score math is fixed and documented.
              </p>
            </div>
            <div className="p-5 rounded-lg border border-slate-800 bg-slate-900/40">
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wide mb-2">Dojo 2 / 3 · Quality rubric</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Per-scenario rubrics evaluate the AI&apos;s response. Dojo 2 checks IOCs,
                MITRE T-codes, and executive summaries. Dojo 3 checks EU AI Act tiering,
                ISO 42001 controls, and vendor-review gaps.
              </p>
            </div>
            <div className="p-5 rounded-lg border border-slate-800 bg-slate-900/40">
              <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-wide mb-2">Every turn · Cert mapping</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                The evaluator returns OWASP LLM Top 10 categorisation, MITRE ATT&amp;CK
                references, and the relevant 2026 AI-security certification domains — so
                you know which exam objective you just practiced.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Playbook callout ──────────────────────────────────────────────── */}
      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="flex-1 max-w-xl">
              <p className="text-[11px] font-mono text-slate-600 uppercase tracking-widest mb-1">Playbook</p>
              <h2 className="text-xl md:text-2xl font-bold text-slate-100 mb-3">
                Study for your next AI security cert.
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Select an exam — SecAI+, SC-500, AWS AIF-C01, CAISP, GIAC-GOAA, or six
                others — choose the domains you want to drill, and get questions pulled
                from that cert&apos;s official study guide scope. 474 questions across 9
                certs, with per-question explanations and topic breakdowns at the end.
              </p>
              <div className="mt-5 flex gap-3">
                <Link
                  href="/playbook"
                  className="px-4 py-2 rounded border border-violet-500/40 bg-violet-500/5 hover:bg-violet-500/10 text-violet-300 text-sm font-medium transition-colors duration-150"
                >
                  Open playbook →
                </Link>
              </div>
            </div>

            {/* Mini feature list */}
            <div className="grid grid-cols-1 gap-2 md:w-64 shrink-0">
              {[
                ['474 questions', '9 certs, 50+ topics'],
                ['9 certifications', 'SecAI+, SC-500, AWS, Azure, Google, GIAC, CAISP'],
                ['289 glossary terms', 'Cross-referenced to cert domains'],
                ['Domain-first quiz', 'Pick exam → pick domain → drill'],
                ['SC-500 mock exam', '60 Q · 90 min · timed simulation'],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-3 items-start px-3 py-2.5 rounded border border-slate-800 bg-slate-900/30">
                  <div className="w-1 h-1 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-300">{title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section>
        <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-1">
              No signup. No paywalls. No tracking.
            </h2>
            <p className="text-sm text-slate-500">
              Free forever — the barrier to learning AI security should be zero.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href="/dojo"
              className="px-5 py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors duration-150"
            >
              Enter the dojo →
            </Link>
            <Link
              href="/about"
              className="px-5 py-2.5 rounded border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors duration-150"
            >
              About
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
