'use client';
import { useState, useMemo } from 'react';
import type { GlossaryTerm } from '@/types';
import { GLOSSARY_TERMS } from '@/lib/playbook-glossary';

const CERT_BADGE: Record<string, string> = {
  'SecAI':        'bg-red-500/10 text-red-400 border-red-500/30',
  'AWS-AIF-C01':  'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Azure-AI900':  'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Azure-AI102':  'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Google-MLE':   'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'GIAC-GOAA':    'bg-orange-500/10 text-orange-400 border-orange-500/30',
  'GIAC-GASAE':   'bg-orange-500/10 text-orange-400 border-orange-500/30',
  'CAISP':        'bg-purple-500/10 text-purple-400 border-purple-500/30',
};

const ALPHABET   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const CERT_LIST  = ['All', 'SecAI', 'AWS-AIF-C01', 'Azure-AI900', 'Azure-AI102', 'Google-MLE', 'GIAC-GOAA', 'GIAC-GASAE', 'CAISP'];

export default function GlossaryPanel() {
  const [search, setSearch]     = useState('');
  const [jumpLetter, setJump]   = useState('');
  const [certFilter, setCert]   = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered: GlossaryTerm[] = useMemo(() => {
    const q = search.toLowerCase();
    return GLOSSARY_TERMS
      .filter((t) =>
        !q || t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q),
      )
      .filter((t) => !jumpLetter || t.term.toUpperCase().startsWith(jumpLetter))
      .filter((t) => certFilter === 'All' || t.certTags.includes(certFilter))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [search, jumpLetter, certFilter]);

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
          <button onClick={() => setSearch('')} className="text-slate-600 hover:text-slate-400 text-xs">✕</button>
        )}
        <span className="text-[10px] text-slate-600 font-mono">{filtered.length} terms</span>
      </div>

      {/* Cert filter */}
      <div className="flex flex-wrap gap-1 px-4 py-2 border-b border-slate-700">
        {CERT_LIST.map((c) => (
          <button
            key={c}
            onClick={() => setCert(certFilter === c ? 'All' : c)}
            className={[
              'text-[10px] font-mono px-2 py-0.5 rounded border transition-colors',
              certFilter === c
                ? (CERT_BADGE[c] ?? 'bg-violet-500/20 text-violet-300 border-violet-500/30')
                : 'text-slate-600 border-slate-700 hover:text-slate-400 hover:border-slate-600',
            ].join(' ')}
          >
            {c}
          </button>
        ))}
      </div>

      {/* A–Z jump bar */}
      <div className="flex flex-wrap gap-0.5 px-4 py-2 border-b border-slate-700">
        <button
          onClick={() => setJump('')}
          className={[
            'text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors',
            !jumpLetter ? 'bg-violet-500/20 text-violet-300' : 'text-slate-600 hover:text-slate-400',
          ].join(' ')}
        >
          All
        </button>
        {ALPHABET.map((l) => (
          <button
            key={l}
            onClick={() => { setJump(jumpLetter === l ? '' : l); setSearch(''); }}
            className={[
              'text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors',
              jumpLetter === l ? 'bg-violet-500/20 text-violet-300' : 'text-slate-600 hover:text-slate-400',
            ].join(' ')}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Term list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {filtered.length === 0 && (
          <p className="text-sm text-slate-600 font-mono mt-8 text-center">No terms match your search.</p>
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
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400">
                      {term.category}
                    </span>
                  </div>
                  {!isOpen && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{term.definition}</p>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 text-slate-600 shrink-0 mt-0.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-slate-700/50 bg-slate-800/30">
                  <p className="text-sm text-slate-300 mt-3 leading-relaxed">{term.definition}</p>
                  {term.certTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {term.certTags.map((tag) => (
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
                  )}
                  {term.related.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wide">Related: </span>
                      <span className="text-[11px] text-violet-400">{term.related.join(' · ')}</span>
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
