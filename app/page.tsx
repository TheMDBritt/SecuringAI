import Link from 'next/link';
import { getScenariosByDojo } from '@/lib/scenarios';
import { ACCENT, type AccentName } from '@/lib/dojo-theme';
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
      'Attack and defend an LLM under live guardrail toggles. See exactly which control stops which attack.',
    accent: 'red',
  },
  {
    id: 2,
    label: 'Dojo 2',
    title: 'AI Secures Assets',
    summary:
      'Use AI as a SOC analyst. Score the AI’s analysis against a quality rubric.',
    accent: 'cyan',
  },
  {
    id: 3,
    label: 'Dojo 3',
    title: 'Defense vs AI Attacks',
    summary:
      'Build threat models, detection rules, and policies against AI-powered attackers.',
    accent: 'emerald',
  },
];

const CERTS = [
  { code: 'SecAI+',     body: 'CompTIA',                 scope: 'All three dojos — vendor-neutral AI security practitioner' },
  { code: 'CAISP',      body: 'ISC2',                    scope: 'Dojo 1 + Dojo 2 — Certified in AI Systems Security Practitioner' },
  { code: 'AAISM',      body: 'ISACA',                   scope: 'Dojo 2 + Dojo 3 — Advanced AI Security Management' },
  { code: 'CAIS',       body: 'EC-Council',              scope: 'Dojo 1 + Dojo 3 — Certified AI Security Specialist' },
  { code: 'AICM',       body: 'Cloud Security Alliance', scope: 'Agentic + RAG controls (Dojo 1 + Dojo 3)' },
  { code: 'LLM Top 10', body: 'OWASP (2025)',            scope: 'Dojo 1 attack scenarios' },
  { code: 'AI RMF',     body: 'NIST 1.0',                scope: 'Govern / Map / Measure / Manage across all dojos' },
  { code: '42001',      body: 'ISO/IEC',                 scope: 'Dojo 3 policy & governance' },
  { code: 'EU AI Act',  body: 'European Union',          scope: 'Dojo 3 high-risk AI obligations' },
  { code: 'ATT&CK',     body: 'MITRE',                   scope: 'Dojo 2 SOC scenarios' },
];

const PRIVACY_BULLETS = [
  'No accounts, no logins, no tracking.',
  'No persistent storage — chat lives in browser memory only.',
  'Per-IP rate limit on every API route.',
  'Server-side input validation on every request.',
  'Safety pre-filter blocks functional exploit syntax — payloads here are conceptual only.',
  'Model API keys read server-side only. Never reach the browser.',
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
              Free · No login · No tracking
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-100 leading-tight">
            Practice <span className="text-red-400">attacking</span>,{' '}
            <span className="text-cyan-400">defending</span>, and{' '}
            <span className="text-emerald-400">operating</span>
            <br />
            AI systems.
          </h1>

          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
            SecuringAI is a hands-on study tool for LLM security. Three connected
            dojos cover the full offensive/defensive AI security loop. Every turn
            is scored and mapped to the top 2026 AI security certifications.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/dojo"
              className="px-6 py-3 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
            >
              Enter the dojo →
            </Link>
            <Link
              href="/certs"
              className="px-6 py-3 rounded border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-slate-100 font-medium transition-colors"
            >
              See cert mapping
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono text-slate-500">
            <li>· OWASP LLM Top 10</li>
            <li>· MITRE ATT&amp;CK</li>
            <li>· NIST AI RMF</li>
            <li>· ISO/IEC 42001</li>
            <li>· EU AI Act</li>
          </ul>
        </div>
      </section>

      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
            Three dojos
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-10">
            Pick a discipline. Run scenarios. Get scored.
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
                    'group flex flex-col p-5 rounded-lg border bg-slate-900/40 transition-colors',
                    accent.border,
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={['text-[10px] font-mono px-2 py-0.5 rounded', accent.bg, accent.text].join(' ')}>
                      {d.label}
                    </span>
                  </div>
                  <h3 className={['text-lg font-semibold mb-2', accent.text].join(' ')}>
                    {d.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                    {d.summary}
                  </p>
                  <ul className="mt-auto flex flex-col gap-1">
                    {scenarios.map((s) => (
                      <li key={s.id} className="text-xs text-slate-500 flex gap-1.5">
                        <span className="text-slate-600">·</span>
                        {s.title}
                      </li>
                    ))}
                  </ul>
                  <span
                    className={[
                      'mt-5 text-xs font-mono opacity-60 group-hover:opacity-100 transition-opacity',
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

      <section className="border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
            How scoring works
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-10">
            Deterministic in Dojo 1. Quality-rubric in Dojo 2 &amp; 3.
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-lg border border-slate-800 bg-slate-900/60">
              <h3 className="text-sm font-semibold text-red-400 mb-2 font-mono">
                DOJO 1 · Outcome engine
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Guardrail settings (Injection Shield, Strict Policy, Tools, RAG)
                deterministically decide whether each attack is{' '}
                <em>vulnerable</em>, <em>partial</em>, or <em>blocked</em>.
                Session score starts at 100 and decays as attacks land — chained
                attacks stack penalties.
              </p>
            </div>
            <div className="p-5 rounded-lg border border-slate-800 bg-slate-900/60">
              <h3 className="text-sm font-semibold text-cyan-400 mb-2 font-mono">
                DOJO 2 / 3 · Quality rubric
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Per-scenario regex checks evaluate the AI&apos;s response for
                IOCs, MITRE T-codes, executive summaries, and framework mappings.
                Disabled analyst capabilities are excluded from scoring.
              </p>
            </div>
            <div className="p-5 rounded-lg border border-slate-800 bg-slate-900/60">
              <h3 className="text-sm font-semibold text-emerald-400 mb-2 font-mono">
                Every turn · Cert mapping
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                The evaluator returns OWASP LLM Top 10 categorisation, MITRE
                ATT&amp;CK references, and the relevant 2026 AI-security
                certification domains — so you see which exam topic you just
                practiced.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="certs" className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
            Top 2026 AI security certifications
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-10">
            Mapped to every scenario.
          </h2>

          <p className="text-sm text-slate-400 mb-6">
            <Link href="/certs" className="text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline">
              See the full cert deep-dive →
            </Link>
          </p>

          <div className="overflow-hidden rounded-lg border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/60 border-b border-slate-800">
                <tr className="text-left text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Cert / Framework</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {CERTS.map((c, i) => (
                  <tr
                    key={c.code}
                    className={[
                      'border-b border-slate-800/60 last:border-b-0',
                      i % 2 === 0 ? 'bg-slate-900/20' : '',
                    ].join(' ')}
                  >
                    <td className="px-4 py-3 font-mono text-cyan-300/80 whitespace-nowrap">
                      {c.code}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {c.body}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{c.scope}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
            Privacy
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-6">
            Free, forever, with nothing to sign.
          </h2>
          <ul className="grid md:grid-cols-2 gap-3 text-sm text-slate-300">
            {PRIVACY_BULLETS.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-emerald-400 shrink-0">✓</span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            Ready to train?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Pick a dojo, run a scenario, watch the score and cert mapping update
            in real time. No setup, no signup.
          </p>
          <Link
            href="/dojo"
            className="inline-block px-8 py-3 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
          >
            Enter the dojo →
          </Link>
          <p className="mt-10 text-xs font-mono text-slate-600">
            Built as a free, open-source study tool. MIT licensed.
          </p>
        </div>
      </section>
    </div>
  );
}
