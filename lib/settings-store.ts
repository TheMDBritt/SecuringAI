'use client';

// User preferences, persisted locally. Small and honest, every setting here
// actually changes behaviour.

const KEY = 'securingai:settings:v1';

export interface Settings {
  reduceMotion: boolean;
  denseTables: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  reduceMotion: false,
  denseTables: false,
};

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
    const source = parsed as Record<string, unknown>;
    const out = { ...DEFAULT_SETTINGS };
    for (const field of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
      if (typeof source[field] === 'boolean') out[field] = source[field] as boolean;
    }
    return out;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(next: Settings): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  applySettings(next);
}

export function applySettings(s: Settings): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.reduceMotion = String(s.reduceMotion);
  document.documentElement.dataset.denseTables = String(s.denseTables);
}
