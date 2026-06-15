'use client';
import { useState } from 'react';
import type { PlaybookSection } from '@/types';
import TopicBrowser  from './TopicBrowser';
import GlossaryPanel from './GlossaryPanel';
import CertMap       from './CertMap';
import QuizEngine    from './QuizEngine';
import PortalDrills  from './PortalDrills';

const SECTIONS: { id: PlaybookSection; label: string; count?: string; desc: string }[] = [
  { id: 'topics',   label: 'Topics',   count: '76',   desc: '76 articles' },
  { id: 'glossary', label: 'Glossary', count: '910',  desc: '910 terms' },
  { id: 'certs',    label: 'Certs',    count: '10',   desc: '10 exams' },
  { id: 'quiz',     label: 'Quiz',     count: '1800+', desc: '1,800+ questions' },
  { id: 'drills',   label: 'Drills',  count: '15',  desc: '15 portal drills' },
];

export default function PlaybookView() {
  const [section,    setSection]    = useState<PlaybookSection>('topics');
  const [certFilter, setCertFilter] = useState<string>('');

  const handleCertFilter = (certId: string) => {
    setCertFilter(certId);
    setSection('topics');
  };

  const activeSection = SECTIONS.find((s) => s.id === section);

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-900">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 shrink-0 gap-3 bg-slate-900">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-slate-100 shrink-0">Playbook</span>
          <span className="text-slate-700 text-xs shrink-0">/</span>
          <span className="text-[10px] font-mono text-slate-600 shrink-0 hidden sm:block">
            {activeSection?.desc ?? ''}
          </span>
          {certFilter && (
            <div className="flex items-center gap-1 ml-1">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400">
                {certFilter}
              </span>
              <button
                onClick={() => setCertFilter('')}
                className="text-[10px] text-slate-600 hover:text-slate-400 leading-none"
                aria-label="Clear cert filter"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0" role="tablist" aria-label="Playbook sections">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={section === s.id}
              onClick={() => setSection(s.id)}
              className={[
                'px-2.5 py-1.5 rounded text-[11px] font-mono transition-colors duration-150 flex items-center gap-1',
                section === s.id
                  ? 'bg-violet-500/10 border border-violet-500/30 text-violet-300'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700',
              ].join(' ')}
            >
              {s.label}
              {s.count && (
                <span className={[
                  'text-[9px] font-mono',
                  section === s.id ? 'text-violet-500/60' : 'text-slate-700',
                ].join(' ')}>
                  {s.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden" role="tabpanel">
        {section === 'topics'   && <TopicBrowser certFilter={certFilter || undefined} />}
        {section === 'glossary' && <GlossaryPanel />}
        {section === 'certs'    && <CertMap onCertFilter={handleCertFilter} />}
        {section === 'quiz'     && <QuizEngine />}
        {section === 'drills'   && <PortalDrills />}
      </div>
    </div>
  );
}
