import { NextResponse } from 'next/server';
import { QUIZ_QUESTIONS } from '@/lib/playbook-quiz';
import { EXAM_CERTS } from '@/lib/cert-exam-domains';
import { boundedList, isOverBudget } from '@/lib/api-params';

/**
 * Serves question bodies.
 *
 * The bank is 2.2MB bundled. Every learner drills one certification at a time,
 * and the review screens only ever need the handful of questions someone has
 * actually answered, so shipping all of it to every browser was paying for
 * the whole library to read one shelf.
 *
 *   GET /api/questions?cert=SecAI    every question tagged for that exam
 *   GET /api/questions?ids=a,b,c     specific questions, for session review
 *
 * The payload is static, but the response depends on the query string, so the
 * route stays dynamic and carries its own long cache headers instead. Marking
 * it force-static made Next prerender a single parameterless response, which
 * returned the 400 branch for every real request.
 *
 * Everything served here is public study material, so there is nothing to
 * withhold. The limits below are about cost and abuse: a short request must not
 * be able to command an unbounded amount of work or an unbounded response.
 *
 * These responses are not cacheable, because next.config.js sets no-store on
 * /api/:path* and a header set here joins that rather than replacing it. That
 * default is correct for the routes carrying user text, which is why the
 * genuinely shared content is served as static files from public/ instead.
 *
 * Note that the payload includes the correct answer, because the client grades
 * the quiz. That is a property of the design, not of this route, and it was
 * equally true when the whole bank was bundled. Client-side grading cannot be
 * made tamper-proof; it would take server-side sessions, which the app
 * deliberately avoids since it has no accounts.
 */


const MAX_IDS = 400;

/** Only real exam ids are answerable, so an unknown cert costs a comparison. */
const KNOWN_CERTS = new Set(EXAM_CERTS.map((c) => c.id));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cert = searchParams.get('cert');
  const ids = searchParams.get('ids');

  // Immutable content, so it can sit in the browser and CDN cache for a day.

  if (ids) {
    const wanted = boundedList(ids, { max: MAX_IDS, label: 'ids' });
    if (isOverBudget(wanted)) return wanted;
    return NextResponse.json(QUIZ_QUESTIONS.filter((q) => wanted.has(q.id)));
  }

  if (cert) {
    // An arbitrary string would otherwise scan the whole bank to return an
    // empty array, which is free work for a caller and none for us.
    if (!KNOWN_CERTS.has(cert)) {
      return NextResponse.json({ error: 'Unknown cert' }, { status: 400 });
    }
    return NextResponse.json(QUIZ_QUESTIONS.filter((q) => q.certTags.includes(cert)));
  }

  return NextResponse.json({ error: 'Specify cert or ids' }, { status: 400 });
}
