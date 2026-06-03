'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import type { QuizQuestion, QuizDifficulty } from '@/types';
import { generateQuizQuestions } from '@/lib/playbook-quiz-gen';
import {
  CERT_DOMAIN_CONFIGS,
  getQuestionsByCertAndDomains,
  getDomainCounts,
  type CertDomainConfig,
} from '@/lib/cert-domain-map';

// ─── Types ────────────────────────────────────────────────────────────────────
type SetupStep = 'cert' | 'domain' | 'config';
type QuizMode  = 'setup' | 'question' | 'result' | 'summary';

interface QuizSettings {
  cert:       string;
  certName:   string;
  domains:    string[];   // empty = all
  difficulty: QuizDifficulty | 'all';
  count:      10 | 25 | 50 | 60 | 100;
  examMode?:  boolean;
  examSec?:   number;
}

interface QuizResult {
  question:  QuizQuestion;
  chosen:    number | null;
  correct:   boolean;
  skipped?:  boolean;
  timeTaken: number;
}

// ─── Cert badge colors (matches rest of app) ──────────────────────────────────
const CERT_BADGE: Record<string, string> = {
  'SecAI':        'bg-red-500/10 text-red-400 border-red-500/30',
  'AWS-AIF-C01':  'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Azure-AI901':  'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Azure-AI103':  'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'SC-500':       'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  'Google-MLE':   'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'GIAC-GOAA':    'bg-orange-500/10 text-orange-400 border-orange-500/30',
  'GIAC-GASAE':   'bg-orange-500/10 text-orange-400 border-orange-500/30',
  'CAISP':        'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'CAIS':         'bg-rose-500/10 text-rose-400 border-rose-500/30',
  'CISSP':        'bg-sky-500/10 text-sky-400 border-sky-500/30',
  'CISM':         'bg-teal-500/10 text-teal-400 border-teal-500/30',
};

const CERT_TEXT: Record<string, string> = {
  'SecAI':        'text-red-400',
  'AWS-AIF-C01':  'text-amber-400',
  'Azure-AI901':  'text-blue-400',
  'Azure-AI103':  'text-blue-400',
  'SC-500':       'text-cyan-400',
  'Google-MLE':   'text-emerald-400',
  'GIAC-GOAA':    'text-orange-400',
  'GIAC-GASAE':   'text-orange-400',
  'CAISP':        'text-purple-400',
  'CAIS':         'text-rose-400',
  'CISSP':        'text-sky-400',
  'CISM':         'text-teal-400',
};

const DIFFICULTY_STYLE: Record<QuizDifficulty, string> = {
  beginner:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  advanced:     'bg-red-500/10 text-red-400 border-red-500/30',
};

const COUNT_OPTIONS  = [10, 25, 50, 100] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleOptions(q: QuizQuestion): QuizQuestion {
  const order: number[] = [0, 1, 2, 3];
  for (let i = 3; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    ...q,
    options: order.map((i) => q.options[i]) as [string, string, string, string],
    correct: order.indexOf(q.correct) as 0 | 1 | 2 | 3,
    optionExplanations: q.optionExplanations
      ? (order.map((i) => q.optionExplanations![i]) as [string, string, string, string])
      : undefined,
  };
}

function breakAnswerStreaks(qs: QuizQuestion[]): QuizQuestion[] {
  const out = [...qs];
  for (let i = 2; i < out.length; i++) {
    let attempts = 0;
    while (
      out[i].correct === out[i - 1].correct &&
      out[i].correct === out[i - 2].correct &&
      attempts < 10
    ) {
      out[i] = shuffleOptions(out[i]);
      attempts++;
    }
  }
  return out;
}

// ─── Step 1: Cert Selection ───────────────────────────────────────────────────
function CertSelectStep({ onSelect }: { onSelect: (cert: CertDomainConfig) => void }) {
  return (
    <div className="h-full overflow-y-auto px-4 py-5">
      <div className="mb-4">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-1">Step 1 of 3</p>
        <h2 className="text-base font-semibold text-slate-100">Select a certification to study</h2>
        <p className="text-xs text-slate-500 mt-1">Questions are drawn from that exam&apos;s official domain objectives.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CERT_DOMAIN_CONFIGS.map((cert) => {
          const total = getQuestionsByCertAndDomains(cert.id, []).length;
          const badgeCls = CERT_BADGE[cert.id] ?? 'bg-slate-700 text-slate-400 border-slate-600';
          return (
            <button
              key={cert.id}
              onClick={() => onSelect(cert)}
              className="text-left p-3.5 rounded-lg border border-slate-700 hover:border-slate-500 bg-slate-800/30 hover:bg-slate-800/60 transition-colors duration-150 group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${badgeCls}`}>
                  {cert.id}
                </span>
                <span className="text-[10px] font-mono text-slate-600">{total} Q</span>
              </div>
              <p className="text-xs font-medium text-slate-200 leading-snug group-hover:text-slate-100 transition-colors">
                {cert.name}
              </p>
              <p className="text-[10px] text-slate-600 mt-1">
                {cert.domains.length} domains
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2: Domain Selection ─────────────────────────────────────────────────
function DomainSelectStep({
  cert,
  onBack,
  onNext,
}: {
  cert:   CertDomainConfig;
  onBack: () => void;
  onNext: (domains: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const domainCounts = useMemo(() => getDomainCounts(cert.id), [cert.id]);
  const allNames     = cert.domains.map((d) => d.name);
  const allSelected  = selected.length === 0 || selected.length === allNames.length;

  const toggle = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const effectiveCount = useMemo(() => {
    const domains = selected.length === 0 ? [] : selected;
    return getQuestionsByCertAndDomains(cert.id, domains).length;
  }, [cert.id, selected]);

  const badgeCls = CERT_BADGE[cert.id] ?? 'bg-slate-700 text-slate-400 border-slate-600';

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-700/50 shrink-0">
        <button
          onClick={onBack}
          className="text-[10px] font-mono text-slate-600 hover:text-slate-400 mb-2 flex items-center gap-1 transition-colors"
        >
          ← back
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${badgeCls}`}>
            {cert.id}
          </span>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Step 2 of 3</p>
        </div>
        <h2 className="text-sm font-semibold text-slate-100 mt-1">Select exam domains to drill</h2>
        <p className="text-xs text-slate-500">Leave all unchecked to include every domain.</p>
      </div>

      {/* Domain list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
        {/* All domains shortcut */}
        <button
          onClick={() => setSelected([])}
          className={[
            'w-full text-left px-3 py-2.5 rounded-lg border transition-colors duration-150',
            allSelected
              ? 'border-violet-500/50 bg-violet-500/8'
              : 'border-slate-700 hover:border-slate-600',
          ].join(' ')}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${allSelected ? 'text-violet-300' : 'text-slate-300'}`}>
              All domains
            </span>
            <span className="text-[10px] font-mono text-slate-600">
              {getQuestionsByCertAndDomains(cert.id, []).length} Q
            </span>
          </div>
        </button>

        <div className="border-t border-slate-800 my-1" />

        {cert.domains.map((d) => {
          const count    = domainCounts[d.name] ?? 0;
          const isActive = selected.includes(d.name);
          return (
            <button
              key={d.name}
              onClick={() => toggle(d.name)}
              className={[
                'w-full text-left px-3 py-2.5 rounded-lg border transition-colors duration-150',
                isActive
                  ? 'border-violet-500/50 bg-violet-500/8'
                  : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/40',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={[
                    'w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-colors',
                    isActive
                      ? 'border-violet-500 bg-violet-500'
                      : 'border-slate-600',
                  ].join(' ')}>
                    {isActive && (
                      <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs leading-snug ${isActive ? 'text-violet-200' : 'text-slate-300'}`}>
                    {d.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {d.weight && (
                    <span className="text-[9px] font-mono text-slate-700">{d.weight}</span>
                  )}
                  <span className="text-[10px] font-mono text-slate-600">{count} Q</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700/50 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-slate-600">
            {selected.length === 0
              ? `All domains · ${effectiveCount} questions available`
              : `${selected.length} domain${selected.length > 1 ? 's' : ''} · ${effectiveCount} questions available`}
          </span>
        </div>
        <button
          disabled={effectiveCount === 0}
          onClick={() => onNext(selected)}
          className="w-full py-2 rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          Configure quiz →
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Config + Start ───────────────────────────────────────────────────
function QuizConfigStep({
  cert,
  domains,
  onBack,
  onStart,
}: {
  cert:    CertDomainConfig;
  domains: string[];
  onBack:  () => void;
  onStart: (s: QuizSettings) => void;
}) {
  const [difficulty, setDifficulty] = useState<QuizDifficulty | 'all'>('all');
  const [count,      setCount]      = useState<10 | 25 | 50 | 60 | 100>(25);
  const [examMode,   setExamMode]   = useState(false);

  const pool = useMemo(() => {
    const base = getQuestionsByCertAndDomains(cert.id, domains);
    return base.filter(
      (q) => difficulty === 'all' || q.difficulty === difficulty,
    ).length;
  }, [cert.id, domains, difficulty]);

  const canExam = pool >= 60;
  const badgeCls = CERT_BADGE[cert.id] ?? 'bg-slate-700 text-slate-400 border-slate-600';
  const textCls  = CERT_TEXT[cert.id]  ?? 'text-slate-400';

  const domainSummary = domains.length === 0
    ? 'All domains'
    : domains.length <= 2
      ? domains.join(', ')
      : `${domains[0]} + ${domains.length - 1} more`;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 pt-4 pb-3 border-b border-slate-700/50 shrink-0">
        <button
          onClick={onBack}
          className="text-[10px] font-mono text-slate-600 hover:text-slate-400 mb-2 flex items-center gap-1 transition-colors"
        >
          ← back
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${badgeCls}`}>
            {cert.id}
          </span>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Step 3 of 3</p>
        </div>
        <h2 className="text-sm font-semibold text-slate-100 mt-1">Configure your session</h2>
        <p className={`text-[10px] font-mono mt-0.5 ${textCls} opacity-70`}>{domainSummary}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Difficulty */}
        <div>
          <label className="text-[10px] font-mono text-slate-600 uppercase tracking-wide block mb-2">Difficulty</label>
          <div className="flex gap-2">
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={[
                  'flex-1 py-1.5 rounded text-[11px] font-mono border transition-colors capitalize',
                  difficulty === d
                    ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                    : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400',
                ].join(' ')}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div>
          <label className="text-[10px] font-mono text-slate-600 uppercase tracking-wide block mb-2">Questions</label>
          <div className="flex gap-2">
            {COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => { setCount(n); if (n < 60) setExamMode(false); }}
                className={[
                  'flex-1 py-1.5 rounded text-[11px] font-mono border transition-colors',
                  count === n
                    ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                    : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400',
                ].join(' ')}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Mock exam toggle */}
        {canExam && (
          <div>
            <label className="text-[10px] font-mono text-slate-600 uppercase tracking-wide block mb-2">Exam Simulation</label>
            <button
              onClick={() => {
                const next = !examMode;
                setExamMode(next);
                if (next) setCount(60);
              }}
              className={[
                'w-full p-3 rounded-lg border text-left transition-colors duration-150',
                examMode
                  ? 'border-cyan-500/40 bg-cyan-500/5'
                  : 'border-slate-700 hover:border-slate-600',
              ].join(' ')}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-semibold ${examMode ? 'text-cyan-300' : 'text-slate-300'}`}>
                  Timed mock exam — 60 Q · 90 min · no hints
                </span>
                <div className={[
                  'w-8 h-4 rounded-full border transition-colors shrink-0',
                  examMode ? 'bg-cyan-500/30 border-cyan-500/50' : 'bg-slate-800 border-slate-700',
                ].join(' ')}>
                  <div className={[
                    'w-3 h-3 rounded-full bg-current transition-transform mt-0.5',
                    examMode ? 'ml-4 text-cyan-400' : 'ml-0.5 text-slate-600',
                  ].join(' ')} />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                No per-question feedback. Full results + domain breakdown at the end.
              </p>
            </button>
          </div>
        )}

        {/* Pool preview */}
        <div className="text-[11px] text-slate-600 font-mono">
          {pool} questions match · {Math.min(count, pool)} will be used
        </div>
      </div>

      <div className="px-4 py-3 border-t border-slate-700/50 shrink-0">
        <button
          disabled={pool === 0}
          onClick={() => onStart({
            cert:       cert.id,
            certName:   cert.name,
            domains,
            difficulty,
            count,
            examMode:   examMode || undefined,
            examSec:    examMode ? 90 * 60 : undefined,
          })}
          className="w-full py-2.5 rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          Start quiz →
        </button>
      </div>
    </div>
  );
}

// ─── Question Screen ──────────────────────────────────────────────────────────
function QuestionScreen({
  question, index, total, onAnswer, examMode, remainingSec, onAbandonExam, certId, certName,
}: {
  question:       QuizQuestion;
  index:          number;
  total:          number;
  onAnswer:       (chosen: number | null) => void;
  examMode?:      boolean;
  remainingSec?:  number;
  onAbandonExam?: () => void;
  certId:         string;
  certName:       string;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const progress = ((index + 1) / total) * 100;
  const textCls  = CERT_TEXT[certId] ?? 'text-slate-400';

  useEffect(() => { setChosen(null); }, [question.id]);

  const handleChoose = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    if (examMode) { onAnswer(i); return; }
    setTimeout(() => onAnswer(i), 900);
  };

  const timerStr = remainingSec !== undefined
    ? `${String(Math.floor(remainingSec / 60)).padStart(2, '0')}:${String(remainingSec % 60).padStart(2, '0')}`
    : null;
  const timerLow = remainingSec !== undefined && remainingSec <= 300;

  return (
    <div className="flex flex-col h-full min-h-0 px-6 py-5">
      {examMode && timerStr && (
        <div className={`mb-3 px-3 py-2 rounded border flex items-center justify-between ${timerLow ? 'border-red-500/40 bg-red-500/10' : 'border-cyan-500/30 bg-cyan-500/5'}`}>
          <span className={`text-[10px] font-mono ${timerLow ? 'text-red-400' : textCls}`}>
            {certId} · Mock Exam
          </span>
          <span className={`text-base font-mono font-bold ${timerLow ? 'text-red-300' : 'text-cyan-300'}`}>{timerStr}</span>
          <button
            onClick={onAbandonExam}
            className="text-[10px] font-mono text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-500 px-2 py-0.5 rounded"
          >
            end early
          </button>
        </div>
      )}

      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-slate-600">{index + 1} / {total}</span>
          <div className="flex gap-1.5 items-center">
            <span className={[
              'text-[10px] font-mono px-1.5 py-0.5 rounded border capitalize',
              DIFFICULTY_STYLE[question.difficulty],
            ].join(' ')}>
              {question.difficulty}
            </span>
            <span className="text-[10px] font-mono text-slate-600 max-w-[120px] truncate">{question.category}</span>
          </div>
        </div>
        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mb-5">
        <p className="text-sm text-slate-100 leading-relaxed font-medium">{question.question}</p>
      </div>

      <div className="space-y-2.5 flex-1">
        {question.options.map((opt, i) => {
          let style = 'border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800/50';
          if (chosen !== null) {
            if (examMode) {
              style = i === chosen
                ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-200'
                : 'border-slate-700/50 text-slate-600 opacity-60';
            } else if (i === question.correct) {
              style = 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
            } else if (i === chosen) {
              style = 'border-red-500 bg-red-500/10 text-red-300';
            } else {
              style = 'border-slate-700/50 text-slate-600 opacity-60';
            }
          }
          return (
            <button
              key={i}
              onClick={() => handleChoose(i)}
              disabled={chosen !== null}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-150 text-sm ${style}`}
            >
              <span className="font-mono text-[10px] mr-3 opacity-60">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          );
        })}
      </div>

      {examMode && (
        <button
          onClick={() => { if (chosen === null) onAnswer(null); }}
          disabled={chosen !== null}
          className="mt-3 w-full py-1.5 rounded text-[11px] font-mono text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-500 disabled:opacity-40 transition-colors"
        >
          Skip — leave unanswered
        </button>
      )}
    </div>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────────
function ResultScreen({
  result, index, total, onNext,
}: {
  result:  QuizResult;
  index:   number;
  total:   number;
  onNext:  () => void;
}) {
  return (
    <div className="flex flex-col h-full px-6 py-5">
      <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg border ${result.correct ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
        <span className={`text-lg font-mono ${result.correct ? 'text-emerald-400' : 'text-red-400'}`}>
          {result.correct ? '✓' : '✗'}
        </span>
        <span className={`text-sm font-semibold ${result.correct ? 'text-emerald-300' : 'text-red-300'}`}>
          {result.correct ? 'Correct' : 'Incorrect'}
        </span>
        <span className="text-[10px] font-mono text-slate-600 ml-auto">{index + 1}/{total}</span>
      </div>

      <div className="mb-4">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-1">Question</p>
        <p className="text-sm text-slate-300">{result.question.question}</p>
      </div>

      <div className="flex-1 mb-4 space-y-2 overflow-y-auto">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-2">Answer Breakdown</p>
        {result.question.options.map((opt, i) => {
          const isCorrect = i === result.question.correct;
          const isChosen  = i === result.chosen;
          const optExp    = result.question.optionExplanations?.[i];
          return (
            <div
              key={i}
              className={[
                'rounded-lg border px-3 py-2 text-xs leading-relaxed',
                isCorrect
                  ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300'
                  : isChosen
                    ? 'border-red-500/40 bg-red-500/5 text-red-300'
                    : 'border-slate-700/50 bg-slate-800/30 text-slate-500',
              ].join(' ')}
            >
              <span className="font-mono font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
              <span className={isCorrect ? 'font-semibold' : ''}>{opt}</span>
              {isCorrect && <span className="ml-2 text-emerald-500 font-bold">✓</span>}
              {!isCorrect && isChosen && <span className="ml-2 text-red-500 font-bold">✗</span>}
              {optExp && (
                <p className={`mt-1 ml-4 ${isCorrect ? 'text-emerald-400/80' : isChosen ? 'text-red-400/70' : 'text-slate-600'}`}>
                  {optExp}
                </p>
              )}
            </div>
          );
        })}
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-1">Why</p>
          <p className="text-xs text-slate-400 leading-relaxed">{result.question.explanation}</p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-2.5 rounded bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
      >
        {index + 1 >= total ? 'See results' : 'Next question →'}
      </button>
    </div>
  );
}

// ─── Summary Screen ───────────────────────────────────────────────────────────
function SummaryScreen({
  results,
  settings,
  onRestart,
  onNewCert,
  onGenerateMore,
}: {
  results:         QuizResult[];
  settings:        QuizSettings;
  onRestart:       () => void;
  onNewCert:       () => void;
  onGenerateMore:  (category: string) => void;
}) {
  const correct  = results.filter((r) => r.correct).length;
  const skipped  = results.filter((r) => r.skipped).length;
  const total    = results.length;
  const pct      = Math.round((correct / total) * 100);
  const answered = results.filter((r) => !r.skipped);
  const avgTime  = answered.length > 0
    ? Math.round(answered.reduce((s, r) => s + r.timeTaken, 0) / answered.length / 1000)
    : 0;

  const byCategory = useMemo(() => {
    const map: Record<string, { correct: number; total: number }> = {};
    results.forEach((r) => {
      const cat = r.question.category;
      if (!map[cat]) map[cat] = { correct: 0, total: 0 };
      map[cat].total++;
      if (r.correct) map[cat].correct++;
    });
    return Object.entries(map).sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total));
  }, [results]);

  const scoreColor = pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400';
  const badgeCls   = CERT_BADGE[settings.cert] ?? 'bg-slate-700 text-slate-400 border-slate-600';

  const domainSummary = settings.domains.length === 0
    ? 'All domains'
    : settings.domains.length <= 2
      ? settings.domains.join(', ')
      : `${settings.domains[0]} +${settings.domains.length - 1}`;

  return (
    <div className="overflow-y-auto h-full px-6 py-5">
      {/* Session info */}
      <div className="flex items-center gap-2 mb-5">
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${badgeCls}`}>
          {settings.cert}
        </span>
        <span className="text-[10px] font-mono text-slate-600 truncate">{domainSummary}</span>
      </div>

      {/* Score */}
      <div className="text-center mb-6">
        <div className={`text-5xl font-bold font-mono mb-1 ${scoreColor}`}>{pct}%</div>
        <p className="text-slate-400 text-sm">
          {correct} of {total} correct{skipped > 0 ? ` · ${skipped} skipped` : ''} · avg {avgTime}s
        </p>
        <p className={`text-sm font-semibold mt-1 ${scoreColor}`}>
          {pct >= 80
            ? 'Strong result — you know this material.'
            : pct >= 60
              ? 'Passing range — review the weak domains below.'
              : 'Below passing — target the red domains.'}
        </p>
      </div>

      {/* Domain/category breakdown */}
      <div className="mb-6">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-3">Topic Breakdown</p>
        <div className="space-y-2">
          {byCategory.map(([cat, stats]) => {
            const catPct   = Math.round((stats.correct / stats.total) * 100);
            const barColor = catPct >= 80 ? 'bg-emerald-500' : catPct >= 60 ? 'bg-amber-500' : 'bg-red-500';
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] text-slate-400 truncate max-w-[200px]">{cat}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-600">{stats.correct}/{stats.total}</span>
                    {catPct < 70 && (
                      <button
                        onClick={() => onGenerateMore(cat)}
                        className="text-[9px] font-mono text-violet-400 hover:text-violet-300 border border-violet-500/30 px-1.5 py-0.5 rounded transition-colors"
                      >
                        more →
                      </button>
                    )}
                  </div>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} rounded-full`} style={{ width: `${catPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onRestart}
          className="flex-1 py-2.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold transition-colors"
        >
          Same cert, again
        </button>
        <button
          onClick={onNewCert}
          className="flex-1 py-2.5 rounded border border-slate-700 hover:border-slate-500 text-slate-300 text-sm font-semibold transition-colors"
        >
          New cert
        </button>
      </div>
    </div>
  );
}

// ─── Root QuizEngine ──────────────────────────────────────────────────────────
export default function QuizEngine() {
  const [setupStep,      setSetupStep]      = useState<SetupStep>('cert');
  const [mode,           setMode]           = useState<QuizMode>('setup');
  const [selectedCert,   setSelectedCert]   = useState<CertDomainConfig | null>(null);
  const [selectedDomains,setSelectedDomains]= useState<string[]>([]);
  const [settings,       setSettings]       = useState<QuizSettings | null>(null);
  const [questions,      setQuestions]      = useState<QuizQuestion[]>([]);
  const [currentIndex,   setCurrentIndex]   = useState(0);
  const [results,        setResults]        = useState<QuizResult[]>([]);
  const [questionStart,  setQuestionStart]  = useState(0);
  const [examEndAt,      setExamEndAt]      = useState<number | null>(null);
  const [nowMs,          setNowMs]          = useState(() => Date.now());
  const [generating,     setGenerating]     = useState(false);
  const [genError,       setGenError]       = useState('');

  const handleStart = useCallback((s: QuizSettings) => {
    const base = getQuestionsByCertAndDomains(s.cert, s.domains);
    const pool = base.filter(
      (q) => s.difficulty === 'all' || q.difficulty === s.difficulty,
    );
    const selected = breakAnswerStreaks(shuffle(pool).slice(0, s.count).map(shuffleOptions));
    setSettings(s);
    setQuestions(selected);
    setResults([]);
    setCurrentIndex(0);
    setQuestionStart(Date.now());
    setExamEndAt(s.examMode && s.examSec ? Date.now() + s.examSec * 1000 : null);
    setMode('question');
  }, []);

  const handleAnswer = useCallback((chosen: number | null) => {
    const q       = questions[currentIndex];
    const elapsed = Date.now() - questionStart;
    const r: QuizResult = {
      question:  q,
      chosen,
      correct:   chosen !== null && chosen === q.correct,
      skipped:   chosen === null,
      timeTaken: elapsed,
    };
    const isLast = currentIndex + 1 >= questions.length;
    setResults((prev) => [...prev, r]);
    if (settings?.examMode) {
      if (isLast) { setExamEndAt(null); setMode('summary'); }
      else { setCurrentIndex((i) => i + 1); setQuestionStart(Date.now()); }
      return;
    }
    setMode('result');
  }, [questions, currentIndex, questionStart, settings]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setMode('summary');
    } else {
      setCurrentIndex((i) => i + 1);
      setQuestionStart(Date.now());
      setMode('question');
    }
  }, [currentIndex, questions.length]);

  useEffect(() => {
    if (!examEndAt) return;
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [examEndAt]);

  useEffect(() => {
    if (!examEndAt || nowMs < examEndAt) return;
    const remaining: QuizResult[] = [];
    for (let i = currentIndex; i < questions.length; i++) {
      remaining.push({ question: questions[i], chosen: null, correct: false, skipped: true, timeTaken: 0 });
    }
    setResults((prev) => [...prev, ...remaining]);
    setExamEndAt(null);
    setMode('summary');
  }, [nowMs, examEndAt, currentIndex, questions]);

  const handleAbandonExam = useCallback(() => {
    if (!settings?.examMode) return;
    const remaining: QuizResult[] = [];
    for (let i = currentIndex; i < questions.length; i++) {
      remaining.push({ question: questions[i], chosen: null, correct: false, skipped: true, timeTaken: 0 });
    }
    setResults((prev) => [...prev, ...remaining]);
    setExamEndAt(null);
    setMode('summary');
  }, [settings, currentIndex, questions]);

  const remainingSec = examEndAt ? Math.max(0, Math.floor((examEndAt - nowMs) / 1000)) : undefined;

  const handleGenerateMore = useCallback(async (category: string) => {
    if (!settings) return;
    setGenerating(true);
    setGenError('');
    try {
      const extra = await generateQuizQuestions({
        topic:      category,
        category,
        difficulty: settings.difficulty === 'all' ? 'intermediate' : settings.difficulty,
        count:      10,
      });
      setQuestions((prev) => [...prev, ...extra.map(shuffleOptions)]);
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }, [settings]);

  const resetToNewCert = useCallback(() => {
    setMode('setup');
    setSetupStep('cert');
    setSelectedCert(null);
    setSelectedDomains([]);
    setSettings(null);
  }, []);

  const restartSameCert = useCallback(() => {
    if (!selectedCert) { resetToNewCert(); return; }
    setMode('setup');
    setSetupStep('domain');
  }, [selectedCert, resetToNewCert]);

  const currentQuestion = questions[currentIndex];
  const currentResult   = results[results.length - 1];

  return (
    <div className="flex flex-col h-full min-h-0">
      {generating && (
        <div className="px-4 py-2 border-b border-violet-500/20 bg-violet-500/5 flex items-center gap-2 shrink-0">
          <div className="w-3 h-3 border border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] font-mono text-violet-400">Generating additional questions…</span>
        </div>
      )}
      {genError && (
        <div className="px-4 py-2 border-b border-red-500/20 bg-red-500/5 shrink-0">
          <span className="text-[11px] font-mono text-red-400">{genError}</span>
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        {mode === 'setup' && setupStep === 'cert' && (
          <CertSelectStep
            onSelect={(cert) => { setSelectedCert(cert); setSetupStep('domain'); }}
          />
        )}
        {mode === 'setup' && setupStep === 'domain' && selectedCert && (
          <DomainSelectStep
            cert={selectedCert}
            onBack={() => setSetupStep('cert')}
            onNext={(domains) => { setSelectedDomains(domains); setSetupStep('config'); }}
          />
        )}
        {mode === 'setup' && setupStep === 'config' && selectedCert && (
          <QuizConfigStep
            cert={selectedCert}
            domains={selectedDomains}
            onBack={() => setSetupStep('domain')}
            onStart={handleStart}
          />
        )}
        {mode === 'question' && currentQuestion && (
          <div className="h-full overflow-y-auto">
            <QuestionScreen
              question={currentQuestion}
              index={currentIndex}
              total={questions.length}
              onAnswer={handleAnswer}
              examMode={settings?.examMode}
              remainingSec={remainingSec}
              onAbandonExam={handleAbandonExam}
              certId={settings?.cert ?? ''}
              certName={settings?.certName ?? ''}
            />
          </div>
        )}
        {mode === 'result' && currentResult && (
          <div className="h-full overflow-y-auto">
            <ResultScreen result={currentResult} index={currentIndex} total={questions.length} onNext={handleNext} />
          </div>
        )}
        {mode === 'summary' && settings && (
          <SummaryScreen
            results={results}
            settings={settings}
            onRestart={restartSameCert}
            onNewCert={resetToNewCert}
            onGenerateMore={handleGenerateMore}
          />
        )}
      </div>
    </div>
  );
}
