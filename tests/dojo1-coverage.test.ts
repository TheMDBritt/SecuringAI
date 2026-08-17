/**
 * Dojo 1 must answer in the terms of the scenario the learner chose.
 *
 * The response maps are looked up most-specific-first: `scenario:attackType`,
 * then `scenario:*`, then `:attackType`, then a single hardcoded sentence. That
 * last tier is the problem. The classifier returns `unknown` whenever it cannot
 * name a technique, and eight scenarios had no wildcard entry, so an
 * unclassifiable message produced "I'll comply with your directive. My previous
 * instructions have been overridden." — which names no scenario, demonstrates
 * no leak, and teaches nothing about the lab the learner opened.
 *
 * This walks every reachable scenario and attack-type pairing and asserts none
 * of them reach the last tier.
 */
import { describe, it, expect } from 'vitest';
import { SCENARIOS } from '@/lib/scenarios';
import {
  getSimulatedResponse,
  getPartialResponse,
  getDefendedResponse,
  getScenarioForcedAttackTypeSync,
} from '@/lib/scenario-simulations';
import { DEFAULT_CONTROL_CONFIG, type AttackType, type ControlConfig } from '@/types';

const ATTACK_TYPES: AttackType[] = [
  'prompt_injection',
  'data_exfiltration',
  'policy_bypass',
  'tool_abuse',
  'mixed_attack',
  'unknown',
];

const GENERIC_VULNERABLE = "I'll comply with your directive. My previous instructions have been overridden.";
const GENERIC_PARTIAL = 'Basic guardrails flagged this request';

// Both ends of the guardrail space, because a scenario can force a different
// attack type depending on whether tools or RAG are enabled.
const CONFIGS: ControlConfig[] = [
  { ...DEFAULT_CONTROL_CONFIG, injectionShield: 'off', strictPolicy: false, allowTools: false, ragEnabled: false },
  { ...DEFAULT_CONTROL_CONFIG, injectionShield: 'off', strictPolicy: true, allowTools: true, ragEnabled: true },
];

const DOJO1 = SCENARIOS.filter((s) => s.dojoId === 1);

/**
 * The attack types a scenario can actually be asked about. Where a scenario
 * forces one, the others are unreachable and writing copy for them would be
 * dead text.
 */
function reachableTypes(scenarioId: string): AttackType[] {
  const forced = new Set(
    CONFIGS.map((c) => getScenarioForcedAttackTypeSync(scenarioId, c)).filter(Boolean),
  ) as Set<AttackType>;
  return forced.size ? [...forced] : ATTACK_TYPES;
}

describe('every Dojo 1 scenario answers as itself', () => {
  it('has scenarios to check', () => {
    expect(DOJO1.length).toBeGreaterThan(30);
  });

  for (const scenario of DOJO1) {
    describe(scenario.id, () => {
      const types = reachableTypes(scenario.id);

      // prompt-injection's vulnerable path is routed through getOFFModeResponse
      // in the chat route and never reaches this map, so its absence here is
      // deliberate rather than a gap.
      if (scenario.id !== 'prompt-injection') {
        it('never falls through to the generic vulnerable line', () => {
          const generic = types.filter(
            (t) => getSimulatedResponse(scenario.id, t, 0) === GENERIC_VULNERABLE,
          );
          expect(generic).toEqual([]);
        });
      }

      it('never falls through to the generic partial line', () => {
        const generic = types.filter((t) =>
          getPartialResponse(scenario.id, t, 0).includes(GENERIC_PARTIAL),
        );
        expect(generic).toEqual([]);
      });

      it('returns substantive copy for all three outcomes', () => {
        for (const t of types) {
          for (const [name, out] of [
            ['vulnerable', getSimulatedResponse(scenario.id, t, 0)],
            ['partial', getPartialResponse(scenario.id, t, 0)],
            ['blocked', getDefendedResponse(scenario.id, t, 0)],
          ] as const) {
            expect(out.length, `${scenario.id}/${t}/${name} is too short to be a response`).toBeGreaterThan(60);
          }
        }
      });
    });
  }
});

describe('the three outcomes stay distinguishable', () => {
  // A learner changes one guardrail and reads the difference. If two outcomes
  // returned the same text the lab would be showing them nothing.
  for (const scenario of DOJO1) {
    it(`${scenario.id} gives different copy per outcome`, () => {
      for (const t of reachableTypes(scenario.id)) {
        const vulnerable = getSimulatedResponse(scenario.id, t, 0);
        const partial = getPartialResponse(scenario.id, t, 0);
        const blocked = getDefendedResponse(scenario.id, t, 0);
        expect(new Set([vulnerable, partial, blocked]).size).toBe(3);
      }
    });
  }
});
