/**
 * Exam facts on screen must be the exam's facts.
 *
 * A wrong pass mark is the worst kind of error this product can make: it is the
 * number a learner calibrates readiness against, and it fails silently. GOAA
 * carried 73% against a published 67%, and CAISP carried 70% against a
 * published 80%.
 *
 * These also pin the honesty machinery around the four certs with no sourced
 * blueprint — the format disclosure and the provenance marker — because the
 * failure mode there is presenting a guess with the same authority as a
 * published weighting.
 *
 * Sources are recorded in docs/cert-objectives/unweighted-certs.md.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { EXAM_CERTS } from '@/lib/cert-exam-domains';

const byId = (id: string) => EXAM_CERTS.find((c) => c.id === id)!;

describe('published exam facts', () => {
  it('GOAA passes at 67, not 73', () => {
    expect(byId('GIAC-GOAA').passingScore).toBe(67);
  });

  it('CAISP passes at 80, not 70', () => {
    expect(byId('CAISP').passingScore).toBe(80);
  });

  it('CAIS mock matches the published 80 questions in 100 minutes', () => {
    expect(byId('CAIS').mockExam).toEqual({ questions: 80, durationMin: 100 });
  });

  it('gives every cert a passing score in a plausible range', () => {
    for (const c of EXAM_CERTS) {
      expect(c.passingScore, `${c.id} has no passing score`).toBeDefined();
      expect(c.passingScore!, `${c.id} passing score is out of range`).toBeGreaterThanOrEqual(50);
      expect(c.passingScore!).toBeLessThanOrEqual(100);
    }
  });
});

describe('a hands-on exam is never given a multiple-choice mock', () => {
  const handsOn = EXAM_CERTS.filter((c) => c.format === 'performance-based');

  it('identifies the two practical certifications', () => {
    expect(handsOn.map((c) => c.id).sort()).toEqual(['CAISP', 'GIAC-GASAE']);
  });

  for (const cert of handsOn) {
    it(`${cert.id} offers no mock preset`, () => {
      // A timed 4-option mock would rehearse a format the candidate never sees
      // and imply a readiness signal these questions cannot support.
      expect(cert.mockExam).toBeUndefined();
    });

    it(`${cert.id} explains what the real exam is`, () => {
      expect(cert.formatNote, `${cert.id} withholds a mock without saying why`).toBeTruthy();
      expect(cert.formatNote!.length).toBeGreaterThan(80);
    });
  }
});

describe('blueprint provenance is recorded, not implied', () => {
  it('annotates every cert', () => {
    const missing = EXAM_CERTS.filter((c) => !c.format || !c.blueprintSource);
    expect(missing.map((c) => c.id)).toEqual([]);
  });

  it('marks exactly the certs with no sourced weighting', () => {
    const unweighted = EXAM_CERTS.filter((c) => c.blueprintSource === 'unweighted');
    expect(unweighted.map((c) => c.id).sort()).toEqual(['CAIS', 'CAISP', 'GIAC-GASAE', 'GIAC-GOAA']);
  });

  it('never marks a cert as unweighted while it carries weights', () => {
    // The marker drives a disclosure in the quiz setup. If it disagreed with the
    // data, the product would be telling a learner the draw is even while
    // drawing to a blueprint, or the reverse.
    for (const cert of EXAM_CERTS) {
      const weighted = cert.domains.filter((d) => d.weight).length;
      if (cert.blueprintSource === 'unweighted') {
        expect(weighted, `${cert.id} is marked unweighted but has weights`).toBe(0);
      } else {
        expect(weighted, `${cert.id} claims a blueprint but has no weights`).toBe(cert.domains.length);
      }
    }
  });

  it('documents the four unsourced certs', () => {
    const doc = readFileSync(join(process.cwd(), 'docs/cert-objectives/unweighted-certs.md'), 'utf8');
    for (const id of ['GIAC-GOAA', 'GIAC-GASAE', 'CAISP', 'CAIS']) {
      expect(doc, `${id} is unsourced but undocumented`).toContain(id);
    }
    // The rule that stops questions being written to a blueprint that does not
    // exist has to be restated here, since this is the file someone will read.
    expect(doc).toMatch(/Never write from memory/);
  });
});

describe('the mock draw covers every domain', () => {
  // The reason the even-split fallback exists: a flat-random draw is shaped by
  // how many questions we happened to write per domain, not by the exam.
  it('gives every cert domains to draw from', () => {
    for (const cert of EXAM_CERTS) {
      expect(cert.domains.length, `${cert.id} has no domains`).toBeGreaterThan(0);
      for (const d of cert.domains) {
        expect(d.categories.length + (d.topics?.length ?? 0), `${cert.id}/${d.id} matches nothing`).toBeGreaterThan(0);
      }
    }
  });
});
