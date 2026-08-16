import { NextResponse } from 'next/server';
import { QUIZ_QUESTIONS } from '@/lib/playbook-quiz';
import { EXAM_CERTS } from '@/lib/cert-exam-domains';

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
 * Note that the payload includes the correct answer, because the client grades
 * the quiz. That is a property of the design, not of this route, and it was
 * equally true when the whole bank was bundled. Client-side grading cannot be
 * made tamper-proof; it would take server-side sessions, which the app
 * deliberately avoids since it has no accounts.
 */


const MAX_IDS = 400;
/** Bounds the split before it happens, rather than slicing the result of it. */
const MAX_IDS_CHARS = MAX_IDS * 40;

/** Only real exam ids are answerable, so an unknown cert costs a comparison. */
const KNOWN_CERTS = new Set(EXAM_CERTS.map((c) => c.id));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cert = searchParams.get('cert');
  const ids = searchParams.get('ids');

  // Immutable content, so it can sit in the browser and CDN cache for a day.
  /**
   * These responses depend on the query string, which makes the route dynamic,
   * and Next emits `Cache-Control: no-store` for dynamic routes. A second
   * header set here does not replace it, it joins it, and `no-store` wins. So
   * rather than advertise caching that never happens, the responses stay small
   * and the genuinely shared content, article bodies, is served as static files
   * from public/ instead.
   */
  const cached = (body: unknown, status = 200) => NextResponse.json(body, { status });

  if (ids) {
    if (ids.length > MAX_IDS_CHARS) {
      return NextResponse.json({ error: 'Too many ids' }, { status: 413 });
    }
    const wanted = new Set(ids.split(',').filter(Boolean).slice(0, MAX_IDS));
    return cached(QUIZ_QUESTIONS.filter((q) => wanted.has(q.id)));
  }

  if (cert) {
    // An arbitrary string would otherwise scan the whole bank to return an
    // empty array, which is free work for a caller and none for us.
    if (!KNOWN_CERTS.has(cert)) {
      return NextResponse.json({ error: 'Unknown cert' }, { status: 400 });
    }
    return cached(QUIZ_QUESTIONS.filter((q) => q.certTags.includes(cert)));
  }

  return NextResponse.json({ error: 'Specify cert or ids' }, { status: 400 });
}
