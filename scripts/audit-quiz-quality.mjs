#!/usr/bin/env node
/**
 * Quality audit for QUIZ_QUESTIONS filtered by cert tag.
 * Detects the classic multiple-choice tells that let a test-taker guess without
 * knowing the material. Prints a per-cert JSON summary and per-question
 * flagged report to stdout.
 *
 * Usage:
 *   node scripts/audit-quiz-quality.mjs                # all 3 target certs
 *   node scripts/audit-quiz-quality.mjs SecAI          # single cert
 *
 * Detection heuristics:
 *   longest-correct       — correct option > 30 chars longer than longest distractor
 *   very-long-correct     — correct option > 50 chars longer than mean distractor
 *   throwaway-distractor  — "None of the above" / "All of the above" / joke option
 *   absolute-quantifier   — correct uses always/never/only/must while distractors don't
 *   near-duplicate        — two options normalize to the same string
 *   short-explanation     — explanation < 80 chars
 *   article-agreement     — stem uses "a" and correct starts with vowel (or vice versa)
 *   stem-echo             — correct option contains a distinctive keyword from the stem that no distractor contains
 *   short-correct         — correct < 15 chars while other options avg > 40 chars
 *   position-run          — five or more consecutive questions have same correct index
 *
 * The script is intentionally strict — false positives are fine because a
 * human reviews each flag before rewriting.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const QUIZ_PATH = join(ROOT, 'lib', 'playbook-quiz.ts');

const TARGET_CERTS = process.argv.length > 2
  ? process.argv.slice(2)
  : ['SecAI', 'SC-500', 'SCS-C03'];

// ─── Parse the .ts file into question objects ────────────────────────────────
// lib/playbook-quiz.ts is a plain export of a QUIZ_QUESTIONS array literal.
// We eval the array by stripping the TS-specific bits — it's plain JSON-shaped
// data with no computed values, so `Function(...)` gives us the array back.

function parseQuizFile(source) {
  const arrStart = source.indexOf('[');
  const arrEnd   = source.lastIndexOf('];');
  if (arrStart < 0 || arrEnd < 0) throw new Error('cannot find QUIZ_QUESTIONS array literal');
  let body = source.slice(arrStart, arrEnd + 1);
  // Strip TS-only tokens the JS parser can't chew: `as const`, `as <Type>`,
  // and satisfies clauses. All the source array literals are plain data so
  // stripping is safe here.
  body = body
    .replace(/\s+as\s+const\b/g, '')
    .replace(/\s+as\s+[A-Za-z_$][\w$.<>[\], ]*\b/g, '')
    .replace(/\s+satisfies\s+[A-Za-z_$][\w$.<>[\], ]*\b/g, '');
  // eslint-disable-next-line no-new-func
  return new Function(`return ${body}`)();
}

const source = readFileSync(QUIZ_PATH, 'utf8');
const questions = parseQuizFile(source);

// ─── Heuristics ──────────────────────────────────────────────────────────────

const STOP = new Set(['the','a','an','of','to','and','or','in','on','for','with','is','are','be','can','will','you','your','which','what','how','why','when','from','that','this','these','those','following','best','most','should','would','could','all','any','not']);

function tokens(s) {
  return s.toLowerCase().replace(/[^\p{L}0-9 ]+/gu, ' ').split(/\s+/).filter((t) => t && !STOP.has(t) && t.length > 3);
}

function checkQuestion(q) {
  const flags = [];
  const opts = q.options;
  const lens = opts.map((o) => o.length);
  const correctLen = lens[q.correct];
  const otherLens = lens.filter((_, i) => i !== q.correct);
  const otherMax = Math.max(...otherLens);
  const otherMean = otherLens.reduce((a, b) => a + b, 0) / otherLens.length;

  // longest-correct
  if (correctLen - otherMax > 30) flags.push({ type: 'longest-correct', detail: `correct=${correctLen} chars, next longest=${otherMax}` });
  if (correctLen - otherMean > 50) flags.push({ type: 'very-long-correct', detail: `correct=${correctLen} chars, mean distractor=${Math.round(otherMean)}` });

  // throwaway-distractor
  const throwRe = /^(none|all)\s+of\s+the\s+above/i;
  if (opts.some((o) => throwRe.test(o.trim()))) flags.push({ type: 'throwaway-distractor', detail: 'None/All of the above present' });

  // absolute-quantifier
  const absoluteRe = /\b(always|never|only|must|every|no\s+one|nothing|impossible|guaranteed)\b/i;
  const correctHasAbs = absoluteRe.test(opts[q.correct]);
  const distractorHasAbs = otherLens.some((_, i) => {
    const oi = i >= q.correct ? i + 1 : i;
    return absoluteRe.test(opts[oi]);
  });
  if (correctHasAbs && !distractorHasAbs) flags.push({ type: 'absolute-quantifier-correct', detail: `correct: "${opts[q.correct]}"` });
  // Also flag: absolute quantifiers in a distractor while correct is soft — the
  // classic "always is a red flag → not the answer" tell.
  const absDistractors = opts.filter((_, i) => i !== q.correct).filter((o) => absoluteRe.test(o)).length;
  if (absDistractors >= 2 && !correctHasAbs) flags.push({ type: 'absolute-quantifier-distractors', detail: `${absDistractors}/3 distractors use always/never/only` });

  // near-duplicate
  const norm = opts.map((o) => o.toLowerCase().replace(/\s+/g, ' ').trim());
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (norm[i] === norm[j]) { flags.push({ type: 'near-duplicate', detail: `options ${i} and ${j} identical` }); break; }

  // short-explanation
  if ((q.explanation ?? '').trim().length < 80) flags.push({ type: 'short-explanation', detail: `${(q.explanation ?? '').trim().length} chars` });

  // article-agreement — stem ends with " a " or " an " and correct starts with a matching / mismatching vowel
  const stem = q.question.trim();
  const lastWord = stem.replace(/[?.:]+$/, '').split(/\s+/).slice(-1)[0]?.toLowerCase();
  const correctStart = opts[q.correct].trim().charAt(0).toLowerCase();
  const isVowelStart = 'aeiou'.includes(correctStart);
  if (lastWord === 'a' && isVowelStart) flags.push({ type: 'article-agreement', detail: `stem "…a" + correct starts with vowel` });
  if (lastWord === 'an' && !isVowelStart && correctStart !== '') flags.push({ type: 'article-agreement', detail: `stem "…an" + correct starts with consonant` });

  // stem-echo — a token appears in the stem AND in the correct option AND in no distractor
  const stemToks = new Set(tokens(stem));
  const correctToks = tokens(opts[q.correct]);
  const distractorToksAll = new Set(otherLens.flatMap((_, i) => {
    const oi = i >= q.correct ? i + 1 : i;
    return tokens(opts[oi]);
  }));
  const echoes = correctToks.filter((t) => stemToks.has(t) && !distractorToksAll.has(t));
  if (echoes.length >= 2) flags.push({ type: 'stem-echo', detail: `keywords in stem+correct but no distractor: ${echoes.slice(0, 5).join(', ')}` });

  // short-correct in long distractors
  if (correctLen < 15 && otherMean > 40) flags.push({ type: 'short-correct-in-long-distractors', detail: `correct=${correctLen}, mean distractor=${Math.round(otherMean)}` });

  return flags;
}

// ─── Position-run — flagged at cert level, not per question ──────────────────
function positionRuns(qs) {
  const runs = [];
  let run = { start: 0, correct: qs[0]?.correct, length: 1 };
  for (let i = 1; i < qs.length; i++) {
    if (qs[i].correct === run.correct) run.length++;
    else {
      if (run.length >= 5) runs.push({ ...run, endId: qs[i - 1].id });
      run = { start: i, correct: qs[i].correct, length: 1 };
    }
  }
  if (run.length >= 5) runs.push({ ...run, endId: qs[qs.length - 1].id });
  return runs;
}

// ─── Run per cert ────────────────────────────────────────────────────────────

const summary = {};

for (const cert of TARGET_CERTS) {
  const forCert = questions.filter((q) => (q.certTags ?? []).includes(cert));
  const flagged = [];
  const typeCounts = {};

  for (const q of forCert) {
    const flags = checkQuestion(q);
    if (flags.length > 0) {
      flagged.push({ id: q.id, topic: q.topic, category: q.category, difficulty: q.difficulty, correct: q.correct, flags });
      for (const f of flags) typeCounts[f.type] = (typeCounts[f.type] ?? 0) + 1;
    }
  }

  const positionRunHits = positionRuns(forCert);

  summary[cert] = {
    total:         forCert.length,
    flaggedCount:  flagged.length,
    flaggedRatio:  forCert.length ? +((flagged.length / forCert.length) * 100).toFixed(1) : 0,
    positionRuns:  positionRunHits.length,
    typeCounts,
  };

  // Print details for each cert.
  console.log(`\n════════════════════════════════════════════════════════════════`);
  console.log(`  ${cert} — ${flagged.length}/${forCert.length} flagged (${summary[cert].flaggedRatio}%)`);
  console.log(`════════════════════════════════════════════════════════════════`);
  console.log(`\nFlag-type counts:`);
  for (const [t, n] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${t.padEnd(38)} ${n}`);
  }
  if (positionRunHits.length > 0) {
    console.log(`\nPosition runs (>=5 consecutive same correct index):`);
    for (const r of positionRunHits) {
      console.log(`  ${r.length} in a row @ correct=${r.correct} starting from index ${r.start} ... ending id ${r.endId}`);
    }
  }
  console.log(`\nFirst 20 flagged ids (for spot-checking):`);
  for (const f of flagged.slice(0, 20)) {
    console.log(`  ${f.id} (${f.difficulty}) [${f.flags.map((x) => x.type).join(', ')}]`);
  }
}

// Machine-readable summary at the end.
console.log(`\n\n// SUMMARY (JSON) — pipe with 2>/dev/null | tail -N to consume`);
console.log(JSON.stringify({ ...summary, byCert: TARGET_CERTS }, null, 2));

// Also emit a details file for the fixer to load.
const detailsPath = join(ROOT, 'scripts', '.audit-details.json');
const details = {};
for (const cert of TARGET_CERTS) {
  const forCert = questions.filter((q) => (q.certTags ?? []).includes(cert));
  details[cert] = forCert
    .map((q) => ({ id: q.id, topic: q.topic, category: q.category, difficulty: q.difficulty, correct: q.correct, flags: checkQuestion(q) }))
    .filter((r) => r.flags.length > 0);
}
import('node:fs').then((fs) => {
  fs.writeFileSync(detailsPath, JSON.stringify(details, null, 2));
  console.log(`\nWrote ${detailsPath}`);
});
