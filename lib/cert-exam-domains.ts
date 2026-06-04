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
}

// ─────────────────────────────────────────────────────────────────────────────

export const EXAM_CERTS: ExamCert[] = [
  // ── SecAI+ (CompTIA) ───────────────────────────────────────────────────────
  {
    id: 'SecAI',
    name: 'SecurityAI+',
    provider: 'CompTIA',
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/40',
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

  // ── Azure AI Fundamentals (AI-900) ─────────────────────────────────────────
  {
    id: 'Azure-AI901',
    name: 'Azure AI Fundamentals',
    provider: 'Microsoft',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
    domains: [
      {
        id: 'ai900-d1',
        name: 'Domain 1: AI Workloads and Considerations',
        weight: '20-25%',
        categories: [
          'AI & ML Fundamentals',
          'AI Ethics & Bias',
          'AI Governance',
        ],
      },
      {
        id: 'ai900-d2',
        name: 'Domain 2: Fundamental ML Principles on Azure',
        weight: '25-30%',
        categories: [
          'Data Engineering',
          'Cloud AI Platforms',
        ],
      },
      {
        id: 'ai900-d3',
        name: 'Domain 3: Computer Vision Workloads',
        weight: '15-20%',
        categories: [
          'Computer Vision',
        ],
      },
      {
        id: 'ai900-d4',
        name: 'Domain 4: NLP Workloads',
        weight: '15-20%',
        categories: [
          'NLP',
        ],
      },
      {
        id: 'ai900-d5',
        name: 'Domain 5: Generative AI Workloads',
        weight: '15-20%',
        categories: [
          'Generative AI & LLMs',
        ],
      },
    ],
  },

  // ── Azure AI Engineer Associate (AI-102) ───────────────────────────────────
  {
    id: 'Azure-AI103',
    name: 'Azure AI Engineer Associate',
    provider: 'Microsoft',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
    domains: [
      {
        id: 'ai102-d1',
        name: 'Domain 1: Plan & Manage Azure AI Solutions',
        weight: '25-30%',
        categories: [
          'Cloud AI Platforms',
          'Data Engineering',
        ],
      },
      {
        id: 'ai102-d2',
        name: 'Domain 2: AI App and Agent Development',
        weight: '25-30%',
        categories: [
          'MLOps',
          'Emerging Trends',
          'Computer Vision',
        ],
      },
      {
        id: 'ai102-d3',
        name: 'Domain 3: NLP Solutions',
        weight: '15-20%',
        categories: [
          'NLP',
        ],
      },
      {
        id: 'ai102-d4',
        name: 'Domain 4: Generative AI Solutions',
        weight: '20-25%',
        categories: [
          'Generative AI & LLMs',
        ],
      },
      {
        id: 'ai102-d5',
        name: 'Domain 5: Responsible AI & Monitoring',
        weight: '10-15%',
        categories: [
          'AI Ethics & Bias',
          'AI Governance',
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
          'Generative AI & LLMs',
        ],
      },
      {
        id: 'gmle-d5',
        name: 'Domain 5: Automate and Orchestrate ML Pipelines',
        weight: '20%',
        categories: [
          'Emerging Trends',
        ],
      },
      {
        id: 'gmle-d6',
        name: 'Domain 6: Monitor ML Solutions',
        weight: '12%',
        categories: [
          'AI Security',
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
        ],
      },
      {
        id: 'goaa-d5',
        name: 'Domain 5: Malicious AI Applications & Red Teaming',
        categories: [
          'AI in Security Ops',
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
    domains: [
      {
        id: 'gasae-d1',
        name: 'Domain 1: AI Security Automation Fundamentals',
        categories: [
          'AI Security',
          'AI & ML Fundamentals',
        ],
      },
      {
        id: 'gasae-d2',
        name: 'Domain 2: AI-Powered Vulnerability Discovery',
        categories: [
          'Red Teaming AI',
          'Computer Vision',
        ],
      },
      {
        id: 'gasae-d3',
        name: 'Domain 3: AI-Driven Attack Simulation',
        categories: [
          'NLP',
          'AI Ethics & Bias',
        ],
      },
      {
        id: 'gasae-d4',
        name: 'Domain 4: SOAR-Driven Incident Response',
        categories: [
          'AI in Security Ops',
        ],
      },
      {
        id: 'gasae-d5',
        name: 'Domain 5: Infrastructure Remediation Automation',
        categories: [
          'Data Engineering',
        ],
      },
    ],
  },

  // ── SC-500: Microsoft Security Operations Analyst ─────────────────────────
  {
    id: 'SC-500',
    name: 'Microsoft Security Operations Analyst',
    provider: 'Microsoft',
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40',
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
    provider: 'CAISP',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/40',
    domains: [
      {
        id: 'caisp-d1',
        name: 'Domain 1: AI & LLM Security Fundamentals',
        categories: [
          'AI Security',
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
        ],
      },
      {
        id: 'caisp-d4',
        name: 'Domain 4: Securing LLM & RAG Deployments',
        categories: [
          'Computer Vision',
          'AI in Security Ops',
        ],
      },
      {
        id: 'caisp-d5',
        name: 'Domain 5: AI Security Assessment & Audit',
        categories: [
          'AI Governance',
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
