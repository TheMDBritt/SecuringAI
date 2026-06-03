/**
 * Cert → Domain → Category mapping for the quiz cert-first flow.
 * Each ExamDomain maps to one or more QuizQuestion.category values.
 * Questions are filtered: certTags.includes(certId) AND domainCategories.includes(category)
 *
 * Sources:
 * - CompTIA SecAI+: comptia.org/certifications/ai+
 * - AWS AIF-C01: aws.amazon.com/certification/certified-ai-practitioner
 * - Azure AI-901: learn.microsoft.com/en-us/certifications/azure-ai-fundamentals (AI-901 beta)
 * - Azure AI-103: learn.microsoft.com/en-us/certifications (AI-103 beta Apr 2026)
 * - SC-500: learn.microsoft.com/en-us/certifications (SC-500 beta May 2026)
 * - Google MLE: cloud.google.com/certification/machine-learning-engineer
 * - GIAC GOAA: giac.org/certifications/offensive-ai-analyst-goaa
 * - GIAC GASAE: giac.org/certifications/ai-security-automation-engineer-gasae
 * - CAISP: practicaldevsecops.com/certifications/caisp
 * - CAIS: ec-council.org/certifications/certified-ai-security
 * - CISSP: isc2.org/certifications/cissp
 * - CISM: isaca.org/credentialing/cism
 */

export interface ExamDomain {
  name: string;
  pct?: string;
  /** QuizQuestion.category values this domain draws from */
  categories: string[];
}

export interface CertExam {
  id: string;
  name: string;
  provider: string;
  difficulty: string;
  examQs: string;
  duration: string;
  tagColor: string;
  domains: ExamDomain[];
}

export const CERT_EXAMS: CertExam[] = [
  {
    id: 'SecAI',
    name: 'CompTIA SecAI+',
    provider: 'CompTIA',
    difficulty: 'Intermediate',
    examQs: '60',
    duration: '60 min',
    tagColor: 'text-red-400 border-red-500/30 bg-red-500/10',
    domains: [
      {
        name: 'Basic AI Concepts',
        pct: '17%',
        categories: ['AI & ML Fundamentals', 'Generative AI & LLMs'],
      },
      {
        name: 'Securing AI Systems',
        pct: '40%',
        categories: ['AI Security', 'Red Teaming AI'],
      },
      {
        name: 'AI-Assisted Security',
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
    examQs: '65',
    duration: '90 min',
    tagColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    domains: [
      {
        name: 'Fundamentals of AI and ML',
        pct: '20%',
        categories: ['AI & ML Fundamentals'],
      },
      {
        name: 'Fundamentals of Generative AI',
        pct: '24%',
        categories: ['Generative AI & LLMs'],
      },
      {
        name: 'Applications of Foundation Models',
        pct: '28%',
        categories: ['Generative AI & LLMs', 'Emerging Trends', 'Cloud AI Platforms'],
      },
      {
        name: 'Guidelines for Responsible AI',
        pct: '14%',
        categories: ['AI Ethics & Bias', 'AI Governance'],
      },
      {
        name: 'Security, Compliance & Governance',
        pct: '14%',
        categories: ['AI Security', 'AI Governance', 'Cloud AI Platforms'],
      },
    ],
  },
  {
    id: 'Azure-AI901',
    name: 'Microsoft Azure AI Fundamentals (AI-901)',
    provider: 'Microsoft',
    difficulty: 'Foundational',
    examQs: '40–60',
    duration: '45 min',
    tagColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
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
    name: 'Azure AI Apps and Agents Developer (AI-103)',
    provider: 'Microsoft',
    difficulty: 'Intermediate',
    examQs: '~50',
    duration: '100 min',
    tagColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    domains: [
      {
        name: 'Plan & Manage Azure AI Solutions',
        pct: '25–30%',
        categories: ['Cloud AI Platforms', 'Microsoft Cloud & AI Security'],
      },
      {
        name: 'AI App and Agent Development',
        pct: '25–30%',
        categories: ['Emerging Trends', 'Generative AI & LLMs', 'Cloud AI Platforms'],
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
        categories: ['AI Ethics & Bias', 'AI Governance'],
      },
    ],
  },
  {
    id: 'SC-500',
    name: 'Microsoft Cloud and AI Security Engineer (SC-500)',
    provider: 'Microsoft',
    difficulty: 'Intermediate',
    examQs: '40–60',
    duration: '100 min',
    tagColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    domains: [
      {
        name: 'Manage Identity & Access',
        pct: '20–25%',
        categories: ['Microsoft Cloud & AI Security'],
      },
      {
        name: 'Secure Networking & Infrastructure',
        pct: '15–20%',
        categories: ['Microsoft Cloud & AI Security'],
      },
      {
        name: 'Secure Compute, Storage & Data',
        pct: '15–20%',
        categories: ['Microsoft Cloud & AI Security'],
      },
      {
        name: 'Manage Security Operations',
        pct: '20–25%',
        categories: ['Microsoft Cloud & AI Security', 'AI in Security Ops'],
      },
      {
        name: 'Secure AI Workloads & Govern Data',
        pct: '20–25%',
        categories: ['AI Security', 'Microsoft Cloud & AI Security', 'Generative AI & LLMs'],
      },
    ],
  },
  {
    id: 'Google-MLE',
    name: 'Google Professional ML Engineer',
    provider: 'Google Cloud',
    difficulty: 'Advanced',
    examQs: '60',
    duration: '120 min',
    tagColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    domains: [
      {
        name: 'Architect Low-Code AI Solutions',
        pct: '~13%',
        categories: ['Cloud AI Platforms'],
      },
      {
        name: 'Collaborate Within and Across Teams',
        pct: '~10%',
        categories: ['MLOps', 'Data Engineering'],
      },
      {
        name: 'Scale Prototypes into ML Models',
        pct: '~18%',
        categories: ['AI & ML Fundamentals', 'Cloud AI Platforms'],
      },
      {
        name: 'Serve and Scale Models',
        pct: '~19%',
        categories: ['MLOps', 'Cloud AI Platforms'],
      },
      {
        name: 'Automate and Orchestrate ML Pipelines',
        pct: '~20%',
        categories: ['MLOps', 'Data Engineering'],
      },
      {
        name: 'Monitor AI Solutions',
        pct: '~20%',
        categories: ['MLOps'],
      },
    ],
  },
  {
    id: 'GIAC-GOAA',
    name: 'GIAC Offensive AI Analyst',
    provider: 'GIAC / SANS',
    difficulty: 'Advanced',
    examQs: 'Hands-on (CyberLive)',
    duration: 'Practical',
    tagColor: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    domains: [
      {
        name: 'AI Fundamentals',
        categories: ['AI & ML Fundamentals', 'Generative AI & LLMs'],
      },
      {
        name: 'Vector Databases & RAG',
        categories: ['Generative AI & LLMs', 'AI Security'],
      },
      {
        name: 'Custom GPTs & Assistants',
        categories: ['Generative AI & LLMs'],
      },
      {
        name: 'Prompt Injection & LLM Bypass',
        categories: ['AI Security', 'Red Teaming AI', 'Generative AI & LLMs'],
      },
      {
        name: 'Malicious AI Applications',
        categories: ['Red Teaming AI', 'AI Security'],
      },
    ],
  },
  {
    id: 'GIAC-GASAE',
    name: 'GIAC AI Security Automation Engineer',
    provider: 'GIAC / SANS',
    difficulty: 'Intermediate–Advanced',
    examQs: 'Hands-on (CyberLive)',
    duration: 'Practical',
    tagColor: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    domains: [
      {
        name: 'AI Automation in Security',
        categories: ['AI in Security Ops'],
      },
      {
        name: 'Vulnerability Discovery Automation',
        categories: ['AI in Security Ops', 'AI Security'],
      },
      {
        name: 'AI-Driven Attack Simulations',
        categories: ['Red Teaming AI', 'AI in Security Ops'],
      },
      {
        name: 'SOAR-Driven Incident Response',
        categories: ['AI in Security Ops'],
      },
      {
        name: 'Host Remediation & Infrastructure Automation',
        categories: ['AI in Security Ops', 'MLOps'],
      },
    ],
  },
  {
    id: 'CAISP',
    name: 'Certified AI Security Professional',
    provider: 'Practical DevSecOps',
    difficulty: 'Advanced (Practical)',
    examQs: '5 real-world challenges',
    duration: '6 hrs + 24hr report',
    tagColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    domains: [
      {
        name: 'AI & LLM Security Fundamentals',
        categories: ['AI Security', 'Generative AI & LLMs', 'AI & ML Fundamentals'],
      },
      {
        name: 'Model Risks and Vulnerabilities',
        categories: ['AI Security', 'Red Teaming AI'],
      },
      {
        name: 'AI Supply Chain Security',
        categories: ['AI Security'],
      },
      {
        name: 'Securing LLMs, RAG & AI Deployments',
        categories: ['AI Security', 'Generative AI & LLMs'],
      },
      {
        name: 'AI System Assessment & Audit',
        categories: ['AI Security', 'Red Teaming AI'],
      },
    ],
  },
  {
    id: 'CAIS',
    name: 'EC-Council C|AI Security',
    provider: 'EC-Council',
    difficulty: 'Intermediate–Advanced',
    examQs: 'Practical + MCQ',
    duration: '4 hours',
    tagColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    domains: [
      {
        name: 'AI Security Fundamentals & Threat Landscape',
        categories: ['AI Security', 'AI & ML Fundamentals'],
      },
      {
        name: 'Adversarial Machine Learning Attacks',
        categories: ['AI Security', 'Red Teaming AI'],
      },
      {
        name: 'LLM Security & Prompt Injection Defense',
        categories: ['AI Security', 'Generative AI & LLMs'],
      },
      {
        name: 'Securing AI Pipelines & MLOps',
        categories: ['MLOps', 'AI Security'],
      },
      {
        name: 'AI Governance, Risk & Compliance',
        categories: ['AI Governance', 'AI Ethics & Bias'],
      },
    ],
  },
  {
    id: 'CISSP',
    name: 'Certified Information Systems Security Professional',
    provider: 'ISC2',
    difficulty: 'Expert',
    examQs: '125–175 adaptive (CAT)',
    duration: '4 hours',
    tagColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    domains: [
      {
        name: 'Security and Risk Management',
        pct: '15%',
        categories: ['AI Security', 'AI Governance'],
      },
      {
        name: 'Asset Security',
        pct: '10%',
        categories: ['AI Security', 'AI Governance'],
      },
      {
        name: 'Security Architecture & Engineering',
        pct: '13%',
        categories: ['AI Security', 'Red Teaming AI'],
      },
      {
        name: 'Communication & Network Security',
        pct: '13%',
        categories: ['AI Security'],
      },
      {
        name: 'Identity & Access Management',
        pct: '13%',
        categories: ['AI Security', 'Microsoft Cloud & AI Security'],
      },
      {
        name: 'Security Assessment & Testing',
        pct: '12%',
        categories: ['Red Teaming AI', 'AI Security'],
      },
      {
        name: 'Security Operations',
        pct: '13%',
        categories: ['AI in Security Ops', 'AI Security'],
      },
      {
        name: 'Software Development Security',
        pct: '11%',
        categories: ['AI Security', 'Generative AI & LLMs'],
      },
    ],
  },
  {
    id: 'CISM',
    name: 'Certified Information Security Manager',
    provider: 'ISACA',
    difficulty: 'Advanced',
    examQs: '150',
    duration: '4 hours',
    tagColor: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
    domains: [
      {
        name: 'Information Security Governance',
        pct: '17%',
        categories: ['AI Governance'],
      },
      {
        name: 'Information Security Risk Management',
        pct: '20%',
        categories: ['AI Governance', 'AI Security'],
      },
      {
        name: 'Information Security Program',
        pct: '33%',
        categories: ['AI Governance', 'AI in Security Ops'],
      },
      {
        name: 'Incident Management',
        pct: '30%',
        categories: ['AI in Security Ops', 'AI Governance'],
      },
    ],
  },
];

export function getCertById(id: string): CertExam | undefined {
  return CERT_EXAMS.find((c) => c.id === id);
}

/** Returns the set of categories covered by a list of domain names for a given cert. */
export function domainsToCategories(cert: CertExam, domainNames: string[]): string[] {
  const cats = new Set<string>();
  for (const d of cert.domains) {
    if (domainNames.length === 0 || domainNames.includes(d.name)) {
      d.categories.forEach((c) => cats.add(c));
    }
  }
  return Array.from(cats);
}
