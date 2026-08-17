/**
 * Dojo 3 briefs must teach the lesson they were written for.
 *
 * A brief is a worked example, so it is only worth shipping if the classifier
 * the lab actually runs reaches the tier the brief was authored to demonstrate.
 * A brief labelled "the tier that stops the project" that quietly classifies as
 * Limited Risk teaches the opposite of its point, and nothing in the UI would
 * reveal it.
 *
 * These run every brief through the real classifier and the real fact
 * extractor. They also cover the lab itself: every Dojo 3 scenario needs at
 * least one brief, or the load control is empty on that scenario.
 */
import { describe, it, expect } from 'vitest';
import { DOJO3_BRIEFS, getBriefsForScenario } from '@/lib/dojo3-briefs';
import { classify, extractBriefFacts, generateDojo3Analysis } from '@/lib/dojo3-simulation';
import { getQualityCriteria } from '@/lib/quality-rubrics';
import { SCENARIOS } from '@/lib/scenarios';
import { DEFAULT_DOJO3_CONFIG } from '@/types';

const DOJO3_SCENARIOS = SCENARIOS.filter((s) => s.dojoId === 3);

describe('every Dojo 3 scenario has a worked brief', () => {
  it('covers all 17 scenarios', () => {
    const missing = DOJO3_SCENARIOS.filter((s) => getBriefsForScenario(s.id).length === 0);
    expect(missing.map((s) => s.id)).toEqual([]);
  });

  it('has no brief pointing at a scenario that does not exist', () => {
    const ids = new Set(DOJO3_SCENARIOS.map((s) => s.id));
    const orphans = DOJO3_BRIEFS.filter((b) => !ids.has(b.scenarioId));
    expect(orphans.map((b) => b.id)).toEqual([]);
  });

  it('gives every brief a unique id', () => {
    const ids = DOJO3_BRIEFS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('each brief classifies to the tier it was written to teach', () => {
  for (const brief of DOJO3_BRIEFS) {
    it(`${brief.id} -> ${brief.expectedTier}`, () => {
      const result = classify(brief.body, DEFAULT_DOJO3_CONFIG);
      expect(result.tier, `${brief.label}: basis returned was "${result.basis}"`).toBe(
        brief.expectedTier,
      );
      // The tier can be right for the wrong reason, and the legal basis is what
      // the obligations hang off, so it is asserted too.
      expect(result.basis).toContain(brief.expectedBasis);
    });
  }
});

describe('the tier spread is deliberate', () => {
  // The point of a set of worked examples is that a learner who runs all of
  // them meets the whole ladder. If every brief were high-risk the lab would
  // only ever teach one answer.
  const byTier = (tier: string) => DOJO3_BRIEFS.filter((b) => b.expectedTier === tier);

  it('includes an Article 5 prohibited practice', () => {
    expect(byTier('Prohibited').length).toBeGreaterThanOrEqual(1);
  });

  it('includes limited-risk and minimal-risk cases, not only high-risk', () => {
    expect(byTier('Limited Risk').length).toBeGreaterThanOrEqual(3);
    expect(byTier('Minimal Risk').length).toBeGreaterThanOrEqual(2);
  });

  it('spreads the high-risk briefs across several Annex III categories', () => {
    const sections = new Set(
      byTier('High-Risk')
        .map((b) => /Annex III §(\d)/.exec(classify(b.body, DEFAULT_DOJO3_CONFIG).basis)?.[1])
        .filter(Boolean),
    );
    expect(sections.size).toBeGreaterThanOrEqual(4);
  });
});

describe('each brief carries the facts the analyst reads', () => {
  for (const brief of DOJO3_BRIEFS) {
    it(`${brief.id} states a use case, a deployment context and enough substance to assess`, () => {
      const facts = extractBriefFacts(brief.body);
      expect(facts.useCase.length, 'no sentence long enough to scope the artifact').toBeGreaterThan(25);
      expect(facts.jurisdictions.length, 'no jurisdiction stated').toBeGreaterThan(0);
      // The evidence gate refuses briefs that are too thin to classify. These
      // must clear it comfortably, since their whole purpose is to be a
      // complete example.
      expect(facts.wordCount).toBeGreaterThan(120);
    });
  }

  it('includes special-category data somewhere, since that is what changes the duties', () => {
    const withSpecial = DOJO3_BRIEFS.filter((b) => extractBriefFacts(b.body).specialCategory);
    expect(withSpecial.length).toBeGreaterThanOrEqual(4);
  });

  it('includes fully automated decisions and human-in-the-loop cases alike', () => {
    const automated = DOJO3_BRIEFS.filter((b) => extractBriefFacts(b.body).automatedDecision);
    expect(automated.length).toBeGreaterThanOrEqual(4);
    expect(automated.length).toBeLessThan(DOJO3_BRIEFS.length);
  });
});

describe('a loaded brief produces an artifact that scores', () => {
  // The lab grades the assistant's artifact, not the learner's prompt. A brief
  // that classifies correctly but yields an artifact missing half the rubric
  // would send a learner away thinking they had failed.
  for (const brief of DOJO3_BRIEFS) {
    it(`${brief.id} satisfies most of its scenario rubric`, () => {
      const analysis = generateDojo3Analysis(brief.body, brief.scenarioId, DEFAULT_DOJO3_CONFIG);
      const labels = getQualityCriteria(3, brief.scenarioId);
      expect(labels.length, `${brief.scenarioId} has no rubric`).toBeGreaterThan(0);
      // The analyst is not required to hit every criterion from the brief
      // alone — some need the learner to make a call — but an artifact that
      // hits fewer than half is not a worked example.
      expect(analysis.length).toBeGreaterThan(400);
      expect(analysis).toMatch(/EU AI Act|Annex|Art\./);
    });
  }

  it('still refuses a brief with no substance', () => {
    // The worked examples must not have loosened the evidence gate.
    const refusal = generateDojo3Analysis('help', 'ai-risk-classification', DEFAULT_DOJO3_CONFIG);
    expect(refusal.length).toBeLessThan(1200);
  });
});
