'use client';

import { useState } from 'react';
import ScenarioLibrary from './grc/ScenarioLibrary';
import AuditBoard from './grc/AuditBoard';
import GovernanceConfig from './grc/GovernanceConfig';
import type { GRCAssessmentScore, GRCConfig, GRCScenario } from '@/types';

interface Props {
  grcConfig: GRCConfig;
  onGRCConfigChange: (c: GRCConfig) => void;
}

export default function Dojo3View({ grcConfig, onGRCConfigChange }: Props) {
  const [selectedScenario, setSelectedScenario] = useState<GRCScenario | null>(null);
  const [lastScore, setLastScore] = useState<GRCAssessmentScore | null>(null);

  function handleSelectScenario(scenario: GRCScenario) {
    setSelectedScenario(scenario);
    setLastScore(null);
  }

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Left panel — Scenario Library */}
      <div className="w-64 shrink-0 border-r border-slate-700 flex flex-col min-h-0 bg-slate-900">
        <ScenarioLibrary
          selected={selectedScenario}
          onSelect={handleSelectScenario}
        />
      </div>

      {/* Center panel — Audit Board */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0 bg-slate-950">
        <AuditBoard
          scenario={selectedScenario}
          grcConfig={grcConfig}
          onScoreReceived={(score) => setLastScore(score)}
        />
      </div>

      {/* Right panel — Governance Config */}
      <div className="w-64 shrink-0 border-l border-slate-700 flex flex-col min-h-0 bg-slate-900">
        <div className="px-4 py-3 border-b border-slate-700 shrink-0">
          <h2 className="text-sm font-semibold text-slate-100">Review Settings</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Persona · Frameworks · Depth</p>
        </div>
        <GovernanceConfig
          config={grcConfig}
          onChange={onGRCConfigChange}
          score={lastScore}
        />
      </div>
    </div>
  );
}
