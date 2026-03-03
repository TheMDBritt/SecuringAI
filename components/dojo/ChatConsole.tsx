'use client';

import { useState } from 'react';
import type { DojoId, Scenario } from '@/types';

interface ChatConsoleProps {
  scenario: Scenario | null;
  dojoId: DojoId;
}

const PLACEHOLDER_INPUT: Record<DojoId, string> = {
  1: 'Type your attack payload or defense test message…',
  2: 'Paste logs, alerts, or describe the security event…',
  3: 'Describe the artifact to analyze or policy to draft…',
};

const AXIOM_INTRO: Record<DojoId, string> = {
  1: 'I am AXIOM-1, your sandboxed target LLM. Select a scenario from the left panel, then use the Attack/Defense controls on the right to begin. All interactions are simulated safely.',
  2: 'I am AXIOM-1, your AI-powered SOC analyst. Select a scenario and paste your data—logs, alerts, or incident timelines—and I will triage, enrich, and report.',
  3: 'I am AXIOM-1, your AI security advisor. Select a scenario, submit your artifact or policy draft, and I will help you build and score your defenses.',
};

export function ChatConsole({ scenario, dojoId }: ChatConsoleProps) {
  const [input, setInput] = useState('');

  const hasScenario = scenario !== null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Console header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-mono text-slate-300">AXIOM-1</span>
          <span className="text-xs text-slate-600">/ sandbox</span>
        </div>
        {scenario && (
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono">
            {scenario.id}
          </span>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {/* AXIOM intro message */}
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded shrink-0 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30 mt-0.5">
            <span className="text-[10px] font-bold text-cyan-400">AX</span>
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500 mb-1 font-mono">AXIOM-1</p>
            <div className="bg-slate-800 rounded px-3 py-2.5 text-sm text-slate-200 leading-relaxed max-w-prose">
              {AXIOM_INTRO[dojoId]}
            </div>
          </div>
        </div>

        {/* Scenario selected notice */}
        {hasScenario && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded shrink-0 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30 mt-0.5">
              <span className="text-[10px] font-bold text-cyan-400">AX</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 mb-1 font-mono">AXIOM-1</p>
              <div className="bg-slate-800 rounded px-3 py-2.5 text-sm text-slate-200 leading-relaxed max-w-prose">
                Scenario loaded:{' '}
                <span className="text-cyan-400 font-semibold">{scenario.title}</span>
                . Configure your controls on the right, then send your first message.
                <span className="cursor-blink ml-0.5 text-cyan-400">▋</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty state when no scenario */}
        {!hasScenario && (
          <div className="flex-1 flex items-center justify-center mt-12">
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
      </div>

      {/* Input area */}
      <div className="border-t border-slate-700 p-3 shrink-0">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!hasScenario}
            placeholder={hasScenario ? PLACEHOLDER_INPUT[dojoId] : 'Select a scenario first…'}
            rows={2}
            className={[
              'flex-1 resize-none rounded border px-3 py-2 text-sm font-mono',
              'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-600',
              'focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500',
              !hasScenario && 'opacity-40 cursor-not-allowed',
            ].join(' ')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                // Model calls wired in M4
              }
            }}
          />
          <button
            disabled={!hasScenario || !input.trim()}
            className={[
              'px-4 py-2 rounded text-sm font-medium transition-colors self-end',
              hasScenario && input.trim()
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed',
            ].join(' ')}
          >
            Send
          </button>
        </div>
        <p className="text-[10px] text-slate-600 mt-1.5 font-mono">
          Shift+Enter for newline · Model calls enabled in M4
        </p>
      </div>
    </div>
  );
}
