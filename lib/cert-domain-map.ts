/**
 * Maps each certification to its official exam domains and the question
 * categories/topics that belong to each domain. Used by QuizEngine to
 * filter questions by domain after a cert is selected.
 *
 * Sources: official exam study guides from microsoft.com/learn,
 * aws.amazon.com/certification, comptia.org, giac.org, isaca.org, isc2.org,
 * ec-council.org, practical-devsecops.com, cloud.google.com/certification
 */

import { QUIZ_QUESTIONS } from '@/lib/playbook-quiz';
import type { QuizQuestion } from '@/types';

export interface DomainDef {
  name:         string;
  weight?:      string;
  /** Question `category` values that belong to this domain */
  categories?:  string[];
  /** Question `topic` values that belong to this domain (checked after categories) */
  topics?:      string[];
}

export interface CertDomainConfig {
  id:      string;
  name:    string;
  domains: DomainDef[];
}

export const CERT_DOMAIN_CONFIGS: CertDomainConfig[] = [
  {
    id:   'SecAI',
    name: 'CompTIA SecAI+',
    domains: [
      {
        name:       'Basic AI Concepts',
        weight:     '17%',
        categories: ['AI & ML Fundamentals', 'Generative AI & LLMs', 'Computer Vision', 'NLP', 'Cloud AI Platforms', 'Data Engineering', 'Emerging Trends'],
      },
      {
        name:       'Securing AI Systems',
        weight:     '40%',
        categories: ['AI Security', 'Red Teaming AI'],
      },
      {
        name:       'AI-Assisted Security',
        weight:     '24%',
        categories: ['AI in Security Ops'],
      },
      {
        name:       'AI Governance & Compliance',
        weight:     '19%',
        categories: ['AI Governance', 'AI Ethics & Bias'],
      },
    ],
  },

  {
    id:   'AWS-AIF-C01',
    name: 'AWS Certified AI Practitioner',
    domains: [
      {
        name:       'Fundamentals of AI and ML',
        weight:     '20%',
        categories: ['AI & ML Fundamentals', 'Data Engineering'],
      },
      {
        name:       'Fundamentals of Generative AI',
        weight:     '24%',
        categories: ['Generative AI & LLMs'],
      },
      {
        name:       'Applications of Foundation Models',
        weight:     '28%',
        categories: ['Cloud AI Platforms', 'MLOps', 'Computer Vision', 'NLP'],
      },
      {
        name:       'Guidelines for Responsible AI',
        weight:     '14%',
        categories: ['AI Ethics & Bias'],
      },
      {
        name:       'Security, Compliance & Governance',
        weight:     '14%',
        categories: ['AI Governance', 'Emerging Trends'],
      },
    ],
  },

  {
    id:   'Azure-AI901',
    name: 'Microsoft Azure AI Fundamentals (AI-901)',
    domains: [
      {
        name:       'AI Workloads and Considerations',
        categories: ['AI Governance', 'AI Ethics & Bias', 'Emerging Trends'],
      },
      {
        name:       'Fundamental ML Principles on Azure',
        categories: ['AI & ML Fundamentals', 'Data Engineering'],
      },
      {
        name:       'Computer Vision Workloads',
        categories: ['Computer Vision'],
      },
      {
        name:       'NLP Workloads',
        categories: ['NLP'],
      },
      {
        name:       'Generative AI Workloads',
        categories: ['Generative AI & LLMs', 'Cloud AI Platforms'],
      },
    ],
  },

  {
    id:   'Azure-AI103',
    name: 'Azure AI Apps and Agents Developer Associate (AI-103)',
    domains: [
      {
        name:       'Plan & Manage Azure AI Solutions',
        weight:     '25–30%',
        categories: ['Cloud AI Platforms'],
        topics:     ['Azure AI Engineer'],
      },
      {
        name:       'AI App and Agent Development',
        weight:     '25–30%',
        topics:     ['Agentic AI', 'RAG', 'Fine-Tuning', 'Language Models'],
        categories: ['Generative AI & LLMs'],
      },
      {
        name:       'Generative AI Solutions',
        weight:     '20–25%',
        topics:     ['Transformer Architecture', 'LoRA & Quantization'],
      },
      {
        name:       'NLP Solutions',
        weight:     '15–20%',
        categories: ['NLP'],
      },
      {
        name:       'Responsible AI & Monitoring',
        weight:     '10–15%',
        categories: ['MLOps', 'Data Engineering'],
        topics:     ['Model Monitoring', 'CI/CD for ML'],
      },
    ],
  },

  {
    id:   'SC-500',
    name: 'Microsoft Cloud and AI Security Engineer Associate (SC-500)',
    domains: [
      {
        name:    'Manage Identity & Access (Entra ID, PIM, CA)',
        weight:  '20–25%',
        topics:  [
          'Microsoft Entra ID', 'Privileged Identity Management', 'Identity Protection',
          'Managed Identity', 'Workload Identity', 'Workload Identity Federation',
          'Conditional Access', 'Continuous Access Evaluation', 'Adaptive Protection',
          'Zero Trust Architecture',
        ],
      },
      {
        name:    'Secure Networking & Infrastructure',
        weight:  '15–20%',
        topics:  ['Azure Policy', 'Azure Firewall', 'Azure DDoS', 'Network Security Groups', 'Private Endpoints'],
      },
      {
        name:    'Secure Compute, Storage, Data',
        weight:  '15–20%',
        topics:  ['Azure Key Vault', 'Storage Security', 'VM Security', 'Container Security'],
      },
      {
        name:    'Manage Security Operations (Defender XDR, Sentinel, Copilot)',
        weight:  '20–25%',
        topics:  [
          'Microsoft Defender XDR', 'Microsoft Sentinel', 'KQL', 'Advanced Hunting',
          'Microsoft Security Copilot', 'Automatic Attack Disruption', 'Insider Risk Management',
          'Microsoft Defender for Cloud', 'Case Study',
        ],
      },
      {
        name:    'Secure AI Workloads & Govern Data with Purview',
        weight:  '20–25%',
        topics:  [
          'Microsoft Purview', 'Azure OpenAI Service', 'Azure AI Content Safety',
          'Azure AI Foundry', 'Defender for AI Workloads', 'DSPM for AI',
          'AI Security Posture Management', 'Prompt Shields', 'Copilot Agent',
          'M365 Copilot', 'Copilot Studio',
        ],
      },
    ],
  },

  {
    id:   'Google-MLE',
    name: 'Google Professional ML Engineer',
    domains: [
      {
        name:       'Architect Low-Code AI Solutions',
        weight:     '~13%',
        categories: ['Cloud AI Platforms'],
      },
      {
        name:       'Scale Prototypes into ML Models',
        weight:     '~18%',
        categories: ['AI & ML Fundamentals'],
        topics:     ['Neural Networks', 'Supervised Learning', 'Unsupervised Learning'],
      },
      {
        name:       'Serve and Scale Models',
        weight:     '~19%',
        categories: ['Computer Vision', 'NLP'],
        topics:     ['Model Deployment'],
      },
      {
        name:       'Automate and Orchestrate ML Pipelines',
        weight:     '~20%',
        categories: ['MLOps', 'Data Engineering'],
        topics:     ['CI/CD for ML', 'Vertex AI Pipelines'],
      },
      {
        name:       'Monitor AI Solutions',
        weight:     '~20%',
        topics:     ['Model Monitoring', 'LoRA & Quantization', 'Fine-Tuning'],
        categories: ['Emerging Trends'],
      },
    ],
  },

  {
    id:   'GIAC-GOAA',
    name: 'GIAC Offensive AI Analyst',
    domains: [
      {
        name:       'AI Fundamentals (NLP, GANs, RAG)',
        categories: ['Generative AI & LLMs'],
        topics:     ['RAG', 'Transformer Architecture', 'Neural Networks'],
      },
      {
        name:       'Vector Databases & Retrieval',
        topics:     ['RAG', 'Agentic AI'],
      },
      {
        name:       'Custom GPTs & AI Assistants',
        topics:     ['Prompt Engineering', 'Agentic AI', 'Fine-Tuning'],
      },
      {
        name:       'Prompt Injection & LLM Bypass',
        topics:     ['Prompt Injection', 'LLM Red Teaming', 'OWASP LLM Top 10'],
      },
      {
        name:       'Malicious AI Applications',
        categories: ['Red Teaming AI', 'GIAC-GOAA', 'CAIS'],
        topics:     ['Model Extraction', 'AI Red Team Methodology', 'NIST AI RMF'],
      },
    ],
  },

  {
    id:   'GIAC-GASAE',
    name: 'GIAC AI Security Automation Engineer',
    domains: [
      {
        name:       'AI Automation in Security',
        categories: ['AI in Security Ops', 'GIAC-GASAE'],
        topics:     ['AI-Powered SIEM', 'Detection Rules', 'Automated Threat Detection', 'AI-Driven Threat Intelligence'],
      },
      {
        name:       'Vulnerability Discovery Automation',
        categories: ['AI Security'],
        topics:     ['OWASP LLM Top 10', 'Automated Vulnerability Scanning', 'LLM Security Assessment', 'Agentic Attacks'],
      },
      {
        name:       'AI-Driven Attack Simulations',
        categories: ['Red Teaming AI'],
        topics:     ['AI Red Teaming', 'Adversarial Attacks', 'Agentic Attacks', 'AI Red Team Methodology'],
      },
      {
        name:       'SOAR-Driven Incident Response',
        categories: ['AI Security', 'AI in Security Ops'],
        topics:     ['Prompt Injection', 'AI Incident Response', 'Automated Playbooks', 'Detection Rules'],
      },
      {
        name:       'Secure AI Pipeline & Infrastructure',
        categories: ['MLOps'],
        topics:     ['CI/CD for ML', 'MLOps Security', 'AI Supply Chain Security', 'Supply Chain Attacks', 'Model Deployment'],
      },
    ],
  },

  {
    id:   'CAISP',
    name: 'Certified AI Security Professional',
    domains: [
      {
        name:       'AI & LLM Security Fundamentals',
        categories: ['AI Security', 'Generative AI & LLMs'],
        topics:     ['OWASP LLM Top 10', 'Prompt Injection'],
      },
      {
        name:       'Model Risks and Vulnerabilities',
        topics:     ['Adversarial Attacks', 'EU AI Act', 'NIST AI RMF', 'Explainability'],
        categories: ['AI Ethics & Bias'],
      },
      {
        name:       'AI Supply Chain Security',
        topics:     ['Data Security', 'Federated Learning Security', 'Differential Privacy'],
        categories: ['Data Engineering'],
      },
      {
        name:       'Securing LLMs, RAG, AI Deployments',
        categories: ['Red Teaming AI'],
        topics:     ['Adversarial Attacks', 'Data Poisoning', 'Model Inversion'],
      },
      {
        name:       'AI System Assessment & Audit',
        categories: ['AI Governance', 'CISM', 'GIAC-GASAE', 'CAIS'],
        topics:     ['AI Governance', 'NIST AI RMF', 'Model Cards and Documentation', 'AI Transparency Documentation', 'AI Bill of Materials (AI-BOM)'],
      },
    ],
  },

  {
    id:   'CAIS',
    name: 'EC-Council C|AI Security',
    domains: [
      {
        name:       'AI Security Fundamentals & Threat Landscape',
        categories: ['AI Security', 'CAIS'],
        topics:     ['OWASP LLM Top 10', 'LLM Security Assessment'],
      },
      {
        name:       'Adversarial Machine Learning Attacks',
        topics:     ['Membership Inference', 'Differential Privacy', 'Federated Learning Security', 'Evasion Attacks', 'Membership Inference Attack', 'Model Inversion Attack', 'Data Poisoning'],
      },
      {
        name:       'LLM Security & Prompt Injection Defense',
        topics:     ['LLM Red Teaming', 'AI Red Team Methodology', 'Prompt Injection', 'LLM Security Assessment', 'Secure AI Deployment'],
      },
      {
        name:       'Securing AI Pipelines & MLOps',
        topics:     ['AI Supply Chain Security', 'MLOps Security', 'Supply Chain Attacks', 'Secure AI Deployment'],
      },
      {
        name:       'AI Governance, Risk & Compliance',
        topics:     ['AI Governance', 'AI Transparency Documentation', 'Model Cards and Documentation', 'NIST AI RMF', 'AI Bill of Materials (AI-BOM)'],
        categories: ['AI Governance'],
      },
    ],
  },

  {
    id:   'CISSP',
    name: 'ISC2 CISSP',
    domains: [
      {
        name:       'Security and Risk Management',
        weight:     '15%',
        topics:     ['Risk Management', 'Security Policies', 'Legal and Regulatory', 'Risk Appetite', 'Risk Management Framework', 'Risk Management', 'Threat Modelling'],
        categories: ['CISSP'],
      },
      {
        name:       'Asset Security',
        weight:     '10%',
        topics:     ['Data Classification', 'Data Retention', 'Asset Classification', 'Data Privacy'],
      },
      {
        name:       'Security Architecture & Engineering',
        weight:     '13%',
        topics:     ['Cryptography', 'Threat Modelling', 'Defense-in-Depth', 'Security Architecture', 'Zero Trust Architecture'],
      },
      {
        name:       'Communication & Network Security',
        weight:     '13%',
        topics:     ['Network Security'],
      },
      {
        name:       'Identity & Access Management',
        weight:     '13%',
        topics:     ['IAM', 'Zero Trust', 'Identity and Access Management', 'Privileged Access Management'],
      },
      {
        name:       'Security Assessment & Testing',
        weight:     '12%',
        topics:     ['Pen Testing', 'Vulnerability Assessment', 'Security Assessment and Testing'],
      },
      {
        name:       'Security Operations',
        weight:     '13%',
        topics:     ['Incident Response', 'Business Continuity', 'Security Operations', 'Business Continuity and Disaster Recovery'],
      },
      {
        name:       'Software Development Security',
        weight:     '11%',
        topics:     ['SDLC', 'AI Threat Modelling', 'Software Development Security', 'AI Transparency Documentation', 'Model Cards and Documentation'],
      },
    ],
  },

  {
    id:   'CISM',
    name: 'ISACA CISM',
    domains: [
      {
        name:       'Information Security Governance',
        weight:     '17%',
        categories: ['CISM'],
        topics:     ['Security Governance', 'Security Metrics', 'AI Governance', 'Key Risk Indicators', 'Third-Party AI Risk', 'AI Transparency Documentation', 'NIST AI RMF'],
      },
      {
        name:       'Information Security Risk Management',
        weight:     '20%',
        topics:     ['Risk Assessment', 'Risk Appetite', 'Risk Register', 'Third-Party Risk', 'Business Impact Analysis', 'Key Risk Indicators'],
      },
      {
        name:       'Information Security Program',
        weight:     '33%',
        topics:     ['Security Program', 'Security Strategy', 'KPIs', 'AI Security Programme Maturity'],
      },
      {
        name:       'Incident Management',
        weight:     '30%',
        topics:     ['Incident Response', 'Business Continuity', 'Recovery Objectives', 'Incident Classification', 'AI Incident Response', 'AI Crisis Management'],
      },
    ],
  },
];

/** Fast lookup by cert ID */
export const CERT_DOMAIN_MAP: Record<string, CertDomainConfig> = Object.fromEntries(
  CERT_DOMAIN_CONFIGS.map((c) => [c.id, c]),
);

/**
 * Returns questions filtered by cert + (optionally) a set of domain names.
 * When domains is empty, returns all questions for that cert.
 * Domain matching: category OR topic must appear in the domain definition.
 * Questions with no matching domain go into a catch-all if "all" is selected.
 */
export function getQuestionsByCertAndDomains(
  cert:    string,
  domains: string[], // empty = all
): QuizQuestion[] {
  const base = QUIZ_QUESTIONS.filter((q) => q.certTags.includes(cert));
  if (domains.length === 0) return base;

  const config = CERT_DOMAIN_MAP[cert];
  if (!config) return base;

  const selectedDomains = config.domains.filter((d) => domains.includes(d.name));
  if (selectedDomains.length === 0) return base;

  const catSet   = new Set<string>();
  const topicSet = new Set<string>();
  for (const d of selectedDomains) {
    d.categories?.forEach((c) => catSet.add(c));
    d.topics?.forEach((t) => topicSet.add(t));
  }

  const matched    = base.filter((q) => catSet.has(q.category) || topicSet.has(q.topic));
  // Fall back to ALL cert questions if filter matches nothing
  return matched.length > 0 ? matched : base;
}

/**
 * Returns question count per domain for a given cert.
 */
export function getDomainCounts(cert: string): Record<string, number> {
  const config = CERT_DOMAIN_MAP[cert];
  if (!config) return {};
  const result: Record<string, number> = {};
  for (const d of config.domains) {
    result[d.name] = getQuestionsByCertAndDomains(cert, [d.name]).length;
  }
  return result;
}
