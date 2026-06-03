'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import type { QuizQuestion, QuizDifficulty } from '@/types';
import { QUIZ_QUESTIONS } from '@/lib/playbook-quiz';
import { CERT_QUIZ_CONFIGS, filterByDomain } from '@/lib/quiz-domains';
import { generateQuizQuestions } from '@/lib/playbook-quiz-gen';

// ─── Types ────────────────────────────────────────────────────────────────────
type QuizMode = 'setup-cert' | 'setup-domain' | 'setup-options' | 'question' | 'result' | 'summary';

interface QuizSettings {
  certId:          string;
  selectedDomains: string[];   // empty = all
  difficulty:      QuizDifficulty | 'all';
  count:           10 | 25 | 50 | 60 | 100;
  examMode?:       boolean;
  examSec?:        number;
}

interface QuizResult {
  question:  QuizQuestion;
  chosen:    number | null;
  correct:   boolean;
  skipped?:  boolean;
  timeTaken: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DIFFICULTY_STYLE: Record<QuizDifficulty, string> = {
  beginner:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  advanced:     'bg-red-500/10 text-red-400 border-red-500/30',
};

const COLOR_MAP: Record<string, { border: string; text: string; bg: string; ring: string }> = {
  cyan:    { border: 'border-cyan-500/40',   text: 'text-cyan-400',   bg: 'bg-cyan-500/10',   ring: 'border-cyan-500/60 bg-cyan-500/15' },
  red:     { border: 'border-red-500/40',    text: 'text-red-400',    bg: 'bg-red-500/10',    ring: 'border-red-500/60 bg-red-500/15' },
  amber:   { border: 'border-amber-500/40',  text: 'text-amber-400',  bg: 'bg-amber-500/10',  ring: 'border-amber-500/60 bg-amber-500/15' },
  blue:    { border: 'border-blue-500/40',   text: 'text-blue-400',   bg: 'bg-blue-500/10',   ring: 'border-blue-500/60 bg-blue-500/15' },
  emerald: { border: 'border-emerald-500/40',text: 'text-emerald-400',bg: 'bg-emerald-500/10',ring: 'border-emerald-500/60 bg-emerald-500/15' },
  orange:  { border: 'border-orange-500/40', text: 'text-orange-400', bg: 'bg-orange-500/10', ring: 'border-orange-500/60 bg-orange-500/15' },
  purple:  { border: 'border-purple-500/40', text: 'text-purple-400', bg: 'bg-purple-500/10', ring: 'border-purple-500/60 bg-purple-500/15' },
};

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
  };
}

function breakAnswerStreaks(qs: QuizQuestion[]): QuizQuestion[] {
  const out = [...qs];
  for (let i = 2; i < out.length; i++) {
    let attempts = 0;
    while (out[i].correct === out[i - 1].correct && out[i].correct === out[i - 2].correct && attempts < 10) {
      out[i] = shuffleOptions(out[i]);
      attempts++;
    }
  }
  return out;
}

// ─── Step 1: Cert Selection ───────────────────────────────────────────────────
function CertSelectScreen({ onSelect }: { onSelect: (certId: string) => void }) {
  return (
    <div className="overflow-y-auto h-full px-4 py-5">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-slate-100">Select an exam</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Choose the certification you are studying for. You will pick domains next.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {CERT_QUIZ_CONFIGS.map((cert) => {
          const c = COLOR_MAP[cert.color] ?? COLOR_MAP.cyan;
          const qCount = QUIZ_QUESTIONS.filter((q) => q.certTags.includes(cert.id)).length;
          return (
            <button
              key={cert.id}
              onClick={() => onSelect(cert.id)}
              className={`group w-full text-left px-4 py-3 rounded-lg border ${c.border} ${c.bg} hover:${c.ring} transition-all duration-150`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-mono font-medium ${c.text}`}>{cert.id}</span>
                    <span className="text-[10px] text-slate-600">{cert.provider}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-snug truncate">{cert.name}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className={`text-[10px] font-mono ${c.text}`}>{qCount} Q</div>
                  <div className="text-[10px] text-slate-600">{cert.difficulty}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2: Domain Selection ─────────────────────────────────────────────────
function DomainSelectScreen({
  certId,
  onBack,
  onNext,
}: {
  certId: string;
  onBack: () => void;
  onNext: (selectedDomains: string[]) => void;
}) {
  const cert = CERT_QUIZ_CONFIGS.find((c) => c.id === certId)!;
  const c    = COLOR_MAP[cert.color] ?? COLOR_MAP.cyan;
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set());

  const domainCounts = useMemo(() => {
    const pool = QUIZ_QUESTIONS.filter((q) => q.certTags.includes(certId));
    return Object.fromEntries(
      cert.domains.map((d) => [
        d.name,
        filterByDomain(pool, certId, [d.name]).length,
      ]),
    );
  }, [certId, cert.domains]);

  const previewCount = useMemo(() => {
    const domains = Array.from(selected);
    return filterByDomain(QUIZ_QUESTIONS, certId, domains).length;
  }, [certId, selected]);

  const allSelected = selected.size === 0;

  return (
    <div className="flex flex-col h-full min-h-0 px-4 py-5">
      {/* Back + cert badge */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← back
        </button>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${c.border} ${c.text} ${c.bg}`}>
          {certId}
        </span>
        <span className="text-[11px] text-slate-500 truncate">{cert.name}</span>
      </div>

      <h2 className="text-sm font-semibold text-slate-100 mb-0.5">Select domains</h2>
      <p className="text-xs text-slate-500 mb-4">
        Choose one or more exam domains. Deselect all to train across the full exam.
      </p>

      {/* All domains option */}
      <button
        onClick={selectAll}
        className={[
          'w-full text-left px-3 py-2.5 rounded-lg border mb-2 transition-all duration-150',
          allSelected
            ? `${c.border} ${c.bg}`
            : 'border-slate-700 hover:border-slate-600',
        ].join(' ')}
      >
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold ${allSelected ? c.text : 'text-slate-400'}`}>
            All Domains
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {QUIZ_QUESTIONS.filter((q) => q.certTags.includes(certId)).length} Q
          </span>
        </div>
      </button>

      {/* Individual domains */}
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {cert.domains.map((d) => {
          const isActive = selected.has(d.name);
          const count    = domainCounts[d.name] ?? 0;
          return (
            <button
              key={d.name}
              onClick={() => toggle(d.name)}
              className={[
                'w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-150',
                isActive
                  ? `${c.border} ${c.bg}`
                  : 'border-slate-700/60 hover:border-slate-600 bg-slate-800/20',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className={`text-xs ${isActive ? c.text : 'text-slate-400'} leading-snug`}>
                    {d.name}
                  </span>
                  {d.pct && (
                    <span className="ml-2 text-[10px] font-mono text-slate-600">{d.pct}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-slate-500">{count} Q</span>
                  <div
                    className={[
                      'w-3.5 h-3.5 rounded border flex items-center justify-center',
                      isActive ? `${c.border} ${c.bg}` : 'border-slate-600',
                    ].join(' ')}
                  >
                    {isActive && (
                      <svg className={`w-2 h-2 ${c.text}`} fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono text-slate-500">
            {allSelected
              ? `${QUIZ_QUESTIONS.filter((q) => q.certTags.includes(certId)).length} questions available`
              : `${previewCount} questions in ${selected.size} domain${selected.size !== 1 ? 's' : ''}`}
          </span>
        </div>
        <button
          disabled={!allSelected && previewCount === 0}
          onClick={() => onNext(Array.from(selected))}
          className={`w-full py-2 rounded text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-white ${c.bg.replace('/10', '/80')} hover:${c.bg.replace('/10', '')}`}
          style={{ background: undefined }}
        >
          <span className={c.text.replace('text-', 'text-white ') ? '' : ''}>
            Configure options →
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Options ──────────────────────────────────────────────────────────
const COUNT_OPTIONS = [10, 25, 50, 100] as const;

function OptionsScreen({
  certId,
  selectedDomains,
  onBack,
  onStart,
}: {
  certId: string;
  selectedDomains: string[];
  onBack: () => void;
  onStart: (s: QuizSettings) => void;
}) {
  const cert = CERT_QUIZ_CONFIGS.find((c) => c.id === certId)!;
  const c    = COLOR_MAP[cert.color] ?? COLOR_MAP.cyan;
  const [difficulty, setDifficulty] = useState<QuizDifficulty | 'all'>('all');
  const [count, setCount]           = useState<10 | 25 | 50 | 60 | 100>(25);

  const available = useMemo(() => {
    const pool = filterByDomain(QUIZ_QUESTIONS, certId, selectedDomains);
    return pool.filter((q) => difficulty === 'all' || q.difficulty === difficulty).length;
  }, [certId, selectedDomains, difficulty]);

  const domainSummary = selectedDomains.length === 0
    ? 'All domains'
    : selectedDomains.length === 1
      ? selectedDomains[0]
      : `${selectedDomains.length} domains`;

  return (
    <div className="flex flex-col h-full min-h-0 px-4 py-5">
      {/* Back */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← back
        </button>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${c.border} ${c.text} ${c.bg}`}>
          {certId}
        </span>
        <span className="text-[11px] text-slate-500 truncate">{domainSummary}</span>
      </div>

      <h2 className="text-sm font-semibold text-slate-100 mb-4">Configure quiz</h2>

      <div className="space-y-5 flex-1">
        {/* Difficulty */}
        <div>
          <label className="text-[10px] font-mono text-slate-600 uppercase tracking-wide block mb-1.5">
            Difficulty
          </label>
          <div className="flex gap-2">
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={[
                  'flex-1 py-1.5 rounded text-[11px] font-mono border transition-colors capitalize',
                  difficulty === d
                    ? `${c.border} ${c.bg} ${c.text}`
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
          <label className="text-[10px] font-mono text-slate-600 uppercase tracking-wide block mb-1.5">
            Questions
          </label>
          <div className="flex gap-2">
            {COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={[
                  'flex-1 py-1.5 rounded text-[11px] font-mono border transition-colors',
                  count === n
                    ? `${c.border} ${c.bg} ${c.text}`
                    : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400',
                ].join(' ')}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Pool size hint */}
        <p className="text-[11px] text-slate-600 font-mono">
          {available} questions match · {Math.min(count, available)} will be selected
        </p>

        {/* SC-500 mock exam shortcut */}
        {certId === 'SC-500' && available >= 60 && (
          <button
            onClick={() =>
              onStart({
                certId,
                selectedDomains,
                difficulty: 'all',
                count: 60,
                examMode: true,
                examSec: 90 * 60,
              })
            }
            className="w-full p-3 rounded-lg border border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors text-left"
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-semibold text-cyan-300">Mock SC-500 Exam</span>
              <span className="text-[10px] font-mono text-cyan-400/70">60 Q · 90 min · no hints</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Timed simulation. No per-question feedback until the end.
            </p>
          </button>
        )}
      </div>

      <button
        disabled={available === 0}
        onClick={() =>
          onStart({ certId, selectedDomains, difficulty, count })
        }
        className="mt-4 w-full py-2.5 rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
      >
        Start Quiz
      </button>
    </div>
  );
}

// ─── Question Screen ──────────────────────────────────────────────────────────
function QuestionScreen({
  question, index, total, onAnswer, examMode, remainingSec, onAbandonExam,
}: {
  question:       QuizQuestion;
  index:          number;
  total:          number;
  onAnswer:       (chosen: number | null) => void;
  examMode?:      boolean;
  remainingSec?:  number;
  onAbandonExam?: () => void;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const progress = ((index + 1) / total) * 100;

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
    <div className="flex flex-col h-full min-h-0 px-5 py-4">
      {examMode && timerStr && (
        <div className={`mb-3 px-3 py-2 rounded border flex items-center justify-between ${timerLow ? 'border-red-500/40 bg-red-500/10' : 'border-cyan-500/30 bg-cyan-500/5'}`}>
          <span className={`text-[11px] font-mono ${timerLow ? 'text-red-400' : 'text-cyan-400'}`}>Mock exam</span>
          <span className={`text-base font-mono font-bold ${timerLow ? 'text-red-300' : 'text-cyan-300'}`}>{timerStr}</span>
          <button
            onClick={onAbandonExam}
            className="text-[10px] font-mono text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-500 px-2 py-0.5 rounded"
          >
            end early
          </button>
        </div>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-slate-600">{index + 1} / {total}</span>
          <div className="flex gap-1.5 items-center">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border capitalize ${DIFFICULTY_STYLE[question.difficulty]}`}>
              {question.difficulty}
            </span>
            <span className="text-[10px] font-mono text-slate-600 hidden sm:block">{question.topic}</span>
          </div>
        </div>
        <div className="h-0.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="mb-5">
        <p className="text-sm text-slate-100 leading-relaxed font-medium">{question.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2 flex-1">
        {question.options.map((opt, i) => {
          let style = 'border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800/40';
          if (chosen !== null) {
            if (examMode) {
              style = i === chosen
                ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-200'
                : 'border-slate-700/40 text-slate-600 opacity-50';
            } else if (i === question.correct) {
              style = 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
            } else if (i === chosen) {
              style = 'border-red-500 bg-red-500/10 text-red-300';
            } else {
              style = 'border-slate-700/40 text-slate-600 opacity-50';
            }
          }
          return (
            <button
              key={i}
              onClick={() => handleChoose(i)}
              disabled={chosen !== null}
              className={`w-full text-left px-4 py-2.5 rounded-lg border transition-all text-sm ${style}`}
            >
              <span className="font-mono text-[10px] mr-3 opacity-50">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          );
        })}
      </div>

      {examMode && (
        <button
          onClick={() => { if (chosen === null) onAnswer(null); }}
          disabled={chosen !== null}
          className="mt-3 w-full py-1.5 rounded text-[11px] font-mono text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-600 disabled:opacity-40"
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
    <div className="flex flex-col h-full px-5 py-4">
      <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg border ${result.correct ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
        <span className={`text-base ${result.correct ? 'text-emerald-400' : 'text-red-400'}`}>
          {result.correct ? '✓' : '✗'}
        </span>
        <span className={`text-sm font-semibold ${result.correct ? 'text-emerald-300' : 'text-red-300'}`}>
          {result.correct ? 'Correct' : 'Incorrect'}
        </span>
        <span className="text-[10px] font-mono text-slate-600 ml-auto">{index + 1}/{total}</span>
      </div>

      <div className="mb-3">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-1">Question</p>
        <p className="text-xs text-slate-300 leading-relaxed">{result.question.question}</p>
      </div>

      <div className="flex-1 mb-4 space-y-1.5 overflow-y-auto">
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
                    : 'border-slate-700/40 bg-slate-800/20 text-slate-500',
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
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-1">Explanation</p>
          <p className="text-xs text-slate-400 leading-relaxed">{result.question.explanation}</p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-2.5 rounded bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
      >
        {index + 1 >= total ? 'See results' : 'Next →'}
      </button>
    </div>
  );
}

// ─── Summary Screen ───────────────────────────────────────────────────────────
function SummaryScreen({
  results, settings, onRestart, onNewExam, onGenerateMore,
}: {
  results:         QuizResult[];
  settings:        QuizSettings;
  onRestart:       () => void;
  onNewExam:       () => void;
  onGenerateMore:  (category: string) => void;
}) {
  const cert     = CERT_QUIZ_CONFIGS.find((c) => c.id === settings.certId);
  const c        = cert ? (COLOR_MAP[cert.color] ?? COLOR_MAP.cyan) : COLOR_MAP.cyan;
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
      const cat = r.question.topic;
      if (!map[cat]) map[cat] = { correct: 0, total: 0 };
      map[cat].total++;
      if (r.correct) map[cat].correct++;
    });
    return Object.entries(map).sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total));
  }, [results]);

  const scoreColor = pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400';
  const passMark   = settings.certId === 'SC-500' ? 700 : null;

  return (
    <div className="overflow-y-auto h-full px-5 py-4">
      {/* Cert badge */}
      {cert && (
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border ${c.border} ${c.bg} mb-4`}>
          <span className={`text-[10px] font-mono ${c.text}`}>{cert.id}</span>
          {settings.selectedDomains.length > 0 && (
            <span className="text-[10px] text-slate-500">
              · {settings.selectedDomains.length} domain{settings.selectedDomains.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Score banner */}
      <div className="text-center mb-6">
        <div className={`text-5xl font-bold font-mono mb-1 ${scoreColor}`}>{pct}%</div>
        <p className="text-slate-400 text-sm">
          {correct} of {total} correct{skipped > 0 ? ` · ${skipped} skipped` : ''}
          {avgTime > 0 ? ` · avg ${avgTime}s` : ''}
        </p>
        {passMark && (
          <p className="text-[11px] font-mono text-slate-600 mt-1">
            SC-500 passing score: 700/1000 — aim for ≥80% in practice
          </p>
        )}
        <p className={`text-sm font-semibold mt-2 ${scoreColor}`}>
          {pct >= 80 ? 'Strong result.' : pct >= 60 ? 'Good progress — focus on weak areas.' : 'Keep studying — review the breakdown below.'}
        </p>
      </div>

      {/* Topic breakdown */}
      <div className="mb-6">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-3">Topic Breakdown</p>
        <div className="space-y-2">
          {byCategory.map(([topic, stats]) => {
            const topicPct = Math.round((stats.correct / stats.total) * 100);
            const barColor = topicPct >= 80 ? 'bg-emerald-500' : topicPct >= 60 ? 'bg-amber-500' : 'bg-red-500';
            return (
              <div key={topic}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] text-slate-400 truncate max-w-[180px]">{topic}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-600">{stats.correct}/{stats.total}</span>
                    {topicPct < 70 && (
                      <button
                        onClick={() => onGenerateMore(topic)}
                        className="text-[9px] font-mono text-violet-400 hover:text-violet-300 border border-violet-500/30 px-1.5 py-0.5 rounded"
                      >
                        more →
                      </button>
                    )}
                  </div>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} rounded-full`} style={{ width: `${topicPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onRestart}
          className="flex-1 py-2 rounded border border-slate-700 hover:border-slate-600 text-slate-300 text-sm font-medium transition-colors"
        >
          Same settings
        </button>
        <button
          onClick={onNewExam}
          className="flex-1 py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors"
        >
          New exam
        </button>
      </div>
    </div>
  );
}

// ─── Root QuizEngine ──────────────────────────────────────────────────────────
export default function QuizEngine() {
  const [mode,          setMode]          = useState<QuizMode>('setup-cert');
  const [certId,        setCertId]        = useState<string>('');
  const [domainSel,     setDomainSel]     = useState<string[]>([]);
  const [settings,      setSettings]      = useState<QuizSettings | null>(null);
  const [questions,     setQuestions]     = useState<QuizQuestion[]>([]);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [results,       setResults]       = useState<QuizResult[]>([]);
  const [questionStart, setQuestionStart] = useState(0);
  const [examEndAt,     setExamEndAt]     = useState<number | null>(null);
  const [nowMs,         setNowMs]         = useState(() => Date.now());
  const [generating,    setGenerating]    = useState(false);
  const [genError,      setGenError]      = useState('');

  const handleCertSelect = (id: string) => {
    setCertId(id);
    setDomainSel([]);
    setMode('setup-domain');
  };

  const handleDomainNext = (domains: string[]) => {
    setDomainSel(domains);
    setMode('setup-options');
  };

  const handleStart = useCallback((s: QuizSettings) => {
    const pool = filterByDomain(QUIZ_QUESTIONS, s.certId, s.selectedDomains).filter(
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
    const q   = questions[currentIndex];
    const r: QuizResult = {
      question: q,
      chosen,
      correct:  chosen !== null && chosen === q.correct,
      skipped:  chosen === null,
      timeTaken: Date.now() - questionStart,
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
    if (currentIndex + 1 >= questions.length) { setMode('summary'); }
    else { setCurrentIndex((i) => i + 1); setQuestionStart(Date.now()); setMode('question'); }
  }, [currentIndex, questions.length]);

  // Exam countdown
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

  const handleGenerateMore = useCallback(async (topic: string) => {
    if (!settings) return;
    setGenerating(true);
    setGenError('');
    try {
      const extra = await generateQuizQuestions({
        topic,
        category: topic,
        difficulty: settings.difficulty === 'all' ? 'intermediate' : settings.difficulty,
        count: 10,
      });
      setQuestions((prev) => [...prev, ...extra.map(shuffleOptions)]);
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }, [settings]);

  const remainingSec = examEndAt ? Math.max(0, Math.floor((examEndAt - nowMs) / 1000)) : undefined;
  const currentQuestion = questions[currentIndex];
  const currentResult   = results[results.length - 1];

  return (
    <div className="flex flex-col h-full min-h-0">
      {generating && (
        <div className="px-4 py-2 border-b border-violet-500/20 bg-violet-500/5 flex items-center gap-2">
          <div className="w-3 h-3 border border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] font-mono text-violet-400">Generating questions…</span>
        </div>
      )}
      {genError && (
        <div className="px-4 py-2 border-b border-red-500/20 bg-red-500/5">
          <span className="text-[11px] font-mono text-red-400">{genError}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {mode === 'setup-cert' && (
          <CertSelectScreen onSelect={handleCertSelect} />
        )}
        {mode === 'setup-domain' && certId && (
          <DomainSelectScreen
            certId={certId}
            onBack={() => setMode('setup-cert')}
            onNext={handleDomainNext}
          />
        )}
        {mode === 'setup-options' && certId && (
          <OptionsScreen
            certId={certId}
            selectedDomains={domainSel}
            onBack={() => setMode('setup-domain')}
            onStart={handleStart}
          />
        )}
        {mode === 'question' && currentQuestion && (
          <QuestionScreen
            question={currentQuestion}
            index={currentIndex}
            total={questions.length}
            onAnswer={handleAnswer}
            examMode={settings?.examMode}
            remainingSec={remainingSec}
            onAbandonExam={handleAbandonExam}
          />
        )}
        {mode === 'result' && currentResult && (
          <ResultScreen
            result={currentResult}
            index={currentIndex}
            total={questions.length}
            onNext={handleNext}
          />
        )}
        {mode === 'summary' && settings && (
          <SummaryScreen
            results={results}
            settings={settings}
            onRestart={() => handleStart(settings)}
            onNewExam={() => { setMode('setup-cert'); setCertId(''); setDomainSel([]); }}
            onGenerateMore={handleGenerateMore}
          />
        )}
      </div>
    </div>
  );
}
