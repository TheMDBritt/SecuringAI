import Link from 'next/link';
import { SCENARIOS } from '@/lib/scenarios';
import { SECURITYAI_PLUS_TOPICS } from '@/lib/cert-topics';
import type { Scenario } from '@/types';

export const metadata = {
  title: 'Certifications',
  description:
    'Top 2026 AI security certifications and frameworks — what each one covers, who it is for, and which SecuringAI dojo scenarios prepare you for it.',
};

interface Cert {
  code: string;
  fullName: string;
  provider: string;
  kind: 'cert' | 'framework';
  level: 'practitioner' | 'professional' | 'advanced' | 'standard' | 'regulation';
  about: string;
  audience: string;
  /**
   * Exact topic prefix used to match SECURITYAI_PLUS_TOPICS entries. Matching
   * is `topic.startsWith(prefix + ' ')` so `CAIS` and `CAISP` stay distinct
   * without any trailing-space hacks.
   */
  prefix: string;
}

const CERTS: Cert[] = [
  {
    code: 'SecAI+',
    fullName: 'CompTIA SecAI+',
    provider: 'CompTIA',
    kind: 'cert',
    level: 'practitioner',
    about:
      'Vendor-neutral AI security practitioner credential. Covers adversarial prompting, AI input validation, agentic-AI risks, AI-assisted SOC operations, AI-generated detection rules, and synthetic media defence.',
    audience:
      'Security analysts and engineers who want a baseline AI-security qualification recognised across vendors.',
    prefix: 'SecAI+',
  },
  {
    code: 'CAISP',
    fullName: 'Certified in AI Systems Security Practitioner',
    provider: 'ISC2',
    kind: 'cert',
    level: 'practitioner',
    about:
      'Practitioner-level certification focused on building, operating, and defending AI systems. Heavy emphasis on input validation, RAG pipeline security, retrieval poisoning, agentic AI, and AI-assisted SOC workflows.',
    audience:
      'ISC2 members and security practitioners adding AI to their portfolio of CISSP-adjacent credentials.',
    prefix: 'CAISP',
  },
  {
    code: 'AAISM',
    fullName: 'Advanced in AI Security Management',
    provider: 'ISACA',
    kind: 'cert',
    level: 'advanced',
    about:
      'Management-tier credential covering AI governance, AI output quality assurance, IR documentation for AI-assisted analysis, operational AI oversight, and policy authoring for AI systems.',
    audience:
      'CISOs, IR leads, governance/risk professionals overseeing AI deployments and audit programmes.',
    prefix: 'AAISM',
  },
  {
    code: 'CAIS',
    fullName: 'Certified AI Security Specialist',
    provider: 'EC-Council',
    kind: 'cert',
    level: 'professional',
    about:
      'Hands-on AI security cert with a strong offence/defence balance. Covers AI policy enforcement, AI-generated social engineering, CVE analysis & enrichment, and jailbreak resistance.',
    audience:
      'Red-team, blue-team, and threat-hunting professionals adding AI to their tradecraft.',
    prefix: 'CAIS',
  },
  {
    code: 'AICM',
    fullName: 'AI Controls Matrix',
    provider: 'Cloud Security Alliance',
    kind: 'framework',
    level: 'standard',
    about:
      'Industry control framework for AI systems. Defines controls for agentic AI, RAG data provenance, model lifecycle, and validation. Used as a benchmark for SecAI+ and AAISM exam questions.',
    audience:
      'Anyone designing or auditing AI controls — especially in regulated cloud environments.',
    prefix: 'CSA AICM',
  },
  {
    code: 'LLM Top 10',
    fullName: 'OWASP Top 10 for LLM Applications (2025)',
    provider: 'OWASP',
    kind: 'framework',
    level: 'standard',
    about:
      'The de-facto reference for LLM application risks: Prompt Injection (LLM01), Sensitive Information Disclosure (LLM02), Improper Output Handling (LLM05), System Prompt Leakage / Tool Misuse (LLM07), and Vector & Embedding Weaknesses (LLM08), among others.',
    audience:
      'Every AI-security cert leans on OWASP LLM Top 10 — start here regardless of which exam you are preparing for.',
    prefix: 'OWASP',
  },
  {
    code: 'AI RMF',
    fullName: 'AI Risk Management Framework 1.0',
    provider: 'NIST',
    kind: 'framework',
    level: 'standard',
    about:
      'US government risk-management framework with four functions: Govern, Map, Measure, Manage. Cited in SecAI+, AAISM, and the EU AI Act technical documentation.',
    audience:
      'Risk officers, governance professionals, and anyone evaluating AI systems against a shared baseline.',
    prefix: 'NIST AI RMF',
  },
  {
    code: '42001',
    fullName: 'ISO/IEC 42001 — AI Management System',
    provider: 'ISO',
    kind: 'framework',
    level: 'standard',
    about:
      'International standard for AI management systems. Defines requirements for governance, lifecycle, monitoring, and continual improvement of AI. The "ISO 27001 of AI".',
    audience:
      'Compliance, audit, and governance roles standing up an AI management programme — particularly in enterprises pursuing certification.',
    prefix: 'ISO/IEC 42001',
  },
  {
    code: 'EU AI Act',
    fullName: 'EU AI Act',
    provider: 'European Union',
    kind: 'framework',
    level: 'regulation',
    about:
      'EU regulation classifying AI systems by risk and imposing obligations on high-risk AI — including risk management (Article 9), data governance, transparency, and human oversight.',
    audience:
      'Anyone shipping AI into the EU market or building AI for EU enterprises. Increasingly tested on AAISM and SecAI+.',
    prefix: 'EU AI Act',
  },
  {
    code: 'ATT&CK',
    fullName: 'MITRE ATT&CK',
    provider: 'MITRE',
    kind: 'framework',
    level: 'standard',
    about:
      'Operational adversary-behaviour framework. SecuringAI uses ATT&CK T-codes throughout Dojo 2 SOC scenarios so AI-generated analyses can be scored on technique mapping accuracy.',
    audience:
      'SOC analysts, detection engineers, and threat hunters — and the foundation for the SecAI+ "AI-Assisted SOC" domain.',
    prefix: 'MITRE ATT&CK',
  },
];

const KIND_LABEL: Record<Cert['kind'], string> = {
  cert: 'Certification',
  framework: 'Framework / Standard',
};

const LEVEL: Record<Cert['level'], { label: string; style: string }> = {
  practitioner: { label: 'Practitioner', style: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' },
  professional: { label: 'Professional', style: 'border-violet-500/30 text-violet-400 bg-violet-500/10' },
  advanced:     { label: 'Advanced',     style: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
  standard:     { label: 'Standard',     style: 'border-slate-500/30 text-slate-300 bg-slate-500/10' },
  regulation:   { label: 'Regulation',   style: 'border-red-500/30 text-red-400 bg-red-500/10' },
};

function topicMatchesCert(topic: string, prefix: string): boolean {
  return topic.startsWith(`${prefix} `);
}

const SCENARIOS_BY_CERT: Record<string, Scenario[]> = Object.fromEntries(
  CERTS.map((c) => [
    c.code,
    SCENARIOS.filter((s) =>
      (SECURITYAI_PLUS_TOPICS[s.id] ?? []).some((t) => topicMatchesCert(t, c.prefix)),
    ),
  ]),
);

export default function CertsPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <Link
            href="/"
            className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Back to home
          </Link>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mt-6 mb-2">
            Top 2026 AI security certifications
          </p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-100 leading-tight">
            What each cert covers and which dojo prepares you for it.
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-3xl leading-relaxed">
            SecuringAI is calibrated against the ten certifications and
            frameworks below. Every scenario is tagged with the relevant exam
            domains, so the score panel doubles as a study guide.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12 grid gap-4 md:gap-5">
          {CERTS.map((c) => {
            const scenarios = SCENARIOS_BY_CERT[c.code];
            const level = LEVEL[c.level];
            return (
              <article
                key={c.code}
                className="rounded-lg border border-slate-800 bg-slate-900/40 p-6"
              >
                <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
                  <h2 className="text-xl font-semibold text-cyan-300 font-mono">
                    {c.code}
                  </h2>
                  <span className="text-sm text-slate-300">{c.fullName}</span>
                  <span className="text-xs text-slate-500">· {c.provider}</span>
                  <span
                    className={[
                      'ml-auto text-[10px] font-mono px-2 py-0.5 rounded border',
                      level.style,
                    ].join(' ')}
                  >
                    {KIND_LABEL[c.kind]} · {level.label}
                  </span>
                </header>

                <p className="text-sm text-slate-300 leading-relaxed mb-3">
                  {c.about}
                </p>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  <span className="text-slate-500 font-mono text-xs">
                    Who it&apos;s for ·{' '}
                  </span>
                  {c.audience}
                </p>

                {scenarios.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                      Practiced in
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {scenarios.map((s) => (
                        <li key={s.id}>
                          <Link
                            href="/dojo"
                            className="inline-block text-xs px-2 py-1 rounded border border-slate-700 bg-slate-800/60 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors"
                          >
                            <span className="font-mono text-slate-500 mr-1.5">
                              D{s.dojoId}
                            </span>
                            {s.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-slate-400 leading-relaxed">
          <p>
            <span className="text-slate-500 font-mono text-xs">Note · </span>
            SecuringAI is an independent study tool. We&apos;re not affiliated
            with CompTIA, ISC2, ISACA, EC-Council, the Cloud Security Alliance,
            OWASP, NIST, ISO, MITRE, or the European Union. Always cross-check
            exam objectives with the official provider before scheduling.
          </p>
        </div>
      </section>

      <section className="bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4">
            Pick a dojo and start practicing.
          </h2>
          <Link
            href="/dojo"
            className="inline-block px-8 py-3 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
          >
            Enter the dojo →
          </Link>
        </div>
      </section>
    </div>
  );
}
