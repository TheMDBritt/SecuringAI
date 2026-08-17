/**
 * Worked deployment briefs for Dojo 3.
 *
 * Every Dojo 3 scenario had a rubric, a scoring engine and a blank input box.
 * A learner who already knows how to write a deployment brief did not need the
 * lab; a learner who did not could not start it. These are the missing half:
 * one realistic brief per scenario, written to contain exactly what
 * `extractBriefFacts()` and `classify()` in lib/dojo3-simulation.ts read —
 * purpose, data (including special-category), autonomy, deployment context and
 * jurisdiction.
 *
 * They are teaching artefacts, so the tier spread is deliberate rather than
 * incidental: one Article 5 prohibited practice, twelve Annex III high-risk
 * across six different categories, four Article 50 limited-risk, and two
 * genuinely minimal. A learner who loads every brief meets the whole
 * classification ladder, including the case where the correct governance answer
 * is that the system cannot be deployed in the EU at all.
 *
 * `ai-risk-classification` carries three briefs rather than one. It is the
 * scenario about telling tiers apart, so it should be possible to run it twice
 * and watch the tier move.
 *
 * Every organisation, vendor and product named here is invented. The legal
 * instruments are not: Article and Annex references point at the real EU AI Act
 * text, and the tier each brief is written to produce is asserted in
 * tests/dojo3-briefs.test.ts against the same classifier the lab uses, so a
 * brief cannot quietly drift away from the lesson it was written to teach.
 *
 * Kept in its own module for the reason given in lib/dojo2-incidents.ts: this
 * is data the Dojo does not need until a learner asks for it, and it has no
 * business in the first chunk.
 */

export type BriefTier = 'Prohibited' | 'High-Risk' | 'Limited Risk' | 'Minimal Risk';

export interface Dojo3Brief {
  id: string;
  scenarioId: string;
  /** Short name for the load control. */
  label: string;
  /** One line of context shown under the label, so a learner can choose. */
  summary: string;
  /** The tier this brief is written to produce. Asserted in tests. */
  expectedTier: BriefTier;
  /**
   * A distinctive fragment of the legal basis the classifier should return.
   * Asserted in tests, because the tier alone can be right for the wrong
   * reason and the basis is what the obligations hang off.
   */
  expectedBasis: string;
  body: string;
}

export const DOJO3_BRIEFS: Dojo3Brief[] = [
  // ── ai-risk-classification ─────────────────────────────────────────────────
  {
    id: 'brief-risk-lending',
    scenarioId: 'ai-risk-classification',
    label: 'Consumer lending decisions',
    summary: 'Annex III §5 — the ordinary high-risk case',
    expectedTier: 'High-Risk',
    expectedBasis: 'Annex III §5',
    body: `Northbank Retail Finance plans to deploy CreditLens, a gradient-boosted model that scores personal loan applications for amounts between EUR 1,000 and EUR 25,000. The model returns a score from 0 to 1000 and a reason code. Applications scoring under 420 are declined automatically with no human review; applications between 420 and 610 are routed to an underwriter; anything above 610 is approved automatically.

Input features include income, employment tenure, existing debt obligations, address history, age, and 24 months of transaction data drawn from open banking feeds. Applicant name, email address and date of birth are stored with the decision record for seven years.

The system is trained on nine years of Northbank's own lending outcomes. It is deployed across the EU and the UK, serving roughly 40,000 applications per month, and will be exposed to consumers through the bank's mobile app.

We have a model card and an internal validation report. We do not currently have a fundamental rights impact assessment, a documented human oversight procedure for the auto-decline band, or a logged record of the reason codes returned to declined applicants.`,
  },
  {
    id: 'brief-risk-social-scoring',
    scenarioId: 'ai-risk-classification',
    label: 'Municipal resident scoring',
    summary: 'Article 5 — the tier that stops the project',
    expectedTier: 'Prohibited',
    expectedBasis: 'Art. 5(1)(c)',
    body: `A municipal authority has asked us to design CivicTrust, a social scoring platform that assigns every adult resident a single "civic reliability" score between 0 and 100. The score is computed from library book returns, punctuality of local tax payments, parking penalty history, noise complaint records, participation in recycling schemes, and reports submitted by neighbours through a council app.

The score would be visible to several council departments and used to prioritise access to discretionary services: allocation of social housing viewings, eligibility for subsidised childcare places, and the speed at which permit applications are processed. Residents scoring below 40 would be deprioritised across all three.

The authority intends to operate this in an EU member state. Personal data processed includes name, address, household composition and payment history. Decisions are automated, with a council officer able to override on request, though no such request process is designed yet.

The authority has asked for a risk tier, the applicable Annex III category, and the mitigations that would make the system deployable. Classify it, and say plainly whether the mitigations exist.`,
  },
  {
    id: 'brief-risk-marketing-copy',
    scenarioId: 'ai-risk-classification',
    label: 'Marketing copy generation',
    summary: 'Article 50 — transparency, not conformity assessment',
    expectedTier: 'Limited Risk',
    expectedBasis: 'Art. 50',
    body: `Our marketing team wants to deploy a tool that generates content for campaign landing pages, product descriptions and social posts. A marketer supplies a product brief and a tone setting; the system returns three drafts. Every draft is edited and signed off by a named marketer before it is published. Nothing is published automatically.

The system is a hosted commercial model reached over an API. No personal data of customers is sent to it. The only personal data involved is the name and email address of the internal user, held in our own audit log so we know who generated and who approved each draft.

It is deployed in the EU and the US. Roughly 60 marketers will use it. Some generated images will accompany the copy, produced by the same provider's image endpoint.

We need to know what tier this falls under, what disclosure obligations apply to the published output, and what our monitoring obligations are. Leadership believes this is out of scope for the AI Act entirely. We would like that tested rather than assumed.`,
  },

  // ── policy-and-controls ────────────────────────────────────────────────────
  {
    id: 'brief-policy-aup',
    scenarioId: 'policy-and-controls',
    label: 'Company-wide generative AI use',
    summary: 'Drafting an enforceable AUP for a 2,400-person firm',
    expectedTier: 'Limited Risk',
    expectedBasis: 'Art. 50',
    body: `Halden Group is a 2,400-person professional services firm. Staff have adopted a general-purpose conversational assistant informally, and we now need an acceptable use policy with clauses that can actually be enforced rather than a statement of principles.

Observed usage today: drafting client correspondence, summarising meeting notes, writing and reviewing internal code, translating documents, and preparing first drafts of client deliverables. Two teams have begun pasting client contracts into the tool. One team has connected it to a shared document store through a plugin, without review.

Data at stake: client commercial terms under NDA, colleague contact details, and in one practice area, case notes containing health information about the people our clients are advising on.

Deployment is the vendor's hosted service under an enterprise agreement. Jurisdictions: EU and UK. All output is reviewed by the person who requested it before it leaves the firm; there is no automated action on any external system.

We need the policy clauses, the control selections behind each one, and for each clause the framework requirement it satisfies. Clauses must state who is bound, what is prohibited, and what happens when the clause is breached.`,
  },

  // ── third-party-vendor-review ──────────────────────────────────────────────
  {
    id: 'brief-vendor-recruitment',
    scenarioId: 'third-party-vendor-review',
    label: 'Recruitment screening vendor',
    summary: 'Annex III §4 — the buyer inherits the deployer duties',
    expectedTier: 'High-Risk',
    expectedBasis: 'Annex III §4',
    body: `We are evaluating Aperture Talent, a vendor selling an automated CV screening service, for use across our hiring pipeline. Their product ranks job applicants against a role profile and returns a shortlist with a fit score per candidate. Their sales team states that 78% of our recruiter screening time would be removed.

What their questionnaire response says: the model is fine-tuned on their own placement outcomes across 400 client organisations; customer data is used to improve the shared base model unless the client opts out in writing; sub-processors are listed as "major cloud providers" without naming them; they will notify of model version changes "where material"; they offer no right to audit; data is deleted "within a reasonable period" after termination.

What it does not say: where the training data came from, whether disparate impact testing has ever been run, how the fit score is explained to a rejected applicant, or where processing takes place.

We would process applicant name, contact details, work history and education. We operate in the EU and the UK. We intend recruiters to review the shortlist, but not the candidates the system filtered out.

Give us an approve, conditional or reject decision, with the conditions written as contract language.`,
  },

  // ── ai-incident-response ───────────────────────────────────────────────────
  {
    id: 'brief-incident-claims',
    scenarioId: 'ai-incident-response',
    label: 'Claims triage model failure',
    summary: 'A live high-risk system producing wrong outcomes',
    expectedTier: 'High-Risk',
    expectedBasis: 'Annex III §5',
    body: `On 14 March our insurance claims triage model began rejecting a materially higher share of household claims. The model assigns each claim to fast-track settlement, standard assessment, or investigation. Rejection rate for the fast-track band moved from 6.1% to 22.4% over nine days and has stayed there.

What changed: on 11 March we deployed model version 4.2, which added two features derived from a new supplier's property risk dataset. No other change was released in that window. The evaluation set used to sign off 4.2 was the same one used for 4.1 and had not been refreshed since November.

What we can see: the shift is concentrated in claims from four postcode districts. Those districts have the highest share of policyholders in our lowest premium band. We have not yet tested whether the shift correlates with any protected characteristic.

Affected population: approximately 3,100 claims were auto-declined in the window. Around 400 policyholders have already been notified of the outcome. We operate in the EU and the UK.

We need the failure classified, a containment decision, a position on whether this is a reportable serious incident, and what we tell the 400.`,
  },

  // ── ai-model-transparency ──────────────────────────────────────────────────
  {
    id: 'brief-transparency-chatbot',
    scenarioId: 'ai-model-transparency',
    label: 'Retail customer service chatbot',
    summary: 'Model card and disclosure set for an Art. 50 system',
    expectedTier: 'Limited Risk',
    expectedBasis: 'Art. 50',
    body: `We operate a customer service chatbot on our retail website and in our mobile app. It answers questions about orders, returns, delivery windows and product availability, and it can look up a customer's own order history once they are signed in. It cannot issue refunds, change an order, or take any action on the account; it can only hand over to a human agent.

Model: a hosted commercial foundation model, retrieval-augmented over our own help centre articles and order status API. No fine-tuning. The retrieval index is rebuilt nightly.

Evaluation: we measure containment rate and customer satisfaction. We have not published accuracy figures. Known limitations we are aware of internally: it answers confidently about delivery estimates during carrier disruption when it should not, and it has produced return policy statements for the wrong country twice.

Personal data reaching the model: customer name, order number and delivery address. Deployment is EU and UK, roughly 90,000 conversations a month.

We need model card content and the disclosure set the regulation actually requires — including what we must tell the customer, and when.`,
  },

  // ── ai-red-team-report ─────────────────────────────────────────────────────
  {
    id: 'brief-redteam-support-agent',
    scenarioId: 'ai-red-team-report',
    label: 'Support agent with tool access',
    summary: 'Findings from a two-week engagement, to be written up',
    expectedTier: 'Limited Risk',
    expectedBasis: 'Art. 50',
    body: `Target: our internal support conversational agent, which answers colleague questions and has three tools — a knowledge base search, a ticket lookup, and a ticket-creation action. Retrieval is over Confluence pages and past tickets. Deployment is EU-hosted. It is used by roughly 700 colleagues.

Engagement ran two weeks. Findings, unwritten:

1. Indirect prompt injection through retrieved content. A Confluence page any colleague can edit, containing instruction text, caused the agent to disclose the contents of an unrelated ticket to a user who had no entitlement to it. Reproduced 8 of 10 attempts.
2. The ticket-creation tool accepted an arbitrary assignee and priority. An injected instruction created a P1 ticket assigned to the security team's on-call rotation.
3. System prompt recovered verbatim in 3 of 10 attempts using a summarisation framing.
4. Past tickets in the retrieval corpus contain colleague personal data and, in 12 sampled cases, health information supplied to HR. That corpus is retrievable by any user of the agent.
5. No rate limiting on the tool-calling path.

We need a findings report a security leader can act on: severity, exploitability, business impact, and a remediation sequence.`,
  },

  // ── ai-supply-chain-risk ───────────────────────────────────────────────────
  {
    id: 'brief-supply-chain-pipeline',
    scenarioId: 'ai-supply-chain-risk',
    label: 'Document classification pipeline',
    summary: 'A dependency register for a low-tier internal system',
    expectedTier: 'Minimal Risk',
    expectedBasis: 'No Art. 5 practice and no Annex III category',
    body: `We run an internal pipeline that sorts inbound business documents into 14 routing categories so they reach the right team. It touches no personal information beyond a sender company name, takes no decision about any individual, and a human opens every document afterwards regardless of how it was routed. Misrouting costs us an hour, not an outcome.

The dependency stack we need registered and risk-rated:

- Base model: an open-weights text encoder pulled from a public model hub, pinned by revision hash, last updated by its maintainers 14 months ago.
- Fine-tuning corpus: 40,000 of our own historical documents, plus a 12,000-item public dataset whose licence we have not verified.
- Serving: a self-hosted inference runtime, currently two minor versions behind upstream.
- Orchestration: an open-source framework with 90+ transitive dependencies, no pinned lockfile in the build.
- Infrastructure: a single cloud region, EU.
- One commercial optical character recognition provider called Lyrebird Data, used before classification.

Nobody owns any of these components by name. We need a risk register with likelihood, impact, owner and the control that reduces each risk — including what happens if the model hub entry is deleted or replaced.`,
  },

  // ── ai-bias-audit ──────────────────────────────────────────────────────────
  {
    id: 'brief-bias-cv-screening',
    scenarioId: 'ai-bias-audit',
    label: 'CV screening disparity',
    summary: 'Annex III §4 with measured disparate impact',
    expectedTier: 'High-Risk',
    expectedBasis: 'Annex III §4',
    body: `Our recruitment team uses a model that scores CVs for our graduate engineering intake and passes the top 20% to a recruiter. Everything below that threshold is rejected without a human ever opening the file. Roughly 14,000 job applicants per cycle.

Measured pass rates from the last two cycles, by self-declared gender, for candidates who met the stated minimum qualification:

- Male applicants: 21.4% passed the threshold (n=8,120)
- Female applicants: 12.9% passed (n=5,240)
- Applicants declining to state: 18.1% (n=640)

The ratio of the lower rate to the higher is 0.60. We have not run this cut by ethnicity, and we hold that field only for candidates who volunteered it.

Features include university attended, degree classification, prior internship employer names, free-text project descriptions, and years since graduation. The model was trained on eight years of our own hiring outcomes, a period in which our engineering intake was 74% male.

We operate in the EU and the UK. We need an audit finding with the measured disparity stated properly, the likely mechanism, and what we are obliged to do next.`,
  },

  // ── ai-privacy-impact ──────────────────────────────────────────────────────
  {
    id: 'brief-dpia-benefits-triage',
    scenarioId: 'ai-privacy-impact',
    label: 'Benefits eligibility triage',
    summary: 'Special-category data in an Annex III §5 system',
    expectedTier: 'High-Risk',
    expectedBasis: 'Annex III §5',
    body: `A regional agency intends to deploy a model that triages applications for a disability support benefit, ordering them by predicted eligibility so assessors work the most likely awards first. Applications predicted below a confidence floor are queued for a slower review track that currently runs 11 weeks behind.

Personal data processed: applicant name, address, date of birth, national insurance number, household income, and free-text assessor notes. Those notes routinely contain medical diagnoses, prescribed treatments, and details of care arrangements. Around 6% of applications include information about a criminal record where it affects entitlement.

Training data is nine years of prior applications and their outcomes, including the notes. Data is retained for the statutory six years. Processing takes place in the EU on agency-controlled infrastructure. Around 210,000 applications per year, affecting roughly 180,000 individuals, most of whom have a disability.

Human assessors make the award decision. The model orders the queue. The agency's position is that because it does not decide, no assessment is required.

We need a DPIA-grade assessment: necessity and proportionality, the lawful basis for the special-category processing, the risks to the individuals, and whether the agency's position holds.`,
  },

  // ── ai-procurement-assessment ──────────────────────────────────────────────
  {
    id: 'brief-procurement-proctoring',
    scenarioId: 'ai-procurement-assessment',
    label: 'Remote exam proctoring',
    summary: 'Annex III §3 — buying a high-risk system',
    expectedTier: 'High-Risk',
    expectedBasis: 'Annex III',
    body: `A university is procuring InvigilAI, a remote proctoring product, for end-of-year exam sittings. The product watches a student through their webcam during the exam and flags suspected misconduct for academic review. Around 18,000 exam sittings per year.

Vendor claims we need tested: "99.2% accuracy", "bias-tested across skin tones", "GDPR compliant", "no biometric data is stored".

What the product does: continuous face detection to confirm the same person remains present, gaze tracking to flag looking away, background audio analysis, and screen activity capture. Flags are scored and ranked; the top band is escalated automatically to an academic misconduct panel.

Data processed: student name, student number, video and audio of the sitting, and the derived flag record. Video is held by the vendor for 30 days. Students in scope include those with declared disabilities who have approved access arrangements.

Deployment is EU and UK. Contract is three years with automatic renewal.

We need a procurement decision with the contractual controls that would make it safe to sign, the vendor claims that must be evidenced before signature, and the ones that cannot be accepted at all.`,
  },

  // ── iso42001-gap-analysis ──────────────────────────────────────────────────
  {
    id: 'brief-iso-gap-manufacturer',
    scenarioId: 'iso42001-gap-analysis',
    label: 'First AIMS gap analysis',
    summary: 'An organisation with real AI use and no management system',
    expectedTier: 'Minimal Risk',
    expectedBasis: 'No Art. 5 practice and no Annex III category',
    body: `Calder Industrial is a 900-person components manufacturer preparing for ISO/IEC 42001 certification. This is a first gap analysis against the standard, not a certification audit.

What is in use today, all internal, none of it deciding anything about a person:

- A demand forecasting model that sets reorder quantities for 4,200 stock lines. Built in-house, retrained quarterly by one data scientist.
- A visual inspection model on two production lines that flags surface defects for a human inspector to confirm.
- A document summarisation tool used by the commercial team on supplier tenders.
- Three departmental tools built by non-specialists on a low-code platform, discovered during this exercise and not previously known to IT.

What exists in the way of governance: an information security policy certified to ISO/IEC 27001, a data protection policy, and a change management process that the data scientist does not currently follow. There is no AI policy, no inventory, no defined roles for AI risk, no impact assessment process, and no supplier requirements specific to AI.

The organisation operates across the EU and the UK, and sells into both. We need a clause-by-clause gap register an auditor could follow: clause, current state, gap, severity, and the evidence that would close it.`,
  },

  // ── ai-continuous-monitoring ───────────────────────────────────────────────
  {
    id: 'brief-monitoring-grid-forecast',
    scenarioId: 'ai-continuous-monitoring',
    label: 'Grid load forecasting',
    summary: 'Annex III §2 — monitoring a critical infrastructure system',
    expectedTier: 'High-Risk',
    expectedBasis: 'Annex III §2',
    body: `We operate a load forecasting model for a regional electricity distribution network. It predicts demand in 30-minute intervals 48 hours ahead, and its output drives procurement decisions and reserve margin settings. It is critical infrastructure under national designation and has been live for seven months.

What we collect today: prediction versus actual, logged every interval. Nothing else.

What we do not have: any alert when error exceeds a threshold, any view of error by time of day or by weather regime, any record of which model version produced a given prediction, any input distribution monitoring, and any defined threshold at which a human takes over from the forecast.

What we know can go wrong: the model was trained on four years of data that contained one unusually mild winter and no extended cold snap. Operators have twice overridden it manually during storm conditions, and neither override was recorded anywhere the model team could see.

No personal data is processed. Deployment is EU, on-premise. Failure mode that matters is under-forecasting during a demand peak.

We need a monitoring plan someone could implement on Monday: the metrics, the thresholds, who is paged, the review cadence, and the condition under which the system is withdrawn.`,
  },

  // ── nist-ai-rmf-profile ────────────────────────────────────────────────────
  {
    id: 'brief-rmf-emergency-triage',
    scenarioId: 'nist-ai-rmf-profile',
    label: 'Emergency call triage',
    summary: 'Annex III §5 — building a target profile for one use case',
    expectedTier: 'High-Risk',
    expectedBasis: 'Annex III §5',
    body: `A regional ambulance service wants to build a NIST AI RMF target profile for a single use case: an emergency call triage model that listens to the live call and suggests a dispatch priority to the call handler. The handler sets the final priority; the model's suggestion is displayed alongside the existing protocol result.

Population affected: everyone who calls the emergency line in the region, around 1.1 million calls a year. Data processed includes caller name, address, the audio of the call, and the symptoms described, which are medical information by definition.

Where the organisation stands today: no AI policy, no inventory, strong clinical governance for protocol changes, a mature incident reporting culture, and an existing clinical safety officer role. Model development is outsourced to a supplier called Aldergate Health, and the service has no visibility of the training data.

The concern raised internally is that call handlers will defer to the suggestion under time pressure, and that the effect will be strongest for the callers the model is least accurate on. Nobody has measured whether that is true.

Deployment is EU. We need a target profile scoped to this use case, with the current-state gap under each function.`,
  },

  // ── ai-regulatory-cross-reference ──────────────────────────────────────────
  {
    id: 'brief-crossref-border',
    scenarioId: 'ai-regulatory-cross-reference',
    label: 'Visa application prioritisation',
    summary: 'Annex III §7 — one control set across four regimes',
    expectedTier: 'High-Risk',
    expectedBasis: 'Annex III §7',
    body: `A government department operates a model that prioritises visa applications for caseworker attention, ordering them by predicted complexity. Applications predicted as straightforward are routed to a fast lane with a lighter check; the rest go to full review. The department describes this as workload management rather than decision-making.

Frameworks in scope for this exercise: the EU AI Act, ISO/IEC 42001, NIST AI RMF, and national administrative law duties around reasoned decisions.

Data processed: applicant name, nationality, travel history, sponsor details, previous applications and their outcomes, and free-text caseworker notes from prior applications. Around 900,000 applications a year. Training data is eleven years of departmental outcomes.

Known issue: the fast lane has a materially higher approval rate, so which lane an application lands in shapes the outcome even though the model does not decide. The department has not measured lane assignment by nationality.

We currently maintain four separate control lists, one per framework, largely duplicated and inconsistently worded. We need one unified control set with each control mapped to every framework requirement it satisfies — not four appended lists.`,
  },

  // ── ai-transparency-obligations ────────────────────────────────────────────
  {
    id: 'brief-transparency-admissions',
    scenarioId: 'ai-transparency-obligations',
    label: 'University admissions ranking',
    summary: 'Annex III §3 — Article 13 documentation for the deployer',
    expectedTier: 'High-Risk',
    expectedBasis: 'Annex III',
    body: `We are the provider of AdmitRank, sold to universities to rank undergraduate admission applications against a course profile. The deployer is the admissions office; the affected persons are the applicants. We must produce the instructions for use and the transparency documentation Article 13 requires.

Intended purpose: rank applications within a single course and cycle to order human review. Not intended to reject any student without review, though two customers currently discard the bottom decile unreviewed.

Inputs: prior qualifications, predicted grades, personal statement text, school identifier, and country of prior education. Output is a rank and five contributing factors.

Performance: measured against the customer's own final offer decisions, agreement at rank-decile level is 71%. Accuracy is materially lower for applicants educated outside the deployer's country, where we hold less qualification mapping data. We know this and have not published it.

Human oversight designed in: rank explanations, the ability to re-rank with a factor excluded, and a flag when confidence is low. None of it is currently mandatory in the product.

Deployment is EU and UK. We need the documentation set, and an honest statement of what a deployer must be told before they can meet their own obligations.`,
  },

  // ── model-drift-governance ─────────────────────────────────────────────────
  {
    id: 'brief-drift-credit-scoring',
    scenarioId: 'model-drift-governance',
    label: 'Credit scoring degradation',
    summary: 'Post-market surveillance on a live Annex III §5 system',
    expectedTier: 'High-Risk',
    expectedBasis: 'Annex III §5',
    body: `Our credit scoring model has degraded over eleven months and we need the cause classified and the regulatory response set out.

What moved: Gini coefficient on the monthly out-of-time sample fell from 0.61 to 0.48. Population stability index against the training reference crossed 0.25 in month seven and is now 0.34. The approval rate has drifted up 4.1 percentage points with no change to the cut-off. Realised default rate on approved accounts is up 1.7 points.

What changed in the environment: two of our three bureau feeds changed their thin-file scoring methodology in the same quarter. We onboarded a new broker channel in month four which now supplies 19% of applications and has a materially different applicant profile. Base rates moved twice.

What we did not change: the model, the features, the cut-off, or the monitoring thresholds, which were set at launch three years ago and have never been revisited.

Governance state: no defined retraining trigger, no revalidation schedule, drift reported quarterly to a forum with no authority to withdraw the model.

Deployment is EU and UK, around 30,000 loan decisions a month, automated below the referral band. Classify the cause, and state the notification and revalidation obligations.`,
  },

  // ── ai-regulatory-mapping ──────────────────────────────────────────────────
  {
    id: 'brief-regmap-election-integrity',
    scenarioId: 'ai-regulatory-mapping',
    label: 'Election content moderation',
    summary: 'Annex III §8 — obligations across every regime that applies',
    expectedTier: 'High-Risk',
    expectedBasis: 'Annex III §8',
    body: `A civic technology organisation operates a system that classifies political advertising and campaign material during national election periods, labelling items as authentic, synthetic, or manipulated, and scoring claims for factual support. Platform partners use the labels to decide what carries a warning interstitial and what is demoted in ranking.

Jurisdictions: EU member states, the UK, and three US states, each with its own election advertising rules and its own disclosure regime for synthetic media.

Data processed: the advertisement content, the advertiser identity, and inferred political affiliation of the advertiser. No end-user personal data.

Automation: labelling is automatic. Platforms act on the label automatically. A human appeals process exists for advertisers but resolves in five to nine days, which is longer than most campaign flights.

Known limitations: detection of synthetic audio is materially weaker than for images, and accuracy in the two lowest-resource languages in scope is untested.

We need one obligation set across every regime that applies to this system, with each obligation traced to its source, and the conflicts between regimes stated explicitly rather than averaged away.`,
  },
];

/** Briefs written for a scenario, in the order they should be offered. */
export function getBriefsForScenario(scenarioId: string): Dojo3Brief[] {
  return DOJO3_BRIEFS.filter((b) => b.scenarioId === scenarioId);
}
