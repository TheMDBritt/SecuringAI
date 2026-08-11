#!/usr/bin/env node
/**
 * Fixes duplicate `id` values in lib/playbook-quiz.ts.
 *
 * Duplicates caused a real correctness bug in position-rebalance:
 * `rewriteQuestion` in scripts/rebalance-question-positions.mjs finds the
 * FIRST occurrence of an id when it applies the option permutation. When
 * the loop iterated over BOTH instances of a duplicate id, it applied the
 * (same, seeded) permutation to the first occurrence TWICE. The second
 * pass shuffled the options a second time but wrote back a `correct` index
 * that assumed the first-pass state — so first-instance options no longer
 * match the correct index.
 *
 * Fix strategy:
 *   1. Detect every duplicate id.
 *   2. For each duplicate id, restore the FIRST occurrence in the current
 *      file from the pre-rebalance revision (commit before 66319d5) using
 *      `git show`. This throws away the shuffled options for those 23 first
 *      instances — fine, they now match a correct index we can trust.
 *   3. Rename every 2nd/3rd/... occurrence's id with a numeric suffix so
 *      every id in the file is unique going forward.
 *   4. Emit a summary.
 *
 * Reruns are safe: on a clean file the script reports 0 duplicates and
 * makes no changes.
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const QUIZ_PATH = join(ROOT, 'lib', 'playbook-quiz.ts');
const REL_QUIZ_PATH = 'lib/playbook-quiz.ts';
const PRE_REBALANCE_REV = '66319d5^'; // commit before the rebalance ran

// ─── Find duplicate ids ──────────────────────────────────────────────────────
function findDuplicates(source) {
  const idRe = /id: '([^']+)'/g;
  const positions = {}; // id -> [charIdx, ...]
  let m;
  while ((m = idRe.exec(source)) !== null) {
    (positions[m[1]] ??= []).push(m.index);
  }
  return Object.entries(positions).filter(([, xs]) => xs.length > 1);
}

// ─── Read a specific question block from pre-rebalance source ────────────────
function readQuestionBlock(source, id) {
  const idRe = new RegExp(`id:\\s*'${id.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}'`);
  const idMatch = source.match(idRe);
  if (!idMatch) return null;
  let openIdx = idMatch.index;
  while (openIdx > 0 && source[openIdx] !== '{') openIdx--;
  let depth = 0, closeIdx = -1;
  let inStr = false, strCh = '';
  for (let i = openIdx; i < source.length; i++) {
    const c = source[i];
    const p = source[i - 1];
    if (inStr) {
      if (c === strCh && p !== '\\') inStr = false;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { inStr = true; strCh = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { closeIdx = i; break; } }
  }
  if (closeIdx < 0) return null;
  return { openIdx, closeIdx, text: source.slice(openIdx, closeIdx + 1) };
}

// ─── Main ────────────────────────────────────────────────────────────────────
let source = readFileSync(QUIZ_PATH, 'utf8');
const preSource = execSync(`git show ${PRE_REBALANCE_REV}:${REL_QUIZ_PATH}`, { encoding: 'utf8', maxBuffer: 50_000_000 });

const dupes = findDuplicates(source);
console.log(`Found ${dupes.length} duplicate id(s):`);
dupes.forEach(([id, xs]) => console.log(`  ${id} × ${xs.length}`));

if (dupes.length === 0) {
  console.log('\nNothing to fix.');
  process.exit(0);
}

// Step 1 — restore first-instances from pre-rebalance revision.
let restored = 0;
for (const [id] of dupes) {
  const preBlock = readQuestionBlock(preSource, id);
  const curBlock = readQuestionBlock(source, id);
  if (!preBlock || !curBlock) {
    console.log(`  ⚠ skip ${id}: could not locate block in one of the revisions`);
    continue;
  }
  source = source.slice(0, curBlock.openIdx) + preBlock.text + source.slice(curBlock.closeIdx + 1);
  restored++;
}
console.log(`\nRestored ${restored} first-instance question(s) from pre-rebalance revision.`);

// Step 2 — rename every 2nd+ occurrence with an unused suffix. Some ids
// already have a '-b' or '-c' sibling elsewhere in the file, so we can't
// blindly append '-b'. Build the full set of taken ids first, then choose
// the smallest suffix from ['-b','-c','-d','-e',...] that keeps the new id
// unique.
const takenIds = new Set();
for (const m of source.matchAll(/id: '([^']+)'/g)) takenIds.add(m[1]);

function suffixFor(base) {
  const alpha = 'bcdefghijklmnopqrstuvwxyz';
  for (const ch of alpha) {
    const cand = `${base}-${ch}`;
    if (!takenIds.has(cand)) { takenIds.add(cand); return `-${ch}`; }
  }
  for (let n = 2; n < 100; n++) {
    const cand = `${base}-${n}`;
    if (!takenIds.has(cand)) { takenIds.add(cand); return `-${n}`; }
  }
  throw new Error(`could not find unused suffix for ${base}`);
}

let renamed = 0;
const seen = new Map();
source = source.replace(/id: '([^']+)'/g, (match, id) => {
  const n = (seen.get(id) ?? 0) + 1;
  seen.set(id, n);
  if (n === 1) return match; // first occurrence keeps its id
  renamed++;
  const suffix = suffixFor(id);
  return `id: '${id}${suffix}'`;
});
console.log(`Renamed ${renamed} duplicate id(s) with a suffix.`);

// Sanity check: no more duplicates.
const afterDupes = findDuplicates(source);
if (afterDupes.length > 0) {
  console.error(`\n✗ Still ${afterDupes.length} duplicate(s) after fix — aborting write:`);
  afterDupes.forEach(([id, xs]) => console.error(`  ${id} × ${xs.length}`));
  process.exit(1);
}

writeFileSync(QUIZ_PATH, source);
console.log(`\n✓ ${QUIZ_PATH} written cleanly.`);
