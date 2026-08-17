/**
 * Dojo 3 grades the assistant's governance artifact, so this module's output is
 * what the learner's score comes from. Two properties matter: a real brief must
 * produce an artifact that earns its marks, and a brief with nothing in it must
 * not.
 */
import { describe, it, expect } from 'vitest';
import { generateDojo3Analysis, classify, extractBriefFacts } from '@/lib/dojo3-simulation';
import { DOJO3_QUALITY_CHECKS } from '@/lib/quality-rubrics';
import type { Dojo3Config } from '@/types';

const CONFIG: Dojo3Config = {
  frameworkLens: 'all',
  riskTier: 'unset',
  vendorGapAreas: [],
  selectedClauses: [],
};

const HIRING_BRIEF = `We are deploying an AI CV-screening system for recruitment across our EU
and UK offices. It ranks job applicants automatically and rejects the bottom 40% without human
review. It processes personal data from applicants including name, email, employment history and
education. The model is a fine-tuned foundation model from a third-party vendor Anthropic, hosted
in the US, and we retrain it monthly on our own hiring outcomes. Recruiters see only the shortlist.`;

const CHATBOT_BRIEF = `We are launching a customer service chatbot on our retail website. It answers
questions about orders and returns using a RAG pipeline over our public help centre articles. It
does not make decisions about customers and a human agent is always reachable. It processes the
customer name and order number to look up order status.`;

describe('EU AI Act classification', () => {
  it('places automated CV screening in Annex III high-risk', () => {
    const c = classify(HIRING_BRIEF, CONFIG);
    expect(c.tier).toBe('High-Risk');
    expect(c.basis).toMatch(/Annex III §4/);
  });

  // Annex III §4 is about what a system does to people at work. Briefs list
  // employment, promotions and contract termination as data fields and
  // commercial facts all the time, and matching those bare words sent a
  // consumer credit-scoring system to the employment category — the right tier
  // for the wrong reason, which is the failure that matters here because the
  // obligations hang off the basis.
  it('does not read "employment tenure" as an employment system', () => {
    const lending = `We score personal loan applications and decline automatically below a
    threshold. Input features include income, employment tenure, existing debt obligations and
    address history. Deployed across the EU and the UK for roughly 40,000 applications a month.`;
    const c = classify(lending, CONFIG);
    expect(c.tier).toBe('High-Risk');
    expect(c.basis).toMatch(/Annex III §5/);
  });

  it('does not read a marketing tool as an employment system', () => {
    const marketing = `We generate content for campaign landing pages and seasonal promotions.
    Every draft is reviewed by a named marketer before publication. Deployed in the EU. No
    customer personal data reaches the model.`;
    const c = classify(marketing, CONFIG);
    expect(c.basis).not.toMatch(/Annex III §4/);
  });

  it('does not read contract termination as employment termination', () => {
    const vendorTerms = `We are assessing a document classification supplier. Their contract
    states data is deleted within a reasonable period after termination. Deployed in the EU. The
    system routes inbound documents to teams and takes no decision about any individual.`;
    const c = classify(vendorTerms, CONFIG);
    expect(c.basis).not.toMatch(/Annex III §4/);
  });

  it('still catches a system that ranks staff', () => {
    // Tightening the pattern must not open a hole under the category it guards.
    const workforce = `We are deploying a system that will rank employees for promotion decisions
    using performance review text and output a recommended shortlist. Deployed in the EU.`;
    const c = classify(workforce, CONFIG);
    expect(c.tier).toBe('High-Risk');
    expect(c.basis).toMatch(/Annex III §4/);
  });

  it('places a customer chatbot in limited risk under Art. 50', () => {
    const c = classify(CHATBOT_BRIEF, CONFIG);
    expect(c.tier).toBe('Limited Risk');
    expect(c.basis).toMatch(/Art\. 50/);
  });

  it('catches Article 5 prohibited practices ahead of Annex III', () => {
    const c = classify('A social scoring system for citizens run by the municipality.', CONFIG);
    expect(c.tier).toBe('Prohibited');
    expect(c.basis).toMatch(/Art\. 5/);
  });

  it('says stop rather than proposing controls for a prohibited practice', () => {
    const out = generateDojo3Analysis(
      'We plan real-time biometric surveillance of shoppers in public areas for law enforcement.',
      'ai-risk-classification',
      CONFIG,
    );
    expect(out).toMatch(/prohibited/i);
    expect(out).toMatch(/cannot be placed on the market|stop, not/i);
  });

  it('contradicts the control panel when the brief says otherwise', () => {
    // A governance tool that echoes the analyst's assumption back cannot catch
    // the misclassification the scenario is about.
    const out = generateDojo3Analysis(HIRING_BRIEF, 'ai-risk-classification', {
      ...CONFIG,
      riskTier: 'minimal',
    });
    expect(out).toMatch(/control panel is set to "minimal"/i);
    expect(out).toMatch(/brief governs/i);
  });
});

describe('brief fact extraction', () => {
  const f = extractBriefFacts(HIRING_BRIEF);
  it('detects personal data and automated decisions', () => {
    expect(f.personalData).toBe(true);
    expect(f.automatedDecision).toBe(true);
  });
  it('picks up the jurisdictions in play', () => {
    expect(f.jurisdictions).toContain('EU');
    expect(f.jurisdictions).toContain('UK');
  });
});

describe('framework lens changes the artifact', () => {
  it('drops the NIST section when the lens is EU only', () => {
    const eu = generateDojo3Analysis(HIRING_BRIEF, 'ai-risk-classification', { ...CONFIG, frameworkLens: 'eu' });
    expect(eu).not.toMatch(/### NIST AI RMF profile/);
  });
  it('drops the ISO section when the lens is NIST only', () => {
    const nist = generateDojo3Analysis(HIRING_BRIEF, 'ai-risk-classification', { ...CONFIG, frameworkLens: 'nist' });
    expect(nist).not.toMatch(/### ISO\/IEC 42001 mapping/);
    expect(nist).toMatch(/### NIST AI RMF profile/);
  });
});

describe('every Dojo 3 scenario earns its rubric on a real brief', () => {
  // The brief is chosen to suit the scenario so the test measures the
  // generator rather than a mismatch between brief and task.
  const BRIEF_FOR: Record<string, string> = {
    'ai-bias-audit': HIRING_BRIEF,
    'ai-privacy-impact': HIRING_BRIEF,
    'ai-procurement-assessment': HIRING_BRIEF,
    'third-party-vendor-review': HIRING_BRIEF,
    'ai-supply-chain-risk': HIRING_BRIEF,
  };

  for (const scenarioId of Object.keys(DOJO3_QUALITY_CHECKS)) {
    it(scenarioId, () => {
      const brief = BRIEF_FOR[scenarioId] ?? HIRING_BRIEF;
      const out = generateDojo3Analysis(brief, scenarioId, CONFIG);
      const checks = DOJO3_QUALITY_CHECKS[scenarioId];
      const missing = checks.filter((c) => !c.re.test(out)).map((c) => c.label);
      expect(missing, `${scenarioId} missing: ${missing.join(' | ')}`).toEqual([]);
    });
  }
});

describe('a task instruction is not a deployment brief', () => {
  // The control panel sends prompts like this. They ask for an artifact; they
  // do not describe a system.
  const PANEL_PROMPT =
    'Draft the Intended Use section of a model card: describe the primary use case, the target users, and explicitly state out-of-scope uses where the model should NOT be applied.';

  it('asserts no risk tier when no system was described', () => {
    const out = generateDojo3Analysis(PANEL_PROMPT, 'ai-model-transparency', CONFIG);
    // Claiming "Minimal Risk" here would be a fabricated classification of a
    // system that was never described.
    expect(out).not.toMatch(/EU AI Act risk tier:/);
    expect(out).toMatch(/no risk tier is asserted/i);
    expect(out).toMatch(/Risk Level.*Not assessed/i);
  });

  it('leads with the artifact that was actually requested', () => {
    const out = generateDojo3Analysis(PANEL_PROMPT, 'ai-model-transparency', CONFIG);
    const modelCard = out.indexOf('### Model card');
    const nist = out.indexOf('### NIST AI RMF profile');
    expect(modelCard).toBeGreaterThan(-1);
    expect(modelCard).toBeLessThan(nist);
  });

  it('still classifies when the brief does describe a system', () => {
    const out = generateDojo3Analysis(HIRING_BRIEF, 'ai-model-transparency', CONFIG);
    expect(out).toMatch(/EU AI Act risk tier: High-Risk/);
  });
});

describe('it refuses to classify nothing', () => {
  const THIN = 'We want to use AI. Thoughts?';

  it('asks for the brief instead of inventing a classification', () => {
    const out = generateDojo3Analysis(THIN, 'ai-risk-classification', CONFIG);
    expect(out).toMatch(/cannot classify/i);
    expect(out).not.toMatch(/Annex III/);
  });

  it('does not earn the rubric on an empty brief', () => {
    for (const scenarioId of ['ai-risk-classification', 'ai-bias-audit', 'iso42001-gap-analysis']) {
      const out = generateDojo3Analysis(THIN, scenarioId, CONFIG);
      const checks = DOJO3_QUALITY_CHECKS[scenarioId] ?? [];
      const met = checks.filter((c) => c.re.test(out)).length;
      expect(met / checks.length, scenarioId).toBeLessThan(0.5);
    }
  });
});
