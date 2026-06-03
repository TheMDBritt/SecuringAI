import Link from 'next/link';
import { getScenariosByDojo } from '@/lib/scenarios';
import { ACCENT, type AccentName } from '@/lib/dojo-theme';
import { Footer } from '@/components/layout/Footer';
import type { DojoId } from '@/types';

// ── Static counts ─────────────────────────────────────────────────────────────
// Update when playbook content changes.
const STATS = {
  scenarios:  13,
  quizQs:    629,
  glossary:  330,
  articles:   59,
  certs:      12,
  incidents:  17,   // prebuilt Dojo 2 scenarios
};

interface DojoCard {
  id: DojoId;
  label: string;
  title: string;
  summary: string;
  accent: AccentName;
  detail: string;
}

const DOJOS: DojoCard[] = [
  {
    id: 1,
    label: 'Dojo 1',
    title: 'LLM Attack & Defense',
    summary: 'Attack and defend a live LLM under configurable guardrails. Each guardrail combination deterministically changes whether the attack lands, partially lands, or is blocked.',
    accent: 'red',
    detail: 'Injection Shield · Strict Policy · Tool Access · RAG Sanitiser',
  },
  {
    id: 2,
    label: 'Dojo 2',
    title: 'AI-Assisted SOC',
    summary: 'Work as an AI SOC analyst across 17 prebuilt incidents — log triage, alert enrichment, Sigma/KQL detection rule generation, and IR report drafting.',
    accent: 'cyan',
    detail: 'Log Triage · Alert Enrichment · Detection Rule Gen · IR Report',
  },
  {
    id: 3,
    label: 'Dojo 3',
    title: 'AI GRC',
    summary: 'Govern AI: classify deployments under EU AI Act risk tiers, draft ISO 42001 policy clauses, run vendor reviews, and investigate AI model failures under Article 73.',
    accent: 'emerald',
    detail: 'EU AI Act · NIST AI RMF · ISO/IEC 42001 · Vendor Risk · Incident Response',
  },
];

// Technique list — the specific skills covered across all three dojos
const TECHNIQUES = [
  'Prompt Injection (LLM01)',
  'Data Exfiltration (LLM02)',
  'Policy Bypass (LLM01/07)',
  'Tool Abuse (LLM07/08)',
  'RAG Injection (LLM01/09)',
  'SSH Brute Force',
  'WMI Lateral Movement',
  'C2 Beaconing',
  'Credential Dumping',
  'Supply Chain Compromise',
  'Cloud IAM Escalation',
  'Fileless Malware',
  'Ransomware Kill Chain',
  'Sigma/KQL Rule Gen',
  'EU AI Act Tiering',
  'ISO 42001 Controls',
  'Vendor Gap Analysis',
  'AI Red Teaming',
  'Adversarial ML',
  'Model Inversion',
];

// Cert badges shown on the landing page
const CERT_CHIPS = [
  { id: 'SecAI',       label: 'CompTIA SecAI+',          color: 'text-red-400 border-red-500/30' },
  { id: 'CAISP',       label: 'ISC2 CAISP',              color: 'text-purple-400 border-purple-500/30' },
  { id: 'CAIS',        label: 'EC-Council C|AI Security', color: 'text-rose-400 border-rose-500/30' },
  { id: 'GIAC-GOAA',   label: 'GIAC GOAA',               color: 'text-orange-400 border-orange-500/30' },
  { id: 'GIAC-GASAE',  label: 'GIAC GASAE',              color: 'text-orange-400 border-orange-500/30' },
  { id: 'SC-500',      label: 'Microsoft SC-500',         color: 'text-cyan-400 border-cyan-500/30' },
  { id: 'AWS-AIF-C01', label: 'AWS AIF-C01',             color: 'text-amber-400 border-amber-500/30' },
  { id: 'Azure-AI103', label: 'Azure AI-103',             color: 'text-blue-400 border-blue-500/30' },
  { id: 'Google-MLE',  label: 'Google MLE',              color: 'text-emerald-400 border-emerald-500/30' },
  { id: 'CISSP',       label: 'ISC2 CISSP',              color: 'text-sky-400 border-sky-500/30' },
  { id: 'CISM',        label: 'ISACA CISM',              color: 'text-teal-400 border-teal-500/30' },
  { id: 'Azure-AI901', label: 'Azure AI-901',             color: 'text-blue-400 border-blue-500/30' },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">

          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-5">
            AI Security Training · Free · No account
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-100 leading-[1.08] max-w-4xl">
            Attack LLMs. Defend against them.<br className="hidden md:block" /> Govern AI risk.
          </h1>

          <p className="mt-6 text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed">
            Three interactive dojos covering LLM attack vectors, AI-assisted SOC operations, and AI
            governance. Every scenario maps to OWASP LLM Top 10, MITRE ATT&amp;CK, and the exams the
            field is converging on — SecAI+, CAISP, GIAC GOAA, SC-500, and more.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dojo"
              className="px-5 py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-colors duration-150"
            >
              Enter the dojo →
            </Link>
            <Link
              href="/playbook"
              className="px-5 py-2.5 rounded border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-slate-100 font-medium text-sm transition-colors duration-150"
            >
              Open the playbook
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800 bg-slate-900/60">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <dl className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { n: STATS.scenarios,  label: 'scenarios' },
              { n: STATS.incidents,  label: 'prebuilt incidents' },
              { n: STATS.quizQs,    label: 'quiz questions' },
              { n: STATS.glossary,  label: 'glossary terms' },
              { n: STATS.articles,  label: 'topic articles' },
              { n: STATS.certs,     label: 'certs mapped' },
            ].map(({ n, label }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <dt className="text-2xl font-bold text-slate-100 font-mono tracking-tight">{n.toLocaleString()}</dt>
                <dd className="text-[11px] text-slate-500 leading-tight">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── What you'll practice ────────────────────────────────────────────── */}
      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-10">

            {/* Techniques */}
            <div>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-3">
                What you'll practice
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TECHNIQUES.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] font-mono px-2 py-0.5 rounded border border-slate-700 bg-slate-800/60 text-slate-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                Attack and defense techniques sourced from OWASP LLM Top 10, MITRE ATT&amp;CK,
                and real incident playbooks. No theoretical slides — type the attack and see which control stops it.
              </p>
            </div>

            {/* Cert coverage */}
            <div>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-3">
                Certification coverage ({STATS.certs} mapped)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CERT_CHIPS.map((c) => (
                  <span
                    key={c.id}
                    className={`text-[11px] font-mono px-2 py-0.5 rounded border ${c.color} bg-transparent`}
                  >
                    {c.label}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                Every dojo turn is tagged to exam domains. The playbook has {STATS.quizQs.toLocaleString()} practice
                questions, {STATS.glossary} glossary terms, and {STATS.articles} articles — all cross-referenced by cert.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Three dojos ─────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-2">
            Three dojos
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 mb-8">
            Pick a discipline. Load a scenario. Get scored.
          </h2>

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
                  </div>
                  <h3 className={['text-base font-semibold mb-2', accent.text].join(' ')}>
                    {d.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {d.summary}
                  </p>
                  <p className={['text-[10px] font-mono mb-3', accent.text, 'opacity-60'].join(' ')}>
                    {d.detail}
                  </p>
                  <ul className="mt-auto flex flex-col gap-1 border-t border-slate-800 pt-3">
                    {scenarios.map((s) => (
                      <li key={s.id} className="text-[11px] text-slate-500 flex gap-1.5 items-start">
                        <span className="text-slate-700 mt-px">·</span>
                        {s.title}
                      </li>
                    ))}
                  </ul>
                  <span
                    className={[
                      'mt-4 text-[11px] font-mono opacity-50 group-hover:opacity-100 transition-opacity duration-150',
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

      {/* ── How scoring works ───────────────────────────────────────────────── */}
      <section className="border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-2">
            Scoring model
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 mb-8">
            Deterministic in Dojo 1. Quality-rubric in Dojo 2 &amp; 3.
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/60">
              <p className="text-[10px] font-mono text-red-400 uppercase tracking-wide mb-2">Dojo 1 · Outcome engine</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Guardrail settings (Injection Shield · Strict Policy · Tools · RAG) deterministically
                decide whether each attack is <em>vulnerable</em>, <em>partial</em>, or <em>blocked</em>.
                Session score starts at 100 and decays as attacks land — chained attacks stack penalties.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/60">
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wide mb-2">Dojo 2 · Quality rubric</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Per-scenario regex rubrics score the AI&apos;s SOC analysis for IOC extraction,
                MITRE T-codes, executive summaries, detection rule structure, and confidence blocks.
                Disabled analyst controls are excluded from scoring.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/60">
              <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-wide mb-2">Dojo 3 · Framework rubric</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluator checks EU AI Act tier assignment, NIST AI RMF function references, ISO 42001
                control citations, and vendor gap coverage. Returns element-level coaching on each
                missing criterion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Playbook callout ────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                Playbook
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-slate-100 mb-4">
                Study the theory between scenarios.
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                The Playbook is a cross-referenced study library — every article, quiz question, and glossary
                term is tagged to the certs it covers, so you can filter by exam and study exactly what you need.
              </p>
              <Link
                href="/playbook"
                className="inline-block px-5 py-2.5 rounded border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-slate-100 font-medium text-sm transition-colors duration-150"
              >
                Open the playbook →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { n: STATS.quizQs.toLocaleString(),  label: 'quiz questions', sub: `across ${STATS.certs} certification maps` },
                { n: STATS.glossary,                  label: 'glossary terms', sub: 'with cert tags and related term links' },
                { n: STATS.articles,                  label: 'topic articles', sub: 'with inline code and tables' },
                { n: STATS.certs,                     label: 'cert maps', sub: 'with exam domains and difficulty' },
              ].map(({ n, label, sub }) => (
                <div key={label} className="p-4 rounded-lg border border-slate-800 bg-slate-900/40">
                  <div className="text-xl font-bold text-slate-100 font-mono">{n}</div>
                  <div className="text-xs font-medium text-slate-300 mt-0.5">{label}</div>
                  <div className="text-[11px] text-slate-600 mt-1 leading-tight">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Frameworks ──────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-4">
            Sourced from
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              'OWASP LLM Top 10 (2025)',
              'MITRE ATT&CK Enterprise',
              'NIST AI RMF 1.0',
              'ISO/IEC 42001',
              'EU AI Act',
              'CSA AI Controls Matrix',
              'NIST SP 800-218A (AI/ML Secure Dev)',
            ].map((f) => (
              <span key={f} className="text-xs font-mono text-slate-500">
                · {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-100">
                Ready to train?
              </h2>
              <p className="text-slate-400 mt-2 text-sm max-w-lg">
                Pick a dojo, run a scenario, watch the score and cert mapping update per turn.
                No setup, no account, no cost.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                href="/dojo"
                className="px-6 py-3 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-colors duration-150"
              >
                Enter the dojo →
              </Link>
              <Link
                href="/playbook"
                className="px-6 py-3 rounded border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-slate-100 font-medium text-sm transition-colors duration-150"
              >
                Study the playbook
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
