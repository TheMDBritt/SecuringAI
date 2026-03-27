'use client';

import { useState, useRef, useCallback } from 'react';
import { DojoLayout } from './DojoLayout';
import { ScenarioPicker } from './ScenarioPicker';
import { ChatConsole, type ChatConsoleHandle } from './ChatConsole';
import { ControlPanel } from './ControlPanel';
import { ScoringPane } from './ScoringPane';
import { getScenariosByDojo } from '@/lib/scenarios';
import type { Dojo2IncidentScenario } from '@/lib/dojo2-scenarios';
import type {
  AttackType,
  ControlConfig,
  Dojo2Config,
  Dojo3Config,
  DojoId,
  EvaluationResult,
  Scenario,
} from '@/types';
import { DEFAULT_CONTROL_CONFIG, DEFAULT_DOJO2_CONFIG } from '@/types';

const TABS: { id: DojoId; label: string; sublabel: string; color: string }[] = [
  { id: 1, label: 'LLM Attack / Defense', sublabel: 'Dojo 1', color: 'red' },
  { id: 2, label: 'SOC Analyst Workflows', sublabel: 'Dojo 2', color: 'cyan' },
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
  /** Ordered list of attack types that succeeded in this session (oldest first). */
  const [successfulAttacks, setSuccessfulAttacks] = useState<AttackType[]>([]);
  /**
   * Cumulative session score (0–100). Starts at 100 and decreases with each
   * successful attack. Benign turns do NOT reset this value. Reset to 100 on
   * scenario change, tab change, or Clear.
   */
  const [sessionScore, setSessionScore]           = useState(100);

  // ── Dojo 2 config ──────────────────────────────────────────────────────────
  const [dojo2Config, setDojo2Config] = useState<Dojo2Config>(DEFAULT_DOJO2_CONFIG);
  /** The currently active Dojo 2 incident — set by loading/generating from the right panel,
   *  or cleared when the user clicks a new left-panel scenario card. */
  const [activeDojo2Scenario, setActiveDojo2Scenario] = useState<Dojo2IncidentScenario | null>(null);

  // ── Dojo 3 config ──────────────────────────────────────────────────────────
  const [dojo3Config, setDojo3Config] = useState<Dojo3Config>({
    detectionRule:   '',
    selectedClauses: [],
  });

  // ── M7 state ──────────────────────────────────────────────────────────────
  /** Content of the RAG Context Injection textarea. */
  const [ragContext, setRagContext]             = useState('');
  /** Content of the Tool Forge textarea. */
  const [toolForgeResponse, setToolForgeResponse] = useState('');
  /** When true, clicking a payload auto-sends it; when false, only inserts. */
  const [autoRunPayloads, setAutoRunPayloads]   = useState(true);
  /** Mirrors ChatConsole's loading state so ControlPanel can disable buttons. */
  const [chatLoading, setChatLoading]           = useState(false);
  /**
   * Policy Bypass: true once a jailbreak payload succeeds in vulnerable mode.
   * While active, all subsequent messages in the policy-bypass scenario receive
   * a jailbreak-continuation response. Cleared on every scenario change.
   */
  const [jailbreakActive, setJailbreakActive] = useState(false);

  /** Ref to ChatConsole's imperative handle. */
  const chatRef = useRef<ChatConsoleHandle>(null);

  const scenarios = getScenariosByDojo(activeDojoId);

  function handleTabChange(id: DojoId) {
    setActiveDojoId(id);
    setSelectedScenario(null);
    setEvaluations([]);
    setSuccessfulAttacks([]);
    setSessionScore(100);
    // Reset dojo-specific configs on tab change
    setDojo2Config(DEFAULT_DOJO2_CONFIG);
    setDojo3Config({ detectionRule: '', selectedClauses: [] });
    setActiveDojo2Scenario(null);
  }

  function handleScenarioSelect(scenario: Scenario) {
    setSelectedScenario(scenario);
    setEvaluations([]);
    setSuccessfulAttacks([]);
    setSessionScore(100);
    // Full session reset on scenario switch
    setJailbreakActive(false);
    setRagContext('');
    setToolForgeResponse('');
    setDojo3Config({ detectionRule: '', selectedClauses: [] });
    // Clicking a new left-panel card clears any previously loaded incident
    setActiveDojo2Scenario(null);
  }

  /**
   * Called when user loads or generates a Dojo 2 incident from the right panel.
   * Sets the active incident and auto-selects the matching left-panel scenario card.
   */
  const handleSetActiveDojo2Scenario = useCallback((incident: Dojo2IncidentScenario) => {
    setActiveDojo2Scenario(incident);
    // Auto-select the matching left-panel workflow card without resetting the session.
    // ChatConsole's useEffect (keyed on scenario?.id + activeDojo2Scenario?.id) will
    // fire automatically and refresh the chat seed with the incident details.
    const matchingScenario = getScenariosByDojo(2).find((s) => s.id === incident.taskType);
    if (matchingScenario) {
      setSelectedScenario(matchingScenario);
    }
  }, []);

  function handleEvaluation(result: EvaluationResult) {
    setEvaluations((prev) => [result, ...prev].slice(0, MAX_EVAL_HISTORY));
    // Activate jailbreak persistence when a policy-bypass attack succeeds
    // (attackSucceeded is true only when guardrails are off → vulnerable outcome)
    if (result.attackType === 'policy_bypass' && result.attackSucceeded) {
      setJailbreakActive(true);
    }
    if (result.attackSucceeded && result.attackType !== 'benign' && result.attackType !== 'probing') {
      // Track successful attacks for chain scoring
      setSuccessfulAttacks((prev) => [...prev, result.attackType]);
      // Decrement session score by this turn's total deduction (base + chain penalty).
      // Benign / blocked turns leave session score unchanged.
      const turnDeduction = 100 - result.score;
      setSessionScore((prev) => Math.max(0, prev - turnDeduction));
    }
  }

  /** Resets the full session: chat, evaluations, attack chain, session score. */
  const handleSessionClear = useCallback(() => {
    setEvaluations([]);
    setSuccessfulAttacks([]);
    setSessionScore(100);
    setJailbreakActive(false);
  }, []);

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

  /**
   * Always inserts text into the chat input without sending — used by Dojo 2
   * Incident Library so users can review scenario data before submitting.
   */
  const handleInsertText = useCallback((text: string) => {
    chatRef.current?.insertText(text);
  }, []);

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
            activeDojo2Scenario={activeDojo2Scenario}
            dojo2Config={dojo2Config}
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
            jailbreakActive={jailbreakActive}
            sessionAttackHistory={successfulAttacks}
            onSessionClear={handleSessionClear}
            dojo2Config={dojo2Config}
            dojo3Config={dojo3Config}
            activeDojo2Scenario={activeDojo2Scenario}
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
            onInsertText={handleInsertText}
            chatLoading={chatLoading}
            dojo2Config={dojo2Config}
            onDojo2ConfigChange={setDojo2Config}
            onSetActiveDojo2Scenario={handleSetActiveDojo2Scenario}
            dojo3Config={dojo3Config}
            onDojo3ConfigChange={setDojo3Config}
          />
        }
        scoringPane={
          <ScoringPane
            scenario={selectedScenario}
            dojoId={activeDojoId}
            dojoLabel={activeTab.label}
            evaluations={evaluations}
            sessionScore={sessionScore}
          />
        }
      />
    </div>
  );
}
