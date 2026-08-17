'use client';
import { useState, useMemo, useEffect } from 'react';
import type { GlossaryTerm } from '@/types';
import { GLOSSARY_INDEX } from '@/lib/glossary-index';

/**
 * Glossary data, split by what the surface actually needs at each moment.
 *
 * The list and the A-Z filter run off the generated index, 77kB. Definitions
 * are fetched for the term being read, and a debounced server search covers
 * the definition-body matching the client can no longer do locally. Bundling
 * all 774 definitions cost 584kB to read one.
 */
const defCache = new Map<string, GlossaryTerm>();

// Cert badges are identity, not state. They were red, amber, brand and
// emerald, assigned per cert with no meaning, in the colours the scorer
// uses for FAIL, WARN and PASS.
const CERT_BADGE: Record<string, string> = {
  'SecAI':        'bg-slate-500/10 text-slate-300 border-slate-600/60',
  'AWS-AIF-C01':  'bg-slate-500/10 text-slate-300 border-slate-600/60',
  'Azure-AI901':  'bg-slate-500/10 text-slate-300 border-slate-600/60',
  'Azure-AI103':  'bg-slate-500/10 text-slate-300 border-slate-600/60',
  'Google-MLE':   'bg-slate-500/10 text-slate-300 border-slate-600/60',
  'GIAC-GOAA':    'bg-slate-500/10 text-slate-300 border-slate-600/60',
  'GIAC-GASAE':   'bg-slate-500/10 text-slate-300 border-slate-600/60',
  'CAISP':        'bg-slate-500/10 text-slate-300 border-slate-600/60',
  'CAIS':         'bg-slate-500/10 text-slate-300 border-slate-600/60',
  'SC-500':       'bg-slate-500/10 text-slate-300 border-slate-600/60',
};

const ALPHABET   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const CERT_LIST  = ['All', 'SecAI', 'SC-500', 'AWS-AIF-C01', 'Azure-AI901', 'Azure-AI103', 'Google-MLE', 'GIAC-GOAA', 'GIAC-GASAE', 'CAISP', 'CAIS'];

export default function GlossaryPanel() {
  const [search, setSearch]     = useState('');
  const [jumpLetter, setJump]   = useState('');
  const [certFilter, setCert]   = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [defs, setDefs] = useState<Record<string, GlossaryTerm>>({});

  // Fetch the definition when a term is opened, unless the search already
  // brought it back.
  useEffect(() => {
    if (!expanded) return;
    const cached = defCache.get(expanded);
    if (cached) {
      setDefs((d) => (d[expanded] ? d : { ...d, [expanded]: cached }));
      return;
    }
    let live = true;
    fetch(`/api/content?terms=${encodeURIComponent(expanded)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((hits: GlossaryTerm[]) => {
        for (const h of hits) defCache.set(h.term, h);
        if (live && hits[0]) setDefs((d) => ({ ...d, [expanded]: hits[0] }));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [expanded]);

  // Server-side matches on definition bodies, merged with the instant local
  // match on term names so typing stays responsive and deep search still works.
  const [deepMatches, setDeepMatches] = useState<Set<string> | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = search.trim();
    if (q.length < 3) {
      setDeepMatches(null);
      setSearching(false);
      return;
    }
    let live = true;
    setSearching(true);
    const t = setTimeout(() => {
      fetch(`/api/content?q=${encodeURIComponent(q)}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((hits: GlossaryTerm[]) => {
          for (const h of hits) defCache.set(h.term, h);
          if (live) {
            setDeepMatches(new Set(hits.map((h) => h.term)));
            setSearching(false);
          }
        })
        .catch(() => {
          if (live) setSearching(false);
        });
    }, 220);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [search]);

  // Stage 1: apply search + cert filter (used to determine available A Z letters)
  const certFiltered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return GLOSSARY_INDEX
      .filter((t) => !q || t.term.toLowerCase().includes(q) || (deepMatches?.has(t.term) ?? false))
      .filter((t) => certFilter === 'All' || t.certTags.includes(certFilter))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [search, certFilter, deepMatches]);

  // Stage 2: apply jump letter on top of stage 1
  const filtered = useMemo(() => {
    if (!jumpLetter) return certFiltered;
    return certFiltered.filter((t) => t.term.toUpperCase().startsWith(jumpLetter));
  }, [certFiltered, jumpLetter]);

  // Letters that have at least one term in the current cert+search result
  const availableLetters = useMemo(
    () => new Set(certFiltered.map((t) => t.term[0].toUpperCase())),
    [certFiltered],
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Search bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
        <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search terms or definitions…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setJump(''); }}
          className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-slate-400 text-xs">✕</button>
        )}
        <span className="text-micro text-slate-400 font-mono">{certFiltered.length} terms</span>
      </div>

      {/* Cert filter */}
      <div className="flex flex-wrap gap-1 px-4 py-2 border-b border-slate-700">
        {CERT_LIST.map((c) => (
          <button
            key={c}
            onClick={() => setCert(certFilter === c ? 'All' : c)}
            className={[
              'text-micro font-mono px-2 py-0.5 rounded border transition-colors',
              certFilter === c
                ? (CERT_BADGE[c] ?? 'bg-brand-500/20 text-brand-300 border-brand-500/30')
                : 'text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-600',
            ].join(' ')}
          >
            {c}
          </button>
        ))}
      </div>

      {/* A Z jump bar */}
      <div className="flex flex-wrap gap-0.5 px-4 py-2 border-b border-slate-700">
        <button
          onClick={() => setJump('')}
          className={[
            'text-micro font-mono px-1.5 py-0.5 rounded transition-colors',
            !jumpLetter ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400',
          ].join(' ')}
        >
          All
        </button>
        {ALPHABET.map((l) => {
          const has = availableLetters.has(l);
          return (
            <button
              key={l}
              onClick={() => { if (has) { setJump(jumpLetter === l ? '' : l); setSearch(''); } }}
              disabled={!has}
              className={[
                'text-micro font-mono px-1.5 py-0.5 rounded transition-colors',
                jumpLetter === l
                  ? 'bg-brand-500/20 text-brand-300'
                  : has
                    ? 'text-slate-500 hover:text-slate-300'
                    : 'text-slate-500/40 cursor-default',
              ].join(' ')}
            >
              {l}
            </button>
          );
        })}
      </div>

      {/* Term list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {filtered.length === 0 && (
          <p className="mt-8 text-center font-mono text-sm text-slate-400">
            {searching ? 'Searching definitions…' : 'No terms match your search.'}
          </p>
        )}
        {filtered.map((term) => {
          const isOpen = expanded === term.term;
          return (
            <div
              key={term.term}
              className="border border-slate-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpanded(isOpen ? null : term.term)}
                className="w-full text-left flex items-start justify-between gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-100">{term.term}</span>
                    <span className="text-micro font-mono px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/20 text-brand-400">
                      {term.category}
                    </span>
                  </div>
                  {!isOpen && defCache.get(term.term) && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                      {defCache.get(term.term)!.definition}
                    </p>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 text-slate-400 shrink-0 mt-0.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-slate-700/50 bg-slate-800/30">
                  {defs[term.term] ? (
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                      {defs[term.term].definition}
                    </p>
                  ) : (
                    <div role="status" aria-live="polite" className="mt-3 space-y-2">
                      <div className="h-3 w-11/12 animate-pulse rounded bg-slate-800" />
                      <div className="h-3 w-8/12 animate-pulse rounded bg-slate-800" />
                      <span className="sr-only">Loading definition</span>
                    </div>
                  )}
                  {term.certTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {term.certTags.map((tag) => (
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
                  )}
                  {(defs[term.term]?.related.length ?? 0) > 0 && (
                    <div className="mt-3">
                      <span className="font-mono text-micro uppercase tracking-wide text-slate-400">Related: </span>
                      <span className="text-2xs text-brand-400">{defs[term.term]!.related.join(' · ')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
