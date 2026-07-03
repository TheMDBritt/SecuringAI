'use client';

// User preferences, persisted locally. Small and honest — every setting here
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
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
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
