'use client';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { PlaybookSection, QuizQuestion } from '@/types';
import dynamic from 'next/dynamic';
import { useTabList } from '@/components/hooks/useTabList';

// Each section owns a multi-megabyte data module: the quiz bank alone is 2.2 MB
// of source. Importing them statically put every one of them in the first
// chunk for /playbook, so opening the page downloaded and parsed the whole
// library before the reader had picked a tab. Loading them on demand means a
// visit costs only the section actually opened.
//
// ssr is left on so each section still server-renders when linked directly.
const loading = () => (
  <div className="flex h-full items-center justify-center p-8">
    <p className="text-xs font-mono text-slate-400" role="status" aria-live="polite">
      Loading section...
    </p>
  </div>
);

const TopicBrowser      = dynamic(() => import('./TopicBrowser'),      { loading });
const GlossaryPanel     = dynamic(() => import('./GlossaryPanel'),     { loading });
const CertMap           = dynamic(() => import('./CertMap'),           { loading });
const QuizEngine        = dynamic(() => import('./QuizEngine'),        { loading });
const PortalDrills      = dynamic(() => import('./PortalDrills'),      { loading });
const ProgressDashboard = dynamic(() => import('./ProgressDashboard'), { loading });

export interface PlaybookCounts {
  questions: number;
  glossary: number;
  articles: number;
  certs: number;
}

function buildSections(c: PlaybookCounts): { id: PlaybookSection; label: string; count?: string; desc: string }[] {
  return [
    { id: 'topics',   label: 'Topics',   count: String(c.articles),                desc: `${c.articles} articles` },
    { id: 'glossary', label: 'Glossary', count: c.glossary.toLocaleString(),       desc: `${c.glossary.toLocaleString()} terms` },
    { id: 'certs',    label: 'Certs',    count: String(c.certs),                   desc: `${c.certs} exams` },
    { id: 'quiz',     label: 'Quiz',     count: c.questions.toLocaleString(),      desc: `${c.questions.toLocaleString()} questions` },
    { id: 'progress', label: 'Progress',                                           desc: 'Your quiz history' },
    { id: 'drills',   label: 'Drills',                                             desc: 'Scenario drills' },
  ];
}

const VALID_SECTIONS: readonly PlaybookSection[] = ['topics', 'glossary', 'certs', 'quiz', 'progress', 'drills'];

export default function PlaybookView({ counts }: { counts: PlaybookCounts }) {
  const SECTIONS = buildSections(counts);
  const params  = useSearchParams();
  const initialSection: PlaybookSection = (() => {
    const raw = params?.get('section');
    return raw && (VALID_SECTIONS as readonly string[]).includes(raw) ? (raw as PlaybookSection) : 'topics';
  })();
  const initialSessionParam = params?.get('session') ?? null;

  const [section,    setSection]    = useState<PlaybookSection>(initialSection);
  const [certFilter, setCertFilter] = useState<string>('');
  const [deepLinkSession, setDeepLinkSession] = useState<string | null>(initialSessionParam);

  // Follow query-param changes without a full remount (browser back/forward,
  // in-app <Link> updates).
  useEffect(() => {
    const nextSection = params?.get('section');
    if (nextSection && (VALID_SECTIONS as readonly string[]).includes(nextSection)) {
      setSection(nextSection as PlaybookSection);
    }
    const nextSession = params?.get('session');
    if (nextSession) setDeepLinkSession(nextSession);
  }, [params]);

  // Retake / drill launch, Progress-tab review view hands us a resolved
  // QuizQuestion[]; we flip to the Quiz section and hand the list to
  // QuizEngine via its preloadedQuestions prop. Cleared after the quiz
  // completes (QuizEngine calls onSessionEnd).
  const [preload, setPreload] = useState<{ questions: QuizQuestion[]; label: string } | null>(null);

  const tabs = useTabList(SECTIONS.map((s) => s.id), section, setSection);

  const handleLaunchQuiz = useCallback((questions: QuizQuestion[], label: string) => {
    if (questions.length === 0) return;
    setPreload({ questions, label });
    setSection('quiz');
  }, []);

  const clearPreload = useCallback(() => { setPreload(null); }, []);

  const handleCertFilter = (certId: string) => {
    setCertFilter(certId);
    setSection('topics');
  };

  const activeSection = SECTIONS.find((s) => s.id === section);

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-900">
      <div className="flex shrink-0 flex-col gap-2 border-b border-slate-700 bg-slate-900 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="shrink-0 text-sm font-semibold text-slate-100">Playbook</h1>
          <span className="text-slate-500 text-xs shrink-0">/</span>
          <span className="text-micro font-mono text-slate-400 shrink-0 hidden sm:block">
            {activeSection?.desc ?? ''}
          </span>
          {certFilter && (
            <div className="flex items-center gap-1 ml-1">
              <span className="text-micro font-mono px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/20 text-brand-400">
                {certFilter}
              </span>
              <button
                onClick={() => setCertFilter('')}
                className="text-micro text-slate-400 hover:text-slate-400 leading-none"
                aria-label="Clear cert filter"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Six tabs do not fit a phone. The strip scrolls instead of pushing the
            page into a horizontal overflow. */}
        <div
          className="-mx-1 flex items-center gap-0.5 overflow-x-auto px-1 pb-0.5 sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0"
          role="tablist"
          aria-label="Playbook sections"
          {...tabs.listProps}
        >
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              {...tabs.tabProps(s.id)}
              className={[
                'shrink-0 px-2.5 py-1.5 rounded text-2xs font-mono transition-colors duration-150 flex items-center gap-1',
                section === s.id
                  ? 'bg-brand-500/10 border border-brand-500/30 text-brand-300'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700',
              ].join(' ')}
            >
              {s.label}
              {s.count && (
                <span className={[
                  'text-micro font-mono',
                  // brand-500 at 60% alpha measured 3.2:1 on the panel ground.
                  section === s.id ? 'text-brand-300' : 'text-slate-500',
                ].join(' ')}>
                  {s.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden" {...tabs.panelProps(section)}>
        {section === 'topics'   && <TopicBrowser certFilter={certFilter || undefined} />}
        {section === 'glossary' && <GlossaryPanel />}
        {section === 'certs'    && <CertMap onCertFilter={handleCertFilter} />}
        {section === 'quiz'     && (
          <QuizEngine
            preloadedQuestions={preload?.questions}
            preloadedLabel={preload?.label}
            onSessionEnd={clearPreload}
          />
        )}
        {section === 'progress' && (
          <ProgressDashboard onLaunchQuiz={handleLaunchQuiz} initialSessionId={deepLinkSession} />
        )}
        {section === 'drills'   && <PortalDrills />}
      </div>
    </div>
  );
}
