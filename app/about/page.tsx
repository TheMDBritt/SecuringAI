import Link from 'next/link';
import { SCENARIOS } from '@/lib/scenarios';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'About',
  description:
    'Why SecuringAI exists, how it works under the hood, and how to contribute. Free, no logins, MIT licensed.',
};

const PRINCIPLES = [
  {
    label: 'Free, forever',
    body:
      'No accounts, no paywall, no tracking. The whole point is to lower the barrier to learning AI security — anything that adds friction defeats that.',
  },
  {
    label: 'Hands-on, not theoretical',
    body:
      'Every concept is reachable by typing in the chat console. Read about prompt injection, then actually try one and watch the guardrails respond.',
  },
  {
    label: 'Calibrated to real exam objectives',
    body:
      'Scenarios are tagged against the published 2026 AI security cert domains so practice translates directly to study time.',
  },
  {
    label: 'Conceptual payloads only',
    body:
      'Inputs and responses are training artefacts. A safety pre-filter blocks functional exploit syntax — this is a learning tool, not a weapons cache.',
  },
];

const STACK = [
  { tech: 'Next.js 14',  role: 'App Router, server components, edge OG image' },
  { tech: 'TypeScript',  role: 'Strict mode end-to-end' },
  { tech: 'Tailwind CSS', role: 'Dark theme, shared accent tokens' },
  { tech: 'Zod',         role: 'Server-side validation on every API request' },
  { tech: 'OpenAI API',  role: 'Optional. Stub mode is fully playable without it.' },
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
            About SecuringAI
          </p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-100 leading-tight">
            A free, no-login study tool for AI security.
          </h1>
          <p className="mt-6 text-lg text-slate-300 leading-relaxed">
            SecuringAI exists because there is no shortage of slide decks
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
            {`Three connected dojos. ${SCENARIOS.length} scenarios.`}
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
              <span className="text-cyan-400 font-mono">Dojo 2</span> ·{' '}
              {SCENARIO_COUNT_BY_DOJO[2]} scenarios. Use AI as a SOC analyst.
              Per-scenario regex rubrics evaluate the AI&apos;s response for
              IOCs, MITRE T-codes, executive summaries, and framework mappings.
              Disabled analyst capabilities are excluded from scoring.
            </p>
            <p>
              <span className="text-emerald-400 font-mono">Dojo 3</span> ·{' '}
              {SCENARIO_COUNT_BY_DOJO[3]} scenarios. Defend against AI-powered
              attackers. Build threat models and policy clauses scored against
              NIST AI RMF, ISO/IEC 42001, and the EU AI Act.
            </p>
            <p>
              Every turn is scored, classified, and mapped to OWASP LLM Top 10,
              MITRE ATT&amp;CK, and the cert domains shown on{' '}
              <Link href="/certs" className="text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline">
                /certs
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
            Stack
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-6">
            Boring tech, deliberately.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-2xl">
            No database, no auth, no telemetry. The fewer moving parts, the
            easier it is to run, audit, and self-host.
          </p>
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <table className="w-full text-sm">
              <tbody>
                {STACK.map((s, i) => (
                  <tr
                    key={s.tech}
                    className={[
                      'border-b border-slate-800/60 last:border-b-0',
                      i % 2 === 0 ? 'bg-slate-900/20' : '',
                    ].join(' ')}
                  >
                    <td className="px-4 py-3 font-mono text-cyan-300/80 whitespace-nowrap">
                      {s.tech}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{s.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            SecuringAI is independent and unaffiliated. Cross-check exam
            objectives with the official providers before scheduling.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
            Open source
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-6">
            MIT licensed. Issues and PRs welcome.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            Architecture is documented in <code className="text-cyan-300 font-mono text-xs px-1 py-0.5 rounded bg-slate-800/80">DESIGN.md</code>.
            Add a scenario, fix a rubric, refine an evaluator regex — the
            project is small enough to read in an afternoon. PRs that add
            scenarios should include the MITRE T-codes and cert tags so the
            score panel mapping stays current.
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
