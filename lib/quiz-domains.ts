/**
 * Exam-centric quiz domain map.
 *
 * Each entry describes one certification and its official exam domains.
 * Domains carry filter criteria — either `topics` (matched against
 * question.topic) or `categories` (matched against question.category).
 * An empty criteria object means "all questions for this cert".
 *
 * Sources: official exam guides / study guides only.
 * SC-500: learn.microsoft.com/credentials/certifications/cloud-ai-security-engineer-associate
 * SecAI+: comptia.org/certifications/secai
 * AWS AIF-C01: aws.amazon.com/certification/certified-ai-practitioner
 * Azure AI-901: learn.microsoft.com/credentials/certifications/azure-ai-fundamentals
 * Azure AI-103: learn.microsoft.com/credentials/certifications/azure-ai-developer-associate
 * Google Pro MLE: cloud.google.com/learn/certification/machine-learning-engineer
 * GIAC-GOAA: giac.org/certifications/offensive-ai-analyst-goaa
 * GIAC-GASAE: giac.org/certifications/ai-security-automation-engineer-gasae
 * CAISP: practical-devsecops.com/certifications/caisp
 */

export interface QuizDomain {
  name: string;
  pct?: string;
  /** Match against question.topic (exact). Leave undefined = any topic. */
  topics?: string[];
  /** Match against question.category (exact). Leave undefined = any category. */
  categories?: string[];
}

export interface CertQuizConfig {
  id: string;
  name: string;
  provider: string;
  /** Tailwind color token, e.g. "red" → border-red-500/40, text-red-400 */
  color: string;
  difficulty: string;
  examQuestions: string;
  duration: string;
  domains: QuizDomain[];
}

export const CERT_QUIZ_CONFIGS: CertQuizConfig[] = [
  // ── SC-500 ───────────────────────────────────────────────────────────────
  {
    id: 'SC-500',
    name: 'Microsoft Cloud and AI Security Engineer Associate',
    provider: 'Microsoft',
    color: 'cyan',
    difficulty: 'Intermediate',
    examQuestions: '40–60',
    duration: '100 min',
    domains: [
      {
        name: 'Identity & Access Management',
        pct: '20–25%',
        topics: [
          'Microsoft Entra ID',
          'Conditional Access',
          'Continuous Access Evaluation',
          'Identity Protection',
          'Managed Identity',
          'Workload Identity Federation',
          'Workload Identity',
          'Privileged Identity Management',
          'Enterprise Applications',
          'External Identities',
        ],
      },
      {
        name: 'Security Operations & Threat Detection',
        pct: '20–25%',
        topics: [
          'Microsoft Defender XDR',
          'Microsoft Sentinel',
          'KQL',
          'Microsoft Security Copilot',
          'Adaptive Protection',
          'Advanced Hunting',
          'Automatic Attack Disruption',
          'Copilot Agent',
          'Copilot Studio',
        ],
      },
      {
        name: 'Cloud & Infrastructure Security',
        pct: '15–20%',
        topics: [
          'Microsoft Defender for Cloud',
          'AI Security Posture Management',
          'DSPM for AI',
          'Network Security',
          'Storage Security',
          'Key Vault',
          'Azure Policy',
        ],
      },
      {
        name: 'AI Workloads & Data Governance',
        pct: '20–25%',
        topics: [
          'Microsoft Purview',
          'Azure OpenAI Service',
          'Prompt Shields',
          'Azure AI Foundry',
          'Azure AI Content Safety',
          'Defender for AI Workloads',
          'M365 Copilot',
          'Insider Risk Management',
        ],
      },
      {
        name: 'Integrated Case Studies',
        topics: ['Case Study'],
      },
    ],
  },

  // ── CompTIA SecAI+ ───────────────────────────────────────────────────────
  {
    id: 'SecAI',
    name: 'CompTIA SecAI+',
    provider: 'CompTIA',
    color: 'red',
    difficulty: 'Intermediate',
    examQuestions: '60',
    duration: '60 min',
    domains: [
      {
        name: 'Basic AI Concepts',
        pct: '17%',
        categories: ['AI & ML Fundamentals', 'Generative AI & LLMs', 'NLP'],
      },
      {
        name: 'Securing AI Systems',
        pct: '40%',
        categories: ['AI Security', 'Red Teaming AI', 'Computer Vision'],
      },
      {
        name: 'AI-Assisted Security Operations',
        pct: '24%',
        categories: ['AI in Security Ops'],
      },
      {
        name: 'AI Governance & Compliance',
        pct: '19%',
        categories: ['AI Governance', 'AI Ethics & Bias'],
      },
    ],
  },

  // ── AWS AIF-C01 ──────────────────────────────────────────────────────────
  {
    id: 'AWS-AIF-C01',
    name: 'AWS Certified AI Practitioner',
    provider: 'Amazon Web Services',
    color: 'amber',
    difficulty: 'Foundational',
    examQuestions: '65',
    duration: '90 min',
    domains: [
      {
        name: 'AI & ML Fundamentals',
        pct: '20%',
        categories: ['AI & ML Fundamentals'],
      },
      {
        name: 'Generative AI Fundamentals',
        pct: '24%',
        categories: ['Generative AI & LLMs'],
      },
      {
        name: 'Foundation Model Applications',
        pct: '28%',
        categories: ['Cloud AI Platforms', 'MLOps'],
      },
      {
        name: 'Responsible AI',
        pct: '14%',
        categories: ['AI Ethics & Bias'],
      },
      {
        name: 'Security, Compliance & Governance',
        pct: '14%',
        categories: ['AI Governance'],
      },
    ],
  },

  // ── Azure AI-901 ─────────────────────────────────────────────────────────
  {
    id: 'Azure-AI901',
    name: 'Microsoft Azure AI Fundamentals (AI-901)',
    provider: 'Microsoft',
    color: 'blue',
    difficulty: 'Foundational',
    examQuestions: '40–60',
    duration: '45 min',
    domains: [
      {
        name: 'AI Workloads & Considerations',
        categories: ['AI & ML Fundamentals'],
      },
      {
        name: 'Computer Vision',
        categories: ['Computer Vision'],
      },
      {
        name: 'NLP & Language',
        categories: ['NLP'],
      },
      {
        name: 'Generative AI',
        categories: ['Generative AI & LLMs'],
      },
      {
        name: 'Responsible AI',
        categories: ['AI Ethics & Bias'],
      },
    ],
  },

  // ── Azure AI-103 ─────────────────────────────────────────────────────────
  {
    id: 'Azure-AI103',
    name: 'Azure AI Apps and Agents Developer Associate (AI-103)',
    provider: 'Microsoft',
    color: 'blue',
    difficulty: 'Intermediate',
    examQuestions: '~50',
    duration: '100 min',
    domains: [
      {
        name: 'Plan & Manage Azure AI Solutions',
        pct: '25–30%',
        topics: ['Azure AI Engineer'],
      },
      {
        name: 'AI App & Agent Development',
        pct: '25–30%',
        topics: ['Agentic AI', 'RAG', 'Language Models', 'Fine-Tuning'],
      },
      {
        name: 'Generative AI Solutions',
        pct: '20–25%',
        categories: ['Generative AI & LLMs'],
      },
      {
        name: 'NLP Solutions',
        pct: '15–20%',
        categories: ['NLP'],
      },
      {
        name: 'Responsible AI & Monitoring',
        pct: '10–15%',
        topics: ['Responsible AI', 'Data Drift', 'Model Monitoring', 'Azure Responsible AI', 'Model Cards'],
      },
    ],
  },

  // ── Google Pro MLE ───────────────────────────────────────────────────────
  {
    id: 'Google-MLE',
    name: 'Google Professional ML Engineer',
    provider: 'Google Cloud',
    color: 'emerald',
    difficulty: 'Advanced',
    examQuestions: '60',
    duration: '120 min',
    domains: [
      {
        name: 'ML Architecture & Low-Code AI',
        pct: '~13%',
        categories: ['Cloud AI Platforms'],
      },
      {
        name: 'ML Engineering',
        pct: '~28%',
        categories: ['AI & ML Fundamentals', 'Data Engineering'],
      },
      {
        name: 'Model Deployment & Serving',
        pct: '~19%',
        topics: ['Model Deployment', 'Model Monitoring', 'CI/CD for ML'],
      },
      {
        name: 'ML Pipelines & Automation',
        pct: '~20%',
        topics: ['Training Pipeline', 'LoRA & Quantization', 'Fine-Tuning'],
      },
      {
        name: 'Monitoring & Responsible AI',
        pct: '~20%',
        categories: ['AI Ethics & Bias', 'MLOps'],
      },
    ],
  },

  // ── GIAC-GOAA ────────────────────────────────────────────────────────────
  {
    id: 'GIAC-GOAA',
    name: 'GIAC Offensive AI Analyst',
    provider: 'GIAC / SANS',
    color: 'orange',
    difficulty: 'Advanced',
    examQuestions: 'Hands-on (CyberLive)',
    duration: 'Practical',
    domains: [
      {
        name: 'AI Fundamentals & Prompt Engineering',
        categories: ['AI & ML Fundamentals', 'Generative AI & LLMs'],
      },
      {
        name: 'LLM Attack Techniques',
        categories: ['AI Security'],
      },
      {
        name: 'Offensive Red Team Operations',
        categories: ['Red Teaming AI'],
      },
    ],
  },

  // ── GIAC-GASAE ───────────────────────────────────────────────────────────
  {
    id: 'GIAC-GASAE',
    name: 'GIAC AI Security Automation Engineer',
    provider: 'GIAC / SANS',
    color: 'orange',
    difficulty: 'Intermediate–Advanced',
    examQuestions: 'Hands-on (CyberLive)',
    duration: 'Practical',
    domains: [
      {
        name: 'AI Security Automation',
        categories: ['AI in Security Ops'],
      },
      {
        name: 'AI Vulnerabilities & Attacks',
        categories: ['AI Security'],
      },
      {
        name: 'Red Team & Detection Engineering',
        categories: ['Red Teaming AI'],
      },
    ],
  },

  // ── CAISP ────────────────────────────────────────────────────────────────
  {
    id: 'CAISP',
    name: 'Certified AI Security Professional',
    provider: 'Practical DevSecOps',
    color: 'purple',
    difficulty: 'Advanced (Practical)',
    examQuestions: '5 real-world challenges',
    duration: '6 hrs + 24hr report',
    domains: [
      {
        name: 'AI & LLM Security',
        categories: ['AI Security'],
      },
      {
        name: 'AI Red Teaming & Exploitation',
        categories: ['Red Teaming AI'],
      },
      {
        name: 'AI Governance & Compliance',
        categories: ['AI Governance', 'AI Ethics & Bias'],
      },
    ],
  },
];

/** Cert IDs that are AI-adjacent enough to be in scope. */
export const VALID_CERT_IDS = CERT_QUIZ_CONFIGS.map((c) => c.id);

/** Look up a cert config by ID. */
export function getCertConfig(id: string): CertQuizConfig | undefined {
  return CERT_QUIZ_CONFIGS.find((c) => c.id === id);
}

/**
 * Filter a question array to those matching a given cert + domain selection.
 * `selectedDomains` = empty array means all domains for that cert.
 */
export function filterByDomain<T extends { certTags: string[]; topic: string; category: string }>(
  questions: T[],
  certId: string,
  selectedDomains: string[],
): T[] {
  const certConf = getCertConfig(certId);
  if (!certConf) return [];

  const certFiltered = questions.filter((q) => q.certTags.includes(certId));
  if (selectedDomains.length === 0) return certFiltered;

  const activeDomains = certConf.domains.filter((d) => selectedDomains.includes(d.name));
  if (activeDomains.length === 0) return certFiltered;

  return certFiltered.filter((q) =>
    activeDomains.some((d) => {
      const topicMatch    = !d.topics    || d.topics.includes(q.topic);
      const categoryMatch = !d.categories || d.categories.includes(q.category);
      // If domain specifies both, a question must match at least one.
      if (d.topics && d.categories) return d.topics.includes(q.topic) || d.categories.includes(q.category);
      if (d.topics)    return topicMatch;
      if (d.categories) return categoryMatch;
      return true;
    }),
  );
}
