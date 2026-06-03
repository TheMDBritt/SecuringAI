'use client';
import { useMemo } from 'react';
import { CERT_EXAMS } from '@/lib/quiz-cert-domains';
import { QUIZ_QUESTIONS } from '@/lib/playbook-quiz';

const CERT_FOCUS: Record<string, { focus: string; topTopics: string[] }> = {
  'SecAI': {
    focus: 'AI security concepts, defending AI systems, AI-assisted security operations.',
    topTopics: ['OWASP LLM Top 10', 'Adversarial attacks', 'Guardrails', 'NIST AI RMF', 'AI-powered SIEM', 'Prompt injection', 'EU AI Act'],
  },
  'AWS-AIF-C01': {
    focus: 'AWS AI/ML services, GenAI fundamentals, responsible AI on AWS.',
    topTopics: ['Amazon Bedrock', 'Amazon SageMaker', 'Amazon Q', 'RAG', 'Foundation models', 'Responsible AI', 'Prompt engineering'],
  },
  'Azure-AI901': {
    focus: 'Replaces AI-900 (retiring Jun 2026). Azure AI Foundry, generative AI, agentic systems, responsible AI on Azure.',
    topTopics: ['Azure AI Foundry', 'Azure OpenAI', 'Generative AI', 'Computer Vision', 'Responsible AI', 'AI agents'],
  },
  'Azure-AI103': {
    focus: 'Replaces AI-102 (retiring Jun 2026). End-to-end AI apps and agents on Azure AI Foundry with RAG and agent orchestration.',
    topTopics: ['Azure AI Foundry', 'Azure OpenAI Service', 'AI agents', 'Azure AI Search', 'Semantic Kernel', 'RAG pipelines'],
  },
  'SC-500': {
    focus: 'Replaces AZ-500 (retiring Aug 2026). Securing Azure, M365, and AI workloads: Entra ID, Defender XDR, Sentinel, Purview DSPM for AI, Prompt Shields, Security Copilot.',
    topTopics: ['Microsoft Entra ID', 'Defender XDR', 'Microsoft Sentinel', 'KQL', 'Purview DSPM for AI', 'Azure OpenAI', 'Prompt Shields', 'Security Copilot', 'Conditional Access', 'PIM', 'Zero Trust'],
  },
  'Google-MLE': {
    focus: 'End-to-end ML on Google Cloud: architecture, training, deployment, MLOps.',
    topTopics: ['Vertex AI', 'BigQuery ML', 'Vertex AI Pipelines', 'Model monitoring', 'MLOps', 'Responsible AI', 'Feature Store'],
  },
  'GIAC-GOAA': {
    focus: 'Offensive AI techniques: LLM attacks, jailbreaking, prompt injection, AI red teaming. Hands-on CyberLive format.',
    topTopics: ['Prompt injection', 'Jailbreaking', 'RAG attacks', 'Tool abuse', 'Data exfiltration', 'Red teaming LLMs', 'Vector DB attacks'],
  },
  'GIAC-GASAE': {
    focus: 'Automating security workflows with AI: SOAR, vulnerability discovery, incident response. Hands-on CyberLive format.',
    topTopics: ['SOAR', 'AI-powered SIEM', 'Detection rule generation', 'Automated triage', 'Playbook automation', 'AI threat hunting'],
  },
  'CAISP': {
    focus: 'Practical AI security: LLM vulnerabilities, AI system assessment, secure deployment. 5 real-world challenges + 24-hour report.',
    topTopics: ['LLM security assessment', 'RAG security', 'Model supply chain', 'AI deployment hardening', 'Security audit', 'Red teaming'],
  },
  'CAIS': {
    focus: 'Hands-on AI security certification covering adversarial ML, LLM vulnerability assessment, AI red teaming, and securing AI pipelines.',
    topTopics: ['Adversarial inputs', 'Data poisoning', 'Model inversion', 'LLM red teaming', 'Prompt injection', 'OWASP LLM Top 10', 'AI supply chain', 'MLOps security'],
  },
  'CISSP': {
    focus: 'Gold-standard generalist security cert. 8 domains spanning risk, architecture, cryptography, network security, IAM, testing, operations, and SDLC. Requires 5 years paid InfoSec experience.',
    topTopics: ['Risk management', 'BCP/DRP', 'Cryptography', 'PKI', 'Zero Trust', 'IAM/MFA', 'Pen testing', 'SDLC', 'Incident response', 'Data classification', 'AI threat modelling'],
  },
  'CISM': {
    focus: 'Management-focused security cert. Governance, risk, program management, and incident response from a business/leadership lens. Requires 5 years experience with 3 in management.',
    topTopics: ['Security strategy', 'Risk appetite', 'KPIs/KRIs', 'Board reporting', 'BIA', 'Incident response plan', 'AI governance', 'Third-party risk', 'Security program'],
  },
};

interface CertMapProps {
  onCertFilter: (certId: string) => void;
}

export default function CertMap({ onCertFilter }: CertMapProps) {
  const questionCounts = useMemo(
    () => Object.fromEntries(
      CERT_EXAMS.map((c) => [c.id, QUIZ_QUESTIONS.filter((q) => q.certTags.includes(c.id)).length]),
    ),
    [],
  );

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">AI Certification Map</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {CERT_EXAMS.length} exams mapped to Playbook topics and quiz domains.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {CERT_EXAMS.map((cert) => {
          const meta = CERT_FOCUS[cert.id];
          const qCount = questionCounts[cert.id] ?? 0;
          return (
            <div key={cert.id} className="border border-slate-700 rounded-lg bg-slate-800/40 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-700/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${cert.tagColor}`}>
                        {cert.id}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{cert.provider}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100 leading-snug">{cert.name}</h3>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-mono text-slate-500">{cert.difficulty}</div>
                    <div className="text-[10px] font-mono text-slate-600">{cert.examQs} · {cert.duration}</div>
                    <div className="text-xs font-mono font-bold text-slate-300 mt-0.5">{qCount} Q</div>
                  </div>
                </div>
              </div>

              {/* Focus */}
              {meta && (
                <div className="px-4 py-2 border-b border-slate-700/30">
                  <p className="text-[11px] text-slate-400 leading-relaxed">{meta.focus}</p>
                </div>
              )}

              {/* Domains */}
              <div className="px-4 py-3 border-b border-slate-700/30">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-1.5">Exam Domains</p>
                <div className="space-y-0.5">
                  {cert.domains.map((d) => (
                    <div key={d.name} className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">{d.name}</span>
                      {d.pct && <span className="text-[10px] font-mono text-slate-600 shrink-0">{d.pct}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Top topics */}
              {meta && (
                <div className="px-4 py-3">
                  <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-1.5">Key Topics</p>
                  <div className="flex flex-wrap gap-1">
                    {meta.topTopics.map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400 border border-slate-600/50">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="px-4 pb-3 flex gap-2">
                <button
                  onClick={() => onCertFilter(cert.id)}
                  className="flex-1 text-[11px] font-mono py-1.5 rounded border border-violet-500/30 text-violet-400 bg-violet-500/5 hover:bg-violet-500/10 transition-colors"
                >
                  Filter topics → {cert.id}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
