import Link from 'next/link';
import {
  attackTypes,
  bestPractices,
  coreFoundations,
  defenses,
  frameworks,
  glossary,
  handbookToc,
  realWorldApplications,
  secAiAlignment,
  type AttackEntry,
  type HandbookTopic,
} from '@/lib/handbook-content';

export const metadata = {
  title: 'Dojo Handbook',
  description:
    'A practical AI security handbook covering LLM threats, defenses, frameworks, and SecurityAI+ exam-aligned concepts.',
};

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <p className="text-xs font-mono uppercase tracking-[0.24em] text-cyan-400">{eyebrow}</p>
      <h2 className="mt-3 text-2xl sm:text-3xl font-semibold text-slate-50">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm sm:text-base leading-7 text-slate-300">{description}</p>
    </div>
  );
}

function TopicCard({ topic }: { topic: HandbookTopic }) {
  return (
    <article className="rounded-2xl border border-slate-700/70 bg-slate-800/50 p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.12)]">
      <h3 className="text-lg font-semibold text-slate-100">{topic.title}</h3>
      {topic.summary && <p className="mt-2 text-sm leading-6 text-slate-300">{topic.summary}</p>}
      <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
        {topic.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function AttackCard({ attack }: { attack: AttackEntry }) {
  const detailGroups = [
    { label: 'Definition', items: [attack.definition] },
    { label: 'How it works', items: attack.howItWorks },
    { label: 'Why it works', items: attack.whyItWorks },
    { label: 'Real-world example', items: [attack.example] },
    { label: 'Impact', items: attack.impact },
  ];

  return (
    <article
      id={attack.id}
      className="scroll-mt-24 rounded-3xl border border-slate-700/70 bg-gradient-to-br from-slate-800/80 to-slate-900/70 p-6 sm:p-7"
    >
      <h3 className="text-xl font-semibold text-slate-50">{attack.title}</h3>
      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {detailGroups.map((group) => (
          <div key={group.label} className="rounded-2xl border border-slate-700/60 bg-slate-900/55 p-4">
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan-400">{group.label}</p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-300">
              {group.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function HandbookPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-slate-700/70 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-mono uppercase tracking-[0.24em] text-cyan-400">Dojo Handbook</p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
                AI Security Handbook for real-world defense and SecurityAI+ preparation
              </h1>
              <p className="mt-5 text-sm leading-7 text-slate-300 sm:text-base">
                This handbook is a self-contained reference for practitioners studying large language model
                security, AI system hardening, agentic risk, governance mappings, and the operational mindset
                required to secure modern AI-enabled applications.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-[28rem]">
              <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
                <p className="text-2xl font-semibold text-slate-50">{attackTypes.length}</p>
                <p className="mt-1 text-sm text-slate-400">Major attack families</p>
              </div>
              <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
                <p className="text-2xl font-semibold text-slate-50">{frameworks.length}</p>
                <p className="mt-1 text-sm text-slate-400">Framework mappings</p>
              </div>
              <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
                <p className="text-2xl font-semibold text-slate-50">{glossary.length}</p>
                <p className="mt-1 text-sm text-slate-400">Glossary terms</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dojo"
              className="inline-flex items-center rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:border-cyan-400 hover:text-cyan-200"
            >
              Return to Dojos
            </Link>
            <a
              href="#foundations"
              className="inline-flex items-center rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
            >
              Start reading
            </a>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <nav className="rounded-3xl border border-slate-700/70 bg-slate-900/75 p-5">
              <p className="text-xs font-mono uppercase tracking-[0.24em] text-cyan-400">Table of contents</p>
              <ul className="mt-4 space-y-2">
                {handbookToc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-slate-100"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="space-y-10">
            <section id="foundations" className="scroll-mt-24 rounded-3xl border border-slate-700/70 bg-slate-900/60 p-6 sm:p-8">
              <SectionIntro
                eyebrow="Foundations"
                title="Core AI security foundations"
                description="Use this section to build a strong mental model of how LLM systems work, where trust boundaries sit, and why AI security requires both classic controls and AI-specific safeguards."
              />
              <div className="grid gap-6 xl:grid-cols-2">
                {coreFoundations.map((topic) => (
                  <TopicCard key={topic.title} topic={topic} />
                ))}
              </div>
            </section>

            <section id="attacks" className="scroll-mt-24 rounded-3xl border border-slate-700/70 bg-slate-900/60 p-6 sm:p-8">
              <SectionIntro
                eyebrow="Adversary tradecraft"
                title="Attack types and exploitation patterns"
                description="Each entry explains what the attack is, how it operates in practice, why it succeeds, what it looks like in the real world, and the consequences defenders should expect."
              />
              <div className="space-y-6">
                {attackTypes.map((attack) => (
                  <AttackCard key={attack.id} attack={attack} />
                ))}
              </div>
            </section>

            <section id="defenses" className="scroll-mt-24 rounded-3xl border border-slate-700/70 bg-slate-900/60 p-6 sm:p-8">
              <SectionIntro
                eyebrow="Defense-in-depth"
                title="Defense strategies"
                description="No single control secures an AI system. Mature programs layer detection, containment, authorization, observability, and human review to reduce the chance that a single model failure becomes a business incident."
              />
              <div className="grid gap-6 xl:grid-cols-2">
                {defenses.map((topic) => (
                  <TopicCard key={topic.title} topic={topic} />
                ))}
              </div>
            </section>

            <section id="frameworks" className="scroll-mt-24 rounded-3xl border border-slate-700/70 bg-slate-900/60 p-6 sm:p-8">
              <SectionIntro
                eyebrow="Governance"
                title="Framework mappings"
                description="Use these mappings to connect LLM security engineering with enterprise risk management, compliance, and control design."
              />
              <div className="grid gap-6">
                {frameworks.map((entry) => (
                  <article key={entry.framework} className="rounded-2xl border border-slate-700/70 bg-slate-800/50 p-6">
                    <h3 className="text-xl font-semibold text-slate-50">{entry.framework}</h3>
                    <div className="mt-5 grid gap-5 lg:grid-cols-3">
                      <div>
                        <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan-400">Relevant controls</p>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                          {entry.controls.map((item) => (
                            <li key={item} className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan-400">How it applies to LLM security</p>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                          {entry.llmApplication.map((item) => (
                            <li key={item} className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan-400">Practical meaning</p>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                          {entry.practicalMeaning.map((item) => (
                            <li key={item} className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="real-world" className="scroll-mt-24 rounded-3xl border border-slate-700/70 bg-slate-900/60 p-6 sm:p-8">
              <SectionIntro
                eyebrow="Operational reality"
                title="Real-world application"
                description="These sections connect handbook concepts to practical deployments, failure paths, and attacker thinking in enterprise environments."
              />
              <div className="grid gap-6 xl:grid-cols-2">
                {realWorldApplications.map((topic) => (
                  <TopicCard key={topic.title} topic={topic} />
                ))}
              </div>
            </section>

            <section id="secai" className="scroll-mt-24 rounded-3xl border border-slate-700/70 bg-slate-900/60 p-6 sm:p-8">
              <SectionIntro
                eyebrow="Exam alignment"
                title="SecurityAI+ reinforcement map"
                description="This handbook is organized to reinforce the major knowledge areas expected in AI security certification study: fundamentals, system hardening, AI-assisted operations, and governance."
              />
              <div className="grid gap-6 xl:grid-cols-2">
                {secAiAlignment.map((topic) => (
                  <TopicCard key={topic.title} topic={topic} />
                ))}
              </div>
            </section>

            <section id="best-practices" className="scroll-mt-24 rounded-3xl border border-slate-700/70 bg-slate-900/60 p-6 sm:p-8">
              <SectionIntro
                eyebrow="Field guide"
                title="Best practices"
                description="Use these principles to guide design reviews, deployment planning, security testing, and post-deployment governance for LLM-based systems."
              />
              <div className="grid gap-6 xl:grid-cols-3">
                {bestPractices.map((topic) => (
                  <TopicCard key={topic.title} topic={topic} />
                ))}
              </div>
            </section>

            <section id="glossary" className="scroll-mt-24 rounded-3xl border border-slate-700/70 bg-slate-900/60 p-6 sm:p-8">
              <SectionIntro
                eyebrow="Reference"
                title="Glossary"
                description="A concise reference for common AI security terms used throughout the handbook and in real-world AI security conversations."
              />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {glossary.map((entry) => (
                  <article key={entry.term} className="rounded-2xl border border-slate-700/70 bg-slate-800/50 p-5">
                    <h3 className="text-base font-semibold text-slate-100">{entry.term}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{entry.definition}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

