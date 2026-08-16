import { NextResponse } from 'next/server';
import { TOPIC_ARTICLES } from '@/lib/playbook-content';
import { GLOSSARY_TERMS } from '@/lib/playbook-glossary';

/**
 * Serves article and glossary bodies.
 *
 * The browser shows one article and one definition at a time, but both
 * collections were bundled whole: 476kB of article markdown on every Playbook
 * load, and 584kB of definitions the moment the Glossary tab opened. The lists
 * and filters run off generated indexes; this returns the body being read.
 *
 *   GET /api/content?article=<id>
 *   GET /api/content?terms=<a>|<b>
 *   GET /api/content?q=<search>
 */
export const dynamic = 'force-dynamic';

const MAX_TERMS = 200;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const headers = { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' };

  const articleId = searchParams.get('article');
  if (articleId) {
    const article = TOPIC_ARTICLES.find((a) => a.id === articleId);
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(article, { headers });
  }

  // Full-text search across definitions. The glossary index only carries term
  // names, so searching definition bodies happens here rather than by shipping
  // every definition to the browser.
  const q = searchParams.get('q');
  if (q) {
    const needle = q.toLowerCase();
    const hits = GLOSSARY_TERMS.filter(
      (t) =>
        t.term.toLowerCase().includes(needle) ||
        t.definition.toLowerCase().includes(needle),
    ).slice(0, 120);
    return NextResponse.json(hits, { headers });
  }

  const terms = searchParams.get('terms');
  if (terms) {
    const wanted = new Set(terms.split('|').filter(Boolean).slice(0, MAX_TERMS));
    return NextResponse.json(
      GLOSSARY_TERMS.filter((t) => wanted.has(t.term)),
      { headers },
    );
  }

  return NextResponse.json({ error: 'Specify article or terms' }, { status: 400 });
}
