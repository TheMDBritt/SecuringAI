import Link from 'next/link';
import { SCENARIOS } from '@/lib/scenarios';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'About',
  description:
    'Why LLM DOJO exists and how it works. Free, login-free AI security training across 27 scenarios, 1000 quiz questions, 520 glossary terms, and 10 AI security certifications.',
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
      'Every concept is something you can type into the chat console. Read about prompt injection, then run one and watch the guardrails decide the outcome.',
  },
  {
    label: 'Deterministic scoring',
    body:
      'Dojo 1 outcomes are decided by guardrail state alone — the same payload with the same config always produces the same result. No LLM randomness in the score.',
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
  'EU AI Act (2024)',
  'MITRE ATT&CK + ATLAS',
  'Cloud Security Alliance AI Controls Matrix',
  'NIST SP 800-218A (AI SSDF)',
  'NIST SP 800-207 (Zero Trust)',
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
        <div className="max-w-4xl mx-auto px-6 py-14">
          <Link
            href="/"
            className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors duration-150"
          >
            ← Back to home
          </Link>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mt-6 mb-2">
            About LLM DOJO
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100 leading-tight">
            A free study tool for AI security.
          </h1>
          <p className="mt-5 text-base text-slate-400 leading-relaxed max-w-2xl">
            LLM DOJO exists because there is no shortage of slide decks explaining prompt injection
            and almost no way to actually try one. The goal is a hands-on environment with realistic
            scenarios, live guardrail toggles, and per-turn scoring against the certifications the
            field is converging on.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
            Principles
          </p>
          <h2 className="text-xl font-bold text-slate-100 mb-6">
            What this project will and won&apos;t be.
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {PRINCIPLES.map((p) => (
              <div
                key={p.label}
                className="p-4 rounded-lg border border-slate-800 bg-slate-900/60"
              >
                <h3 className="text-xs font-semibold text-cyan-400 mb-1.5 font-mono uppercase tracking-wide">
                  {p.label}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
            How it works
          </p>
          <h2 className="text-xl font-bold text-slate-100 mb-6">
            {`Three connected dojos. ${SCENARIOS.length} scenarios. 35 prebuilt Dojo 2 incidents.`}
          </h2>
          <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
            <div className="flex gap-4 p-4 rounded-lg border border-slate-800 bg-slate-900/40">
              <div className="shrink-0">
                <span className="text-red-400 font-mono font-bold text-xs">Dojo 1</span>
                <div className="text-[10px] font-mono text-slate-600 mt-0.5">{SCENARIO_COUNT_BY_DOJO[1]} scenarios</div>
              </div>
              <div>
                <p className="text-slate-300 font-medium text-sm mb-1">LLM Attack &amp; Defense</p>
                <p>
                  Attack and defend an LLM under live guardrail settings. Scenarios cover Prompt Injection,
                  Data Exfiltration, Policy Bypass, Tool Abuse, RAG Injection, Supply Chain &amp; Model Theft,
                  Indirect Injection, Model Inversion, Agent Orchestration Hijack, and Multimodal Injection.
                  Outcomes are deterministic — the guardrail configuration alone decides VULNERABLE / PARTIAL / BLOCKED.
                  Chained attacks stack penalties; score decays from 100 as attacks land.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-lg border border-slate-800 bg-slate-900/40">
              <div className="shrink-0">
                <span className="text-cyan-400 font-mono font-bold text-xs">Dojo 2</span>
                <div className="text-[10px] font-mono text-slate-600 mt-0.5">{SCENARIO_COUNT_BY_DOJO[2]} scenarios</div>
              </div>
              <div>
                <p className="text-slate-300 font-medium text-sm mb-1">AI-Assisted SOC</p>
                <p>
                  Use AI as a SOC analyst across Log Triage, Alert Enrichment, Detection Rule Generation,
                  Incident Report Drafting, Threat Hunt Query, Malware Behavior Analysis, Cloud Identity Abuse
                  Detection, and AI System Compromise Triage. 35 prebuilt incidents plus on-demand generation.
                  Per-scenario rubrics score IOC extraction, MITRE T-code mapping, executive summaries,
                  and KQL/Sigma rule quality. Disabled analyst capabilities are excluded from scoring.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-lg border border-slate-800 bg-slate-900/40">
              <div className="shrink-0">
                <span className="text-emerald-400 font-mono font-bold text-xs">Dojo 3</span>
                <div className="text-[10px] font-mono text-slate-600 mt-0.5">{SCENARIO_COUNT_BY_DOJO[3]} scenarios</div>
              </div>
              <div>
                <p className="text-slate-300 font-medium text-sm mb-1">AI GRC</p>
                <p>
                  Govern AI across the full risk lifecycle. Risk-tier a deployment under the EU AI Act,
                  draft ISO 42001 controls, review third-party AI vendors, investigate model failures
                  under Article 73, document model cards and AI-BOMs, conduct AI red team assessment reports,
                  evaluate supply chain risk against NIST AI RMF MAP.5, and audit bias metrics for
                  Annex III high-risk systems. Scored on NIST AI RMF, ISO/IEC 42001, and EU AI Act.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
            Credits
          </p>
          <h2 className="text-xl font-bold text-slate-100 mb-4">
            Standing on published work.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-2xl">
            The scoring rubrics, threat taxonomies, and policy clauses in this project are derived
            from the published work of:
          </p>
          <div className="flex flex-wrap gap-2">
            {CREDITS.map((c) => (
              <span
                key={c}
                className="text-[11px] px-2.5 py-1 rounded border border-slate-700 bg-slate-800/60 text-slate-400 font-mono"
              >
                {c}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mt-5 max-w-2xl">
            LLM DOJO is independent and unaffiliated with any certification provider.
            Cross-check exam objectives with official provider materials before scheduling.
          </p>
        </div>
      </section>

      <section className="bg-slate-900/40">
        <div className="max-w-4xl mx-auto px-6 py-14 text-center">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">
            Enough reading.
          </h2>
          <Link
            href="/dojo"
            className="inline-block px-8 py-3 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-colors duration-150"
          >
            Enter the dojo →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
