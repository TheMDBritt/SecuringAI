/**
 * Domain mastery is the breakdown that works for every certification. Objective tags
 * exist only for CompTIA SecAI+, so without this view ten of the eleven certs give a
 * learner an aggregate score and nothing to act on.
 */
import { describe, it, expect } from 'vitest';
import { domainBreakdown } from '@/lib/domain-progress';
import { EXAM_CERTS } from '@/lib/cert-exam-domains';
import type { ProgressData } from '@/lib/quiz-progress';

const EMPTY: ProgressData = { sessions: [], perQ: {} } as ProgressData;

describe('domain breakdown', () => {
  it('returns a row per published domain for every cert', () => {
    for (const cert of EXAM_CERTS) {
      const rows = domainBreakdown(EMPTY, cert.id);
      expect(rows.length, cert.id).toBe(cert.domains.length);
    }
  });

  it('finds questions for every domain of every cert', () => {
    // A domain with an empty pool is a hole in the study path: the UI offers a drill
    // that cannot run, and the mock cannot draw its blueprint share.
    const empty: string[] = [];
    for (const cert of EXAM_CERTS) {
      for (const row of domainBreakdown(EMPTY, cert.id)) {
        if (row.pool === 0) empty.push(`${cert.id} ${row.id}`);
      }
    }
    expect(empty, `Domains with no questions:\n${empty.join('\n')}`).toEqual([]);
  });

  it('reports not-attempted rather than zero when nothing has been answered', () => {
    // Zero accuracy and no attempts are different facts, and showing 0% for an
    // untouched domain reads as failure rather than as untouched.
    for (const row of domainBreakdown(EMPTY, 'SecAI')) {
      expect(row.accuracy).toBeNull();
      expect(row.seen).toBe(0);
    }
  });

  it('ranks by cost of ignoring, not by raw accuracy', () => {
    const cert = EXAM_CERTS.find((c) => c.id === 'SecAI')!;
    const heavy = cert.domains[1]; // 40% of the paper
    const light = cert.domains[0]; // 17%

    const rows = domainBreakdown(EMPTY, 'SecAI');
    const h = rows.find((r) => r.id === heavy.id)!;
    const l = rows.find((r) => r.id === light.id)!;
    // Untouched, both carry the same shortfall, so the heavier domain must rank first.
    expect(h.risk).toBeGreaterThan(l.risk);
  });

  it('returns nothing for an unknown cert rather than throwing', () => {
    expect(domainBreakdown(EMPTY, 'not-a-cert')).toEqual([]);
  });
});
