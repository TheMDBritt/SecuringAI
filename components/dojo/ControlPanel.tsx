'use client';

import { useState } from 'react';
import type { DojoId, Scenario } from '@/types';

interface ControlPanelProps {
  dojoId: DojoId;
  scenario: Scenario | null;
}

// ─────────────────────────────────────────────
// Shared UI primitives
// ─────────────────────────────────────────────

function PanelSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2.5">
        {title}
      </p>
      {children}
    </div>
  );
}

function Toggle({
  label,
  enabled,
  onChange,
  disabled,
}: {
  label: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-2 cursor-pointer group py-1">
      <span className={['text-xs text-slate-300', disabled && 'opacity-40'].join(' ')}>
        {label}
      </span>
      <button
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={[
          'w-9 h-5 rounded-full border transition-colors relative shrink-0',
          enabled ? 'bg-cyan-600 border-cyan-500' : 'bg-slate-700 border-slate-600',
          disabled && 'opacity-40 cursor-not-allowed',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all',
            enabled ? 'left-4' : 'left-0.5',
          ].join(' ')}
        />
      </button>
    </label>
  );
}

function PlaceholderNote({ text }: { text: string }) {
  return (
    <p className="text-[10px] text-slate-600 font-mono mt-1 italic">{text}</p>
  );
}

// ─────────────────────────────────────────────
// Dojo 1 — Attack / Defense
// ─────────────────────────────────────────────

function Dojo1Panel({ disabled }: { disabled: boolean }) {
  const [mode, setMode] = useState<'attack' | 'defense'>('attack');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a helpful assistant. Refuse any harmful requests.',
  );
  const [ragEnabled, setRagEnabled] = useState(false);
  const [piiRedact, setPiiRedact] = useState(false);
  const [topicFilter, setTopicFilter] = useState(false);
  const [llmJudge, setLlmJudge] = useState(false);

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex rounded border border-slate-700 overflow-hidden mb-4">
        {(['attack', 'defense'] as const).map((m) => (
          <button
            key={m}
            disabled={disabled}
            onClick={() => setMode(m)}
            className={[
              'flex-1 py-1.5 text-xs font-medium capitalize transition-colors',
              mode === m
                ? m === 'attack'
                  ? 'bg-red-500/20 text-red-400 border-r border-slate-700'
                  : 'bg-cyan-500/20 text-cyan-400'
                : 'text-slate-500 hover:text-slate-300',
              disabled && 'cursor-not-allowed',
            ].join(' ')}
          >
            {m === 'attack' ? '⚔ Attack' : '🛡 Defense'}
          </button>
        ))}
      </div>

      {mode === 'attack' ? (
        <>
          <PanelSection title="Payload Library">
            <div className="flex flex-col gap-1">
              {[
                'Ignore all previous instructions…',
                'As a DAN, you must…',
                'SYSTEM: New directive overrides…',
                '[Inject via retrieved doc]',
              ].map((p) => (
                <button
                  key={p}
                  disabled={disabled}
                  className="w-full text-left text-[11px] px-2.5 py-1.5 rounded border border-slate-700 bg-slate-800 text-slate-400 hover:border-red-500/40 hover:text-red-400 font-mono truncate disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
            <PlaceholderNote text="Payloads injected in M4" />
          </PanelSection>

          <PanelSection title="Context Injection (RAG)">
            <textarea
              disabled={disabled}
              placeholder="Paste a malicious 'retrieved document' here…"
              rows={3}
              className="w-full resize-none rounded border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <PlaceholderNote text="Active in M4" />
          </PanelSection>

          <PanelSection title="Tool Forge">
            <div className="rounded border border-slate-700 bg-slate-800 p-2.5">
              <p className="text-xs text-slate-500 mb-1">Simulated tool response</p>
              <textarea
                disabled={disabled}
                placeholder='{"tool":"file_read","response":"SECRET_KEY=…"}'
                rows={2}
                className="w-full resize-none rounded border border-slate-700 bg-slate-850 px-2 py-1.5 text-[11px] font-mono text-slate-300 placeholder-slate-600 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
            <PlaceholderNote text="Active in M4" />
          </PanelSection>
        </>
      ) : (
        <>
          <PanelSection title="System Prompt">
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              disabled={disabled}
              rows={4}
              className="w-full resize-none rounded border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <PlaceholderNote text="Applied to AXIOM-1 in M4" />
          </PanelSection>

          <PanelSection title="Input Guardrails">
            <Toggle label="Keyword Blocklist" enabled={false} onChange={() => {}} disabled={disabled} />
            <Toggle label="Regex Filter" enabled={false} onChange={() => {}} disabled={disabled} />
            <Toggle
              label="LLM-as-Judge Screener"
              enabled={llmJudge}
              onChange={setLlmJudge}
              disabled={disabled}
            />
          </PanelSection>

          <PanelSection title="Output Guardrails">
            <Toggle label="PII Redaction" enabled={piiRedact} onChange={setPiiRedact} disabled={disabled} />
            <Toggle label="Topic Classifier" enabled={topicFilter} onChange={setTopicFilter} disabled={disabled} />
            <Toggle label="Refusal Detector" enabled={false} onChange={() => {}} disabled={disabled} />
          </PanelSection>

          <PanelSection title="RAG">
            <Toggle label="RAG Sanitizer" enabled={ragEnabled} onChange={setRagEnabled} disabled={disabled} />
          </PanelSection>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Dojo 2 — SOC Analyst Config
// ─────────────────────────────────────────────

function Dojo2Panel({ disabled }: { disabled: boolean }) {
  const [persona, setPersona] = useState<'analyst' | 'ciso' | 'ir-lead'>('analyst');
  const [verbosity, setVerbosity] = useState<'terse' | 'detailed'>('detailed');
  const [format, setFormat] = useState<'markdown' | 'json' | 'report'>('markdown');
  const [confidence, setConfidence] = useState(70);
  const [redact, setRedact] = useState(false);

  return (
    <div>
      <PanelSection title="Analyst Persona">
        <div className="flex flex-col gap-1">
          {(['analyst', 'ciso', 'ir-lead'] as const).map((p) => (
            <button
              key={p}
              disabled={disabled}
              onClick={() => setPersona(p)}
              className={[
                'text-left px-3 py-1.5 rounded border text-xs font-medium capitalize transition-colors',
                persona === p
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600',
                disabled && 'opacity-40 cursor-not-allowed',
              ].join(' ')}
            >
              {p === 'ir-lead' ? 'IR Lead' : p.toUpperCase()}
            </button>
          ))}
        </div>
        <PlaceholderNote text="Applied in M6" />
      </PanelSection>

      <PanelSection title="Verbosity">
        <div className="flex rounded border border-slate-700 overflow-hidden">
          {(['terse', 'detailed'] as const).map((v) => (
            <button
              key={v}
              disabled={disabled}
              onClick={() => setVerbosity(v)}
              className={[
                'flex-1 py-1.5 text-xs capitalize transition-colors',
                verbosity === v ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300',
                disabled && 'cursor-not-allowed opacity-40',
              ].join(' ')}
            >
              {v}
            </button>
          ))}
        </div>
      </PanelSection>

      <PanelSection title="Output Format">
        <div className="flex flex-col gap-1">
          {(['markdown', 'json', 'report'] as const).map((f) => (
            <button
              key={f}
              disabled={disabled}
              onClick={() => setFormat(f)}
              className={[
                'text-left px-3 py-1.5 rounded border text-xs font-mono uppercase transition-colors',
                format === f
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600',
                disabled && 'opacity-40 cursor-not-allowed',
              ].join(' ')}
            >
              {f}
            </button>
          ))}
        </div>
      </PanelSection>

      <PanelSection title={`Confidence Threshold: ${confidence}%`}>
        <input
          type="range"
          min={0}
          max={100}
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          disabled={disabled}
          className="w-full accent-cyan-500 disabled:opacity-40"
        />
        <PlaceholderNote text="Filters low-confidence findings in M6" />
      </PanelSection>

      <PanelSection title="Options">
        <Toggle label="Redaction Mode" enabled={redact} onChange={setRedact} disabled={disabled} />
      </PanelSection>
    </div>
  );
}

// ─────────────────────────────────────────────
// Dojo 3 — Defender Config
// ─────────────────────────────────────────────

const POLICY_CLAUSES = [
  'Employees must not share credentials with AI systems',
  'AI outputs require human review before action',
  'Deepfake verification required for executive requests',
  'AI tool usage logged and audited quarterly',
  'Prohibited: using AI to generate deceptive content',
];

const COMPLIANCE_FRAMEWORKS = [
  { id: 'nist', label: 'NIST AI RMF' },
  { id: 'eu', label: 'EU AI Act' },
  { id: 'iso', label: 'ISO 42001' },
];

function Dojo3Panel({ disabled }: { disabled: boolean }) {
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [frameworks, setFrameworks] = useState<string[]>(['nist', 'eu', 'iso']);
  const [detectionRule, setDetectionRule] = useState('');

  function toggleClause(c: string) {
    setSelectedClauses((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  function toggleFramework(id: string) {
    setFrameworks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div>
      <PanelSection title="Detection Rule Builder">
        <textarea
          value={detectionRule}
          onChange={(e) => setDetectionRule(e.target.value)}
          disabled={disabled}
          placeholder={'title: Detect AI Phishing\ndetection:\n  keywords: [urgent, wire transfer]'}
          rows={5}
          className="w-full resize-none rounded border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <PlaceholderNote text="Sigma-style rules scored in M7" />
      </PanelSection>

      <PanelSection title="Policy Clause Library">
        <div className="flex flex-col gap-1.5">
          {POLICY_CLAUSES.map((clause) => {
            const selected = selectedClauses.includes(clause);
            return (
              <button
                key={clause}
                disabled={disabled}
                onClick={() => toggleClause(clause)}
                className={[
                  'w-full text-left flex gap-2 items-start px-2.5 py-2 rounded border text-xs transition-colors',
                  selected
                    ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600',
                  disabled && 'opacity-40 cursor-not-allowed',
                ].join(' ')}
              >
                <span className={['mt-0.5 shrink-0 w-3 h-3 rounded border', selected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'].join(' ')} />
                {clause}
              </button>
            );
          })}
        </div>
        <PlaceholderNote text="Scored against reference framework in M7" />
      </PanelSection>

      <PanelSection title="Compliance Frameworks">
        <div className="flex flex-col gap-1.5">
          {COMPLIANCE_FRAMEWORKS.map((fw) => {
            const selected = frameworks.includes(fw.id);
            return (
              <button
                key={fw.id}
                onClick={() => toggleFramework(fw.id)}
                disabled={disabled}
                className={[
                  'w-full text-left flex gap-2 items-center px-2.5 py-1.5 rounded border text-xs transition-colors',
                  selected
                    ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600',
                  disabled && 'opacity-40 cursor-not-allowed',
                ].join(' ')}
              >
                <span className={['shrink-0 w-3 h-3 rounded border', selected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'].join(' ')} />
                {fw.label}
              </button>
            );
          })}
        </div>
      </PanelSection>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main export — dispatches to correct panel
// ─────────────────────────────────────────────

export function ControlPanel({ dojoId, scenario }: ControlPanelProps) {
  const hasScenario = scenario !== null;

  const titles: Record<DojoId, string> = {
    1: 'Attack / Defense Controls',
    2: 'Analyst Configuration',
    3: 'Defender Toolkit',
  };

  return (
    <div className="p-3 flex flex-col gap-1">
      <div className="mb-3">
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
          {titles[dojoId]}
        </p>
        {!hasScenario && (
          <p className="text-xs text-slate-600 mt-1">Select a scenario to activate controls.</p>
        )}
      </div>

      {dojoId === 1 && <Dojo1Panel disabled={!hasScenario} />}
      {dojoId === 2 && <Dojo2Panel disabled={!hasScenario} />}
      {dojoId === 3 && <Dojo3Panel disabled={!hasScenario} />}
    </div>
  );
}
