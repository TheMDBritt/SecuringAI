'use client';

import { useState, useRef, useCallback } from 'react';
import { DojoLayout } from './DojoLayout';
import { ScenarioPicker } from './ScenarioPicker';
import { ChatConsole, type ChatConsoleHandle } from './ChatConsole';
import { ControlPanel } from './ControlPanel';
import { ScoringPane } from './ScoringPane';
import { getScenariosByDojo } from '@/lib/scenarios';
import type { ControlConfig, DojoId, EvaluationResult, Scenario } from '@/types';
import { DEFAULT_CONTROL_CONFIG } from '@/types';

const TABS: { id: DojoId; label: string; sublabel: string; color: string }[] = [
  { id: 1, label: 'LLM Attack / Defense', sublabel: 'Dojo 1', color: 'red' },
  { id: 2, label: 'AI Secures Assets',    sublabel: 'Dojo 2', color: 'cyan' },
  { id: 3, label: 'Defense vs AI Attacks',sublabel: 'Dojo 3', color: 'emerald' },
];

const TAB_COLOR: Record<string, string> = {
  red:     'border-red-500 text-red-400',
  cyan:    'border-cyan-500 text-cyan-400',
  emerald: 'border-emerald-500 text-emerald-400',
};

const TAB_INACTIVE =
  'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600';

const MAX_EVAL_HISTORY = 10;

export function DojoTabs() {
  const [activeDojoId, setActiveDojoId]         = useState<DojoId>(1);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [controlConfig, setControlConfig]       = useState<ControlConfig>(DEFAULT_CONTROL_CONFIG);
  const [evaluations, setEvaluations]           = useState<EvaluationResult[]>([]);

  // ── M7 state ──────────────────────────────────────────────────────────────
  /** Content of the RAG Context Injection textarea. */
  const [ragContext, setRagContext]             = useState('');
  /** Content of the Tool Forge textarea. */
  const [toolForgeResponse, setToolForgeResponse] = useState('');
  /** When true, clicking a payload auto-sends it; when false, only inserts. */
  const [autoRunPayloads, setAutoRunPayloads]   = useState(true);
  /** Mirrors ChatConsole's loading state so ControlPanel can disable buttons. */
  const [chatLoading, setChatLoading]           = useState(false);

  /** Ref to ChatConsole's imperative handle. */
  const chatRef = useRef<ChatConsoleHandle>(null);

  const scenarios = getScenariosByDojo(activeDojoId);

  function handleTabChange(id: DojoId) {
    setActiveDojoId(id);
    setSelectedScenario(null);
    setEvaluations([]);
  }

  function handleScenarioSelect(scenario: Scenario) {
    setSelectedScenario(scenario);
    setEvaluations([]);
  }

  function handleEvaluation(result: EvaluationResult) {
    setEvaluations((prev) => [result, ...prev].slice(0, MAX_EVAL_HISTORY));
  }

  /**
   * Called by ControlPanel when a payload button is clicked.
   * Routes to sendPayload (auto-run ON) or insertText (auto-run OFF).
   */
  const handleSendPayload = useCallback(
    (text: string) => {
      if (!chatRef.current) return;
      if (autoRunPayloads) {
        chatRef.current.sendPayload(text);
      } else {
        chatRef.current.insertText(text);
      }
    },
    [autoRunPayloads],
  );

  const activeTab = TABS.find((t) => t.id === activeDojoId)!;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Tab bar */}
      <div className="flex border-b border-slate-700 bg-slate-900 shrink-0">
        {TABS.map((tab) => {
          const isActive = tab.id === activeDojoId;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={[
                'flex flex-col items-start px-5 py-3 border-b-2 transition-colors text-left',
                isActive ? TAB_COLOR[tab.color] : TAB_INACTIVE,
              ].join(' ')}
            >
              <span className="text-xs text-slate-500 font-mono">{tab.sublabel}</span>
              <span className="text-sm font-medium mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <DojoLayout
        scenarioPicker={
          <ScenarioPicker
            scenarios={scenarios}
            selected={selectedScenario}
            onSelect={handleScenarioSelect}
            dojoId={activeDojoId}
          />
        }
        chatConsole={
          <ChatConsole
            ref={chatRef}
            scenario={selectedScenario}
            dojoId={activeDojoId}
            controlConfig={controlConfig}
            onEvaluation={handleEvaluation}
            ragContext={ragContext}
            toolForgeResponse={toolForgeResponse}
            onLoadingChange={setChatLoading}
          />
        }
        controlPanel={
          <ControlPanel
            dojoId={activeDojoId}
            scenario={selectedScenario}
            config={controlConfig}
            onConfigChange={setControlConfig}
            ragContext={ragContext}
            onRagContextChange={setRagContext}
            toolForgeResponse={toolForgeResponse}
            onToolForgeChange={setToolForgeResponse}
            autoRunPayloads={autoRunPayloads}
            onAutoRunChange={setAutoRunPayloads}
            onSendPayload={handleSendPayload}
            chatLoading={chatLoading}
          />
        }
        scoringPane={
          <ScoringPane
            scenario={selectedScenario}
            dojoId={activeDojoId}
            dojoLabel={activeTab.label}
            evaluations={evaluations}
          />
        }
      />
    </div>
  );
}
