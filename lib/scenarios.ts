import { Scenario } from '@/types';

export const SCENARIOS: Scenario[] = [
  // ── Dojo 1 ────────────────────────────────────────────────────────────
  {
    id: 'prompt-injection',
    dojoId: 1,
    title: 'Prompt Injection',
    description:
      'Craft adversarial text that overrides BlackBeltAI\'s system instructions via the user turn.',
    difficulty: 'beginner',
    owaspTags: ['LLM01'],
  },
  {
    id: 'data-exfiltration',
    dojoId: 1,
    title: 'Data Exfiltration',
    description:
      'Coax BlackBeltAI into revealing simulated secrets embedded in its context window.',
    difficulty: 'intermediate',
    owaspTags: ['LLM02', 'LLM06'],
  },
  {
    id: 'policy-bypass',
    dojoId: 1,
    title: 'Policy Bypass',
    description:
      'Circumvent topic/content restrictions using jailbreak patterns and role-play framing.',
    difficulty: 'intermediate',
    owaspTags: ['LLM01', 'LLM07'],
  },
  {
    id: 'tool-abuse',
    dojoId: 1,
    title: 'Tool Abuse',
    description:
      'Forge malicious responses to BlackBeltAI\'s simulated function-calling tools (file_read, web_search).',
    difficulty: 'advanced',
    owaspTags: ['LLM07', 'LLM08'],
  },
  {
    id: 'rag-injection',
    dojoId: 1,
    title: 'RAG Injection',
    description:
      'Inject adversarial content into simulated retrieved documents to hijack BlackBeltAI\'s responses.',
    difficulty: 'advanced',
    owaspTags: ['LLM01', 'LLM09'],
  },
  {
    id: 'model-dos',
    dojoId: 1,
    title: 'Model Denial of Service',
    description:
      'Craft prompts designed to exhaust token budgets, trigger recursive reasoning, or consume disproportionate compute — mapping to LLM04.',
    difficulty: 'intermediate',
    owaspTags: ['LLM04'],
  },
  {
    id: 'indirect-injection',
    dojoId: 1,
    title: 'Indirect Prompt Injection',
    description:
      'Inject adversarial instructions via external content (simulated emails, documents) that BlackBeltAI processes — without touching the direct user prompt.',
    difficulty: 'advanced',
    owaspTags: ['LLM01'],
  },
  {
    id: 'agent-hijacking',
    dojoId: 1,
    title: 'Agent Hijacking',
    description:
      'Manipulate BlackBeltAI\'s simulated tool-call decisions to make it take unauthorised actions — exploiting excessive agency and missing HITL controls.',
    difficulty: 'advanced',
    owaspTags: ['LLM06', 'LLM08'],
  },

  // ── Dojo 2 ────────────────────────────────────────────────────────────
  {
    id: 'log-triage',
    dojoId: 2,
    title: 'Log Triage',
    description:
      'Paste raw SIEM/syslog output. BlackBeltAI classifies severity, extracts IOCs, and summarizes threats.',
    difficulty: 'beginner',
    owaspTags: [],
    mitreAttackIds: ['T1078', 'T1059'],
  },
  {
    id: 'alert-enrichment',
    dojoId: 2,
    title: 'Alert Enrichment',
    description:
      'Feed BlackBeltAI a security alert. It enriches with CVE context and MITRE ATT&CK mapping.',
    difficulty: 'intermediate',
    owaspTags: [],
    mitreAttackIds: ['T1190', 'T1210'],
  },
  {
    id: 'detection-rule-gen',
    dojoId: 2,
    title: 'Detection Rule Generation',
    description:
      'Describe anomalous behavior in plain English. BlackBeltAI proposes Sigma/KQL/YARA detection rules.',
    difficulty: 'intermediate',
    owaspTags: [],
    mitreAttackIds: ['T1055', 'T1003'],
  },
  {
    id: 'incident-report-draft',
    dojoId: 2,
    title: 'Incident Report Draft',
    description:
      'Provide an event timeline. BlackBeltAI drafts a structured IR report with executive summary and technical appendix.',
    difficulty: 'advanced',
    owaspTags: [],
    mitreAttackIds: [],
  },

  // ── Dojo 3 — AI GRC ────────────────────────────────────────────────────
  {
    id: 'ai-risk-classification',
    dojoId: 3,
    title: 'AI Risk Classification',
    description:
      'Given an AI deployment brief, classify it under EU AI Act risk tiers, map to NIST AI RMF functions, and justify required controls.',
    difficulty: 'intermediate',
    owaspTags: ['LLM05', 'LLM08'],
    mitreAttackIds: [],
  },
  {
    id: 'policy-and-controls',
    dojoId: 3,
    title: 'Policy & Controls Drafting',
    description:
      'Draft AI acceptable use policy clauses and ISO 42001 control selections for a stated use case. Scored against NIST AI RMF, EU AI Act, and ISO 42001.',
    difficulty: 'advanced',
    owaspTags: [],
    mitreAttackIds: [],
  },
  {
    id: 'third-party-vendor-review',
    dojoId: 3,
    title: 'Third-Party AI Vendor Review',
    description:
      'Given a vendor data-flow and SOC 2 summary, return approve / conditional / reject with a gap list and required contractual controls.',
    difficulty: 'advanced',
    owaspTags: [],
    mitreAttackIds: [],
  },
];

export function getScenariosByDojo(dojoId: 1 | 2 | 3): Scenario[] {
  return SCENARIOS.filter((s) => s.dojoId === dojoId);
}

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
