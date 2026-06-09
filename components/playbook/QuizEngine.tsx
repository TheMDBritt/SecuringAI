'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import type { QuizQuestion, QuizDifficulty } from '@/types';
import { QUIZ_QUESTIONS } from '@/lib/playbook-quiz';
import { generateQuizQuestions } from '@/lib/playbook-quiz-gen';
import { EXAM_CERTS, questionMatchesDomain } from '@/lib/cert-exam-domains';
import type { ExamCert, ExamDomain } from '@/lib/cert-exam-domains';

// ─── Types ────────────────────────────────────────────────────────────────────
type QuizMode = 'setup' | 'question' | 'result' | 'summary';
type SetupStep = 1 | 2 | 3;

interface QuizSettings {
  category:       string;
  difficulty:     QuizDifficulty | 'all';
  certFilter:     string;
  count:          10 | 25 | 50 | 60 | 65 | 100;
  /** Mock-exam mode: timer + no per-question feedback. */
  examMode?:      boolean;
  /** Total exam time in seconds (only used when examMode). */
  examSec?:       number;
  /** The selected cert object (exam-first flow). */
  selectedCert?:  ExamCert;
  /** The selected domain IDs (exam-first flow). */
  selectedDomainIds?: string[];
}

interface QuizResult {
  question:  QuizQuestion;
  chosen:    number | null;
  correct:   boolean;
  /** True when the question was skipped (no answer selected). */
  skipped?:  boolean;
  timeTaken: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const COUNT_OPTIONS = [10, 25, 50, 100] as const;

const DIFFICULTY_STYLE: Record<QuizDifficulty, string> = {
  beginner:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  advanced:     'bg-red-500/10 text-red-400 border-red-500/30',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Randomizes the 4 answer options and updates the correct index to match.
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

// Walks the quiz list and re-shuffles any question whose correct-answer index
// matches both the previous two — guarantees no 3-in-a-row positional streak.
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

/** Count questions that match a cert + domain combination. */
function countForDomain(certId: string, domain: ExamDomain): number {
  return QUIZ_QUESTIONS.filter(
    (q) => q.certTags.includes(certId) && questionMatchesDomain(q, domain),
  ).length;
}

/** Count all questions for a cert. */
function countForCert(certId: string): number {
  return QUIZ_QUESTIONS.filter((q) => q.certTags.includes(certId)).length;
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: SetupStep }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {([1, 2, 3] as SetupStep[]).map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={[
              'w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[10px] transition-colors',
              s === step
                ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                : s < step
                  ? 'border-violet-500/40 bg-violet-500/10 text-violet-500/60'
                  : 'border-slate-700 bg-transparent text-slate-600',
            ].join(' ')}
          >
            {s}
          </div>
          {s < 3 && (
            <div className={['w-6 h-px', s < step ? 'bg-violet-500/40' : 'bg-slate-700'].join(' ')} />
          )}
        </div>
      ))}
      <span className="ml-1 text-[10px] font-mono text-slate-600">
        Step {step} of 3 —{' '}
        {step === 1 ? 'Select Exam' : step === 2 ? 'Select Domains' : 'Options'}
      </span>
    </div>
  );
}

// ─── Step 1: Select Exam ──────────────────────────────────────────────────────
function Step1SelectExam({
  selected,
  onSelect,
  onContinue,
}: {
  selected: ExamCert | null;
  onSelect: (cert: ExamCert) => void;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col h-full px-5 py-5">
      <StepIndicator step={1} />
      <h2 className="text-base font-semibold text-slate-100 mb-1">Select Exam</h2>
      <p className="text-[11px] text-slate-500 mb-4">Choose the certification you are preparing for.</p>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {EXAM_CERTS.map((cert) => {
            const total = countForCert(cert.id);
            const isSelected = selected?.id === cert.id;
            return (
              <button
                key={cert.id}
                onClick={() => onSelect(cert)}
                className={[
                  'text-left p-3 rounded-lg border transition-all',
                  isSelected
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/40 hover:bg-slate-800/70',
                ].join(' ')}
              >
                <div className="mb-2">
                  <span className={['inline-block font-mono text-[10px] px-1.5 py-0.5 rounded border', cert.badgeClass].join(' ')}>
                    {cert.id}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-200 leading-snug mb-0.5">{cert.name}</p>
                <p className="text-[10px] text-slate-500 leading-snug mb-2">{cert.provider}</p>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[10px] font-mono text-slate-600">
                    <span className="text-slate-400 font-semibold">{total}</span> Qs · <span className="text-slate-500">{cert.domains.length}d</span>
                  </p>
                  {cert.passingScore && (
                    <span className="text-[9px] font-mono text-slate-600">pass≥{cert.passingScore}%</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-700/50 mt-4">
        <button
          disabled={selected === null}
          onClick={onContinue}
          className="w-full py-2.5 rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Select Domains ───────────────────────────────────────────────────
function Step2SelectDomains({
  cert,
  selectedDomainIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
  onBack,
  onContinue,
}: {
  cert: ExamCert;
  selectedDomainIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const domainCounts = useMemo(
    () => new Map(cert.domains.map((d) => [d.id, countForDomain(cert.id, d)])),
    [cert],
  );

  const totalSelected = useMemo(() => {
    let count = 0;
    cert.domains.forEach((d) => {
      if (selectedDomainIds.has(d.id)) count += (domainCounts.get(d.id) ?? 0);
    });
    return count;
  }, [cert.domains, selectedDomainIds, domainCounts]);

  const allSelected = cert.domains.every((d) => selectedDomainIds.has(d.id));

  return (
    <div className="flex flex-col h-full px-5 py-5">
      <StepIndicator step={2} />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="text-[10px] font-mono text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-500 px-2 py-1 rounded transition-colors"
        >
          Back
        </button>
        <span className={['font-mono text-[10px] px-1.5 py-0.5 rounded border', cert.badgeClass].join(' ')}>
          {cert.id}
        </span>
        <span className="text-sm font-semibold text-slate-200 truncate">{cert.name}</span>
      </div>

      {/* Select all / deselect all */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">Domains</p>
        <button
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="text-[10px] font-mono text-violet-400 hover:text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded transition-colors"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Domain list */}
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {cert.domains.map((domain) => {
          const count = domainCounts.get(domain.id) ?? 0;
          const checked = selectedDomainIds.has(domain.id);
          return (
            <button
              key={domain.id}
              onClick={() => onToggle(domain.id)}
              className={[
                'w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg border transition-all',
                checked
                  ? 'border-violet-500/50 bg-violet-500/8'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-800/30',
              ].join(' ')}
            >
              {/* Checkbox */}
              <div className={[
                'mt-0.5 w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors',
                checked ? 'border-violet-500 bg-violet-500' : 'border-slate-600',
              ].join(' ')}>
                {checked && <div className="w-1.5 h-1 border-b border-r border-white rotate-[-45deg] mt-[-1px]" />}
              </div>
              {/* Domain info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-medium text-slate-300 leading-snug">{domain.name}</p>
                  <span className="font-mono text-[11px] text-slate-400 flex-shrink-0">{count}q</span>
                </div>
                {domain.weight && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-slate-600 shrink-0">{domain.weight}</span>
                    {(() => {
                      const nums = domain.weight.match(/\d+/g)?.map(Number) ?? [];
                      const pct  = nums.length >= 2 ? Math.round((nums[0] + nums[1]) / 2) : nums[0] ?? 0;
                      return (
                        <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500/50 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-700/50 mt-4">
        <button
          disabled={selectedDomainIds.size === 0 || totalSelected === 0}
          onClick={onContinue}
          className="w-full py-2.5 rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          {totalSelected > 0
            ? `Continue — ${totalSelected} questions available`
            : 'Select at least one domain'}
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Options ──────────────────────────────────────────────────────────
function Step3Options({
  cert,
  selectedDomainIds,
  onBack,
  onStart,
}: {
  cert: ExamCert;
  selectedDomainIds: Set<string>;
  onBack: () => void;
  onStart: (s: QuizSettings) => void;
}) {
  const [difficulty, setDifficulty] = useState<QuizDifficulty | 'all'>('all');
  const [count, setCount]           = useState<10 | 25 | 50 | 60 | 65 | 100>(25);

  const selectedDomains = useMemo(
    () => cert.domains.filter((d) => selectedDomainIds.has(d.id)),
    [cert.domains, selectedDomainIds],
  );

  const pool = useMemo(() => {
    return QUIZ_QUESTIONS.filter((q) => {
      if (!q.certTags.includes(cert.id)) return false;
      const inDomain = selectedDomains.some((d) => questionMatchesDomain(q, d));
      if (!inDomain) return false;
      if (difficulty !== 'all' && q.difficulty !== difficulty) return false;
      return true;
    });
  }, [cert.id, selectedDomains, difficulty]);

  const finalCount = Math.min(count, pool.length);

  const certPool = useMemo(
    () => QUIZ_QUESTIONS.filter((q) => q.certTags.includes(cert.id)).length,
    [cert.id],
  );
  const mockConfig = cert.mockExam;
  const showMockExamPreset = !!mockConfig && certPool >= (mockConfig.questions ?? 50);

  const buildSettings = useCallback(
    (overrides: Partial<QuizSettings> = {}): QuizSettings => ({
      category:           'All',
      difficulty,
      certFilter:         cert.id,
      count,
      selectedCert:       cert,
      selectedDomainIds:  Array.from(selectedDomainIds),
      ...overrides,
    }),
    [difficulty, cert, count, selectedDomainIds],
  );

  return (
    <div className="flex flex-col h-full px-5 py-5">
      <StepIndicator step={3} />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="text-[10px] font-mono text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-500 px-2 py-1 rounded transition-colors"
        >
          Back
        </button>
        <span className={['font-mono text-[10px] px-1.5 py-0.5 rounded border', cert.badgeClass].join(' ')}>
          {cert.id}
        </span>
        <span className="text-sm font-semibold text-slate-200 truncate">{cert.name}</span>
      </div>

      {/* Domain summary */}
      <div className="mb-5 px-3 py-2.5 rounded-lg border border-slate-700/60 bg-slate-800/30">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-1.5">Selected Domains</p>
        <div className="space-y-0.5">
          {selectedDomains.map((d) => (
            <p key={d.id} className="text-[11px] text-slate-400 leading-snug">{d.name}</p>
          ))}
        </div>
      </div>

      {/* Mock exam preset (cert-driven) */}
      {showMockExamPreset && mockConfig && (
        <button
          onClick={() =>
            onStart({
              category: 'All', difficulty: 'all', certFilter: cert.id,
              count: mockConfig.questions as QuizSettings['count'],
              examMode: true, examSec: mockConfig.durationMin * 60,
              selectedCert: cert,
              selectedDomainIds: Array.from(selectedDomainIds),
            })
          }
          className={`w-full mb-5 p-3 rounded-lg border transition-colors text-left ${cert.badgeClass.replace('text-', 'border-').replace('/15', '/40').replace('bg-', 'bg-').replace('/15', '/5')} hover:opacity-90`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-slate-200">Mock {cert.id} Exam</span>
            <span className="text-[10px] font-mono text-slate-400">{mockConfig.questions} Q · {mockConfig.durationMin} min · no hints</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">Timed simulation. No per-question feedback until the end.</p>
        </button>
      )}

      <div className="flex-1 overflow-y-auto space-y-5">
        {/* Difficulty */}
        <div>
          <label className="text-[10px] font-mono text-slate-600 uppercase tracking-wide block mb-1.5">Difficulty</label>
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
          <label className="text-[10px] font-mono text-slate-600 uppercase tracking-wide block mb-1.5">Questions</label>
          <div className="flex gap-2">
            {COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
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

        {/* Pool preview */}
        <p className="text-[11px] text-slate-600 font-mono text-center">
          {pool.length} questions match · <span className="text-slate-400">{finalCount}</span> will be used
        </p>
      </div>

      <div className="pt-4 border-t border-slate-700/50 mt-4">
        <button
          disabled={pool.length === 0}
          onClick={() => onStart(buildSettings())}
          className="w-full py-2.5 rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
}

// ─── Setup Screen (orchestrates the 3-step flow) ──────────────────────────────
function SetupScreen({ onStart }: { onStart: (s: QuizSettings) => void }) {
  const [step, setStep]                 = useState<SetupStep>(1);
  const [selectedCert, setSelectedCert] = useState<ExamCert | null>(null);
  const [selectedDomainIds, setSelectedDomainIds] = useState<Set<string>>(new Set());

  const handleSelectCert = (cert: ExamCert) => {
    setSelectedCert(cert);
    // Pre-select all domains when a cert is chosen.
    setSelectedDomainIds(new Set(cert.domains.map((d) => d.id)));
  };

  const handleToggleDomain = (id: string) => {
    setSelectedDomainIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedCert) setSelectedDomainIds(new Set(selectedCert.domains.map((d) => d.id)));
  };

  const handleDeselectAll = () => setSelectedDomainIds(new Set());

  if (step === 1) {
    return (
      <Step1SelectExam
        selected={selectedCert}
        onSelect={handleSelectCert}
        onContinue={() => setStep(2)}
      />
    );
  }

  if (step === 2 && selectedCert) {
    return (
      <Step2SelectDomains
        cert={selectedCert}
        selectedDomainIds={selectedDomainIds}
        onToggle={handleToggleDomain}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBack={() => setStep(1)}
        onContinue={() => setStep(3)}
      />
    );
  }

  if (step === 3 && selectedCert) {
    return (
      <Step3Options
        cert={selectedCert}
        selectedDomainIds={selectedDomainIds}
        onBack={() => setStep(2)}
        onStart={onStart}
      />
    );
  }

  // Fallback — should not normally be reached.
  return null;
}

// ─── Question Screen ──────────────────────────────────────────────────────────
function QuestionScreen({
  question, index, total, onAnswer, examMode, remainingSec, onAbandonExam, certId,
}: {
  question:       QuizQuestion;
  index:          number;
  total:          number;
  onAnswer:       (chosen: number | null) => void;
  examMode?:      boolean;
  remainingSec?:  number;
  onAbandonExam?: () => void;
  certId?:        string;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const progress = ((index + 1) / total) * 100;

  // Reset selection when the question changes (exam-mode chains questions w/o unmount).
  useEffect(() => { setChosen(null); }, [question.id]);

  const handleChoose = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    // Exam mode: no reveal, advance immediately.
    if (examMode) {
      onAnswer(i);
      return;
    }
    setTimeout(() => onAnswer(i), 900);
  };

  const timerStr = remainingSec !== undefined
    ? `${String(Math.floor(remainingSec / 60)).padStart(2, '0')}:${String(remainingSec % 60).padStart(2, '0')}`
    : null;
  const timerLow = remainingSec !== undefined && remainingSec <= 300;

  return (
    <div className="flex flex-col h-full min-h-0 px-6 py-5">
      {/* Exam-mode timer bar */}
      {examMode && timerStr && (
        <div className={`mb-3 px-3 py-2 rounded border flex items-center justify-between ${timerLow ? 'border-red-500/40 bg-red-500/10' : 'border-cyan-500/30 bg-cyan-500/5'}`}>
          <span className={`text-[11px] font-mono uppercase tracking-wide ${timerLow ? 'text-red-400' : 'text-cyan-400'}`}>Mock {certId ?? 'Exam'}</span>
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
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm ${style}`}
            >
              <span className="font-mono text-[10px] mr-3 opacity-60">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Exam-mode skip button */}
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

      {/* All options with per-option explanations */}
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
              {optExp && <p className={`mt-1 ml-4 ${isCorrect ? 'text-emerald-400/80' : isChosen ? 'text-red-400/70' : 'text-slate-600'}`}>{optExp}</p>}
            </div>
          );
        })}
        {/* Fallback overall explanation */}
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-1">Why</p>
          <p className="text-xs text-slate-400 leading-relaxed">{result.question.explanation}</p>
        </div>
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
  results, settings, onRestart, onRetry, onGenerateMore,
}: {
  results:        QuizResult[];
  settings:       QuizSettings | null;
  onRestart:      () => void;
  onRetry:        () => void;
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

  const cert = settings?.selectedCert ?? null;
  const selectedDomainIds = settings?.selectedDomainIds ? new Set(settings.selectedDomainIds) : null;
  const selectedDomains = cert && selectedDomainIds
    ? cert.domains.filter((d) => selectedDomainIds.has(d.id))
    : [];

  // Domain-level breakdown (when a cert is selected)
  const byDomain = useMemo(() => {
    if (!cert || selectedDomains.length === 0) return null;
    return selectedDomains.map((domain) => {
      const domainResults = results.filter((r) =>
        questionMatchesDomain({ category: r.question.category, topic: r.question.topic }, domain),
      );
      const domCorrect = domainResults.filter((r) => r.correct).length;
      return { domain, total: domainResults.length, correct: domCorrect };
    }).filter((d) => d.total > 0);
  }, [cert, selectedDomains, results]);

  // Category breakdown (fallback when no cert selected)
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
  const scoreBg    = pct >= 80 ? 'border-emerald-500/20 bg-emerald-500/5' : pct >= 60 ? 'border-amber-500/20 bg-amber-500/5' : 'border-red-500/20 bg-red-500/5';
  const passThreshold = cert?.passingScore ?? 70;
  const passed = pct >= passThreshold;

  return (
    <div className="overflow-y-auto h-full px-5 py-5">
      {/* Score banner */}
      <div className={`rounded-lg border px-5 py-4 mb-5 ${scoreBg}`}>
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className={`text-4xl font-bold font-mono ${scoreColor}`}>{pct}<span className="text-2xl">%</span></div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
              {correct}/{total} correct{skipped > 0 ? ` · ${skipped} skipped` : ''} · avg {avgTime}s
            </p>
          </div>
          {cert && (
            <div className="text-right">
              <div className={['text-[10px] font-mono px-2 py-0.5 rounded border', cert.badgeClass].join(' ')}>
                {cert.id}
              </div>
              <div className={`mt-1 text-[11px] font-mono font-semibold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                {passed ? '↑ passing range' : '↓ below passing'}
              </div>
            </div>
          )}
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
               style={{ width: `${pct}%` }} />
        </div>
        {cert && (
          <div className="mt-1.5 flex items-center gap-1">
            <div className="h-px flex-1 bg-slate-700" />
            <span className="text-[9px] font-mono text-slate-600">passing threshold ~{passThreshold}%</span>
          </div>
        )}
      </div>

      {/* Domain breakdown — shown when cert is selected */}
      {byDomain && byDomain.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-2.5">Domain Breakdown</p>
          <div className="space-y-3">
            {byDomain.map(({ domain, total: dTotal, correct: dCorrect }) => {
              const dPct     = dTotal > 0 ? Math.round((dCorrect / dTotal) * 100) : 0;
              const barColor = dPct >= 80 ? 'bg-emerald-500' : dPct >= 60 ? 'bg-amber-500' : 'bg-red-500';
              const shortName = domain.name.replace(/^Domain \d+:\s*/, '');
              const isWeak   = dPct < 70 && dTotal > 0;
              return (
                <div key={domain.id} className={isWeak ? 'p-2.5 rounded-lg border border-red-500/15 bg-red-500/5' : ''}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex-1 mr-2 min-w-0">
                      <span className="text-[11px] text-slate-300 leading-snug block">{shortName}</span>
                      {domain.weight && (
                        <span className="text-[10px] font-mono text-slate-600">{domain.weight} of exam</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-600">{dCorrect}/{dTotal}</span>
                      <span className={`text-[11px] font-mono font-bold ${dPct >= 80 ? 'text-emerald-400' : dPct >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                        {dPct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                    <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${dPct}%` }} />
                  </div>
                  {isWeak && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-red-400/70 font-mono">Focus area — below passing threshold</span>
                      <button
                        onClick={() => onGenerateMore(domain.categories[0] ?? '')}
                        className="text-[9px] font-mono text-violet-400 hover:text-violet-300 border border-violet-500/30 px-1.5 py-0.5 rounded transition-colors"
                      >
                        drill more →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category breakdown — shown when no cert selected */}
      {(!byDomain || byDomain.length === 0) && (
        <div className="mb-5">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-2.5">Category Breakdown</p>
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
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onRetry}
          className="flex-1 py-2.5 rounded border border-violet-500/40 hover:border-violet-500/70 bg-violet-500/5 hover:bg-violet-500/10 text-violet-300 text-sm font-semibold transition-colors"
        >
          Retry Same Settings
        </button>
        <button
          onClick={onRestart}
          className="flex-1 py-2.5 rounded border border-slate-700 hover:border-slate-600 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition-colors"
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
  const [examEndAt,     setExamEndAt]     = useState<number | null>(null);
  const [nowMs,         setNowMs]         = useState(() => Date.now());
  const [generating,    setGenerating]    = useState(false);
  const [genError,      setGenError]      = useState('');

  const handleStart = useCallback((s: QuizSettings) => {
    const selectedDomains = s.selectedCert && s.selectedDomainIds
      ? s.selectedCert.domains.filter((d) => (s.selectedDomainIds as string[]).includes(d.id))
      : [];

    const pool = QUIZ_QUESTIONS.filter((q) => {
      // Always filter by cert tag when an exam is selected.
      if (s.certFilter !== 'All' && !q.certTags.includes(s.certFilter)) return false;
      // Domain filter — only applied when domains are explicitly selected.
      if (selectedDomains.length > 0) {
        const inDomain = selectedDomains.some((d) => questionMatchesDomain(q, d));
        if (!inDomain) return false;
      }
      if (s.difficulty !== 'all' && q.difficulty !== s.difficulty) return false;
      return true;
    });

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
      if (isLast) {
        setExamEndAt(null);
        setMode('summary');
      } else {
        setCurrentIndex((i) => i + 1);
        setQuestionStart(Date.now());
      }
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

  // ── Exam countdown tick — auto-submit unanswered remainder when timer hits 0 ──
  useEffect(() => {
    if (!examEndAt) return;
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [examEndAt]);

  useEffect(() => {
    if (!examEndAt) return;
    if (nowMs < examEndAt) return;
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
          <QuestionScreen
            question={currentQuestion}
            index={currentIndex}
            total={questions.length}
            onAnswer={handleAnswer}
            examMode={settings?.examMode}
            remainingSec={remainingSec}
            onAbandonExam={handleAbandonExam}
            certId={settings?.selectedCert?.id}
          />
        )}
        {mode === 'result'   && currentResult && (
          <ResultScreen result={currentResult} index={currentIndex} total={questions.length} onNext={handleNext} />
        )}
        {mode === 'summary'  && (
          <SummaryScreen
            results={results}
            settings={settings}
            onRestart={() => { setMode('setup'); }}
            onRetry={() => { if (settings) handleStart(settings); }}
            onGenerateMore={handleGenerateMore}
          />
        )}
      </div>
    </div>
  );
}
