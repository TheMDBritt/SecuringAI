// cert-exam-domains.ts
// Maps each AI security certification to its official exam domains.
// Each domain carries the question categories (and optionally topics) used
// to pull matching questions out of QUIZ_QUESTIONS.

export interface ExamDomain {
  id: string;
  name: string;
  weight?: string;
  /** Category values that belong to this domain. */
  categories: string[];
  /**
   * If set, only questions whose `topic` is in this list are included.
   * Used for SC-500 where every question shares the same category.
   */
  topics?: string[];
}

export interface ExamCert {
  id: string;
  name: string;
  provider: string;
  /** Tailwind utility classes applied to the cert badge. */
  badgeClass: string;
  domains: ExamDomain[];
  /** Official passing score percentage (0–100). Shown on result screen. */
  passingScore?: number;
  /** If set, a mock exam preset button is shown with these params. */
  mockExam?: { questions: number; durationMin: number };
}

// ─────────────────────────────────────────────────────────────────────────────

export const EXAM_CERTS: ExamCert[] = [
  // ── SecAI+ (CompTIA) ───────────────────────────────────────────────────────
  {
    id: 'SecAI',
    name: 'CompTIA SecurityAI+',
    provider: 'CompTIA',
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/40',
    passingScore: 75,
    mockExam: { questions: 60, durationMin: 60 },
    domains: [
      {
        id: 'secai-d1',
        name: 'Domain 1: Basic AI Concepts',
        weight: '17%',
        categories: [
          'AI & ML Fundamentals',
          'Generative AI & LLMs',
          'NLP',
          'Computer Vision',
        ],
      },
      {
        id: 'secai-d2',
        name: 'Domain 2: Securing AI Systems',
        weight: '40%',
        categories: [
          'AI Security',
          'AI Security Fundamentals',
          'AI Application Security',
          'AI Testing and Security',
          'ML Engineering Security',
          'MLOps Security',
          'Red Teaming AI',
          'Data Engineering',
        ],
      },
      {
        id: 'secai-d3',
        name: 'Domain 3: AI-Assisted Security Operations',
        weight: '24%',
        categories: [
          'AI in Security Ops',
          'Emerging Trends',
          'Cloud AI Platforms',
        ],
      },
      {
        id: 'secai-d4',
        name: 'Domain 4: AI Governance & Compliance',
        weight: '19%',
        categories: [
          'AI Governance',
          'AI Ethics & Bias',
        ],
      },
    ],
  },

  // ── AWS AI Foundations (AIF-C01) ───────────────────────────────────────────
  {
    id: 'AWS-AIF-C01',
    name: 'AWS Certified AI Practitioner',
    provider: 'Amazon Web Services',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
    passingScore: 70,
    mockExam: { questions: 65, durationMin: 90 },
    domains: [
      {
        id: 'aws-d1',
        name: 'Domain 1: Fundamentals of AI and ML',
        weight: '20%',
        categories: [
          'AI & ML Fundamentals',
          'Data Engineering',
        ],
      },
      {
        id: 'aws-d2',
        name: 'Domain 2: Fundamentals of Generative AI',
        weight: '24%',
        categories: [
          'Generative AI & LLMs',
          'NLP',
          'Computer Vision',
        ],
      },
      {
        id: 'aws-d3',
        name: 'Domain 3: Applications of Foundation Models',
        weight: '28%',
        categories: [
          'MLOps',
          'Cloud AI Platforms',
          'Emerging Trends',
        ],
      },
      {
        id: 'aws-d4',
        name: 'Domain 4: Guidelines for Responsible AI',
        weight: '14%',
        categories: [
          'AI Ethics & Bias',
        ],
      },
      {
        id: 'aws-d5',
        name: 'Domain 5: Security, Compliance & Governance for AI',
        weight: '14%',
        categories: [
          'AI Governance',
          'AI Security',
          'AI in Security Ops',
        ],
      },
    ],
  },

  // ── Azure AI Fundamentals (AI-901, replaces AI-900 retiring Jun 2026) ────────
  {
    id: 'Azure-AI901',
    name: 'Azure AI Fundamentals (AI-901)',
    provider: 'Microsoft',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
    passingScore: 70,
    mockExam: { questions: 50, durationMin: 45 },
    domains: [
      {
        id: 'ai901-d1',
        name: 'Domain 1: AI Workloads and Considerations',
        weight: '20-25%',
        categories: [
          'AI & ML Fundamentals',
          'AI Ethics & Bias',
          'AI Governance',
          'Azure AI Governance',
        ],
      },
      {
        id: 'ai901-d2',
        name: 'Domain 2: Fundamental ML Principles on Azure',
        weight: '25-30%',
        categories: [
          'Data Engineering',
          'Cloud AI Platforms',
          'Azure ML',
          'Azure AI Services',
        ],
      },
      {
        id: 'ai901-d3',
        name: 'Domain 3: Computer Vision Workloads',
        weight: '15-20%',
        categories: [
          'Computer Vision',
          'Azure AI Services',
        ],
      },
      {
        id: 'ai901-d4',
        name: 'Domain 4: NLP Workloads',
        weight: '15-20%',
        categories: [
          'NLP',
          'Azure AI Services',
        ],
      },
      {
        id: 'ai901-d5',
        name: 'Domain 5: Generative AI Workloads',
        weight: '15-20%',
        categories: [
          'Generative AI & LLMs',
          'Generative AI on Azure',
          'Azure AI Services',
        ],
      },
    ],
  },

  // ── Azure AI Apps and Agents Developer Associate (AI-103, replaces AI-102) ──
  {
    id: 'Azure-AI103',
    name: 'Azure AI Apps and Agents Developer (AI-103)',
    provider: 'Microsoft',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
    passingScore: 70,
    mockExam: { questions: 50, durationMin: 100 },
    domains: [
      {
        id: 'ai103-d1',
        name: 'Domain 1: Plan & Manage Azure AI Solutions',
        weight: '25-30%',
        categories: [
          'Cloud AI Platforms',
          'Data Engineering',
          'Azure AI Services',
          'Azure AI Developer',
        ],
      },
      {
        id: 'ai103-d2',
        name: 'Domain 2: Build AI Apps and Agents',
        weight: '30-35%',
        categories: [
          'MLOps',
          'Emerging Trends',
          'Azure AI Developer',
          'Generative AI on Azure',
          'Generative AI & LLMs',
        ],
      },
      {
        id: 'ai103-d3',
        name: 'Domain 3: Implement Knowledge Mining & RAG',
        weight: '15-20%',
        categories: [
          'NLP',
          'Azure AI Developer',
          'Azure AI Services',
        ],
      },
      {
        id: 'ai103-d4',
        name: 'Domain 4: Deploy Secure AI Solutions',
        weight: '15-20%',
        categories: [
          'AI Security',
          'Microsoft Cloud & AI Security',
          'Azure AI Developer',
        ],
      },
      {
        id: 'ai103-d5',
        name: 'Domain 5: Responsible AI & Monitoring',
        weight: '10-15%',
        categories: [
          'AI Ethics & Bias',
          'AI Governance',
          'Azure AI Governance',
        ],
      },
    ],
  },

  // ── Google Professional ML Engineer ───────────────────────────────────────
  {
    id: 'Google-MLE',
    name: 'Professional Machine Learning Engineer',
    provider: 'Google Cloud',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
    passingScore: 80,
    mockExam: { questions: 60, durationMin: 120 },
    domains: [
      {
        id: 'gmle-d1',
        name: 'Domain 1: Architect ML Solutions',
        weight: '13%',
        categories: [
          'AI & ML Fundamentals',
          'Cloud AI Platforms',
        ],
      },
      {
        id: 'gmle-d2',
        name: 'Domain 2: Data Preparation and Feature Engineering',
        weight: '18%',
        categories: [
          'Data Engineering',
        ],
      },
      {
        id: 'gmle-d3',
        name: 'Domain 3: Model Development and Training',
        weight: '18%',
        categories: [
          'Computer Vision',
          'NLP',
        ],
      },
      {
        id: 'gmle-d4',
        name: 'Domain 4: Model Serving and Operations',
        weight: '19%',
        categories: [
          'MLOps',
          'MLOps Security',
          'ML Engineering Security',
          'Generative AI & LLMs',
          'AI/ML Operations',
        ],
      },
      {
        id: 'gmle-d5',
        name: 'Domain 5: Automate and Orchestrate ML Pipelines',
        weight: '20%',
        categories: [
          'Emerging Trends',
          'AI Ethics & Bias',
          'AI Governance',
          'AI/ML Privacy',
        ],
      },
      {
        id: 'gmle-d6',
        name: 'Domain 6: Monitor ML Solutions',
        weight: '12%',
        categories: [
          'AI Security',
          'AI Security Fundamentals',
          'Google Cloud AI Security',
          'AI/ML Operations',
        ],
      },
    ],
  },

  // ── GIAC GOAA ─────────────────────────────────────────────────────────────
  {
    id: 'GIAC-GOAA',
    name: 'GIAC Offensive AI Analyst',
    provider: 'GIAC / SANS',
    badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/40',
    passingScore: 73,
    domains: [
      {
        id: 'goaa-d1',
        name: 'Domain 1: AI Fundamentals & Architecture',
        categories: [
          'AI & ML Fundamentals',
          'Generative AI & LLMs',
          'NLP',
        ],
      },
      {
        id: 'goaa-d2',
        name: 'Domain 2: Vector Databases & Embedding Attacks',
        categories: [
          'Emerging Trends',
          'Computer Vision',
        ],
      },
      {
        id: 'goaa-d3',
        name: 'Domain 3: Custom GPTs & Assistant Security',
        categories: [
          'AI Governance',
        ],
      },
      {
        id: 'goaa-d4',
        name: 'Domain 4: Prompt Injection & LLM Bypass Techniques',
        categories: [
          'Red Teaming AI',
          'AI Security',
          'LLM Security',
          'AI Red Teaming',
        ],
      },
      {
        id: 'goaa-d5',
        name: 'Domain 5: Malicious AI Applications & Red Teaming',
        categories: [
          'AI in Security Ops',
          'MLOps Security',
          'AI Governance',
          'AI Red Teaming',
        ],
      },
    ],
  },

  // ── GIAC GASAE ────────────────────────────────────────────────────────────
  {
    id: 'GIAC-GASAE',
    name: 'GIAC AI Security Automation Engineer',
    provider: 'GIAC / SANS',
    badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/40',
    passingScore: 70,
    domains: [
      {
        id: 'gasae-d1',
        name: 'Domain 1: AI Security Automation Fundamentals',
        categories: [
          'AI Security',
          'AI Security Fundamentals',
          'AI & ML Fundamentals',
          'Emerging Trends',
          'AI Governance',
          'AI Security Engineering',
        ],
      },
      {
        id: 'gasae-d2',
        name: 'Domain 2: AI-Powered Vulnerability Discovery',
        categories: [
          'Red Teaming AI',
          'AI Testing and Security',
          'Computer Vision',
          'AI Security',
          'AI Security Assessment',
        ],
      },
      {
        id: 'gasae-d3',
        name: 'Domain 3: AI-Driven Attack Simulation',
        categories: [
          'NLP',
          'AI Application Security',
          'AI Ethics & Bias',
          'Generative AI & LLMs',
        ],
      },
      {
        id: 'gasae-d4',
        name: 'Domain 4: SOAR-Driven Incident Response',
        categories: [
          'AI in Security Ops',
          'AI Security',
        ],
      },
      {
        id: 'gasae-d5',
        name: 'Domain 5: Infrastructure Remediation Automation',
        categories: [
          'Data Engineering',
          'MLOps',
          'Cloud AI Platforms',
        ],
      },
    ],
  },

  // ── SC-500: Microsoft Security Operations Analyst ─────────────────────────
  {
    id: 'SC-500',
    name: 'Microsoft Cloud & AI Security Engineer',
    provider: 'Microsoft',
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40',
    passingScore: 70,
    mockExam: { questions: 60, durationMin: 100 },
    domains: [
      {
        id: 'sc500-d1',
        name: 'Domain 1: Identity & Access Management',
        weight: '20-25%',
        categories: ['Microsoft Cloud & AI Security'],
        topics: [
          'Microsoft Entra ID',
          'Conditional Access',
          'Privileged Identity Management',
          'Identity Protection',
          'Managed Identity',
          'Workload Identity Federation',
          'Workload Identity',
          'Continuous Access Evaluation',
        ],
      },
      {
        id: 'sc500-d2',
        name: 'Domain 2: Secure Networking & Infrastructure',
        weight: '15-20%',
        categories: ['Microsoft Cloud & AI Security'],
        topics: [
          'Microsoft Defender for Cloud',
          'AI Security Posture Management',
          'Azure Network Security Groups',
          'Azure Network Security',
          'Azure Firewall',
          'Private Endpoints',
          'Azure DDoS',
          'Azure Policy',
          'Network Security',
          'Azure Virtual Network',
          'Network Segmentation',
        ],
      },
      {
        id: 'sc500-d3',
        name: 'Domain 3: Secure Compute, Storage & Data',
        weight: '15-20%',
        categories: ['Microsoft Cloud & AI Security'],
        topics: [
          'Microsoft Purview',
          'DSPM for AI',
          'Insider Risk Management',
          'Adaptive Protection',
          'Data Security',
          'Azure Storage & Compute Security',
          'Azure Key Vault',
          'Azure Storage Account',
          'Storage Security',
          'Encryption at Rest',
          'Defender for Cloud',
        ],
      },
      {
        id: 'sc500-d4',
        name: 'Domain 4: Security Operations',
        weight: '20-25%',
        categories: ['Microsoft Cloud & AI Security'],
        topics: [
          'Microsoft Sentinel',
          'Microsoft Defender XDR',
          'KQL',
          'Advanced Hunting',
          'Automatic Attack Disruption',
          'Case Study',
        ],
      },
      {
        id: 'sc500-d5',
        name: 'Domain 5: Secure AI Workloads',
        weight: '20-25%',
        categories: ['Microsoft Cloud & AI Security'],
        topics: [
          'Azure OpenAI Service',
          'Azure AI Content Safety',
          'Azure AI Foundry',
          'Microsoft Security Copilot',
          'Defender for AI Workloads',
          'Prompt Shields',
          'Copilot Agent',
          'M365 Copilot',
          'Copilot Studio',
        ],
      },
    ],
  },

  // ── CAISP ─────────────────────────────────────────────────────────────────
  {
    id: 'CAISP',
    name: 'Certified AI Security Professional',
    provider: 'Practical DevSecOps',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/40',
    passingScore: 70,
    domains: [
      {
        id: 'caisp-d1',
        name: 'Domain 1: AI & LLM Security Fundamentals',
        categories: [
          'AI Security',
          'AI Security Fundamentals',
          'AI & ML Fundamentals',
          'Generative AI & LLMs',
          'NLP',
        ],
      },
      {
        id: 'caisp-d2',
        name: 'Domain 2: Model Risks & Vulnerabilities',
        categories: [
          'Red Teaming AI',
          'AI Testing and Security',
          'AI Ethics & Bias',
        ],
      },
      {
        id: 'caisp-d3',
        name: 'Domain 3: AI Supply Chain & Governance',
        categories: [
          'AI Governance',
          'Data Engineering',
          'Emerging Trends',
          'Information Security Governance',
          'Information Security Program',
        ],
      },
      {
        id: 'caisp-d4',
        name: 'Domain 4: Securing LLM & RAG Deployments',
        categories: [
          'AI Security',
          'AI Application Security',
          'ML Engineering Security',
          'MLOps Security',
          'Generative AI & LLMs',
          'AI in Security Ops',
          'Emerging Trends',
        ],
      },
      {
        id: 'caisp-d5',
        name: 'Domain 5: AI Security Assessment & Audit',
        categories: [
          'AI Governance',
          'AI Security',
          'Red Teaming AI',
          'Microsoft Cloud & AI Security',
          'Cloud AI Platforms',
          'Information Security Incident Management',
          'AI Governance & Risk',
        ],
      },
    ],
  },

  // ── AWS Certified Security – Specialty (SCS-C03) ──────────────────────────
  {
    id: 'SCS-C03',
    name: 'AWS Certified Security – Specialty',
    provider: 'Amazon Web Services',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
    passingScore: 75,
    mockExam: { questions: 65, durationMin: 170 },
    domains: [
      {
        id: 'scs-d1',
        name: 'Domain 1: Threat Detection & Incident Response',
        weight: '14%',
        categories: [
          'AI Incident Response',
          'AI Threat Detection',
          'AI in Security Ops',
          'AI-Assisted Security Operations',
          'AI-Assisted Defense',
          'Information Security Incident Management',
        ],
      },
      {
        id: 'scs-d2',
        name: 'Domain 2: Security Logging & Monitoring',
        weight: '18%',
        categories: [
          'AI Security Operations',
          'AI in Security Ops',
        ],
      },
      {
        id: 'scs-d3',
        name: 'Domain 3: Infrastructure Security',
        weight: '20%',
        categories: [
          'AI Security Architecture',
          'MLOps Security',
          'AI Security Engineering',
          'Cloud AI Platforms',
        ],
      },
      {
        id: 'scs-d4',
        name: 'Domain 4: Identity & Access Management',
        weight: '16%',
        categories: [
          'AI Security Controls',
          'AI Application Security',
        ],
      },
      {
        id: 'scs-d5',
        name: 'Domain 5: Data Protection',
        weight: '18%',
        categories: [
          'AI Privacy Controls',
          'AI/ML Privacy',
          'AI Privacy Attacks',
          'Data Engineering',
        ],
      },
      {
        id: 'scs-d6',
        name: 'Domain 6: Management & Security Governance',
        weight: '14%',
        categories: [
          'AI Governance',
          'AI Governance & Risk',
          'Information Security Governance',
          'Information Security Program',
          'AI Security Assessment',
          'AI Security',
          'AI Security Fundamentals',
          'AWS AI Security',
        ],
      },
    ],
  },

  // ── CAIS (EC-Council C|AI Security) ───────────────────────────────────────
  {
    id: 'CAIS',
    name: 'C|AI Security',
    provider: 'EC-Council',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
    passingScore: 70,
    domains: [
      {
        id: 'cais-d1',
        name: 'Domain 1: AI Security Fundamentals & Threat Landscape',
        categories: [
          'AI Security',
          'AI Security Fundamentals',
          'AI & ML Fundamentals',
          'Computer Vision',
        ],
      },
      {
        id: 'cais-d2',
        name: 'Domain 2: Adversarial Machine Learning Attacks',
        categories: ['AI Security', 'AI Security Fundamentals', 'Red Teaming AI'],
        topics: [
          'Adversarial ML Attacks', 'Evasion Attacks', 'Data Poisoning', 'Backdoor Attacks',
          'Model Inversion', 'Model Inversion Attack', 'Membership Inference',
          'Membership Inference Attack', 'Model Extraction', 'Model Extraction Attacks',
          'GAN-Based Attacks', 'Token-Level Attacks', 'Adversarial Multimodal Attacks',
          'Adversarial Patch Attacks', 'Adversarial Examples', 'Federated Learning Security',
          'Differential Privacy', 'Adversarial ML Defense', 'Model Robustness',
          'Hardware and Inference Security', 'AI Privacy Attacks',
        ],
      },
      {
        id: 'cais-d3',
        name: 'Domain 3: LLM Security & Prompt Injection Defense',
        categories: ['Red Teaming AI', 'Generative AI & LLMs', 'AI Security'],
        topics: [
          'LLM Red Teaming', 'LLM Security Assessment', 'LLM Red Team Tools',
          'Jailbreak Technique Evolution', 'Jailbreak Techniques', 'Jailbreak Attacks',
          'Indirect Prompt Injection Exploitation', 'Prompt Leakage Exploitation',
          'Prompt Injection Defense', 'Prompt Injection', 'Exfiltration via LLM',
          'Constitutional AI and RLHF', 'Output Security', 'Agentic AI Security',
          'Agentic AI', 'Secure LLM Deployment', 'OWASP LLM Top 10',
          'Custom GPT and Assistant Exploitation', 'Context Window Attacks',
          'Agentic Attacks', 'Offensive AI in Social Engineering',
        ],
      },
      {
        id: 'cais-d4',
        name: 'Domain 4: Securing AI Pipelines & MLOps',
        categories: ['AI in Security Ops', 'AI Application Security', 'AI Testing and Security', 'ML Engineering Security', 'MLOps Security', 'AI Security', 'Red Teaming AI'],
        topics: [
          'AI Supply Chain Security', 'AI Supply Chain', 'MLOps Security', 'Secure AI Deployment',
          'Secure Model Deployment', 'Secure API Design for AI', 'AI Bill of Materials (AI-BOM)',
          'Supply Chain Attacks', 'AI Red Team Methodology', 'AI Red Team Reporting',
          'AI Red Team Operations', 'AI Red Team Scoping', 'AI Testing Methodology',
          'AI Fuzzing Methodology', 'AI Payload Obfuscation', 'Multimodal Jailbreaking',
          'Agentic Attack Chains', 'AI Attack Surface', 'AI Threat Intelligence',
          'SOAR Automation', 'AI Threat Hunting', 'Vector Database Attacks',
          'LLM Output Validation', 'Red Teaming AI', 'AI Red Team Operations',
        ],
      },
      {
        id: 'cais-d5',
        name: 'Domain 5: AI Governance, Risk & Compliance',
        categories: ['AI Governance', 'AI Ethics & Bias', 'AI in Security Ops'],
        topics: [
          'AI Governance', 'AI Incident Response', 'AI Incident Metrics',
          'Explainability and Accountability', 'AI Ethics and Bias', 'Responsible AI / Bias',
          'Watermarking and IP Protection', 'Model Cards and Documentation',
          'AI Transparency Documentation', 'AI Risk Assessment', 'AI Governance Frameworks',
          'EU AI Act', 'AI System Auditing', 'Responsible AI', 'AI Regulatory Compliance',
        ],
      },
    ],
  },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

/** Fast lookup by cert id. */
export const EXAM_CERT_MAP: Record<string, ExamCert> = Object.fromEntries(
  EXAM_CERTS.map((c) => [c.id, c]),
);

/**
 * Returns true if a question matches the given domain.
 * Checks category membership and, if the domain has `topics` defined,
 * also verifies the question topic is in the allowed list.
 */
export function questionMatchesDomain(
  question: { category: string; topic: string },
  domain: ExamDomain,
): boolean {
  if (!domain.categories.includes(question.category)) return false;
  if (domain.topics && domain.topics.length > 0) {
    return domain.topics.includes(question.topic);
  }
  return true;
}
