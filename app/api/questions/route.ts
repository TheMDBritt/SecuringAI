import { NextResponse } from 'next/server';
import { QUIZ_QUESTIONS } from '@/lib/playbook-quiz';

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
 */
export const dynamic = 'force-dynamic';

const MAX_IDS = 400;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cert = searchParams.get('cert');
  const ids = searchParams.get('ids');

  // Immutable content, so it can sit in the browser and CDN cache for a day.
  const headers = { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' };

  if (ids) {
    const wanted = new Set(ids.split(',').filter(Boolean).slice(0, MAX_IDS));
    return NextResponse.json(QUIZ_QUESTIONS.filter((q) => wanted.has(q.id)), { headers });
  }

  if (cert) {
    return NextResponse.json(QUIZ_QUESTIONS.filter((q) => q.certTags.includes(cert)), { headers });
  }

  return NextResponse.json({ error: 'Specify cert or ids' }, { status: 400 });
}
