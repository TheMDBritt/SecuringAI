'use client';
import { useState, useMemo, useEffect } from 'react';
import type { TopicArticle } from '@/types';
import { TOPIC_ARTICLES } from '@/lib/playbook-content';

const CERT_BADGE: Record<string, string> = {
  'SecAI':        'bg-red-500/10 text-red-400 border-red-500/30',
  'AWS-AIF-C01':  'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Azure-AI900':  'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Azure-AI102':  'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Google-MLE':   'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'GIAC-GOAA':    'bg-orange-500/10 text-orange-400 border-orange-500/30',
  'GIAC-GASAE':   'bg-orange-500/10 text-orange-400 border-orange-500/30',
  'CAISP':        'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'IBM-AIE':      'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
};

const CATEGORIES = Array.from(new Set(TOPIC_ARTICLES.map((a) => a.category)));

// Inline markdown renderer: headings, bold, inline code, fenced code blocks, tables, lists, paragraphs
function renderMarkdown(md: string): string {
  // 1. Fenced code blocks (``` ... ```) — must run before inline code
  md = md.replace(/```[\w]*\n([\s\S]*?)```/g, (_, code) =>
    `<pre class="bg-slate-800 border border-slate-700 rounded-lg p-3 my-3 overflow-x-auto"><code class="text-[11px] font-mono text-violet-300 whitespace-pre">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`,
  );

  // 2. Tables — | col | col | rows
  md = md.replace(/((?:^\|.+\|\n?)+)/gm, (block) => {
    const rows = block.trim().split('\n').filter((r) => !/^\s*\|[-| :]+\|\s*$/.test(r));
    const toCell = (row: string, tag: string) =>
      row
        .split('|')
        .slice(1, -1)
        .map((c) => `<${tag} class="px-3 py-1.5 text-left border border-slate-700 text-[11px]">${c.trim()}</${tag}>`)
        .join('');
    const [head, ...body] = rows;
    return `<div class="overflow-x-auto my-3"><table class="w-full border-collapse text-slate-300"><thead class="bg-slate-800"><tr>${toCell(head, 'th')}</tr></thead><tbody>${body.map((r) => `<tr class="border-t border-slate-700 hover:bg-slate-800/40">${toCell(r, 'td')}</tr>`).join('')}</tbody></table></div>`;
  });

  // 3. Headings
  md = md
    .replace(/^## (.+)$/gm, '<h3 class="text-sm font-semibold text-slate-100 mt-5 mb-1.5">$1</h3>')
    .replace(/^### (.+)$/gm, '<h4 class="text-xs font-semibold text-slate-300 mt-3 mb-1">$1</h4>');

  // 4. Bold
  md = md.replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-100 font-semibold">$1</strong>');

  // 5. Inline code (after fenced blocks already removed)
  md = md.replace(/`([^`]+)`/g, '<code class="text-[11px] bg-slate-700/60 text-violet-300 px-1 py-0.5 rounded font-mono">$1</code>');

  // 6. Lists
  md = md
    .replace(/^- (.+)$/gm, '<li class="text-sm text-slate-300 leading-relaxed ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="text-sm text-slate-300 leading-relaxed ml-4 list-decimal">$2</li>')
    .replace(/(<li[\s\S]*?<\/li>\n?)+/g, '<ul class="space-y-0.5 my-2">$&</ul>');

  // 7. Paragraphs — wrap non-tag lines
  md = md
    .replace(/\n\n/g, '\n')
    .replace(/^(?!<[htupd])(.+)$/gm, '<p class="text-sm text-slate-300 leading-relaxed my-2">$1</p>');

  return md;
}

interface TopicBrowserProps {
  certFilter?: string;
}

export default function TopicBrowser({ certFilter }: TopicBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0] ?? '');
  const [selectedArticle, setSelectedArticle]   = useState<TopicArticle | null>(null);

  const articlesForCategory = useMemo(
    () =>
      TOPIC_ARTICLES.filter(
        (a) =>
          a.category === selectedCategory &&
          (!certFilter || a.certTags.includes(certFilter)),
      ),
    [selectedCategory, certFilter],
  );

  // Auto-select first article when the filtered list changes and current selection is no longer in it
  useEffect(() => {
    if (articlesForCategory.length > 0 && !articlesForCategory.find((a) => a.id === selectedArticle?.id)) {
      setSelectedArticle(articlesForCategory[0] ?? null);
    }
  }, [articlesForCategory, selectedArticle?.id]);

  return (
    <div className="flex h-full min-h-0">
      {/* ── Left: category + article list ─────────────────────────────────── */}
      <div className="w-56 shrink-0 border-r border-slate-700 flex flex-col overflow-hidden">
        <div className="px-3 py-2 border-b border-slate-700">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide">Categories</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {CATEGORIES.map((cat) => {
            const count = TOPIC_ARTICLES.filter(
              (a) => a.category === cat && (!certFilter || a.certTags.includes(certFilter)),
            ).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={[
                  'w-full text-left px-3 py-2.5 text-[11px] border-b border-slate-700/40 transition-colors flex items-center justify-between gap-1',
                  selectedCategory === cat
                    ? 'bg-violet-500/10 text-violet-300 border-l-2 border-l-violet-500'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300',
                ].join(' ')}
              >
                <span className="truncate">{cat}</span>
                <span className="text-[9px] font-mono text-slate-600 shrink-0">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Article list for selected category */}
        {articlesForCategory.length > 0 && (
          <div className="border-t border-slate-700">
            <div className="px-3 py-2 border-b border-slate-700">
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide">Articles</p>
            </div>
            {articlesForCategory.map((article) => (
              <button
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className={[
                  'w-full text-left px-3 py-2 text-[11px] border-b border-slate-700/30 transition-colors',
                  selectedArticle?.id === article.id
                    ? 'bg-violet-500/10 text-violet-300'
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
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {!selectedArticle ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-600 font-mono text-sm">Select an article to read</p>
          </div>
        ) : (
          <>
            {/* Article header */}
            <div className="mb-4 pb-4 border-b border-slate-700">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400">
                  {selectedArticle.category}
                </span>
                {selectedArticle.certTags.map((tag) => (
                  <span
                    key={tag}
                    className={[
                      'text-[10px] font-mono px-1.5 py-0.5 rounded border',
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
                  <span className="text-[10px] font-mono text-slate-600">Key terms:</span>
                  {selectedArticle.vocab.map((v) => (
                    <span key={v} className="text-[10px] font-mono text-violet-400/70 hover:text-violet-400 cursor-default">
                      {v}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Article body */}
            <div
              className="prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedArticle.content) }}
            />

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
                        className="text-xs text-slate-500 hover:text-violet-400 transition-colors"
                      >
                        ← {prev.title}
                      </button>
                    ) : <span />}
                    {next ? (
                      <button
                        onClick={() => setSelectedArticle(next)}
                        className="text-xs text-slate-500 hover:text-violet-400 transition-colors"
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
