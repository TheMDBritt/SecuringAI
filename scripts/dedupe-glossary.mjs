#!/usr/bin/env node
/**
 * Deduplicates GLOSSARY_TERMS in lib/playbook-glossary.ts.
 *
 * For each term name (case-sensitive exact match — the actual duplication
 * pattern found is same-string reruns, not case variants), merges all
 * occurrences into ONE canonical entry:
 *   - definition: the longest one (most complete content survives)
 *   - category: from the entry whose definition was kept
 *   - certTags: union of every occurrence's certTags (no coverage lost)
 *   - related: union of every occurrence's related terms
 *
 * Rewrites the file with one entry per term, preserving first-occurrence
 * order. Safe to re-run — a clean file reports 0 duplicates and no changes.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const PATH = join(ROOT, 'lib', 'playbook-glossary.ts');

function parseFile(source) {
  const arrStart = source.indexOf('[');
  const arrEnd   = source.lastIndexOf('];');
  let body = source.slice(arrStart, arrEnd + 1);
  body = body
    .replace(/\s+as\s+const\b/g, '')
    .replace(/\s+as\s+[A-Za-z_$][\w$.<>[\], ]*\b/g, '')
    .replace(/\s+satisfies\s+[A-Za-z_$][\w$.<>[\], ]*\b/g, '');
  // eslint-disable-next-line no-new-func
  return new Function(`return ${body}`)();
}

function jsStringLiteral(s) {
  // Match the codebase's convention: single-quoted, escape internal ' and \.
  const escaped = s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
  return `'${escaped}'`;
}

const source = readFileSync(PATH, 'utf8');
const terms = parseFile(source);

console.log(`Parsed ${terms.length} glossary entries.`);

const byTerm = new Map();
const order = [];
for (const t of terms) {
  if (!byTerm.has(t.term)) {
    byTerm.set(t.term, []);
    order.push(t.term);
  }
  byTerm.get(t.term).push(t);
}

const dupeTermCount = [...byTerm.values()].filter((v) => v.length > 1).length;
const extraEntries = [...byTerm.values()].reduce((a, v) => a + Math.max(0, v.length - 1), 0);
console.log(`${dupeTermCount} terms have duplicates (${extraEntries} redundant entries to remove).`);

if (extraEntries === 0) {
  console.log('Nothing to do.');
  process.exit(0);
}

const merged = order.map((term) => {
  const versions = byTerm.get(term);
  if (versions.length === 1) return versions[0];

  // Keep the longest definition (most complete content).
  const best = versions.reduce((a, b) => (b.definition.length > a.definition.length ? b : a));

  const certTags = [...new Set(versions.flatMap((v) => v.certTags ?? []))].sort();
  const related  = [...new Set(versions.flatMap((v) => v.related ?? []))].sort();

  return {
    term,
    definition: best.definition,
    category: best.category,
    certTags,
    related,
  };
});

console.log(`Merged down to ${merged.length} unique entries.`);

// ─── Rebuild the file text ────────────────────────────────────────────────
// Find the array literal's opening bracket specifically — "= [" — not the
// first '[' in the file (which appears inside the `GlossaryTerm[]` type
// annotation on the const declaration).
const declMatch = source.match(/export const GLOSSARY_TERMS: GlossaryTerm\[\] = \[/);
if (!declMatch) throw new Error('could not find GLOSSARY_TERMS declaration');
const arrStart = declMatch.index;
const header = source.slice(0, arrStart); // everything before the array (imports, comment)

const entryLines = merged.map((t) => {
  const relatedStr = t.related.length
    ? `[${t.related.map(jsStringLiteral).join(', ')}]`
    : '[]';
  const certTagsStr = `[${t.certTags.map(jsStringLiteral).join(', ')}]`;
  return `  {\n    term: ${jsStringLiteral(t.term)},\n    definition: ${jsStringLiteral(t.definition)},\n    category: ${jsStringLiteral(t.category)},\n    certTags: ${certTagsStr},\n    related: ${relatedStr},\n  },`;
});

const newBody = `export const GLOSSARY_TERMS: GlossaryTerm[] = [\n${entryLines.join('\n')}\n];\n`;

writeFileSync(PATH, header + newBody);
console.log(`\n✓ ${PATH} rewritten: ${terms.length} → ${merged.length} entries.`);
