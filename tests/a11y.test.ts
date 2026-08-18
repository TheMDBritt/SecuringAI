/**
 * Static accessibility invariants.
 *
 * These are the defects a browser audit found on the live pages, encoded so
 * they cannot come back: two of the six routes had no h1 at all, and the
 * guardrail switches announced as "switch, off" with no name.
 *
 * This is a source-level check, not a substitute for a real audit. It catches
 * the regressions that are cheap to catch.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

function tsxUnder(dir: string): string[] {
  return readdirSync(join(process.cwd(), dir), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? tsxUnder(`${dir}/${e.name}`) : e.name.endsWith('.tsx') ? [`${dir}/${e.name}`] : [],
  );
}
const FILES = [...tsxUnder('app'), ...tsxUnder('components')];
const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');

describe('accessibility invariants', () => {
  it('gives every role=switch an accessible name', () => {
    const offenders: string[] = [];
    for (const f of FILES) {
      const text = read(f);
      // Look at the attribute block following each role="switch".
      for (const m of text.matchAll(/role="switch"([\s\S]{0,400}?)>/g)) {
        if (!/aria-label|aria-labelledby/.test(m[1])) offenders.push(f);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('renders each main surface under a single h1', () => {
    // The Playbook and the Dojo own their page heading; the marketing pages
    // carry theirs in the page component.
    const owners = ['components/playbook/PlaybookView.tsx', 'components/dojo/DojoTabs.tsx'];
    for (const f of owners) {
      expect(read(f), `${f} should declare an h1`).toMatch(/<h1[\s>]/);
    }
  });

  it('keeps a skip link to the main content', () => {
    expect(read('components/layout/AppShell.tsx')).toContain('#main-content');
  });
});

describe('table semantics are not overridden', () => {
  it('never puts an interactive role on a table row', () => {
    // role="button" on a <tr> removes the row from the table's accessibility
    // tree, so a screen reader loses row position and header association for
    // that row. The control belongs inside a cell, where it can be a real
    // button that announces its own expanded state.
    const offenders = FILES.filter((f) => {
      const text = read(f);
      return /<tr[\s\S]{0,400}?role="(button|link|checkbox|menuitem)"/.test(text);
    });
    expect(offenders).toEqual([]);
  });
});

describe('motion respects the reduced-motion preference', () => {
  const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

  it('zeroes delays as well as durations', () => {
    // Zeroing duration alone leaves staggered content invisible for the length
    // of its delay, which is worse than the animation it was meant to remove.
    for (const block of ['prefers-reduced-motion', "data-reduce-motion='true'"]) {
      const i = css.indexOf(block);
      expect(i, `${block} block missing`).toBeGreaterThan(-1);
      const scope = css.slice(i, i + 900);
      expect(scope).toMatch(/animation-delay:\s*0m?s\s*!important/);
      expect(scope).toMatch(/transition-delay:\s*0m?s\s*!important/);
    }
  });

  it('honours the preference for motion CSS cannot reach', () => {
    // A scroll started from script is invisible to the media query, so the
    // code has to ask. Chat autoscroll fired on every message and did not.
    const chat = read('components/dojo/ChatConsole.tsx');
    expect(chat).toContain('prefersReducedMotion()');
  });
});
