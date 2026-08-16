/**
 * Deterministic SOC analyst for Dojo 2.
 *
 * Dojo 2 scores the *assistant's* analysis, not the learner's prompt — the
 * learner's skill is in configuring and directing the analyst, and the rubric
 * grades what comes back. With no OPENAI_API_KEY the assistant returned a stub
 * greeting, so every Dojo 2 scenario scored a hard FAIL (1 of 6 criteria on
 * log-triage) no matter what the learner did. Two of the three dojos were
 * unusable in the app's default, zero-configuration state.
 *
 * This module reads the incident the learner submitted and writes the analysis
 * from it. Nothing is invented: IOCs, timestamps, hosts and technique
 * attributions are all extracted from the submitted text, so the output is
 * about the incident in front of it rather than generic filler.
 *
 * It is deliberately NOT a guaranteed pass. Each section is gated on the
 * Dojo 2 control that governs it — turn off IOC extraction and no IOC section
 * is produced. Since the rubric drops the criteria for disabled capabilities
 * (see applyConfigFilter in the evaluator), the learner sees their control
 * choices change the analysis, which is the mechanic the lab teaches. Sections
 * whose evidence is absent from the incident are omitted rather than faked,
 * so submitting a thin incident produces a thin analysis and a lower score.
 */
import type { Dojo2Config } from '@/types';

// ─── Extraction ──────────────────────────────────────────────────────────────

const RE_IPV4 = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g;
const RE_DOMAIN = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|io|ru|cn|xyz|top|info|biz|co|dev|app|onion)\b/gi;
const RE_HASH = /\b[a-f0-9]{64}\b|\b[a-f0-9]{40}\b|\b[a-f0-9]{32}\b/gi;
const RE_URL = /\bhttps?:\/\/[^\s"'<>)]+/gi;
const RE_TIMESTAMP = /\b\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?\b/g;
const RE_TCODE = /\bT\d{4}(?:\.\d{3})?\b/g;
const RE_ATLAS = /\bAML\.T\d{4}(?:\.\d{3})?\b/gi;

/** Hosts and accounts named in the log, used to scope the incident. */
const RE_HOST = /\bHost:\s*([A-Za-z0-9._-]+)/g;
const RE_USER = /\b(?:for(?:\s+invalid)?\s+user|user=|UserPrincipalName:|account)\s+([A-Za-z0-9._\\-]+)/gi;

function uniq(matches: RegExpMatchArray | null): string[] {
  return matches ? Array.from(new Set(matches)) : [];
}

/**
 * Private RFC1918 space is called out separately: an internal address is
 * usually the victim rather than the attacker, and blocking it is how a
 * containment step becomes an outage.
 */
function isPrivate(ip: string): boolean {
  return /^10\./.test(ip) || /^192\.168\./.test(ip) || /^172\.(1[6-9]|2\d|3[01])\./.test(ip);
}

export interface IncidentFacts {
  ips: string[];
  privateIps: string[];
  domains: string[];
  hashes: string[];
  urls: string[];
  timestamps: string[];
  tcodes: string[];
  atlasCodes: string[];
  hosts: string[];
  users: string[];
  /** Lines that carry a timestamp, for timeline reconstruction. */
  timedLines: string[];
  succeeded: boolean;
  escalated: boolean;
}

const SUCCESS_MARKERS = /\b(accepted\s+password|session\s+opened|login\s+succe\w+|authentication\s+succe\w+|success(?:ful)?\s+(?:login|logon|sign.?in)|granted|200\s+OK|exfiltrat\w+|encrypted\s+\d)/i;
const ESCALATION_MARKERS = /\b(sudo|root|administrator|privilege\s+escalat\w+|Global\s+Admin|elevated|SYSTEM)\b/i;

/** Pulls every fact the analysis is built from out of the submitted incident. */
export function extractIncidentFacts(text: string): IncidentFacts {
  const allIps = uniq(text.match(RE_IPV4));
  const timedLines = text
    .split('\n')
    .filter((l) => RE_TIMESTAMP.test(l) && ((RE_TIMESTAMP.lastIndex = 0), true))
    .map((l) => l.trim())
    .filter(Boolean);

  return {
    ips: allIps.filter((ip) => !isPrivate(ip)),
    privateIps: allIps.filter(isPrivate),
    domains: uniq(text.match(RE_DOMAIN)),
    hashes: uniq(text.match(RE_HASH)),
    urls: uniq(text.match(RE_URL)),
    timestamps: uniq(text.match(RE_TIMESTAMP)),
    tcodes: uniq(text.match(RE_TCODE)),
    atlasCodes: uniq(text.match(RE_ATLAS)),
    hosts: Array.from(new Set(Array.from(text.matchAll(RE_HOST), (m) => m[1]))),
    users: Array.from(new Set(Array.from(text.matchAll(RE_USER), (m) => m[1]))).slice(0, 6),
    timedLines,
    succeeded: SUCCESS_MARKERS.test(text),
    escalated: ESCALATION_MARKERS.test(text),
  };
}

// ─── Technique attribution ───────────────────────────────────────────────────

/**
 * Behaviour to ATT&CK, and AI-specific behaviour to ATLAS.
 *
 * Attribution is by observed behaviour, which is how an analyst does it: the
 * evidence in the log picks the technique, not the scenario's name. Codes and
 * titles are the published ones.
 */
const TECHNIQUES: Array<{ re: RegExp; code: string; name: string }> = [
  { re: /\bfailed\s+password\b|\bbrute.?forc\w+\b|password\s+guess\w+/i, code: 'T1110.001', name: 'Brute Force: Password Guessing' },
  { re: /\bpassword\s+spray\w*/i, code: 'T1110.003', name: 'Brute Force: Password Spraying' },
  { re: /\bpowershell\b/i, code: 'T1059.001', name: 'Command and Scripting Interpreter: PowerShell' },
  { re: /\bcmd\.exe\b|\bbatch\s+script/i, code: 'T1059.003', name: 'Command and Scripting Interpreter: Windows Command Shell' },
  { re: /\b(bash|sh|\/bin\/sh)\b/i, code: 'T1059.004', name: 'Command and Scripting Interpreter: Unix Shell' },
  { re: /\bWMI\b|\bwmic\b|Win32_Process/i, code: 'T1047', name: 'Windows Management Instrumentation' },
  { re: /\bPsExec\b|\bSMB\b|admin\$|\bC\$\b/i, code: 'T1021.002', name: 'Remote Services: SMB/Windows Admin Shares' },
  { re: /\bRDP\b|\bmstsc\b|remote\s+desktop/i, code: 'T1021.001', name: 'Remote Services: Remote Desktop Protocol' },
  { re: /\bmimikatz\b|lsass|credential\s+dump\w*/i, code: 'T1003.001', name: 'OS Credential Dumping: LSASS Memory' },
  { re: /\bsudo\b|privilege\s+escalat\w+|\bsetuid\b/i, code: 'T1548', name: 'Abuse Elevation Control Mechanism' },
  { re: /\bscheduled\s+task\b|\bschtasks\b|\bcron\b/i, code: 'T1053', name: 'Scheduled Task/Job' },
  { re: /\bregistry\s+run\b|CurrentVersion\\\\Run|\bpersistence\b/i, code: 'T1547.001', name: 'Boot or Logon Autostart: Registry Run Keys' },
  { re: /\bexfiltrat\w+\b|data\s+transfer|large\s+outbound/i, code: 'T1041', name: 'Exfiltration Over C2 Channel' },
  { re: /\bencrypt\w+\s+(files?|assets?|servers?)\b|\bransom\w*/i, code: 'T1486', name: 'Data Encrypted for Impact' },
  { re: /\bOAuth\b|\bconsent\s+grant\b|\bapp\s+registration\b/i, code: 'T1528', name: 'Steal Application Access Token' },
  { re: /\bMFA\b.{0,20}\b(fatigue|bypass|push)\b|\bMFA\s+not\s+(enabled|required)/i, code: 'T1621', name: 'Multi-Factor Authentication Request Generation' },
  { re: /\bvalid\s+account\b|\bcompromised\s+credential/i, code: 'T1078', name: 'Valid Accounts' },
  { re: /\bphish\w+/i, code: 'T1566', name: 'Phishing' },
  { re: /\bC2\b|command\s+and\s+control|beacon\w*/i, code: 'T1071.001', name: 'Application Layer Protocol: Web Protocols' },
];

const ATLAS_TECHNIQUES: Array<{ re: RegExp; code: string; name: string }> = [
  { re: /\bprompt\s+injection\b/i, code: 'AML.T0051', name: 'LLM Prompt Injection' },
  { re: /\bindirect\s+(prompt\s+)?injection\b|retrieved\s+(document|content)/i, code: 'AML.T0051.001', name: 'LLM Prompt Injection: Indirect' },
  { re: /\bjailbreak\w*/i, code: 'AML.T0054', name: 'LLM Jailbreak' },
  { re: /\bsystem\s+prompt\b.{0,30}\b(extract\w*|leak\w*|reveal\w*|disclos\w*)|extract.{0,20}system\s+prompt/i, code: 'AML.T0056', name: 'Extract LLM System Prompt' },
  { re: /\bmodel\s+(extraction|theft)\b|\bmembership\s+inference\b/i, code: 'AML.T0057', name: 'LLM Data Leakage' },
  { re: /\bagent\b.{0,30}\btool\s+(call|invocation)\b|\btool\s+abuse\b/i, code: 'AML.T0053', name: 'AI Agent Tool Invocation' },
  { re: /\b(training\s+)?data\s+poison\w+|\bmodel\s+poison\w+/i, code: 'AML.T0020', name: 'Poison Training Data' },
];

function attributeTechniques(text: string, facts: IncidentFacts) {
  const found = TECHNIQUES.filter((t) => t.re.test(text));
  const atlas = ATLAS_TECHNIQUES.filter((t) => t.re.test(text));
  // Codes written in the incident itself are authoritative; keep them even
  // when no behavioural rule fired.
  const explicit = facts.tcodes
    .filter((c) => !found.some((f) => f.code === c))
    .map((c) => ({ code: c, name: 'as cited in the submitted evidence' }));
  const explicitAtlas = facts.atlasCodes
    .filter((c) => !atlas.some((f) => f.code.toLowerCase() === c.toLowerCase()))
    .map((c) => ({ code: c, name: 'as cited in the submitted evidence' }));
  return {
    attack: [...found.map(({ code, name }) => ({ code, name })), ...explicit],
    atlas: [...atlas.map(({ code, name }) => ({ code, name })), ...explicitAtlas],
  };
}

// ─── Severity ────────────────────────────────────────────────────────────────

function severityOf(facts: IncidentFacts, config: Dojo2Config): { level: string; why: string } {
  if (facts.succeeded && facts.escalated) {
    return { level: 'Critical', why: 'authentication succeeded and the session escalated privilege' };
  }
  if (facts.succeeded) {
    return { level: 'High', why: 'the attempt succeeded, so this is a confirmed compromise rather than an attempt' };
  }
  if (facts.ips.length > 0 || facts.hashes.length > 0) {
    return { level: 'Medium', why: 'hostile activity is evidenced but no success marker is present in the supplied window' };
  }
  // Nothing in the evidence justifies a rating, so defer to the analyst's own
  // setting rather than inventing one.
  const fallback = config.riskAssessment
    ? config.riskAssessment.charAt(0).toUpperCase() + config.riskAssessment.slice(1)
    : 'Low';
  return { level: fallback, why: 'the supplied evidence does not establish impact; rating reflects the configured risk posture' };
}

// ─── Containment ─────────────────────────────────────────────────────────────

/**
 * Actions are split into what is safe to automate and what needs a human.
 * Several rubrics check for that split, and it is the correct habit regardless:
 * automating an irreversible action at machine speed turns a response into a
 * second incident.
 */
function containmentFor(text: string, facts: IncidentFacts): { auto: string[]; gated: string[] } {
  const auto: string[] = [];
  const gated: string[] = [];

  if (facts.ips.length) {
    auto.push(`Block the external source ${facts.ips.slice(0, 3).join(', ')} at the perimeter and add to the SIEM blocklist.`);
  }
  if (facts.users.length) {
    auto.push(`Revoke active sessions and refresh tokens for ${facts.users.slice(0, 3).join(', ')}, and force credential reset.`);
  }
  if (facts.hashes.length) {
    auto.push('Add the observed file hashes to EDR blocklists and sweep the estate retroactively.');
  }
  if (/\bencrypt\w+|\bransom/i.test(text)) {
    gated.push('Isolate affected file servers — human-gated, isolating a production file server is service-affecting.');
  }
  if (facts.hosts.length) {
    gated.push(`Take a forensic image of ${facts.hosts.slice(0, 2).join(', ')} before reimaging, so evidence survives remediation.`);
  }
  gated.push('Escalate to Tier-2 with this triage summary and preserve the source logs before the retention window closes.');

  if (auto.length === 0) {
    auto.push('No automated containment is justified by the supplied evidence; widen the log window before acting.');
  }
  return { auto, gated };
}

// ─── Scenario-shaped artifacts ───────────────────────────────────────────────
//
// Dojo 2's task types ask for different deliverables, and a triage summary is
// not one of them: detection-rule-gen wants a rule, incident-report-draft wants
// a report. Producing the same shape for every scenario is why a generic
// analyst scores 50 on half the library.

const RE_CVE = /\bCVE-\d{4}-\d{4,7}\b/gi;

/** Log source inferred from the evidence, used by both the rule and the hunt. */
function logSourceFor(text: string): { product: string; service: string; table: string } {
  if (/\bsshd?\b|auth\.log/i.test(text)) return { product: 'linux', service: 'sshd', table: 'Syslog' };
  if (/\bpowershell\b/i.test(text)) return { product: 'windows', service: 'powershell', table: 'DeviceProcessEvents' };
  if (/\bEntra|AzureAD|SigninLogs|OAuth\b/i.test(text)) return { product: 'azure', service: 'signinlogs', table: 'SigninLogs' };
  if (/\bCloudTrail|\bAWS\b|\bS3\b/i.test(text)) return { product: 'aws', service: 'cloudtrail', table: 'AWSCloudTrail' };
  if (/\bsecurity\s+event|EventID|4624|4625\b/i.test(text)) return { product: 'windows', service: 'security', table: 'SecurityEvent' };
  return { product: 'generic', service: 'application', table: 'DeviceEvents' };
}

function buildSigmaRule(
  text: string,
  facts: IncidentFacts,
  techniques: Array<{ code: string; name: string }>,
  severity: string,
): string[] {
  const src = logSourceFor(text);
  const tags = techniques.slice(0, 3).map((t) => `    - attack.${t.code.toLowerCase()}`);
  const selection: string[] = [];
  if (facts.ips.length) selection.push(`    SourceIp:\n${facts.ips.slice(0, 3).map((i) => `      - '${i}'`).join('\n')}`);
  if (facts.hashes.length) selection.push(`    Hashes:\n${facts.hashes.slice(0, 3).map((h) => `      - '${h}'`).join('\n')}`);
  if (/failed\s+password/i.test(text)) selection.push(`    Message|contains: 'Failed password'`);
  if (/powershell/i.test(text)) selection.push(`    Image|endswith: '\\powershell.exe'`);
  if (selection.length === 0) selection.push(`    EventID: '*'  # widen once a concrete indicator is available`);

  return [
    '```yaml',
    'title: ' + `Detection derived from observed activity (${src.service})`,
    'status: experimental',
    `description: Fires on the behaviour evidenced in this incident. Back-test before enabling.`,
    'logsource:',
    `  product: ${src.product}`,
    `  service: ${src.service}`,
    'detection:',
    '  selection:',
    ...selection,
    '  condition: selection',
    'falsepositives:',
    '  - Legitimate administrative activity from the same source',
    '  - Automated scanners and vulnerability assessment tooling',
    'level: ' + severity.toLowerCase(),
    ...(tags.length ? ['tags:', ...tags] : []),
    '```',
  ];
}

function buildKql(text: string, facts: IncidentFacts): string[] {
  const src = logSourceFor(text);
  const where = facts.ips.length
    ? `| where RemoteIP in (${facts.ips.slice(0, 3).map((i) => `"${i}"`).join(', ')})`
    : `| where isnotempty(DeviceName)`;
  return [
    '```kusto',
    src.table,
    '| where TimeGenerated > ago(30d)',
    where,
    '| summarize Events = count(), FirstSeen = min(TimeGenerated), LastSeen = max(TimeGenerated) by DeviceName, AccountName',
    '| where Events > 5',
    '| order by Events desc',
    '```',
  ];
}

/** Broad family from behaviour. Deliberately a category, not a vendor name. */
function malwareCategory(text: string): string {
  if (/\bransom|encrypt\w+\s+files?/i.test(text)) return 'Ransomware (crypto-locker category)';
  if (/\bkeylog|credential\s+(theft|dump)|mimikatz/i.test(text)) return 'Credential stealer / infostealer';
  if (/\bbeacon|C2|command\s+and\s+control/i.test(text)) return 'Remote access trojan / C2 implant';
  if (/\bminer|xmrig|cryptonight/i.test(text)) return 'Cryptominer';
  if (/\bworm|self.?propagat/i.test(text)) return 'Worm / self-propagating';
  if (/\bdropper|loader|stage\s*2/i.test(text)) return 'Dropper / loader';
  return 'Unclassified — behaviour is insufficient to assign a family without sandbox detonation';
}

// ─── Assembly ────────────────────────────────────────────────────────────────

const PERSONA_VOICE: Record<string, string> = {
  analyst: 'Tier-1 triage',
  ciso: 'Executive summary',
  'ir-lead': 'Incident command',
};

function formatTimeline(facts: IncidentFacts, depth: string): string[] {
  const limit = depth === 'deep' ? 12 : depth === 'basic' ? 4 : 8;
  const lines = facts.timedLines.slice(0, limit);
  if (lines.length === 0) return [];
  const out = lines.map((l) => `- ${l.length > 160 ? l.slice(0, 157) + '…' : l}`);
  if (facts.timedLines.length > limit) {
    out.push(`- …${facts.timedLines.length - limit} further timestamped events in the supplied window.`);
  }
  return out;
}

/**
 * Writes the analysis.
 *
 * `userText` is the whole submitted prompt including the pasted incident, so
 * everything asserted below traces back to something the learner supplied.
 */
export function generateDojo2Analysis(
  userText: string,
  scenarioId: string,
  config: Dojo2Config,
): string {
  const facts = extractIncidentFacts(userText);
  const { attack, atlas } = attributeTechniques(userText, facts);
  const severity = severityOf(facts, config);
  const { auto, gated } = containmentFor(userText, facts);
  const deep = config.analysisDepth === 'deep';
  const terse = config.responseStyle === 'concise';

  // Is there enough here to analyse at all?
  //
  // Without this gate the scenario artifacts below — the Sigma skeleton, the
  // report headings, the false-positive boilerplate — emit whatever was
  // submitted, so "something looked odd on a server today" scored 83 and
  // passed. That is a rubber stamp: it rewards the learner for supplying
  // nothing, and it is the opposite of what the lab is for. An analyst handed
  // no evidence asks for evidence.
  const indicatorCount =
    facts.ips.length + facts.privateIps.length + facts.domains.length + facts.hashes.length + facts.urls.length;
  const hasEvidence =
    facts.timedLines.length >= 2 || indicatorCount > 0 || attack.length > 0 || atlas.length > 0;

  if (!hasEvidence) {
    return [
      `## ${PERSONA_VOICE[config.persona] ?? 'Analysis'} — ${scenarioId}`,
      '',
      'I cannot analyse this. The submission contains no timestamped events, no indicators, and no behaviour I can attribute to a technique, so anything I produced would be invention rather than analysis.',
      '',
      'To triage this, submit the underlying evidence:',
      '- The raw log lines, with timestamps, covering the window in question',
      '- The host and account names involved',
      '- Any network telemetry: source addresses, domains, or file hashes',
      '',
      'Load one of the prebuilt incidents from the control panel if you want a worked example.',
      '',
      `**Confidence**: Low — no evidence was supplied.`,
      `**Risk Level**: Unknown`,
    ].join('\n');
  }

  const S: string[] = [];

  // ── Header and assessment ──────────────────────────────────────────────
  S.push(`## ${PERSONA_VOICE[config.persona] ?? 'Analysis'} — ${scenarioId}`, '');
  S.push(`**Severity: ${severity.level}** — ${severity.why}.`, '');

  const scope = [
    facts.hosts.length ? `${facts.hosts.length} host(s) named (${facts.hosts.slice(0, 3).join(', ')})` : '',
    facts.users.length ? `${facts.users.length} account(s) referenced` : '',
    facts.ips.length ? `${facts.ips.length} external address(es)` : '',
  ].filter(Boolean);
  if (scope.length) S.push(`Scope: ${scope.join('; ')}.`, '');

  S.push(
    facts.succeeded
      ? 'The evidence contains a success marker, so treat this as a confirmed compromise and scope for post-compromise activity.'
      : 'No success marker appears in the supplied window; the activity reads as attempted rather than confirmed.',
    '',
  );

  // ── Timeline ───────────────────────────────────────────────────────────
  const timeline = formatTimeline(facts, config.analysisDepth);
  if (timeline.length) {
    S.push('### Timeline', '');
    S.push(...timeline, '');
    if (facts.timestamps.length >= 2) {
      S.push(`Event sequence spans ${facts.timestamps[0]} to ${facts.timestamps[facts.timestamps.length - 1]}.`, '');
    }
  }

  // ── IOCs, gated on the control that governs them ───────────────────────
  if (config.iocExtraction) {
    const rows: string[] = [];
    if (facts.ips.length) rows.push(`- External IPs: ${facts.ips.join(', ')}`);
    if (facts.privateIps.length) rows.push(`- Internal IPs (do not blocklist, scope these as affected assets): ${facts.privateIps.join(', ')}`);
    if (facts.domains.length) rows.push(`- Domains: ${facts.domains.join(', ')}`);
    if (facts.hashes.length) rows.push(`- File hashes: ${facts.hashes.join(', ')}`);
    if (facts.urls.length) rows.push(`- URLs: ${facts.urls.slice(0, 5).join(', ')}`);
    S.push('### IOCs and indicators', '');
    S.push(
      ...(rows.length
        ? rows
        : ['- No IOCs are extractable from the supplied evidence. Widen the log window or include network telemetry.']),
      '',
    );
  }

  // ── ATT&CK / ATLAS, gated ──────────────────────────────────────────────
  if (config.mitreMapping) {
    S.push('### MITRE mapping', '');
    if (attack.length) {
      S.push(...attack.map((t) => `- ${t.code} — ${t.name}`));
    }
    if (atlas.length) {
      S.push(...atlas.map((t) => `- ${t.code} — ${t.name} (MITRE ATLAS)`));
    }
    if (!attack.length && !atlas.length) {
      S.push('- No technique can be attributed from the supplied evidence without guessing; attribution needs the process or network telemetry.');
    }
    S.push('');
  }

  // ── Threat correlation, gated ──────────────────────────────────────────
  if (config.threatCorrelation) {
    S.push('### Threat actor context', '');
    S.push(
      facts.ips.length
        ? `- Pivot ${facts.ips[0]} in threat intel for known actor infrastructure before attributing. The address alone is weak attribution: infrastructure is rented and reused across unrelated groups.`
        : '- No infrastructure indicators are available to correlate; actor attribution is not supportable from this evidence.',
      '- Correlate against recent campaigns targeting the same asset class and technique set before naming a group.',
      '',
    );
  }

  // ── Scenario-shaped deliverable ────────────────────────────────────────
  // What the task actually asks for. A triage summary is the right artifact
  // for log-triage and nothing else.
  const wantsRule = /detection-rule-gen|threat-hunt|malware-behavior/.test(scenarioId);
  const wantsReport = /incident-report-draft/.test(scenarioId);

  if (scenarioId.includes('malware-behavior')) {
    S.push('### Malware classification', '');
    S.push(`- Category: ${malwareCategory(userText)}`, '');
  }

  if (scenarioId.includes('alert-enrichment')) {
    const cves = uniq(userText.match(RE_CVE));
    S.push('### Enrichment', '');
    S.push(
      cves.length
        ? `- Vulnerability: ${cves.join(', ')} — cross-reference against the asset inventory and current patch status before rating exploitability.`
        : '- No CVE is cited in the supplied evidence; enrichment needs the vulnerability identifier or the affected product version.',
      `- Priority: ${severity.level}, from the evidence above.`,
      '',
    );
  }

  if (scenarioId.includes('threat-hunt')) {
    S.push('### Hunt hypothesis', '');
    S.push(
      `- Falsifiable hypothesis: if this activity is present elsewhere in the estate, ` +
        `${facts.ips.length ? `hosts other than ${facts.hosts[0] ?? 'the affected host'} will show connections to ${facts.ips[0]}` : 'other hosts will show the same process lineage'} ` +
        `within the 30-day window. If the query returns no such hosts, the hypothesis is rejected and the incident stays scoped to what is already known.`,
      '',
    );
  }

  if (wantsRule) {
    const src = logSourceFor(userText);
    S.push('### Detection rule', '');
    S.push(...buildSigmaRule(userText, facts, attack, severity.level), '');
    S.push('### Hunting query', '');
    S.push(...buildKql(userText, facts), '');
    S.push(`Data sources: \`${src.table}\` (${src.product}/${src.service}).`, '');
    S.push('### Trigger logic and false positives', '');
    S.push(
      '- Trigger: the selection block above fires on the evidenced behaviour; the threshold exists to suppress single-event noise.',
      '- False positives: administrative automation, backup agents, and vulnerability scanners commonly reproduce this pattern. Back-test against 30 days of history and tune exclusions before enabling in production.',
      '',
    );
  }

  if (wantsReport) {
    S.push('### Executive summary', '');
    S.push(
      `A ${severity.level.toLowerCase()}-severity incident affecting ` +
        `${facts.hosts.length || 'an undetermined number of'} host(s)` +
        `${facts.users.length ? ` and ${facts.users.length} account(s)` : ''}. ` +
        (facts.succeeded
          ? 'The intrusion succeeded, so business impact must be assumed until scoping proves otherwise: potential unauthorised access to data held on the affected systems, and remediation downtime during rebuild.'
          : 'No success marker is present, so the likely business impact is limited to the cost of investigation and any preventive hardening.'),
      '',
    );
    S.push('### Root cause and kill chain', '');
    S.push(
      `- Kill chain: ${attack.length ? attack.map((t) => t.code).join(' → ') : 'not reconstructable from the supplied evidence'}.`,
      facts.succeeded
        ? '- Root cause: the control that should have stopped this did not. Identify whether the failure was an absent control, a misconfigured one, or one that fired without anyone acting on it — the remediation differs in each case.'
        : '- Root cause: not established. Attempted activity without a success marker does not identify a failed control.',
      '',
    );
    S.push('### Lessons learned', '');
    S.push(
      '- Confirm whether detection fired at the time and, if it did, why it did not result in action.',
      '- Track every remediation item with a named owner and a deadline; unowned actions from a post-incident review do not get done.',
      '- Re-test the control that failed rather than assuming the fix worked.',
      '',
    );
  }

  // ── Response ───────────────────────────────────────────────────────────
  S.push('### Recommended response actions', '');
  S.push('**Safe to automate**');
  S.push(...auto.map((a) => `- ${a}`));
  S.push('', '**Human-gated**');
  S.push(...gated.map((g) => `- ${g}`));
  S.push('');

  if (deep) {
    S.push('### Detection follow-up', '');
    S.push(
      '- Convert this pattern into a scheduled detection and back-test it against 30 days of history to measure the false-positive rate before enabling.',
      '- Record the ATT&CK coverage this adds so the gap analysis stays current.',
      '',
    );
  }

  // ── Verification limits ────────────────────────────────────────────────
  // Several rubrics check for this, and it belongs in any AI-assisted triage:
  // conclusions drawn by a machine enter the incident record as fact unless
  // someone says which ones still need corroborating.
  if (!terse) {
    S.push('### Verification required', '');
    S.push(
      '- This analysis is AI-assisted and pattern-derived. Every conclusion above needs analyst verification against the source telemetry before it drives an irreversible action.',
      '- Corroborate the attribution with a second source; a single log family is not sufficient to confirm intent.',
      '',
    );
  }

  // ── Confidence and risk, required by every Dojo 2 rubric ───────────────
  const confidence = config.confidenceLevel
    ? config.confidenceLevel.charAt(0).toUpperCase() + config.confidenceLevel.slice(1)
    : 'Medium';
  S.push(
    `**Confidence**: ${confidence} — derived from ${facts.timedLines.length} timestamped events and ` +
      `${facts.ips.length + facts.domains.length + facts.hashes.length} extracted indicators.`,
  );
  S.push(`**Risk Level**: ${severity.level}`);

  const body = S.join('\n');

  // ── Output format ──────────────────────────────────────────────────────
  if (config.outputFormat === 'json') {
    return [
      '```json',
      JSON.stringify(
        {
          scenario: scenarioId,
          severity: severity.level,
          confidence,
          confirmedCompromise: facts.succeeded,
          iocs: config.iocExtraction
            ? { ips: facts.ips, internalIps: facts.privateIps, domains: facts.domains, hashes: facts.hashes }
            : undefined,
          mitre: config.mitreMapping ? { attack: attack.map((t) => t.code), atlas: atlas.map((t) => t.code) } : undefined,
          timelineEvents: facts.timedLines.length,
          containment: { automated: auto, humanGated: gated },
        },
        null,
        2,
      ),
      '```',
      '',
      body,
    ].join('\n');
  }

  return body;
}
