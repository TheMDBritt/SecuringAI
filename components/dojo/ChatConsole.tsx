'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import type { ControlConfig, DojoId, EvaluationResult, Scenario } from '@/types';

// ─── Imperative handle — exposed to DojoTabs via ref ─────────────────────────

export interface ChatConsoleHandle {
  /** Insert payload text into input AND immediately send it (auto-run ON). */
  sendPayload: (text: string) => void;
  /** Insert text into the input field only (auto-run OFF). */
  insertText: (text: string) => void;
}

// ─── Local types ──────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'evaluator';
  content: string;
  timestamp: Date;
}

interface ChatConsoleProps {
  scenario: Scenario | null;
  dojoId: DojoId;
  controlConfig: ControlConfig;
  onEvaluation: (result: EvaluationResult) => void;
  /** Live RAG context — injected into /api/chat when ragEnabled is ON. */
  ragContext: string;
  /** Simulated tool response — appended to model context. */
  toolForgeResponse: string;
  /** Fires whenever the internal loading state changes (for ControlPanel). */
  onLoadingChange: (loading: boolean) => void;
  /**
   * Dojo 1 scenario mode switch (true = vulnerable, false = defended).
   * Forwarded to /api/chat on every request so the server can select the
   * correct scripted response without calling the model.
   */
  scenarioVulnerable?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_ATTACK_HISTORY = 10;

const PLACEHOLDER_INPUT: Record<DojoId, string> = {
  1: 'Type your attack payload or defense test message… (Shift+Enter for newline)',
  2: 'Paste logs, alerts, or describe the security event…',
  3: 'Describe the artifact to analyze or policy to draft…',
};

const BUBBLE_STYLE: Record<ChatMessage['role'], string> = {
  user: 'bg-cyan-600/20 border border-cyan-600/40 text-slate-100 max-w-[75%]',
  assistant: 'bg-slate-800 border border-slate-700 text-slate-200 max-w-[80%]',
  system:
    'bg-slate-800/40 border border-slate-700/40 text-slate-500 text-xs italic px-4 py-1.5',
  evaluator:
    'bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-3 py-2 w-full',
};

const ROLE_LABEL: Record<ChatMessage['role'], string> = {
  user: 'You',
  assistant: 'BlackBeltAI',
  system: '',
  evaluator: 'Evaluator',
};

function nanoid() {
  return Math.random().toString(36).slice(2, 10);
}

function makeSystemMsg(content: string): ChatMessage {
  return { id: nanoid(), role: 'system', content, timestamp: new Date() };
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ChatConsole = forwardRef<ChatConsoleHandle, ChatConsoleProps>(
  function ChatConsole(
    {
      scenario,
      dojoId,
      controlConfig,
      onEvaluation,
      ragContext,
      toolForgeResponse,
      onLoadingChange,
      scenarioVulnerable = true,
    },
    ref,
  ) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    /** Last N user messages — used for replay. */
    const [attackHistory, setAttackHistory] = useState<string[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const hasScenario = scenario !== null;

    // Propagate loading state to parent (ControlPanel payload buttons).
    useEffect(() => {
      onLoadingChange(loading);
    }, [loading, onLoadingChange]);

    // Auto-scroll on new messages.
    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Reset chat + history when scenario changes.
    useEffect(() => {
      setMessages([]);
      setInput('');
      setError(null);
      setAttackHistory([]);
      if (scenario) {
        setMessages([
          makeSystemMsg(
            `Scenario loaded: "${scenario.title}" · Dojo ${dojoId} · ${scenario.difficulty}`,
          ),
        ]);
      }
    }, [scenario?.id, dojoId]);

    // ── Core send function ─────────────────────────────────────────────────

    const sendMessageCore = useCallback(
      async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || !scenario || loading) return;

        setInput('');
        setError(null);
        setLoading(true);

        const userMsg: ChatMessage = {
          id: nanoid(),
          role: 'user',
          content: trimmed,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);

        // Track attack history (newest first).
        setAttackHistory((prev) => [trimmed, ...prev].slice(0, MAX_ATTACK_HISTORY));

        try {
          // Build transcript (history + current user turn).
          const apiMessages = [
            ...messages
              .filter((m) => m.role === 'user' || m.role === 'assistant')
              .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
            { role: 'user' as const, content: trimmed },
          ];

          // ── 1. Chat request ────────────────────────────────────────────────
          const chatRes = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dojoId,
              scenarioId: scenario.id,
              messages: apiMessages,
              controlConfig,
              // M7: pass injected contexts (server ignores if empty/undefined)
              ragContext: ragContext || undefined,
              toolForgeResponse: toolForgeResponse || undefined,
              // Dojo 1 scenario mode switch
              scenarioVulnerable,
            }),
          });

          const chatData = await chatRes.json();
          if (!chatRes.ok) throw new Error(chatData.error ?? `HTTP ${chatRes.status}`);

          const assistantContent: string = chatData.content;

          setMessages((prev) => [
            ...prev,
            {
              id: nanoid(),
              role: 'assistant',
              content: assistantContent,
              timestamp: new Date(),
            },
          ]);

          // ── 2. Evaluate ────────────────────────────────────────────────────
          const evalRes = await fetch('/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dojoId,
              scenarioId: scenario.id,
              settings: controlConfig,
              messages: [
                ...apiMessages,
                { role: 'assistant' as const, content: assistantContent },
              ],
            }),
          });

          if (evalRes.ok) {
            const evalData: EvaluationResult = await evalRes.json();
            onEvaluation(evalData);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          setError(msg);
          setMessages((prev) => [
            ...prev,
            {
              id: nanoid(),
              role: 'evaluator',
              content: `⚠ API error: ${msg}`,
              timestamp: new Date(),
            },
          ]);
        } finally {
          setLoading(false);
          textareaRef.current?.focus();
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [messages, scenario, dojoId, controlConfig, ragContext, toolForgeResponse, loading, onEvaluation, scenarioVulnerable],
    );

    // Keep a ref so useImperativeHandle never goes stale.
    const sendMessageCoreRef = useRef(sendMessageCore);
    useEffect(() => {
      sendMessageCoreRef.current = sendMessageCore;
    });

    // ── Imperative handle (used by DojoTabs → ControlPanel) ───────────────

    useImperativeHandle(
      ref,
      () => ({
        sendPayload: (text: string) => {
          setInput(text); // briefly shows payload in textarea
          sendMessageCoreRef.current(text);
        },
        insertText: (text: string) => {
          setInput(text);
          textareaRef.current?.focus();
        },
      }),
      [],
    );

    // ── Local UI handlers ──────────────────────────────────────────────────

    const handleSend = useCallback(() => {
      const text = input.trim();
      if (text) sendMessageCoreRef.current(text);
    }, [input]);

    const replayLastAttack = useCallback(() => {
      const last = attackHistory[0];
      if (last) sendMessageCoreRef.current(last);
    }, [attackHistory]);

    const clearChat = useCallback(() => {
      setMessages(
        scenario ? [makeSystemMsg(`Chat cleared · Scenario: "${scenario.title}"`)] : [],
      );
      setInput('');
      setError(null);
    }, [scenario]);

    // ── Render ────────────────────────────────────────────────────────────

    return (
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-sm font-mono text-slate-300 shrink-0">BlackBeltAI</span>
            <span className="text-xs text-slate-600 shrink-0">/ sandbox</span>
            {scenario && (
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono truncate">
                {scenario.id}
              </span>
            )}
            {/* RAG active badge */}
            {controlConfig.ragEnabled && ragContext.trim() && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-400 font-mono shrink-0">
                RAG
              </span>
            )}
            {/* Tool Forge active badge */}
            {toolForgeResponse.trim() && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/15 border border-orange-500/30 text-orange-400 font-mono shrink-0">
                TOOL
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Replay last attack */}
            {attackHistory.length > 0 && (
              <button
                onClick={replayLastAttack}
                disabled={loading}
                title={`Replay: "${attackHistory[0].slice(0, 60)}${attackHistory[0].length > 60 ? '…' : ''}"`}
                className="text-xs px-2 py-1 rounded border border-amber-700/40 bg-amber-500/10 text-amber-400 hover:border-amber-600/60 hover:text-amber-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ↩ Replay
              </button>
            )}

            {messages.length > 0 && (
              <button
                onClick={clearChat}
                disabled={loading}
                className="text-xs px-2 py-1 rounded border border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors disabled:opacity-40"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {!hasScenario && messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center mt-16">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-5 h-5 text-slate-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">Select a scenario to begin</p>
              </div>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.role === 'system' || msg.role === 'evaluator') {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className={`rounded text-center ${BUBBLE_STYLE[msg.role]}`}>
                    {msg.content}
                  </div>
                </div>
              );
            }

            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded shrink-0 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30 mt-0.5">
                    <span className="text-[10px] font-bold text-cyan-400">BB</span>
                  </div>
                )}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <p className="text-[10px] text-slate-500 mb-1 font-mono px-1">
                    {ROLE_LABEL[msg.role]}
                  </p>
                  <div
                    className={`rounded px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${BUBBLE_STYLE[msg.role]}`}
                  >
                    {msg.content}
                  </div>
                  <p className="text-[10px] text-slate-600 mt-0.5 px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded shrink-0 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30 mt-0.5">
                <span className="text-[10px] font-bold text-cyan-400">BB</span>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded px-4 py-3 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-700 p-3 shrink-0">
          {error && <p className="text-xs text-red-400 mb-2 font-mono">{error}</p>}
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!hasScenario || loading}
              placeholder={
                hasScenario ? PLACEHOLDER_INPUT[dojoId] : 'Select a scenario first…'
              }
              rows={2}
              className={[
                'flex-1 resize-none rounded border px-3 py-2 text-sm font-mono',
                'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-600',
                'focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500',
                (!hasScenario || loading) && 'opacity-40 cursor-not-allowed',
              ].join(' ')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              onClick={handleSend}
              disabled={!hasScenario || !input.trim() || loading}
              className={[
                'px-4 py-2 rounded text-sm font-medium transition-colors self-end',
                hasScenario && input.trim() && !loading
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed',
              ].join(' ')}
            >
              {loading ? '…' : 'Send'}
            </button>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[10px] text-slate-600 font-mono">
              Enter to send · Shift+Enter for newline
            </p>
            {attackHistory.length > 0 && (
              <p className="text-[10px] text-slate-600 font-mono">
                {attackHistory.length} attack{attackHistory.length > 1 ? 's' : ''} in history
              </p>
            )}
          </div>
        </div>
      </div>
    );
  },
);
