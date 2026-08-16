'use client';
import { useState, useMemo, useEffect } from 'react';
import { ARTICLE_INDEX, type ArticleIndexEntry } from '@/lib/article-index';
import { renderMarkdown } from '@/lib/markdown';
import type { TopicArticle } from '@/types';

/**
 * Loads one article body, cached for the session.
 *
 * All 98 articles were bundled on every Playbook visit, 476kB, to render the
 * one being read.
 */
const articleCache = new Map<string, TopicArticle>();

function useArticle(id: string | null): { article: TopicArticle | null; loading: boolean } {
  const [article, setArticle] = useState<TopicArticle | null>(id ? articleCache.get(id) ?? null : null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setArticle(null);
      return;
    }
    const cached = articleCache.get(id);
    if (cached) {
      setArticle(cached);
      setLoading(false);
      return;
    }
    let live = true;
    setLoading(true);
    // Static file, so this is served from cache after the first read.
    fetch(`/content/articles/${encodeURIComponent(id)}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((a: TopicArticle) => {
        articleCache.set(id, a);
        if (live) {
          setArticle(a);
          setLoading(false);
        }
      })
      .catch(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [id]);

  return { article, loading };
}

const CERT_BADGE: Record<string, string> = {
  'SecAI':        'bg-red-500/10 text-red-400 border-red-500/30',
  'AWS-AIF-C01':  'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Azure-AI901':  'bg-brand-500/10 text-brand-400 border-brand-500/30',
  'Azure-AI103':  'bg-brand-500/10 text-brand-400 border-brand-500/30',
  'Google-MLE':   'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'GIAC-GOAA':    'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'GIAC-GASAE':   'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'CAISP':        'bg-brand-500/10 text-brand-400 border-brand-500/30',
  'CAIS':         'bg-red-500/10 text-red-400 border-red-500/30',
  'SC-500':       'bg-brand-500/10 text-brand-400 border-brand-500/30',
};

const CATEGORIES = Array.from(new Set(ARTICLE_INDEX.map((a) => a.category)));

// Inline markdown renderer: headings, bold, inline code, fenced code blocks, tables, lists, paragraphs

interface TopicBrowserProps {
  certFilter?: string;
}

export default function TopicBrowser({ certFilter }: TopicBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0] ?? '');
  const [selectedArticle, setSelectedArticle]   = useState<ArticleIndexEntry | null>(null);
  // Below md the two panes cannot coexist, 390px split two ways leaves the
  // article wrapping every few words. One pane shows at a time instead.
  const [mobilePane, setMobilePane] = useState<'list' | 'article'>('list');

  const articlesForCategory = useMemo(
    () =>
      ARTICLE_INDEX.filter(
        (a) =>
          a.category === selectedCategory &&
          (!certFilter || a.certTags.includes(certFilter)),
      ),
    [selectedCategory, certFilter],
  );

  const { article: articleBody, loading: articleLoading } = useArticle(selectedArticle?.id ?? null);

  // Auto-select first article when the filtered list changes and current selection is no longer in it
  useEffect(() => {
    if (articlesForCategory.length > 0 && !articlesForCategory.find((a) => a.id === selectedArticle?.id)) {
      setSelectedArticle(articlesForCategory[0] ?? null);
    }
  }, [articlesForCategory, selectedArticle?.id]);

  return (
    <div className="flex h-full min-h-0">
      {/* ── Left: category + article list ─────────────────────────────────── */}
      <div
        className={[
          'flex flex-col overflow-hidden border-slate-700',
          'w-full md:w-56 md:shrink-0 md:border-r',
          mobilePane === 'list' ? 'flex' : 'hidden md:flex',
        ].join(' ')}
      >
        <div className="px-3 py-2 border-b border-slate-700">
          <p className="text-micro font-mono text-slate-400 uppercase tracking-wide">Categories</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {CATEGORIES.map((cat) => {
            const count = ARTICLE_INDEX.filter(
              (a) => a.category === cat && (!certFilter || a.certTags.includes(certFilter)),
            ).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={[
                  'w-full text-left px-3 py-2.5 text-2xs border-b border-slate-700/40 transition-colors flex items-center justify-between gap-1',
                  selectedCategory === cat
                    ? 'bg-brand-500/10 text-brand-300 border-l-2 border-l-brand-500'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300',
                ].join(' ')}
              >
                <span className="truncate">{cat}</span>
                <span className="text-micro font-mono text-slate-400 shrink-0">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Article list for selected category */}
        {articlesForCategory.length > 0 && (
          <div className="border-t border-slate-700">
            <div className="px-3 py-2 border-b border-slate-700">
              <p className="text-micro font-mono text-slate-400 uppercase tracking-wide">Articles</p>
            </div>
            {articlesForCategory.map((article) => (
              <button
                key={article.id}
                onClick={() => { setSelectedArticle(article); setMobilePane('article'); }}
                className={[
                  'w-full text-left px-3 py-2 text-2xs border-b border-slate-700/30 transition-colors',
                  selectedArticle?.id === article.id
                    ? 'bg-brand-500/10 text-brand-300'
                    : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300',
                ].join(' ')}
              >
                {article.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Right: article content ─────────────────────────────────────────── */}
      <div
        className={[
          'flex-1 overflow-y-auto px-4 py-5 sm:px-6',
          mobilePane === 'article' ? 'block' : 'hidden md:block',
        ].join(' ')}
      >
        <button
          onClick={() => setMobilePane('list')}
          className="mb-4 text-2xs font-mono text-slate-500 hover:text-slate-300 md:hidden"
        >
          &larr; All articles
        </button>
        {!selectedArticle ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400 font-mono text-sm">Select an article to read</p>
          </div>
        ) : (
          <>
            {/* Article header */}
            <div className="mb-4 pb-4 border-b border-slate-700">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-micro font-mono px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/20 text-brand-400">
                  {selectedArticle.category}
                </span>
                {selectedArticle.certTags.map((tag) => (
                  <span
                    key={tag}
                    className={[
                      'text-micro font-mono px-1.5 py-0.5 rounded border',
                      CERT_BADGE[tag] ?? 'bg-slate-700 text-slate-400 border-slate-600',
                    ].join(' ')}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-lg font-bold text-slate-100">{selectedArticle.title}</h2>
              {selectedArticle.vocab.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-micro font-mono text-slate-400">Key terms:</span>
                  {selectedArticle.vocab.map((v) => (
                    <span key={v} className="text-micro font-mono text-brand-400/70 hover:text-brand-400 cursor-default">
                      {v}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Article body, fetched for the article being read */}
            {articleLoading && !articleBody ? (
              <div role="status" aria-live="polite" className="space-y-2.5 py-2">
                {[92, 78, 96, 64].map((w, i) => (
                  <div
                    key={i}
                    className="h-3 animate-pulse rounded bg-slate-800"
                    style={{ width: `${w}%` }}
                  />
                ))}
                <span className="sr-only">Loading article</span>
              </div>
            ) : articleBody ? (
              <div
                className="prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(articleBody.content) }}
              />
            ) : (
              <p role="alert" className="text-sm text-slate-400">
                This article could not be loaded. Check your connection and select it again.
              </p>
            )}

            {/* Navigation */}
            <div className="mt-8 pt-4 border-t border-slate-700 flex items-center justify-between">
              {(() => {
                const idx = articlesForCategory.findIndex((a) => a.id === selectedArticle.id);
                const prev = articlesForCategory[idx - 1];
                const next = articlesForCategory[idx + 1];
                return (
                  <>
                    {prev ? (
                      <button
                        onClick={() => setSelectedArticle(prev)}
                        className="text-xs text-slate-500 hover:text-brand-400 transition-colors"
                      >
                        ← {prev.title}
                      </button>
                    ) : <span />}
                    {next ? (
                      <button
                        onClick={() => setSelectedArticle(next)}
                        className="text-xs text-slate-500 hover:text-brand-400 transition-colors"
                      >
                        {next.title} →
                      </button>
                    ) : <span />}
                  </>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
