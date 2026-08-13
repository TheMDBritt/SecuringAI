/**
 * Content integrity for the study material.
 *
 * Every assertion here corresponds to a defect that actually shipped at some
 * point: options truncated mid-clause by a bulk rewrite, an answer index left
 * pointing past the end of a shortened options array, duplicate article ids,
 * and answer text that gave the answer away. Data this large cannot be reviewed
 * by hand on every change, so the invariants are enforced here instead.
 */

import { describe, it, expect } from 'vitest';
import { QUIZ_QUESTIONS } from '@/lib/playbook-quiz';
import { GLOSSARY_TERMS } from '@/lib/playbook-glossary';
import { TOPIC_ARTICLES } from '@/lib/playbook-content';
import { SECAI_DRILLS } from '@/lib/secai-drills';
import { SC500_DRILLS } from '@/lib/sc500-drills';
import { AWS_SCSC03_DRILLS } from '@/lib/aws-scsc03-drills';
import { OWASP_LLM_2026 } from '@/lib/owasp-llm-top10';

const SECAI = QUIZ_QUESTIONS.filter((q) => q.certTags.includes('SecAI'));

describe('quiz structure', () => {
  it('has no duplicate question ids', () => {
    const seen = new Map<string, number>();
    for (const q of QUIZ_QUESTIONS) seen.set(q.id, (seen.get(q.id) ?? 0) + 1);
    expect([...seen].filter(([, n]) => n > 1).map(([id]) => id)).toEqual([]);
  });

  it('gives every question four options', () => {
    const bad = QUIZ_QUESTIONS.filter((q) => q.options.length !== 4).map((q) => q.id);
    expect(bad).toEqual([]);
  });

  it('keeps every correct index inside its options array', () => {
    const bad = QUIZ_QUESTIONS.filter(
      (q) => !Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.options.length,
    ).map((q) => q.id);
    expect(bad).toEqual([]);
  });

  it('has no duplicate options within a question', () => {
    const bad = QUIZ_QUESTIONS.filter((q) => {
      const set = new Set(q.options.map((o) => o.trim().toLowerCase()));
      return set.size !== q.options.length;
    }).map((q) => q.id);
    expect(bad).toEqual([]);
  });

  it('gives every question a non-trivial explanation', () => {
    const bad = QUIZ_QUESTIONS.filter((q) => !q.explanation || q.explanation.length < 40).map(
      (q) => q.id,
    );
    expect(bad).toEqual([]);
  });

  it('has no duplicate question stems within a cert', () => {
    const seen = new Map<string, string[]>();
    for (const q of SECAI) {
      const key = q.question.trim().toLowerCase();
      seen.set(key, [...(seen.get(key) ?? []), q.id]);
    }
    expect([...seen.values()].filter((ids) => ids.length > 1)).toEqual([]);
  });
});

describe('option text is well formed', () => {
  // Only words that genuinely cannot close a phrase. Prepositions are excluded
  // on purpose: "content the user does not have rights to" is correct English,
  // and flagging it produced noise that hid the real truncations.
  // Case-sensitive on purpose: a trailing lowercase "a" is a dangling article,
  // but "Annex A" and "Agent A" are complete labels.
  const WORDS_THAT_CANNOT_END_AN_OPTION =
    /\b(and|or|the|a|an|that|which|while|because|since|whose|its|their|these|those)$/;

  it('has no option truncated mid-clause', () => {
    const bad: string[] = [];
    for (const q of QUIZ_QUESTIONS) {
      for (const o of q.options) {
        const t = o.trim().replace(/[.,;:]$/, '');
        if (WORDS_THAT_CANNOT_END_AN_OPTION.test(t)) bad.push(`${q.id}: "${o}"`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('has balanced brackets and quotes in every option', () => {
    const bad: string[] = [];
    for (const q of QUIZ_QUESTIONS) {
      for (const o of q.options) {
        const parens = (o.match(/\(/g) ?? []).length - (o.match(/\)/g) ?? []).length;
        const quotes = (o.match(/"/g) ?? []).length;
        if (parens !== 0 || quotes % 2 !== 0) bad.push(`${q.id}: "${o}"`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('has no empty options', () => {
    // A single character is legitimate when the answer is a number, e.g. a
    // severity level or a retention count.
    const bad: string[] = [];
    for (const q of QUIZ_QUESTIONS) {
      for (const o of q.options) if (o.trim().length === 0) bad.push(`${q.id}: "${o}"`);
    }
    expect(bad).toEqual([]);
  });
});

describe('SecAI+ answers are not guessable without knowing the material', () => {
  /** Longest option, and how far it exceeds the runner-up. */
  function lengthProfile(options: readonly string[]) {
    const lens = options.map((o) => o.length);
    const sorted = [...lens].sort((a, b) => b - a);
    return {
      longestIndex: lens.indexOf(sorted[0]),
      marginOverRunnerUp: sorted[1] > 0 ? ((sorted[0] - sorted[1]) / sorted[1]) * 100 : 0,
    };
  }

  it('rarely makes the correct answer conspicuously the longest', () => {
    const obvious = SECAI.filter((q) => {
      const { longestIndex, marginOverRunnerUp } = lengthProfile(q.options);
      return longestIndex === q.correct && marginOverRunnerUp >= 40;
    });
    // Some terms are irreducibly longer than their distractors. Hold the line
    // at 3%; anything above that means a bulk edit reintroduced the tell.
    expect(obvious.length / SECAI.length).toBeLessThan(0.03);
  });

  it('has no distractor a test-wise reader can strike on sight', () => {
    const ELIMINABLE =
      /\b(is|are) (always|never)\b|\balways (more|less|better|worse)\b|\bcan never\b|\beliminates? (the )?(need|risk)\b|\breplaces? the need\b|\bcompletely (immune|safe)\b|\bguarantees? 100%\b|\binherently safe\b/i;
    const bad: string[] = [];
    for (const q of SECAI) {
      q.options.forEach((o, i) => {
        if (i !== q.correct && ELIMINABLE.test(o)) bad.push(`${q.id}: "${o}"`);
      });
    }
    expect(bad).toEqual([]);
  });

  it('does not let the correct answer explain itself', () => {
    const SELF_EXPLAINING =
      /;\s*(mitigat|defend|prevent)|,\s*(which|so that|thereby)\s|\b(because|since|therefore)\b/i;
    const bad = SECAI.filter((q) => SELF_EXPLAINING.test(q.options[q.correct])).map((q) => q.id);
    expect(bad).toEqual([]);
  });

  it('keeps punctuation out of SecAI+ answer options', () => {
    // Semicolons, colons, slashes and parentheses were all being used to append
    // a second clause that handed over the answer.
    const bad: string[] = [];
    for (const q of SECAI) {
      for (const o of q.options) {
        if (/[;:/(]/.test(o)) bad.push(`${q.id}: "${o}"`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('OWASP LLM Top 10 uses the current edition consistently', () => {
  // The codes are not stable across editions. LLM08 meant Excessive Agency in
  // 2023, Vector and Embedding Weaknesses in 2025, and Hidden Context Exposure
  // in 2026. Teaching a stale code is worse than teaching nothing, because the
  // learner answers confidently and wrongly.
  it('never pairs a code with a name from a superseded edition', () => {
    const bad: string[] = [];
    const RE = /\bLLM(0[1-9]|10)\b\s*[:\-,]?\s*([A-Z][A-Za-z ]{3,40})/g;

    for (const q of QUIZ_QUESTIONS) {
      const text = [q.question, ...q.options, q.explanation].join('  ');
      for (const m of text.matchAll(RE)) {
        const code = ('LLM' + m[1]) as keyof typeof OWASP_LLM_2026;
        const seen = m[2].trim();
        const expected = OWASP_LLM_2026[code];
        if (!expected) continue;

        // Only judge text that actually looks like a category name, not prose
        // that happens to follow a code reference.
        const looksLikeAName = Object.values(OWASP_LLM_2026).some((n) =>
          seen.toLowerCase().startsWith(n.toLowerCase().split(' ')[0]),
        );
        if (!looksLikeAName) continue;

        if (!seen.toLowerCase().startsWith(expected.toLowerCase())) {
          bad.push(`${q.id}: "${code} ${seen}" but ${code} is "${expected}"`);
        }
      }
    }
    expect([...new Set(bad)]).toEqual([]);
  });
});

describe('framework facts are current and correct', () => {
  it('uses only the four real NIST AI RMF functions', () => {
    // GOVERN, MAP, MEASURE, MANAGE. RESPOND and RECOVER belong to the NIST
    // Cybersecurity Framework, not the AI RMF. One question had RESPOND as its
    // correct answer, which does not exist.
    const CSF_ONLY = /\b(MONITOR|PROTECT|IDENTIFY|DETECT|RESPOND|RECOVER)\b/g;
    const bad: string[] = [];
    for (const q of QUIZ_QUESTIONS) {
      const text = [q.question, ...q.options, q.explanation].join('  ');
      if (!/NIST AI RMF/i.test(text)) continue;
      // A question explicitly comparing the two frameworks may name both.
      if (/CSF|Cybersecurity Framework|800-5|800-6/i.test(text)) continue;
      const found = [...new Set(text.match(CSF_ONLY) ?? [])];
      if (found.length) bad.push(`${q.id}: ${found.join(', ')}`);
    }
    expect(bad).toEqual([]);
  });

  it('cites only real ISO/IEC 42001 clauses', () => {
    // The standard runs clauses 4 to 10, plus Annex A controls.
    const bad: string[] = [];
    for (const q of QUIZ_QUESTIONS) {
      const text = [q.question, ...q.options, q.explanation].join('  ');
      if (!/42001/.test(text)) continue;
      for (const m of text.matchAll(/Clause (\d+)/g)) {
        const n = Number(m[1]);
        if (n < 4 || n > 10) bad.push(`${q.id}: Clause ${n}`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('house style', () => {
  it('uses no em-dashes or en-dashes anywhere in the quiz', () => {
    const bad: string[] = [];
    for (const q of QUIZ_QUESTIONS) {
      for (const text of [q.question, ...q.options, q.explanation]) {
        if (/[—–]/.test(text)) bad.push(`${q.id}: "${text.slice(0, 60)}"`);
      }
    }
    expect(bad.slice(0, 10)).toEqual([]);
  });
});

describe('exam domain coverage', () => {
  it('keeps the SecAI+ pool within reach of the published weights', async () => {
    const { EXAM_CERTS } = await import('@/lib/cert-exam-domains');
    const secai = EXAM_CERTS.find((c) => c.id === 'SecAI');
    expect(secai).toBeDefined();

    const categorised = new Set(secai!.domains.flatMap((d) => d.categories));
    const uncategorised = SECAI.filter((q) => !categorised.has(q.category)).map((q) => q.category);
    expect([...new Set(uncategorised)]).toEqual([]);
  });
});

describe('glossary and articles', () => {
  it('has no duplicate glossary terms', () => {
    const seen = new Map<string, number>();
    for (const t of GLOSSARY_TERMS) {
      const k = t.term.trim().toLowerCase();
      seen.set(k, (seen.get(k) ?? 0) + 1);
    }
    expect([...seen].filter(([, n]) => n > 1).map(([t]) => t)).toEqual([]);
  });

  it('has no duplicate article ids', () => {
    const seen = new Map<string, number>();
    for (const a of TOPIC_ARTICLES) seen.set(a.id, (seen.get(a.id) ?? 0) + 1);
    expect([...seen].filter(([, n]) => n > 1).map(([id]) => id)).toEqual([]);
  });
});

describe('drills', () => {
  const ALL = [
    ['SecAI+', SECAI_DRILLS],
    ['SC-500', SC500_DRILLS],
    ['SCS-C03', AWS_SCSC03_DRILLS],
  ] as const;

  it.each(ALL)('%s drills have unique ids', (_name, drills) => {
    const ids = drills.map((d) => d.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it.each(ALL)('%s drills tag an exam objective', (_name, drills) => {
    const bad = drills.filter((d) => !d.objectives || d.objectives.length === 0).map((d) => d.id);
    expect(bad).toEqual([]);
  });

  it.each(ALL)('%s drill steps have a valid correct index', (_name, drills) => {
    const bad: string[] = [];
    for (const d of drills) {
      d.steps.forEach((s, i) => {
        if (s.correct < 0 || s.correct >= s.options.length) bad.push(`${d.id} step ${i}`);
        if (s.options.length < 2) bad.push(`${d.id} step ${i} has too few options`);
      });
    }
    expect(bad).toEqual([]);
  });
});
