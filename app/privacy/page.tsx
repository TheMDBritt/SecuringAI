import Link from 'next/link';
import { Card, PageHeader, SectionHeading } from '@/components/ui';

export const metadata = {
  title: 'Privacy',
  description:
    'What Securing AI stores, what leaves your browser, and what happens to text you type into the dojos.',
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
          You cannot create an account here, and without one your study progress
          never leaves your browser. Two things do leave it. Text you type into
          the AI-backed dojo features is sent to a third-party model provider so
          it can answer. And the site owner, whose address is the only one
          permitted to sign in, can enable an optional sync that copies their own
          progress between their own devices.
        </p>
      </Card>

      <Card className="mt-4 space-y-4 p-5">
        <SectionHeading title="What stays on your device" />
        <p className="text-sm leading-relaxed text-slate-300">
          Quiz results, dojo attempts, scores and interface preferences are stored
          in your browser&rsquo;s <code className="text-brand-300">localStorage</code>{' '}
          under the keys <code className="text-brand-300">securingai:progress:v1</code>,{' '}
          <code className="text-brand-300">dojo-progress-v1</code> and{' '}
          <code className="text-brand-300">securingai:settings:v1</code>.
        </p>
        <p className="text-sm leading-relaxed text-slate-300">
          This data is never transmitted anywhere. It is not backed up. Clearing
          your site data, switching browsers, switching devices, or using private
          browsing will lose it. You can export it from{' '}
          <Link href="/settings" className="text-brand-400 underline">
            Settings
          </Link>
          .
        </p>
      </Card>

      <Card className="mt-4 space-y-4 p-5">
        <SectionHeading title="What leaves your browser" />
        <p className="text-sm leading-relaxed text-slate-300">
          The chat-based dojos and the question generator send your text to this
          site&rsquo;s own server, which forwards it to an external large language
          model provider and returns the reply. Concretely, that means:
        </p>
        <ul className="ml-4 list-disc space-y-2 text-sm leading-relaxed text-slate-300">
          <li>
            Messages you type in the dojos, and the scenario you selected, are sent
            to the model provider.
          </li>
          <li>
            The provider processes that text under its own privacy terms and
            retention schedule, which this project does not control.
          </li>
          <li>
            Do not paste real credentials, customer data, client names, or
            anything confidential into the dojos. Treat every input as if it will
            be read by someone else.
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-slate-300">
          Question and article text is fetched from this site&rsquo;s own origin as you
          open it, rather than shipped up front, so a visit does not download the whole
          bank. Those requests carry no cookies and nothing identifying about you, and
          they go nowhere but here. Everything else, including scoring, the glossary and
          the drills, runs in your browser.
        </p>
      </Card>

      <Card className="mt-4 space-y-4 p-5">
        <SectionHeading title="What this app does not do" />
        <ul className="ml-4 list-disc space-y-2 text-sm leading-relaxed text-slate-300">
          <li>
            No public sign-up. Account creation is refused at the database for
            every address except the owner&rsquo;s, so no visitor can create one.
          </li>
          <li>No passwords. The owner&rsquo;s sign-in is a single-use emailed link.</li>
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
          Because you cannot create an account, this project holds no personal
          data of yours to look up, correct, or delete. You control your own data
          directly: clear it any time from{' '}
          <Link href="/settings" className="text-brand-400 underline">
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
            className="text-brand-400 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/themdbritt/securingai
          </a>
          . See also the{' '}
          <Link href="/terms" className="text-brand-400 underline">
            terms of use
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
