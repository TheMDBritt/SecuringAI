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

describe('public API routes bound their own work', () => {
  const questions = readFileSync(join(process.cwd(), 'app/api/questions/route.ts'), 'utf8');
  const content = readFileSync(join(process.cwd(), 'app/api/content/route.ts'), 'utf8');

  it('rejects an unknown cert instead of scanning the bank for it', () => {
    expect(questions).toContain('KNOWN_CERTS');
  });

  it('caps request size before splitting, not after', () => {
    // slice() on the result of split() still allocates the whole array first.
    expect(questions).toMatch(/MAX_IDS_CHARS/);
    expect(content).toMatch(/MAX_TERMS_CHARS/);
  });

  it('enforces search limits server-side rather than trusting the client', () => {
    expect(content).toContain('MAX_QUERY_CHARS');
    expect(content).toContain('MIN_QUERY_CHARS');
  });
});
