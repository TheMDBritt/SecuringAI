/**
 * Per-scenario certification topic tags surfaced in the evaluation panel and
 * the /certs deep-dive page. Values are intentionally short, they render as
 * inline chips. Single source of truth: imported by both lib/evaluator.ts
 * (server-side scoring) and app/certs/page.tsx (client-rendered cert deep dive)
 * so the two views can never drift.
 */
export const SECURITYAI_PLUS_TOPICS: Record<string, string[]> = {
  // ── Dojo 1, Attacking & defending LLMs ─────────────────────────────────────
  'prompt-injection': [
    'OWASP LLM01: Prompt Injection',
    'SecAI+ · Adversarial Prompting',
    'CAISP · AI Input Validation',
    'NIST AI RMF · Measure 2.7',
  ],
  'data-exfiltration': [
    'OWASP LLM02: Sensitive Information Disclosure',
    'OWASP LLM06: Excessive Agency',
    'SecAI+ · Data Leakage Prevention',
    'AAISM · Context Window Hygiene',
  ],
  'policy-bypass': [
    'OWASP LLM01: Prompt Injection',
    'SecAI+ · Jailbreak Resistance',
    'CAIS · AI Policy Enforcement',
    'NIST AI RMF · Manage 4.1',
  ],
  'tool-abuse': [
    'OWASP LLM07: System Prompt Leakage / Tool Misuse',
    'CAISP · Agentic AI Security',
    'SecAI+ · Tool-Call Guardrails',
    'CSA AICM · Agentic Controls',
  ],
  'rag-injection': [
    'OWASP LLM08: Vector & Embedding Weaknesses',
    'SecAI+ · RAG Pipeline Security',
    'CAISP · Retrieval Poisoning Defense',
    'CSA AICM · Data Provenance',
  ],

  // ── Dojo 1, additional ─────────────────────────────────────────────────────
  'supply-chain': [
    'OWASP LLM05: Supply Chain Vulnerabilities',
    'OWASP LLM10: Model Theft',
    'SecAI+ · Model Fingerprinting Defense',
    'GIAC-GOAA · Model Probing Techniques',
    'CAISP · AI Asset Inventory & Disclosure',
    'NIST AI RMF · Govern 6 (Third-Party)',
  ],
  'model-inversion': [
    'OWASP LLM02: Sensitive Information Disclosure',
    'OWASP LLM10: Model Theft',
    'SecAI+ · Model Extraction Defense',
    'GIAC-GOAA · Model Inversion & Membership Inference',
    'CAISP · Differential Privacy Controls',
    'NIST AI RMF · Measure 2.6',
  ],
  'indirect-injection': [
    'OWASP LLM01: Prompt Injection',
    'OWASP LLM09: Overreliance',
    'SecAI+ · Indirect Injection Vectors',
    'GIAC-GOAA · Third-Party Content Exploitation',
    'CAISP · Supply Chain Input Validation',
  ],

  // ── Dojo 2, Using AI for defense ───────────────────────────────────────────
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

  'threat-hunt': [
    'SecAI+ · AI-Assisted Threat Hunting',
    'GIAC-GASAE · Threat Hunting Automation',
    'MITRE ATT&CK · Proactive Detection',
    'SC-500 · Microsoft Sentinel KQL',
    'CAISP · Hypothesis-Driven Detection',
  ],
  'malware-behavior': [
    'SecAI+ · AI-Assisted Malware Analysis',
    'GIAC-GASAE · Automated Malware Triage',
    'MITRE ATT&CK · Defense Evasion / Persistence',
    'SC-500 · Defender XDR Behavioral Analysis',
    'CAISP · AI-Driven Reverse Engineering',
  ],

  'vision-adversarial-attack': [
    'OWASP LLM01: Prompt Injection (Multimodal)',
    'OWASP LLM06: Sensitive Information Disclosure',
    'SecAI+ · Multimodal AI Attack Vectors',
    'GIAC-GOAA · Adversarial ML Attacks',
    'CAISP · Visual Injection Defense',
    'MITRE ATLAS · AML.T0043 Craft Adversarial Data',
  ],
  'agent-memory-poisoning': [
    'OWASP LLM01: Prompt Injection (Persistent)',
    'OWASP LLM03: Training Data Poisoning',
    'OWASP LLM08: Excessive Agency',
    'SecAI+ · Agentic AI Security',
    'GIAC-GOAA · LLM Memory Exploitation',
    'CAISP · Agentic Architecture Hardening',
    'MITRE ATLAS · AML.T0051 LLM Prompt Injection',
  ],
  'cross-tenant-data-leakage': [
    'OWASP LLM02: Sensitive Information Disclosure',
    'OWASP LLM06: Sensitive Information Disclosure',
    'OWASP LLM09: Misinformation',
    'SecAI+ · Multi-Tenant AI Isolation',
    'SC-500 · Azure OpenAI Data Isolation',
    'CAISP · Context Window Security',
    'MITRE ATLAS · AML.T0056 LLM Information Disclosure',
  ],

  // ── Dojo 3, AI GRC ────────────────────────────────────────────────────────
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
    'OWASP LLM05: Improper Output Handling',
    'OWASP LLM08: Vector & Embedding Weaknesses',
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
  'ai-model-transparency': [
    'ISO/IEC 42001 · Transparency & Documentation',
    'EU AI Act · Articles 11-15 Technical Documentation',
    'NIST AI RMF · MAP Subcategories',
    'SecAI+ · AI Disclosure Requirements',
    'CAISP · Model Documentation Audit',
  ],
  'ai-red-team-report': [
    'MITRE ATLAS · Adversarial ML Threat Matrix',
    'NIST AI RMF · Manage + Govern Controls',
    'SecAI+ · AI Red Team Methodology',
    'CAISP · AI Security Assessment',
    'OWASP LLM Top 10 · Attack Surface Coverage',
  ],
};
