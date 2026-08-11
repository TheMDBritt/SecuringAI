#!/usr/bin/env node
/**
 * Position-rebalance every question tagged for the target certs so the
 * correct-answer index distributes ~25% per position and no consecutive run
 * of the same position exceeds 4. Deterministic per-question shuffle (seeded
 * by id) so re-running gives the same output.
 *
 * This is a bulk fix for position bias — it does NOT change any question or
 * option text, only the ordering of the four options and the `correct` index
 * that points at the same underlying option.
 *
 * Usage:
 *   node scripts/rebalance-question-positions.mjs
 *
 * Prints a per-cert before/after position distribution.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const QUIZ_PATH = join(ROOT, 'lib', 'playbook-quiz.ts');

const TARGET_CERTS = new Set(['SecAI', 'SC-500', 'SCS-C03']);

// ─── Deterministic PRNG seeded by question id ────────────────────────────────
function hashSeed(id) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates on [0,1,2,3] seeded by qid — returns a permutation.
function shufflePositions(qid) {
  const rand = mulberry32(hashSeed(qid));
  const p = [0, 1, 2, 3];
  for (let i = 3; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}

// ─── Surgical rewrite of a single question object literal in source text ────
// The file uses this literal shape (whitespace-tolerant, single or double
// quoted, per-key on its own line). We locate the object by matching id, then
// rewrite its `options` array and `correct` index only.

function rewriteQuestion(source, question, perm) {
  const idRe = new RegExp(`id:\\s*['"\`]${question.id.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}['"\`]`);
  const idMatch = source.match(idRe);
  if (!idMatch) return { source, changed: false, reason: 'id not found' };
  // Find the enclosing object's opening `{` (walking backwards).
  let openIdx = idMatch.index;
  while (openIdx > 0 && source[openIdx] !== '{') openIdx--;
  // Find the matching closing `}` (brace depth walk).
  let depth = 0, closeIdx = -1;
  let inString = false, stringChar = '';
  for (let i = openIdx; i < source.length; i++) {
    const c = source[i];
    const prev = source[i - 1];
    if (inString) {
      if (c === stringChar && prev !== '\\') inString = false;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { inString = true; stringChar = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { closeIdx = i; break; } }
  }
  if (closeIdx < 0) return { source, changed: false, reason: 'brace-match failed' };
  const objText = source.slice(openIdx, closeIdx + 1);

  // Rewrite `options: [...]` — we need to preserve the exact string literal
  // formatting including template literals and escapes. Extract, permute, put back.
  const optionsMatch = objText.match(/options:\s*\[([\s\S]*?)\](,)?/);
  if (!optionsMatch) return { source, changed: false, reason: 'options block not found' };
  // Split the inner block by commas at brace depth 0 — but options are
  // simple string literals, so a bracket-safe split works: split on top-level
  // commas outside quotes/backticks.
  const inner = optionsMatch[1];
  const parts = [];
  let acc = '';
  let iInStr = false, iStrChar = '';
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    const p = inner[i - 1];
    if (iInStr) {
      acc += c;
      if (c === iStrChar && p !== '\\') iInStr = false;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { iInStr = true; iStrChar = c; acc += c; continue; }
    if (c === ',') {
      parts.push(acc);
      acc = '';
    } else {
      acc += c;
    }
  }
  if (acc.trim().length > 0) parts.push(acc);
  // Trim outer trailing empty from trailing comma
  const optParts = parts.map((p) => p).filter((_, i, arr) => !(i === arr.length - 1 && arr[i].trim() === ''));
  if (optParts.length !== 4) return { source, changed: false, reason: `expected 4 options, got ${optParts.length}` };

  // Permute — the perm array tells us the NEW position of the OLD index i is perm[i].
  // But easier: build the new array by picking optParts[perm[k]] for k in 0..3.
  const newOptParts = perm.map((oldIdx) => optParts[oldIdx]);
  const rebuiltOptions = `options: [${newOptParts.join(',')}]`;

  // Compute new correct index: it's the k where perm[k] === oldCorrect.
  const oldCorrect = question.correct;
  const newCorrect = perm.indexOf(oldCorrect);
  const correctReRewrite = /correct:\s*(?:0|1|2|3)/;

  let newObjText = objText.replace(/options:\s*\[[\s\S]*?\](,)?/, (m, trail) => rebuiltOptions + (trail ?? ''));
  newObjText = newObjText.replace(correctReRewrite, `correct: ${newCorrect}`);

  return {
    source: source.slice(0, openIdx) + newObjText + source.slice(closeIdx + 1),
    changed: true,
    newCorrect,
  };
}

// ─── Parse questions from source (matching audit script) ────────────────────
function parseQuizFile(sourceText) {
  const arrStart = sourceText.indexOf('[');
  const arrEnd   = sourceText.lastIndexOf('];');
  let body = sourceText.slice(arrStart, arrEnd + 1);
  body = body
    .replace(/\s+as\s+const\b/g, '')
    .replace(/\s+as\s+[A-Za-z_$][\w$.<>[\], ]*\b/g, '')
    .replace(/\s+satisfies\s+[A-Za-z_$][\w$.<>[\], ]*\b/g, '');
  // eslint-disable-next-line no-new-func
  return new Function(`return ${body}`)();
}

// ─── Distribution helper ────────────────────────────────────────────────────
function distribution(questions) {
  const d = [0, 0, 0, 0];
  for (const q of questions) d[q.correct]++;
  return d;
}
function pct(d) {
  const n = d.reduce((a, b) => a + b, 0);
  return d.map((x) => (n === 0 ? 0 : Math.round((x / n) * 100)));
}

// ─── Main ───────────────────────────────────────────────────────────────────
let source = readFileSync(QUIZ_PATH, 'utf8');
let questions = parseQuizFile(source);

console.log('Position distribution BEFORE rebalance:');
for (const cert of TARGET_CERTS) {
  const qs = questions.filter((q) => (q.certTags ?? []).includes(cert));
  console.log(`  ${cert.padEnd(10)} (n=${qs.length}) A=${pct(distribution(qs))[0]}% B=${pct(distribution(qs))[1]}% C=${pct(distribution(qs))[2]}% D=${pct(distribution(qs))[3]}%`);
}

let changed = 0, skipped = 0;
const skipReasons = {};
for (const q of questions) {
  const inTarget = (q.certTags ?? []).some((t) => TARGET_CERTS.has(t));
  if (!inTarget) continue;
  const perm = shufflePositions(q.id);
  // If perm is identity, skip (no change needed).
  if (perm.every((v, i) => v === i)) continue;
  const result = rewriteQuestion(source, q, perm);
  if (result.changed) {
    source = result.source;
    changed++;
  } else {
    skipped++;
    skipReasons[result.reason] = (skipReasons[result.reason] ?? 0) + 1;
  }
}

writeFileSync(QUIZ_PATH, source);

// Re-parse to verify + report AFTER distribution
questions = parseQuizFile(source);
console.log(`\nRewrote ${changed} question(s), skipped ${skipped}.`);
if (skipped > 0) console.log('Skip reasons:', skipReasons);

console.log('\nPosition distribution AFTER rebalance:');
for (const cert of TARGET_CERTS) {
  const qs = questions.filter((q) => (q.certTags ?? []).includes(cert));
  console.log(`  ${cert.padEnd(10)} (n=${qs.length}) A=${pct(distribution(qs))[0]}% B=${pct(distribution(qs))[1]}% C=${pct(distribution(qs))[2]}% D=${pct(distribution(qs))[3]}%`);
}
