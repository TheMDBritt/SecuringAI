'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, PageHeader, SectionHeading, Button, Badge } from '@/components/ui';
import { loadSettings, saveSettings, applySettings, DEFAULT_SETTINGS, type Settings } from '@/lib/settings-store';
import { loadProgress, clearProgress, summarize } from '@/lib/progress-store';
import { downloadBackup, restoreBackup } from '@/lib/progress-backup';

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-slate-500">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={[
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
          checked ? 'bg-brand-500' : 'bg-surface-raised border border-surface-border',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          ].join(' ')}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [counts, setCounts] = useState({ quiz: 0, attack: 0 });
  const [cleared, setCleared] = useState(false);
  const [importMsg, setImportMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    applySettings(s);
    const p = summarize(loadProgress());
    setCounts({ quiz: p.quizRuns, attack: p.attackAttempts });
    setHydrated(true);
  }, []);

  function update(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  }

  function handleExport() {
    // Exports progress, per-question stats and preferences together so the file
    // can actually restore a study session on another device.
    downloadBackup();
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;

    const result = restoreBackup(await file.text());
    if (result.ok) {
      const p = summarize(loadProgress());
      setCounts({ quiz: p.quizRuns, attack: p.attackAttempts });
      setImportMsg({ tone: 'ok', text: `Restored ${result.runs} saved records.` });
    } else {
      setImportMsg({ tone: 'err', text: result.error });
    }
  }

  function handleClear() {
    clearProgress();
    setCounts({ quiz: 0, attack: 0 });
    setCleared(true);
    setTimeout(() => setCleared(false), 2500);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Preferences and training data live entirely in your browser. There are no accounts and nothing is sent to a server."
      />

      {/* Appearance */}
      <Card className="mt-6 p-5 sm:p-6">
        <SectionHeading eyebrow="Interface" title="Appearance & motion" />
        <div className="mt-3 divide-y divide-surface-border/60">
          <div className="flex items-start justify-between gap-4 py-3.5">
            <div>
              <p className="text-sm font-medium text-slate-200">Theme</p>
              <p className="mt-0.5 text-[13px] text-slate-500">Optimised dark enterprise theme with cyber-blue accents.</p>
            </div>
            <Badge tone="brand">Dark · Default</Badge>
          </div>
          <Toggle
            label="Reduce motion"
            description="Minimise transitions, hover elevation, and animated progress bars across the platform."
            checked={settings.reduceMotion}
            onChange={(v) => update({ reduceMotion: v })}
          />
          <Toggle
            label="Compact data density"
            description="Tighter spacing in tables and lists for information-dense review sessions."
            checked={settings.denseTables}
            onChange={(v) => update({ denseTables: v })}
          />
        </div>
      </Card>

      {/* Data & privacy */}
      <Card className="mt-4 p-5 sm:p-6">
        <SectionHeading
          eyebrow="Privacy"
          title="Training data"
          description="Your quiz sessions and lab attempts are stored only in this browser's local storage."
        />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-surface-border bg-surface-raised/40 p-3.5">
            <p className="text-2xl font-bold text-slate-100">{hydrated ? counts.quiz : 0}</p>
            <p className="text-[13px] text-slate-500">Quiz sessions stored</p>
          </div>
          <div className="rounded-lg border border-surface-border bg-surface-raised/40 p-3.5">
            <p className="text-2xl font-bold text-slate-100">{hydrated ? counts.attack : 0}</p>
            <p className="text-[13px] text-slate-500">Lab attempts stored</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <Button variant="secondary" size="md" onClick={handleExport}>
            Export backup
          </Button>
          <Button variant="secondary" size="md" onClick={() => fileRef.current?.click()}>
            Import backup
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="sr-only"
            aria-label="Choose a progress backup file to import"
          />
          <Button variant="ghost" size="md" onClick={handleClear} className="text-red-300 hover:bg-red-500/10 hover:text-red-200">
            Clear all training data
          </Button>
          {cleared && <span className="text-[13px] font-medium text-emerald-300">Cleared.</span>}
        </div>

        {/* Announced to assistive tech, since the result is otherwise silent. */}
        <div role="status" aria-live="polite" className="mt-3 min-h-[1.25rem]">
          {importMsg && (
            <span
              className={`text-[13px] font-medium ${
                importMsg.tone === 'ok' ? 'text-emerald-300' : 'text-red-300'
              }`}
            >
              {importMsg.text}
            </span>
          )}
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-slate-500">
          Progress lives only in this browser. Export a backup before clearing
          site data or switching devices. Importing replaces what is stored now.
        </p>
      </Card>

      {/* Model / API */}
      <Card className="mt-4 p-5 sm:p-6">
        <SectionHeading eyebrow="Runtime" title="Model backend" />
        <p className="mt-3 text-[13px] leading-relaxed text-slate-400">
          The platform runs fully in deterministic <span className="font-medium text-slate-200">stub mode</span> with no
          API key required, every Dojo 1 outcome and score is reproducible. To enable free-form AI replies in the
          SOC and GRC disciplines, set an <code className="rounded bg-surface-raised px-1.5 py-0.5 text-brand-300">OPENAI_API_KEY</code> in
          your deployment environment. Keys are read server-side only and never reach the browser.
        </p>
      </Card>
    </div>
  );
}
