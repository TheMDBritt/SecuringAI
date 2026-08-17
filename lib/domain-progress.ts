/**
 * Per-domain mastery for any cert.
 *
 * The objective breakdown is the sharper tool, but it only works for certs whose
 * questions carry objective tags, which today is CompTIA SecAI+ alone. Every cert has
 * published domains with published weights, and every question can be placed in a domain
 * by category, so this view works everywhere.
 *
 * It is also the view that matches how a candidate thinks about an exam. The blueprint
 * says domain 2 is 40% of the paper; knowing you are at 55% there is more actionable
 * than an aggregate score.
 */
import { QUIZ_INDEX } from '@/lib/quiz-index';
import {
  EXAM_CERTS,
  questionMatchesDomain,
  parseDomainWeight,
  type ExamDomain,
} from '@/lib/cert-exam-domains';
import type { ProgressData } from '@/lib/quiz-progress';

export interface DomainStat {
  id: string;
  name: string;
  /** Published share of the exam, 0-1, or null when the vendor publishes none. */
  weight: number | null;
  /** Questions in the bank for this domain. */
  pool: number;
  /** Distinct questions the learner has answered at least once. */
  seen: number;
  attempts: number;
  correct: number;
  /** 0-1, or null when never attempted. */
  accuracy: number | null;
  /**
   * Expected marks lost if this is left as it is: how far short of mastery the
   * learner is, scaled by how much of the paper the domain carries. Unattempted
   * domains are treated as 0.5 rather than hidden, since an unknown is not a pass.
   */
  risk: number;
}

/** Cache: the domain of a question depends on the bank, not on the learner. */
const POOLS = new Map<string, Map<string, string[]>>();

function poolsFor(certId: string): Map<string, string[]> {
  const cached = POOLS.get(certId);
  if (cached) return cached;

  const cert = EXAM_CERTS.find((c) => c.id === certId);
  const out = new Map<string, string[]>();
  if (cert) {
    const inCert = QUIZ_INDEX.filter((q) => q.certTags.includes(certId));
    for (const d of cert.domains) {
      out.set(
        d.id,
        inCert.filter((q) => questionMatchesDomain(q, d as ExamDomain)).map((q) => q.id),
      );
    }
  }
  POOLS.set(certId, out);
  return out;
}

/**
 * Domains ordered by what it costs to ignore them, highest first.
 *
 * Accuracy alone is the wrong order for someone with a date booked: 60% in a domain
 * worth 40% of the paper loses more marks than 45% in one worth 8%.
 */
export function domainBreakdown(data: ProgressData, certId: string): DomainStat[] {
  const cert = EXAM_CERTS.find((c) => c.id === certId);
  if (!cert) return [];

  const pools = poolsFor(certId);

  return cert.domains
    .map((d) => {
      const ids = pools.get(d.id) ?? [];
      let seen = 0;
      let attempts = 0;
      let correct = 0;
      for (const id of ids) {
        const s = data.perQ[id];
        if (!s || s.timesSeen === 0) continue;
        seen++;
        attempts += s.timesSeen;
        correct += s.timesRight;
      }
      const accuracy = attempts === 0 ? null : correct / attempts;
      const weight = parseDomainWeight(d.weight ?? '');
      // Fall back to the domain's share of the bank when no weight is published,
      // so a cert without a blueprint still sorts sensibly.
      const share = weight ?? (ids.length / Math.max(1, QUIZ_INDEX.length));
      const shortfall = accuracy === null ? 0.5 : Math.max(0, 1 - accuracy);

      return {
        id: d.id,
        name: d.name,
        weight,
        pool: ids.length,
        seen,
        attempts,
        correct,
        accuracy,
        risk: shortfall * share,
      };
    })
    .sort((a, b) => b.risk - a.risk);
}
