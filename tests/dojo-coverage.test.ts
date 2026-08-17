/**
 * Every lab must be runnable.
 *
 * A scenario is only real if three things exist for it: it appears in the
 * catalogue, it has a scoring rubric, and it has a seed artefact a learner can
 * load. Six Dojo 2 scenarios had a catalogue entry and a full rubric but no
 * incident and no entry in the Dojo2TaskType union, so the library was
 * permanently empty on half the labs and nothing in the UI said why. All 17
 * Dojo 3 scenarios had a rubric and a blank input box.
 *
 * These assert all three legs for both dojos, so a scenario cannot be added
 * again without the material that makes it playable.
 */
import { describe, it, expect } from 'vitest';
import { SCENARIOS } from '@/lib/scenarios';
import { DOJO2_PREBUILT_SCENARIOS } from '@/lib/dojo2-incidents';
import { DOJO2_TASK_LABELS } from '@/lib/dojo2-scenarios';
import { DOJO3_BRIEFS } from '@/lib/dojo3-briefs';
import { getQualityCriteria } from '@/lib/quality-rubrics';
import { generateDojo2Analysis } from '@/lib/dojo2-simulation';
import { generateDojo3Analysis } from '@/lib/dojo3-simulation';
import { evaluate } from '@/lib/evaluator';
import { DEFAULT_CONTROL_CONFIG, DEFAULT_DOJO2_CONFIG, DEFAULT_DOJO3_CONFIG } from '@/types';

const dojo2 = SCENARIOS.filter((s) => s.dojoId === 2);
const dojo3 = SCENARIOS.filter((s) => s.dojoId === 3);

describe('every Dojo 2 scenario is playable', () => {
  it('has a rubric', () => {
    const without = dojo2.filter((s) => getQualityCriteria(2, s.id).length === 0);
    expect(without.map((s) => s.id)).toEqual([]);
  });

  it('has at least one incident', () => {
    const counts = new Map<string, number>();
    for (const inc of DOJO2_PREBUILT_SCENARIOS) {
      counts.set(inc.taskType, (counts.get(inc.taskType) ?? 0) + 1);
    }
    const empty = dojo2.filter((s) => !counts.get(s.id));
    expect(empty.map((s) => s.id)).toEqual([]);
  });

  it('has a display label, so the task filter can render it', () => {
    const unlabelled = dojo2.filter((s) => !(s.id in DOJO2_TASK_LABELS));
    expect(unlabelled.map((s) => s.id)).toEqual([]);
  });

  it('has no incident pointing at a task that is not a scenario', () => {
    const ids = new Set(dojo2.map((s) => s.id));
    const orphans = DOJO2_PREBUILT_SCENARIOS.filter((i) => !ids.has(i.taskType));
    expect(orphans.map((i) => i.id)).toEqual([]);
  });

  it('gives every incident a unique id', () => {
    const ids = DOJO2_PREBUILT_SCENARIOS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('every Dojo 3 scenario is playable', () => {
  it('has a rubric', () => {
    const without = dojo3.filter((s) => getQualityCriteria(3, s.id).length === 0);
    expect(without.map((s) => s.id)).toEqual([]);
  });

  it('has at least one worked brief', () => {
    const covered = new Set(DOJO3_BRIEFS.map((b) => b.scenarioId));
    const empty = dojo3.filter((s) => !covered.has(s.id));
    expect(empty.map((s) => s.id)).toEqual([]);
  });
});

describe('the six new Dojo 2 incidents carry the evidence the analyst reads', () => {
  const NEW_IDS = ['CIA-001', 'AISC-001', 'AAF-001', 'AMA-001', 'APF-001', 'RAT-001'];
  const incidents = DOJO2_PREBUILT_SCENARIOS.filter((i) => NEW_IDS.includes(i.id));

  it('all six are present', () => {
    expect(incidents.map((i) => i.id).sort()).toEqual([...NEW_IDS].sort());
  });

  for (const inc of incidents) {
    describe(inc.id, () => {
      it('has ISO-8601 timestamps the fact extractor can read', () => {
        const stamps = inc.incidentData.match(/\b\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}Z?\b/g) ?? [];
        expect(stamps.length).toBeGreaterThanOrEqual(4);
      });

      it('declares real MITRE codes', () => {
        // The Dojo grades technique attribution, so an incident whose declared
        // techniques are not in a recognised format teaches a wrong habit.
        expect(inc.mitre.techniques.length).toBeGreaterThan(0);
        for (const t of inc.mitre.techniques) {
          expect(t).toMatch(/^(T\d{4}(\.\d{3})?|AML\.T\d{4}(\.\d{3})?): .+/);
        }
      });

      it('carries at least one indicator', () => {
        const { ips, domains, hashes, other } = inc.iocs;
        expect(ips.length + domains.length + hashes.length + (other?.length ?? 0)).toBeGreaterThan(0);
      });

      it('states indicators inside the body, not only in metadata', () => {
        // The learner works the body. Indicators listed only on the card cannot
        // be extracted from the evidence, which is the skill being taught.
        const inBody = [...inc.iocs.ips, ...inc.iocs.domains, ...inc.iocs.hashes].filter((v) =>
          inc.incidentData.includes(v),
        );
        expect(inBody.length).toBeGreaterThan(0);
      });

      it('produces a substantive analysis rather than a refusal', () => {
        const out = generateDojo2Analysis(inc.incidentData, inc.taskType, DEFAULT_DOJO2_CONFIG);
        expect(out.length).toBeGreaterThan(800);
        expect(out).toMatch(/T\d{4}|AML\.T\d{4}/);
      });
    });
  }

  it('still refuses a message with no evidence in it', () => {
    // Both directions matter. A generator that always passes is worthless, so
    // the new incidents must not have loosened the evidence gate.
    const refusal = generateDojo2Analysis('please analyse this', 'cloud-identity-abuse', DEFAULT_DOJO2_CONFIG);
    expect(refusal.length).toBeLessThan(1200);
  });
});

describe('each dojo describes itself in the verdict', () => {
  // A learner drafting an EU AI Act classification was told BlackBeltAI had
  // produced a "defensive security analysis" and that "all key SOC criteria are
  // covered". Wrong discipline, on the screen that tells them how they did.
  it('does not call Dojo 3 output a SOC analysis', async () => {
    const brief = DOJO3_BRIEFS.find((b) => b.scenarioId === 'ai-risk-classification')!;
    const artifact = generateDojo3Analysis(brief.body, brief.scenarioId, DEFAULT_DOJO3_CONFIG);
    const result = await evaluate({
      dojoId: 3,
      scenarioId: brief.scenarioId,
      settings: DEFAULT_CONTROL_CONFIG,
      messages: [
        { role: 'user', content: brief.body },
        { role: 'assistant', content: artifact },
      ],
    });
    expect(result.explanation).not.toMatch(/\bSOC\b/);
    expect(result.explanation).toMatch(/governance/i);
  });

  it('still calls Dojo 2 output a SOC analysis', async () => {
    const incident = DOJO2_PREBUILT_SCENARIOS.find((i) => i.id === 'CIA-001')!;
    const artifact = generateDojo2Analysis(incident.incidentData, incident.taskType, DEFAULT_DOJO2_CONFIG);
    const result = await evaluate({
      dojoId: 2,
      scenarioId: incident.taskType,
      settings: DEFAULT_CONTROL_CONFIG,
      messages: [
        { role: 'user', content: incident.incidentData },
        { role: 'assistant', content: artifact },
      ],
      dojo2Config: DEFAULT_DOJO2_CONFIG,
    });
    expect(result.explanation).toMatch(/SOC analyst/);
  });
});
