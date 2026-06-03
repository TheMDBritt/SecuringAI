/**
 * Per-scenario certification topic tags surfaced in the evaluation panel and
 * the /certs deep-dive page. Values are intentionally short — they render as
 * inline chips. Single source of truth: imported by both lib/evaluator.ts
 * (server-side scoring) and app/certs/page.tsx (client-rendered cert deep dive)
 * so the two views can never drift.
 */
export const SECURITYAI_PLUS_TOPICS: Record<string, string[]> = {
  // ── Dojo 1 — Attacking & defending LLMs ─────────────────────────────────────
  'prompt-injection': [
    'OWASP LLM01 — Prompt Injection',
    'SecAI+ · Adversarial Prompting',
    'CAISP · AI Input Validation',
    'NIST AI RMF · Measure 2.7',
  ],
  'data-exfiltration': [
    'OWASP LLM02 — Sensitive Information Disclosure',
    'OWASP LLM06 — Excessive Agency',
    'SecAI+ · Data Leakage Prevention',
    'AAISM · Context Window Hygiene',
  ],
  'policy-bypass': [
    'OWASP LLM01 — Prompt Injection',
    'SecAI+ · Jailbreak Resistance',
    'CAIS · AI Policy Enforcement',
    'NIST AI RMF · Manage 4.1',
  ],
  'tool-abuse': [
    'OWASP LLM07 — System Prompt Leakage / Tool Misuse',
    'CAISP · Agentic AI Security',
    'SecAI+ · Tool-Call Guardrails',
    'CSA AICM · Agentic Controls',
  ],
  'rag-injection': [
    'OWASP LLM08 — Vector & Embedding Weaknesses',
    'SecAI+ · RAG Pipeline Security',
    'CAISP · Retrieval Poisoning Defense',
    'CSA AICM · Data Provenance',
  ],

  // ── Dojo 2 — Using AI for defense ───────────────────────────────────────────
  'log-triage': [
    'SecAI+ · AI-Assisted SOC Operations',
    'CAISP · Alert Triage & Classification',
    'MITRE ATT&CK · Initial Access / Execution',
    'AAISM · Operational AI Oversight',
  ],
  'alert-enrichment': [
    'SecAI+ · AI Threat Intelligence',
    'CAIS · CVE Analysis & Enrichment',
    'MITRE ATT&CK · Exploit Public-Facing App',
    'NIST AI RMF · Map 5.1',
  ],
  'detection-rule-gen': [
    'SecAI+ · AI-Generated Detection Rules',
    'CAISP · Detection-as-Code (Sigma / KQL / YARA)',
    'AAISM · AI Output Quality Assurance',
  ],
  'incident-report-draft': [
    'SecAI+ · AI-Assisted Incident Response',
    'AAISM · IR Documentation & Review',
    'NIST AI RMF · Manage 4.2',
  ],

  // ── Dojo 3 — AI GRC ────────────────────────────────────────────────────────
  'ai-incident-response': [
    'EU AI Act · Article 73 Serious Incident Reporting',
    'NIST AI RMF · Manage 4.2 (Incident Response)',
    'CAIS · AI Incident Response Methodology',
    'ISO/IEC 42001 · AI Incident Management Controls',
    'SecAI+ · AI Failure Mode Classification',
  ],
  'ai-risk-classification': [
    'EU AI Act · Annex III High-Risk Categories',
    'NIST AI RMF · Map + Measure',
    'OWASP LLM05 — Improper Output Handling',
    'OWASP LLM08 — Vector & Embedding Weaknesses',
    'AAISM · AI Risk Assessment',
  ],
  'policy-and-controls': [
    'AAISM · AI Governance & Policy',
    'ISO/IEC 42001 · AI Management System',
    'EU AI Act · Article 9 Risk Management',
    'CSA AICM · Control Validation',
    'NIST AI RMF · Govern',
  ],
  'third-party-vendor-review': [
    'AAISM · Third-Party AI Risk',
    'ISO/IEC 42001 · Annex A Supplier Controls',
    'EU AI Act · Article 25 Provider Obligations',
    'NIST AI RMF · Govern 6 (Third-Party)',
    'CSA AICM · Vendor Assurance',
  ],
};
