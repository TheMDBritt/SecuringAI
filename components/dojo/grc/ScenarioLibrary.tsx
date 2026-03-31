'use client';

import { useState } from 'react';
import { GRC_SCENARIOS } from '@/lib/grc-scenarios';
import type { GRCScenario, GRCScenarioType } from '@/types';

interface Props {
  selected: GRCScenario | null;
  onSelect: (s: GRCScenario) => void;
}

const TYPE_TABS: { id: GRCScenarioType | 'all'; label: string }[] = [
  { id: 'all',                   label: 'All' },
  { id: 'risk-classification',   label: 'Risk Class.' },
  { id: 'shadow-ai-audit',       label: 'Shadow AI' },
  { id: 'responsible-ai-review', label: 'Resp. AI' },
  { id: 'compliance-gap',        label: 'Compliance' },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  intermediate: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  advanced:     'text-red-400 border-red-500/30 bg-red-500/10',
};

const TYPE_LABEL: Record<GRCScenarioType, string> = {
  'risk-classification':   'Risk Classification',
  'shadow-ai-audit':       'Shadow AI Audit',
  'responsible-ai-review': 'Responsible AI Review',
  'compliance-gap':        'Compliance Gap',
};

export default function ScenarioLibrary({ selected, onSelect }: Props) {
  const [typeFilter, setTypeFilter] = useState<GRCScenarioType | 'all'>('all');

  const visible = typeFilter === 'all'
    ? GRC_SCENARIOS
    : GRC_SCENARIOS.filter((s) => s.type === typeFilter);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700 shrink-0">
        <h2 className="text-sm font-semibold text-slate-100">Scenario Library</h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Select a scenario to begin your GRC review</p>
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-0.5 px-4 py-2 border-b border-slate-700 flex-wrap shrink-0">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTypeFilter(tab.id)}
            className={[
              'text-[10px] font-mono px-2 py-1 rounded transition-colors',
              typeFilter === tab.id
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-slate-500 hover:text-slate-300',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scenario cards */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {visible.map((scenario) => {
          const isSelected = selected?.id === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => onSelect(scenario)}
              className={[
                'w-full text-left rounded-lg border p-3 transition-colors',
                isSelected
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={[
                  'text-xs font-medium leading-snug',
                  isSelected ? 'text-emerald-200' : 'text-slate-200',
                ].join(' ')}>
                  {scenario.title}
                </span>
                <span className={[
                  'text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 capitalize',
                  DIFFICULTY_COLOR[scenario.difficulty],
                ].join(' ')}>
                  {scenario.difficulty}
                </span>
              </div>
              <div className="mt-1.5 text-[10px] text-slate-500">
                {TYPE_LABEL[scenario.type]}
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {scenario.frameworks.map((fw) => (
                  <span
                    key={fw}
                    className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-700/50 text-slate-500 border border-slate-700"
                  >
                    {fw}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
