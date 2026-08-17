import Link from 'next/link';
import { Card, PageHeader, SectionHeading } from '@/components/ui';

export const metadata = {
  title: 'Terms of use',
  description:
    'Terms covering study material accuracy, acceptable use of the AI dojos, trademarks, and liability.',
};

const UPDATED = '12 August 2026';

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Legal"
        title="Terms of use"
        description={`Plain-language terms for using this project. Last updated ${UPDATED}.`}
      />

      <Card className="mt-6 space-y-4 p-5">
        <SectionHeading title="What this is" />
        <p className="text-sm leading-relaxed text-slate-300">
          Securing AI is a free, independent study project for AI security
          certifications. It is provided as-is, with no warranty, no service level
          and no guarantee of availability. Features may change or disappear.
        </p>
      </Card>

      <Card className="mt-4 space-y-4 p-5">
        <SectionHeading title="Study material is not exam content" />
        <p className="text-sm leading-relaxed text-slate-300">
          Practice questions here are original, written against publicly published
          exam objectives. They are not real exam questions and this project has no
          access to any provider&rsquo;s question bank.
        </p>
        <p className="text-sm leading-relaxed text-slate-300">
          Scoring well here does not predict or guarantee a passing result on any
          certification exam. Exam objectives, codes and weightings change without
          notice. Confirm current objectives with the official provider before you
          schedule. Content may contain errors; if you find one, please report it.
        </p>
      </Card>

      <Card className="mt-4 space-y-4 p-5">
        <SectionHeading title="Acceptable use of the dojos" />
        <p className="text-sm leading-relaxed text-slate-300">
          The dojos teach adversarial techniques against AI systems, including
          prompt injection and jailbreak framings. The payloads are illustrative
          study material, not working exploits, and every scenario runs against a
          simulated target.
        </p>
        <p className="text-sm leading-relaxed text-slate-300">By using the dojos you agree that you will not:</p>
        <ul className="ml-4 list-disc space-y-2 text-sm leading-relaxed text-slate-300">
          <li>
            apply anything learned here against systems you do not own or lack
            written authorisation to test;
          </li>
          <li>
            submit real credentials, personal data, client data, or confidential
            material into any input;
          </li>
          <li>
            attempt to exhaust, bypass, or automate around the rate limits and
            usage budget that keep this free for everyone;
          </li>
          <li>use the AI features to generate genuinely harmful content.</li>
        </ul>
        <p className="text-sm leading-relaxed text-slate-300">
          Unauthorised testing of live systems is illegal in most jurisdictions.
          That is your responsibility, not this project&rsquo;s.
        </p>
      </Card>

      <Card className="mt-4 space-y-4 p-5">
        <SectionHeading title="Availability of AI features" />
        <p className="text-sm leading-relaxed text-slate-300">
          The AI-backed dojos depend on a paid third-party model provider funded
          personally. They are protected by a shared daily capacity limit. When
          that limit is reached the AI features pause until it resets, while the
          rest of the app keeps working. This is not a fault.
        </p>
      </Card>

      <Card className="mt-4 space-y-4 p-5">
        <SectionHeading title="Trademarks" />
        <p className="text-sm leading-relaxed text-slate-300">
          Certification names, exam codes, product names and logos belong to their
          respective owners and are used only to identify the subject matter
          studied. This project is not affiliated with, authorised by, endorsed by,
          or sponsored by CompTIA, Microsoft, Amazon Web Services, Google,
          EC-Council, GIAC, SANS Institute, ISC2, ISACA, OWASP, MITRE, NIST or ISO.
        </p>
      </Card>

      <Card className="mt-4 space-y-4 p-5">
        <SectionHeading title="Your data" />
        <p className="text-sm leading-relaxed text-slate-300">
          Progress is stored in your browser and can be lost at any time.
          Export anything you want to keep. See the{' '}
          <Link href="/privacy" className="text-brand-400 underline">
            privacy notice
          </Link>{' '}
          for what leaves your device.
        </p>
      </Card>

      <Card className="mt-4 space-y-4 p-5">
        <SectionHeading title="Liability" />
        <p className="text-sm leading-relaxed text-slate-300">
          To the fullest extent permitted by law, this project and its
          contributors are not liable for any loss arising from use of the site,
          including exam outcomes, lost progress data, or the consequences of
          applying techniques described here. The source is released under the MIT
          licence, which disclaims all warranties.
        </p>
      </Card>

      <Card className="mt-4 space-y-3 p-5">
        <SectionHeading title="Contact" />
        <p className="text-sm leading-relaxed text-slate-300">
          Open an issue at{' '}
          <a
            href="https://github.com/themdbritt/securingai/issues"
            className="text-brand-400 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/themdbritt/securingai
          </a>
          .
        </p>
      </Card>
    </div>
  );
}
