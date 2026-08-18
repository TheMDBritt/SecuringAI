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
  /** Official passing score percentage (0-100). Shown on result screen. */
  passingScore?: number;
  /** If set, a mock exam preset button is shown with these params. */
  mockExam?: { questions: number; durationMin: number };
  /**
   * What the real exam actually asks of a candidate.
   *
   * Two of these certifications are not multiple-choice at all: CAISP is five
   * hands-on challenges over six hours plus a written report, and GASAE is
   * GIAC's CyberLive format, which is lab tasks in a live environment. Offering
   * a timed 4-option mock for either would rehearse a format the candidate will
   * never see and imply a readiness signal the questions cannot support.
   *
   * They keep their question pools — the concepts are the same and are worth
   * studying — but they carry no mock preset, and the UI says why.
   */
  format?: 'multiple-choice' | 'performance-based';
  /** Shown wherever the cert is offered, when the format needs explaining. */
  formatNote?: string;
  /**
   * Where the *domain weighting* above came from, and how far it can be
   * trusted. This is deliberately about the weighting alone: a cert can have a
   * well-sourced pass mark and format while having no published per-domain
   * split, and CAISP is exactly that case.
   *
   * Two of the three original blueprints were already documented as secondhand.
   * Recording it in the data rather than only in docs/ means the UI can tell a
   * learner which figures are published and which are our best reading, instead
   * of presenting all of them with the same authority.
   */
  blueprintSource?: 'published' | 'secondhand' | 'unweighted';
}

// ─────────────────────────────────────────────────────────────────────────────

export const EXAM_CERTS: ExamCert[] = [
  // ── SecAI+ (CompTIA) ───────────────────────────────────────────────────────
  {
    id: 'SecAI',
    name: 'CompTIA SecAI+',
    provider: 'CompTIA',
    badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-600/60',
    passingScore: 67,
    format: 'multiple-choice',
    blueprintSource: 'published',
    mockExam: { questions: 60, durationMin: 60 },
    domains: [
      {
        id: 'secai-d1',
        name: 'Domain 1: Basic AI concepts related to cybersecurity',
        weight: '17%',
        categories: [
          'AI & ML Fundamentals',
          'Generative AI & LLMs',
          'NLP',
          'Computer Vision',
          'LLM Defense Techniques',
          'LLM Attack Techniques',
          'LLM Security',
          'Azure AI Developer',
          'AI Security Engineering',
        ],
      },
      {
        id: 'secai-d2',
        name: 'Domain 2: Securing AI systems',
        weight: '40%',
        categories: [
          'AI Security',
          'AI Security Fundamentals',
          'AI Application Security',
          'AI Testing and Security',
          'ML Engineering Security',
          'MLOps Security',
          'MLOps',
          'Data Engineering',
          'Cloud AI Platforms',
          'AI Red Teaming',
          'AI Red Team Methodology',
          'AI Red Team & Adversarial ML',
          'AI Security Architecture',
          'AI Supply Chain',
          'Microsoft Cloud & AI Security',
          'Agentic AI Security',
          'AWS AI Security',
          'Google Cloud AI Security',
          'AI Security Controls',
          'AI Supply Chain Security',
        ],
      },
      {
        id: 'secai-d3',
        name: 'Domain 3: AI-assisted security',
        weight: '24%',
        categories: [
          'AI in Security Ops',
          'Emerging Trends',
          'Cloud AI Platforms',
          'AI-Assisted Defense',
          'AI-Assisted Security Operations',
          'AI Security Assessment',
          'MLOps',
          'AI/ML Operations',
          'Agentic AI Defense',
          'Red Teaming AI',
          'RAG Attack & Defense',
        ],
      },
      {
        id: 'secai-d4',
        name: 'Domain 4: AI governance, risk, and compliance',
        weight: '19%',
        categories: [
          'AI Governance',
          'AI Ethics & Bias',
          'Azure AI Governance',
          'AI Governance & Risk',
          'AI/ML Privacy',
          'AI Risk Management',
          'AI Privacy Controls',
          'Information Security Governance',
        ],
      },
    ],
  },

  // ── AWS AI Foundations (AIF-C01) ───────────────────────────────────────────
  {
    id: 'AWS-AIF-C01',
    name: 'AWS Certified AI Practitioner',
    provider: 'Amazon Web Services',
    badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-600/60',
    passingScore: 70,
    format: 'multiple-choice',
    blueprintSource: 'secondhand',
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
    badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-600/60',
    passingScore: 70,
    format: 'multiple-choice',
    blueprintSource: 'secondhand',
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
    badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-600/60',
    passingScore: 70,
    format: 'multiple-choice',
    blueprintSource: 'secondhand',
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
    badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-600/60',
    passingScore: 80,
    format: 'multiple-choice',
    blueprintSource: 'secondhand',
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
    badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-600/60',
    // GIAC publishes 67% for the exam version released on or after
    // 24 Jan 2026. This previously read 73%, which is a materially different
    // bar for a learner calibrating against it.
    passingScore: 67,
    format: 'multiple-choice',
    // GOAA is a multiple-choice exam, so unlike GASAE and CAISP a mock is not
    // ruled out by the format. It is ruled out by sourcing: neither the domain
    // weights nor the published question count and time limit could be
    // obtained, and a mock built on guesses at those would misrepresent the
    // exam it claims to rehearse while looking exactly like the sourced ones.
    // Without this note the mock button was simply absent and nothing said why,
    // which reads as a bug rather than a decision.
    formatNote:
      'No timed mock is offered for GOAA yet. GIAC does not publish domain weightings for ' +
      'this exam, and the question count and time limit could not be sourced, so a mock ' +
      'would have to invent the shape of the paper. Practice sets below draw from the full ' +
      'pool instead.',
    blueprintSource: 'unweighted',
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
    badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-600/60',
    passingScore: 70,
    format: 'performance-based',
    formatNote:
      'GASAE is a GIAC CyberLive certification: lab tasks performed in a live environment, ' +
      'not recall questions. These questions build the underlying concepts; they cannot ' +
      'rehearse the exam format, so no mock is offered.',
    blueprintSource: 'unweighted',
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

  // ── SC-500: Microsoft Cloud & AI Security Engineer ─────────────────────────
  {
    id: 'SC-500',
    name: 'Microsoft Cloud & AI Security Engineer',
    provider: 'Microsoft',
    badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-600/60',
    passingScore: 70,
    format: 'multiple-choice',
    blueprintSource: 'secondhand',
    mockExam: { questions: 60, durationMin: 100 },
    domains: [
      {
        id: 'sc500-d1',
        name: 'Domain 1: Manage identity, access, and governance',
        weight: '20-25%',
        categories: [
          'AI Application Security',
          'AI Governance',
          'AI Governance & Risk',
          'AI Red Team',
          'AI Security',
          'AI Security Controls',
          'AI Security Engineering',
          'AI Security Fundamentals',
          'AI Security Operations',
          'AI Threat Detection',
          'AI in Security Ops',
          'AI-Assisted Defense',
          'AI-Assisted Security Operations',
          'Azure AI Developer',
          'Azure AI Development',
          'Azure AI Engineering',
          'Cloud AI Platforms',
          'Generative AI on Azure',
          'Microsoft Cloud & AI Security',
        ],
        topics: [
          'Microsoft Entra ID',
          'Conditional Access',
          'Identity Protection',
          'Privileged Identity Management',
          'Managed Identity',
          'Workload Identity Federation',
          'Workload Identity',
          'Continuous Access Evaluation',
          'Azure Key Vault',
          'Azure Policy',
          'Conditional Access for AI Apps',
          'Microsoft Entra AI Governance',
          'Microsoft Entra ID for AI Agent Identity',
          'Entra ID for AI Workloads',
          'Zero Trust Architecture',
          'Zero Trust for AI Workloads',
          'Zero Trust and AI',
          'Agentic AI Authorization Patterns',
          'API Key and Credential Management',
          'AI Risk Classification',
          'Third-Party AI Risk',
          'AI Third-Party Risk',
          'Security Copilot Governance',
          'Copilot Data Governance',
          'AI System Auditing',
          'Azure OpenAI Compliance',
          'Azure AI Responsible Use',
          'AI Bill of Materials (AI-BOM)',
        ],
      },
      {
        id: 'sc500-d2',
        name: 'Domain 2: Secure storage, databases, and networking',
        weight: '25-30%',
        categories: [
          'AI Application Security',
          'AI Governance',
          'AI Governance & Risk',
          'AI Red Team',
          'AI Security',
          'AI Security Controls',
          'AI Security Engineering',
          'AI Security Fundamentals',
          'AI Security Operations',
          'AI Threat Detection',
          'AI in Security Ops',
          'AI-Assisted Defense',
          'AI-Assisted Security Operations',
          'Azure AI Developer',
          'Azure AI Development',
          'Azure AI Engineering',
          'Cloud AI Platforms',
          'Generative AI on Azure',
          'Microsoft Cloud & AI Security',
        ],
        topics: [
          'Azure Network Security',
          'Azure Firewall',
          'Azure Network Security Groups',
          'Private Endpoints',
          'Azure DDoS',
          'Storage Security',
          'Azure Storage & Compute Security',
          'Microsoft Purview',
          'Insider Risk Management',
          'Adaptive Protection',
          'M365 Copilot DLP',
          'Azure AI Search Index Security',
          'Azure AI Search RAG Architecture Security',
          'Azure OpenAI RAG',
          'Azure OpenAI Network Controls',
          'Azure AI Foundry Network Security',
          'Azure OpenAI Fine-Tuning Data Governance',
        ],
      },
      {
        id: 'sc500-d3',
        name: 'Domain 3: Secure compute',
        weight: '20-25%',
        categories: [
          'AI Application Security',
          'AI Governance',
          'AI Governance & Risk',
          'AI Red Team',
          'AI Security',
          'AI Security Controls',
          'AI Security Engineering',
          'AI Security Fundamentals',
          'AI Security Operations',
          'AI Threat Detection',
          'AI in Security Ops',
          'AI-Assisted Defense',
          'AI-Assisted Security Operations',
          'Azure AI Developer',
          'Azure AI Development',
          'Azure AI Engineering',
          'Cloud AI Platforms',
          'Generative AI on Azure',
          'Microsoft Cloud & AI Security',
        ],
        topics: [
          'VM Security',
          'Container Security',
          'Azure OpenAI Service',
          'Azure OpenAI',
          'Azure OpenAI Deployment',
          'Azure OpenAI System Prompts',
          'Azure OpenAI Abuse Prevention',
          'Azure OpenAI Content Filter Configuration',
          'Azure OpenAI Prompt Shields',
          'Azure AI Content Safety',
          'Azure AI Content Filtering',
          'Azure AI Content Safety Integration',
          'Azure AI Content Safety Harm Categories',
          'Prompt Shields',
          'Azure AI Prompt Shields',
          'Prompt Injection Defense',
          'Azure AI Foundry',
          'Azure AI Foundry Security',
          'Azure AI Foundry Evaluation',
          'Azure AI Foundry Safety Evaluation',
          'Defender for AI Workloads',
          'Microsoft Defender for AI Workloads',
          'Defender for AI Alerts',
          'Defender for Cloud AI Threat Protection',
          'M365 Copilot',
          'Copilot Studio',
          'Copilot Studio Security',
          'Copilot Agent',
          'DSPM for AI',
          'Microsoft Purview for AI',
          'Microsoft Purview AI Hub',
          'Purview DSPM for AI Oversharing Risk',
          'Secure Model Deployment',
          'LLM Output Validation',
          'Agentic AI Security',
          'Semantic Kernel Security Patterns',
          'AI API Security',
          'AI Application Logging',
          'Azure AI Monitoring',
          'Azure ML Model Monitoring',
          'Generative AI on Azure',
          'Azure AI Developer',
          'Cloud AI Platforms',
          'Microsoft AI Red Teaming',
          'GitHub Advanced Security',
        ],
      },
      {
        id: 'sc500-d4',
        name: 'Domain 4: Manage and monitor security posture',
        weight: '20-25%',
        categories: [
          'AI Application Security',
          'AI Governance',
          'AI Governance & Risk',
          'AI Red Team',
          'AI Security',
          'AI Security Controls',
          'AI Security Engineering',
          'AI Security Fundamentals',
          'AI Security Operations',
          'AI Threat Detection',
          'AI in Security Ops',
          'AI-Assisted Defense',
          'AI-Assisted Security Operations',
          'Azure AI Developer',
          'Azure AI Development',
          'Azure AI Engineering',
          'Cloud AI Platforms',
          'Generative AI on Azure',
          'Microsoft Cloud & AI Security',
        ],
        topics: [
          'Microsoft Sentinel',
          'Microsoft Sentinel KQL',
          'KQL',
          'KQL (Kusto Query Language)',
          'KQL for AI Security',
          'KQL Security Automation',
          'Advanced Hunting',
          'Microsoft Defender XDR',
          'Automatic Attack Disruption',
          'Microsoft Defender for Cloud',
          'AI Security Posture Management',
          'Defender for Cloud AI Security Posture',
          'Microsoft Security Copilot',
          'Security Copilot',
          'Copilot for Security',
          'Microsoft Security Copilot Investigations',
          'Security Copilot Plugins',
          'Detection Rule Generation',
          'Detection Rules',
          'AI Threat Hunting',
          'AI-Assisted SOC',
          'AI-Powered SIEM',
          'AI-Powered SIEM Enhancement',
          'AI-Assisted Log Analysis',
          'AI Threat Intelligence',
          'AI Model Security Operations',
          'Case Study',
        ],
      },
    ],
  },

  // ── CAISP ─────────────────────────────────────────────────────────────────
  {
    id: 'CAISP',
    name: 'Certified AI Security Professional',
    provider: 'Practical DevSecOps',
    badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-600/60',
    passingScore: 80,
    format: 'performance-based',
    formatNote:
      'CAISP is five hands-on challenges over six hours, plus a written report submitted ' +
      'within 24 hours. There are no multiple-choice questions. These questions build the ' +
      'concepts the exam tests; they cannot rehearse its format, so no mock is offered.',
    blueprintSource: 'unweighted',
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

  // ── AWS Certified Security - Specialty ───────────────────────────────────
  {
    id: 'SCS-C03',
    name: 'AWS Certified Security - Specialty',
    provider: 'Amazon Web Services',
    badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-600/60',
    passingScore: 75,
    format: 'multiple-choice',
    blueprintSource: 'secondhand',
    mockExam: { questions: 65, durationMin: 170 },
    domains: [
      {
        id: 'scs-d1',
        name: 'Domain 1: Detection',
        weight: '16%',
        categories: [
          'AWS Detection',
          'AI Threat Detection',
          'AI in Security Ops',
          'Threat Hunting',
        ],
      },
      {
        id: 'scs-d2',
        name: 'Domain 2: Incident Response',
        weight: '14%',
        categories: [
          'AWS Incident Response',
          'AI Incident Response',
          'Information Security Incident Management',
          'Incident Response',
        ],
      },
      {
        id: 'scs-d3',
        name: 'Domain 3: Infrastructure Security',
        weight: '18%',
        categories: [
          'AWS Infrastructure Security',
          'AI Security Architecture',
          'MLOps Security',
          'AI Security Engineering',
          'Cloud AI Platforms',
        ],
      },
      {
        id: 'scs-d4',
        name: 'Domain 4: Identity and Access Management',
        weight: '20%',
        categories: [
          'AWS Identity and Access Management',
          'AI Security Controls',
          'AI Application Security',
          'Identity Management',
        ],
      },
      {
        id: 'scs-d5',
        name: 'Domain 5: Data Protection',
        weight: '18%',
        categories: [
          'AWS Data Protection',
          'AI Privacy Controls',
          'AI/ML Privacy',
          'AI Privacy Attacks',
          'Data Engineering',
          'Data Security',
        ],
      },
      {
        id: 'scs-d6',
        name: 'Domain 6: Security Foundations and Governance',
        weight: '14%',
        categories: [
          'AWS Security Governance',
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
    badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-600/60',
    passingScore: 70,
    format: 'multiple-choice',
    mockExam: { questions: 80, durationMin: 100 },
    blueprintSource: 'unweighted',
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

/**
 * Parses a published domain weight into a fraction of the exam.
 *
 * Blueprints state weights either as a single figure ("40%") or as a range
 * ("20-25%"), and a range has to be read as its midpoint rather than its lower
 * bound. This lived as a closure inside the quiz draw, so a second caller
 * reached for parseFloat and silently disagreed with it on every range weight,
 * which is most of SC-500.
 *
 * Returns null when a cert publishes no weight for the domain.
 */
export function parseDomainWeight(weight?: string): number | null {
  if (!weight) return null;
  const nums = weight.match(/\d+(?:\.\d+)?/g);
  if (!nums || nums.length === 0) return null;
  const vals = nums.map(Number);
  return vals.reduce((a, b) => a + b, 0) / vals.length / 100;
}

/**
 * The domain number from a domain id, e.g. "secai-d2" gives "2".
 *
 * Objective ids namespace by domain number ("SecAI:2.6"), so joining progress
 * to a blueprint needs this. Reading it with a single \d at a call site breaks
 * on a two-digit domain and on any id that does not follow the dN convention.
 */
export function domainNumber(domainId: string): string | null {
  return /d(\d+)$/.exec(domainId)?.[1] ?? null;
}
