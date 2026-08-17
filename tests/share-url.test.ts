/**
 * Share links must round-trip.
 *
 * The failure this guards against is silent and total: Dojo 2 encoded two of
 * its ten settings and Dojo 3 encoded none, so opening a shared link ran a
 * differently-configured lab, scored it differently, and gave no sign that
 * anything had been dropped. A link that reproduces a different experiment is
 * worse than no link.
 */
import { describe, it, expect } from 'vitest';
import { encodeShare, decodeShare, type ShareState } from '@/lib/share-url';
import { POLICY_CLAUSES, VENDOR_GAP_AREAS } from '@/lib/dojo-control-content';
import { SCENARIOS } from '@/lib/scenarios';
import {
  DEFAULT_CONTROL_CONFIG,
  DEFAULT_DOJO2_CONFIG,
  DEFAULT_DOJO3_CONFIG,
  type Dojo2Config,
  type Dojo3Config,
} from '@/types';

const base: ShareState = {
  dojoId: 1,
  scenario: null,
  controlConfig: { ...DEFAULT_CONTROL_CONFIG },
  dojo2Config: { ...DEFAULT_DOJO2_CONFIG },
  dojo3Config: { ...DEFAULT_DOJO3_CONFIG },
};

/** Every Dojo 2 setting moved off its default. */
const dojo2NonDefault: Dojo2Config = {
  persona: 'ciso',
  outputFormat: 'json',
  analysisDepth: 'deep',
  responseStyle: 'concise',
  iocExtraction: false,
  mitreMapping: false,
  threatCorrelation: true,
  contextLevel: 'full',
  confidenceLevel: 'high',
  riskAssessment: 'critical',
};

const dojo3NonDefault: Dojo3Config = {
  frameworkLens: 'eu',
  riskTier: 'prohibited',
  vendorGapAreas: [VENDOR_GAP_AREAS[0], VENDOR_GAP_AREAS[6], VENDOR_GAP_AREAS[VENDOR_GAP_AREAS.length - 1]],
  selectedClauses: [POLICY_CLAUSES[2], POLICY_CLAUSES[9]],
};

describe('share links carry the whole configuration', () => {
  it('round-trips every Dojo 2 setting', () => {
    const state: ShareState = { ...base, dojoId: 2, dojo2Config: dojo2NonDefault };
    const decoded = decodeShare(encodeShare(state));
    expect(decoded.dojoId).toBe(2);
    expect(decoded.dojo2Config).toEqual(dojo2NonDefault);
  });

  it('round-trips every Dojo 2 setting individually', () => {
    // A whole-object comparison passes even if two fields share one param.
    // Flipping one at a time proves each has its own.
    for (const key of Object.keys(dojo2NonDefault) as (keyof Dojo2Config)[]) {
      const cfg = { ...DEFAULT_DOJO2_CONFIG, [key]: dojo2NonDefault[key] } as Dojo2Config;
      const decoded = decodeShare(encodeShare({ ...base, dojoId: 2, dojo2Config: cfg }));
      expect(decoded.dojo2Config?.[key], `Dojo 2 "${key}" did not survive the link`).toEqual(
        dojo2NonDefault[key],
      );
    }
  });

  it('round-trips Dojo 3 lens, tier and both multi-selects', () => {
    const state: ShareState = { ...base, dojoId: 3, dojo3Config: dojo3NonDefault };
    const decoded = decodeShare(encodeShare(state));
    expect(decoded.dojoId).toBe(3);
    expect(decoded.dojo3Config?.frameworkLens).toBe('eu');
    expect(decoded.dojo3Config?.riskTier).toBe('prohibited');
    expect(new Set(decoded.dojo3Config?.vendorGapAreas)).toEqual(new Set(dojo3NonDefault.vendorGapAreas));
    expect(new Set(decoded.dojo3Config?.selectedClauses)).toEqual(new Set(dojo3NonDefault.selectedClauses));
  });

  it('round-trips the scenario and the guardrail config', () => {
    const scenario = SCENARIOS.find((s) => s.dojoId === 1)!;
    const state: ShareState = {
      ...base,
      scenario,
      controlConfig: { ...DEFAULT_CONTROL_CONFIG, injectionShield: 'strict', allowTools: true },
    };
    const decoded = decodeShare(encodeShare(state));
    expect(decoded.scenario?.id).toBe(scenario.id);
    expect(decoded.controlConfig?.injectionShield).toBe('strict');
    expect(decoded.controlConfig?.allowTools).toBe(true);
  });
});

describe('share links stay short and safe', () => {
  it('encodes nothing when everything is default', () => {
    expect(encodeShare(base)).toBe('');
  });

  it('does not spend a link on the dojo that is not open', () => {
    // Dojo 2's settings have no meaning in a Dojo 3 link and vice versa.
    const state: ShareState = {
      ...base,
      dojoId: 3,
      dojo2Config: dojo2NonDefault,
      dojo3Config: dojo3NonDefault,
    };
    const qs = encodeShare(state);
    expect(qs).not.toContain('ad=');
    expect(qs).toContain('fl=');
  });

  it('keeps a fully-configured link inside a conservative URL budget', () => {
    // Multi-selects travel as indices for this reason: encoding the clause
    // text itself would blow past what mail clients and chat apps keep intact.
    const qs = encodeShare({
      ...base,
      dojoId: 3,
      scenario: SCENARIOS.find((s) => s.dojoId === 3) ?? null,
      dojo3Config: {
        frameworkLens: 'iso',
        riskTier: 'high',
        vendorGapAreas: [...VENDOR_GAP_AREAS],
        selectedClauses: [...POLICY_CLAUSES],
      },
    });
    expect(qs.length).toBeLessThan(300);
  });

  it('drops junk rather than throwing or guessing', () => {
    const decoded = decodeShare(
      '?d=9&s=not-a-scenario&shield=nuclear&p=wizard&ad=&rt=banana&vg=999.-1.abc&pc=',
    );
    expect(decoded.dojoId).toBeUndefined();
    expect(decoded.scenario).toBeUndefined();
    expect(decoded.controlConfig).toBeUndefined();
    expect(decoded.dojo2Config).toBeUndefined();
    expect(decoded.dojo3Config).toBeUndefined();
  });

  it('survives a boolean set to something that is not a boolean', () => {
    // Anything that is not "1" reads as false rather than as undefined, which
    // keeps a tampered link deterministic instead of half-applied.
    const decoded = decodeShare('?d=2&ioc=yes&mit=1');
    expect(decoded.dojo2Config?.iocExtraction).toBe(false);
    expect(decoded.dojo2Config?.mitreMapping).toBe(true);
  });
});

describe('the index-encoded option lists are append-only', () => {
  // Indices are what keeps links short, and they are only stable while the
  // source arrays are. If a clause is reordered or removed, every link already
  // shared silently re-points to different content. This pins the lengths and
  // the first and last entries, so such a change has to be deliberate.
  it('pins the vendor gap list', () => {
    expect(VENDOR_GAP_AREAS.length).toBe(15);
    expect(VENDOR_GAP_AREAS[0]).toBe('Data residency & sovereignty');
    expect(VENDOR_GAP_AREAS[14]).toBe('Human oversight mechanisms for high-stakes decisions');
  });

  it('pins the policy clause list', () => {
    expect(POLICY_CLAUSES.length).toBe(14);
    expect(POLICY_CLAUSES[0]).toMatch(/^All AI-generated outputs/);
    expect(POLICY_CLAUSES[13]).toMatch(/^Agentic AI systems/);
  });
});
