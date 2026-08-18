'use client';

/**
 * Export and import of local study progress.
 *
 * Progress lives only in this browser's localStorage, so it is one cleared
 * cache away from gone. These helpers let a user carry their history to another
 * device or keep a backup, without introducing accounts or a server.
 *
 * The file format is deliberately plain JSON with a version field so a future
 * schema change can migrate rather than silently corrupt.
 */

import { loadProgress, PROGRESS_CHANGED_EVENT, type ProgressState } from './progress-store';
import { mergePayloads, normalise } from './sync-merge';

const PROGRESS_KEY = 'securingai:progress:v1';
const SETTINGS_KEY = 'securingai:settings:v1';
// Per-question spaced-repetition stats, written by lib/quiz-progress.ts.
// The key predates the securingai: namespace and is kept as-is so existing
// installs are not orphaned.
const QUIZ_KEY = 'dojo-progress-v1';

export const BACKUP_VERSION = 1;

/**
 * Every key this app writes. Exported so nothing has to re-derive the list.
 *
 * "Clear all training data" in settings previously called clearProgress(), which
 * removes only PROGRESS_KEY — quiz history under QUIZ_KEY survived, so the Playbook
 * still showed every past session after the user had been told their data was cleared.
 * This module already knew all three keys for export; the clear path did not.
 */
export const ALL_STORAGE_KEYS = [PROGRESS_KEY, QUIZ_KEY, SETTINGS_KEY] as const;

/**
 * Removes every trace of local study progress.
 *
 * Settings are included because the button says "all training data" and a user
 * clearing their data does not expect their configuration to persist.
 */
export function clearAllProgress(): void {
  if (typeof window === 'undefined') return;
  for (const key of ALL_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // A storage error on one key must not leave the others behind.
    }
  }
  // Same notification clearProgress() sends, so open views refresh.
  window.dispatchEvent(new Event(PROGRESS_CHANGED_EVENT));
}

export interface ProgressBackup {
  format: 'securingai-progress';
  version: number;
  exportedAt: string;
  progress: unknown;
  quizProgress: unknown;
  settings: unknown;
}

function readRaw(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Builds the backup object from everything currently persisted. */
export function buildBackup(): ProgressBackup {
  return {
    format: 'securingai-progress',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    progress: readRaw(PROGRESS_KEY),
    quizProgress: readRaw(QUIZ_KEY),
    settings: readRaw(SETTINGS_KEY),
  };
}

/** Triggers a browser download of the backup file. */
export function downloadBackup(): void {
  const backup = buildBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `securingai-progress-${backup.exportedAt.slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export type ImportResult =
  | { ok: true; runs: number; added: number }
  | { ok: false; error: string };

/**
 * Restores a backup, merging it into what is already stored.
 *
 * Merging rather than replacing, because the realistic use of this feature is
 * carrying history from a second device, and that device is not a superset of
 * this one. Replacing meant importing a phone's backup onto a laptop silently
 * destroyed everything studied on the laptop, with no warning and no undo. The
 * union is the same one sync uses, so both paths behave identically: nothing is
 * ever dropped, and importing the same file twice changes nothing the second
 * time.
 *
 * Settings are only adopted when this browser has none. A backup carries the
 * preferences of the machine it came from, and reduce-motion describes the
 * device you are sitting at rather than history that should follow you.
 *
 * Validates the envelope before writing anything, so a wrong file cannot leave
 * storage half-overwritten. Returns a result rather than throwing, since the
 * caller is a UI button that needs to show a message either way.
 */
export function restoreBackup(text: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: 'That file is not a progress backup.' };
  }

  const backup = parsed as Partial<ProgressBackup>;

  if (backup.format !== 'securingai-progress') {
    return { ok: false, error: 'That file is not a Securing AI progress backup.' };
  }

  if (typeof backup.version !== 'number' || backup.version > BACKUP_VERSION) {
    return {
      ok: false,
      error: `That backup was made by a newer version of the app (v${backup.version}).`,
    };
  }

  const before = normalise({ activity: readRaw(PROGRESS_KEY), quiz: readRaw(QUIZ_KEY) });
  const incoming = normalise({ activity: backup.progress, quiz: backup.quizProgress });
  const merged = mergePayloads(before, incoming);

  const countOf = (p: typeof merged) =>
    p.activity.quizRuns.length + p.activity.attackRuns.length + p.quiz.sessions.length;
  const added = countOf(merged) - countOf(before);

  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(merged.activity));
    localStorage.setItem(QUIZ_KEY, JSON.stringify(merged.quiz));
    // Only when this browser has expressed no preference of its own.
    if (backup.settings && readRaw(SETTINGS_KEY) === null) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(backup.settings));
    }
  } catch {
    return { ok: false, error: 'Could not write to browser storage. Is it full or blocked?' };
  }

  let runs = 0;
  try {
    const state = loadProgress() as ProgressState;
    runs = (state.quizRuns?.length ?? 0) + (state.attackRuns?.length ?? 0);
  } catch {
    /* count is cosmetic; a failure here does not invalidate the restore */
  }

  window.dispatchEvent(new Event('securingai:progress-changed'));
  return { ok: true, runs, added };
}
