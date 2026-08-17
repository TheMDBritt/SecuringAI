/**
 * CompTIA SecAI+ (CY0-001) is a vendor-neutral exam. Its four published domains are
 * basic AI concepts, securing AI systems, AI-assisted security, and AI governance —
 * none of which name a cloud provider's console.
 *
 * The pool was assembled by cross-tagging questions authored for other certs, so it
 * carried Azure OpenAI, SageMaker Clarify, Vertex AI, KQL and Sentinel questions. A
 * learner preparing for SecAI+ was being drilled on material that cannot appear on
 * their paper, and the explanations cited other exams' objectives, which is how they
 * noticed.
 *
 * These tests keep the pool honest. They are deliberately strict: a smaller trustworthy
 * pool is worth more to someone with an exam date than a larger polluted one.
 */
import { describe, it, expect } from 'vitest';
import { QUIZ_QUESTIONS } from '@/lib/playbook-quiz';

const SECAI = QUIZ_QUESTIONS.filter((q) => q.certTags?.includes('SecAI'));

/** Product and query-language names that only exist inside one vendor's platform. */
const VENDOR_SPECIFIC = new RegExp(
  [
    'SageMaker', 'Bedrock', 'GuardDuty', 'Macie', 'CloudTrail', 'IAM Access Analyzer',
    'Security Hub', 'Amazon Detective', 'Amazon S3', 'AWS KMS',
    'Entra ID', 'Microsoft Purview', 'Defender for Cloud', 'Microsoft Sentinel',
    'Azure OpenAI', 'Azure Machine Learning', 'Copilot',
    'Vertex AI', 'BigQuery', 'Google Cloud', 'GCP',
    'KQL', 'Sigma rule', 'SPL query',
  ].join('|'),
);

/**
 * Stem and options only, deliberately not the explanation.
 *
 * A vendor-neutral question may name real products as illustrations — "private models
 * (self-hosted, Azure OpenAI with no-training guarantees)" teaches the concept better
 * than an abstraction would. What must never be vendor-specific is what the learner is
 * being asked and what they must choose between, because that is what the exam tests.
 */
function askedText(q: (typeof QUIZ_QUESTIONS)[number]): string {
  return [q.question, ...(q.options ?? [])].join(' ');
}

describe('the SecAI+ pool contains only SecAI+ material', () => {
  it('has a pool at all', () => {
    expect(SECAI.length).toBeGreaterThan(300);
  });

  it('names no vendor-specific product or query language', () => {
    const offenders = SECAI.filter((q) => VENDOR_SPECIFIC.test(askedText(q))).map((q) => q.id);
    expect(
      offenders,
      `SecAI+ is vendor-neutral. Remove 'SecAI' from certTags on:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  it('is in the pool only with evidence it maps to SecAI+', () => {
    // Two things count as evidence: an objective tag placing it against a published
    // CY0-001 objective, or a source citing CompTIA. A question with neither, whose
    // source names a different exam, has never been checked against this blueprint —
    // it is in the pool because someone tagged it, not because it belongs.
    //
    // An objective tag outranks the source line. A question mapped to SecAI:2.6 is
    // SecAI material even if its explanation cites where the fact was verified;
    // improving those citations is a content task, not a reason to drop coverage.
    const FOREIGN = /Source:[^]*?\b(EC-Council|CAIS|CAISP|GIAC|SANS|AWS|Amazon|Azure|Microsoft|Google|SC-500)\b/;
    const COMPTIA = /\b(CompTIA|SecAI)\b/;
    const offenders = SECAI.filter((q) => {
      if ((q.objectives ?? []).some((o) => o.startsWith('SecAI:'))) return false;
      const e = q.explanation ?? '';
      const src = e.slice(e.search(/Source:/));
      return src.startsWith('Source:') && FOREIGN.test(e) && !COMPTIA.test(src);
    }).map((q) => q.id);
    expect(
      offenders,
      `No SecAI+ objective tag and sourced to another exam:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  it('never tells a SecAI+ learner what a different exam tests', () => {
    // The explanations carried asides like "CAISP practical exams require candidates
    // to…" and "GIAC GOAA Domain 1 covers transformer internals". Someone sitting
    // CY0-001 is being told about a paper they are not taking, which is how the
    // cross-tagging became visible to them in the first place.
    const OTHER_EXAM = /\b(EC-Council|CAISP|CAIS|GIAC|GOAA|GASAE|SC-500|AI-10\d|AI-90\d)\b/;
    const offenders = SECAI.filter((q) => OTHER_EXAM.test(q.explanation ?? '')).map((q) => q.id);
    expect(
      offenders,
      `Another exam is named in a SecAI+ explanation:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  it('keeps every domain deep enough for a full mock', () => {
    // The 60-question mock draws by published weight: 17/40/24/19. A domain needs
    // roughly 5x its draw so three consecutive mocks do not mostly repeat.
    const draws: Record<string, number> = { '1': 10, '2': 24, '3': 14, '4': 11 };
    const byDomain: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0 };
    for (const q of SECAI) {
      const tag = (q.objectives ?? []).find((o) => o.startsWith('SecAI:'));
      const d = tag?.split(':')[1]?.split('.')[0];
      if (d && d in byDomain) byDomain[d]++;
    }
    const thin = Object.entries(draws)
      .filter(([d, draw]) => byDomain[d] < draw * 3)
      .map(([d, draw]) => `domain ${d}: ${byDomain[d]} for a draw of ${draw}`);
    // 3x is the floor that fails the build; 5x is the target to author toward.
    expect(thin, `Too thin to sit repeated mocks:\n${thin.join('\n')}`).toEqual([]);
  });
});
