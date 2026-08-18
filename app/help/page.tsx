import Link from 'next/link';
import { Card, PageHeader, SectionHeading, Badge, ButtonLink } from '@/components/ui';
import { CONTENT_COUNTS } from '@/lib/content-counts';

export const metadata = {
  title: 'Help',
  description:
    'How Securing AI works, the three disciplines, how scoring is calculated, certification mapping, privacy, and getting started.',
};

const QUICK_LINKS = [
  { href: '/dashboard', label: 'Dashboard', desc: 'Your completion, quiz accuracy, and recommended next scenario.' },
  { href: '/dojo', label: 'Dojo', desc: 'Attack and defend a live LLM, run SOC workflows, govern AI risk.' },
  { href: '/playbook', label: 'Playbook', desc: `${CONTENT_COUNTS.quizQuestions.toLocaleString()} questions, ${CONTENT_COUNTS.glossaryTerms} glossary terms, cert maps and ${CONTENT_COUNTS.topicArticles} topic articles.` },
];

const DISCIPLINES = [
  {
    tone: 'red' as const,
    tag: 'Dojo 1',
    title: 'LLM Attack & Defense',
    body: 'Fire prompt-injection, jailbreak, exfiltration, tool-abuse, and RAG-poisoning payloads at a sandboxed model while toggling guardrails. A deterministic outcome engine decides whether each attempt is vulnerable, partial, or blocked.',
  },
  {
    tone: 'brand' as const,
    tag: 'Dojo 2',
    title: 'AI-Assisted SOC',
    body: 'Operate as an AI-augmented analyst across log triage, alert enrichment, detection-rule generation, and incident reporting. Responses are scored against a quality rubric, IOC extraction, MITRE ATT&CK mapping, and executive summaries.',
  },
  {
    tone: 'emerald' as const,
    tag: 'Dojo 3',
    title: 'AI GRC',
    body: 'Govern AI deployments: classify EU AI Act risk tiers, draft ISO 42001 controls, and run third-party vendor reviews, scored against reference frameworks including NIST AI RMF.',
  },
];

const FAQ = [
  {
    q: 'Do I need an account?',
    a: 'No. Securing AI has no public sign-up, no tracking, and no ads. Your quiz sessions and dojo attempts are stored in your browser’s local storage and can be exported or cleared any time from Settings. Only the site owner can sign in, to sync their own progress between their own devices.',
  },
  {
    q: 'How is my score calculated?',
    a: 'Dojo 1 uses a deterministic outcome engine driven purely by your guardrail configuration, so the same setup always yields the same result. Dojo 2 and 3 use per-scenario quality rubrics. Your dashboard tracks completion, quiz accuracy, and recent activity.',
  },
  {
    q: 'Which certifications are covered?',
    a: `${CONTENT_COUNTS.certs} AI and cloud security certifications, including CompTIA SecAI+, Microsoft SC-500, AWS Certified Security - Specialty, the GIAC offensive/automation tracks, EC-Council C|AI Security, and CAISP. Questions are grouped by exam domain; per-objective tagging is complete for CompTIA SecAI+ and in progress elsewhere.`,
  },
  {
    q: 'Is any of this real exploit code?',
    a: 'No. Every payload is a conceptual training artifact. A server-side safety filter blocks attempts to submit functional exploit syntax. Scenarios are simulated for education.',
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader
        eyebrow="Documentation"
        title="Help & Guides"
        description="Everything you need to get the most out of the platform, the disciplines, how scoring works, and answers to common questions."
      />

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {QUICK_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="ui-card ui-card-hover flex items-start gap-3 p-4"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-500/30 bg-brand-500/10 text-brand-300">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-100">{l.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{l.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Disciplines */}
      <Card className="mt-6 p-5 sm:p-6">
        <SectionHeading index={1} eyebrow="How it works" title="The three disciplines" />
        <div className="mt-5 space-y-5">
          {DISCIPLINES.map((d) => (
            <div key={d.tag} className="flex flex-col gap-2 border-l-2 border-surface-border pl-4 sm:flex-row sm:gap-4">
              <div className="flex shrink-0 items-start pt-0.5">
                <Badge tone={d.tone} mono>{d.tag}</Badge>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">{d.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{d.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* FAQ */}
      <Card className="mt-4 p-5 sm:p-6">
        <SectionHeading index={2} eyebrow="FAQ" title="Frequently asked questions" />
        <div className="mt-4 divide-y divide-surface-border/60">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-3.5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-slate-200 marker:hidden">
                {f.q}
                <svg className="h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </summary>
              <p className="mt-2.5 text-xs leading-relaxed text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </Card>

      {/* Contact / repo */}
      <Card className="mt-4 flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Still need help?</h3>
          <p className="mt-1 text-xs text-slate-500">The project is open source. Read the architecture notes, or open an issue on GitHub.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/about" variant="secondary" size="md">About the platform</ButtonLink>
          <ButtonLink href="https://github.com/TheMDBritt/SecuringAI/issues" variant="ghost" size="md">Open an issue</ButtonLink>
        </div>
      </Card>
    </div>
  );
}
