'use client';
import { useState } from 'react';
import type { PlaybookSection } from '@/types';
import TopicBrowser  from './TopicBrowser';
import GlossaryPanel from './GlossaryPanel';
import CertMap       from './CertMap';
import QuizEngine    from './QuizEngine';

const SECTIONS: { id: PlaybookSection; label: string; icon: string }[] = [
  { id: 'topics',   label: 'Topics',   icon: '📚' },
  { id: 'glossary', label: 'Glossary', icon: '📖' },
  { id: 'certs',    label: 'Certs',    icon: '🎓' },
  { id: 'quiz',     label: 'Quiz',     icon: '✏️'  },
];

export default function PlaybookView() {
  const [section,    setSection]    = useState<PlaybookSection>('topics');
  const [certFilter, setCertFilter] = useState<string>('');

  const handleCertFilter = (certId: string) => {
    setCertFilter(certId);
    setSection('topics');
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-900">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700 shrink-0">
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <span className="text-[10px] text-violet-400 font-bold">P</span>
          </div>
          <span className="text-sm font-semibold text-slate-100">Playbook</span>
          {certFilter && (
            <div className="flex items-center gap-1 ml-2">
              <span className="text-[10px] font-mono text-slate-600">Filtered:</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400">
                {certFilter}
              </span>
              <button
                onClick={() => setCertFilter('')}
                className="text-[10px] text-slate-600 hover:text-slate-400 ml-0.5"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Section tabs */}
        <div className="flex items-center gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-mono transition-colors',
                section === s.id
                  ? 'bg-violet-500/10 border border-violet-500/30 text-violet-300'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700',
              ].join(' ')}
            >
              <span className="text-[11px]">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content area ─────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {section === 'topics'   && <TopicBrowser certFilter={certFilter || undefined} />}
        {section === 'glossary' && <GlossaryPanel />}
        {section === 'certs'    && <CertMap onCertFilter={handleCertFilter} />}
        {section === 'quiz'     && <QuizEngine />}
      </div>
    </div>
  );
}
