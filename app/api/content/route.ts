import { NextResponse } from 'next/server';
import { GLOSSARY_TERMS } from '@/lib/playbook-glossary';
import { boundedList, isOverBudget } from '@/lib/api-params';

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
/** Long needles cost a full scan of every definition for no useful result. */
const MAX_QUERY_CHARS = 80;
const MIN_QUERY_CHARS = 2;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

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
      return NextResponse.json([]);
    }
    const needle = q.toLowerCase();
    const hits = GLOSSARY_TERMS.filter(
      (t) =>
        t.term.toLowerCase().includes(needle) ||
        t.definition.toLowerCase().includes(needle),
    ).slice(0, 120);
    return NextResponse.json(hits);
  }

  const terms = searchParams.get('terms');
  if (terms) {
    const wanted = boundedList(terms, { max: MAX_TERMS, separator: '|', label: 'terms' });
    if (isOverBudget(wanted)) return wanted;
    return NextResponse.json(GLOSSARY_TERMS.filter((t) => wanted.has(t.term)));
  }

  return NextResponse.json({ error: 'Specify q or terms' }, { status: 400 });
}
