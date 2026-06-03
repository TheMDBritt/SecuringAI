import Link from 'next/link';
import { getScenariosByDojo } from '@/lib/scenarios';
import { ACCENT, type AccentName } from '@/lib/dojo-theme';
import { Footer } from '@/components/layout/Footer';
import type { DojoId } from '@/types';

// ── Static counts — update when content changes ───────────────────────────────
const STATS = {
  scenarios:  14,
  quizQs:    693,
  glossary:  367,
  articles:   64,
  certs:      12,
  incidents:  21,
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
    summary: 'Attack a live LLM under configurable guardrails. Guardrail state deterministically decides whether each payload lands as vulnerable, partial, or blocked.',
    accent: 'red',
    detail: 'Injection Shield · Strict Policy · Tool Access · RAG Sanitiser',
  },
  {
    id: 2,
    label: 'Dojo 2',
    title: 'AI-Assisted SOC',
    summary: 'Operate as an AI SOC analyst across 21 prebuilt incidents — log triage, alert enrichment, Sigma/KQL detection rule generation, and IR report drafting.',
    accent: 'cyan',
    detail: 'Log Triage · Alert Enrichment · Detection Rule Gen · IR Report',
  },
  {
    id: 3,
    label: 'Dojo 3',
    title: 'AI GRC',
    summary: 'Govern AI deployments: classify under EU AI Act risk tiers, draft ISO 42001 controls, run vendor reviews, and investigate model failures under Article 73.',
    accent: 'emerald',
    detail: 'EU AI Act · NIST AI RMF · ISO/IEC 42001 · Vendor Risk',
  },
];

const TECHNIQUES = [
  'Prompt Injection (LLM01)',
  'Insecure Output Handling (LLM02)',
  'Training Data Poisoning (LLM03)',
  'Model Denial of Service (LLM04)',
  'Supply Chain Risk (LLM05)',
  'Sensitive Data Disclosure (LLM06)',
  'System Prompt Leakage (LLM07)',
  'Excessive Agency (LLM08)',
  'Vector & Embedding Attacks (LLM09)',
  'Model Theft (LLM10)',
  'SSH Brute Force',
  'WMI Lateral Movement',
  'C2 Beaconing',
  'Credential Dumping',
  'Cloud IAM Escalation',
  'Fileless Malware',
  'Ransomware Kill Chain',
  'Sigma/KQL Rule Generation',
  'EU AI Act Risk Tiering',
  'ISO 42001 Controls',
  'Vendor Gap Analysis',
  'AI Red Teaming (MITRE ATLAS)',
  'Adversarial ML',
  'Model Inversion & Extraction',
];

const CERT_CHIPS = [
  { id: 'SecAI',       label: 'CompTIA SecAI+',           color: 'text-red-400 border-red-500/30' },
  { id: 'CAISP',       label: 'ISC2 CAISP',               color: 'text-purple-400 border-purple-500/30' },
  { id: 'CAIS',        label: 'EC-Council C|AI Security',  color: 'text-rose-400 border-rose-500/30' },
  { id: 'GIAC-GOAA',   label: 'GIAC GOAA',                color: 'text-orange-400 border-orange-500/30' },
  { id: 'GIAC-GASAE',  label: 'GIAC GASAE',               color: 'text-orange-400 border-orange-500/30' },
  { id: 'SC-500',      label: 'Microsoft SC-500',          color: 'text-cyan-400 border-cyan-500/30' },
  { id: 'AWS-AIF-C01', label: 'AWS AIF-C01',              color: 'text-amber-400 border-amber-500/30' },
  { id: 'Azure-AI103', label: 'Azure AI-103',              color: 'text-blue-400 border-blue-500/30' },
  { id: 'Azure-AI901', label: 'Azure AI-901',              color: 'text-blue-400 border-blue-500/30' },
  { id: 'Google-MLE',  label: 'Google MLE',               color: 'text-emerald-400 border-emerald-500/30' },
  { id: 'CISSP',       label: 'ISC2 CISSP',               color: 'text-sky-400 border-sky-500/30' },
  { id: 'CISM',        label: 'ISACA CISM',               color: 'text-teal-400 border-teal-500/30' },
];

const SOURCED_FROM = [
  'OWASP LLM Top 10 (2025)',
  'MITRE ATT&CK + ATLAS',
  'NIST AI RMF 1.0',
  'ISO/IEC 42001',
  'EU AI Act (2024)',
  'CSA AI Controls Matrix',
  'NIST SP 800-218A',
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-14 md:py-20">
          <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-start">
            {/* Left — headline */}
            <div className="md:col-span-3">
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-4">
                AI Security Training · Free · No account required
              </p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-100 leading-[1.08]">
                Attack LLMs.<br />Defend against them.<br />Govern AI risk.
              </h1>
              <p className="mt-5 text-base text-slate-400 max-w-xl leading-relaxed">
                Three interactive dojos spanning LLM attack techniques, AI-assisted SOC work, and
                AI governance — scored against OWASP LLM Top 10, MITRE ATT&amp;CK, and the 12
                AI security certifications the field is converging on.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
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

            {/* Right — live stats grid */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-2 gap-px bg-slate-800 border border-slate-800 rounded-lg overflow-hidden">
                {[
                  { n: STATS.quizQs.toLocaleString(), label: 'quiz questions', sub: `across ${STATS.certs} certs` },
                  { n: STATS.scenarios,               label: 'dojo scenarios', sub: '3 disciplines' },
                  { n: STATS.glossary,                label: 'glossary terms', sub: 'cert-tagged' },
                  { n: STATS.articles,                label: 'topic articles', sub: 'with code + tables' },
                  { n: STATS.incidents,               label: 'SOC incidents',  sub: 'prebuilt Dojo 2' },
                  { n: STATS.certs,                   label: 'certs mapped',   sub: 'official domains' },
                ].map(({ n, label, sub }) => (
                  <div key={label} className="bg-slate-900 px-4 py-4">
                    <div className="text-2xl font-bold text-slate-100 font-mono tracking-tight">{n}</div>
                    <div className="text-xs font-medium text-slate-300 mt-0.5">{label}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Three dojos ──────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-baseline justify-between mb-7">
            <div>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                Three disciplines
              </p>
              <h2 className="text-xl font-bold text-slate-100">
                Pick a scenario. Run it. Get scored.
              </h2>
            </div>
            <Link
              href="/dojo"
              className="hidden md:inline-block text-[11px] font-mono text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded transition-colors"
            >
              Open dojo →
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
                  </div>
                  <h3 className={['text-sm font-semibold mb-2', accent.text].join(' ')}>
                    {d.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3 flex-1">
                    {d.summary}
                  </p>
                  <p className={['text-[10px] font-mono mb-4', accent.text, 'opacity-60'].join(' ')}>
                    {d.detail}
                  </p>
                  <ul className="flex flex-col gap-1 border-t border-slate-800 pt-3">
                    {scenarios.map((s) => (
                      <li key={s.id} className="text-[11px] text-slate-500 flex gap-1.5 items-start">
                        <span className="text-slate-700 mt-px shrink-0">·</span>
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

      {/* ── Playbook + technique tags ─────────────────────────────────────────── */}
      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-10">

            {/* Technique tags */}
            <div>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-3">
                Attack &amp; defense techniques
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
                Sourced from OWASP LLM Top 10, MITRE ATT&amp;CK, and real incident playbooks.
                Type the attack — see exactly which control stops it.
              </p>
            </div>

            {/* Cert tags */}
            <div>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-3">
                {STATS.certs} certifications mapped
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
                Every dojo turn maps to exam domains. Quiz: select a cert,
                drill by domain, track weak areas. {STATS.quizQs.toLocaleString()} questions, {STATS.glossary} glossary terms,
                {' '}{STATS.articles} articles — all cross-referenced by cert.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Scoring model ────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                Scoring
              </p>
              <h2 className="text-lg font-bold text-slate-100">
                Deterministic in Dojo 1. Quality-rubric in Dojo 2 &amp; 3.
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/60">
              <p className="text-[10px] font-mono text-red-400 uppercase tracking-wide mb-2">Dojo 1 · Outcome engine</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Guardrail config (Injection Shield · Strict Policy · Tools · RAG) deterministically
                decides <em>vulnerable</em>, <em>partial</em>, or <em>blocked</em> for each turn.
                Session score starts at 100 and decays as attacks land — chained attacks stack penalties.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/60">
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wide mb-2">Dojo 2 · Quality rubric</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Per-scenario regex rubrics score the AI analyst for IOC extraction,
                MITRE T-codes, executive summaries, detection rule structure, and confidence blocks.
                Disabled analyst controls are excluded from scoring.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/60">
              <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-wide mb-2">Dojo 3 · Framework rubric</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluator checks EU AI Act tier assignment, NIST AI RMF function references,
                ISO 42001 control citations, and vendor gap coverage — returns per-element
                coaching on missing criteria.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Playbook callout ──────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                Playbook
              </p>
              <h2 className="text-xl font-bold text-slate-100 mb-3">
                Study between scenarios.
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                The Playbook is a cross-referenced study library. Every article, quiz question,
                and glossary term is tagged to its cert domains — filter by exam, drill the
                weak areas, study exactly what matters for your target cert.
              </p>
              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/40 mb-5">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Quiz flow</p>
                <ol className="text-xs text-slate-400 space-y-1 leading-relaxed">
                  <li><span className="font-mono text-slate-600 mr-2">1.</span>Pick a cert</li>
                  <li><span className="font-mono text-slate-600 mr-2">2.</span>Select exam domains</li>
                  <li><span className="font-mono text-slate-600 mr-2">3.</span>Set difficulty + count</li>
                  <li><span className="font-mono text-slate-600 mr-2">4.</span>See per-domain score breakdown</li>
                </ol>
              </div>
              <Link
                href="/playbook"
                className="inline-block px-5 py-2.5 rounded border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-slate-100 font-medium text-sm transition-colors duration-150"
              >
                Open the playbook →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { n: STATS.quizQs.toLocaleString(), label: 'quiz questions',  sub: `across ${STATS.certs} certs, drill by domain` },
                { n: STATS.glossary,                label: 'glossary terms',  sub: 'cert-tagged with related links' },
                { n: STATS.articles,                label: 'topic articles',  sub: 'with inline code and tables' },
                { n: STATS.certs,                   label: 'cert maps',       sub: 'official domains + question counts' },
              ].map(({ n, label, sub }) => (
                <div key={label} className="p-4 rounded-lg border border-slate-800 bg-slate-900/40">
                  <div className="text-xl font-bold text-slate-100 font-mono">{n}</div>
                  <div className="text-xs font-medium text-slate-300 mt-0.5">{label}</div>
                  <div className="text-[10px] text-slate-600 mt-1 leading-tight">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Sources ──────────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <p className="text-[11px] font-mono text-slate-600 uppercase tracking-widest mb-3">
            Sourced from
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            {SOURCED_FROM.map((f) => (
              <span key={f} className="text-[11px] font-mono text-slate-500">
                · {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-100">
                No setup. No account. No cost.
              </h2>
              <p className="text-slate-400 mt-2 text-sm max-w-lg">
                Pick a dojo, load a scenario, watch the score and cert mapping update per turn.
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
