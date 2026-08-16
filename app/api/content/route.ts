import { NextResponse } from 'next/server';
import { GLOSSARY_TERMS } from '@/lib/playbook-glossary';

/**
 * Serves article and glossary bodies.
 *
 * The browser shows one article and one definition at a time, but both
 * collections were bundled whole: 476kB of article markdown on every Playbook
 * load, and 584kB of definitions the moment the Glossary tab opened. The lists
 * and filters run off generated indexes; this returns the body being read.
 *
 *   GET /api/content?terms=<a>|<b>
 *   GET /api/content?q=<search>
 */


const MAX_TERMS = 200;
const MAX_TERMS_CHARS = MAX_TERMS * 60;
/** Long needles cost a full scan of every definition for no useful result. */
const MAX_QUERY_CHARS = 80;
const MIN_QUERY_CHARS = 2;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  /**
   * These responses depend on the query string, which makes the route dynamic,
   * and Next emits `Cache-Control: no-store` for dynamic routes. A second
   * header set here does not replace it, it joins it, and `no-store` wins. So
   * rather than advertise caching that never happens, the responses stay small
   * and the genuinely shared content, article bodies, is served as static files
   * from public/ instead.
   */
  const cached = (body: unknown, status = 200) => NextResponse.json(body, { status });

  // Full-text search across definitions. The glossary index only carries term
  // names, so searching definition bodies happens here rather than by shipping
  // every definition to the browser.
  const q = searchParams.get('q');
  if (q) {
    // The client debounces and requires three characters, but the client is
    // not the only caller, so the limits are enforced here as well.
    if (q.length > MAX_QUERY_CHARS) {
      return NextResponse.json({ error: 'Query too long' }, { status: 413 });
    }
    if (q.trim().length < MIN_QUERY_CHARS) {
      return cached([]);
    }
    const needle = q.toLowerCase();
    const hits = GLOSSARY_TERMS.filter(
      (t) =>
        t.term.toLowerCase().includes(needle) ||
        t.definition.toLowerCase().includes(needle),
    ).slice(0, 120);
    return cached(hits);
  }

  const terms = searchParams.get('terms');
  if (terms) {
    if (terms.length > MAX_TERMS_CHARS) {
      return NextResponse.json({ error: 'Too many terms' }, { status: 413 });
    }
    const wanted = new Set(terms.split('|').filter(Boolean).slice(0, MAX_TERMS));
    return cached(GLOSSARY_TERMS.filter((t) => wanted.has(t.term)));
  }

  return NextResponse.json({ error: 'Specify q or terms' }, { status: 400 });
}
