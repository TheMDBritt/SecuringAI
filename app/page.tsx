import Link from 'next/link';
import { getScenariosByDojo } from '@/lib/scenarios';
import { ACCENT, type AccentName } from '@/lib/dojo-theme';
import { Footer } from '@/components/layout/Footer';
import type { DojoId } from '@/types';

// ── Static counts — update when content changes ───────────────────────────────
const STATS = {
  scenarios:  51,
  quizQs:    1564,
  glossary:  819,
  articles:   76,
  certs:      10,
  incidents:  47,
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
    summary: 'Attack a live LLM under configurable guardrails across 28 scenarios — prompt injection, many-shot jailbreaks, GCG adversarial suffixes, RAG poisoning, agentic tool abuse, code interpreter injection, MCP server exploitation, sycophancy bypass, and semantic cache poisoning. Guardrail state deterministically decides each outcome.',
    accent: 'red',
    detail: 'Injection Shield · Strict Policy · Tool Access · RAG Sanitiser',
  },
  {
    id: 2,
    label: 'Dojo 2',
    title: 'AI-Assisted SOC',
    summary: 'Operate as an AI SOC analyst across 11 workflow types with 47 prebuilt incidents — log triage, alert enrichment, Sigma/KQL detection rules, IR drafting, adversarial prompt forensics, and AI model abuse investigation.',
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
  { label: 'Prompt Injection',           tag: 'LLM01',         dojo: 1 },
  { label: 'Insecure Output',            tag: 'LLM02',         dojo: 1 },
  { label: 'Training Data Poisoning',    tag: 'LLM03',         dojo: 1 },
  { label: 'Supply Chain Risk',          tag: 'LLM05',         dojo: 1 },
  { label: 'Sensitive Data Leak',        tag: 'LLM06',         dojo: 1 },
  { label: 'System Prompt Leakage',      tag: 'LLM07',         dojo: 1 },
  { label: 'Excessive Agency',           tag: 'LLM08',         dojo: 1 },
  { label: 'RAG / Vector Attacks',       tag: 'LLM09',         dojo: 1 },
  { label: 'Misinformation',             tag: 'LLM09:2025',    dojo: 1 },
  { label: 'Model Theft',                tag: 'LLM10',         dojo: 1 },
  { label: 'Indirect Injection',         tag: 'AML.T0054.001', dojo: 1 },
  { label: 'Model Inversion',            tag: 'AML.T0024',     dojo: 1 },
  { label: 'Vector DB Poisoning',        tag: 'LLM09:2025',    dojo: 1 },
  { label: 'Confused Deputy',            tag: 'LLM08',         dojo: 1 },
  { label: 'Embedding Inversion',        tag: 'AML.T0024',     dojo: 1 },
  { label: 'Log Triage',                 tag: 'SOC',           dojo: 2 },
  { label: 'Alert Enrichment',           tag: 'SOC',           dojo: 2 },
  { label: 'Sigma / KQL Gen',            tag: 'SecAI+',        dojo: 2 },
  { label: 'IR Report Drafting',         tag: 'SOC',           dojo: 2 },
  { label: 'AI SOAR Automation',         tag: 'GASAE',         dojo: 2 },
  { label: 'EU AI Act Risk Tier',        tag: 'Annex III',     dojo: 3 },
  { label: 'ISO 42001 Controls',         tag: 'GRC',           dojo: 3 },
  { label: 'Vendor Gap Analysis',        tag: 'GRC',           dojo: 3 },
  { label: 'NIST AI RMF Profile',        tag: 'GRC',           dojo: 3 },
  { label: 'AI Red Teaming',             tag: 'ATLAS',         dojo: 1 },
  { label: 'Many-Shot Jailbreak',        tag: 'LLM01',         dojo: 1 },
  { label: 'Crescendo Attack',           tag: 'Red Team',      dojo: 1 },
  { label: 'Backdoor / Trojan',          tag: 'AML.T0018',     dojo: 1 },
  { label: 'Semantic Cache Poisoning',   tag: 'LLM09:2025',    dojo: 1 },
  { label: 'Purview DSPM for AI',        tag: 'SC-500',        dojo: 3 },
  { label: 'Security Copilot KQL',       tag: 'SC-500',        dojo: 2 },
  { label: 'Context Window Overflow',    tag: 'LLM01:2025',    dojo: 1 },
  { label: 'Supply Chain Poisoning',     tag: 'LLM04:2025',    dojo: 1 },
  { label: 'Agent Forensics',            tag: 'AML.T0051',     dojo: 2 },
  { label: 'AI Continuous Monitoring',   tag: 'ISO 42001',     dojo: 3 },
  { label: 'MCP Server Security',        tag: 'LLM06:2025',    dojo: 1 },
  { label: 'Zero-Width Steganography',   tag: 'LLM01:2025',    dojo: 1 },
  { label: 'Markdown Rendering Attack',  tag: 'LLM02:2025',    dojo: 1 },
  { label: 'Token Exhaustion DoS',       tag: 'LLM10:2025',    dojo: 1 },
  { label: 'Hypothetical Framing',       tag: 'Red Team',      dojo: 1 },
  { label: 'Credential Harvesting',      tag: 'LLM06',         dojo: 1 },
  { label: 'PGD Adversarial Attack',     tag: 'AML.T0015',     dojo: 1 },
  { label: 'Membership Inference',       tag: 'AML.T0024',     dojo: 1 },
  { label: 'Spotlighting Defense',       tag: 'Defense',       dojo: 1 },
  { label: 'Code Interpreter Injection', tag: 'LLM08',         dojo: 1 },
  { label: 'Adversarial Prompt Forensics', tag: 'SOC',         dojo: 2 },
  { label: 'AI Model Abuse Triage',      tag: 'AML.T0040',     dojo: 2 },
  { label: 'PyRIT Red Teaming',          tag: 'SC-500',        dojo: 1 },
  { label: 'EU AI Act Art. 73 Report',   tag: 'EU AI Act',     dojo: 3 },
  { label: 'Sycophancy Exploitation',    tag: 'LLM01',         dojo: 1 },
  { label: 'MCP Server Injection',       tag: 'LLM08',         dojo: 1 },
  { label: 'Semantic Cache Poisoning',   tag: 'LLM09:2025',    dojo: 1 },
];

const CERT_CHIPS = [
  { id: 'SecAI',       label: 'CompTIA SecAI+',           color: 'text-red-400 border-red-500/30' },
  { id: 'CAISP',       label: 'CAISP',                    color: 'text-purple-400 border-purple-500/30' },
  { id: 'CAIS',        label: 'EC-Council C|AI Security',  color: 'text-rose-400 border-rose-500/30' },
  { id: 'GIAC-GOAA',   label: 'GIAC GOAA',                color: 'text-orange-400 border-orange-500/30' },
  { id: 'GIAC-GASAE',  label: 'GIAC GASAE',               color: 'text-orange-400 border-orange-500/30' },
  { id: 'SC-500',      label: 'Microsoft SC-500',          color: 'text-cyan-400 border-cyan-500/30' },
  { id: 'AWS-AIF-C01', label: 'AWS AIF-C01',              color: 'text-amber-400 border-amber-500/30' },
  { id: 'Azure-AI103', label: 'Azure AI-103',              color: 'text-blue-400 border-blue-500/30' },
  { id: 'Azure-AI901', label: 'Azure AI-901',              color: 'text-blue-400 border-blue-500/30' },
  { id: 'Google-MLE',  label: 'Google MLE',               color: 'text-emerald-400 border-emerald-500/30' },
];

const SOURCED_FROM = [
  'OWASP LLM Top 10 (2025)',
  'MITRE ATT&CK + ATLAS',
  'NIST AI RMF 1.0',
  'ISO/IEC 42001:2023',
  'EU AI Act (2024)',
  'CSA AI Controls Matrix',
  'NIST SP 800-218A',
  'NIST AI 100-1',
  'GIAC GOAA / GASAE Syllabi',
  'CompTIA SecurityAI+ Objectives',
  'EC-Council C|AI Security Outline',
  'Microsoft SC-500 Study Guide',
  'AWS AI Practitioner Exam Guide',
  'Google Professional ML Engineer Guide',
];

// ── Scoring rows for the scoring table ────────────────────────────────────────
const SCORING_ROWS = [
  {
    dojo: 'Dojo 1',
    color: 'text-red-400',
    engine: 'Outcome engine',
    how: 'Guardrail config (Injection Shield, Strict Policy, Tools, RAG) deterministically produces vulnerable / partial / blocked per turn. Session score starts at 100 and decays on each successful attack; chained attacks stack penalties.',
    maps: 'OWASP LLM Top 10 · MITRE ATLAS',
  },
  {
    dojo: 'Dojo 2',
    color: 'text-cyan-400',
    engine: 'Quality rubric',
    how: 'Per-scenario regex rubrics score IOC extraction, MITRE T-codes, executive summaries, detection rule structure, and confidence blocks. Disabled analyst controls are excluded from scoring.',
    maps: 'MITRE ATT&CK · SecAI+ · GIAC GASAE',
  },
  {
    dojo: 'Dojo 3',
    color: 'text-emerald-400',
    engine: 'Framework rubric',
    how: 'Evaluator checks EU AI Act tier assignment, NIST AI RMF function references, ISO 42001 control citations, and vendor gap coverage — returns per-element coaching on missing criteria.',
    maps: 'EU AI Act · ISO 42001 · NIST AI RMF',
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
          <div className="grid md:grid-cols-5 gap-8 md:gap-14 items-start">
            {/* Left — headline */}
            <div className="md:col-span-3">
              <div className="inline-flex items-center gap-2 mb-5 px-2.5 py-1 rounded border border-slate-700 bg-slate-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Free · Open access</span>
              </div>
              <h1 className="text-[36px] md:text-[48px] font-bold tracking-tight text-slate-100 leading-[1.08]">
                Attack LLMs.<br />
                Defend against them.<br />
                Govern AI risk.
              </h1>
              <p className="mt-5 text-[15px] text-slate-400 max-w-[480px] leading-relaxed">
                Three practice disciplines. Attack a live LLM under configurable guardrails, triage
                AI-augmented SOC incidents, and classify EU AI Act risk scenarios — every turn scored
                and mapped to {STATS.certs} cert exam domains, OWASP LLM Top 10, and MITRE ATLAS.
                {' '}{STATS.quizQs.toLocaleString()} quiz questions across {STATS.certs} certs, {STATS.glossary} glossary terms.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 items-center">
                <Link
                  href="/dojo"
                  className="px-5 py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors duration-150"
                >
                  Enter the dojo →
                </Link>
                <Link
                  href="/playbook"
                  className="px-5 py-2.5 rounded border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-slate-100 font-medium text-sm transition-colors duration-150"
                >
                  Study the playbook
                </Link>
              </div>
              {/* Quick framework tags */}
              <div className="mt-6 flex flex-wrap gap-1.5">
                {['OWASP LLM Top 10', 'MITRE ATLAS', 'NIST AI RMF', 'EU AI Act', 'ISO 42001'].map((f) => (
                  <span key={f} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-700 text-slate-600">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — stats + terminal */}
            <div className="md:col-span-2">
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-px bg-slate-800 border border-slate-800 rounded-lg overflow-hidden mb-3">
                {[
                  { n: STATS.quizQs.toLocaleString(), label: 'quiz questions',  sub: `${STATS.certs} certs mapped` },
                  { n: STATS.scenarios,               label: 'dojo scenarios',  sub: '3 disciplines' },
                  { n: STATS.glossary,                label: 'glossary terms',  sub: 'A–Z, cert-filtered' },
                  { n: STATS.articles,                label: 'topic articles',  sub: 'code + tables' },
                  { n: STATS.incidents,               label: 'SOC incidents',   sub: 'Dojo 2 prebuilt' },
                  { n: STATS.certs,                   label: 'certs mapped',    sub: 'official domains' },
                ].map(({ n, label, sub }) => (
                  <div key={label} className="bg-slate-900 px-4 py-3.5">
                    <div className="text-2xl font-bold text-slate-100 font-mono tracking-tight">{n}</div>
                    <div className="text-xs font-medium text-slate-300 mt-0.5">{label}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>
                  </div>
                ))}
              </div>
              {/* Terminal */}
              <div className="px-3 py-2.5 rounded border border-slate-800 bg-slate-950 font-mono text-[11px] leading-relaxed">
                <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-slate-700" />
                  <span className="w-2 h-2 rounded-full bg-slate-700" />
                  <span className="w-2 h-2 rounded-full bg-slate-700" />
                  <span className="text-slate-600 ml-1 text-[10px]">dojo-1 · session</span>
                </div>
                <div className="text-slate-500">
                  <span className="text-slate-700">$ </span>
                  <span className="text-cyan-400">dojo</span>
                  <span className="text-slate-400"> load prompt-injection --shield strict</span>
                </div>
                <div className="mt-1 text-slate-500">
                  <span className="text-slate-700">→ </span>
                  <span className="text-emerald-400">BLOCKED</span>
                  <span className="text-slate-600"> [LLM01:2025] score 100 · shield triggered</span>
                </div>
                <div className="mt-1 text-slate-500">
                  <span className="text-slate-700">$ </span>
                  <span className="text-cyan-400">dojo</span>
                  <span className="text-slate-400"> load many-shot-jailbreak --shield off</span>
                </div>
                <div className="mt-1 text-slate-500">
                  <span className="text-slate-700">→ </span>
                  <span className="text-red-400">VULNERABLE</span>
                  <span className="text-slate-600"> [LLM01:2025] session −22 · AML.T0054</span>
                </div>
                <div className="mt-1 text-slate-500">
                  <span className="text-slate-700">$ </span>
                  <span className="text-cyan-400">quiz</span>
                  <span className="text-slate-400"> start GIAC-GOAA --domain d4 --count 25</span>
                </div>
                <div className="mt-1 text-slate-500">
                  <span className="text-slate-700">→ </span>
                  <span className="text-violet-400">STARTED</span>
                  <span className="text-slate-600"> Prompt Injection &amp; LLM Bypass · 25q</span>
                </div>
                <div className="mt-1 text-slate-500">
                  <span className="text-slate-700">$ </span>
                  <span className="text-cyan-400">quiz</span>
                  <span className="text-slate-400"> start SC-500 --domain d5 --mock</span>
                </div>
                <div className="mt-1 text-slate-500">
                  <span className="text-slate-700">→ </span>
                  <span className="text-violet-400">MOCK</span>
                  <span className="text-slate-600"> Secure AI Workloads · 60q · 100min</span>
                </div>
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
                    {scenarios.slice(0, 7).map((s) => (
                      <li key={s.id} className="text-[11px] text-slate-500 flex gap-1.5 items-start">
                        <span className="text-slate-700 mt-px shrink-0">·</span>
                        {s.title}
                      </li>
                    ))}
                    {scenarios.length > 7 && (
                      <li className="text-[11px] text-slate-600 flex gap-1.5 items-start">
                        <span className="text-slate-700 mt-px shrink-0">·</span>
                        +{scenarios.length - 7} more
                      </li>
                    )}
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

      {/* ── Scoring table ─────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="mb-6">
            <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-1">
              How scoring works
            </p>
            <h2 className="text-lg font-bold text-slate-100">
              Deterministic in Dojo 1. Quality-rubric in Dojo 2 &amp; 3.
            </h2>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-2.5 text-[10px] font-mono text-slate-600 uppercase tracking-widest w-24">Dojo</th>
                  <th className="px-4 py-2.5 text-[10px] font-mono text-slate-600 uppercase tracking-widest w-36">Engine</th>
                  <th className="px-4 py-2.5 text-[10px] font-mono text-slate-600 uppercase tracking-widest">How it scores</th>
                  <th className="px-4 py-2.5 text-[10px] font-mono text-slate-600 uppercase tracking-widest hidden md:table-cell">Framework</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {SCORING_ROWS.map((row) => (
                  <tr key={row.dojo} className="hover:bg-slate-800/30 transition-colors duration-100">
                    <td className="px-4 py-3">
                      <span className={`font-mono font-semibold ${row.color}`}>{row.dojo}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">{row.engine}</td>
                    <td className="px-4 py-3 text-slate-400 leading-relaxed max-w-xs">{row.how}</td>
                    <td className="px-4 py-3 font-mono text-slate-600 text-[10px] hidden md:table-cell">{row.maps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                {TECHNIQUES.length} attack &amp; defense techniques
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TECHNIQUES.map((t) => (
                  <span
                    key={t.label}
                    className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 bg-slate-800/60 text-slate-400"
                  >
                    {t.label}
                    <span className="text-slate-600">·</span>
                    <span className={
                      t.dojo === 1 ? 'text-red-500/70' :
                      t.dojo === 2 ? 'text-cyan-500/70' :
                      'text-emerald-500/70'
                    }>{t.tag}</span>
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                Sourced from OWASP LLM Top 10 (2025), MITRE ATT&amp;CK + ATLAS, and official exam study guides.
                Each tag maps to the framework reference — type the attack and see which guardrail decides the outcome.
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

      {/* ── Playbook callout ──────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                Playbook
              </p>
              <h2 className="text-xl font-bold text-slate-100 mb-3">
                {STATS.quizQs.toLocaleString()} questions across {STATS.certs} certs. Drill by domain.
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Every article, quiz question, and glossary term is tagged to its cert exam domain.
                Select a cert, choose which domains to drill, set difficulty and question count —
                results show per-domain breakdown so you know exactly where to focus.
              </p>
              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/40 mb-5">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Quiz flow — exam first</p>
                <ol className="text-xs text-slate-400 space-y-1 leading-relaxed">
                  <li><span className="font-mono text-slate-700 mr-2">01</span>Select a cert (SecAI+, SC-500, GIAC-GOAA…)</li>
                  <li><span className="font-mono text-slate-700 mr-2">02</span>Pick domains from that exam&apos;s official objectives</li>
                  <li><span className="font-mono text-slate-700 mr-2">03</span>Configure difficulty · question count · mock exam mode</li>
                  <li><span className="font-mono text-slate-700 mr-2">04</span>Get per-domain score breakdown + weak area targeting</li>
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
                { n: STATS.quizQs.toLocaleString(), label: 'quiz questions',  sub: `across ${STATS.certs} certs, mapped to exam domains` },
                { n: STATS.glossary,                label: 'glossary terms',  sub: 'cert-tagged, A–Z filterable by cert' },
                { n: STATS.articles,                label: 'topic articles',  sub: 'with code examples and comparison tables' },
                { n: STATS.certs,                   label: 'cert maps',       sub: 'official exam objectives + domain weights' },
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
      <section className="border-b border-slate-800 bg-slate-900/30">
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
      <section>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="border border-slate-800 rounded-lg p-6 md:p-8 bg-slate-900/30">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="text-xl md:text-2xl font-bold text-slate-100">
                  Run your first attack in under a minute.
                </h2>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                  Load a scenario, submit an attack, read the score. Guardrail configuration
                  decides the outcome — same payload, same config, same result every time.
                  Free and open — no signup, no tracking.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Dojo 1', sub: '28 attack scenarios',   color: 'text-red-400' },
                    { label: 'Dojo 2', sub: `${STATS.incidents} SOC incidents`, color: 'text-cyan-400' },
                    { label: 'Dojo 3', sub: '13 GRC scenarios',    color: 'text-emerald-400' },
                  ].map((d) => (
                    <div key={d.label} className="border border-slate-800 rounded px-3 py-2">
                      <div className={`text-[11px] font-mono font-semibold ${d.color}`}>{d.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{d.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Link
                  href="/dojo"
                  className="px-6 py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors duration-150 text-center"
                >
                  Enter the dojo →
                </Link>
                <Link
                  href="/playbook"
                  className="px-6 py-2.5 rounded border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-slate-100 font-medium text-sm transition-colors duration-150 text-center"
                >
                  Study the playbook
                </Link>
                <Link
                  href="/about"
                  className="px-6 py-2.5 text-center text-[11px] font-mono text-slate-600 hover:text-slate-400 transition-colors duration-150"
                >
                  How scoring works →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
