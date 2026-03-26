'use client';

import type { DojoId, Scenario, Difficulty, Dojo2Config } from '@/types';
import type { Dojo2IncidentScenario } from '@/lib/dojo2-scenarios';
import { DOJO2_TASK_LABELS } from '@/lib/dojo2-scenarios';

interface ScenarioPickerProps {
  scenarios: Scenario[];
  selected: Scenario | null;
  onSelect: (s: Scenario) => void;
  dojoId: DojoId;
  /** Dojo 2 only: the specific incident loaded from the right panel. */
  activeDojo2Scenario?: Dojo2IncidentScenario | null;
  /** Dojo 2 only: live analyst config for the active scenario preview. */
  dojo2Config?: Dojo2Config;
}

const DIFFICULTY_BADGE: Record<Difficulty, string> = {
  beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  advanced: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const DOJO_ACCENT: Record<DojoId, string> = {
  1: 'border-red-500 bg-red-500/5',
  2: 'border-cyan-500 bg-cyan-500/5',
  3: 'border-emerald-500 bg-emerald-500/5',
};

const DOJO_HEADER: Record<DojoId, { label: string; desc: string }> = {
  1: {
    label: 'Attack & Defense',
    desc: 'Select a scenario to begin attacking or defending BlackBeltAI.',
  },
  2: {
    label: 'SOC Assistant',
    desc: 'Choose a SOC workflow, then load an incident from the right panel.',
  },
  3: {
    label: 'AI Defense',
    desc: 'Pick a scenario to build defenses against AI-powered attacks.',
  },
};

// ─── Dojo 2 label maps ────────────────────────────────────────────────────────

const PERSONA_LABELS: Record<string, string> = {
  analyst:  'SOC Analyst',
  ciso:     'CISO',
  'ir-lead':'IR Lead',
};

const DEPTH_LABELS: Record<string, string> = {
  basic:    'Basic',
  standard: 'Standard',
  deep:     'Deep',
};

const STYLE_LABELS: Record<string, string> = {
  concise:    'Concise',
  detailed:   'Detailed',
  structured: 'Structured',
};

const CONTEXT_LABELS: Record<string, string> = {
  none:    'None',
  limited: 'Limited',
  full:    'Full',
};

const RISK_COLOR: Record<string, string> = {
  low:      'text-emerald-400',
  medium:   'text-amber-400',
  high:     'text-orange-400',
  critical: 'text-red-400',
};

const CONFIDENCE_COLOR: Record<string, string> = {
  low:    'text-slate-400',
  medium: 'text-amber-400',
  high:   'text-emerald-400',
};

const DIFF_BADGE: Record<string, string> = {
  beginner:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  advanced:     'bg-red-500/10 text-red-400 border-red-500/30',
};

const TASK_BADGE: Record<string, string> = {
  'log-triage':           'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'alert-enrichment':     'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'detection-rule-gen':   'bg-orange-500/10 text-orange-400 border-orange-500/30',
  'incident-report-draft':'bg-teal-500/10 text-teal-400 border-teal-500/30',
};

// ─── Active Scenario Preview (Dojo 2 only) ────────────────────────────────────

function ConfigRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-[10px] text-slate-500 font-mono shrink-0">{label}</span>
      <span className={['text-[10px] font-medium text-right', valueClass ?? 'text-slate-300'].join(' ')}>
        {value}
      </span>
    </div>
  );
}

function FeaturePill({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <span
      className={[
        'text-[9px] px-1.5 py-0.5 rounded border font-mono',
        enabled
          ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
          : 'border-slate-700 text-slate-600',
      ].join(' ')}
    >
      {enabled ? '✓ ' : '✗ '}{label}
    </span>
  );
}

function Dojo2ActivePreview({
  selected,
  activeDojo2Scenario,
  config,
}: {
  selected: Scenario | null;
  activeDojo2Scenario: Dojo2IncidentScenario | null;
  config: Dojo2Config;
}) {
  return (
    <div className="border border-cyan-500/30 rounded bg-cyan-500/5 p-2.5">
      <p className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest mb-2">
        Active Scenario
      </p>

      {/* Incident / workflow info */}
      {activeDojo2Scenario ? (
        <div className="mb-2.5">
          <p className="text-xs font-medium text-slate-100 leading-snug mb-1.5">
            {activeDojo2Scenario.title}
          </p>
          <div className="flex flex-wrap gap-1">
            <span className={['text-[9px] px-1.5 py-0.5 rounded border font-mono', TASK_BADGE[activeDojo2Scenario.taskType]].join(' ')}>
              {DOJO2_TASK_LABELS[activeDojo2Scenario.taskType]}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded border font-mono border-slate-600 text-slate-400">
              {activeDojo2Scenario.attackCategory}
            </span>
            <span className={['text-[9px] px-1.5 py-0.5 rounded border font-mono', DIFF_BADGE[activeDojo2Scenario.difficulty]].join(' ')}>
              {activeDojo2Scenario.difficulty}
            </span>
          </div>
        </div>
      ) : selected ? (
        <div className="mb-2.5">
          <p className="text-xs font-medium text-slate-100 leading-snug">{selected.title}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Load an incident from the right panel →</p>
        </div>
      ) : null}

      {/* Analyst config */}
      <div className="border-t border-slate-700/60 pt-2 flex flex-col">
        <ConfigRow label="Persona"     value={PERSONA_LABELS[config.persona]} />
        <ConfigRow label="Depth"       value={DEPTH_LABELS[config.analysisDepth]} />
        <ConfigRow label="Style"       value={STYLE_LABELS[config.responseStyle]} />
        <ConfigRow label="Context"     value={CONTEXT_LABELS[config.contextLevel]} />
        <ConfigRow
          label="Confidence"
          value={config.confidenceLevel.charAt(0).toUpperCase() + config.confidenceLevel.slice(1)}
          valueClass={CONFIDENCE_COLOR[config.confidenceLevel]}
        />
        <ConfigRow
          label="Risk"
          value={config.riskAssessment.charAt(0).toUpperCase() + config.riskAssessment.slice(1)}
          valueClass={RISK_COLOR[config.riskAssessment]}
        />
      </div>

      {/* Feature toggles */}
      <div className="flex flex-wrap gap-1 mt-2 border-t border-slate-700/60 pt-2">
        <FeaturePill label="IOC Extraction"   enabled={config.iocExtraction} />
        <FeaturePill label="MITRE Mapping"    enabled={config.mitreMapping} />
        <FeaturePill label="Threat Corr."     enabled={config.threatCorrelation} />
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ScenarioPicker({
  scenarios,
  selected,
  onSelect,
  dojoId,
  activeDojo2Scenario,
  dojo2Config,
}: ScenarioPickerProps) {
  const header = DOJO_HEADER[dojoId];

  // For Dojo 2, the highlighted card is the one matching the active incident's task type
  // (which may have been auto-selected when loading from the right panel).
  function isCardSelected(scenario: Scenario): boolean {
    return selected?.id === scenario.id;
  }

  return (
    <div className="p-3 flex flex-col gap-3">
      {/* Section header */}
      <div>
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">
          Scenarios
        </p>
        <p className="text-xs text-slate-400">{header.desc}</p>
      </div>

      {/* Scenario cards */}
      <div className="flex flex-col gap-2">
        {scenarios.map((scenario) => {
          const isSelected = isCardSelected(scenario);
          return (
            <button
              key={scenario.id}
              onClick={() => onSelect(scenario)}
              className={[
                'w-full text-left p-3 rounded border transition-all',
                isSelected
                  ? DOJO_ACCENT[dojoId]
                  : 'border-slate-700 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-600',
              ].join(' ')}
            >
              {/* Title + difficulty */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-sm font-medium text-slate-100 leading-snug">
                  {scenario.title}
                </span>
                <span
                  className={[
                    'shrink-0 text-[10px] px-1.5 py-0.5 rounded border font-mono uppercase',
                    DIFFICULTY_BADGE[scenario.difficulty],
                  ].join(' ')}
                >
                  {scenario.difficulty}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 leading-relaxed">
                {scenario.description}
              </p>

              {/* Tags */}
              {scenario.owaspTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {scenario.owaspTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {scenario.mitreAttackIds && scenario.mitreAttackIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {scenario.mitreAttackIds.map((id) => (
                    <span
                      key={id}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-500 font-mono"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Dojo 2: Active Scenario Preview — shown whenever a scenario or incident is active */}
      {dojoId === 2 && dojo2Config && (selected || activeDojo2Scenario) && (
        <Dojo2ActivePreview
          selected={selected}
          activeDojo2Scenario={activeDojo2Scenario ?? null}
          config={dojo2Config}
        />
      )}
    </div>
  );
}
