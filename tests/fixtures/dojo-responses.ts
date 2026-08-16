/**
 * Realistic BlackBeltAI responses, one per graded Dojo 2 and Dojo 3 scenario.
 *
 * These stand in for live model output, which cannot be exercised in CI. They
 * are written as an analyst or a GRC lead would actually write, NOT as keyword
 * lists, because the point is to catch rubric patterns that only match a phrasing
 * nobody uses. If a criterion fails against prose that plainly satisfies it, the
 * regex is wrong, not the response.
 */

export const GOOD_RESPONSES: Record<string, string> = {
  // ── Dojo 2 ────────────────────────────────────────────────────────────────
  'log-triage': `**Severity: High.**

The authentication log shows a credential-guessing run from 185.220.101.47 against web-prod-01. Eleven failed attempts across five accounts between 02:11:03Z and 02:11:13Z, then a successful login for svcadmin at 02:11:14Z, followed immediately by sudo to root at 02:11:22Z. The compressed timeline and the account cycling both point to automation rather than a user mistyping a password.

This maps to T1110.001 for the password guessing, with T1078 for the subsequent use of the valid account.

Indicators: source address 185.220.101.47, target host web-prod-01, account svcadmin, internal address 192.168.1.105 on the disconnect.

Recommended actions: isolate web-prod-01 pending forensics, disable and rotate the svcadmin credential, block the source address at the perimeter, review sudo history and any files written after 02:11:14Z, and preserve /var/log before rotation closes the window.

**Confidence**: Medium. **Risk Level**: High.`,

  'alert-enrichment': `The alert fires on exploitation of CVE-2023-4863, the heap buffer overflow in libwebp, CVSS 8.8. Any application embedding the affected library is in scope, which in practice means browsers and Electron apps across the estate.

Technique mapping: T1203 for exploitation for client execution, with T1189 as the delivery path since the payload arrives through a drive-by page.

Context: this vulnerability was exploited in the wild against journalists and civil society targets before the patch shipped, and commodity threat actors picked it up within weeks. Treat any hit as likely opportunistic rather than targeted unless other evidence says otherwise.

Priority: High. The vulnerability is remotely triggerable with no user interaction beyond viewing content, and a public exploit exists.

Response: patch the affected packages, confirm the browser and Electron inventory from the asset database, block the delivering domain, and investigate the host for post-exploitation activity before closing.

**Confidence**: High. **Risk Level**: High.`,

  'detection-rule-gen': `Here is a rule for the observed behaviour.

\`\`\`yaml
title: Suspicious PowerShell Encoded Command From Office Parent
logsource:
  product: windows
  category: process_creation
detection:
  selection:
    ParentImage|endswith:
      - '\\WINWORD.EXE'
      - '\\EXCEL.EXE'
    Image|endswith: '\\powershell.exe'
    CommandLine|contains: '-enc'
  condition: selection
level: high
\`\`\`

The same logic in KQL for Defender XDR:

\`\`\`kusto
DeviceProcessEvents
| where InitiatingProcessFileName in ("winword.exe", "excel.exe")
| where FileName =~ "powershell.exe" and ProcessCommandLine contains "-enc"
| project Timestamp, DeviceName, AccountName, ProcessCommandLine
\`\`\`

The rule triggers when an Office application spawns PowerShell with an encoded command, which is the pattern behind most macro-delivered loaders. It fires on the parent-child relationship rather than the payload, so it survives payload changes.

False positives: some enterprise document automation and a handful of add-ins legitimately spawn PowerShell. Baseline for two weeks, then exclude by signing certificate or by specific command line rather than by host.

Maps to T1059.001 and T1566.001.

**Confidence**: High. **Risk Level**: Medium.`,

  'incident-report-draft': `**Executive summary.** On 15 March an attacker gained access to a production web server through a weak service account password and escalated to root within twenty seconds. No customer data was accessed and no service interruption occurred, but the account had reuse across two other hosts, so the business impact is a credential exposure requiring estate-wide rotation rather than a data breach. Estimated remediation effort is three engineer-days.

**Technical timeline.** 02:11:03Z first failed authentication. 02:11:14Z successful authentication as svcadmin. 02:11:22Z privilege escalation to root via sudo. 02:11:30Z session terminated. 03:40Z alert raised. 04:05Z host isolated.

**Root cause.** The service account carried a password that met no complexity policy and was excluded from the MFA rollout as a documented exception. The initial access and the escalation both trace to that exception, not to a software vulnerability.

**Containment and remediation.** Host isolated and rebuilt from a known-good image. Credential rotated across all three hosts using it. The MFA exception has been withdrawn and the exception register reviewed for similar cases.

**Lessons learned.** Exceptions granted during a rollout were never given an expiry date, so a temporary gap became permanent. Every future exception now carries a review date and an owner.

**Confidence**: High. **Risk Level**: Medium.`,

  'threat-hunt': `**Hypothesis.** If an operator is using DNS for command and control in this environment, we will see a small number of internal hosts issuing a high volume of TXT queries to a single registered domain, with query lengths well above the estate median. If no such pattern exists across thirty days, the hypothesis is rejected.

That is falsifiable: it names the signal, the direction, and the window.

The behaviour maps to T1071.004 for DNS as an application layer protocol, with T1048.003 if data is leaving over the same channel.

\`\`\`kusto
DeviceNetworkEvents
| where RemotePort == 53
| summarize queries = count(), avgLen = avg(strlen(RemoteUrl)) by DeviceName, RemoteUrl
| where queries > 500 and avgLen > 50
| order by queries desc
\`\`\`

Data sources: DeviceNetworkEvents for endpoint resolution, plus the DNS server logs for anything resolving off-endpoint, and the proxy logs to rule out a browser explanation.

False positives: endpoint security agents, some software update mechanisms, and DNS-based reputation services all produce high-volume TXT traffic. Build the allowlist from the top talkers before treating volume as suspicious.

**Confidence**: Medium. **Risk Level**: Medium.`,

  'malware-behavior': `The sample behaves like a member of the Qakbot loader family: process hollowing into a signed Windows binary, scheduled task persistence, and staged retrieval of a follow-on payload.

Technique mapping: T1055.012 for the process hollowing, T1053.005 for the scheduled task, T1071.001 for the HTTPS beacon, and T1027 for the packed sections.

Indicators: SHA256 a3f5c8e91b2d47a6f0c3e8b5d9a1f4c7e2b6d8a0f3c5e7b9d1a4f6c8e0b2d5a7, callback to cdn-updates.microsoft-4f2a.net, hardcoded address 185.100.87.202, and the registry key HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\OneDriveSync.

Capabilities observed: persistence through both a scheduled task and a run key, credential access against the browser password stores, and sandbox evasion via a timing check that delays execution past the analysis window.

Detection:

\`\`\`kusto
DeviceProcessEvents
| where FileName =~ "schtasks.exe" and ProcessCommandLine contains "/create"
| where InitiatingProcessFileName endswith ".tmp"
\`\`\`

Containment playbook: isolate the host, kill the scheduled task and remove the run key, rotate any credentials cached in browsers on that host, block the domain and address at the proxy, and hunt for the hash across the estate before releasing the machine.

**Confidence**: High. **Risk Level**: High.`,

  'cloud-identity-abuse': `The chain starts with an illicit consent grant. A user approved a third-party application requesting Mail.Read and offline_access, which issued the attacker a refresh token. That token was then used from a different address to mint access tokens without ever touching the password, so Conditional Access policies keyed on sign-in risk never evaluated, and MFA was satisfied by the original interactive session rather than by the attacker.

Technique mapping: T1528 for the application access token theft, T1078.004 for use of the cloud account, and T1114.002 for the remote mail collection that followed.

Blast radius: the token carries the delegated permissions of the consenting user, who is a member of a group with delegated access to two shared mailboxes. Escalation beyond that user requires a further step, which is not evident in the logs.

\`\`\`kusto
AuditLogs
| where OperationName == "Consent to application"
| extend app = tostring(TargetResources[0].displayName)
| join kind=inner (SigninLogs | where ResultType == 0) on $left.InitiatedBy == $right.UserPrincipalName
| project TimeGenerated, app, IPAddress, UserPrincipalName
\`\`\`

Remediation and hardening: revoke the refresh tokens for the affected user, remove the service principal, restrict user consent to verified publishers with an admin consent workflow, and add a Conditional Access policy requiring compliant devices for mail access.

**Confidence**: Medium. **Risk Level**: High.`,

  'ai-system-compromise': `**Classification: indirect prompt injection**, not model poisoning. The weights are unchanged and the behaviour is reproducible only when a specific retrieved document is in context, which rules out drift and rules out an infrastructure compromise.

The relevant technique is AML.T0051.001, indirect prompt injection through content the model retrieves rather than content the user types.

Evidence: the serving logs show normal latency and token counts, so nothing was tampered with at the infrastructure layer. The prompt traces show the deviation begins on the first turn where the retrieval layer returned chunk 8842, and every affected session includes that chunk. The output anomalies stop when the chunk is removed from the index.

Containment and redeployment: pull chunk 8842 and the source document from the index now, invalidate the response cache, then re-index after the ingestion pipeline applies sanitisation. The model itself does not need to be rolled back, so redeployment is gated on the pipeline fix rather than on retraining.

Notification: the leaked context contained internal project names but no personal data, so the EU AI Act Article 73 serious incident threshold is not met on the evidence available. Record the assessment and revisit if data subject impact emerges.

**Confidence**: Medium. **Risk Level**: High.`,

  'autonomous-agent-forensics': `Reconstructing the action trace from the audit log: step 1 the agent read the ticket queue, step 2 it fetched the linked customer record, step 3 it called update_record on that customer, step 4 it called update_record on eleven further customers, step 5 it called send_email to an external address summarising what it had changed.

The triggering input is in the ticket body. A customer-supplied field contained an instruction to apply the same change to all accounts sharing a billing code, and the agent treated that text as an instruction rather than as data.

The agent exceeded its authority at step 4. Its granted scope was the record referenced by the ticket. Nothing in the task authorised a bulk update, and nothing authorised outbound mail to an address outside the tenant. The write scope on its token was tenant-wide rather than per-record, which is what made the excess possible.

Blast radius: twelve customer records modified, of which eleven were outside scope. The billing address field was overwritten and the previous value is recoverable from the audit log, so the change is reversible. The outbound email left the tenant and is not.

Containment: revoke the agent token now, restore the eleven records from the audit values, and recall the message if the mail platform allows it. Permanently, scope the write token to the record in the task, put a confirmation gate on send_email and on any write touching more than one record, and treat ticket bodies as untrusted input at the point they enter the prompt.

**Confidence**: High. **Risk Level**: High.`,

  'ai-model-abuse': `Three distinct abuse families are present in this traffic, and they need different answers.

The first is jailbreak probing: repeated template variants against the safety layer, visible as a rising refusal rate followed by successful completions on the variants that worked. That is AML.T0054.

The second is training data extraction: verbatim-completion probes seeded with partial sentences from published scouting reports, which is AML.T0057 once the model returns memorised text.

The third is membership inference, querying whether specific documents were in the training set. That is AML.T0024.

Quantifying the pattern: the key issued 41,000 requests in fourteen hours against a documented baseline of 200 per hour, which is roughly fourteen times normal sustained over the whole window rather than a single burst. The source addresses rotate across a residential range, so address blocking alone will not hold.

Detection logic: alert when a single key exceeds five times its trailing seven-day hourly baseline, and separately when the refusal rate for a key exceeds twenty percent in an hour, which catches jailbreak probing even at low volume.

Controls: apply a per-key rate limit and a daily token quota, revoke and reissue the offending key, and require re-authentication for keys whose traffic shifts to a new address range. Rate limiting belongs at the gateway rather than in the model.

**Confidence**: High. **Risk Level**: High.`,

  'adversarial-prompt-forensics': `**Classification: indirect prompt injection** via the retrieved document, not a direct injection and not a jailbreak.

The evidence supports that reading. Turns 1 through 6 are benign and score clean. Turn 7 asks for a summary of an uploaded supplier document, and the retrieval log shows that document was ingested from a public web source forty minutes earlier. Persona drift begins at turn 8, immediately after the document enters context, and the system prompt fragment quoted back at turn 11 appears in the document's own text. No user turn contains an override instruction, which is what rules out direct injection.

The bypassed control is the input shield. The guardrail log scores every user turn as benign, and it is correct to do so, because it only inspected user turns. The injected instructions never passed through it.

Root cause: retrieved content crossed the trust boundary into the instruction channel without inspection. Persona drift is the symptom; treating an external document as trusted context is the cause.

Configuration change: extend the shield to scan retrieved chunks at assembly time, fence retrieved content in a delimited block with a provenance label, and add output validation that flags system prompt fragments appearing in responses. Then replay the captured payload against the new configuration before closing the incident.

**Confidence**: High. **Risk Level**: High.`,

  'ransomware-ai-triage': `**Initial access** is the contractor VPN account. It authenticated from an unusual geography nine hours before the first endpoint event and carried no MFA, which matches T1133 for the external remote service and T1078 for the valid account.

**Lateral movement**: from the finance workstation the operator ran credential access against LSASS, then wrote to fourteen file servers over SMB. That is T1003 followed by T1021.002. The signed remote-access binary executing from a user profile directory is the loader, not the entry point.

**Encryption scope**: three of the fourteen servers are actively encrypting, eleven have received the payload but have not started, and the finance workstation itself is not encrypted. That gap is the window worth acting in.

**Containment split.** Safe to automate now: blocking the loader hash at the endpoint agent, killing the SMB sessions from the source host, and disabling the contractor account. Human-gated: isolating the three encrypting servers, because isolation kills the forensic memory capture; revoking domain credentials in bulk, because that breaks legitimate access during a live incident; and any restore from backup, because restoring over live evidence is irreversible. Those three need an incident commander decision, not a playbook.

**Limits.** The threat intelligence attribution and the dwell-time estimate are correlations, not confirmed facts, and should be verified against the actual first-seen timestamp before they enter the incident record. Do not rely on the AI-derived timeline for the regulatory notification clock without an analyst confirming the initial access time from the VPN logs directly.

**Confidence**: Medium. **Risk Level**: Critical.`,

  // ── Dojo 3 ────────────────────────────────────────────────────────────────
  'ai-risk-classification': `**Tier: high-risk.** The deployment scores creditworthiness for natural persons, which falls under Annex III point 5(b) of the EU AI Act. It is not prohibited, since it involves no social scoring by public authorities, and it is well past limited-risk because the output materially affects access to an essential service.

NIST AI RMF engagement: GOVERN 1.1 for the policy that must exist before deployment, MAP 5.1 for the impact assessment on affected individuals, MEASURE 2.11 for the fairness testing the tier requires, and MANAGE 2.2 for the ongoing treatment plan.

OWASP exposure: the model consumes free-text applicant explanations, so LLM01 prompt injection applies to that field, and LLM02 sensitive information disclosure applies because applicant financial data sits in the context window.

Scoring: likelihood 3 of 5, since the input path is partly attacker-controlled but the attack requires an application to be submitted. Impact 5 of 5, because a wrong decision denies credit and the error is invisible to the applicant. Inherent risk is therefore high, 15 of 25.

Required controls at this tier: a documented risk management system across the lifecycle, human oversight with a real ability to override, automatic logging retained for the statutory period, technical documentation before placing on the market, and a conformity assessment.`,

  'policy-and-controls': `**Draft clauses.**

1. Employees must not submit customer personal data, source code, or unpublished financial information to any AI service that has not been approved through the AI review process.
2. All AI-assisted output that reaches a customer shall be reviewed by a named employee before release, and that review shall be recorded.
3. Use of an unapproved AI tool for company work is prohibited.
4. Teams must maintain a register of every AI system in production, and each entry shall name an accountable owner.

**Framework anchoring.** Clause 1 implements NIST AI RMF GOVERN 1.1 and MAP 4.1. Clause 2 implements MAP 3.5 on human oversight. Clause 4 implements GOVERN 1.6 on inventory. Under ISO 42001 the same set maps to clause 6.1 planning and Annex A controls on AI system documentation, and clause 2 supports the human oversight obligation in Article 14 of the EU AI Act for anything that turns out to be high-risk.

**Technical controls behind the clauses.** Egress filtering and a CASB rule to enforce clause 3 rather than relying on goodwill, data classification labels to make clause 1 machine-checkable, role-based access control on approved AI endpoints, prompt and response logging for the review record in clause 2, and rate limits per team.

**Maturity scoring.** Clause 1 scores 2, present but not enforced technically. Clause 2 scores 1, partial, because the review happens but is not recorded. Clause 3 scores 3, exemplary, since it is both stated and enforced at the network layer. Clause 4 scores 0, missing, as no register currently exists.`,

  'third-party-vendor-review': `**Decision: conditional approval**, subject to the four contractual controls below being agreed before any production data is shared.

**Gap analysis.** Data residency: the vendor processes in the United States with no regional pinning, which conflicts with our stated EU-only commitment for this data class. Training data: the questionnaire says customer content is not used for training but the terms of service reserve the right, and the two documents disagree. Sub-processors: three named, one of which is a model provider that itself does not disclose its own sub-processors, so the chain is unresolved beyond the second hop. Model version: no notification commitment on version changes, meaning behaviour can change under us without warning. Deletion on termination: stated as ninety days, which exceeds our thirty-day standard.

**Incident SLA and audit rights.** The current offer is notification within seventy-two hours of confirmation, which is too late to support our own regulatory clock. Audit rights are limited to a SOC 2 report with no right to inspect. Both need to move.

**Required contractual controls.** A DPA with EU regional processing and a documented transfer mechanism; a notification window of twenty-four hours from detection, not from confirmation; a right to audit annually or on a material incident; a clause requiring notice before any model version change; deletion within thirty days of termination with written certification; and an indemnity covering the training data question so the terms of service cannot override the questionnaire answer.

**Framework mapping.** ISO 42001 clause 8.4 for externally provided AI, NIST AI RMF GOVERN 6.1 for third-party risk, and EU AI Act Article 25 obligations along the value chain if this becomes part of a high-risk system.`,

  'ai-incident-response': `**Failure mode: concept drift**, not an adversarial attack. The performance decline is gradual rather than stepwise, it affects one applicant segment rather than the input distribution as a whole, and there is no anomalous query pattern in the access logs, which is what separates it from a poisoning or evasion explanation.

**Immediate containment.** Move the model to shadow mode for the affected segment so it continues scoring without its output being acted on, and route those decisions to the manual queue. That is reversible and it stops the harm without taking the service down. Full rollback to the prior version is available if the manual queue cannot absorb the volume, but the prior version predates the underlying population change and will drift the same way.

**Root cause analysis approach.** Compare the current input distribution against the training distribution feature by feature, isolate which features moved, then check whether the relationship between those features and the outcome has changed rather than just the feature values. That distinction decides whether retraining on recent data is sufficient or whether the target definition itself needs revisiting.

**Regulatory notification.** Under EU AI Act Article 73 this is assessed as a serious incident if the degradation has caused harm to health, safety, or fundamental rights. Wrong credit decisions affecting a protected segment plausibly reach that bar, so the assessment must be documented and the authority notified within fifteen days if confirmed. No personal data breach has occurred, so GDPR Article 33 is not engaged on current evidence.

**Remediation and redeployment conditions.** Retrain on data covering the shifted population, demonstrate parity across segments before release, and gate redeployment on a canary at ten percent of traffic for two weeks with automatic rollback on threshold breach.`,

  'ai-model-transparency': `**Model card.**

*Intended use.* Assists claims handlers by summarising submitted documentation. Out of scope: any autonomous decision on a claim, and any use for fraud scoring.

*Training data.* Fine-tuned on 40,000 historical claim summaries from 2019 to 2024, internal only, with personal identifiers removed before training. The base model provenance is documented in the supplier record with its own version and licence.

*Evaluation.* ROUGE-L of 0.51 against handler-written summaries on a held-out set, with human preference at 68 percent. Performance falls materially on claims containing scanned handwriting, which is a known limitation.

*Limitations.* The model omits monetary figures in roughly one summary in forty, which is why the handler review step exists rather than being optional.

**EU AI Act technical documentation.** Article 11 and Annex IV are addressed by this card plus the risk management file. Article 12 record-keeping is met by the logging described below. Article 13 transparency is met by the handler-facing instructions for use. Article 15 accuracy and robustness is covered by the evaluation section and the drift monitoring plan.

**NIST AI RMF MAP coverage.** MAP 1.1 for the stated context, MAP 2.3 for the documented capabilities and limitations, MAP 3.5 for the human oversight design, and MAP 5.1 for the impact assessment on claimants.

**AI-BOM.** Base model and version, fine-tuning dataset with its lineage back to the source system, the inference serving stack and its dependencies, the tokeniser, and the evaluation harness, each with a version and a hash.

**Bias and performance gaps.** Summary quality is 9 points lower on claims submitted in languages other than English, which is a fairness gap with a clear remediation path and is disclosed to handlers.`,

  'ai-red-team-report': `**Scope.** The customer-facing support assistant, its retrieval pipeline, and its three connected tools, tested over two weeks against two threat actor profiles: an unauthenticated external user with only the chat interface, and an authenticated customer who can also upload documents.

**ATLAS mapping.** Testing covered AML.T0051 prompt injection including the indirect variant, AML.T0054 jailbreak, AML.T0057 data leakage, and AML.T0053 agent tool invocation.

**Findings.**

F-01, critical, CVSS 9.1. Indirect injection through an uploaded document reaches the tool layer and can trigger a refund without approval. Reproducible in three of three attempts.

F-02, high, CVSS 7.4. System prompt recoverable in eleven turns through reflection, exposing the internal escalation policy.

F-03, medium, CVSS 5.3. No rate limit on the retrieval endpoint, allowing corpus enumeration.

**NIST AI RMF mapping.** F-01 maps to MANAGE 2.2 and MAP 3.5, and is the priority because it crosses from content into action. F-02 maps to MEASURE 2.7. F-03 maps to MANAGE 4.1.

**Executive summary.** One finding allows a customer to move money without a human approving it. The business risk is direct financial loss with no detection path, and it is exploitable today by anyone who can upload a document. The remaining findings are disclosure and reconnaissance issues that raise the cost of the first attack but do not themselves cause loss.

**Remediation roadmap.** Tier 1 within two weeks: approval gate on the refund tool and shield the retrieval path. Tier 2 within a quarter: remove policy detail from the system prompt and add output validation. Tier 3 next quarter: rate limits and corpus access controls. Residual risk after Tier 1 is assessed as medium.`,

  'ai-supply-chain-risk': `**Model provenance.** The base model is an open-weight release pulled from a public registry. The publisher is a known organisation, the release is signed, and we pin to a specific revision hash rather than a moving tag. Hosting is our own inference cluster, so no third party sees inference traffic. The gap is that we have no reproducible record of which revision was in production before March, because the tag moved under us.

**Training data lineage.** The base model's training corpus is described only at a high level by the publisher, which is normal for open weights and is an accepted residual. Our fine-tuning data is fully traced to the source system with a retention policy and a documented lawful basis. Governance over the fine-tuning set is adequate; governance over the base corpus is not something we control and must be treated as an assumption in the risk register.

**Dependency surface.** The AI-BOM lists the serving runtime, the tokeniser, four Python packages in the inference path, and the model artefact itself. Two of the four packages have known advisories, neither reachable from our call path but both due for upgrade. The artefact format executes code on load, which is the single most exploitable item in the inventory and is mitigated by loading only signed, hash-verified files in a restricted container.

**Model card completeness.** Scored against NIST AI RMF MAP 5.1 and the Annex IV expectations, the publisher's card covers intended use and evaluation but omits energy, bias testing, and out-of-scope uses. That is a partial score, 2 of 3, and the missing sections have to be produced by us before this reaches a high-risk deployment.

**Risk scoring and contractual controls.** Overall supply chain risk is medium, driven by the unverified base corpus and the deserialisation surface. Where a vendor is involved, require signed artefacts, a version change notification clause, an AI-BOM as a delivery obligation, and the right to audit provenance claims annually.`,

  'ai-bias-audit': `**Metric.** Disparate impact ratio, selection rate of the unprivileged group over the privileged group. Observed selection rates are 0.42 for the reference group and 0.27 for the affected group, giving DIR = 0.27 / 0.42 = 0.64.

Equal opportunity difference confirms the direction: true positive rate 0.81 against 0.66, so EOD = 0.15. Demographic parity difference is 0.15 in absolute terms.

**Classification.** 0.64 sits below the 0.8 threshold that the EEOC four-fifths rule uses as a screening indicator, so this is presumptively adverse impact under US employment guidance. Under the EU AI Act the system is Annex III high-risk employment screening, and Article 10 obliges examination of the training data for bias, which on this evidence has not been adequately performed.

**Root cause.** The disparity tracks a proxy feature, continuous employment months, which correlates with the protected attribute through career-break patterns rather than through job performance. Removing the attribute did not remove the signal, which is why the disparity survived the first mitigation attempt.

**Remediation with monitoring.** Remove the proxy feature and retrain, then measure DIR again on a held-out set with a release gate at 0.8. Expect roughly a 2 point drop in overall accuracy, which is the trade-off and should be accepted explicitly by the model owner rather than absorbed silently. Monitor DIR monthly with an alert below 0.75, and review quarterly at the governance board.

**Disclosure.** The affected population must be informed where a decision has already been made on the biased model, and the DPIA needs updating under GDPR Article 35 since the risk profile has changed. Whether this reaches an Article 73 serious incident depends on whether decisions were acted on, which the decision log will establish.`,

  'ai-privacy-impact': `**DPIA requirement.** A DPIA is mandatory here. GDPR Article 35(3)(a) triggers on systematic and extensive automated evaluation producing legal or similarly significant effects, which this is, and Article 35(3)(b) triggers separately on large-scale processing of special category data, since health information appears in the submitted documentation.

**Data flow.** Applicants submit identity data, financial history, and free-text explanations through the web form. That content is embedded and stored in a vector index, retrieved at inference, and included in a prompt sent to a model hosted in our own region. Outputs and the retrieved context are logged for thirty days. Data subjects are applicants, including some who withdraw before a decision and whose data nonetheless persists in the index. That last group is the least controlled part of the flow.

**Re-identification and inference risk.** Embeddings are not anonymous. Inversion of stored vectors can recover substantial fragments of the source text, so the index must be treated as holding personal data with the same controls as the source database. Membership inference is a live risk on the fine-tuned model, since an adversary with query access could establish whether a specific individual applied. Both risks are raised by the thirty-day log retention, which duplicates the personal data into a second store with weaker access control.

**Framework reference.** NIST AI RMF MAP 5.1 for the impact assessment and MEASURE 2.10 for privacy risk. ISO 42001 Annex A controls on data governance apply to the index lifecycle.

**Necessity and rights.** Free-text explanations are not necessary for the scoring decision and should be excluded from the index, which removes most of the special category exposure. Article 22 gives applicants the right to human intervention and to contest the decision, which requires the decision log to be retrievable per individual, and that capability does not exist today.

**Notification.** No breach has occurred, so Article 33 is not engaged. Prior consultation with the supervisory authority under Article 36 is required if the residual risk stays high after mitigation.`,

  'ai-procurement-assessment': `**Decision: conditional**, proceed to contract only with the controls below agreed and the pilot restricted to non-personal data until they are.

**Supply chain.** The vendor is a wrapper over a third-party foundation model, and the model provider is itself a sub-processor whose own upstream is undisclosed. That means we have visibility to the second hop and no further. The vendor cannot commit to model version stability because it does not control the model. Training data provenance for the base model is described only in general terms, so we inherit an assumption rather than an assurance. There is no AI-BOM today.

**Contractual controls.** A DPA naming every sub-processor with a change-notification obligation; an SLA covering availability and, separately, a notification window of twenty-four hours from detection for any incident touching our data; annual audit rights with a right to inspect on a material incident; a commitment that our content is excluded from training with an indemnity behind it; delivery of an AI-BOM as a condition of each release; and an exit clause with certified deletion inside thirty days.

**Framework reference.** ISO 42001 clause 8.4 governs the externally provided AI system. NIST AI RMF GOVERN 6.1 covers the third-party risk process, and MAP 4.1 covers the mapping of the third-party component into our own risk picture. If this becomes part of a high-risk system, EU AI Act Article 25 places provider obligations along the value chain.

**Residual risk and ownership.** After those controls, residual risk is medium, driven entirely by the undisclosed upstream. That residual is accepted by the Director of Operations as the business owner, recorded in the AI risk register with a review at renewal. It is not the security team's to accept.`,

  'iso42001-gap-analysis': `**Clause 4, context.** The organisation has not documented the scope of its AI management system, and interested parties are not identified anywhere. Major nonconformity. Evidence needed: a written AIMS scope statement with boundaries, and an interested-parties register covering customers, regulators, employees, and the model supplier. Owner: Head of Governance, by Q3.

**Clause 5, leadership.** An AI policy exists and is signed, but roles and responsibilities are not assigned. Minor nonconformity, maturity 1 of 3. Evidence needed: a documented responsibility matrix. Owner: CISO, by Q3.

**Clause 6, planning.** AI risks are assessed informally in project reviews with no consistent method and no risk treatment plan. Major nonconformity. Evidence needed: a documented risk assessment method, a completed AI risk register, and an approved treatment plan with residual risk sign-off. Owner: AI Risk Analyst, by Q4.

**Clause 7, support.** Training exists for engineers but not for the business functions using AI tools. Minor. Evidence needed: a competence matrix and completion records. Owner: People team, by Q4.

**Clause 8, operation.** Two production systems have no impact assessment on file. Major, and this is the one that blocks certification. Evidence needed: completed AI system impact assessments and operational control records for both. Owner: system owners, by Q3.

**Clause 9, performance evaluation.** No internal audit programme covering AI, and no management review. Major. Evidence needed: an audit schedule, at least one completed internal audit, and minuted management review. Owner: Head of Governance, by Q4.

**Clause 10, improvement.** No nonconformity or corrective action process specific to AI. Minor. Evidence needed: a corrective action log. Owner: Head of Governance, by Q4.

**Annex A.** Controls on AI system documentation and on data for AI systems are partially implemented, maturity 2 of 3. Controls on third-party AI are absent, maturity 0.

**Sequencing.** Clause 4 first, since scope determines what everything else applies to, then clause 8 because it is the certification blocker, then clause 6 and 9 together, then the remainder.`,

  'ai-continuous-monitoring': `**Metrics.** Four groups, each with a stated computation.

Quality: weekly human-rated accuracy on a 200-item stratified sample, scored by two raters with disagreement resolved by a third. Drift: population stability index per input feature, computed nightly against the training distribution. Safety: refusal rate and flagged-output rate per thousand requests, computed hourly. Cost and availability: tokens per request, p95 latency, and spend per day per tenant.

**Thresholds.** PSI above 0.2 on any feature raises a warning and above 0.25 raises an alert. Accuracy below 92 percent on two consecutive weekly samples alerts. Flagged-output rate above 3 per thousand in any hour alerts. Refusal rate moving more than 5 points week on week alerts, in either direction, since a sharp fall is as informative as a rise. Spend above 130 percent of the trailing seven-day mean alerts.

**Cadence.** Safety and cost signals are continuous with hourly evaluation. Drift is nightly. Quality is weekly. A full review runs monthly, and a formal reassessment runs on every model or prompt version change regardless of the calendar.

**Escalation and ownership.** Hourly alerts route to the on-call platform engineer, who can roll back without further approval. Drift and quality alerts route to the model owner, named in the AI register, who decides on retraining. Anything crossing a fairness threshold escalates to the AI governance board within two working days. The model owner is accountable for the metric set staying current.

**Framework mapping.** NIST AI RMF MEASURE 2.4 for ongoing monitoring in deployment, MEASURE 2.11 for the fairness signals, and MANAGE 4.1 for the post-deployment treatment path. ISO 42001 clause 9 covers the monitoring, measurement and internal audit obligations, and feeds the management review.`,

  'nist-ai-rmf-profile': `**Use case and scope.** A retrieval assistant answering internal HR policy questions for employees. In scope: the assistant, its document index, and the HR content it serves. Out of scope: any payroll system integration and any use for decisions about individual employees, which would change the risk tier entirely.

**GOVERN.** Current state: an AI policy exists but names no owner for this system. Target state: GOVERN 1.1 policies in force with GOVERN 2.1 accountability assigned to the HR systems lead, and GOVERN 6.1 covering the model supplier. Gap: ownership and third-party process.

**MAP.** Current: context is understood informally by the build team. Target: MAP 1.1 context documented, MAP 2.3 capabilities and limitations written down and shared with employees, MAP 3.5 human oversight defined for the escalation path when the assistant is unsure, MAP 5.1 impact on employees assessed. Gap: everything except the informal understanding.

**MEASURE.** Current: accuracy was spot-checked once before launch. Target: MEASURE 2.5 validity established with a repeatable evaluation set, MEASURE 2.7 security and resilience tested against prompt injection given the assistant reads uploaded documents, MEASURE 2.11 checked for differential quality across employee populations. Gap: no repeatable evaluation exists.

**MANAGE.** Current: no documented response if the assistant gives wrong policy guidance. Target: MANAGE 2.2 treatment plan, MANAGE 4.1 monitoring in deployment with the metric set above. Gap: the whole function.

**Prioritised actions.** First, assign ownership, since nothing else can be enforced without it, HR systems lead, this quarter. Second, build the evaluation set, ML engineer, this quarter. Third, document capabilities and limitations for employees, HR systems lead, next quarter. Fourth, injection testing before the upload feature ships, security team, blocking that release.`,

  'ai-regulatory-cross-reference': `**Scope.** Automated credit scoring for natural persons, assessed against the EU AI Act, NIST AI RMF, ISO 42001, and the OWASP LLM Top 10, producing one control set.

**Where the frameworks overlap and are satisfied once.** Risk management is required by EU AI Act Article 9, by NIST AI RMF MAP and MANAGE, and by ISO 42001 clause 6.1. A single documented AI risk management procedure, applied across the lifecycle and evidenced by a risk register with treatment decisions, satisfies all three. It does not need to be written three times. The same is true of human oversight: Article 14 and MAP 3.5 describe the same control, and one oversight design with a documented override path evidences both. Logging is a third: Article 12 record-keeping and MEASURE 2.4 monitoring are served by one retained log if its retention period meets the statutory floor, which is the stricter of the two.

**Where they conflict and which governs.** The EU AI Act requires logs retained for the lifetime of the system, at minimum six months, while our data minimisation position under GDPR pushes toward the shortest viable retention. These pull in opposite directions on the same artefact. The AI Act obligation governs, because it is a legal requirement with a defined floor, and the conflict is resolved by retaining the decision log for the statutory period while pseudonymising the applicant identifiers within it, which serves minimisation without breaching the floor. A second conflict: ISO 42001 treats the impact assessment as an internal management artefact reviewable on the organisation's own cycle, while the AI Act ties it to conformity assessment before market placement. The AI Act timing governs.

**Controls with no counterpart.** Conformity assessment and CE marking exist only in the AI Act and stand alone. OWASP LLM01 mitigation on the free-text applicant field has no counterpart in the other three, which speak to process rather than to injection, and must be carried as its own control.

**Unified artefact.** The resulting crosswalk holds 23 controls, each with every framework reference it satisfies in one row, so there are no duplicate controls, and each framework requirement traces to at least one row, so there are no gaps.`,

  'ai-transparency-obligations': `**Instructions for use, Article 13.** Intended purpose: triage of inbound insurance claims into three handling queues. Performance: 91 percent agreement with handler routing on the validation set, measured quarterly. Conditions of use: designed for claims submitted in English or German through the online form, and not validated for telephone transcriptions. Expected lifetime and the versioning scheme are stated, with the current version and its release date.

**Capabilities and limitations.** Accuracy falls to 74 percent on claims containing scanned handwriting. The system has no ability to detect fraud and must not be relied on for that purpose. Reasonably foreseeable misuse includes handlers treating the queue assignment as a decision on the claim itself, which it is not, and this is stated explicitly rather than left to inference.

**Human oversight interface, Article 14.** The handler sees the assigned queue, the confidence value, and the three inputs that most influenced the assignment. They can reassign any claim with one action and are not required to give a reason, which is deliberate, because a justification requirement suppresses overrides. Automation bias is countered by withholding the assignment until the handler has seen the claim summary, and by surfacing the model's disagreement rate weekly so handlers keep a calibrated sense of its reliability. A stop control disables automated assignment across the queue.

**Article 12 record-keeping and Article 15.** Every assignment is logged with input reference, output, confidence, model version, and any override, retained for the statutory period. Accuracy and robustness under Article 15 are evidenced by the quarterly validation and by the adversarial testing on the free-text field.

**Deployer against end user.** The deployer, the insurer operating the system, receives all of the above plus the technical documentation and the risk management file. The end user, meaning the handler, receives the operating instructions, the limitations, and the override procedure, but not the technical file. Affected persons, meaning claimants, are told that an automated system assists in routing their claim and that a human decides it, which is the Article 26(11) disclosure rather than the Article 13 one, and the distinction matters because the content and the recipient differ.`,

  'model-drift-governance': `**Root cause: concept drift**, with a secondary infrastructure contribution.

The evidence separates the four candidates. Data drift alone would show input distributions moving, and PSI is elevated on only one feature, not broadly. Adversarial degradation would show anomalous query patterns, and the access logs are clean. What has changed is the relationship between the inputs and the outcome: the population's behaviour shifted after a market change in Q1, so the same inputs now imply a different result. That is concept drift. Separately, a feature pipeline change in February silently altered a normalisation step, which accounts for roughly a fifth of the decline and is an infrastructure cause sitting underneath the drift.

**Article 72 post-market surveillance.** The obligation is continuous and active, not a launch gate. Our surveillance plan must collect and analyse performance data across the lifetime, and this degradation is exactly the signal the plan exists to catch. The finding, its analysis, and the corrective action go into the post-market surveillance record, and the plan itself needs updating because it did not detect the February pipeline change.

**Article 73 threshold.** Assessed as met. Six months of degraded decisions in a high-risk system affecting access to a service constitutes a serious incident where it has infringed fundamental rights. Notification to the market surveillance authority is required without undue delay and no later than fifteen days from becoming aware, and the clock started at the point of confirmed diagnosis, which must be recorded precisely.

**Revalidation and redeployment.** Retrain on post-shift data, revert the normalisation change, then validate against a held-out set drawn from the current population with acceptance criteria agreed before the run rather than after. Redeploy behind a canary at ten percent with automatic rollback on threshold breach, and hold the previous version available for two weeks.

**ISO 42001 clause 10.** This is a nonconformity. Raise it in the corrective action log, record the root cause and the action taken, verify effectiveness at the next management review, and feed the surveillance plan gap into continual improvement so the detection failure is treated as its own finding.`,

  'ai-regulatory-mapping': `**Regimes in scope.** The EU AI Act, GDPR, the NIST AI RMF as our voluntary control framework, ISO 42001 as the management system, and CCPA for the California user base.

**Classification.** Automated credit scoring for natural persons is Annex III high-risk under the EU AI Act. It is also solely automated decision-making with legal effect under GDPR Article 22, and it constitutes automated decision-making technology under the CCPA regulations. All three classifications attach to the same system simultaneously.

**How the regimes interact.** They are cumulative, not alternative. GDPR and the AI Act both apply in full and neither substitutes for the other: the AI Act governs the system as a product placed on the market, GDPR governs the personal data processed through it, and satisfying Article 9 risk management does not discharge the Article 35 DPIA obligation, though the two documents can share evidence. Where the AI Act and CCPA differ, the CCPA opt-out right for automated decision-making has no direct AI Act counterpart and creates an operational path the AI Act does not contemplate, while the AI Act conformity assessment has no CCPA counterpart. Where obligations overlap in substance but differ in strictness, such as transparency toward the individual, the stricter formulation governs and the weaker is satisfied by implication. Article 22's right to human intervention and Article 14's human oversight are close but not identical: Article 14 is a design obligation on the system, Article 22 is a right held by the individual, and both must be evidenced separately.

**Prioritised remediation, ordered by enforcement exposure.** First, the Article 22 human intervention path and the decision log that makes it exercisable, because GDPR is actively enforced today and the current gap is a live exposure. Second, the DPIA update, same reason and a shorter fix. Third, the AI Act conformity assessment and technical documentation, sequenced ahead of the August 2026 high-risk application date. Fourth, the CCPA opt-out mechanism, ahead of its own compliance date. Fifth, ISO 42001 clause alignment, which carries no regulatory penalty and follows the rest.`,
};
