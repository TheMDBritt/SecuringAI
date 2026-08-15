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
    'OWASP LLM01 Prompt Injection',
    'SecAI+ · Adversarial Prompting',
    'CAISP · AI Input Validation',
    'NIST AI RMF · Measure 2.7',
  ],
  'data-exfiltration': [
    'OWASP LLM02 Sensitive Information Disclosure',
    'OWASP LLM03 Excessive Agency',
    'SecAI+ · Data Leakage Prevention',
    'AAISM · Context Window Hygiene',
  ],
  'policy-bypass': [
    'OWASP LLM01 Prompt Injection',
    'SecAI+ · Jailbreak Resistance',
    'CAIS · AI Policy Enforcement',
    'NIST AI RMF · Manage 4.1',
  ],
  'tool-abuse': [
    'OWASP LLM08 Hidden Context Exposure/ Tool Misuse',
    'CAISP · Agentic AI Security',
    'SecAI+ · Tool-Call Guardrails',
    'CSA AICM · Agentic Controls',
  ],
  'rag-injection': [
    'OWASP LLM09: Vector and Embedding Weaknesses',
    'SecAI+ · RAG Pipeline Security',
    'CAISP · Retrieval Poisoning Defense',
    'CSA AICM · Data Provenance',
  ],

  // ── Dojo 1, additional ─────────────────────────────────────────────────────
  'supply-chain': [
    'OWASP LLM04 Supply Chain',
    'OWASP LLM06 Unbounded Consumption',
    'SecAI+ · Model Fingerprinting Defense',
    'GIAC-GOAA · Model Probing Techniques',
    'CAISP · AI Asset Inventory & Disclosure',
    'NIST AI RMF · Govern 6 (Third-Party)',
  ],
  'model-inversion': [
    'OWASP LLM02 Sensitive Information Disclosure',
    'OWASP LLM06 Unbounded Consumption',
    'SecAI+ · Model Extraction Defense',
    'GIAC-GOAA · Model Inversion & Membership Inference',
    'CAISP · Differential Privacy Controls',
    'NIST AI RMF · Measure 2.6',
  ],
  'indirect-injection': [
    'OWASP LLM01 Prompt Injection',
    'OWASP LLM07 Misinformation',
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
    'OWASP LLM01 Prompt Injection(Multimodal)',
    'OWASP LLM02 Sensitive Information Disclosure',
    'SecAI+ · Multimodal AI Attack Vectors',
    'GIAC-GOAA · Adversarial ML Attacks',
    'CAISP · Visual Injection Defense',
    'MITRE ATLAS · AML.T0043 Craft Adversarial Data',
  ],
  'agent-memory-poisoning': [
    'OWASP LLM01 Prompt Injection(Persistent)',
    'OWASP LLM05 Data and Model Poisoning',
    'OWASP LLM03 Excessive Agency',
    'SecAI+ · Agentic AI Security',
    'GIAC-GOAA · LLM Memory Exploitation',
    'CAISP · Agentic Architecture Hardening',
    'MITRE ATLAS · AML.T0051 LLM Prompt Injection',
  ],
  'cross-tenant-data-leakage': [
    'OWASP LLM02 Sensitive Information Disclosure',
    'OWASP LLM09 Vector and Embedding Weaknesses',
    'SecAI+ · Multi-Tenant AI Isolation',
    'SC-500 · Azure OpenAI Data Isolation',
    'CAISP · Context Window Security',
    'MITRE ATLAS · AML.T0056 Extract LLM System Prompt',
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
    'OWASP LLM10 Improper Output Handling',
    'OWASP LLM09: Vector and Embedding Weaknesses',
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

  // ── Dojo 2 and Dojo 3 scenarios added after the first build ───────────────
  // These drive the "Certification Mapping" line in the scoring pane. Without
  // an entry the pane reads "No certification mapping available", so every
  // Dojo 2 and Dojo 3 scenario id must appear here. SecAI+ objective IDs come
  // from docs/cert-objectives/secai-cy001.md.

  'cloud-identity-abuse': [
    'SecAI+ 3.1 · Anomaly detection with AI-enabled tools',
    'SecAI+ 2.3 · Access controls for AI systems',
    'SC-500 · Entra ID Protection risk detections',
    'SCS-C03 · Domain 1 Threat detection and incident response',
    'MITRE ATT&CK · T1078 Valid Accounts',
  ],
  'ai-system-compromise': [
    'SecAI+ 2.6 · Analyze evidence of an attack on AI systems',
    'SecAI+ 2.5 · Monitoring and auditing for AI systems',
    'CAISP · AI incident triage',
    'MITRE ATLAS · AML.T0051 LLM Prompt Injection',
    'OWASP LLM01 Prompt Injection',
  ],
  'autonomous-agent-forensics': [
    'SecAI+ 2.6 · Excessive agency and manipulating application integrations',
    'SecAI+ 3.3 · AI agents in automated security tasks',
    'OWASP LLM03 Excessive Agency',
    'CAISP · Agentic AI security',
    'MITRE ATLAS · AML.T0053 AI Agent Tool Invocation',
  ],
  'ai-model-abuse': [
    'SecAI+ 2.6 · Model theft, membership inference, jailbreaking',
    'SecAI+ 2.2 · Gateway controls, rate limits and token limits',
    'MITRE ATLAS · AML.T0054 LLM Jailbreak',
    'MITRE ATLAS · AML.T0057 LLM Data Leakage',
    'OWASP LLM06 Unbounded Consumption',
  ],
  'adversarial-prompt-forensics': [
    'SecAI+ 2.6 · Prompt injection and circumventing AI guardrails',
    'SecAI+ 2.5 · Prompt monitoring, query and response',
    'OWASP LLM01 Prompt Injection',
    'OWASP LLM08 Hidden Context Exposure',
    'MITRE ATLAS · AML.T0051.001 Indirect Prompt Injection',
  ],
  'ransomware-ai-triage': [
    'SecAI+ 3.1 · Incident management with AI-enabled tools',
    'SecAI+ 3.3 · Incident response ticket management and AI agents',
    'SecAI+ 1.3 · Human-in-the-loop and human oversight',
    'SC-500 · Defender XDR incident response',
    'MITRE ATT&CK · T1486 Data Encrypted for Impact',
  ],
  'ai-supply-chain-risk': [
    'SecAI+ 2.6 · AI supply chain attacks',
    'SecAI+ 4.3 · Third-party compliance evaluations',
    'OWASP LLM04 Supply Chain',
    'ISO/IEC 42001 · Clause 8.4 externally provided AI',
    'NIST AI RMF · MAP 4 third-party components',
  ],
  'ai-bias-audit': [
    'SecAI+ 4.2 · Fairness and introduction of bias',
    'SecAI+ 2.5 · Auditing for bias and fairness',
    'EU AI Act · Article 10 data governance',
    'NIST AI RMF · MEASURE 2.11 fairness and bias',
    'ISO/IEC 42001 · AI impact assessment controls',
  ],
  'ai-privacy-impact': [
    'SecAI+ 4.2 · Privacy and security, differential privacy',
    'SecAI+ 2.4 · Data anonymization, redaction and minimization',
    'GDPR · Article 35 data protection impact assessment',
    'EU AI Act · Article 26 deployer obligations',
    'OWASP LLM02 Sensitive Information Disclosure',
  ],
  'ai-procurement-assessment': [
    'SecAI+ 4.3 · Third-party compliance evaluations',
    'SecAI+ 4.3 · Sanctioned vs unsanctioned, private vs public models',
    'ISO/IEC 42001 · Clause 8.4 externally provided processes',
    'NIST AI RMF · GOVERN 6.1 third-party risk',
    'OWASP LLM04 Supply Chain',
  ],
  'iso42001-gap-analysis': [
    'SecAI+ 4.3 · ISO AI standards',
    'SecAI+ 4.1 · AI policies and procedures',
    'ISO/IEC 42001 · Clauses 4 to 10 and Annex A',
    'NIST AI RMF · GOVERN function',
    'CAISP · AI management system implementation',
  ],
  'ai-continuous-monitoring': [
    'SecAI+ 2.5 · Monitoring and auditing for AI systems',
    'SecAI+ 1.3 · Monitoring and maintenance in the AI life cycle',
    'NIST AI RMF · MEASURE and MANAGE functions',
    'ISO/IEC 42001 · Clause 9 performance evaluation',
    'EU AI Act · Article 72 post-market monitoring',
  ],
  'nist-ai-rmf-profile': [
    'SecAI+ 4.3 · NIST AI Risk Management Framework',
    'SecAI+ 4.1 · Organizational governance structures for AI',
    'NIST AI RMF · GOVERN, MAP, MEASURE, MANAGE',
    'NIST AI RMF · MAP 5.1 impact likelihood and magnitude',
    'ISO/IEC 42001 · Clause 6 planning',
  ],
  'ai-regulatory-cross-reference': [
    'SecAI+ 4.3 · Impact of compliance on business use of AI',
    'SecAI+ 2.1 · OWASP Top 10 threat modeling resources',
    'EU AI Act · Article 9 risk management system',
    'NIST AI RMF · GOVERN and MEASURE functions',
    'ISO/IEC 42001 · Clause 6.1 actions to address risk',
  ],
  'ai-transparency-obligations': [
    'SecAI+ 4.2 · Transparency and explainability',
    'SecAI+ 4.3 · European Union AI Act',
    'EU AI Act · Articles 12 to 15 and Article 13 transparency',
    'NIST AI RMF · MAP 3.5 human oversight processes',
    'ISO/IEC 42001 · AI system documentation controls',
  ],
  'model-drift-governance': [
    'SecAI+ 1.3 · Monitoring, maintenance, feedback and iteration',
    'SecAI+ 4.2 · Accuracy and performance of the model',
    'EU AI Act · Article 72 post-market surveillance',
    'EU AI Act · Article 73 serious incident reporting',
    'ISO/IEC 42001 · Clause 10 improvement',
  ],
  'ai-regulatory-mapping': [
    'SecAI+ 4.3 · Impact of compliance on business use of AI',
    'SecAI+ 4.3 · Data sovereignty',
    'EU AI Act · Annex III high-risk classification',
    'GDPR · Article 22 automated decision-making',
    'NIST AI RMF · GOVERN 1.1 policies and procedures',
  ],
};
