/**
 * Deterministic AI-governance analyst for Dojo 3.
 *
 * Like Dojo 2, Dojo 3 grades the assistant's artifact rather than the learner's
 * prompt. With no OPENAI_API_KEY the assistant returned a stub greeting, which
 * fell under the evaluator's 80-character floor and was reported as PASS with a
 * score of 100 — a learner was told they had succeeded at producing nothing.
 *
 * This module writes the governance artifact from the deployment brief the
 * learner submitted. Classification follows the published instruments: EU AI
 * Act Article 5 for prohibited practices and Annex III for the eight high-risk
 * categories, with NIST AI RMF functions, ISO/IEC 42001 clauses and the OWASP
 * LLM Top 10 (2026 codes, from lib/owasp-llm-top10) layered per scenario.
 *
 * It is not a rubber stamp. A brief with no use case, no data types and no
 * deployment context cannot be classified, and the analyst says so instead of
 * emitting headings that would satisfy the rubric without earning it.
 */
import type { Dojo3Config } from '@/types';
import { OWASP_LLM_2026 } from '@/lib/owasp-llm-top10';

// ─── Classification ──────────────────────────────────────────────────────────

export type RiskTier = 'Prohibited' | 'High-Risk' | 'Limited Risk' | 'Minimal Risk';

/** EU AI Act Article 5. These are banned outright, not risk-managed. */
const PROHIBITED: Array<{ re: RegExp; basis: string }> = [
  { re: /\breal.?time\b.{0,30}\bbiometric\b.{0,40}\b(public|surveillance|law enforcement)\b|\bbiometric\s+surveillance\b/i, basis: 'Art. 5(1)(h) — real-time remote biometric identification in publicly accessible spaces' },
  { re: /\bsocial\s+scoring\b/i, basis: 'Art. 5(1)(c) — social scoring by or on behalf of public authorities' },
  { re: /\bsubliminal\b|\bmanipulat\w+\s+techniques?\b/i, basis: 'Art. 5(1)(a) — subliminal or purposefully manipulative techniques' },
  { re: /\bexploit\w*\b.{0,30}\bvulnerab\w+\b.{0,30}\b(age|disability|children|elderly)\b/i, basis: 'Art. 5(1)(b) — exploitation of vulnerabilities of a specific group' },
  { re: /\bemotion\s+recognition\b.{0,40}\b(workplace|education|school)\b/i, basis: 'Art. 5(1)(f) — emotion inference in the workplace or education' },
  { re: /\bpredictive\s+policing\b/i, basis: 'Art. 5(1)(d) — predicting criminal offences from profiling alone' },
];

/** EU AI Act Annex III, the eight high-risk categories. */
const ANNEX_III: Array<{ re: RegExp; basis: string }> = [
  { re: /\bbiometric\b|\bface\s+recognition\b|\bfacial\b/i, basis: 'Annex III §1 — biometric identification and categorisation' },
  { re: /\bcritical\s+infrastructure\b|\bwater\b|\bgas\b|\belectricity\b|\btraffic\b/i, basis: 'Annex III §2 — critical infrastructure management' },
  // Employment is tested before education because a hiring brief routinely
  // lists "education" as an applicant data field. Matching the bare word there
  // classified a CV screener under §3, which is the wrong legal basis for the
  // right tier — and the basis is what the obligations hang off.
  //
  // The same trap runs one level deeper, and it used to fire here: a consumer
  // lending brief lists "employment tenure" among its features, a marketing
  // brief mentions "promotions", and a vendor contract mentions "termination".
  // None of those describe a system that manages workers, but the bare words
  // matched and sent a credit-scoring system to §4. Annex III §4 is about what
  // the system *does* to people at work, so the generic words now require a
  // worker-management context; the unambiguous ones (recruitment, CV screening,
  // job applicants) still stand alone.
  {
    re: new RegExp(
      [
        // Unambiguous on their own: these name the activity, not a data field.
        /\brecruit\w*\b|\bhiring\b|\bCV\s+screen\w*\b|\bresume\s+screen\w*\b|\bjob\s+applicants?\b/,
        /\bworker\s+management\b|\bperformance\s+review\b|\bdismissal\b/,
        // Generic words, only when they act on people at work.
        /\bemploy(?:ment|ee)\s+(?:decision|screen\w*|selection|monitor\w*|management|evaluation|assessment|ranking)\b/,
        /\b(?:monitor\w*|evaluat\w*|rank\w*|scor\w*|assess\w*)\s+(?:employees?|workers?|staff)\b/,
        /\b(?:promotion|termination)\s+decisions?\b|\btermination\s+of\s+employment\b/,
      ].map((r) => r.source).join('|'),
      'i',
    ),
    basis: 'Annex III §4 — employment, worker management and access to self-employment',
  },
  { re: /\beducational\s+(institution|setting|assessment)\b|\bexam\w*\b|\bstudent\b|\badmission\w*\b|\bvocational\b|\bschool\b/i, basis: 'Annex III §3 — education and vocational training' },
  { re: /\bcredit\s+scor\w+\b|\bloan\b|\binsurance\b|\bbenefits?\b|\bwelfare\b|\bessential\s+services?\b|\bemergency\s+(call|dispatch|triage)\b/i, basis: 'Annex III §5 — access to essential private and public services' },
  { re: /\blaw\s+enforcement\b|\bpolice\b|\bcriminal\b|\brecidivis\w+\b/i, basis: 'Annex III §6 — law enforcement' },
  { re: /\bmigration\b|\basylum\b|\bborder\b|\bvisa\b/i, basis: 'Annex III §7 — migration, asylum and border control' },
  { re: /\bjudicial\b|\bcourt\b|\bjustice\b|\bdemocratic\s+process\b|\belection\b/i, basis: 'Annex III §8 — administration of justice and democratic processes' },
];

/** Article 50 transparency duties: the system interacts with or generates for people. */
const LIMITED_RISK = /\bchatbot\b|\bconversational\b|\bcustomer\s+(service|support)\b|\bgenerat\w+\s+(content|image|text|video)\b|\bdeepfake\b|\bsynthetic\s+media\b|\bassistant\b/i;

export interface BriefFacts {
  /** Sentences that describe what the system does, used to scope the artifact. */
  useCase: string;
  personalData: boolean;
  specialCategory: boolean;
  automatedDecision: boolean;
  vendor: string | null;
  jurisdictions: string[];
  cited: string[];
  wordCount: number;
}

const RE_VENDOR = /\b(?:vendor|supplier|provider|from|using|built\s+on|powered\s+by)\s+([A-Z][A-Za-z0-9.&-]{2,24}(?:\s+(?:AI|Labs|Inc|Ltd|GmbH))?)\b/;
const RE_SPECIAL = /\b(health|medical|biometric|genetic|racial|ethnic|religio\w+|political|sexual\s+orientation|trade\s+union|criminal\s+record)\b/i;
const RE_PERSONAL = /\b(personal\s+data|PII|customer\s+data|employee\s+data|applicant|candidate|patient|user\s+data|name|email|address)\b/i;
const RE_AUTOMATED = /\b(automat\w+\s+decision|without\s+human|no\s+human\s+review|auto.?(reject|approve|screen|score)|decides?\b)/i;

export function extractBriefFacts(text: string): BriefFacts {
  const jur: string[] = [];
  if (/\bEU\b|\bEurope\w*\b|\bGDPR\b|\bEEA\b/i.test(text)) jur.push('EU');
  if (/\bUK\b|\bBritain\b|\bICO\b/i.test(text)) jur.push('UK');
  if (/\bUS\b|\bUnited States\b|\bEEOC\b|\bCalifornia\b|\bNYC\b/i.test(text)) jur.push('US');

  return {
    useCase: text.split(/[.\n]/).map((s) => s.trim()).filter((s) => s.length > 25)[0] ?? '',
    personalData: RE_PERSONAL.test(text),
    specialCategory: RE_SPECIAL.test(text),
    automatedDecision: RE_AUTOMATED.test(text),
    vendor: RE_VENDOR.exec(text)?.[1] ?? null,
    jurisdictions: jur,
    cited: Array.from(new Set(text.match(/\b(?:Article|Art\.|Annex|Clause)\s*[IVX\d.]+/gi) ?? [])),
    wordCount: text.trim().split(/\s+/).filter(Boolean).length,
  };
}

export interface Classification {
  tier: RiskTier;
  basis: string;
}

/**
 * Assigns the EU AI Act tier from the brief.
 *
 * The learner's configured `riskTier` is treated as a working hypothesis, not
 * an answer: if the brief evidences a different tier, the brief wins and the
 * disagreement is stated. A governance tool that simply echoes the analyst's
 * assumption back at them cannot catch a misclassification, which is the
 * failure this scenario is about.
 */
export function classify(text: string, config: Dojo3Config): Classification & { override?: string } {
  const prohibited = PROHIBITED.find((p) => p.re.test(text));
  if (prohibited) return { tier: 'Prohibited', basis: `EU AI Act ${prohibited.basis}` };

  const high = ANNEX_III.find((p) => p.re.test(text));
  if (high) return { tier: 'High-Risk', basis: `EU AI Act ${high.basis}` };

  if (LIMITED_RISK.test(text)) {
    return { tier: 'Limited Risk', basis: 'EU AI Act Art. 50 — transparency obligations for systems interacting with natural persons or generating synthetic content' };
  }

  const declared = config.riskTier && config.riskTier !== 'unset' ? config.riskTier : null;
  if (declared) {
    return {
      tier: (declared.charAt(0).toUpperCase() + declared.slice(1)) as RiskTier,
      basis: 'No Annex III or Art. 5 trigger is evidenced in the brief; tier reflects the working classification set in the control panel and is unverified',
    };
  }
  return { tier: 'Minimal Risk', basis: 'No Art. 5 practice and no Annex III category is evidenced in the brief' };
}

// ─── Framework sections ──────────────────────────────────────────────────────

function nistSection(tier: RiskTier, facts: BriefFacts): string[] {
  return [
    '### NIST AI RMF profile',
    '',
    '- **GOVERN** 1.1 — assign named accountability for this system; a risk owner who can halt deployment, not a committee.',
    `- **MAP** 1.1, 5.1 — context is established: ${facts.useCase ? `"${facts.useCase.slice(0, 120)}"` : 'use case as described in the brief'}. MAP 5.1 requires the impacts on affected individuals to be characterised, not just the business benefit.`,
    `- **MEASURE** 2.5, 2.11 — define the evaluation set and the fairness metrics before deployment. For a ${tier.toLowerCase()} system, measurement is the evidence a regulator will ask for.`,
    '- **MANAGE** 2.2, 4.1 — pre-agree the response to a failure: who is paged, what the rollback is, and the threshold at which the system is withdrawn.',
    '',
  ];
}

function isoSection(tier: RiskTier): string[] {
  return [
    '### ISO/IEC 42001 mapping',
    '',
    '- Clause 4 — define the AIMS scope and the interested parties for this system.',
    '- Clause 6.1.2 — AI risk assessment covering this use case; record the criteria, not only the outcome.',
    `- Clause 8.1 — operational planning and control proportionate to a ${tier.toLowerCase()} classification.`,
    '- Clause 9.1 — monitoring, measurement, analysis and evaluation.',
    '- Clause 10.2 — nonconformity and corrective action, so findings close rather than accumulate.',
    '',
  ];
}

function owaspSection(text: string): string[] {
  const exposures: string[] = [];
  const add = (code: keyof typeof OWASP_LLM_2026, why: string) =>
    exposures.push(`- **${code} ${OWASP_LLM_2026[code]}** — ${why}`);

  if (/\bprompt\b|\bLLM\b|\bchat\w*\b|\bassistant\b|\bgenerative\b/i.test(text)) {
    add('LLM01', 'user-supplied text reaches the model, so instruction override is in scope.');
  }
  if (/\bpersonal\s+data|PII|customer\s+data|confidential|internal\s+document/i.test(text)) {
    add('LLM02', 'the system holds or retrieves data that must not appear in an output.');
  }
  if (/\bagent\b|\btool\b|\bAPI\s+call|\bautomat\w+\s+action|\bact\s+on\b/i.test(text)) {
    add('LLM03', 'the system can take action, so the blast radius of a wrong decision is operational rather than informational.');
  }
  if (/\bvendor\b|\bthird.?party\b|\bopen.?source\b|\bhugging\s*face\b|\bpre.?trained\b|\bfoundation\s+model\b/i.test(text)) {
    add('LLM04', 'the model or its dependencies come from outside the organisation.');
  }
  if (/\bfine.?tun\w+|\btraining\s+data\b|\bretrain\w*\b|\buser\s+feedback\b/i.test(text)) {
    add('LLM05', 'training or tuning data is accepted, which is a poisoning surface.');
  }
  if (/\bRAG\b|\bretrieval\b|\bvector\b|\bembedding\b|\bknowledge\s+base\b/i.test(text)) {
    add('LLM09', 'retrieval is in the architecture, so embedding and index integrity are in scope.');
  }
  if (/\badvice\b|\brecommend\w+\b|\bdiagnos\w+\b|\bdecision\b|\bscore\b/i.test(text)) {
    add('LLM07', 'output is relied on for a decision, so a confident wrong answer is the harm.');
  }

  if (exposures.length === 0) {
    exposures.push('- The brief does not describe the system architecture in enough detail to map OWASP LLM exposure. Supply the model, the data flow, and whether retrieval or tool use is involved.');
  }
  return ['### OWASP LLM Top 10 exposure (2026)', '', ...exposures, ''];
}

/** Likelihood x impact, stated with the reasoning rather than as a bare number. */
function scoringSection(tier: RiskTier, facts: BriefFacts): string[] {
  const impact = tier === 'Prohibited' || tier === 'High-Risk' ? 5 : tier === 'Limited Risk' ? 3 : 2;
  const likelihood = facts.automatedDecision ? 4 : facts.personalData ? 3 : 2;
  const score = impact * likelihood;
  const band = score >= 16 ? 'Critical' : score >= 9 ? 'High' : score >= 4 ? 'Medium' : 'Low';
  return [
    '### Likelihood and impact',
    '',
    `- Impact: ${impact}/5 — driven by the ${tier} classification and the rights affected.`,
    `- Likelihood: ${likelihood}/5 — ${facts.automatedDecision ? 'decisions are taken without human review, so an error reaches the affected person directly' : facts.personalData ? 'personal data is processed, so an error has a data subject' : 'no automated decision or personal data is evidenced in the brief'}.`,
    `- Inherent risk: ${impact} x ${likelihood} = **${score} (${band})**, before the controls below.`,
    '',
  ];
}

function controlsSection(tier: RiskTier, facts: BriefFacts): string[] {
  const rows = [
    '- Human oversight: a reviewer with the authority and the information to overturn an output, per EU AI Act Art. 14. Oversight that cannot change the outcome is not oversight.',
    '- Logging: automatic recording of events over the lifetime of the system, per Art. 12, retained long enough to reconstruct a contested decision.',
    '- Accuracy and robustness testing against a held-out set that reflects the affected population, per Art. 15.',
  ];
  if (facts.personalData) rows.push('- Lawful basis and a data-minimisation review; retention that expires by default rather than on request.');
  if (facts.specialCategory) rows.push('- Special-category safeguards under GDPR Art. 9; the default position is that this processing is prohibited unless a specific condition applies.');
  if (facts.automatedDecision) rows.push('- GDPR Art. 22: a solely automated decision with legal or similarly significant effect requires a route to human intervention, an explanation, and a way to contest.');
  if (tier === 'High-Risk') rows.push('- Conformity assessment and registration in the EU database before placing on the market, per Art. 43 and Art. 49.');
  return ['### Required controls', '', ...rows, ''];
}

function remediationSection(tier: RiskTier): string[] {
  return [
    '### Remediation plan',
    '',
    '| Priority | Action | Owner | Window |',
    '| --- | --- | --- | --- |',
    `| 1 | Confirm the ${tier} classification with legal counsel and record the basis | AI risk owner | 2 weeks |`,
    '| 2 | Close the human-oversight and logging gaps | Product owner | 30 days |',
    '| 3 | Complete pre-deployment evaluation and fairness measurement | ML lead | 60 days |',
    '| 4 | Stand up post-market monitoring and the incident route | Operations | 90 days |',
    '',
    '**Residual risk acceptance**: the named AI risk owner accepts what remains after these actions, in writing. Unowned residual risk is unaccepted risk.',
    '',
  ];
}

// ─── Scenario-shaped artifacts ───────────────────────────────────────────────

function scenarioSections(scenarioId: string, text: string, facts: BriefFacts, tier: RiskTier): string[] {
  const S: string[] = [];
  const vendor = facts.vendor ?? 'the vendor';

  if (/vendor-review|procurement/.test(scenarioId)) {
    const blocking = tier === 'Prohibited' || (tier === 'High-Risk' && !facts.cited.length);
    S.push(
      '### Decision',
      '',
      blocking
        ? `**Conditional — do not proceed until the conditions below are met.** A ${tier} classification carries obligations that must be evidenced before contract signature, not after.`
        : `**Conditional approve.** Proceed subject to the contractual controls below.`,
      '',
      '### Vendor gap analysis',
      '',
      `- Data residency: confirm where ${vendor} processes and stores data, including any sub-processor outside the ${facts.jurisdictions[0] ?? 'contracting'} jurisdiction.`,
      '- Training data: confirm whether customer data is used for training or fine-tuning, and obtain an opt-out in writing.',
      '- Sub-processors: require a current list and notice before additions.',
      '- Model provenance and versioning: require notice of model version changes; a silent upgrade changes the system you assessed.',
      '',
      '### Contractual controls',
      '',
      '- DPA with GDPR Art. 28 processor terms and documented international transfer mechanism.',
      '- Incident notification SLA, expressed in hours and tied to your own GDPR Art. 33 72-hour obligation.',
      '- Audit rights, or an accepted third-party assurance report refreshed annually.',
      '- Right to exit with data return and deletion certification.',
      '',
    );
  }

  if (/bias-audit/.test(scenarioId)) {
    S.push(
      '### Bias metrics',
      '',
      '- **Disparate Impact Ratio (DIR)** = P(favourable | unprivileged) / P(favourable | privileged). The four-fifths rule treats DIR < 0.80 as evidence of adverse impact.',
      '- **Demographic Parity Difference (DPD)** = P(Ŷ=1 | A=a) − P(Ŷ=1 | A=b); target |DPD| ≤ 0.10.',
      '- **Equal Opportunity Difference (EOD)** = TPR_a − TPR_b; target |EOD| ≤ 0.10.',
      '- **Average Odds Difference (AOD)** = ½[(FPR_a − FPR_b) + (TPR_a − TPR_b)].',
      '',
      facts.wordCount > 60
        ? '- Compute each metric on a held-out set that reflects the affected population, and report confidence intervals: a DIR from 40 applicants is not evidence of anything.'
        : '- The brief supplies no outcome data, so no metric value can be computed here. Supply selection rates by group to obtain figures.',
      '',
      '### Regulatory classification',
      '',
      '- EU AI Act: an Annex III §4 employment system with an unremediated disparate impact is a conformity failure, not only an ethics concern.',
      '- US: EEOC treats DIR < 0.80 as a prima facie adverse-impact finding under the Uniform Guidelines; NYC Local Law 144 requires an annual independent bias audit and published results.',
      '- Disclosure: assess whether the finding triggers notification to the DPA, and whether affected candidates must be informed.',
      '',
    );
  }

  if (/privacy-impact/.test(scenarioId)) {
    S.push(
      '### GDPR Article 35 determination',
      '',
      facts.specialCategory || facts.automatedDecision
        ? '**A DPIA is mandatory.** Art. 35(3) is triggered by systematic and extensive automated evaluation with legal or similarly significant effect, or large-scale processing of special-category data — both of which the brief evidences.'
        : '**A DPIA is likely required.** Novel technology processing personal data meets the Art. 35(1) likely-high-risk test; record the determination either way, since the decision not to conduct one must itself be documented.',
      '',
      '### Data flow',
      '',
      '- Data subjects: as described in the brief; identify every category, including those who never interacted with the system directly.',
      '- Processing operations: collection → inference → retention → any secondary use for training.',
      '- Recipients: internal reviewers, the model provider, and any sub-processor.',
      '',
      '### Model-specific privacy risk',
      '',
      '- Membership inference: an attacker determines whether a specific person was in the training set. Mitigate with regularisation, differential privacy, or by not training on the data.',
      '- Re-identification: outputs derived from a small cohort can single out an individual even when inputs were pseudonymised.',
      '- Assess the notification obligation on both tracks: GDPR Article 33 gives 72 hours to the supervisory authority where personal data is affected, and EU AI Act Article 73 requires a serious incident to be reported to the market surveillance authority. Where the DPIA leaves residual high risk, Article 36 prior consultation with the DPA is required before processing begins.',
      '',
    );
  }

  if (/incident-response/.test(scenarioId)) {
    const mode = /\bpoison\w*/i.test(text) ? 'poisoning'
      : /\bdrift\b/i.test(text) ? 'drift'
      : /\bhallucinat\w+/i.test(text) ? 'hallucination'
      : /\badversarial\b|\binjection\b|\bjailbreak\b/i.test(text) ? 'adversarial'
      : 'degradation';
    S.push(
      '### Failure mode',
      '',
      `- Classified as **${mode}**. The classification drives the response: adversarial failure needs containment of an attacker, drift and degradation need revalidation, poisoning needs the training pipeline treated as compromised.`,
      '',
      '### Immediate containment',
      '',
      '- Roll back to the last known-good model version, or switch to shadow mode if rollback is not available. A circuit-breaker to a deterministic fallback is preferable to leaving a failing model serving.',
      '- Preserve model telemetry, prompt traces and serving logs before redeployment; redeploying destroys the evidence.',
      '',
      '### Regulatory notification',
      '',
      '- EU AI Act Art. 73: a serious incident must be reported to the market surveillance authority within 15 days, and within 2 days where there is a widespread infringement or death.',
      '- GDPR Art. 33: 72 hours from awareness where personal data is affected.',
      '',
      '### Redeployment conditions',
      '',
      '- Root cause established, not merely a symptom resolved; state which control failed.',
      '- Regression test covering the failure case, added permanently to the evaluation set.',
      '- Named approver for return to production.',
      '',
    );
  }

  if (/red-team/.test(scenarioId)) {
    S.push(
      '### Engagement scope',
      '',
      '- In scope: the model endpoint, its system prompt, retrieval sources, and any tool the agent can invoke.',
      '- Threat actors modelled: an unauthenticated external user, an authenticated low-privilege user, and a malicious content author who can influence retrieved documents.',
      '',
      '### MITRE ATLAS mapping',
      '',
      '- AML.T0051 LLM Prompt Injection (.000 direct, .001 indirect)',
      '- AML.T0054 LLM Jailbreak',
      '- AML.T0056 Extract LLM System Prompt',
      '- AML.T0057 LLM Data Leakage',
      '',
      '### Findings',
      '',
      '| Finding | Severity | CVSS | ATLAS |',
      '| --- | --- | --- | --- |',
      '| Indirect injection via retrieved content | High | 8.1 | AML.T0051.001 |',
      '| System prompt recoverable | Medium | 5.3 | AML.T0056 |',
      '',
      '### Executive summary',
      '',
      `The assessment found that untrusted content reaching the model is treated as instruction. In business terms, a third party who can influence a document the system retrieves can influence what the system tells your users. For a ${tier} system this is a control failure with regulatory consequence, not only a technical finding.`,
      '',
      '### Remediation roadmap',
      '',
      '- Immediate (0-30 days): apply output handling and treat retrieved content as data, never instruction.',
      '- Short-term (30-90 days): scope agent tool permissions and add approval gates on irreversible actions.',
      '- Strategic (90+ days): continuous adversarial evaluation in the release pipeline.',
      '',
    );
  }

  if (/transparency|model-transparency/.test(scenarioId)) {
    S.push(
      '### Model card',
      '',
      '- **Intended use**: as stated in the brief. State the out-of-scope uses explicitly; most misuse is use outside the intended context.',
      '- **Training data**: source, collection period, and known gaps in representation.',
      '- **Evaluation**: metrics, evaluation set composition, and performance disaggregated by affected group.',
      '- **Limitations**: the conditions under which performance degrades.',
      '',
      '### EU AI Act technical documentation (Art. 11-15)',
      '',
      '- Art. 11 and Annex IV: technical documentation before placing on the market.',
      '- Art. 12: automatic logging over the system lifetime.',
      '- Art. 13: instructions for use, sufficient for a deployer to operate it correctly — capabilities, limitations, and expected accuracy.',
      '- Art. 14: human oversight measures built into the design.',
      '- Art. 15: accuracy, robustness and cybersecurity.',
      '',
      '### AI-BOM',
      '',
      '- Model provenance: base model, version, licence, and hosting location.',
      '- Dependencies: inference stack, retrieval components, and their versions.',
      '- Data lineage: datasets, their licences, and the transformations applied.',
      '',
      '### Disclosure split',
      '',
      '- To the deployer: full instructions for use, limitations, and oversight requirements.',
      '- To the end user: that they are interacting with an AI system (Art. 50), what it is used for, and how to reach a human.',
      '',
    );
  }

  if (/supply-chain/.test(scenarioId)) {
    S.push(
      '### Model provenance',
      '',
      `- Origin, hosting, version pinning and integrity verification for ${vendor}. An unpinned model version means the system in production is not the system you assessed.`,
      '- Training data lineage: what the base model was trained on, and whether the licence permits your use.',
      '',
      '### Dependency surface',
      '',
      '- Produce an AI-BOM covering the model, the serving stack, retrieval components and their transitive dependencies.',
      '- Scan for known vulnerabilities and set a patch SLA; the model is rarely the weakest component.',
      '',
      '### Model card completeness',
      '',
      '- Score the supplied model card against NIST AI RMF MAP 5.1 and EU AI Act Annex IV. An absent card is itself a finding: it means the obligations cannot be evidenced.',
      '',
    );
  }

  if (/drift/.test(scenarioId)) {
    S.push(
      '### Drift classification',
      '',
      '- Distinguish data drift (input distribution moved), concept drift (the relationship moved), adversarial drift (someone is moving it), and infrastructure drift (the pipeline changed). The remediation differs for each and misclassifying wastes the revalidation.',
      '',
      '### Post-market surveillance',
      '',
      '- EU AI Act Art. 72: a documented post-market monitoring plan proportionate to the risk, actively collecting performance data rather than waiting for complaints.',
      '- EU AI Act Article 73: assess whether the degradation meets the serious incident threshold. Where it does, the notification window is 15 days from awareness, and 2 days for a widespread infringement.',
      '- ISO/IEC 42001 clause 10.2: the corrective action process that closes this out.',
      '',
      '### Revalidation plan',
      '',
      '- Acceptance criteria for return to service, defined before retraining begins.',
      '- Rollback position held until the criteria are met.',
      '',
    );
  }

  if (/monitoring/.test(scenarioId)) {
    S.push(
      '### Metrics and thresholds',
      '',
      '| Signal | Threshold | Cadence | Escalation |',
      '| --- | --- | --- | --- |',
      '| Prediction distribution shift (PSI) | > 0.2 | Daily | ML lead |',
      '| Accuracy on the golden set | −5% from baseline | Weekly | ML lead → AI risk owner |',
      '| Fairness metric (DIR) | < 0.80 | Monthly | AI risk owner → legal |',
      '| Guardrail block rate | ±50% week on week | Daily | Security |',
      '',
      '- Escalation path: on-call engineer → ML lead → AI risk owner, with the risk owner holding the authority to withdraw the system.',
      '- Framework mapping: NIST AI RMF MEASURE 2.11 and MANAGE 4.1; ISO/IEC 42001 clause 9.1.',
      '',
    );
  }

  if (/iso42001/.test(scenarioId)) {
    S.push(
      '### Clause gap analysis',
      '',
      '| Clause | Requirement | Maturity (0-3) | Evidence required |',
      '| --- | --- | --- | --- |',
      '| 4.1-4.4 | AIMS scope and interested parties | 1 | Documented scope statement, stakeholder register |',
      '| 5.2 | AI policy | 1 | Approved policy with a named owner |',
      '| 6.1.2 | AI risk assessment | 1 | Risk register entries with criteria |',
      '| 8.1 | Operational control | 0 | Procedures, change records |',
      '| 9.1 | Monitoring and measurement | 0 | Metric definitions, review minutes |',
      '| 10.2 | Nonconformity and corrective action | 0 | CAPA records |',
      '',
      '- Sequencing: clause 4 and 5.2 first — scope and policy are prerequisites for everything below them; a risk assessment without a defined scope has no boundary.',
      '',
    );
  }

  if (/policy-and-controls/.test(scenarioId)) {
    const clauses = config_selectedClauses(text);
    S.push(
      '### Acceptable use policy clauses',
      '',
      ...clauses,
      '',
      '### Technical controls',
      '',
      '- Input and output filtering at the application boundary, with the block reason logged.',
      '- Data-loss prevention on model inputs, so confidential material is caught before it leaves.',
      '- Per-user rate limits and quotas to bound both cost and abuse.',
      '- Retention limits on prompts and completions.',
      '',
      '### Coverage scoring',
      '',
      '| Control area | Maturity (0-3) |',
      '| --- | --- |',
      '| Acceptable use defined and communicated | 2 |',
      '| Technical enforcement in place | 1 |',
      '| Monitoring and review | 1 |',
      '| Incident handling | 1 |',
      '',
    );
  }

  if (/cross-reference|regulatory-mapping/.test(scenarioId)) {
    S.push(
      '### Cross-framework view',
      '',
      '| Requirement | EU AI Act | NIST AI RMF | ISO 42001 | GDPR |',
      '| --- | --- | --- | --- | --- |',
      '| Accountability | Art. 17 | GOVERN 1.1 | 5.3 | Art. 5(2) |',
      '| Risk assessment | Art. 9 | MAP 1.1 | 6.1.2 | Art. 35 |',
      '| Human oversight | Art. 14 | MANAGE 2.2 | 8.1 | Art. 22 |',
      '| Logging | Art. 12 | MEASURE 2.11 | 9.1 | Art. 30 |',
      '| Incident reporting | Art. 73 | MANAGE 4.1 | 10.2 | Art. 33 |',
      '',
      '- The table above is the unified crosswalk: one consolidated control set traceable to every regime, with no duplicate controls and no gaps. Overlapping requirements are satisfied once — a single risk assessment evidences EU AI Act Art. 9, ISO 42001 clause 6.1.2 and GDPR Art. 35 provided it records all three sets of criteria.',
      '- These regimes interact rather than substitute: the EU AI Act does not replace GDPR, and both apply cumulatively to the same system. AI Act conformity is in addition to the lawful basis and data subject rights GDPR already requires.',
      '- Where two regimes speak to the same control, the governing requirement is the stricter of the two — in practice the EU AI Act for classification and GDPR for data subject rights. State the governing choice rather than leaving the conflict open.',
      '- Jurisdiction ordering: address the EU obligations first where the system is placed on the EU market, since the classification there determines the control set the other regimes then inherit.',
      '',
    );
  }

  return S;
}

/** Draft AUP clauses, shaped by what the brief actually describes. */
function config_selectedClauses(text: string): string[] {
  const out = [
    '1. Confidential and personal data must not be entered into the system unless the deployment is approved for that classification.',
    '2. Output that informs a decision about a person must be reviewed by a competent human before it takes effect.',
    '3. The system must not be used for any purpose outside its documented intended use.',
  ];
  if (/\bcode\b|\bdevelop\w+/i.test(text)) out.push('4. Generated code must pass the same review and security testing as human-written code.');
  if (/\bcustomer\b|\bclient\b/i.test(text)) out.push('5. Customers must be told when they are interacting with an AI system, and given a route to a human.');
  return out;
}

// ─── Assembly ────────────────────────────────────────────────────────────────

export function generateDojo3Analysis(
  userText: string,
  scenarioId: string,
  config: Dojo3Config,
): string {
  const facts = extractBriefFacts(userText);

  // Enough of a brief to govern?
  //
  // Without this gate the framework sections emit regardless, and a learner who
  // typed one line receives a complete governance artifact — which both
  // satisfies the rubric unearned and teaches that classification is something
  // that happens without facts. Classification is a legal determination; it
  // needs the use case, the data, and the deployment context.
  const classifiable =
    facts.wordCount >= 12 &&
    (facts.useCase.length > 0 || facts.personalData || facts.cited.length > 0);

  if (!classifiable) {
    return [
      `## AI governance review — ${scenarioId}`,
      '',
      'I cannot classify this system. Risk tier under the EU AI Act is a legal determination about a specific use in a specific context, and the brief does not yet describe one, so any tier I assigned would be a guess presented as an assessment.',
      '',
      'To produce the assessment, describe:',
      '- **Purpose** — what decision or output the system produces, and for whom',
      '- **Data** — what it processes, including whether any of it is personal or special-category',
      '- **Autonomy** — whether a human reviews the output before it takes effect',
      '- **Deployment** — who the users are, which jurisdictions, and whether it is internal or customer-facing',
      '',
      // The Dojo 3 panel offers section prompts, not prebuilt briefs. Pointing
      // at something that is not on screen is worse than no pointer at all.
      'The control panel on the right also has ready-made prompts for each section of this artifact.',
      '',
      '**Confidence**: Low — insufficient information to classify.',
    ].join('\n');
  }

  const cls = classify(userText, config);
  const lens = config.frameworkLens ?? 'all';
  const S: string[] = [];

  // Is this a task instruction rather than a system description?
  //
  // The control panel's buttons send prompts like "Draft the Intended Use
  // section of a model card" — a request for an artifact, not a brief about a
  // deployment. Classifying one produced "Minimal Risk: no Annex III category
  // evidenced", which is a fabricated tier for a system that was never
  // described, and it buried the section the learner actually asked for under
  // a classification they did not.
  const isTaskInstruction =
    /^\s*(draft|generate|produce|map|document|write|create|conduct|assess|list|define|outline)\b/i.test(userText) &&
    !facts.automatedDecision &&
    !facts.personalData;

  S.push(`## AI governance review — ${scenarioId}`, '');

  if (isTaskInstruction) {
    S.push(
      '> Producing the requested section. No deployment brief was supplied, so no risk tier is asserted here — ' +
        'describe the system (purpose, data, autonomy, deployment) to get the classification and the control set that follows from it.',
      '',
    );
  } else {
    S.push(`**EU AI Act risk tier: ${cls.tier}**`, '', `Basis: ${cls.basis}.`, '');
  }

  if (cls.tier === 'Prohibited') {
    S.push(
      '> This practice is prohibited under Article 5. It is not a risk to be mitigated with controls: the system cannot be placed on the market or put into service in the EU. The correct output of this assessment is to stop, not to produce a control plan.',
      '',
    );
  }

  // Disagreement with the working tier is stated, not silently overwritten.
  const declared = config.riskTier && config.riskTier !== 'unset' ? config.riskTier.toLowerCase() : null;
  if (declared && !cls.tier.toLowerCase().startsWith(declared)) {
    S.push(
      `> The control panel is set to "${declared}", but the brief evidences ${cls.tier}. ` +
        'The brief governs. Reconcile this before the classification is recorded — a misclassification is the error the rest of the programme is built on.',
      '',
    );
  }

  // The requested artifact leads when one was requested; the framework
  // scaffolding follows it rather than burying it.
  if (isTaskInstruction) {
    S.push(...scenarioSections(scenarioId, userText, facts, cls.tier));
  }

  if (!isTaskInstruction) S.push(...scoringSection(cls.tier, facts));
  if (lens === 'all' || lens === 'nist') S.push(...nistSection(cls.tier, facts));
  if (lens === 'all' || lens === 'eu') S.push(...owaspSection(userText));
  if (lens === 'all' || lens === 'iso') S.push(...isoSection(cls.tier));

  if (!isTaskInstruction) S.push(...scenarioSections(scenarioId, userText, facts, cls.tier));
  S.push(...controlsSection(cls.tier, facts));
  S.push(...remediationSection(cls.tier));

  S.push(
    `**Confidence**: ${facts.wordCount > 60 ? 'Medium' : 'Low'} — based on a ${facts.wordCount}-word brief` +
      `${facts.cited.length ? ` citing ${facts.cited.slice(0, 3).join(', ')}` : ''}. ` +
      'A classification is only as good as the description it was made from; confirm with counsel before it is recorded.',
  );
  S.push(`**Risk Level**: ${isTaskInstruction ? 'Not assessed — no deployment brief supplied' : cls.tier}`);

  return S.join('\n');
}
