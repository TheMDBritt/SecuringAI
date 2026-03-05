'use client';

import type { ControlConfig, DojoId, Scenario } from '@/types';

interface ControlPanelProps {
  dojoId: DojoId;
  scenario: Scenario | null;
  config: ControlConfig;
  onConfigChange: (c: ControlConfig) => void;
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
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
    <label className="flex items-center justify-between gap-2 cursor-pointer py-1">
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

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex rounded border border-slate-700 overflow-hidden">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={[
            'flex-1 py-1 text-[11px] font-medium transition-colors',
            i > 0 && 'border-l border-slate-700',
            value === opt.value
              ? 'bg-cyan-500/20 text-cyan-400'
              : 'text-slate-500 hover:text-slate-300',
            disabled && 'cursor-not-allowed opacity-40',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function PlaceholderNote({ text }: { text: string }) {
  return <p className="text-[10px] text-slate-600 font-mono mt-1 italic">{text}</p>;
}

// ─── Guardrail Controls (universal, M5) ──────────────────────────────────────

const SHIELD_OPTIONS: { value: ControlConfig['injectionShield']; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'basic', label: 'Basic' },
  { value: 'strict', label: 'Strict' },
];

const LOG_OPTIONS: { value: ControlConfig['loggingLevel']; label: string }[] = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'verbose', label: 'Verbose' },
];

function GuardrailControls({
  config,
  onChange,
  disabled,
}: {
  config: ControlConfig;
  onChange: (c: ControlConfig) => void;
  disabled: boolean;
}) {
  function set<K extends keyof ControlConfig>(key: K, value: ControlConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  return (
    <div className="mb-4 pb-4 border-b border-slate-700/60">
      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3">
        Guardrail Controls
      </p>

      <Toggle
        label="Strict Policy"
        enabled={config.strictPolicy}
        onChange={(v) => set('strictPolicy', v)}
        disabled={disabled}
      />
      <Toggle
        label="Allow Tools"
        enabled={config.allowTools}
        onChange={(v) => set('allowTools', v)}
        disabled={disabled}
      />
      <Toggle
        label="RAG Enabled"
        enabled={config.ragEnabled}
        onChange={(v) => set('ragEnabled', v)}
        disabled={disabled}
      />

      <div className="mt-2 mb-1">
        <p className={['text-xs mb-1.5', disabled ? 'text-slate-600' : 'text-slate-400'].join(' ')}>
          Injection Shield
        </p>
        <SegmentedControl
          options={SHIELD_OPTIONS}
          value={config.injectionShield}
          onChange={(v) => set('injectionShield', v)}
          disabled={disabled}
        />
      </div>

      <div className="mt-2">
        <p className={['text-xs mb-1.5', disabled ? 'text-slate-600' : 'text-slate-400'].join(' ')}>
          Logging Level
        </p>
        <SegmentedControl
          options={LOG_OPTIONS}
          value={config.loggingLevel}
          onChange={(v) => set('loggingLevel', v)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

// ─── Dojo 1 — Attack / Defense ────────────────────────────────────────────────

function Dojo1Panel({ disabled }: { disabled: boolean }) {
  return (
    <div>
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
        <PlaceholderNote text="Click to inject payload (M6)" />
      </PanelSection>

      <PanelSection title="Context Injection (RAG)">
        <textarea
          disabled={disabled}
          placeholder="Paste a malicious 'retrieved document' here…"
          rows={3}
          className="w-full resize-none rounded border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <PlaceholderNote text="Injected into RAG context (M6)" />
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
        <PlaceholderNote text="Active in M6" />
      </PanelSection>
    </div>
  );
}

// ─── Dojo 2 — SOC Analyst Config ──────────────────────────────────────────────

function Dojo2Panel({ disabled }: { disabled: boolean }) {
  return (
    <div>
      <PanelSection title="Analyst Persona">
        <div className="flex flex-col gap-1">
          {(['analyst', 'ciso', 'ir-lead'] as const).map((p) => (
            <button
              key={p}
              disabled={disabled}
              className="text-left px-3 py-1.5 rounded border border-slate-700 text-xs font-medium capitalize text-slate-400 hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {p === 'ir-lead' ? 'IR Lead' : p.toUpperCase()}
            </button>
          ))}
        </div>
        <PlaceholderNote text="Applied in M6" />
      </PanelSection>

      <PanelSection title="Output Format">
        <div className="flex flex-col gap-1">
          {(['markdown', 'json', 'report'] as const).map((f) => (
            <button
              key={f}
              disabled={disabled}
              className="text-left px-3 py-1.5 rounded border border-slate-700 text-xs font-mono uppercase text-slate-400 hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {f}
            </button>
          ))}
        </div>
        <PlaceholderNote text="Applied in M6" />
      </PanelSection>
    </div>
  );
}

// ─── Dojo 3 — Defender Toolkit ────────────────────────────────────────────────

const POLICY_CLAUSES = [
  'Employees must not share credentials with AI systems',
  'AI outputs require human review before action',
  'Deepfake verification required for executive requests',
  'AI tool usage logged and audited quarterly',
  'Prohibited: using AI to generate deceptive content',
];

function Dojo3Panel({ disabled }: { disabled: boolean }) {
  return (
    <div>
      <PanelSection title="Detection Rule Builder">
        <textarea
          disabled={disabled}
          placeholder={'title: Detect AI Phishing\ndetection:\n  keywords: [urgent, wire transfer]'}
          rows={5}
          className="w-full resize-none rounded border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <PlaceholderNote text="Sigma-style rules scored in M7" />
      </PanelSection>

      <PanelSection title="Policy Clause Library">
        <div className="flex flex-col gap-1.5">
          {POLICY_CLAUSES.map((clause) => (
            <button
              key={clause}
              disabled={disabled}
              className="w-full text-left flex gap-2 items-start px-2.5 py-2 rounded border border-slate-700 text-xs text-slate-400 hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span className="mt-0.5 shrink-0 w-3 h-3 rounded border border-slate-600" />
              {clause}
            </button>
          ))}
        </div>
        <PlaceholderNote text="Scored in M7" />
      </PanelSection>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ControlPanel({ dojoId, scenario, config, onConfigChange }: ControlPanelProps) {
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

      {/* Universal guardrail controls — always shown, wired to /api/chat */}
      <GuardrailControls
        config={config}
        onChange={onConfigChange}
        disabled={!hasScenario}
      />

      {/* Dojo-specific controls */}
      {dojoId === 1 && <Dojo1Panel disabled={!hasScenario} />}
      {dojoId === 2 && <Dojo2Panel disabled={!hasScenario} />}
      {dojoId === 3 && <Dojo3Panel disabled={!hasScenario} />}
    </div>
  );
}
