import Link from 'next/link';

/**
 * One-line version for full-height app routes.
 *
 * The full notice is a block of prose and would steal height from a scroll
 * container. This is a single fixed-height strip that states the essential
 * claim and links to the full text on /terms.
 */
export function TrademarkNoticeCompact() {
  return (
    <div className="flex shrink-0 items-center justify-center gap-2 border-t border-slate-800 bg-slate-950/80 px-3 py-1.5 text-center">
      <p className="text-[11px] leading-none text-slate-500">
        Independent study project, not affiliated with or endorsed by any
        certification provider.{' '}
        <Link
          href="/terms"
          className="text-slate-400 underline underline-offset-2 hover:text-slate-200"
        >
          Trademarks and terms
        </Link>
      </p>
    </div>
  );
}

/**
 * Trademark and affiliation notice.
 *
 * This app names third-party certification programmes to describe what its
 * study material covers. That is nominative fair use, but it only holds if the
 * notice is actually legible and states plainly that the marks belong to their
 * owners and that none of them endorse this project. The previous notice was
 * 10px slate-700 on a dark background and appeared on two pages out of nine,
 * which met neither bar.
 *
 * Rendered once per page from AppShell, so every route carries it.
 */
export function TrademarkNotice({ className = '' }: { className?: string }) {
  return (
    <aside
      aria-label="Trademark and affiliation notice"
      className={`border-t border-slate-800 bg-slate-950/60 px-4 py-4 sm:px-6 ${className}`}
    >
      <div className="mx-auto max-w-5xl space-y-2">
        <p className="text-xs leading-relaxed text-slate-400">
          <strong className="font-semibold text-slate-300">
            Independent and unaffiliated.
          </strong>{' '}
          Securing AI is an independent study project. It is not affiliated with,
          authorised by, endorsed by, or sponsored by CompTIA, Microsoft, Amazon
          Web Services, Google, EC-Council, GIAC, SANS Institute, ISC2, ISACA,
          OWASP, MITRE, NIST or ISO.
        </p>
        <p className="text-xs leading-relaxed text-slate-400">
          All certification names, exam codes, product names and logos are the
          trademarks or registered trademarks of their respective owners, used
          here only to identify the subject matter being studied. Practice
          questions are original material written against publicly published exam
          objectives. They are not actual exam questions and reproduce no
          copyrighted exam content.
        </p>
        <p className="text-xs leading-relaxed text-slate-500">
          Always confirm current exam objectives with the official provider
          before scheduling. Exam codes and weightings change.
        </p>
      </div>
    </aside>
  );
}
