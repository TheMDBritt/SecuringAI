'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import type { QuizQuestion, QuizDifficulty } from '@/types';
import { QUIZ_QUESTIONS } from '@/lib/playbook-quiz';
import { generateQuizQuestions } from '@/lib/playbook-quiz-gen';

// ─── Types ────────────────────────────────────────────────────────────────────
type QuizMode   = 'setup' | 'question' | 'result' | 'summary';

interface QuizSettings {
  category:   string;
  difficulty: QuizDifficulty | 'all';
  certFilter: string;
  count:      10 | 25 | 50 | 100;
}

interface QuizResult {
  question:  QuizQuestion;
  chosen:    number | null;
  correct:   boolean;
  timeTaken: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ALL_CATEGORIES = ['All', ...Array.from(new Set(QUIZ_QUESTIONS.map((q) => q.category))).sort()];
const CERT_OPTIONS   = ['All', 'SecAI', 'AWS-AIF-C01', 'Azure-AI900', 'Azure-AI102', 'Google-MLE', 'GIAC-GOAA', 'GIAC-GASAE', 'CAISP'];
const COUNT_OPTIONS  = [10, 25, 50, 100] as const;

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

// Randomizes the 4 answer options and updates the correct index to match
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

// ─── Setup Screen ─────────────────────────────────────────────────────────────
function SetupScreen({ onStart }: { onStart: (s: QuizSettings) => void }) {
  const [settings, setSettings] = useState<QuizSettings>({
    category: 'All', difficulty: 'all', certFilter: 'All', count: 25,
  });

  const available = useMemo(() => {
    return QUIZ_QUESTIONS.filter((q) =>
      (settings.category   === 'All' || q.category   === settings.category) &&
      (settings.difficulty === 'all' || q.difficulty === settings.difficulty) &&
      (settings.certFilter === 'All' || q.certTags.includes(settings.certFilter)),
    ).length;
  }, [settings]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 max-w-xl mx-auto">
      <div className="w-10 h-10 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mb-4">
        <span className="text-violet-400 text-lg">?</span>
      </div>
      <h2 className="text-xl font-bold text-slate-100 mb-1">Quiz Setup</h2>
      <p className="text-sm text-slate-500 mb-8 text-center">Choose your focus area and difficulty, then start.</p>

      <div className="w-full space-y-5">
        {/* Category */}
        <div>
          <label className="text-[10px] font-mono text-slate-600 uppercase tracking-wide block mb-1.5">Category</label>
          <select
            value={settings.category}
            onChange={(e) => setSettings((s) => ({ ...s, category: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
          >
            {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label className="text-[10px] font-mono text-slate-600 uppercase tracking-wide block mb-1.5">Difficulty</label>
          <div className="flex gap-2">
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setSettings((s) => ({ ...s, difficulty: d }))}
                className={[
                  'flex-1 py-1.5 rounded text-[11px] font-mono border transition-colors capitalize',
                  settings.difficulty === d
                    ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                    : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400',
                ].join(' ')}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Cert filter */}
        <div>
          <label className="text-[10px] font-mono text-slate-600 uppercase tracking-wide block mb-1.5">Cert Focus</label>
          <select
            value={settings.certFilter}
            onChange={(e) => setSettings((s) => ({ ...s, certFilter: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
          >
            {CERT_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Count */}
        <div>
          <label className="text-[10px] font-mono text-slate-600 uppercase tracking-wide block mb-1.5">Questions</label>
          <div className="flex gap-2">
            {COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setSettings((s) => ({ ...s, count: n }))}
                className={[
                  'flex-1 py-1.5 rounded text-[11px] font-mono border transition-colors',
                  settings.count === n
                    ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                    : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400',
                ].join(' ')}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Pool size hint */}
        <p className="text-[11px] text-slate-600 font-mono text-center">
          {available} questions match · {Math.min(settings.count, available)} will be used
        </p>

        <button
          disabled={available === 0}
          onClick={() => onStart(settings)}
          className="w-full py-2.5 rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
}

// ─── Question Screen ──────────────────────────────────────────────────────────
function QuestionScreen({
  question, index, total, onAnswer,
}: {
  question: QuizQuestion;
  index:    number;
  total:    number;
  onAnswer: (chosen: number) => void;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const progress = ((index + 1) / total) * 100;

  const handleChoose = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    setTimeout(() => onAnswer(i), 900);
  };

  return (
    <div className="flex flex-col h-full min-h-0 px-6 py-5">
      {/* Progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-slate-600">{index + 1} / {total}</span>
          <div className="flex gap-1.5 items-center">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border capitalize ${DIFFICULTY_STYLE[question.difficulty]}`}>
              {question.difficulty}
            </span>
            <span className="text-[10px] font-mono text-slate-600">{question.category}</span>
          </div>
        </div>
        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <p className="text-base text-slate-100 leading-relaxed font-medium">{question.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5 flex-1">
        {question.options.map((opt, i) => {
          let style = 'border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800/50';
          if (chosen !== null) {
            if (i === question.correct)      style = 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
            else if (i === chosen)           style = 'border-red-500 bg-red-500/10 text-red-300';
            else                             style = 'border-slate-700/50 text-slate-600 opacity-60';
          }
          return (
            <button
              key={i}
              onClick={() => handleChoose(i)}
              disabled={chosen !== null}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm ${style}`}
            >
              <span className="font-mono text-[10px] mr-3 opacity-60">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          );
        })}
      </div>
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
        <span className={`text-lg ${result.correct ? 'text-emerald-400' : 'text-red-400'}`}>
          {result.correct ? '✓' : '✗'}
        </span>
        <span className={`text-sm font-semibold ${result.correct ? 'text-emerald-300' : 'text-red-300'}`}>
          {result.correct ? 'Correct!' : 'Incorrect'}
        </span>
        <span className="text-[10px] font-mono text-slate-600 ml-auto">{index + 1}/{total}</span>
      </div>

      <div className="mb-4">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-1">Question</p>
        <p className="text-sm text-slate-300">{result.question.question}</p>
      </div>

      <div className="mb-4">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-1">Correct Answer</p>
        <p className="text-sm text-emerald-300 font-medium">
          {String.fromCharCode(65 + result.question.correct)}. {result.question.options[result.question.correct]}
        </p>
      </div>

      <div className="flex-1 mb-4">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-1">Explanation</p>
        <p className="text-sm text-slate-400 leading-relaxed">{result.question.explanation}</p>
      </div>

      <button
        onClick={onNext}
        className="w-full py-2.5 rounded bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
      >
        {index + 1 >= total ? 'See Results' : 'Next Question →'}
      </button>
    </div>
  );
}

// ─── Summary Screen ───────────────────────────────────────────────────────────
function SummaryScreen({
  results, onRestart, onGenerateMore,
}: {
  results:         QuizResult[];
  onRestart:       () => void;
  onGenerateMore:  (category: string) => void;
}) {
  const correct   = results.filter((r) => r.correct).length;
  const total     = results.length;
  const pct       = Math.round((correct / total) * 100);
  const avgTime   = Math.round(results.reduce((s, r) => s + r.timeTaken, 0) / total / 1000);

  // Category breakdown
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

  return (
    <div className="overflow-y-auto h-full px-6 py-5">
      {/* Score banner */}
      <div className="text-center mb-6">
        <div className={`text-5xl font-bold font-mono mb-1 ${scoreColor}`}>{pct}%</div>
        <p className="text-slate-400 text-sm">{correct} of {total} correct · avg {avgTime}s per question</p>
        <p className={`text-sm font-semibold mt-1 ${scoreColor}`}>
          {pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good effort — keep studying!' : 'Keep at it — review the weak areas below.'}
        </p>
      </div>

      {/* Category breakdown */}
      <div className="mb-6">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-3">Category Breakdown</p>
        <div className="space-y-2">
          {byCategory.map(([cat, stats]) => {
            const catPct = Math.round((stats.correct / stats.total) * 100);
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
                        className="text-[9px] font-mono text-violet-400 hover:text-violet-300 border border-violet-500/30 px-1.5 py-0.5 rounded"
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
          New Quiz
        </button>
      </div>
    </div>
  );
}

// ─── Root QuizEngine ──────────────────────────────────────────────────────────
export default function QuizEngine() {
  const [mode,          setMode]          = useState<QuizMode>('setup');
  const [settings,      setSettings]      = useState<QuizSettings | null>(null);
  const [questions,     setQuestions]     = useState<QuizQuestion[]>([]);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [results,       setResults]       = useState<QuizResult[]>([]);
  const [questionStart, setQuestionStart] = useState(0);
  const [generating,    setGenerating]    = useState(false);
  const [genError,      setGenError]      = useState('');

  const handleStart = useCallback((s: QuizSettings) => {
    const pool = QUIZ_QUESTIONS.filter((q) =>
      (s.category   === 'All' || q.category   === s.category) &&
      (s.difficulty === 'all' || q.difficulty === s.difficulty) &&
      (s.certFilter === 'All' || q.certTags.includes(s.certFilter)),
    );
    const selected = shuffle(pool).slice(0, s.count).map(shuffleOptions);
    setSettings(s);
    setQuestions(selected);
    setResults([]);
    setCurrentIndex(0);
    setQuestionStart(Date.now());
    setMode('question');
  }, []);

  const handleAnswer = useCallback((chosen: number) => {
    const q       = questions[currentIndex];
    const elapsed = Date.now() - questionStart;
    const r: QuizResult = { question: q, chosen, correct: chosen === q.correct, timeTaken: elapsed };
    setResults((prev) => [...prev, r]);
    setMode('result');
  }, [questions, currentIndex, questionStart]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setMode('summary');
    } else {
      setCurrentIndex((i) => i + 1);
      setQuestionStart(Date.now());
      setMode('question');
    }
  }, [currentIndex, questions.length]);

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
      setQuestions((prev) => [...prev, ...extra]);
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }, [settings]);

  const currentQuestion = questions[currentIndex];
  const currentResult   = results[results.length - 1];

  return (
    <div className="flex flex-col h-full min-h-0">
      {generating && (
        <div className="px-4 py-2 border-b border-violet-500/20 bg-violet-500/5 flex items-center gap-2">
          <div className="w-3 h-3 border border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] font-mono text-violet-400">Generating new questions…</span>
        </div>
      )}
      {genError && (
        <div className="px-4 py-2 border-b border-red-500/20 bg-red-500/5">
          <span className="text-[11px] font-mono text-red-400">⚠ {genError}</span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {mode === 'setup'    && <SetupScreen onStart={handleStart} />}
        {mode === 'question' && currentQuestion && (
          <QuestionScreen question={currentQuestion} index={currentIndex} total={questions.length} onAnswer={handleAnswer} />
        )}
        {mode === 'result'   && currentResult && (
          <ResultScreen result={currentResult} index={currentIndex} total={questions.length} onNext={handleNext} />
        )}
        {mode === 'summary'  && (
          <SummaryScreen results={results} onRestart={() => { setMode('setup'); }} onGenerateMore={handleGenerateMore} />
        )}
      </div>
    </div>
  );
}
