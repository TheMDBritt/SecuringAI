/**
 * The deterministic analyst runs whenever no OPENAI_API_KEY is set, which is
 * the app's default state. Dojo 2 grades the assistant's analysis, so this
 * module's output is what the learner's score is computed from — it has to be
 * derived from the submitted evidence, and it must not pass when there is none.
 */
import { describe, it, expect } from 'vitest';
import { generateDojo2Analysis, extractIncidentFacts } from '@/lib/dojo2-simulation';
import { DOJO2_QUALITY_CHECKS } from '@/lib/quality-rubrics';
import type { Dojo2Config } from '@/types';

const CONFIG: Dojo2Config = {
  persona: 'analyst',
  outputFormat: 'markdown',
  analysisDepth: 'standard',
  responseStyle: 'detailed',
  iocExtraction: true,
  mitreMapping: true,
  threatCorrelation: true,
  contextLevel: 'limited',
  confidenceLevel: 'medium',
  riskAssessment: 'medium',
};

const SSH_INCIDENT = `INCIDENT: SSH Authentication Log Analysis
Host: web-prod-01 | Log: /var/log/auth.log
2024-03-15T02:11:03Z sshd[4821]: Failed password for invalid user admin from 185.220.101.47 port 54321 ssh2
2024-03-15T02:11:07Z sshd[4825]: Failed password for root from 185.220.101.47 port 54325 ssh2
2024-03-15T02:11:14Z sshd[4832]: Accepted password for svcadmin from 185.220.101.47 port 54332 ssh2
2024-03-15T02:11:14Z sshd[4832]: pam_unix(sshd:session): session opened for user svcadmin by (uid=0)
2024-03-15T02:11:22Z sudo[4840]: svcadmin : USER=root ; COMMAND=/bin/bash
2024-03-15T02:11:30Z sshd[4842]: Received disconnect from 192.168.1.105 port 12345`;

describe('incident fact extraction', () => {
  const facts = extractIncidentFacts(SSH_INCIDENT);

  it('separates external from internal addresses', () => {
    // Blocklisting an internal address is how a containment step becomes an
    // outage, so the split has to be right.
    expect(facts.ips).toContain('185.220.101.47');
    expect(facts.privateIps).toContain('192.168.1.105');
    expect(facts.ips).not.toContain('192.168.1.105');
  });

  it('recognises a successful compromise and privilege escalation', () => {
    expect(facts.succeeded).toBe(true);
    expect(facts.escalated).toBe(true);
  });

  it('reconstructs the timed event sequence', () => {
    expect(facts.timedLines.length).toBeGreaterThanOrEqual(5);
    expect(facts.timestamps[0]).toBe('2024-03-15T02:11:03Z');
  });

  it('names the affected host', () => {
    expect(facts.hosts).toContain('web-prod-01');
  });
});

describe('analysis content is derived from the incident', () => {
  const out = generateDojo2Analysis(SSH_INCIDENT, 'log-triage', CONFIG);

  it('rates a successful, escalated intrusion as Critical', () => {
    expect(out).toMatch(/Severity:\s*Critical/i);
  });

  it('attributes the technique actually evidenced', () => {
    // Failed-then-accepted passwords is brute force; sudo is elevation abuse.
    expect(out).toContain('T1110.001');
    expect(out).toContain('T1548');
  });

  it('reports the real indicators, not placeholders', () => {
    expect(out).toContain('185.220.101.47');
    expect(out).toContain('web-prod-01');
  });

  it('splits automated containment from human-gated actions', () => {
    expect(out).toMatch(/Safe to automate/i);
    expect(out).toMatch(/Human-gated/i);
  });

  it('flags that AI-derived conclusions need verification', () => {
    expect(out).toMatch(/verif/i);
  });
});

describe('controls change the analysis', () => {
  it('omits IOCs when IOC extraction is disabled', () => {
    const off = generateDojo2Analysis(SSH_INCIDENT, 'log-triage', { ...CONFIG, iocExtraction: false });
    expect(off).not.toMatch(/### IOCs/i);
    expect(generateDojo2Analysis(SSH_INCIDENT, 'log-triage', CONFIG)).toMatch(/### IOCs/i);
  });

  it('omits the MITRE mapping when mapping is disabled', () => {
    const off = generateDojo2Analysis(SSH_INCIDENT, 'log-triage', { ...CONFIG, mitreMapping: false });
    expect(off).not.toMatch(/### MITRE/i);
  });

  it('omits threat context when correlation is disabled', () => {
    const off = generateDojo2Analysis(SSH_INCIDENT, 'log-triage', { ...CONFIG, threatCorrelation: false });
    expect(off).not.toMatch(/Threat actor context/i);
  });

  it('emits JSON when the output format asks for it', () => {
    const j = generateDojo2Analysis(SSH_INCIDENT, 'log-triage', { ...CONFIG, outputFormat: 'json' });
    expect(j).toMatch(/```json/);
    const body = j.split('```')[1].replace(/^json\n/, '');
    expect(() => JSON.parse(body)).not.toThrow();
  });
});

describe('scenario-shaped deliverables', () => {
  it('produces a rule and a query for detection-rule-gen', () => {
    const out = generateDojo2Analysis(SSH_INCIDENT, 'detection-rule-gen', CONFIG);
    expect(out).toMatch(/```yaml/);
    expect(out).toMatch(/logsource:/);
    expect(out).toMatch(/```kusto/);
    expect(out).toMatch(/false positive/i);
  });

  it('produces report sections for incident-report-draft', () => {
    const out = generateDojo2Analysis(SSH_INCIDENT, 'incident-report-draft', CONFIG);
    expect(out).toMatch(/Executive summary/i);
    expect(out).toMatch(/Root cause/i);
    expect(out).toMatch(/Lessons learned/i);
  });

  it('states a falsifiable hypothesis for threat-hunt', () => {
    const out = generateDojo2Analysis(SSH_INCIDENT, 'threat-hunt', CONFIG);
    expect(out).toMatch(/hypothesis/i);
    expect(out).toMatch(/rejected/i);
  });
});

describe('it refuses to analyse nothing', () => {
  const THIN = 'Something looked odd on a server today. Can you take a look?';

  it('asks for evidence instead of inventing an analysis', () => {
    const out = generateDojo2Analysis(THIN, 'log-triage', CONFIG);
    expect(out).toMatch(/cannot analyse|submit the underlying evidence/i);
    expect(out).not.toMatch(/```yaml/);
  });

  it('does not pass the rubric on an empty submission', () => {
    // The point of the gate: emitting the section headings regardless of
    // evidence scored 83 and passed, rewarding the learner for supplying
    // nothing.
    for (const scenarioId of ['log-triage', 'detection-rule-gen', 'incident-report-draft']) {
      const out = generateDojo2Analysis(THIN, scenarioId, CONFIG);
      const checks = DOJO2_QUALITY_CHECKS[scenarioId] ?? [];
      const met = checks.filter((c) => c.re.test(out)).length;
      expect(met / checks.length, scenarioId).toBeLessThan(0.6);
    }
  });

  it('still scores well on a real incident', () => {
    for (const scenarioId of ['log-triage', 'detection-rule-gen', 'incident-report-draft']) {
      const out = generateDojo2Analysis(SSH_INCIDENT, scenarioId, CONFIG);
      const checks = DOJO2_QUALITY_CHECKS[scenarioId] ?? [];
      const met = checks.filter((c) => c.re.test(out)).length;
      expect(met, scenarioId).toBe(checks.length);
    }
  });
});
