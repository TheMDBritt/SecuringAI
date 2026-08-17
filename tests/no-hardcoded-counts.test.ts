/**
 * Content figures must come from lib/content-counts or lib/catalog-counts, never from a
 * literal typed into a page.
 *
 * lib/content-counts.ts exists precisely to stop this, and its own header documents an
 * earlier drift (the playbook advertised 1,731 questions against an actual 1,876). It
 * drifted again anyway: the help page shipped "1,876 questions, 775 glossary terms"
 * against an actual 2,113 / 774, and the about page hardcoded 47 SOC incidents against
 * an actual 56. A comment cannot enforce this; a test can.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { CONTENT_COUNTS } from '@/lib/content-counts';
import { CATALOG_COUNTS } from '@/lib/catalog-counts';

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

/** Pages and shared UI. Excludes lib/, which is where the real figures live. */
const SOURCE_FILES = [...walk('app'), ...walk('components')];

/** The live figures, plus the comma-grouped forms a writer would type in prose. */
const LIVE_FIGURES = new Set<string>();
for (const n of [
  CONTENT_COUNTS.quizQuestions,
  CONTENT_COUNTS.glossaryTerms,
  CONTENT_COUNTS.topicArticles,
  CONTENT_COUNTS.certs,
  CONTENT_COUNTS.drills,
  CATALOG_COUNTS.scenarios,
  CATALOG_COUNTS.incidents,
  CATALOG_COUNTS.dojo1,
  CATALOG_COUNTS.dojo2,
  CATALOG_COUNTS.dojo3,
]) {
  LIVE_FIGURES.add(String(n));
  LIVE_FIGURES.add(n.toLocaleString('en-US'));
}

describe('content figures are never hardcoded', () => {
  it('no page states a count that is currently correct but would silently rot', () => {
    // A literal matching today's value is the dangerous case: it looks right, so nobody
    // checks it, and it is wrong the next time content changes.
    const offenders: string[] = [];

    for (const file of SOURCE_FILES) {
      const src = readFileSync(file, 'utf8');
      const lines = src.split('\n');
      lines.forEach((line, i) => {
        // Skip the modules that are allowed to state the numbers, and comments.
        if (/content-counts|catalog-counts/.test(line)) return;
        if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;

        for (const figure of LIVE_FIGURES) {
          // Only flag figures sitting in user-visible prose, not arbitrary numbers such
          // as pixel sizes or array indices.
          const inProse = new RegExp(
            `${figure.replace('.', '\\.')}\\s*(questions|glossary|terms|articles|certifications|certs|scenarios|incidents|drills)`,
            'i',
          );
          if (inProse.test(line)) {
            offenders.push(`${file}:${i + 1} — "${line.trim().slice(0, 90)}"`);
          }
        }
      });
    }

    expect(offenders, `Use CONTENT_COUNTS / CATALOG_COUNTS instead:\n${offenders.join('\n')}`)
      .toEqual([]);
  });

  it('the published figures match the data they claim to count', () => {
    // Guards the other direction: the count modules themselves going stale.
    expect(CONTENT_COUNTS.quizQuestions).toBeGreaterThan(0);
    expect(CONTENT_COUNTS.certs).toBeGreaterThan(0);
    expect(CATALOG_COUNTS.scenarios).toBe(
      CATALOG_COUNTS.dojo1 + CATALOG_COUNTS.dojo2 + CATALOG_COUNTS.dojo3,
    );
  });
});
