import Link from 'next/link';
import { SCENARIOS } from '@/lib/scenarios';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'About',
  description:
    'Why LLM DOJO exists and how it works under the hood. Free, forever.',
};

const PRINCIPLES = [
  {
    label: 'Free, forever',
    body:
      'No accounts, no paywall, no tracking. The barrier to learning AI security should be zero. Anything that adds friction defeats the point.',
  },
  {
    label: 'Hands-on, not theoretical',
    body:
      'Every concept is something you can type into the chat console. Read about prompt injection, then run one and see what the guardrails actually do.',
  },
  {
    label: 'Conceptual payloads only',
    body:
      'Inputs and responses are training material. A safety pre-filter blocks functional exploit syntax. This is a study tool, not a weapons cache.',
  },
];

const CREDITS = [
  'OWASP Top 10 for LLM Applications (2025)',
  'NIST AI Risk Management Framework 1.0',
  'ISO/IEC 42001 — AI Management System',
  'EU AI Act',
  'MITRE ATT&CK',
  'Cloud Security Alliance AI Controls Matrix',
];

const SCENARIO_COUNT_BY_DOJO: Record<1 | 2 | 3, number> = {
  1: SCENARIOS.filter((s) => s.dojoId === 1).length,
  2: SCENARIOS.filter((s) => s.dojoId === 2).length,
  3: SCENARIOS.filter((s) => s.dojoId === 3).length,
};

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <Link
            href="/"
            className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Back to home
          </Link>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mt-6 mb-2">
            About LLM DOJO
          </p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-100 leading-tight">
            A free study tool for AI security.
          </h1>
          <p className="mt-6 text-lg text-slate-300 leading-relaxed">
            LLM DOJO exists because there is no shortage of slide decks
            explaining prompt injection and almost no way to actually try one.
            The goal is a hands-on environment with realistic scenarios, live
            guardrail toggles, and per-turn scoring against the certifications
            the field is converging on.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
            Principles
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-8">
            What this project will and won&apos;t be.
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {PRINCIPLES.map((p) => (
              <div
                key={p.label}
                className="p-5 rounded-lg border border-slate-800 bg-slate-900/60"
              >
                <h3 className="text-sm font-semibold text-cyan-400 mb-2 font-mono">
                  {p.label}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
            How it works
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-8">
            {`Three connected dojos. ${SCENARIOS.length} scenarios. 16 prebuilt incidents.`}
          </h2>
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>
              <span className="text-red-400 font-mono">Dojo 1</span> ·{' '}
              {SCENARIO_COUNT_BY_DOJO[1]} scenarios. Attack and defend an LLM
              under live guardrail settings. Outcomes are deterministic — the
              guardrail configuration alone decides whether each attack lands
              as <em>vulnerable</em>, <em>partial</em>, or <em>blocked</em>.
              Session score starts at 100 and decays as attacks succeed.
            </p>
            <p>
              <span className="text-cyan-400 font-mono">Dojo 2 · AI-Assisted SOC</span> ·{' '}
              {SCENARIO_COUNT_BY_DOJO[2]} scenarios. Use AI as a SOC analyst.
              Per-scenario regex rubrics evaluate the AI&apos;s response for
              IOCs, MITRE T-codes, executive summaries, and framework mappings.
              Disabled analyst capabilities are excluded from scoring.
            </p>
            <p>
              <span className="text-emerald-400 font-mono">Dojo 3 · AI GRC</span> ·{' '}
              {SCENARIO_COUNT_BY_DOJO[3]} scenarios. Govern AI: risk-tier a
              deployment under the EU AI Act, draft policy and ISO 42001
              controls, and run a third-party AI vendor review. Scored on
              NIST AI RMF, ISO/IEC 42001, and EU AI Act mappings.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
            Credits
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-6">
            Standing on giants.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-2xl">
            The scoring rubrics, threat taxonomies, and policy clauses in this
            project are derived from the published work of:
          </p>
          <ul className="flex flex-wrap gap-2">
            {CREDITS.map((c) => (
              <li
                key={c}
                className="text-xs px-2.5 py-1 rounded border border-slate-700 bg-slate-800/60 text-slate-300 font-mono"
              >
                {c}
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-400 leading-relaxed mt-6 max-w-2xl">
            LLM DOJO is independent and unaffiliated. Cross-check exam
            objectives with the official providers before scheduling.
          </p>
        </div>
      </section>

      <section className="bg-slate-900/40">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4">
            Enough talk.
          </h2>
          <Link
            href="/dojo"
            className="inline-block px-8 py-3 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
          >
            Enter the dojo →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
