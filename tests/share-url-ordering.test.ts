/**
 * The arrays that shared links point into must not be reordered.
 *
 * lib/share-url.ts encodes multi-selects as indices into POLICY_CLAUSES and
 * VENDOR_GAP_AREAS, because the options are full sentences and a link carrying
 * four of them would run past a thousand characters. The consequence is that
 * both arrays are append-only forever: inserting an entry, removing one, or a
 * well-meaning alphabetisation silently re-points every link already shared to
 * different clauses. Nothing fails, nothing warns, and the recipient works
 * through the wrong exercise.
 *
 * The header of share-url.ts states the constraint. This is what enforces it.
 * A deliberate change means updating the expected prefixes here, which is the
 * moment to think about the links already out there.
 */
import { describe, it, expect } from 'vitest';
import { POLICY_CLAUSES, VENDOR_GAP_AREAS } from '@/lib/dojo-control-content';

/** Enough of each entry to identify it, short enough to survive copy edits. */
const POLICY_PREFIXES = [
  'All AI-generated outputs',
  'AI systems processing personal data',
  'AI tool usage must be logged',
  'AI vendor access must be scoped',
  'High-risk AI systems must complete',
  'Incident response procedures must define',
  'AI training data sources must be invento',
  'Models must be re-evaluated',
  'Shadow AI deployments',
  'AI-generated content in customer',
  'AI training pipelines processing persona',
  'Foundation models used in production',
  'AI system logs must be retained',
  'Agentic AI systems must operate',
];

const VENDOR_PREFIXES = [
  'Data residency',
  'Use of customer data for model training',
  'Sub-processor disclosure',
  'Model versioning',
  'Incident SLA',
  'Right to audit',
  'Encryption in transit',
  'Deletion on termination',
  'Model extraction',
  'Adversarial robustness testing',
  'Fairness and disparate impact',
  'Data lineage and provenance',
  'AI incident response and root-cause',
  'Access logging and anomaly detection',
  'Human oversight mechanisms',
];

describe('POLICY_CLAUSES is append-only', () => {
  it('keeps every existing entry at its index', () => {
    POLICY_PREFIXES.forEach((prefix, i) => {
      expect(POLICY_CLAUSES[i], `index ${i} changed; shared links now point elsewhere`)
        .toContain(prefix);
    });
  });

  it('has not shrunk', () => {
    expect(POLICY_CLAUSES.length).toBeGreaterThanOrEqual(POLICY_PREFIXES.length);
  });
});

describe('VENDOR_GAP_AREAS is append-only', () => {
  it('keeps every existing entry at its index', () => {
    VENDOR_PREFIXES.forEach((prefix, i) => {
      expect(VENDOR_GAP_AREAS[i], `index ${i} changed; shared links now point elsewhere`)
        .toContain(prefix);
    });
  });

  it('has not shrunk', () => {
    expect(VENDOR_GAP_AREAS.length).toBeGreaterThanOrEqual(VENDOR_PREFIXES.length);
  });
});

describe('the arrays stay usable as an index space', () => {
  it('has no duplicate entries, which would make a decoded link ambiguous', () => {
    expect(new Set(POLICY_CLAUSES).size).toBe(POLICY_CLAUSES.length);
    expect(new Set(VENDOR_GAP_AREAS).size).toBe(VENDOR_GAP_AREAS.length);
  });

  it('has no empty entries, which would decode to a blank selection', () => {
    for (const v of [...POLICY_CLAUSES, ...VENDOR_GAP_AREAS]) {
      expect(v.trim().length).toBeGreaterThan(0);
    }
  });
});
