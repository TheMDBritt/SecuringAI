'use client';

interface CertInfo {
  id:         string;
  name:       string;
  provider:   string;
  tagColor:   string;
  difficulty: string;
  questions:  string;
  duration:   string;
  domains:    { name: string; pct?: string }[];
  focus:      string;
  topTopics:  string[];
}

const CERTS: CertInfo[] = [
  {
    id: 'SecAI',
    name: 'CompTIA SecAI+',
    provider: 'CompTIA',
    tagColor: 'bg-red-500/10 text-red-400 border-red-500/30',
    difficulty: 'Intermediate',
    questions: '60',
    duration: '60 min',
    focus: 'AI security concepts, defending AI systems, AI-assisted security operations',
    domains: [
      { name: 'Basic AI Concepts',        pct: '17%' },
      { name: 'Securing AI Systems',       pct: '40%' },
      { name: 'AI-Assisted Security',      pct: '24%' },
      { name: 'AI Governance & Compliance',pct: '19%' },
    ],
    topTopics: ['OWASP LLM Top 10', 'Adversarial attacks', 'Guardrails', 'NIST AI RMF', 'AI-powered SIEM', 'Prompt injection', 'EU AI Act'],
  },
  {
    id: 'AWS-AIF-C01',
    name: 'AWS Certified AI Practitioner',
    provider: 'Amazon Web Services',
    tagColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    difficulty: 'Foundational',
    questions: '65',
    duration: '90 min',
    focus: 'AWS AI/ML services, GenAI fundamentals, responsible AI on AWS',
    domains: [
      { name: 'Fundamentals of AI and ML',          pct: '20%' },
      { name: 'Fundamentals of GenAI',               pct: '24%' },
      { name: 'Applications of Foundation Models',  pct: '28%' },
      { name: 'Guidelines for Responsible AI',      pct: '14%' },
      { name: 'Security, Compliance & Governance',  pct: '14%' },
    ],
    topTopics: ['Amazon Bedrock', 'Amazon SageMaker', 'Amazon Q', 'RAG', 'Foundation models', 'Responsible AI', 'Prompt engineering'],
  },
  {
    id: 'Azure-AI900',
    name: 'Microsoft Azure AI Fundamentals',
    provider: 'Microsoft',
    tagColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    difficulty: 'Foundational',
    questions: '40–60',
    duration: '45 min',
    focus: 'Azure AI services, ML concepts, responsible AI principles on Azure',
    domains: [
      { name: 'AI Workloads and Considerations' },
      { name: 'Fundamental ML Principles on Azure' },
      { name: 'Computer Vision Workloads' },
      { name: 'NLP Workloads' },
      { name: 'Generative AI Workloads' },
    ],
    topTopics: ['Azure Machine Learning', 'Azure AI Services', 'Azure OpenAI', 'Computer Vision', 'Language Studio', 'Responsible AI'],
  },
  {
    id: 'Azure-AI102',
    name: 'Microsoft Azure AI Engineer',
    provider: 'Microsoft',
    tagColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    difficulty: 'Intermediate',
    questions: '~50',
    duration: '100 min',
    focus: 'Building and deploying AI solutions on Azure using AI Foundry and OpenAI',
    domains: [
      { name: 'Plan & Manage Azure AI Solutions',    pct: '25–30%' },
      { name: 'Decision Support Solutions',          pct: '10–15%' },
      { name: 'Azure AI Vision Solutions',           pct: '15–20%' },
      { name: 'NLP Solutions',                       pct: '25–30%' },
      { name: 'Generative AI Solutions',             pct: '10–15%' },
    ],
    topTopics: ['Azure AI Foundry', 'Azure OpenAI Service', 'Azure AI Search', 'Document Intelligence', 'Semantic Kernel', 'RAG pipelines'],
  },
  {
    id: 'Google-MLE',
    name: 'Google Professional ML Engineer',
    provider: 'Google Cloud',
    tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    difficulty: 'Advanced',
    questions: '60',
    duration: '120 min',
    focus: 'End-to-end ML on Google Cloud: architecture, training, deployment, MLOps',
    domains: [
      { name: 'Architect Low-Code AI Solutions',     pct: '~13%' },
      { name: 'Collaborate Within and Across Teams', pct: '~10%' },
      { name: 'Scale Prototypes into ML Models',     pct: '~18%' },
      { name: 'Serve and Scale Models',              pct: '~19%' },
      { name: 'Automate and Orchestrate ML Pipelines', pct: '~20%' },
      { name: 'Monitor AI Solutions',                pct: '~20%' },
    ],
    topTopics: ['Vertex AI', 'BigQuery ML', 'Vertex AI Pipelines', 'Model monitoring', 'MLOps', 'Responsible AI', 'Feature Store'],
  },
  {
    id: 'GIAC-GOAA',
    name: 'GIAC Offensive AI Analyst',
    provider: 'GIAC / SANS',
    tagColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    difficulty: 'Advanced',
    questions: 'Hands-on (CyberLive)',
    duration: 'Practical',
    focus: 'Offensive AI techniques: LLM attacks, jailbreaking, prompt injection, AI red teaming',
    domains: [
      { name: 'AI Fundamentals (NLP, GANs, RAG)' },
      { name: 'Vector Databases' },
      { name: 'Custom GPTs & Assistants' },
      { name: 'Prompt Injection & LLM Bypass' },
      { name: 'Malicious AI Applications' },
    ],
    topTopics: ['Prompt injection', 'Jailbreaking', 'RAG attacks', 'Tool abuse', 'Data exfiltration', 'Red teaming LLMs', 'Vector DB attacks'],
  },
  {
    id: 'GIAC-GASAE',
    name: 'GIAC AI Security Automation Engineer',
    provider: 'GIAC / SANS',
    tagColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    difficulty: 'Intermediate–Advanced',
    questions: 'Hands-on (CyberLive)',
    duration: 'Practical',
    focus: 'Automating security workflows with AI: SOAR, vulnerability discovery, incident response',
    domains: [
      { name: 'AI Automation in Security' },
      { name: 'Vulnerability Discovery Automation' },
      { name: 'AI-Driven Attack Simulations' },
      { name: 'SOAR-Driven Incident Response' },
      { name: 'Host Remediation & Infrastructure Automation' },
    ],
    topTopics: ['SOAR', 'AI-powered SIEM', 'Detection rule generation', 'Automated triage', 'Playbook automation', 'AI threat hunting'],
  },
  {
    id: 'CAISP',
    name: 'Certified AI Security Professional',
    provider: 'Practical DevSecOps',
    tagColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    difficulty: 'Advanced (Practical)',
    questions: '5 real-world challenges',
    duration: '6 hrs + 24hr report',
    focus: 'Practical AI security: LLM vulnerabilities, AI system assessment, secure deployment',
    domains: [
      { name: 'AI & LLM Security Fundamentals' },
      { name: 'Model Risks and Vulnerabilities' },
      { name: 'AI Supply Chain Security' },
      { name: 'Securing LLMs, RAG, AI Deployments' },
      { name: 'AI System Assessment & Audit' },
    ],
    topTopics: ['LLM security assessment', 'RAG security', 'Model supply chain', 'AI deployment hardening', 'Security audit', 'Red teaming'],
  },
];

interface CertMapProps {
  onCertFilter: (certId: string) => void;
}

export default function CertMap({ onCertFilter }: CertMapProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">AI Certification Map</h2>
          <p className="text-xs text-slate-500 mt-0.5">8 certifications mapped to Playbook topics. Click a cert to filter study materials.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {CERTS.map((cert) => (
          <div key={cert.id} className="border border-slate-700 rounded-xl bg-slate-800/40 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-700/50 flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${cert.tagColor}`}>
                    {cert.id}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{cert.provider}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100 mt-1">{cert.name}</h3>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] font-mono text-slate-500">{cert.difficulty}</div>
                <div className="text-[10px] font-mono text-slate-600">{cert.questions} Q · {cert.duration}</div>
              </div>
            </div>

            {/* Focus */}
            <div className="px-4 py-2 border-b border-slate-700/30">
              <p className="text-[11px] text-slate-400 leading-relaxed">{cert.focus}</p>
            </div>

            {/* Domains */}
            <div className="px-4 py-3 border-b border-slate-700/30">
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-2">Exam Domains</p>
              <div className="space-y-1">
                {cert.domains.map((d) => (
                  <div key={d.name} className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">{d.name}</span>
                    {d.pct && <span className="text-[10px] font-mono text-slate-600">{d.pct}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Top topics */}
            <div className="px-4 py-3">
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-2">Key Topics</p>
              <div className="flex flex-wrap gap-1">
                {cert.topTopics.map((t) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400 border border-slate-600/50">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Filter button */}
            <div className="px-4 pb-3">
              <button
                onClick={() => onCertFilter(cert.id)}
                className="w-full text-[11px] font-mono py-1.5 rounded border border-violet-500/30 text-violet-400 bg-violet-500/5 hover:bg-violet-500/10 transition-colors"
              >
                Study {cert.id} topics →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
