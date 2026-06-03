'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import type { QuizQuestion, QuizDifficulty } from '@/types';
import { QUIZ_QUESTIONS } from '@/lib/playbook-quiz';
import { generateQuizQuestions } from '@/lib/playbook-quiz-gen';
import { CERT_EXAMS, getCertById, domainsToCategories, type CertExam } from '@/lib/quiz-cert-domains';

// ─── Types ────────────────────────────────────────────────────────────────────
type SetupStep = 'cert' | 'domain';
type QuizMode  = 'setup' | 'question' | 'result' | 'summary';

interface QuizSettings {
  certId:        string;
  domains:       string[];   // [] means "all domains"
  difficulty:    QuizDifficulty | 'all';
  count:         number;
  examMode?:     boolean;
  examSec?:      number;
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

function poolForSettings(certId: string, domains: string[], difficulty: QuizDifficulty | 'all'): QuizQuestion[] {
  const cert = getCertById(certId);
  if (!cert) return [];
  const cats = domainsToCategories(cert, domains);
  return QUIZ_QUESTIONS.filter((q) =>
    q.certTags.includes(certId) &&
    cats.includes(q.category) &&
    (difficulty === 'all' || q.difficulty === difficulty),
  );
}

// ─── Step 1: Cert Picker ──────────────────────────────────────────────────────
function CertPicker({ onSelect }: { onSelect: (id: string) => void }) {
  const certCounts = useMemo(() =>
    Object.fromEntries(
      CERT_EXAMS.map((c) => [c.id, QUIZ_QUESTIONS.filter((q) => q.certTags.includes(c.id)).length]),
    ),
  []);

  return (
    <div className="h-full overflow-y-auto px-5 py-5">
      <div className="mb-5">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Step 1 of 2</p>
        <h2 className="text-base font-bold text-slate-100">Select an exam to study for</h2>
        <p className="text-xs text-slate-500 mt-0.5">One exam at a time. You&apos;ll pick domains next.</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {CERT_EXAMS.map((cert) => {
          const count = certCounts[cert.id] ?? 0;
          return (
            <button
              key={cert.id}
              onClick={() => onSelect(cert.id)}
              className="group w-full text-left p-3 rounded-lg border border-slate-700 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800/80 transition-all duration-150"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${cert.tagColor}`}>
                      {cert.id}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{cert.provider}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-200 group-hover:text-slate-100 leading-snug">
                    {cert.name}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-mono font-bold text-slate-200">{count}</div>
                  <div className="text-[10px] text-slate-500 leading-tight">questions</div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-600">{cert.difficulty}</span>
                <span className="text-[10px] font-mono text-slate-700">·</span>
                <span className="text-[10px] font-mono text-slate-600">{cert.examQs} Q on exam</span>
                <span className="text-[10px] font-mono text-slate-700">·</span>
                <span className="text-[10px] font-mono text-slate-600">{cert.domains.length} domains</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2: Domain Picker ────────────────────────────────────────────────────
function DomainPicker({
  cert,
  onStart,
  onBack,
}: {
  cert:    CertExam;
  onStart: (s: QuizSettings) => void;
  onBack:  () => void;
}) {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [difficulty, setDifficulty]           = useState<QuizDifficulty | 'all'>('all');
  const [count, setCount]                     = useState<number>(25);

  const domainCounts = useMemo(() =>
    Object.fromEntries(
      cert.domains.map((d) => {
        const cats = domainsToCategories(cert, [d.name]);
        return [d.name, QUIZ_QUESTIONS.filter((q) => q.certTags.includes(cert.id) && cats.includes(q.category)).length];
      }),
    ),
  [cert]);

  const pool = useMemo(
    () => poolForSettings(cert.id, selectedDomains, difficulty),
    [cert.id, selectedDomains, difficulty],
  );

  const allSelected = selectedDomains.length === 0;

  const toggleDomain = (name: string) => {
    setSelectedDomains((prev) =>
      prev.includes(name) ? prev.filter((d) => d !== name) : [...prev, name],
    );
  };

  const countOptions = useMemo(() => {
    const opts = [10, 25, 50, 75, 100].filter((n) => n <= pool.length);
    if (opts.length === 0 && pool.length > 0) return [pool.length];
    return opts;
  }, [pool.length]);

  useEffect(() => {
    if (count > pool.length && pool.length > 0) {
      setCount(Math.min(count, pool.length));
    }
  }, [pool.length, count]);

  const isSC500MockAvailable = cert.id === 'SC-500' &&
    QUIZ_QUESTIONS.filter((q) => q.certTags.includes('SC-500')).length >= 60;

  const startMockExam = () => {
    onStart({
      certId: 'SC-500',
      domains: [],
      difficulty: 'all',
      count: 60,
      examMode: true,
      examSec: 90 * 60,
    });
  };

  return (
    <div className="h-full overflow-y-auto px-5 py-5">
      {/* Back + header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="text-[11px] font-mono text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-500 px-2 py-0.5 rounded transition-colors"
        >
          ← back
        </button>
        <div>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Step 2 of 2</p>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${cert.tagColor}`}>{cert.id}</span>
            <span className="text-xs font-medium text-slate-200">{cert.name}</span>
          </div>
        </div>
      </div>

      {/* Mock exam preset for SC-500 */}
      {isSC500MockAvailable && (
        <button
          onClick={startMockExam}
          className="w-full mb-4 p-3 rounded-lg border border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors text-left"
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs font-semibold text-cyan-300">Mock SC-500 Exam</span>
            <span className="text-[10px] font-mono text-cyan-400/70">60 Q · 90 min · no hints</span>
          </div>
          <p className="text-[11px] text-slate-400">Timed simulation — no feedback until the end.</p>
        </button>
      )}

      {/* Domains */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Exam Domains</p>
          <button
            onClick={() => setSelectedDomains([])}
            className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
              allSelected
                ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                : 'border-slate-700 text-slate-500 hover:border-slate-600'
            }`}
          >
            All domains
          </button>
        </div>
        <div className="space-y-1.5">
          {cert.domains.map((d) => {
            const dCount = domainCounts[d.name] ?? 0;
            const checked = selectedDomains.includes(d.name);
            return (
              <button
                key={d.name}
                onClick={() => toggleDomain(d.name)}
                className={[
                  'w-full text-left px-3 py-2 rounded-lg border transition-all duration-150 flex items-center justify-between gap-3',
                  checked
                    ? 'border-violet-500/40 bg-violet-500/8 text-slate-100'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300',
                ].join(' ')}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={[
                    'w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center',
                    checked ? 'border-violet-500 bg-violet-500' : 'border-slate-600',
                  ].join(' ')}>
                    {checked && <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 12 12"><path d="M10 3L5 8L2 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className="text-xs truncate">{d.name}</span>
                  {d.pct && <span className="text-[10px] font-mono text-slate-600 shrink-0">{d.pct}</span>}
                </div>
                <span className="text-[10px] font-mono text-slate-600 shrink-0">{dCount} Q</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-4">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Difficulty</p>
        <div className="flex gap-1.5">
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
      <div className="mb-4">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Questions</p>
        <div className="flex gap-1.5 flex-wrap">
          {countOptions.map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={[
                'px-3 py-1.5 rounded text-[11px] font-mono border transition-colors',
                count === n
                  ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                  : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400',
              ].join(' ')}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-[11px] font-mono text-slate-600 mt-2">
          {pool.length} questions in pool · {Math.min(count, pool.length)} will be used
        </p>
      </div>

      <button
        disabled={pool.length === 0}
        onClick={() => onStart({ certId: cert.id, domains: selectedDomains, difficulty, count: Math.min(count, pool.length) })}
        className="w-full py-2.5 rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
      >
        {pool.length === 0 ? 'No questions available' : `Start Quiz →`}
      </button>
    </div>
  );
}

// ─── Question Screen ──────────────────────────────────────────────────────────
function QuestionScreen({
  question, index, total, onAnswer, certId, examMode, remainingSec, onAbandonExam,
}: {
  question:       QuizQuestion;
  index:          number;
  total:          number;
  onAnswer:       (chosen: number | null) => void;
  certId:         string;
  examMode?:      boolean;
  remainingSec?:  number;
  onAbandonExam?: () => void;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const progress = ((index + 1) / total) * 100;
  const cert = getCertById(certId);

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
      {/* Exam-mode timer */}
      {examMode && timerStr && (
        <div className={`mb-3 px-3 py-2 rounded border flex items-center justify-between ${timerLow ? 'border-red-500/40 bg-red-500/10' : 'border-cyan-500/30 bg-cyan-500/5'}`}>
          <span className={`text-[11px] font-mono uppercase tracking-wide ${timerLow ? 'text-red-400' : 'text-cyan-400'}`}>
            {cert?.id ?? 'EXAM'} Simulation
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

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-slate-600">{index + 1} / {total}</span>
          <div className="flex gap-1.5 items-center">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border capitalize ${DIFFICULTY_STYLE[question.difficulty]}`}>
              {question.difficulty}
            </span>
            <span className="text-[10px] font-mono text-slate-600 hidden sm:inline">{question.category}</span>
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
              className={`w-full text-left px-4 py-2.5 rounded-lg border transition-all text-sm ${style}`}
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
          className="mt-3 w-full py-1.5 rounded text-[11px] font-mono text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-500 disabled:opacity-40"
        >
          Skip — leave unanswered
        </button>
      )}
    </div>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────────
function ResultScreen({ result, index, total, onNext }: {
  result: QuizResult; index: number; total: number; onNext: () => void;
}) {
  return (
    <div className="flex flex-col h-full px-5 py-4">
      <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg border ${result.correct ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
        <span className={`text-base font-bold ${result.correct ? 'text-emerald-400' : 'text-red-400'}`}>
          {result.correct ? '✓' : '✗'}
        </span>
        <span className={`text-sm font-semibold ${result.correct ? 'text-emerald-300' : 'text-red-300'}`}>
          {result.correct ? 'Correct' : 'Incorrect'}
        </span>
        <span className="text-[10px] font-mono text-slate-600 ml-auto">{index + 1}/{total}</span>
      </div>

      <div className="mb-3">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-1">Question</p>
        <p className="text-xs text-slate-300">{result.question.question}</p>
      </div>

      <div className="flex-1 mb-4 space-y-1.5 overflow-y-auto">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-1.5">Answer Breakdown</p>
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
              {optExp && <p className={`mt-1 ml-4 ${isCorrect ? 'text-emerald-400/80' : isChosen ? 'text-red-400/70' : 'text-slate-600'}`}>{optExp}</p>}
            </div>
          );
        })}
        <div className="mt-2 pt-2 border-t border-slate-700/50">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-1">Explanation</p>
          <p className="text-xs text-slate-400 leading-relaxed">{result.question.explanation}</p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-2.5 rounded bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
      >
        {index + 1 >= total ? 'See Results' : 'Next →'}
      </button>
    </div>
  );
}

// ─── Summary Screen ───────────────────────────────────────────────────────────
function SummaryScreen({
  results, certId, onRestart, onGenerateMore,
}: {
  results:        QuizResult[];
  certId:         string;
  onRestart:      () => void;
  onGenerateMore: (category: string) => void;
}) {
  const correct  = results.filter((r) => r.correct).length;
  const skipped  = results.filter((r) => r.skipped).length;
  const total    = results.length;
  const pct      = Math.round((correct / total) * 100);
  const answered = results.filter((r) => !r.skipped);
  const avgTime  = answered.length > 0
    ? Math.round(answered.reduce((s, r) => s + r.timeTaken, 0) / answered.length / 1000)
    : 0;
  const cert = getCertById(certId);

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
  const passMark = cert?.id === 'SC-500' ? 70 : 72;
  const passLabel = pct >= passMark ? 'Pass' : 'Below passing';

  return (
    <div className="overflow-y-auto h-full px-5 py-4">
      <div className="text-center mb-5">
        <div className={`text-5xl font-bold font-mono mb-1 ${scoreColor}`}>{pct}%</div>
        <p className="text-slate-400 text-sm">
          {correct}/{total} correct{skipped > 0 ? ` · ${skipped} skipped` : ''} · avg {avgTime}s/question
        </p>
        {cert && (
          <p className={`text-xs font-mono mt-1 ${pct >= passMark ? 'text-emerald-500' : 'text-slate-500'}`}>
            {cert.id} benchmark: {passLabel} ({passMark}% threshold)
          </p>
        )}
      </div>

      <div className="mb-5">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-2">Domain Breakdown</p>
        <div className="space-y-2">
          {byCategory.map(([cat, stats]) => {
            const catPct = Math.round((stats.correct / stats.total) * 100);
            const barColor = catPct >= 80 ? 'bg-emerald-500' : catPct >= 60 ? 'bg-amber-500' : 'bg-red-500';
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] text-slate-400 truncate max-w-[180px]">{cat}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-600">{stats.correct}/{stats.total}</span>
                    {catPct < 70 && (
                      <button
                        onClick={() => onGenerateMore(cat)}
                        className="text-[9px] font-mono text-violet-400 hover:text-violet-300 border border-violet-500/30 px-1.5 py-0.5 rounded"
                      >
                        more →
                      </button>
                    )}
                  </div>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
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
          New Quiz
        </button>
      </div>
    </div>
  );
}

// ─── Root QuizEngine ──────────────────────────────────────────────────────────
export default function QuizEngine() {
  const [setupStep,     setSetupStep]     = useState<SetupStep>('cert');
  const [selectedCert,  setSelectedCert]  = useState<CertExam | null>(null);
  const [mode,          setMode]          = useState<QuizMode>('setup');
  const [settings,      setSettings]      = useState<QuizSettings | null>(null);
  const [questions,     setQuestions]     = useState<QuizQuestion[]>([]);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [results,       setResults]       = useState<QuizResult[]>([]);
  const [questionStart, setQuestionStart] = useState(0);
  const [examEndAt,     setExamEndAt]     = useState<number | null>(null);
  const [nowMs,         setNowMs]         = useState(() => Date.now());
  const [generating,    setGenerating]    = useState(false);
  const [genError,      setGenError]      = useState('');

  const handleCertSelect = useCallback((id: string) => {
    const cert = getCertById(id);
    if (!cert) return;
    setSelectedCert(cert);
    setSetupStep('domain');
  }, []);

  const handleStart = useCallback((s: QuizSettings) => {
    const pool = poolForSettings(s.certId, s.domains, s.difficulty);
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
      question: q, chosen,
      correct:  chosen !== null && chosen === q.correct,
      skipped:  chosen === null,
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
    if (currentIndex + 1 >= questions.length) { setMode('summary'); }
    else { setCurrentIndex((i) => i + 1); setQuestionStart(Date.now()); setMode('question'); }
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
        topic: category, category,
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

  const resetToSetup = useCallback(() => {
    setMode('setup');
    setSetupStep('cert');
    setSelectedCert(null);
    setSettings(null);
  }, []);

  const currentQuestion = questions[currentIndex];
  const currentResult   = results[results.length - 1];

  return (
    <div className="flex flex-col h-full min-h-0">
      {generating && (
        <div className="px-4 py-2 border-b border-violet-500/20 bg-violet-500/5 flex items-center gap-2 shrink-0">
          <div className="w-3 h-3 border border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] font-mono text-violet-400">Generating questions…</span>
        </div>
      )}
      {genError && (
        <div className="px-4 py-2 border-b border-red-500/20 bg-red-500/5 shrink-0">
          <span className="text-[11px] font-mono text-red-400">Error: {genError}</span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto min-h-0">
        {mode === 'setup' && setupStep === 'cert' && (
          <CertPicker onSelect={handleCertSelect} />
        )}
        {mode === 'setup' && setupStep === 'domain' && selectedCert && (
          <DomainPicker
            cert={selectedCert}
            onStart={handleStart}
            onBack={() => setSetupStep('cert')}
          />
        )}
        {mode === 'question' && currentQuestion && (
          <QuestionScreen
            question={currentQuestion}
            index={currentIndex}
            total={questions.length}
            onAnswer={handleAnswer}
            certId={settings?.certId ?? ''}
            examMode={settings?.examMode}
            remainingSec={remainingSec}
            onAbandonExam={handleAbandonExam}
          />
        )}
        {mode === 'result' && currentResult && (
          <ResultScreen result={currentResult} index={currentIndex} total={questions.length} onNext={handleNext} />
        )}
        {mode === 'summary' && settings && (
          <SummaryScreen
            results={results}
            certId={settings.certId}
            onRestart={resetToSetup}
            onGenerateMore={handleGenerateMore}
          />
        )}
      </div>
    </div>
  );
}
