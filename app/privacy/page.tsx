import Link from 'next/link';
import { Card, PageHeader, SectionHeading } from '@/components/ui';

export const metadata = {
  title: 'Privacy',
  description:
    'What Securing AI stores, what leaves your browser, and what happens to text you type into the labs.',
};

const UPDATED = '12 August 2026';

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Legal"
        title="Privacy"
        description={`How this app handles your data. Last updated ${UPDATED}.`}
      />

      <Card className="mt-6 space-y-4 p-5">
        <SectionHeading title="The short version" />
        <p className="text-sm leading-relaxed text-slate-300">
          There are no accounts. Your study progress never leaves your browser.
          The one exception is the AI-backed lab features: text you type there is
          sent to a third-party model provider so it can answer.
        </p>
      </Card>

      <Card className="mt-4 space-y-4 p-5">
        <SectionHeading title="What stays on your device" />
        <p className="text-sm leading-relaxed text-slate-300">
          Quiz results, lab attempts, scores and interface preferences are stored
          in your browser&rsquo;s <code className="text-violet-300">localStorage</code>{' '}
          under the keys <code className="text-violet-300">securingai:progress:v1</code>{' '}
          and <code className="text-violet-300">securingai:settings:v1</code>.
        </p>
        <p className="text-sm leading-relaxed text-slate-300">
          This data is never transmitted anywhere. It is not backed up. Clearing
          your site data, switching browsers, switching devices, or using private
          browsing will lose it. You can export it from{' '}
          <Link href="/settings" className="text-violet-400 underline">
            Settings
          </Link>
          .
        </p>
      </Card>

      <Card className="mt-4 space-y-4 p-5">
        <SectionHeading title="What leaves your browser" />
        <p className="text-sm leading-relaxed text-slate-300">
          The chat-based labs and the question generator send your text to this
          site&rsquo;s own server, which forwards it to an external large language
          model provider and returns the reply. Concretely, that means:
        </p>
        <ul className="ml-4 list-disc space-y-2 text-sm leading-relaxed text-slate-300">
          <li>
            Messages you type in the labs, and the scenario you selected, are sent
            to the model provider.
          </li>
          <li>
            The provider processes that text under its own privacy terms and
            retention schedule, which this project does not control.
          </li>
          <li>
            Do not paste real credentials, customer data, client names, or
            anything confidential into the labs. Treat every input as if it will
            be read by someone else.
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-slate-300">
          Everything else, including the entire Playbook, the quiz bank, the
          glossary and the drills, runs locally in your browser with no network
          calls.
        </p>
      </Card>

      <Card className="mt-4 space-y-4 p-5">
        <SectionHeading title="What this app does not do" />
        <ul className="ml-4 list-disc space-y-2 text-sm leading-relaxed text-slate-300">
          <li>No accounts, sign-ups, email addresses or passwords.</li>
          <li>No analytics, telemetry, pixels, or third-party scripts.</li>
          <li>No advertising and no data sold or shared with anyone.</li>
          <li>No cookies are set by this application.</li>
        </ul>
      </Card>

      <Card className="mt-4 space-y-4 p-5">
        <SectionHeading title="Server logs" />
        <p className="text-sm leading-relaxed text-slate-300">
          Requests to the AI-backed routes are rate limited by IP address, held in
          memory only and discarded when the server instance recycles. The hosting
          provider keeps its own standard request logs. Application errors are
          written to the server console and may include the text of a failed
          request.
        </p>
      </Card>

      <Card className="mt-4 space-y-4 p-5">
        <SectionHeading title="Your rights" />
        <p className="text-sm leading-relaxed text-slate-300">
          Because there are no accounts, this project holds no personal data to
          look up, correct, or delete. You control your own data directly: clear
          it any time from{' '}
          <Link href="/settings" className="text-violet-400 underline">
            Settings
          </Link>{' '}
          or by clearing site data in your browser.
        </p>
        <p className="text-sm leading-relaxed text-slate-300">
          For anything text you sent to the model provider, that provider is the
          data controller for its own processing.
        </p>
      </Card>

      <Card className="mt-4 space-y-3 p-5">
        <SectionHeading title="Contact" />
        <p className="text-sm leading-relaxed text-slate-300">
          Questions or corrections: open an issue at{' '}
          <a
            href="https://github.com/themdbritt/securingai/issues"
            className="text-violet-400 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/themdbritt/securingai
          </a>
          . See also the{' '}
          <Link href="/terms" className="text-violet-400 underline">
            terms of use
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
