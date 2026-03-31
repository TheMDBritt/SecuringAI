import type { GRCScenario } from '@/types';

export const GRC_SCENARIOS: GRCScenario[] = [
  // ── Risk Classification (4) ──────────────────────────────────────────────────
  {
    id: 'rc-01',
    title: 'EU AI Act: HR Screening Tool Classification',
    type: 'risk-classification',
    difficulty: 'beginner',
    frameworks: ['EU-AI-Act'],
    brief: `**Deployment:** A mid-sized logistics company has deployed an AI tool that automatically screens CVs and ranks candidates for warehouse roles. The tool was trained on 5 years of historical hiring data and produces a ranked shortlist that recruiters review before making calls.

**Key Facts:**
- Processes ~2,000 applications per month
- Shortlist is reviewed by a human recruiter before contact
- Training data sourced from 2018–2023 historical hires
- No bias audit has been performed
- Vendor claims "the recruiter always makes the final call"

**Your Task:** Classify this system under the EU AI Act risk framework. Identify the applicable risk tier, justify your classification, list relevant obligations, and recommend controls.`,
    evaluationHints: [
      'EU AI Act Annex III lists employment/worker management AI as high-risk',
      'Human review does not automatically reduce risk tier under EU AI Act',
      'High-risk systems require conformity assessment, transparency, and human oversight',
      'Historical bias in training data is a key finding to flag',
      'Obligations include: technical documentation, logging, accuracy/robustness testing, bias monitoring',
    ],
  },
  {
    id: 'rc-02',
    title: 'NIST AI RMF: Medical Triage Chatbot Risk Tier',
    type: 'risk-classification',
    difficulty: 'intermediate',
    frameworks: ['NIST-AIRMF'],
    brief: `**Deployment:** A regional hospital network uses an AI chatbot on its patient portal to collect symptoms, recommend urgency levels (e.g., "visit ER now" vs "schedule appointment"), and route patients to appropriate care paths.

**Key Facts:**
- Handles ~500 patient interactions per day
- Outputs: urgency tier (1–4) + recommended action
- No physician review of individual chatbot outputs
- Model was fine-tuned on de-identified patient records
- Integrated into EHR for logging

**Your Task:** Using the NIST AI RMF, assign an AI risk tier, map findings to the GOVERN/MAP/MEASURE/MANAGE functions, and identify the highest-priority controls.`,
    evaluationHints: [
      'NIST AI RMF maps risk through GOVERN, MAP, MEASURE, MANAGE functions',
      'Healthcare triage with no physician review = very high consequence of failure',
      'Risk tier should be Very High given life-safety implications',
      'MAP function: identify stakeholders, context of use, intended vs actual use',
      'MEASURE function: performance on edge cases, demographic parity in triage outcomes',
      'MANAGE function: incident response plan, rollback, human escalation paths',
    ],
  },
  {
    id: 'rc-03',
    title: 'EU AI Act: Predictive Policing Tool',
    type: 'risk-classification',
    difficulty: 'advanced',
    frameworks: ['EU-AI-Act', 'NIST-AIRMF'],
    brief: `**Deployment:** A city police department is piloting an AI system that ingests crime reports, social media data, and demographic statistics to predict "hotspot" zones and recommend patrol allocation for the next 24 hours.

**Key Facts:**
- Predictions updated hourly
- Patrol commanders receive heatmap + confidence score
- Training data: 10 years of incident reports + 911 calls
- No formal bias audit; vendor says accuracy is 78%
- System flags individuals in some pilot configurations (currently disabled)

**Your Task:** Classify under EU AI Act. Evaluate whether any prohibited AI practice provisions apply. If high-risk, list all obligations. Note any fundamental rights implications.`,
    evaluationHints: [
      'EU AI Act Article 5 prohibits certain real-time biometric and social scoring uses',
      'Individual-flagging mode (even if disabled) may trigger prohibited AI practice review',
      'Predictive policing using demographic data = strong fundamental rights concern',
      'Law enforcement use is explicitly listed in Annex III as high-risk at minimum',
      'Must assess: transparency, accountability, fundamental rights impact assessment',
      'Accuracy of 78% without bias breakdown is insufficient for law enforcement AI',
    ],
  },
  {
    id: 'rc-04',
    title: 'ISO 42001: AI Risk Register for a Lending Platform',
    type: 'risk-classification',
    difficulty: 'intermediate',
    frameworks: ['ISO-AI', 'NIST-AIRMF'],
    brief: `**Deployment:** A fintech startup uses an ML model to make real-time loan approval decisions (approve/deny/refer) for personal loans up to $50,000. Decisions are instant and only referred cases get human review.

**Key Facts:**
- Model uses: credit score, income, employment, zip code, transaction history
- 85% of decisions are fully automated (no human review)
- Model retrained quarterly on new loan outcomes
- No formal AI risk register exists
- GDPR Article 22 may apply (EU customers)

**Your Task:** Using ISO 42001 and NIST AI RMF principles, draft a risk register structure for this system. Identify top 5 risks, rate likelihood and impact, and propose controls.`,
    evaluationHints: [
      'ISO 42001 requires an AI risk management process integrated into overall governance',
      'GDPR Article 22 gives individuals rights regarding solely automated decisions',
      'Zip code as feature can encode race/ethnicity — proxy discrimination risk',
      'Top risks: fairness/bias, regulatory non-compliance, model drift, data quality, security',
      'Controls: bias testing, explainability, human review pathway, drift monitoring, audit logs',
      'Risk register should include: risk ID, description, likelihood, impact, owner, control, residual risk',
    ],
  },

  // ── Shadow AI Audit (3) ──────────────────────────────────────────────────────
  {
    id: 'sa-01',
    title: 'Shadow AI: HR Manager Using ChatGPT for Performance Reviews',
    type: 'shadow-ai-audit',
    difficulty: 'beginner',
    frameworks: ['NIST-AIRMF', 'EU-AI-Act'],
    brief: `**Situation:** During an internal audit, you discover that several HR managers at a 3,000-employee company have been using ChatGPT (personal accounts, not enterprise) to draft performance reviews. Managers paste employee data including names, performance scores, disciplinary history, and salary information into the chatbot.

**Key Facts:**
- ~15 managers using personal ChatGPT accounts for 6+ months
- Data sent includes: employee names, roles, salaries, performance ratings, personal notes
- No data processing agreement with OpenAI
- Company has a "no AI tools without IT approval" policy (not enforced)
- GDPR applies (EU employee data)

**Your Task:** Conduct a shadow AI audit finding. Identify data protection violations, policy gaps, risk exposure, and remediation steps.`,
    evaluationHints: [
      'Sending employee PII to third-party AI without DPA = GDPR Article 28 violation',
      'No legal basis for processing employee data via unapproved third-party tool',
      'Shadow AI finding: unauthorized tool use, data exfiltration risk, policy non-compliance',
      'Remediation: stop use immediately, assess what data was sent, notify DPO',
      'Policy fix: approved AI tools list, data classification training, DPA with AI vendors',
      'Controls: DLP tools, browser extension blocking, employee training',
    ],
  },
  {
    id: 'sa-02',
    title: 'Shadow AI: Developer Using GitHub Copilot on Classified Codebase',
    type: 'shadow-ai-audit',
    difficulty: 'intermediate',
    frameworks: ['NIST-AIRMF', 'OWASP-LLM'],
    brief: `**Situation:** A security review flags that a developer on a government contractor project has been using GitHub Copilot (personal subscription) while working on a classified application. The application processes sensitive national security data.

**Key Facts:**
- Developer enabled Copilot on their personal GitHub account
- Copilot may have transmitted code snippets to GitHub/Microsoft servers
- Codebase is classified SECRET; telemetry sharing is prohibited by contract
- Developer believed Copilot "didn't send anything externally"
- No organization-wide AI coding tool policy exists

**Your Task:** Document the shadow AI incident, assess the data exposure risk, identify contractual and security violations, and recommend organizational controls.`,
    evaluationHints: [
      'Copilot by default sends code snippets for completion — likely contract violation',
      'Supply chain risk: model trained on snippets could theoretically leak patterns',
      'Violations: data handling agreement, security classification requirements, contractor terms',
      'OWASP LLM05 Supply Chain Vulnerabilities applies to AI tool integration risk',
      'Immediate actions: revoke access, preserve logs, notify ISSO, begin incident response',
      'Policy fix: approved AI tools list by data classification level, technical controls (network filtering)',
    ],
  },
  {
    id: 'sa-03',
    title: 'Shadow AI: Marketing Team Building Customer-Facing Chatbot',
    type: 'shadow-ai-audit',
    difficulty: 'advanced',
    frameworks: ['EU-AI-Act', 'NIST-AIRMF', 'OWASP-LLM'],
    brief: `**Situation:** A marketing team at a retail company has built and deployed a customer-facing chatbot using a no-code AI platform. The chatbot answers product questions and collects email addresses for promotions. It was launched without IT, legal, or security review.

**Key Facts:**
- Built on a no-code platform using an embedded LLM API
- Collects customer emails and product interest data
- No privacy notice or cookie consent for AI-collected data
- No security review; vendor security posture unknown
- Chatbot has no content filtering and can discuss competitors
- ~10,000 customer interactions in 2 weeks since launch

**Your Task:** Conduct a comprehensive shadow AI audit. Cover: data governance, security posture, regulatory exposure, reputational risk, and remediation plan.`,
    evaluationHints: [
      'No privacy notice for data collection = GDPR Article 13/14 violation',
      'Deploying internet-facing AI without security review = critical process failure',
      'OWASP LLM vulnerabilities: prompt injection, excessive agency, data exfiltration risk',
      'EU AI Act: customer-facing general purpose AI requires transparency obligations',
      'Vendor risk: unknown third-party security posture for customer data',
      'Remediation: immediate takedown or freeze, legal review, DPA with vendor, penetration test, privacy notice',
    ],
  },

  // ── Responsible AI Review (4) ────────────────────────────────────────────────
  {
    id: 'ra-01',
    title: 'Responsible AI: Biased Hiring Model',
    type: 'responsible-ai-review',
    difficulty: 'beginner',
    frameworks: ['NIST-AIRMF', 'EU-AI-Act'],
    brief: `**System:** An AI recruiting tool ranks job candidates for software engineering roles. Post-deployment analysis reveals female candidates are ranked 30% lower on average than male candidates with equivalent qualifications.

**Key Facts:**
- Model trained on 10 years of successful hires (historically 85% male)
- Ranking score used to decide who receives recruiter calls
- Disparity identified in internal quarterly review
- Vendor claims model is "skills-based" and "objective"
- No fairness metrics were specified at procurement

**Your Task:** Perform a responsible AI review. Identify the bias type, root cause, affected fairness metrics, remediation steps, and governance changes needed.`,
    evaluationHints: [
      'Historical bias in training data causes representation bias in outputs',
      'Fairness metrics to assess: demographic parity, equalized odds, individual fairness',
      'Root cause: proxy features correlating with gender (e.g., job titles, gaps)',
      'NIST AI RMF MANAGE: bias requires immediate mitigation, not just monitoring',
      'Remediation: bias audit, retraining with balanced data, fairness constraints',
      'Governance: require bias testing before procurement, ongoing monitoring',
    ],
  },
  {
    id: 'ra-02',
    title: 'Responsible AI: Deepfake Detection Tool Deployment',
    type: 'responsible-ai-review',
    difficulty: 'intermediate',
    frameworks: ['NIST-AIRMF', 'EU-AI-Act'],
    brief: `**System:** A media company deploys an AI deepfake detection tool to flag potentially synthetic videos before publication. The tool outputs a confidence score (0–100); videos above 70 are flagged for human review.

**Key Facts:**
- Tool is 92% accurate on benchmark dataset (balanced dataset)
- Real-world false positive rate for authentic minority-community videos: 34%
- False positives result in delayed or blocked publication
- No transparency to content creators about why content was flagged
- Tool was procured without responsible AI evaluation

**Your Task:** Conduct a responsible AI review. Assess: fairness across demographic groups, transparency obligations, impact on freedom of expression, and remediation.`,
    evaluationHints: [
      'Differential error rates across demographic groups = disparate impact',
      'False positive rate of 34% for minority content = discriminatory effect',
      'EU AI Act transparency: AI-generated/detected content must have clear disclosure',
      'Freedom of expression impact: suppressing authentic content is a fundamental rights risk',
      'Remediation: retrain on demographically balanced data, lower threshold for high-impact decisions, add appeal process',
      'Governance: algorithmic impact assessment, regular fairness audits, transparency notices',
    ],
  },
  {
    id: 'ra-03',
    title: 'Responsible AI: AI Parole Risk Assessment Tool',
    type: 'responsible-ai-review',
    difficulty: 'advanced',
    frameworks: ['EU-AI-Act', 'NIST-AIRMF', 'ISO-AI'],
    brief: `**System:** A state corrections department uses an AI risk assessment tool to inform parole board decisions. The tool produces a "recidivism risk score" (Low/Medium/High) that is included in all parole hearing packets.

**Key Facts:**
- Tool uses: prior convictions, age, zip code, employment history, family incarceration history
- Risk scores are included in hearing packets but not binding
- Analysis shows Black defendants score High risk at 2.1x the rate of white defendants with similar profiles
- Parole board members report "high weight" on score in interviews
- No explainability mechanism; vendor proprietary model

**Your Task:** Conduct a responsible AI review. Address: algorithmic fairness, explainability requirements, due process implications, and whether use should continue.`,
    evaluationHints: [
      'Racial disparity at 2.1x rate = clear disparate impact, constitutional due process concern',
      'Zip code and family incarceration history are race-correlated proxy features',
      'Proprietary model with no explainability violates due process (cannot challenge decision)',
      'EU AI Act: high-risk AI in law enforcement requires explainability and human oversight',
      'COMPAS-style tools have well-documented fairness failures — cite in findings',
      'Recommendation: suspend use pending independent audit; require explainability; remove proxy features',
    ],
  },
  {
    id: 'ra-04',
    title: 'Responsible AI: LLM-Powered Student Tutoring System',
    type: 'responsible-ai-review',
    difficulty: 'beginner',
    frameworks: ['NIST-AIRMF', 'ISO-AI'],
    brief: `**System:** A K-12 school district deploys an LLM-powered tutoring chatbot for students aged 10–17. Students interact with the AI to get homework help and practice problems.

**Key Facts:**
- Students are minors (COPPA and FERPA apply in the US)
- Chatbot has no content filter for age-appropriate responses
- Student conversation logs stored by vendor for 12 months
- Parents were not notified; opt-out process does not exist
- LLM occasionally provides incorrect factual information (hallucinations)

**Your Task:** Conduct a responsible AI review. Address: child safety, data protection, accuracy/reliability, transparency to parents, and recommended controls.`,
    evaluationHints: [
      'COPPA requires verifiable parental consent for children under 13',
      'FERPA: student education records require consent before disclosure to third parties',
      'Content filtering is mandatory for minors — unfiltered LLM is a child safety risk',
      'Hallucinations in educational context can cause learning harm',
      'Controls: age-appropriate content filters, data minimization, parental consent process, accuracy disclaimers',
      'Transparency: parents must know AI is used, what data is collected, how to opt out',
    ],
  },

  // ── Compliance Gap Analysis (4) ──────────────────────────────────────────────
  {
    id: 'cg-01',
    title: 'Compliance Gap: EU AI Act Conformity Assessment',
    type: 'compliance-gap',
    difficulty: 'intermediate',
    frameworks: ['EU-AI-Act'],
    brief: `**Organization:** A European insurance company uses an AI system to automatically calculate premium quotes for health insurance. The system processes age, location, lifestyle questionnaire responses, and claims history.

**Current State:**
- No technical documentation exists beyond vendor data sheets
- No conformity assessment has been performed
- Logging is implemented but logs are only retained 30 days
- Human review only occurs for quotes above €10,000/year
- Risk management system exists for traditional IT but not specifically for AI

**Your Task:** Identify all EU AI Act compliance gaps for this high-risk AI system. For each gap, cite the relevant Article or Annex, describe the gap, rate severity, and propose remediation.`,
    evaluationHints: [
      'Insurance pricing = high-risk under EU AI Act Annex III (access to essential services)',
      'Article 9: risk management system specific to AI — gap: only general IT risk management',
      'Article 10: training data governance and bias assessment — gap: unknown',
      'Article 11: technical documentation — gap: no documentation',
      'Article 12: logging must be sufficient for audit — gap: 30 days too short',
      'Article 14: human oversight — gap: automated decisions below €10k threshold',
      'Article 17: quality management system — gap: not AI-specific',
    ],
  },
  {
    id: 'cg-02',
    title: 'Compliance Gap: GDPR Article 22 Automated Decisions',
    type: 'compliance-gap',
    difficulty: 'beginner',
    frameworks: ['EU-AI-Act', 'NIST-AIRMF'],
    brief: `**Organization:** A consumer bank uses an AI model to make fully automated decisions on credit card applications. Applicants receive instant approve/deny/refer responses via a mobile app.

**Current State:**
- Approximately 90% of decisions are fully automated (no human review)
- Privacy policy mentions "automated decision-making" in paragraph 14 of a 30-page document
- No mechanism for customers to request human review
- No explanation of the decision logic provided to customers
- DPO role exists but was not consulted on the AI system

**Your Task:** Identify GDPR Article 22 compliance gaps. For each gap, describe the requirement, current state, gap severity, and remediation. Also assess any EU AI Act crossover obligations.`,
    evaluationHints: [
      'GDPR Article 22(1): right not to be subject to solely automated decisions with significant effects',
      'Article 22(3): right to obtain human review, express point of view, contest decision',
      'Article 13/14: data subjects must be clearly informed about automated decision-making',
      'Gap: burying disclosure in paragraph 14 is insufficient transparency',
      'Gap: no human review mechanism = Article 22(3) violation',
      'Gap: no explanation of decision factors = Article 22(3) and Article 5(1)(a) transparency principle',
      'EU AI Act: credit scoring high-risk under Annex III — conformity assessment required',
    ],
  },
  {
    id: 'cg-03',
    title: 'Compliance Gap: NIST AI RMF Maturity Assessment',
    type: 'compliance-gap',
    difficulty: 'advanced',
    frameworks: ['NIST-AIRMF', 'ISO-AI'],
    brief: `**Organization:** A US federal agency deploys multiple ML models for document classification, fraud detection, and benefits eligibility determination. An internal review is requested against the NIST AI RMF.

**Current State:**
- No AI inventory exists; models deployed ad-hoc by individual teams
- Benefits eligibility model retrained annually; no drift monitoring
- Fraud detection model has no documented performance baseline
- AI ethics policy exists (2019) but predates current models
- No AI incident response playbook
- Procurement requires general IT security review but no AI-specific checklist

**Your Task:** Assess maturity against all four NIST AI RMF functions (GOVERN, MAP, MEASURE, MANAGE). Rate each function 1–4 (Initial/Managed/Defined/Optimizing) and identify priority remediation actions.`,
    evaluationHints: [
      'GOVERN: no AI inventory, outdated policy, no AI incident response = Level 1 (Initial)',
      'MAP: some models documented individually but no systematic approach = Level 1-2',
      'MEASURE: no drift monitoring, no performance baseline = Level 1',
      'MANAGE: no AI incident playbook, ad-hoc procurement = Level 1',
      'Priority 1: create AI inventory and governance committee',
      'Priority 2: establish drift monitoring for all production models',
      'Priority 3: AI-specific procurement checklist and security review',
      'Priority 4: AI incident response playbook integrated with existing IR process',
    ],
  },
  {
    id: 'cg-04',
    title: 'Compliance Gap: OWASP LLM Top 10 Security Assessment',
    type: 'compliance-gap',
    difficulty: 'intermediate',
    frameworks: ['OWASP-LLM', 'NIST-AIRMF'],
    brief: `**System:** A legal services firm has built an internal AI assistant that retrieves documents from a SharePoint knowledge base (RAG), summarizes case files, and drafts routine legal correspondence. It is accessed by 200 lawyers and paralegals.

**Current State:**
- System prompt is hardcoded; no prompt injection protection
- RAG retrieves from SharePoint without access control checks (all users see all docs)
- No output validation; LLM responses posted directly to case management system
- Tool use enabled: LLM can send emails and create calendar events
- No logging of what documents were retrieved or what actions were taken
- Vendor API key stored in client-side JavaScript

**Your Task:** Map all findings to OWASP LLM Top 10 categories. For each finding, cite the LLM category, describe the risk, rate severity (Critical/High/Medium/Low), and recommend a specific technical control.`,
    evaluationHints: [
      'LLM01 Prompt Injection: no input protection = Critical',
      'LLM02 Insecure Output Handling: LLM output posted directly to case system = High',
      'LLM05 Supply Chain: vendor API key in client-side JS = Critical (credential exposure)',
      'LLM06 Sensitive Information Disclosure: RAG without access control = all users see all docs = Critical',
      'LLM07 Insecure Plugin Design: email/calendar tool use without confirmation = High',
      'LLM08 Excessive Agency: LLM can take real-world actions without human confirmation = High',
      'No logging = LLM09 Misinformation and audit failure',
      'Controls: server-side API key, access-controlled RAG, output sanitization, tool confirmation dialogs, audit logging',
    ],
  },
];

export function getGRCScenariosByType(type: string): GRCScenario[] {
  return GRC_SCENARIOS.filter((s) => s.type === type);
}

export function getGRCScenarioById(id: string): GRCScenario | undefined {
  return GRC_SCENARIOS.find((s) => s.id === id);
}
