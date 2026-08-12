'use client';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { PlaybookSection, QuizQuestion } from '@/types';
import TopicBrowser      from './TopicBrowser';
import GlossaryPanel     from './GlossaryPanel';
import CertMap           from './CertMap';
import QuizEngine        from './QuizEngine';
import PortalDrills      from './PortalDrills';
import ProgressDashboard from './ProgressDashboard';
import { QUIZ_QUESTIONS } from '@/lib/playbook-quiz';
import { GLOSSARY_TERMS } from '@/lib/playbook-glossary';

const Q_COUNT = QUIZ_QUESTIONS.length.toLocaleString();
const G_COUNT = GLOSSARY_TERMS.length.toLocaleString();

const SECTIONS: { id: PlaybookSection; label: string; count?: string; desc: string }[] = [
  { id: 'topics',   label: 'Topics',   count: '76',      desc: '76 articles' },
  { id: 'glossary', label: 'Glossary', count: G_COUNT,   desc: `${G_COUNT} terms` },
  { id: 'certs',    label: 'Certs',    count: '11',      desc: '11 exams' },
  { id: 'quiz',     label: 'Quiz',     count: Q_COUNT,   desc: `${Q_COUNT} questions` },
  { id: 'progress', label: 'Progress',                   desc: 'Your quiz history' },
  { id: 'drills',   label: 'Drills',                     desc: 'Scenario drills' },
];

const VALID_SECTIONS: readonly PlaybookSection[] = ['topics', 'glossary', 'certs', 'quiz', 'progress', 'drills'];

export default function PlaybookView() {
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
