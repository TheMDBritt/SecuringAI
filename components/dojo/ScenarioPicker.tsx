'use client';

import type { DojoId, Scenario, Difficulty } from '@/types';

interface ScenarioPickerProps {
  scenarios: Scenario[];
  selected: Scenario | null;
  onSelect: (s: Scenario) => void;
  dojoId: DojoId;
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
    desc: 'Choose a SOC workflow to run with BlackBeltAI as your analyst.',
  },
  3: {
    label: 'AI Defense',
    desc: 'Pick a scenario to build defenses against AI-powered attacks.',
  },
};

export function ScenarioPicker({
  scenarios,
  selected,
  onSelect,
  dojoId,
}: ScenarioPickerProps) {
  const header = DOJO_HEADER[dojoId];

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
          const isSelected = selected?.id === scenario.id;
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
    </div>
  );
}
