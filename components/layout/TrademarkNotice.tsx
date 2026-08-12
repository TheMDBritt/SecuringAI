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
