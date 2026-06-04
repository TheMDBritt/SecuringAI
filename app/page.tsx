import Link from 'next/link';
import { getScenariosByDojo } from '@/lib/scenarios';
import { ACCENT, type AccentName } from '@/lib/dojo-theme';
import { Footer } from '@/components/layout/Footer';
import type { DojoId } from '@/types';

const STATS = {
  scenarios:  27,
  quizQs:   1000,
  glossary:  540,
  articles:   64,
  certs:      10,
  incidents:  35,
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
    summary: 'Operate as an AI SOC analyst across 35 prebuilt incidents — log triage, alert enrichment, Sigma/KQL detection rule generation, IR report drafting, and AI system compromise triage.',
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
  { label: 'Prompt Injection',       tag: 'LLM01',       dojo: 1 },
  { label: 'Insecure Output',        tag: 'LLM02',       dojo: 1 },
  { label: 'Training Data Poisoning',tag: 'LLM03',       dojo: 1 },
  { label: 'Supply Chain Risk',      tag: 'LLM05',       dojo: 1 },
  { label: 'Sensitive Data Leak',    tag: 'LLM06',       dojo: 1 },
  { label: 'System Prompt Leakage',  tag: 'LLM07',       dojo: 1 },
  { label: 'Excessive Agency',       tag: 'LLM08',       dojo: 1 },
  { label: 'RAG / Vector Attacks',   tag: 'LLM09',       dojo: 1 },
  { label: 'Model Theft',            tag: 'LLM10',       dojo: 1 },
  { label: 'Indirect Injection',     tag: 'AML.T0054.001', dojo: 1 },
  { label: 'Model Inversion',        tag: 'AML.T0024',   dojo: 1 },
  { label: 'Log Triage',             tag: 'SOC',         dojo: 2 },
  { label: 'Alert Enrichment',       tag: 'SOC',         dojo: 2 },
  { label: 'Sigma / KQL Gen',        tag: 'SecAI+',      dojo: 2 },
  { label: 'IR Report Drafting',     tag: 'SOC',         dojo: 2 },
  { label: 'EU AI Act Risk Tier',    tag: 'Annex III',   dojo: 3 },
  { label: 'ISO 42001 Controls',     tag: 'GRC',         dojo: 3 },
  { label: 'Vendor Gap Analysis',    tag: 'GRC',         dojo: 3 },
  { label: 'AI Red Teaming',         tag: 'ATLAS',       dojo: 1 },
  { label: 'Many-Shot Jailbreak',    tag: 'LLM01',       dojo: 1 },
  { label: 'Crescendo Attack',       tag: 'Red Team',    dojo: 1 },
  { label: 'Backdoor / Trojan',      tag: 'AML.T0018',   dojo: 1 },
  { label: 'Purview DSPM for AI',    tag: 'SC-500',      dojo: 3 },
  { label: 'Security Copilot KQL',   tag: 'SC-500',      dojo: 2 },
];

const CERT_CHIPS = [
  { id: 'SecAI',       label: 'CompTIA SecAI+',          color: 'text-red-400 border-red-500/30' },
  { id: 'CAISP',       label: 'ISC2 CAISP',              color: 'text-purple-400 border-purple-500/30' },
  { id: 'CAIS',        label: 'EC-Council C|AI Security', color: 'text-rose-400 border-rose-500/30' },
  { id: 'GIAC-GOAA',   label: 'GIAC GOAA',               color: 'text-orange-400 border-orange-500/30' },
  { id: 'GIAC-GASAE',  label: 'GIAC GASAE',              color: 'text-orange-400 border-orange-500/30' },
  { id: 'SC-500',      label: 'Microsoft SC-500',         color: 'text-cyan-400 border-cyan-500/30' },
  { id: 'AWS-AIF-C01', label: 'AWS AIF-C01',             color: 'text-amber-400 border-amber-500/30' },
  { id: 'Azure-AI103', label: 'Azure AI-103',             color: 'text-blue-400 border-blue-500/30' },
  { id: 'Azure-AI901', label: 'Azure AI-901',             color: 'text-blue-400 border-blue-500/30' },
  { id: 'Google-MLE',  label: 'Google MLE',              color: 'text-emerald-400 border-emerald-500/30' },
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
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-12">

          {/* Top status bar */}
          <div className="flex items-center gap-3 mb-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-800 bg-slate-900">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Free · No login · No API key</span>
            </div>
            <div className="h-3 w-px bg-slate-800" />
            <span className="text-[10px] font-mono text-slate-600">{STATS.quizQs.toLocaleString()}+ questions · {STATS.certs} certs · {STATS.scenarios} scenarios</span>
          </div>

          <div className="grid md:grid-cols-[1fr_380px] gap-12 items-start">
            {/* Left */}
            <div>
              <h1 className="text-[40px] md:text-[52px] font-bold tracking-tight text-slate-100 leading-[1.06] mb-5">
                Attack LLMs.<br />
                Defend against them.<br />
                <span className="text-slate-400">Govern AI risk.</span>
              </h1>
              <p className="text-[15px] text-slate-400 max-w-[500px] leading-relaxed mb-8">
                Three interactive dojos. Run prompt injection against live guardrails, triage real
                SOC incidents with AI, and classify EU AI Act risk tiers — every turn scored and
                mapped to {STATS.certs} AI security certifications.
              </p>

              <div className="flex flex-wrap gap-3 items-center mb-8">
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

              {/* Framework tags */}
              <div className="flex flex-wrap gap-1.5">
                {['OWASP LLM Top 10', 'MITRE ATLAS', 'NIST AI RMF', 'EU AI Act', 'ISO 42001'].map((f) => (
                  <span key={f} className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-800 text-slate-600">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — stats + terminal */}
            <div className="space-y-3">
              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-px bg-slate-800 border border-slate-800 rounded-lg overflow-hidden">
                {[
                  { n: `${STATS.quizQs.toLocaleString()}+`, label: 'questions', sub: `${STATS.certs} certs` },
                  { n: STATS.scenarios,                      label: 'scenarios',  sub: '3 disciplines' },
                  { n: `${STATS.glossary}+`,                 label: 'glossary',   sub: 'cert-tagged' },
                ].map(({ n, label, sub }) => (
                  <div key={label} className="bg-slate-900 px-3 py-3">
                    <div className="text-xl font-bold text-slate-100 font-mono tracking-tight">{n}</div>
                    <div className="text-[10px] font-medium text-slate-400 mt-0.5">{label}</div>
                    <div className="text-[9px] text-slate-600 mt-0.5">{sub}</div>
                  </div>
                ))}
              </div>

              {/* Terminal */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-800 bg-slate-900/50">
                  <span className="w-2 h-2 rounded-full bg-slate-700" />
                  <span className="w-2 h-2 rounded-full bg-slate-700" />
                  <span className="w-2 h-2 rounded-full bg-slate-700" />
                  <span className="text-slate-600 ml-1 text-[10px] font-mono">dojo-1 · session</span>
                </div>
                <div className="px-4 py-3 font-mono text-[11px] leading-[1.8] space-y-0.5">
                  <div>
                    <span className="text-slate-700">$ </span>
                    <span className="text-cyan-400">attack</span>
                    <span className="text-slate-500"> --type prompt-injection --guardrails strict</span>
                  </div>
                  <div>
                    <span className="text-slate-700">→ </span>
                    <span className="text-red-400 font-semibold">BLOCKED</span>
                    <span className="text-slate-600"> · LLM01 · turn 100/100</span>
                  </div>
                  <div>
                    <span className="text-slate-700">$ </span>
                    <span className="text-cyan-400">attack</span>
                    <span className="text-slate-500"> --type policy-bypass --guardrails off</span>
                  </div>
                  <div>
                    <span className="text-slate-700">→ </span>
                    <span className="text-amber-400 font-semibold">VULNERABLE</span>
                    <span className="text-slate-600"> · LLM01 · session −15pts</span>
                  </div>
                  <div>
                    <span className="text-slate-700">$ </span>
                    <span className="text-cyan-400">attack</span>
                    <span className="text-slate-500"> --type indirect-injection --rag enabled</span>
                  </div>
                  <div>
                    <span className="text-slate-700">→ </span>
                    <span className="text-amber-400 font-semibold">PARTIAL</span>
                    <span className="text-slate-600"> · AML.T0054.001 · session −8pts</span>
                  </div>
                  <div className="pt-1 border-t border-slate-800/60">
                    <span className="text-slate-600">session score </span>
                    <span className="text-slate-300 font-bold">77</span>
                    <span className="text-slate-600"> / 100 · mapped: LLM01 LLM09</span>
                  </div>
                </div>
              </div>

              {/* Cert chips */}
              <div className="flex flex-wrap gap-1">
                {CERT_CHIPS.map((c) => (
                  <span
                    key={c.id}
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${c.color} bg-transparent opacity-70`}
                  >
                    {c.id}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Three dojos ──────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-1">Three disciplines</p>
              <h2 className="text-lg font-bold text-slate-100">Pick a scenario. Run it. Get scored.</h2>
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
                    'group flex flex-col p-5 rounded-lg border bg-slate-900/30 hover:bg-slate-900/60 transition-colors duration-150',
                    accent.border,
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={['text-[10px] font-mono px-2 py-0.5 rounded', accent.bg, accent.text].join(' ')}>
                      {d.label}
                    </span>
                    <span className={['text-[10px] font-mono opacity-40', accent.text].join(' ')}>
                      {scenarios.length} scenarios
                    </span>
                  </div>
                  <h3 className={['text-sm font-semibold mb-2', accent.text].join(' ')}>
                    {d.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3 flex-1">
                    {d.summary}
                  </p>
                  <p className={['text-[10px] font-mono mb-4 opacity-50', accent.text].join(' ')}>
                    {d.detail}
                  </p>
                  <ul className="flex flex-col gap-0.5 border-t border-slate-800 pt-3">
                    {scenarios.slice(0, 6).map((s) => (
                      <li key={s.id} className="text-[11px] text-slate-500 flex gap-1.5 items-start">
                        <span className="text-slate-700 mt-px shrink-0">·</span>
                        {s.title}
                      </li>
                    ))}
                    {scenarios.length > 6 && (
                      <li className="text-[11px] text-slate-700 pl-3">
                        +{scenarios.length - 6} more
                      </li>
                    )}
                  </ul>
                  <span className={['mt-4 text-[11px] font-mono opacity-40 group-hover:opacity-100 transition-opacity', accent.text].join(' ')}>
                    Open {d.label} →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Scoring ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800 bg-slate-900/20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="mb-5">
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-1">How scoring works</p>
            <h2 className="text-base font-bold text-slate-100">Deterministic in Dojo 1. Quality-rubric in Dojo 2 &amp; 3.</h2>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40">
                  <th className="px-4 py-2 text-[10px] font-mono text-slate-600 uppercase tracking-widest w-20">Dojo</th>
                  <th className="px-4 py-2 text-[10px] font-mono text-slate-600 uppercase tracking-widest w-32">Engine</th>
                  <th className="px-4 py-2 text-[10px] font-mono text-slate-600 uppercase tracking-widest">Scoring logic</th>
                  <th className="px-4 py-2 text-[10px] font-mono text-slate-600 uppercase tracking-widest hidden md:table-cell">Framework</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {SCORING_ROWS.map((row) => (
                  <tr key={row.dojo} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`font-mono font-semibold text-[11px] ${row.color}`}>{row.dojo}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 text-[10px]">{row.engine}</td>
                    <td className="px-4 py-3 text-slate-400 leading-relaxed text-[11px] max-w-xs">{row.how}</td>
                    <td className="px-4 py-3 font-mono text-slate-600 text-[10px] hidden md:table-cell">{row.maps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Techniques + Certs ───────────────────────────────────────────────── */}
      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Techniques */}
            <div>
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-3">
                {TECHNIQUES.length} attack &amp; defense techniques
              </p>
              <div className="flex flex-wrap gap-1">
                {TECHNIQUES.map((t) => (
                  <span
                    key={t.label}
                    className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-800 bg-slate-900/60 text-slate-400"
                  >
                    {t.label}
                    <span className="text-slate-700">·</span>
                    <span className={
                      t.dojo === 1 ? 'text-red-600' :
                      t.dojo === 2 ? 'text-cyan-600' :
                      'text-emerald-600'
                    }>{t.tag}</span>
                  </span>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-slate-600 leading-relaxed">
                Sourced from OWASP LLM Top 10 (2025), MITRE ATT&amp;CK + ATLAS, and official exam study guides.
              </p>
            </div>

            {/* Certs */}
            <div>
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-3">
                {STATS.certs} certifications mapped
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CERT_CHIPS.map((c) => (
                  <span
                    key={c.id}
                    className={`text-[11px] font-mono px-2 py-0.5 rounded border ${c.color}`}
                  >
                    {c.label}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-slate-600 leading-relaxed">
                Every dojo turn maps to exam domains. Select a cert, drill by domain, track weak areas.{' '}
                {STATS.quizQs.toLocaleString()}+ questions, {STATS.glossary}+ glossary terms,{' '}
                {STATS.articles} articles — all cross-referenced by cert.
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
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-2">Playbook</p>
              <h2 className="text-xl font-bold text-slate-100 mb-3">
                {STATS.quizQs.toLocaleString()}+ questions. {STATS.certs} certs. Drill by domain.
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-5">
                Every article, quiz question, and glossary term is tagged to its cert exam domain.
                Select a cert, choose which domains to drill, set difficulty and question count —
                results show per-domain breakdown so you know where to focus.
              </p>

              {/* Quiz flow box */}
              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/40 mb-5">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-2">Quiz flow — exam first</p>
                <ol className="space-y-1">
                  {[
                    'Select the cert you are studying for',
                    'Pick domains from that exam\'s official objectives',
                    'Set difficulty, question count, or use mock-exam mode',
                    'Get per-domain score + weak area breakdown',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-2.5 text-[11px] text-slate-400 leading-snug">
                      <span className="font-mono text-slate-700 shrink-0 mt-px">{String(i + 1).padStart(2, '0')}</span>
                      {step}
                    </li>
                  ))}
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
                { n: `${STATS.quizQs.toLocaleString()}+`, label: 'quiz questions',  sub: `across ${STATS.certs} certs, mapped to domains` },
                { n: `${STATS.glossary}+`,                label: 'glossary terms',  sub: 'cert-tagged, A–Z filterable' },
                { n: STATS.articles,                      label: 'topic articles',  sub: 'with code examples and tables' },
                { n: STATS.certs,                         label: 'cert maps',       sub: 'official exam objectives + weights' },
              ].map(({ n, label, sub }) => (
                <div key={label} className="p-4 rounded-lg border border-slate-800 bg-slate-900/30">
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
      <section className="border-b border-slate-800 bg-slate-900/20">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <p className="text-[10px] font-mono text-slate-700 uppercase tracking-widest mb-2">Sourced from</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {SOURCED_FROM.map((f) => (
              <span key={f} className="text-[11px] font-mono text-slate-600">· {f}</span>
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
                <h2 className="text-xl font-bold text-slate-100">No setup. No account. No cost.</h2>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                  Pick a dojo, load a scenario, submit your attack. The guardrail configuration
                  decides the outcome — same payload, same config, same result, every time.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Dojo 1', sub: '11 attack scenarios', color: 'text-red-400' },
                    { label: 'Dojo 2', sub: '35 SOC incidents',    color: 'text-cyan-400' },
                    { label: 'Dojo 3', sub: '8 GRC scenarios',     color: 'text-emerald-400' },
                  ].map((d) => (
                    <div key={d.label} className="border border-slate-800 rounded px-3 py-2">
                      <div className={`text-[11px] font-mono font-semibold ${d.color}`}>{d.label}</div>
                      <div className="text-[10px] text-slate-600 mt-0.5">{d.sub}</div>
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
