/**
 * Settings persistence.
 *
 * One of the two settings is an accessibility preference, and it is applied by
 * writing a string onto the document root that CSS matches exactly. That makes
 * the parse path load-bearing: anything that is not a real boolean coming out of
 * localStorage can put the document into a state where reduce-motion is neither
 * on nor off, and the user has no way to tell.
 *
 * localStorage is hand-editable and shared with every other script on the
 * origin, so "the value will always be what we wrote" is not an assumption this
 * function gets to make.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadSettings,
  saveSettings,
  applySettings,
  DEFAULT_SETTINGS,
  type Settings,
} from '@/lib/settings-store';

const KEY = 'securingai:settings:v1';

/** Minimal localStorage and document, since the suite runs in node. */
function installBrowser() {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
  const documentElement = { dataset: {} as Record<string, string> };
  const events: string[] = [];
  vi.stubGlobal('window', {
    localStorage,
    dispatchEvent: (e: Event) => { events.push(e.type); return true; },
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  vi.stubGlobal('document', { documentElement });
  return { store, documentElement, events };
}

let env: ReturnType<typeof installBrowser>;

beforeEach(() => {
  env = installBrowser();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('loading', () => {
  it('returns defaults when nothing is stored', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips a saved settings object', () => {
    const next: Settings = { ...DEFAULT_SETTINGS, reduceMotion: true, denseTables: true };
    saveSettings(next);
    expect(loadSettings()).toEqual(next);
  });

  it('fills in a field the stored object does not have', () => {
    // A settings object written by an older build is missing whatever was added
    // since. Those fields take their default rather than becoming undefined.
    env.store.set(KEY, JSON.stringify({ reduceMotion: true }));
    expect(loadSettings()).toEqual({ ...DEFAULT_SETTINGS, reduceMotion: true, denseTables: false });
  });

  it('ignores a field that is not a boolean', () => {
    // This is the one that matters. A stored "false" is a truthy string, and a
    // stored "no" is neither true nor false — both used to pass straight through
    // to the document attribute.
    env.store.set(KEY, JSON.stringify({ reduceMotion: 'false', denseTables: 'no' }));
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('ignores a numeric truthy value', () => {
    env.store.set(KEY, JSON.stringify({ reduceMotion: 1 }));
    expect(loadSettings().reduceMotion).toBe(false);
  });

  it('survives malformed JSON', () => {
    env.store.set(KEY, '{not json');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('survives a stored value that is not an object', () => {
    for (const raw of ['null', '5', '"a string"', '[1,2,3]', 'true']) {
      env.store.set(KEY, raw);
      expect(loadSettings(), `stored ${raw}`).toEqual(DEFAULT_SETTINGS);
    }
  });

  it('does not adopt unknown keys from storage', () => {
    // Nothing else on the origin gets to add fields to our settings object.
    env.store.set(KEY, JSON.stringify({ reduceMotion: true, isAdmin: true }));
    expect(Object.keys(loadSettings()).sort()).toEqual(Object.keys(DEFAULT_SETTINGS).sort());
  });
});

describe('applying', () => {
  it('writes exactly the strings the CSS matches', () => {
    // The stylesheet keys off html[data-reduce-motion='true']. Anything other
    // than the literal "true"/"false" pair is a silently broken preference.
    applySettings({ ...DEFAULT_SETTINGS, reduceMotion: true, denseTables: false });
    expect(env.documentElement.dataset.reduceMotion).toBe('true');
    expect(env.documentElement.dataset.denseTables).toBe('false');
  });

  it('is applied as part of saving, not only on next load', () => {
    saveSettings({ ...DEFAULT_SETTINGS, reduceMotion: true, denseTables: true });
    expect(env.documentElement.dataset.reduceMotion).toBe('true');
    expect(env.documentElement.dataset.denseTables).toBe('true');
  });

  it('turns a preference back off', () => {
    saveSettings({ ...DEFAULT_SETTINGS, reduceMotion: true, denseTables: false });
    saveSettings({ ...DEFAULT_SETTINGS, reduceMotion: false, denseTables: false });
    expect(env.documentElement.dataset.reduceMotion).toBe('false');
    expect(loadSettings().reduceMotion).toBe(false);
  });
});

describe('server rendering', () => {
  it('returns defaults and touches nothing when there is no window', () => {
    vi.unstubAllGlobals();
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
    expect(() => saveSettings({ ...DEFAULT_SETTINGS, reduceMotion: true, denseTables: true })).not.toThrow();
    expect(() => applySettings(DEFAULT_SETTINGS)).not.toThrow();
  });
});
