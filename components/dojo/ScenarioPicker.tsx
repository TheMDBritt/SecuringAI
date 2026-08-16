'use client';

import type { DojoId, Scenario, Dojo2Config } from '@/types';
import type { Dojo2IncidentScenario } from '@/lib/dojo2-scenarios';
import { DOJO2_TASK_LABELS, DOJO2_PERSONA_LABELS, DIFFICULTY_BADGE_CLASSES } from '@/lib/dojo2-scenarios';

interface ScenarioPickerProps {
  scenarios: Scenario[];
  selected: Scenario | null;
  onSelect: (s: Scenario) => void;
  dojoId: DojoId;
  activeDojo2Scenario?: Dojo2IncidentScenario | null;
  dojo2Config?: Dojo2Config;
}

const DIFFICULTY_BADGE = DIFFICULTY_BADGE_CLASSES;

// Selection is an interaction state, so it uses the brand accent in every
// dojo. It previously used red, brand and emerald, which meant the highlight
// on a selected Dojo 1 card was the same red the evaluator uses for FAIL.
const DOJO_ACCENT: Record<DojoId, { selected: string; dot: string; label: string }> = {
  1: { selected: 'border-brand-500/60 bg-brand-500/5', dot: 'bg-brand-500', label: 'LLM Attack & Defense' },
  2: { selected: 'border-brand-500/60 bg-brand-500/5', dot: 'bg-brand-500', label: 'AI-Assisted SOC' },
  3: { selected: 'border-brand-500/60 bg-brand-500/5', dot: 'bg-brand-500', label: 'AI GRC' },
};

// One sentence per dojo, same construction: pick a scenario, then what the
// right panel is for. They previously ran to different lengths in different
// orders, which made the three dojos feel like three products.
const DOJO_HEADER_DESC: Record<DojoId, string> = {
  1: 'Pick a scenario, set the guardrails on the right, then attack. Outcomes are deterministic.',
  2: 'Pick a workflow, load an incident from the right, then direct the analysis.',
  3: 'Pick a scenario, set the framework lens on the right, then draft the deliverable.',
};

const DEPTH_LABELS: Record<string, string> = {
  basic: 'Basic', standard: 'Standard', deep: 'Deep',
};
const STYLE_LABELS: Record<string, string> = {
  concise: 'Concise', detailed: 'Detailed', structured: 'Structured',
};
const CONTEXT_LABELS: Record<string, string> = {
  none: 'None', limited: 'Limited', full: 'Full',
};
const RISK_COLOR: Record<string, string> = {
  low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-amber-400', critical: 'text-red-400',
};
const CONFIDENCE_COLOR: Record<string, string> = {
  low: 'text-slate-400', medium: 'text-amber-400', high: 'text-emerald-400',
};
const TASK_BADGE: Record<string, string> = {
  'log-triage':           'bg-brand-500/10 text-brand-400 border-brand-500/30',
  'alert-enrichment':     'bg-brand-500/10 text-brand-400 border-brand-500/30',
  'detection-rule-gen':   'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'incident-report-draft':'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'threat-hunt':          'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'malware-behavior':     'bg-red-500/10 text-red-400 border-red-500/30',
  'cloud-identity-abuse': 'bg-brand-500/10 text-brand-400 border-brand-500/30',
  'ai-system-compromise': 'bg-red-500/10 text-red-400 border-red-500/30',
};

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
          ? 'border-brand-500/40 bg-brand-500/10 text-brand-400'
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
    <div className="border border-brand-500/30 rounded bg-brand-500/5 p-2.5">
      <p className="text-[10px] font-mono text-brand-500 uppercase tracking-widest mb-2">
        Active Scenario
      </p>

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
            <span className={['text-[9px] px-1.5 py-0.5 rounded border font-mono', DIFFICULTY_BADGE[activeDojo2Scenario.difficulty]].join(' ')}>
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

      <div className="border-t border-slate-700/60 pt-2 flex flex-col">
        <ConfigRow label="Persona"    value={DOJO2_PERSONA_LABELS[config.persona]} />
        <ConfigRow label="Depth"      value={DEPTH_LABELS[config.analysisDepth]} />
        <ConfigRow label="Style"      value={STYLE_LABELS[config.responseStyle]} />
        <ConfigRow label="Context"    value={CONTEXT_LABELS[config.contextLevel]} />
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

      <div className="flex flex-wrap gap-1 mt-2 border-t border-slate-700/60 pt-2">
        <FeaturePill label="IOC Extraction" enabled={config.iocExtraction} />
        <FeaturePill label="MITRE Mapping"  enabled={config.mitreMapping} />
        <FeaturePill label="Threat Corr."   enabled={config.threatCorrelation} />
      </div>
    </div>
  );
}

export function ScenarioPicker({
  scenarios,
  selected,
  onSelect,
  dojoId,
  activeDojo2Scenario,
  dojo2Config,
}: ScenarioPickerProps) {
  const accent = DOJO_ACCENT[dojoId];

  return (
    <div className="p-3 flex flex-col gap-3">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            {scenarios.length} scenarios
          </p>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">{DOJO_HEADER_DESC[dojoId]}</p>
      </div>

      {/* Scenario cards */}
      <div className="flex flex-col gap-1.5">
        {scenarios.map((scenario, idx) => {
          const isSelected = selected?.id === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => onSelect(scenario)}
              className={[
                'w-full text-left p-2.5 rounded border transition-all duration-150 group',
                isSelected
                  ? accent.selected
                  : 'border-slate-700/60 bg-slate-800/30 hover:bg-slate-800/60 hover:border-slate-600',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="font-mono text-[9px] text-slate-700 shrink-0 mt-[3px]">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  {/* Titles wrap to two lines rather than truncating. An ellipsis
                      in a navigation list hides the one word that tells the
                      learner what the scenario is. */}
                  <span className="text-[12px] font-medium text-slate-200 leading-snug group-hover:text-slate-100 transition-colors duration-150 line-clamp-2">
                    {scenario.title}
                  </span>
                </div>
                <span
                  className={[
                    'shrink-0 text-[9px] px-1.5 py-0.5 rounded border font-mono uppercase tracking-wide',
                    DIFFICULTY_BADGE[scenario.difficulty],
                  ].join(' ')}
                >
                  {scenario.difficulty.slice(0, 3)}
                </span>
              </div>

              {/* Clamped to three lines. The full objective is in the scenario
                  brief in the working area, so repeating it in full here pushed
                  the rest of the list off screen. */}
              {isSelected && (
                <p className="text-[11px] text-slate-400 leading-snug mt-1 mb-1.5 line-clamp-3">
                  {scenario.description}
                </p>
              )}

              {isSelected && (scenario.owaspTags.length > 0 || (scenario.mitreAttackIds && scenario.mitreAttackIds.length > 0)) && (
                <div className="flex flex-wrap gap-1">
                  {scenario.owaspTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-1 py-0.5 rounded bg-slate-700/80 text-slate-400 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                  {scenario.mitreAttackIds && scenario.mitreAttackIds.slice(0, 2).map((id) => (
                    <span
                      key={id}
                      className="text-[9px] px-1 py-0.5 rounded bg-slate-700/50 text-slate-500 font-mono"
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

      {/* Dojo 2: Active Scenario Preview */}
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
