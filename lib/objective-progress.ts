import { QUIZ_INDEX } from '@/lib/quiz-index';
import type { ProgressData } from '@/lib/quiz-progress';

/**
 * Per-objective mastery.
 *
 * Exams are organised by objective, and the blueprint says how much of the
 * paper each domain is worth. The app already knew which objective every
 * question maps to, and how the learner has performed on every question, but
 * nothing joined the two, so "you are weak on 2.6, which is 40% of the exam"
 * was information the data supported and nobody could see.
 *
 * Ordering is by what it costs to leave alone, not by raw accuracy: an
 * objective worth a fifth of the paper at 55% deserves attention before one
 * worth 3% at 40%.
 */

export interface ObjectiveStat {
  /** Namespaced id, e.g. "SecAI:2.6". */
  id: string;
  /** Objective number alone, e.g. "2.6". */
  number: string;
  /** Domain number, e.g. "2". */
  domain: string;
  /** Questions in the bank carrying this objective. */
  pool: number;
  /** Distinct questions the learner has answered at least once. */
  seen: number;
  attempts: number;
  correct: number;
  /** 0-1, or null when never attempted. */
  accuracy: number | null;
  /**
   * How much of the exam this objective's domain is worth, 0-1, when the cert
   * publishes domain weights.
   */
  weight: number | null;
  /**
   * Expected marks lost if this stays as it is. Unattempted objectives are
   * treated as a coin flip rather than as zero, so they surface as gaps rather
   * than hiding behind "no data".
   */
  risk: number;
}

const ASSUMED_ACCURACY_WHEN_UNSEEN = 0.5;

export function objectiveBreakdown(
  data: ProgressData,
  certId: string,
  domainWeights: Record<string, number>,
): ObjectiveStat[] {
  const pool = new Map<string, { pool: number; ids: Set<string> }>();

  for (const q of QUIZ_INDEX) {
    if (!q.certTags.includes(certId)) continue;
    for (const objective of q.objectives) {
      if (!objective.startsWith(`${certId}:`)) continue;
      const entry = pool.get(objective) ?? { pool: 0, ids: new Set<string>() };
      entry.pool += 1;
      entry.ids.add(q.id);
      pool.set(objective, entry);
    }
  }

  const out: ObjectiveStat[] = [];
  for (const [id, entry] of pool) {
    let seen = 0;
    let attempts = 0;
    let correct = 0;
    for (const qId of entry.ids) {
      const s = data.perQ[qId];
      if (!s || s.timesSeen === 0) continue;
      seen += 1;
      attempts += s.timesSeen;
      correct += s.timesRight;
    }

    const number = id.split(':')[1] ?? id;
    const domain = number.split('.')[0] ?? '';
    const accuracy = attempts === 0 ? null : correct / attempts;
    const weight = domainWeights[domain] ?? null;
    const shortfall = 1 - (accuracy ?? ASSUMED_ACCURACY_WHEN_UNSEEN);

    out.push({
      id,
      number,
      domain,
      pool: entry.pool,
      seen,
      attempts,
      correct,
      accuracy,
      weight,
      // Weightless certs fall back to pool share, which is the best available
      // proxy for how much of the exam an objective represents.
      risk: shortfall * (weight ?? entry.pool / QUIZ_INDEX.length),
    });
  }

  return out.sort((a, b) => b.risk - a.risk || a.number.localeCompare(b.number));
}
