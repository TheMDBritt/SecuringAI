'use client';

import type { GRCAssessmentScore, GRCConfig, GRCFramework } from '@/types';

interface Props {
  config: GRCConfig;
  onChange: (c: GRCConfig) => void;
  score: GRCAssessmentScore | null;
}

const FRAMEWORKS: { id: GRCFramework; label: string; desc: string }[] = [
  { id: 'NIST-AIRMF', label: 'NIST AI RMF',  desc: 'GOVERN / MAP / MEASURE / MANAGE' },
  { id: 'EU-AI-Act',  label: 'EU AI Act',     desc: 'Risk tiers, Annex III, obligations' },
  { id: 'ISO-AI',     label: 'ISO 42001',      desc: 'AI management system standard' },
  { id: 'OWASP-LLM',  label: 'OWASP LLM Top 10', desc: 'LLM01–LLM10 vulnerabilities' },
];

const PERSONAS = [
  { id: 'risk-analyst',        label: 'Risk Analyst',          desc: 'Likelihood · impact · residual risk' },
  { id: 'auditor',             label: 'Auditor',               desc: 'Evidence · artifacts · conformity' },
  { id: 'governance-engineer', label: 'Governance Engineer',   desc: 'Controls · tooling · operationalizing' },
  { id: 'ciso',                label: 'CISO',                  desc: 'Executive · strategic · concise' },
] as const;

const DEPTH_OPTIONS = [
  { id: 'basic',    label: 'Basic',    desc: 'Introductory feedback' },
  { id: 'standard', label: 'Standard', desc: 'Professional review' },
  { id: 'deep',     label: 'Deep',     desc: 'Expert-level analysis' },
] as const;

const GRADE_COLOR: Record<string, string> = {
  A: 'text-emerald-400',
  B: 'text-cyan-400',
  C: 'text-amber-400',
  D: 'text-orange-400',
  F: 'text-red-400',
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 25) * 100;
  return (
    <div>
      <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
        <span>{label}</span>
        <span>{value}/25</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function GovernanceConfig({ config, onChange, score }: Props) {
  function setPersona(persona: GRCConfig['persona']) {
    onChange({ ...config, persona });
  }
  function setDepth(depth: GRCConfig['depth']) {
    onChange({ ...config, depth });
  }
  function toggleFramework(fw: GRCFramework) {
    onChange({ ...config, frameworks: { ...config.frameworks, [fw]: !config.frameworks[fw] } });
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-5">
      {/* Persona */}
      <div>
        <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Reviewer Persona</h3>
        <div className="space-y-1">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPersona(p.id)}
              className={[
                'w-full text-left px-3 py-2 rounded border transition-colors',
                config.persona === p.id
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300',
              ].join(' ')}
            >
              <div className="text-xs font-medium">{p.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Frameworks */}
      <div>
        <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Active Frameworks</h3>
        <div className="space-y-1">
          {FRAMEWORKS.map((fw) => (
            <button
              key={fw.id}
              onClick={() => toggleFramework(fw.id)}
              className={[
                'w-full text-left px-3 py-2 rounded border transition-colors',
                config.frameworks[fw.id]
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600',
              ].join(' ')}
            >
              <div className="flex items-center gap-2">
                <span className={[
                  'w-3 h-3 rounded-sm border shrink-0 flex items-center justify-center text-[8px]',
                  config.frameworks[fw.id]
                    ? 'bg-emerald-500 border-emerald-400 text-white'
                    : 'border-slate-600',
                ].join(' ')}>
                  {config.frameworks[fw.id] && '✓'}
                </span>
                <span className="text-xs font-medium">{fw.label}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 ml-5">{fw.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Depth */}
      <div>
        <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Feedback Depth</h3>
        <div className="flex gap-1">
          {DEPTH_OPTIONS.map((d) => (
            <button
              key={d.id}
              onClick={() => setDepth(d.id)}
              className={[
                'flex-1 text-center px-2 py-2 rounded border transition-colors text-xs',
                config.depth === d.id
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400',
              ].join(' ')}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Score panel */}
      {score && (
        <div className="border border-slate-700 rounded-lg p-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Last Score</h3>
            <span className={`text-2xl font-bold font-mono ${GRADE_COLOR[score.grade] ?? 'text-slate-300'}`}>
              {score.grade}
            </span>
          </div>
          <div className="text-center">
            <span className="text-3xl font-bold text-slate-100 font-mono">{score.total}</span>
            <span className="text-slate-500 text-sm font-mono">/100</span>
          </div>
          <div className="space-y-2">
            <ScoreBar label="Framework Accuracy"        value={score.frameworkAccuracy} />
            <ScoreBar label="Risk Tier Accuracy"        value={score.riskTierAccuracy} />
            <ScoreBar label="Findings Completeness"     value={score.findingsCompleteness} />
            <ScoreBar label="Controls Appropriateness"  value={score.controlsAppropriateness} />
          </div>
        </div>
      )}
    </div>
  );
}
