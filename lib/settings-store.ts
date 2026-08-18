'use client';

// User preferences, persisted locally. Small and honest, every setting here
// actually changes behaviour.

import { safeWrite } from './storage-health';

const KEY = 'securingai:settings:v1';

export interface Settings {
  reduceMotion: boolean;
  denseTables: boolean;
  /**
   * The exam being studied for, e.g. 'SecAI'. Empty until chosen.
   *
   * Without this the app could not answer "what should I do right now", which
   * is the only question a study tool exists to answer. Every session began by
   * re-declaring the cert from a grid of eleven, six clicks from the landing
   * page to the first question, every time, forever.
   */
  activeCert: string;
  /** ISO yyyy-mm-dd. Empty when no date is booked. Drives the countdown. */
  examDate: string;
  /** Questions per day the learner is aiming for. */
  dailyGoal: number;
}

export const DEFAULT_SETTINGS: Settings = {
  reduceMotion: false,
  denseTables: false,
  activeCert: '',
  examDate: '',
  dailyGoal: 20,
};

/** Bounds on dailyGoal. A goal of 0 or 5000 is a typo, not an intention. */
const MIN_GOAL = 5;
const MAX_GOAL = 200;

/** yyyy-mm-dd, and a real calendar date. */
function isIsoDate(v: unknown): v is string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_SETTINGS;
    // Each field is taken only when it is actually a boolean.
    //
    // Spreading the parsed object let any stored value through, and applySettings
    // writes String(value) onto the document. A stored "false" or 0 became
    // data-reduce-motion="false"/"0", which is falsy-looking but is not the
    // string the CSS matches — while a stored "no" became "no" and read as
    // enabled by nothing at all. Either way an accessibility preference could be
    // silently wrong, and localStorage is editable by hand and shared with every
    // other script on the origin.
    // The same reasoning applies to every field added since: validate the
    // shape rather than trusting what is on disk, because localStorage is
    // hand-editable and shared with every other script on the origin.
    const source = parsed as Record<string, unknown>;
    const out = { ...DEFAULT_SETTINGS };
    if (typeof source.reduceMotion === 'boolean') out.reduceMotion = source.reduceMotion;
    if (typeof source.denseTables === 'boolean') out.denseTables = source.denseTables;
    if (typeof source.activeCert === 'string') out.activeCert = source.activeCert;
    if (isIsoDate(source.examDate)) out.examDate = source.examDate;
    if (
      typeof source.dailyGoal === 'number' &&
      Number.isFinite(source.dailyGoal) &&
      source.dailyGoal >= MIN_GOAL &&
      source.dailyGoal <= MAX_GOAL
    ) {
      out.dailyGoal = Math.round(source.dailyGoal);
    }
    return out;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Fired after settings change, so the shell and Today screen re-read. */
export const SETTINGS_CHANGED_EVENT = 'securingai:settings-changed';

export function saveSettings(next: Settings): void {
  if (typeof window === 'undefined') return;
  if (!safeWrite(KEY, JSON.stringify(next))) return;
  applySettings(next);
  window.dispatchEvent(new Event(SETTINGS_CHANGED_EVENT));
}

/** Change one field without the caller having to read the rest first. */
export function updateSettings(patch: Partial<Settings>): Settings {
  const next = { ...loadSettings(), ...patch };
  saveSettings(next);
  return next;
}

export function onSettingsChange(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(SETTINGS_CHANGED_EVENT, cb);
  return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, cb);
}

/** Whole days from today until the exam, or null when no date is set. */
export function daysUntilExam(examDate: string, now = new Date()): number | null {
  if (!isIsoDate(examDate)) return null;
  const target = Date.parse(`${examDate}T00:00:00Z`);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((target - today) / 86_400_000);
}

export function applySettings(s: Settings): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.reduceMotion = String(s.reduceMotion);
  document.documentElement.dataset.denseTables = String(s.denseTables);
}
