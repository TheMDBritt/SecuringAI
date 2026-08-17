import Link from 'next/link';
import { getScenariosByDojo, SCENARIOS } from '@/lib/scenarios';
import { ACCENT, type AccentName } from '@/lib/dojo-theme';
import { Footer } from '@/components/layout/Footer';
import { CONTENT_COUNTS } from '@/lib/content-counts';
import { CATALOG_COUNTS } from '@/lib/catalog-counts';
import { OWASP_LLM_2026 } from '@/lib/owasp-llm-top10';
import { TerminalReplay } from '@/components/ui/TerminalReplay';
import { Reveal } from '@/components/ui/Reveal';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { SectionMarker } from '@/components/ui/SectionMarker';
// Imported from the client module directly rather than through the design
// system index, so the boundary stays as small as the one component that needs
// it.
import { CountUp } from '@/components/ui/motion-primitives';
import type { DojoId } from '@/types';

// ── Live counts, computed from source data at build time ─────────────────────
const STATS = {
  scenarios: SCENARIOS.length,
  d1: SCENARIOS.filter((s) => s.dojoId === 1).length,
  d3: SCENARIOS.filter((s) => s.dojoId === 3).length,
  quizQs:    CONTENT_COUNTS.quizQuestions,
  glossary:  CONTENT_COUNTS.glossaryTerms,
  articles:  CONTENT_COUNTS.topicArticles,
  certs:     CONTENT_COUNTS.certs,
  incidents: CATALOG_COUNTS.incidents,
  drills:    CONTENT_COUNTS.drills,
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
    summary: 'Attack a live model, then defend it. Set the guardrails, pick a technique, and watch which control decides the outcome. Nothing is random: the same payload against the same configuration produces the same result every time, so you can change one setting and see exactly what it bought you.',
    accent: 'red',
    detail: 'Injection Shield · Strict Policy · Tool Access · RAG Sanitiser',
  },
  {
    id: 2,
    label: 'Dojo 2',
    title: 'AI-Assisted SOC',
    summary: 'Work incidents the way an analyst does. Load real evidence, direct the AI through the analysis, then read its output critically. You are graded on the analysis you produced, not on the prompt you typed, because a confident wrong answer is the failure mode that matters.',
    accent: 'cyan',
    detail: 'Log Triage · Alert Enrichment · Detection Rule Gen · IR Report',
  },
  {
    id: 3,
    label: 'Dojo 3',
    title: 'AI GRC',
    summary: 'Produce the artefacts a regulator or an auditor would ask for. Classify a system, draft the controls, review a vendor, and resolve the conflicts between frameworks rather than listing them side by side. Every deliverable is scored against named clauses.',
    accent: 'emerald',
    detail: 'EU AI Act · NIST AI RMF · ISO/IEC 42001 · Vendor Risk',
  },
];



const CERT_CHIPS = [
  { id: 'SecAI',       label: 'CompTIA SecAI+' },
  { id: 'CAISP',       label: 'CAISP' },
  { id: 'CAIS',        label: 'EC-Council C|AI Security' },
  { id: 'GIAC-GOAA',   label: 'GIAC GOAA' },
  { id: 'GIAC-GASAE',  label: 'GIAC GASAE' },
  { id: 'SC-500',      label: 'Microsoft SC-500' },
  { id: 'AWS-AIF-C01', label: 'AWS AIF-C01' },
  { id: 'SCS-C03',     label: 'AWS Security Specialty' },
  { id: 'Azure-AI103', label: 'Azure AI-103' },
  { id: 'Azure-AI901', label: 'Azure AI-901' },
  { id: 'Google-MLE',  label: 'Google MLE' },
];

const SOURCED_FROM = [
  'OWASP LLM Top 10 (2026)',
  'MITRE ATT&CK + ATLAS',
  'NIST AI RMF 1.0',
  'ISO/IEC 42001:2023',
  'EU AI Act (2024)',
  'CSA AI Controls Matrix',
  'NIST SP 800-218A',
  'NIST AI 100-1',
  'GIAC GOAA / GASAE Syllabi',
  'CompTIA SecAI+ Objectives',
  'EC-Council C|AI Security Outline',
  'Microsoft SC-500 / AI-103 Study Guide',
  'AWS AI Practitioner Exam Guide',
  'AWS Certified Security - Specialty Exam Guide',
  'Google Professional ML Engineer Guide',
  'CAISP Exam Domains (Practical DevSecOps)',
];

// ── Scoring rows for the scoring table ────────────────────────────────────────
const SCORING_ROWS = [
  {
    dojo: 'Dojo 1',
    color: 'text-slate-300',
    engine: 'Outcome engine',
    how: 'Guardrail config (Injection Shield, Strict Policy, Tools, RAG) deterministically produces vulnerable / partial / blocked per turn. Session score starts at 100 and decays on each successful attack; chained attacks stack penalties.',
    maps: 'OWASP LLM Top 10 · MITRE ATLAS',
  },
  {
    dojo: 'Dojo 2',
    color: 'text-slate-300',
    engine: 'Quality rubric',
    how: 'Per-scenario regex rubrics score IOC extraction, MITRE T-codes, executive summaries, detection rule structure, and confidence blocks. Disabled analyst controls are excluded from scoring.',
    maps: 'MITRE ATT&CK · SecAI+ · GIAC GASAE',
  },
  {
    dojo: 'Dojo 3',
    color: 'text-slate-300',
    engine: 'Framework rubric',
    how: 'Evaluator checks EU AI Act tier assignment, NIST AI RMF function references, ISO 42001 control citations, and vendor gap coverage, returns per-element coaching on missing criteria.',
    maps: 'EU AI Act · ISO 42001 · NIST AI RMF',
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <ScrollProgress />

      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="pointer-events-none absolute inset-0 bg-brand-radial" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:44px_44px] [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-6 py-14 md:py-20">
          <div className="grid md:grid-cols-5 gap-8 md:gap-14 items-start">
            {/* Left, headline.
                Revealed in reading order on a short stagger. Every other
                section of this page arrives as the reader reaches it; the hero
                was the one place that appeared fully formed, which made the
                first screen the least considered one. */}
            <div className="md:col-span-3">
              <Reveal>
                <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-brand-500/25 bg-brand-500/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                  <span className="text-2xs font-medium text-brand-200 tracking-wide">Enterprise AI security training · Free &amp; open access</span>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="text-display md:text-display-lg font-bold tracking-tight text-white leading-[1.05]">
                  Attack LLMs.<br />
                  Defend against them.<br />
                  <span className="text-brand-300">Govern AI risk.</span>
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-6 text-base text-slate-300 max-w-[520px] leading-relaxed">
                  Three hands-on dojos. Attack a live LLM under configurable guardrails, triage
                  AI-augmented SOC incidents, and classify EU AI Act risk scenarios, every turn scored
                  and mapped to {STATS.certs} cert exam domains, OWASP LLM Top 10, and MITRE ATLAS.
                  {' '}{STATS.quizQs.toLocaleString()} quiz questions across {STATS.certs} certs, {STATS.glossary} glossary terms.
                </p>
              </Reveal>
              {/* One clear entry point. The dashboard used to be the primary
                  CTA, but it is empty for a first-time visitor, so the Dojo
                  lead instead and the dashboard drops to a tertiary link. */}
              <Reveal delay={240}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link href="/dojo" className="ui-btn ui-btn-primary px-5 py-2.5 text-sm">
                    Enter the Dojo &rarr;
                  </Link>
                  <Link href="/playbook" className="ui-btn ui-btn-secondary px-5 py-2.5 text-sm">
                    Study the playbook
                  </Link>
                  <Link href="/dashboard" className="ui-btn ui-btn-ghost px-4 py-2.5 text-sm">
                    Your dashboard
                  </Link>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  No sign-up. Progress saves in this browser only.{' '}
                  <Link href="/help" className="text-brand-300 underline underline-offset-2 hover:text-brand-200">
                    New here?
                  </Link>
                </p>
              </Reveal>
              {/* Quick framework tags */}
              <Reveal delay={320}>
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {['OWASP LLM Top 10', 'MITRE ATLAS', 'NIST AI RMF', 'EU AI Act', 'ISO 42001'].map((f) => (
                    <span key={f} className="text-micro font-mono px-1.5 py-0.5 rounded border border-slate-700 text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-200">
                      {f}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Right, stats + terminal */}
            <div className="md:col-span-2">
              {/* A contents list, not a tile grid. These are counts of things
                  in a library, so they are set as ruled rows with the figure in
                  the margin, the way a manual lists what it contains. Six
                  bordered boxes said "dashboard" about something that is an
                  inventory. */}
              <dl className="mb-3">
                {[
                  { n: STATS.quizQs, label: 'quiz questions', sub: `${STATS.certs} certs mapped` },
                  { n: STATS.scenarios, label: 'dojo scenarios', sub: '3 disciplines' },
                  { n: STATS.glossary, label: 'glossary terms', sub: 'A to Z, cert-filtered' },
                  { n: STATS.articles, label: 'topic articles', sub: 'code and tables' },
                  { n: STATS.incidents, label: 'SOC incidents', sub: 'Dojo 2 prebuilt' },
                  { n: STATS.certs, label: 'certs mapped', sub: 'official domains' },
                ].map(({ n, label, sub }, i) => (
                  // Reveal *is* the row rather than wrapping one. A wrapper put
                  // the dt/dd two divs deep inside the dl, which is not a valid
                  // definition list — one grouping div is the limit.
                  <Reveal
                    key={label}
                    delay={i * 60}
                    className="flex items-baseline gap-4 border-b border-slate-800/80 py-2 last:border-b-0"
                  >
                    {/* The figures count up. This list is the claim the page
                        makes about how much material is behind it, so the
                        numbers are worth watching arrive. */}
                    <dt className="w-16 shrink-0 text-right font-mono text-lg font-semibold tabular-nums tracking-tight text-slate-100">
                      <CountUp value={n} />
                    </dt>
                    <dd className="min-w-0 flex-1">
                      <span className="text-xs font-medium text-slate-200">{label}</span>
                      <span className="ml-2 font-mono text-micro text-slate-400">{sub}</span>
                    </dd>
                  </Reveal>
                ))}
              </dl>
              {/* Terminal */}
              <TerminalReplay
                lines={[
                  { kind: 'cmd', text: 'dojo load prompt-injection --shield strict' },
                  { kind: 'ok', text: 'BLOCKED', detail: '[LLM01:2026] score 100 · shield triggered' },
                  { kind: 'cmd', text: 'dojo load prompt-injection --shield off' },
                  { kind: 'fail', text: 'VULNERABLE', detail: '[LLM01:2026] session −22 · same payload' },
                  { kind: 'cmd', text: 'quiz start GIAC-GOAA --domain d4 --count 25' },
                  { kind: 'note', text: 'STARTED', detail: 'Prompt Injection & LLM Bypass · 25q' },
                  { kind: 'cmd', text: 'quiz start CAISP --mock' },
                  { kind: 'note', text: 'MOCK', detail: 'AI Security Assessment · 60q · timed' },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Three dojos ──────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <SectionMarker
            index={1}
            eyebrow="Three disciplines"
            title="Pick a scenario. Run it. Get scored."
            annotation={`${CATALOG_COUNTS.scenarios} scenarios across attack, SOC and governance`}
            action={
              <Link
                href="/dojo"
                className="hidden shrink-0 font-mono text-2xs text-slate-400 transition-colors hover:text-slate-200 md:inline-block"
              >
                Open the Dojo →
              </Link>
            }
          />

          <div className="grid md:grid-cols-3 gap-4">
            {DOJOS.map((d, i) => {
              const accent = ACCENT[d.accent];
              const scenarios = getScenariosByDojo(d.id);
              return (
                <Reveal key={d.id} delay={i * 90} className="flex">
                <Link
                  href="/dojo"
                  className={[
                    'group flex flex-col p-5 rounded-xl border bg-slate-900/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated',
                    accent.border,
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={['text-micro font-mono px-2 py-0.5 rounded', accent.bg, accent.text].join(' ')}>
                      {d.label}
                    </span>
                  </div>
                  <h3 className={['text-sm font-semibold mb-2', accent.text].join(' ')}>
                    {d.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3 flex-1">
                    {d.summary}
                  </p>
                  <p className={['text-micro font-mono mb-4', accent.text, 'opacity-60'].join(' ')}>
                    {d.detail}
                  </p>
                  <div className="border-t border-slate-800 pt-3">
                    <p className="mb-1.5 font-mono text-micro uppercase tracking-widest text-slate-400">
                      {scenarios.length} scenarios, including
                    </p>
                    <ul className="flex flex-col gap-1">
                      {scenarios.slice(0, 4).map((s) => (
                        <li key={s.id} className="flex items-start gap-1.5 text-2xs text-slate-500">
                          <span className="mt-px shrink-0 text-slate-500">·</span>
                          {s.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <span
                    className={[
                      'mt-4 text-2xs font-mono opacity-50 group-hover:opacity-100 transition-opacity duration-150',
                      accent.text,
                    ].join(' ')}
                  >
                    Open {d.label} →
                  </span>
                </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Scoring table ─────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Reveal>
            <SectionMarker
              index={2}
              eyebrow="How scoring works"
              title={<>Deterministic in Dojo 1. Quality-rubric in Dojo 2 &amp; 3.</>}
              annotation="Same payload, same config, same result"
            />
          </Reveal>

          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-2.5 text-micro font-mono text-slate-400 uppercase tracking-widest w-24">Dojo</th>
                  <th className="px-4 py-2.5 text-micro font-mono text-slate-400 uppercase tracking-widest w-36">Engine</th>
                  <th className="px-4 py-2.5 text-micro font-mono text-slate-400 uppercase tracking-widest">How it scores</th>
                  <th className="px-4 py-2.5 text-micro font-mono text-slate-400 uppercase tracking-widest hidden md:table-cell">Framework</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {SCORING_ROWS.map((row) => (
                  <tr key={row.dojo} className="hover:bg-slate-800/30 transition-colors duration-100">
                    <td className="px-4 py-3">
                      <span className={`font-mono font-semibold ${row.color}`}>{row.dojo}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-2xs">{row.engine}</td>
                    <td className="px-4 py-3 text-slate-400 leading-relaxed max-w-xs">{row.how}</td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-micro hidden md:table-cell">{row.maps}</td>
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
          <Reveal>
            <SectionMarker
              index={3}
              eyebrow="Coverage"
              title="One framework edition. Eleven exams."
              annotation="Codes moved between the 2023, 2025 and 2026 lists"
            />
          </Reveal>

          <div className="grid md:grid-cols-2 gap-10">

            {/* Coverage, stated once and correctly */}
            <div>
              <p className="mb-3 font-mono text-2xs uppercase tracking-widest text-slate-500">
                OWASP LLM Top 10, 2026 edition
              </p>
              <ol className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {(Object.entries(OWASP_LLM_2026) as [string, string][]).map(([code, name]) => (
                  <li key={code} className="flex items-baseline gap-2.5 text-xs">
                    <span className="font-mono text-2xs tabular-nums text-brand-400/70">{code}</span>
                    <span className="text-slate-400">{name}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                Every scenario, question, and glossary entry uses this edition. The codes moved
                between the 2023, 2025, and 2026 lists, so material written against an older one
                teaches the wrong answer. Scenarios also carry MITRE ATLAS technique IDs.
              </p>
            </div>

            {/* Cert tags */}
            <div>
              <p className="text-2xs font-mono text-slate-500 uppercase tracking-widest mb-3">
                {STATS.certs} certifications mapped
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CERT_CHIPS.map((c) => (
                  <span
                    key={c.id}
                    className="rounded border border-slate-700 bg-transparent px-2 py-0.5 font-mono text-2xs text-slate-300"
                  >
                    {c.label}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                Every dojo turn maps to exam domains. Quiz: select a cert,
                drill by domain, track weak areas. {STATS.quizQs.toLocaleString()} questions, {STATS.glossary} glossary terms,
                {' '}{STATS.articles} articles, all cross-referenced by cert.
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
              <p className="text-2xs font-mono text-slate-500 uppercase tracking-widest mb-2">
                Playbook
              </p>
              <h2 className="text-display-sm font-bold text-slate-100 mb-3">
                {STATS.quizQs.toLocaleString()} questions across {STATS.certs} certs. Drill by domain.
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Every article, quiz question, and glossary term is tagged to its cert exam domain.
                Select a cert, choose which domains to drill, set difficulty and question count 
                results show per-domain breakdown so you know exactly where to focus.
              </p>
              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/40 mb-5">
                <p className="text-micro font-mono text-slate-500 uppercase tracking-widest mb-1.5">Quiz flow, exam first</p>
                <ol className="text-xs text-slate-400 space-y-1 leading-relaxed">
                  <li><span className="font-mono text-slate-500 mr-2">01</span>Select a cert (SecAI+, SC-500, GIAC-GOAA…)</li>
                  <li><span className="font-mono text-slate-500 mr-2">02</span>Pick domains from that exam&apos;s official objectives</li>
                  <li><span className="font-mono text-slate-500 mr-2">03</span>Configure difficulty · question count · mock exam mode</li>
                  <li><span className="font-mono text-slate-500 mr-2">04</span>Get per-domain score breakdown + weak area targeting</li>
                </ol>
              </div>
              <Link
                href="/playbook"
                className="inline-block px-5 py-2.5 rounded border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-slate-100 font-medium text-sm transition-colors duration-150"
              >
                Open the playbook →
              </Link>
            </div>

            {/* The four headline numbers already appear in the hero. Repeating
                them here filled space without telling the reader anything new,
                so this side carries what the Playbook actually contains. */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
              <p className="mb-3 font-mono text-micro uppercase tracking-widest text-slate-500">
                What is covered
              </p>
              <dl className="divide-y divide-slate-800/80">
                {[
                  ['CompTIA SecAI+', 'CY0-001, all four domains, objective-tagged'],
                  ['Microsoft SC-500', 'Four domains, current published weightings'],
                  ['AWS Security Specialty', 'SCS-C03, six domains including GenAI controls'],
                  ['Eight further certs', 'CAISP, CAIS, GIAC GOAA and GASAE, Azure, Google'],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-0.5 py-2.5 first:pt-0 last:pb-0">
                    <dt className="text-xs font-medium text-slate-200">{k}</dt>
                    <dd className="text-2xs leading-relaxed text-slate-500">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sources ──────────────────────────────────────────────────────────── */}
      {/* This is a bibliography, and it was set as a wrapped run of mono
          fragments. Numbering it and letting it break into columns makes it
          read as references, which is both what it is and the strongest claim
          on the page: none of this was written from memory. */}
      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Reveal>
            <SectionMarker
              index={5}
              eyebrow="Sourced from"
              title="Written against the published blueprints."
              annotation="Every claim traces to one of these"
            />
          </Reveal>
          <ol className="columns-1 gap-x-10 sm:columns-2 lg:columns-3">
            {SOURCED_FROM.map((f, i) => (
              <li
                key={f}
                className="mb-1.5 flex break-inside-avoid items-baseline gap-2.5 text-2xs"
              >
                <span className="font-mono tabular-nums text-slate-500">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-slate-300">{f}</span>
              </li>
            ))}
          </ol>
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
                  decides the outcome, same payload, same config, same result every time.
                  Free and open, no signup, no tracking.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Dojo 1', sub: `${STATS.d1} attack scenarios` },
                    { label: 'Dojo 2', sub: `${STATS.incidents} SOC incidents` },
                    { label: 'Dojo 3', sub: `${STATS.d3} GRC scenarios` },
                  ].map((d) => (
                    <div key={d.label} className="border border-slate-800 rounded px-3 py-2">
                      <div className="font-mono text-2xs font-semibold text-slate-200">{d.label}</div>
                      <div className="text-micro text-slate-500 mt-0.5">{d.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Link
                  href="/dojo"
                  className="ui-btn ui-btn-primary px-6 py-2.5 text-sm text-center"
                >
                  Enter the Dojo →
                </Link>
                <Link
                  href="/playbook"
                  className="px-6 py-2.5 rounded border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-slate-100 font-medium text-sm transition-colors duration-150 text-center"
                >
                  Study the playbook
                </Link>
                <Link
                  href="/about"
                  className="px-6 py-2.5 text-center text-2xs font-mono text-slate-400 hover:text-slate-400 transition-colors duration-150"
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
