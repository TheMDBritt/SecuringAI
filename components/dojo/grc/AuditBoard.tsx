'use client';

import { useState } from 'react';
import type { GRCAssessmentScore, GRCConfig, GRCReview, GRCScenario } from '@/types';

interface Props {
  scenario: GRCScenario | null;
  grcConfig: GRCConfig;
  onScoreReceived: (score: GRCAssessmentScore) => void;
}

const RISK_TIERS: GRCReview['riskTier'][] = ['Low', 'Medium', 'High', 'Critical'];

const TIER_COLOR: Record<string, string> = {
  Low:      'bg-emerald-500/10 border-emerald-500/40 text-emerald-300',
  Medium:   'bg-amber-500/10 border-amber-500/40 text-amber-300',
  High:     'bg-orange-500/10 border-orange-500/40 text-orange-300',
  Critical: 'bg-red-500/10 border-red-500/40 text-red-300',
};

const GRADE_COLOR: Record<string, string> = {
  A: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  B: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  C: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  D: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  F: 'text-red-400 bg-red-500/10 border-red-500/30',
};

export default function AuditBoard({ scenario, grcConfig, onScoreReceived }: Props) {
  const [review, setReview] = useState<GRCReview>({
    frameworkApplied: '',
    riskTier: 'Medium',
    findings: '',
    controls: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<GRCAssessmentScore | null>(null);

  function reset() {
    setReview({ frameworkApplied: '', riskTier: 'Medium', findings: '', controls: '' });
    setScore(null);
    setError(null);
  }

  async function handleSubmit() {
    if (!scenario) return;
    if (!review.frameworkApplied.trim() || !review.findings.trim() || !review.controls.trim()) {
      setError('Please complete all fields before submitting.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/grc-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: scenario.id, review, grcConfig }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const assessmentScore = (await res.json()) as GRCAssessmentScore;
      setScore(assessmentScore);
      onScoreReceived(assessmentScore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!scenario) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-0 bg-slate-950 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-emerald-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-300 mb-1">Select a Scenario</h3>
        <p className="text-xs text-slate-600 max-w-xs">Choose a GRC scenario from the left panel to begin your audit review.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-700 shrink-0 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-100 leading-snug">{scenario.title}</h2>
          <p className="text-[11px] text-slate-500 mt-0.5 font-mono capitalize">{scenario.type.replace(/-/g, ' ')} · {scenario.difficulty}</p>
        </div>
        {score && (
          <button onClick={reset} className="text-[10px] font-mono text-slate-500 hover:text-slate-300 shrink-0 border border-slate-700 hover:border-slate-600 rounded px-2 py-1 transition-colors">
            New Attempt
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Deployment Brief */}
        <div>
          <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Deployment Brief</h3>
          <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 text-xs text-slate-300 leading-relaxed space-y-2 whitespace-pre-wrap">
            {scenario.brief}
          </div>
        </div>

        {/* Review form */}
        <div className={score ? 'opacity-50 pointer-events-none' : ''}>
          <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">Your Review</h3>

          {/* Framework Applied */}
          <div className="mb-3">
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block mb-1">
              Framework(s) Applied
            </label>
            <input
              value={review.frameworkApplied}
              onChange={(e) => setReview({ ...review, frameworkApplied: e.target.value })}
              placeholder="e.g. EU AI Act Annex III, NIST AI RMF MAP function"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Risk Tier */}
          <div className="mb-3">
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block mb-1">
              Risk Tier
            </label>
            <div className="flex gap-2">
              {RISK_TIERS.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setReview({ ...review, riskTier: tier })}
                  className={[
                    'flex-1 py-1.5 rounded border text-xs font-mono transition-colors',
                    review.riskTier === tier ? TIER_COLOR[tier] : 'border-slate-700 text-slate-500 hover:border-slate-600',
                  ].join(' ')}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Findings */}
          <div className="mb-3">
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block mb-1">
              Findings
            </label>
            <textarea
              value={review.findings}
              onChange={(e) => setReview({ ...review, findings: e.target.value })}
              placeholder="List your findings — risks, compliance gaps, missing controls, problematic features..."
              rows={6}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>

          {/* Controls */}
          <div className="mb-3">
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block mb-1">
              Recommended Controls
            </label>
            <textarea
              value={review.controls}
              onChange={(e) => setReview({ ...review, controls: e.target.value })}
              placeholder="Propose specific controls — technical, procedural, governance..."
              rows={5}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 mb-2">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {loading ? 'Submitting for Review…' : 'Submit for AI Review'}
          </button>
        </div>

        {/* AI Feedback */}
        {score && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">AI Feedback</h3>
              <span className={[
                'text-sm font-bold font-mono px-2 py-0.5 rounded border',
                GRADE_COLOR[score.grade] ?? 'text-slate-300 border-slate-700',
              ].join(' ')}>
                Grade {score.grade} · {score.total}/100
              </span>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {score.feedback}
            </div>

            {score.socraticQuestions.length > 0 && (
              <div>
                <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                  Questions to Consider
                </h3>
                <div className="space-y-2">
                  {score.socraticQuestions.map((q, i) => (
                    <div key={i} className="flex gap-2 rounded-lg border border-slate-700 bg-slate-800/40 p-3">
                      <span className="text-emerald-500 font-mono text-[10px] shrink-0 mt-0.5">{i + 1}.</span>
                      <p className="text-xs text-slate-300 leading-relaxed">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
