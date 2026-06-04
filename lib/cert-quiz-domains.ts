import type { QuizQuestion } from '@/types';
import { QUIZ_QUESTIONS } from './playbook-quiz';

export interface CertDomain {
  name: string;
  pct?: string;
  /** For category-based filtering */
  categories?: string[];
  /** For topic-based filtering (SC-500 only) */
  topics?: string[];
  /** All questions in this cert+domain combo (computed at runtime) */
  questionCount?: number;
}

export interface CertQuizConfig {
  id: string;
  name: string;
  provider: string;
  difficulty: string;
  examQuestions: string;
  duration: string;
  color: string; // tailwind color name for styling
  domains: CertDomain[];
}

export const CERT_QUIZ_CONFIGS: CertQuizConfig[] = [
  {
    id: 'SecAI',
    name: 'CompTIA SecAI+',
    provider: 'CompTIA',
    difficulty: 'Intermediate',
    examQuestions: '60 questions',
    duration: '60 min',
    color: 'red',
    domains: [
      {
        name: 'AI Concepts & ML Fundamentals',
        pct: '17%',
        categories: ['AI & ML Fundamentals', 'Generative AI & LLMs'],
      },
      {
        name: 'Securing AI Systems',
        pct: '40%',
        categories: ['AI Security', 'Red Teaming AI'],
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
  {
    id: 'AWS-AIF-C01',
    name: 'AWS Certified AI Practitioner',
    provider: 'Amazon Web Services',
    difficulty: 'Foundational',
    examQuestions: '65 questions',
    duration: '90 min',
    color: 'amber',
    domains: [
      {
        name: 'Fundamentals of AI and ML',
        pct: '20%',
        categories: ['AI & ML Fundamentals'],
      },
      {
        name: 'Fundamentals of GenAI',
        pct: '24%',
        categories: ['Generative AI & LLMs'],
      },
      {
        name: 'Applications of Foundation Models',
        pct: '28%',
        categories: ['Cloud AI Platforms'],
      },
      {
        name: 'Guidelines for Responsible AI',
        pct: '14%',
        categories: ['AI Ethics & Bias', 'AI Governance'],
      },
      {
        name: 'Security, Compliance & Governance',
        pct: '14%',
        categories: ['AI Security'],
      },
    ],
  },
  {
    id: 'Azure-AI901',
    name: 'Microsoft Azure AI Fundamentals (AI-901)',
    provider: 'Microsoft',
    difficulty: 'Foundational',
    examQuestions: '40–60 questions',
    duration: '45 min',
    color: 'blue',
    domains: [
      {
        name: 'AI Workloads and Considerations',
        categories: ['AI & ML Fundamentals', 'AI Ethics & Bias'],
      },
      {
        name: 'Fundamental ML Principles on Azure',
        categories: ['AI & ML Fundamentals', 'Cloud AI Platforms'],
      },
      {
        name: 'Computer Vision Workloads',
        categories: ['Computer Vision'],
      },
      {
        name: 'NLP Workloads',
        categories: ['NLP'],
      },
      {
        name: 'Generative AI Workloads',
        categories: ['Generative AI & LLMs', 'Cloud AI Platforms'],
      },
    ],
  },
  {
    id: 'Azure-AI103',
    name: 'Azure AI Apps and Agents Developer Associate (AI-103)',
    provider: 'Microsoft',
    difficulty: 'Intermediate',
    examQuestions: '~50 questions',
    duration: '100 min',
    color: 'blue',
    domains: [
      {
        name: 'Plan & Manage Azure AI Solutions',
        pct: '25–30%',
        categories: ['Cloud AI Platforms', 'AI Governance'],
      },
      {
        name: 'AI App and Agent Development',
        pct: '25–30%',
        categories: ['Cloud AI Platforms', 'Generative AI & LLMs'],
      },
      {
        name: 'Generative AI Solutions',
        pct: '20–25%',
        categories: ['Generative AI & LLMs', 'Cloud AI Platforms'],
      },
      {
        name: 'NLP Solutions',
        pct: '15–20%',
        categories: ['NLP', 'Cloud AI Platforms'],
      },
      {
        name: 'Responsible AI & Monitoring',
        pct: '10–15%',
        categories: ['AI Ethics & Bias', 'MLOps'],
      },
    ],
  },
  {
    id: 'Google-MLE',
    name: 'Google Professional ML Engineer',
    provider: 'Google Cloud',
    difficulty: 'Advanced',
    examQuestions: '60 questions',
    duration: '120 min',
    color: 'emerald',
    domains: [
      {
        name: 'Architect Low-Code AI Solutions',
        pct: '~13%',
        categories: ['Cloud AI Platforms'],
      },
      {
        name: 'Scale Prototypes into ML Models',
        pct: '~18%',
        categories: ['AI & ML Fundamentals', 'Data Engineering'],
      },
      {
        name: 'Serve and Scale Models',
        pct: '~19%',
        categories: ['Cloud AI Platforms', 'MLOps'],
      },
      {
        name: 'Automate and Orchestrate ML Pipelines',
        pct: '~20%',
        categories: ['MLOps', 'Data Engineering'],
      },
      {
        name: 'Monitor AI Solutions',
        pct: '~20%',
        categories: ['MLOps', 'Cloud AI Platforms'],
      },
    ],
  },
  {
    id: 'GIAC-GOAA',
    name: 'GIAC Offensive AI Analyst',
    provider: 'GIAC / SANS',
    difficulty: 'Advanced',
    examQuestions: 'Hands-on (CyberLive)',
    duration: 'Practical',
    color: 'orange',
    domains: [
      {
        name: 'AI Fundamentals & NLP',
        categories: ['AI & ML Fundamentals', 'NLP', 'Generative AI & LLMs'],
      },
      {
        name: 'Prompt Injection & LLM Bypass',
        categories: ['AI Security', 'Red Teaming AI'],
      },
      {
        name: 'Custom GPTs & AI Assistants',
        categories: ['Generative AI & LLMs'],
      },
      {
        name: 'Malicious AI Applications',
        categories: ['Red Teaming AI'],
      },
      {
        name: 'Vector Databases & RAG Attacks',
        categories: ['Data Engineering', 'AI Security'],
      },
    ],
  },
  {
    id: 'GIAC-GASAE',
    name: 'GIAC AI Security Automation Engineer',
    provider: 'GIAC / SANS',
    difficulty: 'Intermediate–Advanced',
    examQuestions: 'Hands-on (CyberLive)',
    duration: 'Practical',
    color: 'orange',
    domains: [
      {
        name: 'AI Automation in Security',
        categories: ['AI in Security Ops'],
      },
      {
        name: 'Vulnerability Discovery & SOAR',
        categories: ['AI in Security Ops', 'AI Security'],
      },
      {
        name: 'AI-Driven Attack Simulations',
        categories: ['Red Teaming AI'],
      },
      {
        name: 'Incident Response Automation',
        categories: ['AI in Security Ops'],
      },
    ],
  },
  {
    id: 'SC-500',
    name: 'Microsoft Cloud and AI Security Engineer Associate (SC-500)',
    provider: 'Microsoft',
    difficulty: 'Intermediate',
    examQuestions: '40–60 questions',
    duration: '100 min',
    color: 'cyan',
    domains: [
      {
        name: 'Identity & Access Management',
        pct: '20–25%',
        topics: [
          'Microsoft Entra ID',
          'Conditional Access',
          'Identity Protection',
          'Privileged Identity Management',
          'Managed Identity',
          'Workload Identity',
          'Workload Identity Federation',
          'Continuous Access Evaluation',
        ],
      },
      {
        name: 'Security Operations',
        pct: '20–25%',
        topics: [
          'Microsoft Sentinel',
          'Microsoft Defender XDR',
          'KQL',
          'Advanced Hunting',
          'Microsoft Security Copilot',
          'Automatic Attack Disruption',
          'Microsoft Defender for Cloud',
          'Case Study',
        ],
      },
      {
        name: 'AI Workloads & Data Governance',
        pct: '20–25%',
        topics: [
          'Microsoft Purview',
          'Azure OpenAI Service',
          'Azure AI Foundry',
          'Azure AI Content Safety',
          'Defender for AI Workloads',
          'DSPM for AI',
          'AI Security Posture Management',
          'Prompt Shields',
          'Copilot Studio',
          'Copilot Agent',
          'Adaptive Protection',
          'Insider Risk Management',
          'M365 Copilot',
        ],
      },
      {
        name: 'Secure Networking & Infrastructure',
        pct: '15–20%',
        topics: [
          'Azure Network Security',
          'Azure Firewall',
          'NSG',
          'DDoS Protection',
          'Private Endpoints',
          'Virtual Network',
          'VNet',
        ],
      },
      {
        name: 'Secure Compute, Storage, Data',
        pct: '15–20%',
        topics: [
          'Azure Storage & Compute Security',
          'Storage Account',
          'Azure Key Vault',
          'Disk Encryption',
          'Azure Compute',
          'Azure Defender for Storage',
        ],
      },
    ],
  },
  {
    id: 'CAISP',
    name: 'Certified AI Security Professional',
    provider: 'Practical DevSecOps',
    difficulty: 'Advanced (Practical)',
    examQuestions: '5 real-world challenges',
    duration: '6 hrs + 24hr report',
    color: 'purple',
    domains: [
      {
        name: 'AI & LLM Security Fundamentals',
        categories: ['AI Security', 'Generative AI & LLMs'],
      },
      {
        name: 'Model Risks and Vulnerabilities',
        categories: ['AI Security', 'Red Teaming AI'],
      },
      {
        name: 'AI Supply Chain Security',
        categories: ['AI Security', 'Emerging Trends'],
      },
      {
        name: 'Securing LLMs, RAG & Deployments',
        categories: ['AI Security', 'Cloud AI Platforms'],
      },
      {
        name: 'AI System Assessment & Audit',
        categories: ['AI Security', 'AI Governance'],
      },
    ],
  },
];

/**
 * Returns questions for a cert + selected domains combo.
 * - certId: must match a certTags entry on each question
 * - domainNames: empty array or ['All'] returns all questions for that cert
 * - Otherwise filters by domain using category/topic maps for that cert
 */
export function getQuestionsForCertDomains(
  certId: string,
  domainNames: string[],
): QuizQuestion[] {
  const certConfig = CERT_QUIZ_CONFIGS.find((c) => c.id === certId);
  if (!certConfig) return [];

  // Base pool: all questions tagged with this cert
  const certPool = QUIZ_QUESTIONS.filter((q) => q.certTags.includes(certId));

  // All domains requested
  const allRequested =
    domainNames.length === 0 ||
    domainNames.includes('All') ||
    domainNames.length === certConfig.domains.length;

  if (allRequested) return certPool;

  // Build the set of active domains
  const activeDomains = certConfig.domains.filter((d) =>
    domainNames.includes(d.name),
  );

  const matchedIds = new Set<string>();

  for (const domain of activeDomains) {
    for (const q of certPool) {
      if (matchedIds.has(q.id)) continue;

      if (domain.categories && domain.categories.includes(q.category)) {
        matchedIds.add(q.id);
        continue;
      }

      if (domain.topics) {
        const topicLower = q.topic.toLowerCase();
        const matched = domain.topics.some((t) =>
          topicLower.includes(t.toLowerCase()),
        );
        if (matched) {
          matchedIds.add(q.id);
        }
      }
    }
  }

  return certPool.filter((q) => matchedIds.has(q.id));
}

/**
 * Returns the question count for a given cert across all its questions.
 */
export function getCertQuestionCount(certId: string): number {
  return QUIZ_QUESTIONS.filter((q) => q.certTags.includes(certId)).length;
}

/**
 * Returns question counts per domain for a given cert.
 */
export function getDomainQuestionCounts(certId: string): Record<string, number> {
  const certConfig = CERT_QUIZ_CONFIGS.find((c) => c.id === certId);
  if (!certConfig) return {};

  const counts: Record<string, number> = {};
  for (const domain of certConfig.domains) {
    counts[domain.name] = getQuestionsForCertDomains(certId, [domain.name]).length;
  }
  return counts;
}
