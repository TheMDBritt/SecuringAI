import Link from 'next/link';
import { SCENARIOS } from '@/lib/scenarios';
import { QUIZ_QUESTIONS } from '@/lib/playbook-quiz';
import { GLOSSARY_TERMS } from '@/lib/playbook-glossary';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'About',
  description:
    'How Securing AI works: deterministic scoring, quality rubrics, quiz flow, and the AI security certifications mapped across LLM attack/defense, AI SOC, and GRC disciplines.',
};

const PRINCIPLES = [
  {
    label: 'Open access',
    body: 'No accounts, no paywall, no tracking. The barrier to entry is a browser tab. Everything runs client-side or through stateless server routes, no data is stored.',
  },
  {
    label: 'Hands-on, not theoretical',
    body: 'Every concept is something you can type into the chat console. Read about prompt injection, then run one and watch the guardrails decide the outcome. The scenario, the payload, the result, all of it is in your hands.',
  },
  {
    label: 'Deterministic scoring',
    body: 'Dojo 1 outcomes are decided by guardrail configuration alone, the same payload with the same config always produces the same result. The score is a function of security decisions, not model temperature.',
  },
  {
    label: 'Conceptual payloads only',
    body: 'Inputs and responses are training material, not functional exploits. A safety pre-filter blocks executable attack syntax. The goal is understanding threat mechanics, not capability transfer.',
  },
];

const SCORING_DETAIL = [
  {
    dojo: 'Dojo 1',
    color: 'text-red-400',
    border: 'border-red-500/20',
    engine: 'Deterministic outcome engine',
    detail: [
      'Guardrail state (Injection Shield, Strict Policy, Tool Access, RAG Sanitiser) is the sole input to the outcome engine.',
      'Each scenario maps attack types (prompt_injection, data_exfiltration, policy_bypass, tool_abuse, rag_injection) to outcome tiers: VULNERABLE, PARTIAL, BLOCKED.',
      'Session score starts at 100. Each successful attack deducts (100 − turn_score). Chained attacks add a compounding penalty on top of the base deduction.',
      'Benign and probing turns do not change the session score. Only successful attacks deduct points.',
      'Score ≥90 = low risk. 70-89 = medium. 40-69 = high. <40 = critical.',
    ],
  },
  {
    dojo: 'Dojo 2',
    color: 'text-brand-400',
    border: 'border-brand-500/20',
    engine: 'Quality rubric evaluator',
    detail: [
      'Each of the 9 SOC workflow scenarios has its own scoring rubric: required fields vary by task type (log triage vs. detection rule generation vs. IR report).',
      'Rubrics check for: IOC extraction (IPs, domains, hashes), MITRE T-code citation, executive summary presence, confidence assessment, detection rule syntax, and threat correlation.',
      'Analyst persona affects output style only, capability toggles (IOC Extraction, MITRE Mapping, Threat Correlation) gate whether the evaluator checks those elements.',
      'Quality is scored 0-100 and mapped to STRONG / ADEQUATE / WEAK / INCOMPLETE. The evaluator lists missing criteria and improvement guidance.',
    ],
  },
  {
    dojo: 'Dojo 3',
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    engine: 'Framework rubric evaluator',
    detail: [
      'Rubrics check framework-specific citations: EU AI Act tier assignment (I/II/III/IV), NIST AI RMF function references (GOVERN/MAP/MEASURE/MANAGE), ISO 42001 clause citations (4-10), and vendor gap coverage.',
      'GRC scenario scoring looks for: risk tier justification, control specificity, evidence gaps, and remediation prioritization.',
      'The evaluator returns per-element coaching, not just a binary pass/fail, explaining which framework criteria were met and which need work.',
    ],
  },
];

const CREDITS = [
  'OWASP Top 10 for LLM Applications (2025)',
  'NIST AI Risk Management Framework 1.0',
  'ISO/IEC 42001:2023, AI Management System',
  'EU AI Act (2024)',
  'MITRE ATT&CK + ATLAS',
  'Cloud Security Alliance AI Controls Matrix',
  'NIST SP 800-218A (Secure Software Development for AI)',
  'NIST AI 100-1 (Adversarial ML Taxonomy)',
  'CompTIA SecAI+ Exam Objectives',
  'GIAC GOAA / GASAE Syllabi (SANS Institute)',
  'CAISP Exam Domains (Practical DevSecOps)',
  'EC-Council C|AI Security Objectives',
  'Microsoft SC-500 / Azure AI-103 Study Guide',
  'AWS AI Practitioner (AIF-C01) Exam Guide',
  'Google Professional ML Engineer Exam Guide',
];

const SCENARIO_COUNT_BY_DOJO: Record<1 | 2 | 3, number> = {
  1: SCENARIOS.filter((s) => s.dojoId === 1).length,
  2: SCENARIOS.filter((s) => s.dojoId === 2).length,
  3: SCENARIOS.filter((s) => s.dojoId === 3).length,
};

const DOJO_DESC: Record<1 | 2 | 3, { title: string; color: string; body: string }> = {
  1: {
    title: 'LLM Attack & Defense',
    color: 'text-red-400',
    body: `Attack and defend a live LLM under configurable guardrail settings across 41 scenarios. Includes Prompt Injection, Data Exfiltration, Policy Bypass, Tool Abuse, RAG Injection, Supply Chain & Model Theft, Indirect Injection, Model Inversion & Extraction, Agent Orchestration Hijack, Multimodal Injection, Many-Shot Jailbreaking, Crescendo Attack, Token Smuggling, Adversarial Suffix (GCG), System Prompt Leakage, Function Call Injection, Context Window Overflow Attack, Model Supply Chain Poisoning, Markdown Rendering Attack, Token Exhaustion DoS, Credential Harvesting, Hypothetical Framing Jailbreak, Code Interpreter Injection, Sycophancy Exploitation, MCP Server Tool Injection, Semantic Cache Poisoning, Vision Adversarial Attack, Agent Memory Poisoning, Cross-Tenant Data Leakage, Chain-of-Thought Hijacking, System Prompt Reflection Leak, Alignment Exploitation, Function Name Confusion, Base64 Encoding Bypass, Nested Roleplay Jailbreak, Instruction Shadowing, Agentic Goal Hijacking, and Prompt Chaining Attack. The four guardrail controls (Injection Shield, Strict Policy, Tool Access, RAG Sanitiser) combine to produce deterministic outcomes per scenario.`,
  },
  2: {
    title: 'AI-Assisted SOC',
    color: 'text-brand-400',
    body: `Operate as an AI SOC analyst across 12 workflow scenarios: Log Triage, Alert Enrichment, Detection Rule Generation, Incident Report Drafting, Threat Hunt Query, Malware Behavior Analysis, Cloud Identity Abuse Detection, Autonomous AI Agent Forensics, AI System Compromise Triage, AI Model Abuse Investigation, Adversarial Prompt Forensics, and Ransomware IR with AI Assistance. Each workflow loads from a library of 56 prebuilt incidents or generates new ones on demand. Analyst configuration controls depth, persona, response style, and which analysis capabilities are enabled, disabled capabilities are excluded from quality scoring.`,
  },
  3: {
    title: 'AI GRC',
    color: 'text-emerald-400',
    body: `Govern the full AI risk lifecycle across 17 scenarios: EU AI Act risk classification, ISO 42001 control drafting, third-party vendor review, AI model failure investigation (Article 73), model card and AI-BOM documentation, AI red team assessment reports, supply chain risk assessment (NIST AI RMF MAP.5), bias & fairness audit (Annex III), AI Privacy Impact Assessment (GDPR Art 35 + EU AI Act Art 10), AI procurement risk assessment (ISO 42001 Clause 8.4), ISO 42001 gap analysis, NIST AI RMF Profile construction, AI Continuous Monitoring Program, Multi-Framework Regulatory Mapping, AI Transparency Obligations (EU AI Act Art. 13), Model Drift & Post-Market Surveillance (Art. 72), and Multi-Jurisdiction Compliance Mapping across EU AI Act, GDPR, NIST AI RMF, ISO 42001, and CCPA simultaneously.`,
  },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
          <Link
            href="/"
            className="text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors duration-150"
          >
            ← Home
          </Link>
          <div className="mt-6 grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-3">
                About Securing AI
              </p>
              <h1 className="text-3xl md:text-[40px] font-bold tracking-tight text-slate-100 leading-[1.08]">
                A free study tool<br />for AI security.
              </h1>
              <p className="mt-5 text-[15px] text-slate-400 leading-relaxed max-w-xl">
                Securing AI exists because there is no shortage of slide decks explaining prompt injection
                and almost no way to actually run one. The goal is a hands-on environment, realistic
                scenarios, live guardrail toggles, and per-turn scoring mapped to the certifications
                the field is converging on.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-px bg-slate-800 border border-slate-800 rounded-lg overflow-hidden">
              {[
                { n: `${SCENARIOS.length}`, label: 'scenarios', sub: '3 disciplines' },
                { n: '47', label: 'SOC incidents', sub: 'Dojo 2 prebuilt' },
                { n: QUIZ_QUESTIONS.length.toLocaleString(), label: 'quiz questions', sub: '11 certs mapped' },
                { n: GLOSSARY_TERMS.length.toLocaleString(), label: 'glossary terms', sub: 'A Z, cert-filtered' },
              ].map(({ n, label, sub }) => (
                <div key={label} className="bg-slate-900 px-4 py-3.5">
                  <div className="text-xl font-bold font-mono text-slate-100">{n}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{label}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-2">
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
                <h3 className="text-[11px] font-mono font-semibold text-brand-400 mb-2 uppercase tracking-wide">
                  {p.label}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three dojos */}
      <section className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-2">
            How it works
          </p>
          <h2 className="text-xl font-bold text-slate-100 mb-6">
            {SCENARIOS.length} scenarios across three disciplines.
          </h2>
          <div className="space-y-3">
            {([1, 2, 3] as const).map((dojoId) => {
              const d = DOJO_DESC[dojoId];
              return (
                <div
                  key={dojoId}
                  className="flex gap-5 p-5 rounded-lg border border-slate-800 bg-slate-900/40"
                >
                  <div className="shrink-0 w-16">
                    <span className={`${d.color} font-mono font-bold text-xs`}>Dojo {dojoId}</span>
                    <div className="text-[10px] font-mono text-slate-600 mt-0.5">
                      {SCENARIO_COUNT_BY_DOJO[dojoId]}s
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold mb-2 ${d.color}`}>{d.title}</p>
                    <p className="text-sm text-slate-400 leading-relaxed">{d.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Scoring detail */}
      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-2">
            Scoring
          </p>
          <h2 className="text-xl font-bold text-slate-100 mb-6">
            Deterministic in Dojo 1. Quality-rubric in Dojo 2 &amp; 3.
          </h2>
          <div className="space-y-3">
            {SCORING_DETAIL.map((s) => (
              <div key={s.dojo} className={`p-5 rounded-lg border ${s.border} bg-slate-900/40`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-sm font-mono font-bold ${s.color}`}>{s.dojo}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{s.engine}</span>
                </div>
                <ul className="space-y-1.5">
                  {s.detail.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-400 leading-relaxed">
                      <span className={`${s.color} opacity-40 shrink-0 font-mono text-xs mt-0.5`}>▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz flow */}
      <section className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-2">
            Playbook / Quiz
          </p>
          <h2 className="text-xl font-bold text-slate-100 mb-4">
            Exam-first. Domain-scoped. Weakness-targeted.
          </h2>
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="text-sm text-slate-400 leading-relaxed space-y-3">
              <p>
                The quiz starts with selecting a cert, SecAI+, SC-500, GIAC GOAA, CAIS, and 6 more.
                From the cert you pick which exam domains to drill. One cert at a time, one or many domains.
              </p>
              <p>
                Questions are tagged to the official exam objective domain of each cert. At the end you get
                per-domain score breakdown so you can see exactly where to focus next.
              </p>
              <p>
                Mock exam mode uses the official question count and time limit for the selected cert, with
                no per-question feedback until the end.
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Quiz flow</p>
              </div>
              <div className="px-4 py-3.5 space-y-3">
                {[
                  { step: '01', text: 'Select a cert (SecAI+, SC-500, GIAC GOAA…)' },
                  { step: '02', text: "Pick domains from that exam's official objectives" },
                  { step: '03', text: 'Set difficulty · question count · mock exam mode' },
                  { step: '04', text: 'Per-domain score breakdown + weak area targeting' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex gap-3 items-start">
                    <span className="font-mono text-[10px] text-slate-700 shrink-0 mt-0.5">{step}</span>
                    <span className="text-xs text-slate-400">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credits */}
      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-2">
            Sources
          </p>
          <h2 className="text-xl font-bold text-slate-100 mb-4">
            Standing on published work.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-xl">
            The scoring rubrics, threat taxonomies, and policy clauses in this project are derived
            from publicly available technical standards and certification exam objectives.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CREDITS.map((c) => (
              <span
                key={c}
                className="text-[11px] px-2.5 py-1 rounded border border-slate-800 bg-slate-900/60 text-slate-400 font-mono"
              >
                {c}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed mt-5">
            Securing AI is independent and unaffiliated with any certification provider.
            Cross-check exam objectives with official provider materials before scheduling.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="max-w-5xl mx-auto px-6 py-14">
          <div className="border border-slate-800 rounded-lg px-6 py-8 bg-slate-900/30 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">
                Enough reading.
              </h2>
              <p className="text-sm text-slate-400">
                Pick a dojo, load a scenario, submit your attack. The guardrail configuration decides
                the outcome.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                href="/dojo"
                className="px-5 py-2.5 rounded bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-colors duration-150"
              >
                Enter the dojo →
              </Link>
              <Link
                href="/playbook"
                className="px-5 py-2.5 rounded border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-slate-100 text-sm font-medium transition-colors duration-150"
              >
                Study
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
