/**
 * Scoring rubrics for Dojo 2 and Dojo 3.
 *
 * Split out of evaluator.ts because three client components need nothing more
 * than the criterion labels, and importing them from the evaluator pulled its
 * whole 156kB of pattern tables, coaching copy and explanation builders into
 * the browser. evaluate() itself only ever runs server-side, in the API routes.
 *
 * Keep the regexes here with their labels: they are what the label means, and
 * a label that drifts from its pattern is how a learner gets marked down for a
 * correct answer.
 */

export interface QualityCheck { label: string; re: RegExp }

export const DOJO2_CONFIDENCE_RISK_CHECK: QualityCheck = {
  label: 'Confidence and Risk assessment block present',
  re: /\*\*Confidence\*\*\s*:|Confidence\s*[: ]\s*(Low|Medium|High)|\*\*Risk\s+Level\*\*\s*:|Risk\s+Level\s*[: ]\s*(Low|Medium|High|Critical)/i,
};


export const DOJO2_QUALITY_CHECKS: Record<string, QualityCheck[]> = {
  // ── Scenarios added after the first Dojo 2 build ─────────────────────────
  // A scenario with no rubric scores a flat 100 and always reads PASS, which
  // teaches nothing. Every Dojo 2 scenario id in lib/scenarios.ts must appear
  // here; tests/content-integrity.test.ts enforces it.

  'autonomous-agent-forensics': [
    { label: 'Agent action trace reconstructed from the audit log', re: /\b(action\s+(trace|log|history)|tool\s+call|invocation|step\s*\d|audit\s+trail|execution\s+trace|sequence\s+of\s+actions)\b/i },
    { label: 'Triggering input or injected instruction identified', re: /\b(inject\w*|triggering\s+input|poisoned|untrusted\s+(content|input|source)|retrieved\s+document|initial\s+prompt|root\s+trigger)\b/i },
    { label: 'Excess of authority or scope violation named', re: /\b(excessive\s+agency|over.?privileg\w*|scope\s+violations?|(beyond|outside)\s+(its|the|their)\s+\w*\s*(scope|authority|mandate|remit)|exceeded\s+(its|the|their)\s+(scope|authority|mandate|remit)|unauthoriz\w+|unauthoris\w+|least\s+privilege|permission\s+boundar\w+)\b/i },
    { label: 'Blast radius assessed (what the agent actually changed)', re: /\b(blast\s+radius|impact\s+scope|records?\s+(modified|deleted|created)|systems?\s+affected|irreversible|data\s+(written|changed|exfiltrat\w+)|reversib\w+)\b/i },
    { label: 'Containment and control recommendations given', re: /\b(revoke|disable\s+(the\s+)?(agent|tool)|human.in.the.loop|approval\s+gate|confirmation\s+gate|scope\s+the\s+token|kill\s+switch|rate\s+limit|remediat|contain)\b/i },
    DOJO2_CONFIDENCE_RISK_CHECK,
  ],
  'ai-model-abuse': [
    { label: 'Abuse type classified (jailbreak / extraction / membership inference)', re: /\b(jailbreak|prompt\s+injection|training\s+data\s+extraction|model\s+extraction|membership\s+inference|model\s+theft|data\s+extraction)\b/i },
    { label: 'MITRE ATLAS technique attributed (AML T-code)', re: /AML\.T\d{4}(\.\d{3})?/i },
    { label: 'Anomalous access pattern quantified against baseline', re: /\b(baseline|requests?\s+per\s+(hour|minute|second)|rate|volume|\d[\d,]{2,}\s+requests?|burst|anomal\w+|deviation|standard\s+deviation)\b/i },
    { label: 'Detection logic or query proposed', re: /\b(detection\s+(rule|logic|query)|sigma|KQL|SPL|alert\s+when|threshold|\|\s*(where|summarize)|signature)\b/i },
    { label: 'Rate limiting or quota controls recommended', re: /\b(rate\s+limit|quota|throttl\w+|token\s+budget|per.?tenant\s+(cap|limit)|API\s+key\s+(revoc|rotat)|block\s+the\s+key|backoff)\b/i },
    DOJO2_CONFIDENCE_RISK_CHECK,
  ],
  'adversarial-prompt-forensics': [
    { label: 'Attack vector classified (direct / indirect / jailbreak)', re: /\b(direct\s+(prompt\s+)?injection|indirect\s+(prompt\s+)?injection|jailbreak|RAG\s+injection|retrieved\s+content|via\s+the\s+document)\b/i },
    { label: 'Evidence cited from the conversation or retrieval log', re: /\b(turn\s*\d|log\s+(shows|entry)|retrieval\s+log|guardrail\s+log|timestamp|the\s+evidence|according\s+to\s+the\s+log|ingested)\b/i },
    { label: 'Bypassed control identified', re: /\b(input\s+shield|prompt\s+shield|guardrail|only\s+inspect\w*|classifier|filter)\b[^.]{0,80}\b(bypass\w*|miss\w*|fail\w*|not\s+applied|did\s+not|never\s+(saw|scanned))\b|\b(bypassed|evaded)\b/i },
    { label: 'Root cause stated, not just the symptom', re: /\b(root\s+cause|underlying|because|the\s+cause\s+was|stems?\s+from|trust\s+boundary|treated\s+as\s+trusted)\b/i },
    { label: 'Specific guardrail configuration change recommended', re: /\b(scan\s+retrieved|apply\s+the\s+shield\s+to|output\s+valid\w+|provenance|fence|delimit|sanitis?ze\s+(retrieved|context)|re.?configure|enable\s+\w+\s+shield)\b/i },
    DOJO2_CONFIDENCE_RISK_CHECK,
  ],
  'ransomware-ai-triage': [
    { label: 'Initial access vector identified', re: /\b(initial\s+access|entry\s+point|VPN|contractor\s+account|phish\w+|valid\s+account|no\s+MFA|credential\s+(theft|stuffing)|T1078|T1133)\b/i },
    { label: 'Lateral movement path reconstructed', re: /\b(lateral\s+movement|SMB|pivot|remote\s+(service|desktop)|credential\s+access|spread\s+to|from\s+the\s+workstation\s+to|T1021|T1003)\b/i },
    { label: 'Encryption scope and affected assets quantified', re: /\b(\d+\s+(of\s+\d+\s+)?(file\s+)?servers?|encryption\s+scope|affected\s+(hosts?|assets?|systems?)|in\s+progress|blast\s+radius)\b/i },
    { label: 'Automated containment actions distinguished from human-gated ones', re: /\b(human.in.the.loop|HITL|human\s+(gate|approval|authoris|authoriz)|manual\s+approval|irreversible|auto\w*\s+(contain|isolat|block)|SOAR\s+playbook)\b/i },
    { label: 'AI-assisted correlation limits or verification acknowledged', re: /\b(verif\w+|confirm\w+|hallucinat\w+|analyst\s+(review|validat)|do\s+not\s+rely|false\s+positive|corroborat\w+|second\s+source)\b/i },
    DOJO2_CONFIDENCE_RISK_CHECK,
  ],

  'log-triage': [
    // Require severity word as a label/heading, not buried in prose
    { label: 'Severity assessment provided (Critical / High / Medium / Low)', re: /\b(severity|sev)\b.*\b(critical|high|medium|low)\b|\*\*(critical|high|medium|low)\*\*|\[(critical|high|medium|low)\]/i },
    { label: 'MITRE ATT&CK technique identified (T-code)', re: /T\d{4}(\.\d{3})?/ },
    // IOC check: accepts both keyword labels AND actual artefact patterns (IPs, hashes, hostnames, URLs)
    { label: 'IOCs or indicators extracted', re: /\b(IP\s*address|domain|hash|MD5|SHA\d*|IOC|indicator|artefact|artifact|malicious\s+file|URL)\b|\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b|[a-fA-F0-9]{32,64}\b|https?:\/\//i },
    { label: 'Timeline or event sequence reconstructed', re: /\b(timeline|event\s+sequence|chronolog|occurred|logged|timestamp|first\s+seen|last\s+seen|\d{2}:\d{2}:\d{2})\b/i },
    { label: 'Recommended response actions provided', re: /\b(recommend|action\s*:|mitigat|remediati|block|isolat|contain|investig|escalat|next\s+steps?|immediate(ly)?|quarantin)\b/i },
    DOJO2_CONFIDENCE_RISK_CHECK,
  ],
  'alert-enrichment': [
    { label: 'CVE or vulnerability identified', re: /CVE-\d{4}-\d+|CVSS|vulnerability|exploit|affected\s+version|advisory|zero.?day/i },
    { label: 'MITRE ATT&CK technique mapped', re: /T\d{4}(\.\d{3})?|ATT&CK|technique|tactic/i },
    // Named threat groups or explicit attribution language
    { label: 'Threat actor or group context provided', re: /\b(APT\d+|threat\s+actors?|campaigns?|nation.state|TA\d+|ransomware\s+groups?|Lazarus|FIN\d+|Cozy\s+Bear|Fancy\s+Bear|Sandworm|UNC\d+|state.?sponsored|hacking\s+groups?|threat\s+clusters?|in\s+the\s+wild|exploited\s+in\s+the\s+wild|commodity\s+(threat\s+)?actors?)\b/i },
    // Require severity as a label/heading or CVSS numeric, not just the word anywhere
    { label: 'Severity or priority score assigned', re: /\b(severity|priority)\b[^.]*\b(critical|high|medium|low)\b|CVSS\s+[\d.]+|\*\*(critical|high|medium|low)\*\*/i },
    { label: 'Response or remediation recommended', re: /\b(patch|update|disable|block|monitor|investigate|escalat|remediat|notify|apply.*fix|hotfix|workaround)\b/i },
    DOJO2_CONFIDENCE_RISK_CHECK,
  ],
  'detection-rule-gen': [
    // Require at least detection: + condition: OR logsource: + detection: to confirm Sigma structure
    { label: 'Sigma rule structure present', re: /(?:detection\s*:[\s\S]{1,300}condition\s*:|logsource\s*:[\s\S]{1,300}detection\s*:|title\s*:[\s\S]{1,300}logsource\s*:)/i },
    // KQL: require a pipe operator + query keyword, or explicit table names
    { label: 'KQL, SPL, or YARA query included', re: /\|\s*(where|project|summarize|extend|join)\s+\w|DeviceEvents|SecurityEvent|SecurityAlert|AzureActivity|Sysmon|index\s*=\s*\w|rule\s+\w+\s*\{|process_name\s*:/i },
    { label: 'Detection logic and trigger conditions explained', re: /\b(detect|trigger|alert|monitor|capture|identif|flag\s+when|fires\s+when|match(es)?|pattern)\b/i },
    { label: 'False positive guidance provided', re: /\b(false.?positive|tuning|noise|threshold|exclusion|baseline|allowlist|whitelist|suppress|benign)\b/i },
    { label: 'MITRE ATT&CK technique referenced', re: /T\d{4}(\.\d{3})?|ATT&CK/i },
    DOJO2_CONFIDENCE_RISK_CHECK,
  ],
  'incident-report-draft': [
    { label: 'Executive summary with business impact included', re: /executive\s+summary|business\s+impact|board.level|c.suite|risk\s+to\s+(the\s+)?business|financial\s+impact/i },
    { label: 'Technical timeline of events provided', re: /timeline|chronolog|sequence\s+of\s+events|technical\s+timeline|\d{4}-\d{2}-\d{2}.*\d{2}:\d{2}/i },
    { label: 'Root cause analysis or kill chain present', re: /root\s+cause|initial\s+access|kill\s+chain|attack\s+path|how\s+it\s+(happened|occurred)|entry\s+point|attack\s+chain/i },
    { label: 'Containment or remediation steps listed', re: /contain|isolat|remediat|mitigat|patch|revoke|eradication|reset.*password|disable.*account|re.?image/i },
    { label: 'Lessons learned section included', re: /lessons?\s+learned|post.?incident\s+review|retrospective|prevent\w*\s+recurrence|what\s+we\s+would\s+do\s+differently/i },
    DOJO2_CONFIDENCE_RISK_CHECK,
  ],
  'threat-hunt': [
    { label: 'Threat hunting hypothesis stated (falsifiable)', re: /hypothesis|we\s+(expect|hypothesize|believe|suspect|assume)|hunting\s+for|looking\s+for|behavior\s+(suggests?|indicates?)/i },
    { label: 'MITRE ATT&CK technique referenced (T-code)', re: /T\d{4}(\.\d{3})?|MITRE\s+ATT&?CK|tactic|technique/i },
    { label: 'KQL or Sigma detection query provided', re: /\b(KQL|kusto|Sigma|SecurityEvents?|AzureActivity|SigninLogs|AuditLogs|Device\w+|CommonSecurityLog|detection\s*:|logsource\s*:)|\|\s*(where|summarize|project|extend)\s+\w/i },
    { label: 'False positive considerations addressed', re: /false\s+positive|benign|tuning|exclusion|legitimate|whitelist|allowlist|noise\s+reduction/i },
    { label: 'Data sources or log tables specified', re: /\b(SecurityEvents?|AzureActivity|SigninLogs|AuditLogs|Sysmon|Device\w+|CommonSecurityLog|Syslog|tables?|log\s+sources?|data\s+sources?|proxy\s+logs?|DNS\s+server\s+logs?)\b/i },
    DOJO2_CONFIDENCE_RISK_CHECK,
  ],
  'malware-behavior': [
    { label: 'Malware family or category identified', re: /ransomware|infostealer|RAT|loader|wiper|trojan|backdoor|dropper|malware\s+family|likely\s+(family|category)|classified\s+as/i },
    { label: 'MITRE ATT&CK technique mapped (T-code)', re: /T\d{4}(\.\d{3})?|ATT&?CK|persistence|defense\s+evasion|lateral\s+movement|exfiltration|command\s+and\s+control/i },
    { label: 'IOCs extracted (hashes, IPs, domains, registry keys)', re: /\b(sha256|md5|sha1|IOC|indicator|registry|HKLM|HKCU|C2|command.?and.?control|\.exe|\.dll|malicious\s+IP|malicious\s+domain)\b/i },
    { label: 'Detection rule (KQL or Sigma) provided', re: /\b(KQL|kusto|Sigma|Device\w+|SecurityEvents?|AuditLogs|detection\s*:|logsource\s*:|condition\s*:)|\|\s*(where|summarize|project|extend)\s+\w/i },
    { label: 'Containment or remediation playbook included', re: /contain|isolat|eradicat|remediat|reimag|quarantin|block|revoke|playbook|step\s+\d|first.?.step/i },
    DOJO2_CONFIDENCE_RISK_CHECK,
  ],
  'cloud-identity-abuse': [
    { label: 'Identity attack chain reconstructed (OAuth / token / CA bypass)', re: /oauth|token\s+(theft|replay|hijack)|access\s+token|refresh\s+token|conditional\s+access|MFA\s+(bypass|fatigue|skip)|service\s+principal|managed\s+identity|PRT|primary\s+refresh\s+token/i },
    { label: 'MITRE ATT&CK technique mapped (T-code)', re: /T\d{4}(\.\d{3})?|T1528|T1078\.004|T1550\.001|T1098|ATT&?CK/i },
    { label: 'Privilege escalation path or blast radius identified', re: /privilege\s+escalat|blast\s+radius|lateral\s+movement|admin|owner|contributor|global\s+admin|privileged\s+role|over.?privileged|excessive\s+(permission|access)|scope\s+expansion/i },
    { label: 'KQL detection query for Entra ID / Defender XDR provided', re: /\b(KQL|SigninLogs|AuditLogs|AADServicePrincipalSignIn|AADNonInteractiveUser|IdentityInfo|CloudAppEvents|DeviceEvents|MicrosoftGraphActivityLogs)\b/i },
    { label: 'Remediation and hardening recommendations included', re: /\b(revoke|invalidat|reset|MFA|conditional\s+access|PIM|privileged\s+identity|least.?privilege|token\s+lifetime|continuous\s+access\s+evaluation|CAE|FIDO|passkey|hardening)\b/i },
    DOJO2_CONFIDENCE_RISK_CHECK,
  ],
  'ai-system-compromise': [
    { label: 'Failure mode classified (injection / poisoning / drift / infrastructure)', re: /prompt\s+injection|model\s+poison|concept\s+drift|data\s+drift|infrastructure\s+(compromise|breach)|supply\s+chain|adversarial\s+input|model\s+degradation|configuration\s+(change|drift)/i },
    { label: 'MITRE ATLAS or ATT&CK technique referenced', re: /AML\.T\d{4}|T\d{4}(\.\d{3})?|ATLAS|ATT&?CK|AML\.T0054|AML\.T0020|AML\.T0031/i },
    { label: 'Evidence analysis covers logs, telemetry, or prompt traces', re: /\b(logs?|telemetry|traces?|prompt\s+traces?|model\s+outputs?|API\s+(logs?|calls?|requests?)|inference\s+logs?|serving\s+logs?|anomalous\s+(outputs?|responses?)|unexpected\s+(outputs?|behaviou?rs?))\b/i },
    { label: 'Containment and redeployment decision provided', re: /\b(contain|isolat|rollback|redeploy|offline|quarantin|pull.*model|disable.*endpoint|version\s+rollback|revert|blue.?green|canary|safe.*default|fallback)\b/i },
    { label: 'EU AI Act Article 73 or serious incident notification assessed', re: /Article\s+73|serious\s+incident|AI\s+Act.*notif|notif.*AI\s+Act|incident\s+report.*AI|market\s+surveillance|NCA\s+notif/i },
    DOJO2_CONFIDENCE_RISK_CHECK,
  ],
};

export const DOJO3_QUALITY_CHECKS: Record<string, QualityCheck[]> = {
  // ── Scenarios added after the first Dojo 3 build ─────────────────────────
  // A scenario with no rubric scores a flat 100 and always reads PASS.
  // Every Dojo 3 scenario id in lib/scenarios.ts must appear here.

  'ai-procurement-assessment': [
    { label: 'Procurement decision stated (proceed / conditional / decline)', re: /\b(proceed|approve\w*|conditional\w*|decline|reject\w*|do\s+not\s+(proceed|procure))\b/i },
    { label: 'Vendor AI supply chain risks assessed', re: /\b(sub.?processor|model\s+provenance|training\s+data\s+source|open.?weight|third.?party\s+model|AI.?BOM|supply\s+chain|upstream\s+(model|provider))\b/i },
    { label: 'Contractual controls specified (DPA / SLA / audit rights)', re: /\b(DPA|MSA|data\s+processing\s+agreement|SLA|audit\s+rights?|right\s+to\s+audit|clause|indemnif\w+|liability|exit\s+(plan|clause))\b/i },
    { label: 'Framework reference cited (ISO 42001 / NIST AI RMF / EU AI Act)', re: /ISO\s*(\/IEC\s*)?42001|NIST|AI\s+RMF|EU\s+AI\s+Act|article\s+\d+|clause\s+\d/i },
    { label: 'Residual risk and acceptance owner identified', re: /\b(residual\s+risk|risk\s+(owner|acceptance|accepted\s+by)|accountab\w+|sign.?off|escalat\w+\s+to|governance\s+(board|committee))\b/i },
  ],
  'iso42001-gap-analysis': [
    { label: 'Specific ISO 42001 clauses cited', re: /\b(clause\s*\d|ISO\s*(\/IEC\s*)?42001|annex\s+A(\.\d)?)\b/i },
    { label: 'Gap severity or maturity rated per clause', re: /\b(gap\s+(severity|rating)|maturity|score\s*[:=]?\s*[0-5]|major\s+nonconform\w+|minor\s+nonconform\w+|partial|absent|fully\s+implemented)\b/i },
    { label: 'Evidence required for each gap named', re: /\b(evidence|artefact|artifact|record|documented\s+procedure|log|register|policy\s+document|audit\s+trail|demonstrat\w+)\b/i },
    { label: 'AIMS scope and interested parties addressed', re: /\b(AIMS|scope\s+(statement|of\s+the\s+management\s+system)|interested\s+part\w+|stakeholder|context\s+of\s+the\s+organi[sz]ation|boundar\w+)\b/i },
    { label: 'Remediation plan with owners and sequencing', re: /\b(remediat\w+|corrective\s+action|owner|responsib\w+|by\s+Q[1-4]|timeline|priorit\w+|phase\s*\d|roadmap)\b/i },
  ],
  'ai-continuous-monitoring': [
    { label: 'Specific metrics or signals defined', re: /\b(metric|KPI|KRI|signal|indicator|drift\s+(score|metric)|accuracy|precision|recall|latency|refusal\s+rate|hallucination\s+rate|cost\s+per)\b/i },
    { label: 'Thresholds and alerting criteria set', re: /\b(threshold|alert\s+when|exceed\w*|breach\w*|tolerance|control\s+limit|>\s*\d|below\s+\d|percent(age)?\s+drop)\b/i },
    { label: 'Monitoring cadence or review frequency stated', re: /\b(continuous\w*|real.?time|daily|weekly|monthly|quarterly|cadence|frequency|per\s+release|on\s+each\s+deployment)\b/i },
    { label: 'Escalation path and owner defined', re: /\b(escalat\w+|owner|on.?call|accountab\w+|notif\w+|governance\s+(board|committee)|model\s+risk|review\s+board)\b/i },
    { label: 'Framework mapping (NIST AI RMF MEASURE / ISO 42001 clause 9)', re: /NIST|AI\s+RMF|MEASURE(\s+\d)?|MANAGE(\s+\d)?|ISO\s*(\/IEC\s*)?42001|clause\s*9|performance\s+evaluation/i },
  ],
  'nist-ai-rmf-profile': [
    { label: 'All four functions addressed (Govern / Map / Measure / Manage)', re: /Govern[\s\S]{0,600}Map[\s\S]{0,600}Measure[\s\S]{0,600}Manage|Govern[\s\S]{0,600}Manage/i },
    { label: 'Specific subcategories cited (e.g. MAP 5.1, MEASURE 2.5)', re: /\b(GOVERN|MAP|MEASURE|MANAGE)\s*\d(\.\d)?\b/i },
    { label: 'Profile scoped to a stated use case and context', re: /\b(use\s+case|context|deployment|in\s+scope|out\s+of\s+scope|target\s+profile|current\s+profile|boundar\w+)\b/i },
    { label: 'Current state versus target state distinguished', re: /\b(current\s+(state|profile)|target\s+(state|profile)|as.?is|to.?be|gap\s+between|desired\s+state|maturity)\b/i },
    { label: 'Prioritised actions with owners produced', re: /\b(priorit\w+|action\s+(plan|item)|owner|responsib\w+|sequenc\w+|near.?term|roadmap|phase\s*\d)\b/i },
  ],
  'ai-regulatory-cross-reference': [
    { label: 'All four frameworks addressed', re: /(?=[\s\S]*EU\s+AI\s+Act)(?=[\s\S]*(NIST|AI\s+RMF))(?=[\s\S]*(ISO\s*(\/IEC\s*)?42001|42001))(?=[\s\S]*OWASP)/i },
    { label: 'Specific clause, article, or function references cited', re: /(article\s*\d+|clause\s*\d(\.\d)?|(GOVERN|MAP|MEASURE|MANAGE)\s*\d(\.\d)?|LLM\d{2})/i },
    { label: 'Overlapping requirements identified and satisfied once', re: /\b(overlap\w*|satisf\w+\s+(both|all|multiple)|single\s+control|maps?\s+to\s+(both|all)|shared\s+(control|requirement)|de.?duplicat\w+|common\s+control)\b/i },
    { label: 'Conflicts resolved with a stated governing requirement', re: /\b(conflict\w*|tension|stricter|most\s+stringent|takes\s+precedence|governs|prevails|resolve\w*|which\s+one\s+applies)\b/i },
    { label: 'Unified artefact with no duplicate controls and no gaps', re: /\b(unified|consolidat\w+|single\s+control\s+set|crosswalk|matrix|no\s+(duplicate|gap)|coverage\s+(map|matrix)|traceab\w+)\b/i },
  ],
  'ai-transparency-obligations': [
    { label: 'EU AI Act Articles 12 to 15 referenced', re: /article\s*1[2-5]|record.?keeping|transparency\s+(obligation|requirement)|accuracy,?\s+robustness|human\s+oversight\s+requirement/i },
    { label: 'Instructions for use content specified', re: /\b(instructions?\s+for\s+use|intended\s+purpose|IFU|capabilit\w+\s+and\s+limitation|performance\s+characteristic|conditions?\s+of\s+use)\b/i },
    { label: 'Capability and limitation disclosures drafted', re: /\b(limitation|known\s+(failure|weakness)|accuracy\s+(level|rate)|foreseeable\s+misuse|degrad\w+|not\s+suitable\s+for|out.of.scope\s+use)\b/i },
    { label: 'Human oversight interface documented', re: /\b(human\s+oversight|Article\s*14|stop\s+button|override|intervene|interpret\s+the\s+output|automation\s+bias|oversight\s+measure)\b/i },
    { label: 'Deployer versus end user disclosures distinguished', re: /\b(deployer|provider|end\s+user|affected\s+person|downstream|who\s+receives|distinguish\w*\s+between)\b/i },
  ],
  'model-drift-governance': [
    { label: 'Drift root cause classified (data / concept / adversarial / infrastructure)', re: /\b(data\s+drift|concept\s+drift|covariate\s+shift|distribution\s+shift|adversarial\s+degrad\w+|infrastructure\s+change|feature\s+pipeline)\b/i },
    { label: 'EU AI Act Article 72 post-market surveillance obligations addressed', re: /article\s*72|post.?market\s+surveillance|PMS\s+plan|continuous\s+monitoring\s+obligation/i },
    { label: 'Article 73 serious incident notification threshold assessed', re: /article\s*73|serious\s+incident|notification\s+(threshold|obligation|window)|report\s+to\s+the\s+(authority|market\s+surveillance)|15\s+days/i },
    { label: 'Revalidation and redeployment plan produced', re: /\b(revalidat\w+|retrain\w+|re.?deploy\w+|rollback|shadow\s+mode|canary|acceptance\s+criteria|sign.?off\s+before)\b/i },
    { label: 'ISO 42001 clause 10 improvement process referenced', re: /ISO\s*(\/IEC\s*)?42001|clause\s*10|nonconform\w+|corrective\s+action|continual\s+improvement/i },
  ],
  'ai-regulatory-mapping': [
    { label: 'Multiple regulatory regimes addressed', re: /(?=[\s\S]*(GDPR|EU\s+AI\s+Act))(?=[\s\S]*(NIST|ISO\s*(\/IEC\s*)?42001|CCPA))/i },
    { label: 'Specific articles or clauses cited', re: /(article\s*\d+|clause\s*\d(\.\d)?|art\.\s*\d+)/i },
    { label: 'Interaction between regimes explained rather than listed', re: /\b(both\s+apply|neither\s+substitut\w+|in\s+addition\s+to|cumulativ\w+|interact\w+|does\s+not\s+replace|stricter\s+of)\b/i },
    { label: 'Risk tier or classification determined', re: /\b(high.?risk|limited.?risk|minimal.?risk|prohibited|annex\s+III|automated\s+decision|Article\s*22)\b/i },
    { label: 'Prioritised remediation plan with jurisdiction ordering', re: /\b(priorit\w+|remediation\s+(plan|calendar)|enforcement|jurisdiction|deadline|by\s+\w+\s+20\d\d|first|sequence)\b/i },
  ],

  'ai-risk-classification': [
    { label: 'EU AI Act risk tier assigned (prohibited / high / limited / minimal)', re: /\b(prohibited|unacceptable.?risk|high.?risk|limited.?risk|minimal.?risk)\b|annex\s+(I|II|III)/i },
    { label: 'NIST AI RMF functions referenced (Govern / Map / Measure / Manage)', re: /NIST|AI\s+RMF|\bGovern\b|\bMap\b|\bMeasure\b|\bManage\b/i },
    { label: 'OWASP LLM Top 10 exposure mapped', re: /LLM0[0-9]|OWASP\s*LLM/i },
    { label: 'Likelihood and impact scoring present', re: /likelihood|impact|risk\s+score|probability|severity\s*:|[1-5]\s*\/\s*5|\d+\s*\/\s*5|inherent\s+risk/i },
    { label: 'Required controls or mitigations specified', re: /human\s+oversight|conformity\s+assessment|logging|monitor|access\s+control|control|safeguard|mitigation|guardrail/i },
  ],
  'policy-and-controls': [
    { label: 'Acceptable use policy clauses drafted', re: /\b(must|shall|prohibited|required|mandatory|acceptable\s+use|policy\s+clause|employees?\s+must|users?\s+must)\b/i },
    { label: 'NIST AI RMF framework referenced', re: /NIST|AI\s+RMF|Map\b|Measure\b|Manage\b|Govern\b/i },
    { label: 'EU AI Act or ISO 42001 standard referenced', re: /EU\s+AI\s+Act|ISO\s+42001|42001|annex\s+A/i },
    { label: 'Technical controls or safeguards specified', re: /control|safeguard|enforce|audit|monitor|access\s+control|logging|role.based|data\s+classif|rate\s+limit|guardrail/i },
    { label: 'Maturity or coverage scoring applied (0-3 scale)', re: /score\s*[:=]?\s*[0-3]|partial|exemplary|missing|present|maturity|gap|coverage|fully\s+implemented/i },
  ],
  'third-party-vendor-review': [
    { label: 'Approve / conditional / reject decision stated', re: /\b(approve|approved|conditional|condition\w*\s+approval|reject|rejected|do\s+not\s+approve)\b/i },
    { label: 'Gap analysis covers data residency / training data / sub-processors', re: /data\s+residency|training\s+data|sub.?processor|model\s+version|retention|deletion\s+on\s+termination|data\s+sovereignty/i },
    { label: 'Incident SLA and audit rights addressed', re: /incident\s+SLA|breach\s+notification|notification\s+window|audit\s+rights?|right\s+to\s+audit|audit\s+cadence|SLA/i },
    { label: 'Required contractual controls listed (DPA / MSA clauses)', re: /\b(DPA|MSA|data\s+processing\s+agreement|contract\w*\s+control|clause|addendum|indemnif|liability)\b/i },
    { label: 'Framework mapping (NIST AI RMF / ISO 42001 / EU AI Act)', re: /NIST|AI\s+RMF|ISO\s+42001|42001|EU\s+AI\s+Act|article\s+\d+/i },
  ],
  'ai-incident-response': [
    { label: 'AI failure mode classified (adversarial / drift / poisoning / degradation / hallucination)', re: /\b(adversarial|data\s+drift|distribut\w+\s+shift|poisoning|model\s+degradation|hallucination|model\s+failure|out.of.distribution|OOD|concept\s+drift)\b/i },
    { label: 'Immediate containment action specified (rollback / circuit-breaker / shadow mode)', re: /\b(rollback|roll\s+back|circuit.?breaker|shadow\s+mode|disable|offline|suspend|fallback|hot.?swap|revert\s+to)\b/i },
    { label: 'Root cause analysis approach documented', re: /\b(root\s+cause|RCA|investigation|forensic|audit\s+trail|model\s+card|training\s+data|monitoring\s+log|inference\s+log|explainability|SHAP|LIME|counterfactual)\b/i },
    { label: 'Regulatory notification assessment (EU AI Act Article 73 / GDPR Article 33)', re: /EU\s+AI\s+Act|article\s+73|serious\s+incident|GDPR|article\s+33|notif\w+\s+(authority|regulator|DPA|supervisory)|breach\s+notification/i },
    { label: 'Remediation and redeployment conditions specified', re: /\b(retrain|fine.?tune|data\s+remediation|revalidat|conformity|human\s+review|human\s+oversight|retest|re.?deploy|approval\s+before\s+redeployment|production\s+gate)\b/i },
  ],
  'ai-model-transparency': [
    { label: 'Model card section present (intended use, limitations, training data, evaluation)', re: /\b(intended\s+use|out.of.scope|limitations?|training\s+data|evaluation\s+results?|performance\s+metrics?|bias|fairness|model\s+card)\b/i },
    { label: 'EU AI Act Articles 11-15 technical documentation requirements addressed', re: /EU\s+AI\s+Act|article\s+1[1-5]|technical\s+documentation|conformity|high.?risk\s+AI|transparency\s+obligation/i },
    { label: 'NIST AI RMF MAP subcategory coverage documented', re: /NIST|AI\s+RMF|\bMAP\b|Map\s+\d|context.*risk|AI\s+risk\s+context|AI\s+system\s+categoriz/i },
    { label: 'AI-BOM or system card components listed (model provenance, dependencies, data lineage)', re: /\b(AI.?BOM|bill\s+of\s+material|model\s+provenance|data\s+lineage|dependency|supply\s+chain|system\s+card|model\s+version|artifact\s+hash)\b/i },
    { label: 'Bias, fairness, and performance gap assessment included', re: /\b(bias|fairness|demographic|disparate|representation|equity|protected\s+attribute|accuracy\s+gap|performance\s+disparity|subgroup)\b/i },
  ],
  'ai-red-team-report': [
    { label: 'Engagement scope and threat actor profiles defined', re: /\b(scope|engagement|threat\s+actor|adversary\s+profile|attacker\s+model|red\s+team\s+(?:scope|objective)|rules\s+of\s+engagement|ROE|test\s+boundary)\b/i },
    { label: 'MITRE ATLAS attack categories selected and mapped', re: /ATLAS|AML\.\w+\.\d+|adversarial\s+ML|model\s+evasion|model\s+poisoning|model\s+inversion|model\s+extraction|supply\s+chain|data\s+poisoning/i },
    { label: 'Findings documented with CVSS or severity rating', re: /\b(finding|vulnerability|critical|high|medium|low)\b.*\b(severity|CVSS|score|rating|risk)\b|\bCVSS\s+[\d.]+|severity\s*:\s*(critical|high|medium|low)/i },
    { label: 'NIST AI RMF controls mapped to remediation priorities', re: /NIST|AI\s+RMF|\bGovern\b|\bMap\b|\bMeasure\b|\bManage\b|control\s+mapping|remediation\s+priorit|risk\s+treatment/i },
    { label: 'Executive summary with business risk narrative included', re: /executive\s+summary|business\s+(?:risk|impact|context)|c.suite|board.level|risk\s+to\s+(?:the\s+)?(?:business|organization|brand)|financial\s+impact/i },
    { label: 'Remediation roadmap with timeline or priority tiers', re: /\b(roadmap|remediation\s+plan|priority\s+tier|short.term|long.term|immediate|P[0-3]|milestone|sprint|quarter|recommendation\s+timeline)\b/i },
  ],
  'ai-supply-chain-risk': [
    { label: 'Model provenance reviewed (origin, hosting, versioning, integrity)', re: /\b(provenance|model\s+origin|base\s+model|pretrained|fine.?tun|self.?hosted|managed\s+endpoint|model\s+hash|checksum|signed\s+model\s+card|artifact\s+integrit)\b/i },
    { label: 'Training data lineage and governance assessed', re: /\b(training\s+data|data\s+lineage|data\s+provenance|data\s+governance|GDPR|CCPA|data\s+poisoning|pre.?training|dataset\s+curation|data\s+source|membership\s+inference)\b/i },
    { label: 'Dependency vulnerability surface (SBOM/AI-BOM) reviewed', re: /\b(SBOM|AI.?BOM|bill\s+of\s+material|dependency|CVE|pickle|deserialization|supply\s+chain|ML\s+framework|PyTorch|TensorFlow|container|base\s+image|NVD|OSV)\b/i },
    { label: 'Model card completeness scored against EU AI Act or NIST AI RMF MAP.5', re: /model\s+card|EU\s+AI\s+Act|article\s+18|NIST|MAP\.5|MAP\s+5|technical\s+documentation|completeness|gap|present|missing/i },
    { label: 'Risk scoring and contractual controls recommended', re: /\b(risk\s+(?:score|rating|level)|high|medium|low|contractual|vendor\s+controls?|DPA|MSA|clause|OWASP\s+LLM04|LLM04|MAP\.5)\b/i },
  ],
  'ai-bias-audit': [
    { label: 'Bias metric computed (DIR, EOD, DPD, or AOD)', re: /\b(disparate\s+impact|DIR|four.fifths|equal\s+opportunity|EOD|demographic\s+parity|DPD|average\s+odds|AOD|TPR|FPR|0\.\d+|ratio\s*[:=]?\s*0\.\d+)\b/i },
    { label: 'EU AI Act or EEOC violation classification provided', re: /EU\s+AI\s+Act|annex\s+III|article\s+5|article\s+10|EEOC|four.fifths\s+rule|uniform\s+guidelines|prohibited\s+practice|high.risk\s+AI|GDPR\s+article\s+22/i },
    { label: 'Remediation plan with monitoring obligations specified', re: /\b(remediat|retrain|reweigh|adversarial\s+debias|data\s+re.?sampl|monitor|post.?market|Article\s+72|ISO\s+42001|NIST|MEASURE\s+2\.5|Clause\s+9)\b/i },
    { label: 'Mathematical formula or numeric metric values provided', re: /formula\s*[:=]|[Pp]\s*\(|÷|×|\bTPR\b|\bFPR\b|0\.[0-9]{1,4}|ratio\s*[:=]?\s*\d/i },
    { label: 'Regulatory disclosure or notification assessed (GDPR, EU AI Act)', re: /GDPR|article\s+22|automated\s+decision|EU\s+AI\s+Act|article\s+72|article\s+73|notif|DPA|supervisory\s+authority|data\s+subject\s+rights?/i },
  ],
  'ai-privacy-impact': [
    { label: 'GDPR Article 35 DPIA requirement determination provided', re: /GDPR|article\s+35|DPIA|data\s+protection\s+impact|systematic\s+(profiling|processing)|high\s+risk|special\s+categor|mandatory/i },
    { label: 'Data flow map covers processing operations and data subjects', re: /data\s+flow|processing\s+operation|personal\s+data|data\s+subject|controller|processor|sub.?processor|retention|deletion|cross.?border|transfer|legal\s+basis/i },
    { label: 'Re-identification and membership inference risk assessed', re: /re.?identification|membership\s+inference|linkage\s+attack|k.anonymity|differential\s+privacy|epsilon|training\s+data\s+extraction|model\s+inversion|privacy\s+risk/i },
    { label: 'ISO 42001 or NIST AI RMF MAP reference included', re: /ISO\s+42001|42001|Clause\s+8\.3|NIST|AI\s+RMF|MAP\s+2\.3|MAP\.2|privacy\s+risk\s+assess/i },
    { label: 'DPA notification or EU AI Act Article 73 assessment present', re: /DPA|supervisory\s+authority|data\s+protection\s+authority|article\s+35.*consult|article\s+73|serious\s+incident|72\s+hours?|notification\s+(obligation|threshold|requirement)/i },
  ],
};

/**
 * The criteria a scenario is scored against, labels only.
 *
 * The control panel renders these next to live tick state, so the learner sees
 * the same list the evaluator marks.
 */
export function getQualityCriteria(dojoId: 2 | 3, scenarioId: string): string[] {
  const checks = dojoId === 2
    ? (DOJO2_QUALITY_CHECKS[scenarioId] ?? [])
    : (DOJO3_QUALITY_CHECKS[scenarioId] ?? []);
  return checks.map((c) => c.label);
}

export const ALL_CRITERIA_MET_MSG = 'Analysis covers all quality criteria for this scenario.';
