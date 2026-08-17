/**
 * lib/dojo2-scenarios.ts
 *
 * Scenario & Data Engine for Dojo 2 (AI-Assisted SOC).
 *
 * Contains:
 * - DOJO2_PREBUILT_SCENARIOS, 56 hand-crafted, SOC-realistic incident scenarios
 *    covering Log Triage, Alert Enrichment, Detection Rule Generation, Incident
 *    Report Draft, and AI System Compromise Triage at Beginner / Intermediate / Advanced difficulty.
 * - generateDojo2Scenario(), runtime generator that produces randomised but
 *    internally consistent incidents across multiple attack types and difficulties.
 * - getDojo2ScenariosByTask(), selector helper used by the UI.
 *
 * Data quality rules (enforced throughout):
 *  • IOCs use valid formats (RFC-compliant IPs, plausible domains, 32/40/64-char hashes)
 *  • All techniques reference real MITRE ATT&CK T-codes
 *  • Logs contain consistent timestamps, host names, and user accounts
 *  • Malicious events are seeded among benign baseline traffic
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type Dojo2TaskType =
  | 'log-triage'
  | 'alert-enrichment'
  | 'detection-rule-gen'
  | 'incident-report-draft'
  | 'threat-hunt'
  | 'malware-behavior'
  // The six below carry full rubrics in lib/quality-rubrics.ts and are real
  // Dojo 2 scenarios in lib/scenarios.ts, but they were missing from this
  // union, so getDojo2ScenariosByTask could never return anything for them and
  // the incident library was permanently empty on six of the twelve labs.
  | 'cloud-identity-abuse'
  | 'ai-system-compromise'
  | 'autonomous-agent-forensics'
  | 'ai-model-abuse'
  | 'adversarial-prompt-forensics'
  | 'ransomware-ai-triage';

export type Dojo2Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type Dojo2AttackCategory =
  | 'Brute Force'
  | 'Phishing'
  | 'Lateral Movement'
  | 'Ransomware'
  | 'C2 Beaconing'
  | 'Credential Dumping'
  | 'DNS Tunneling'
  | 'Supply Chain'
  | 'Cloud Identity Abuse'
  | 'Malware Execution'
  | 'Data Exfiltration'
  | 'LLM Prompt Injection'
  | 'Model Evasion';

export interface Dojo2MitreRef {
  tactic: string;
  techniques: string[]; // e.g. ['T1110.001: Brute Force: Password Guessing']
}

export interface Dojo2IOCs {
  ips: string[];
  domains: string[];
  hashes: string[];
  other?: string[];       // registry keys, filenames, user-agents, etc.
}

export interface Dojo2IncidentScenario {
  id: string;
  title: string;
  taskType: Dojo2TaskType;
  difficulty: Dojo2Difficulty;
  attackCategory: Dojo2AttackCategory;
  mitre: Dojo2MitreRef;
  iocs: Dojo2IOCs;
  /** Short one-sentence prompt shown in the scenario card. */
  description: string;
  /** Full incident data pasted into the chat input when the scenario is loaded. */
  incidentData: string;
  generated?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomHex(len: number): string {
  const chars = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * 16)];
  return out;
}

function randomExtIp(): string {
  const octets = [185, 91, 45, 51, 194, 104, 149, 23, 176, 87];
  return `${octets[Math.floor(Math.random() * octets.length)]}.${rnd(1,250)}.${rnd(1,250)}.${rnd(1,254)}`;
}

function randomIntIp(): string {
  return `10.${rnd(0,5)}.${rnd(0,20)}.${rnd(1,254)}`;
}

function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomUser(): string {
  const names = ['john.smith','jane.doe','mike.chen','sarah.wilson','alex.johnson','emma.davis','chris.brown','lisa.taylor'];
  return names[Math.floor(Math.random() * names.length)];
}

function randomHost(prefix: 'WS' | 'SRV' | 'DC'): string {
  const depts = ['FINANCE','HR','IT','SALES','DEV','OPS','MGMT','RESEARCH'];
  return `${prefix}-${depts[Math.floor(Math.random() * depts.length)]}-${String(rnd(1,30)).padStart(2,'0')}`;
}

function randomDomain(): string {
  const pre  = ['cdn-updates','api-service','secure-login','telemetry','update-check','auth-portal','sync-data','analytics-hub'];
  const mid  = ['microsoft','cloudflare','azure','amazon','office365','google'];
  const tld  = ['net','io','com','org','cc'];
  return `${pre[Math.floor(Math.random()*pre.length)]}.${mid[Math.floor(Math.random()*mid.length)]}-${randomHex(4)}.${tld[Math.floor(Math.random()*tld.length)]}`;
}

function ts(base: Date, plusSeconds: number): string {
  return new Date(base.getTime() + plusSeconds * 1000).toISOString().replace('.000Z', 'Z');
}

// ─── Prebuilt Scenarios ───────────────────────────────────────────────────────
// The incident bodies live in dojo2-incidents.ts so that importing a label or
// a type from here does not drag 260kB of scenario text along with it.


// ─── Scenario Generator ───────────────────────────────────────────────────────

const GEN_USERS    = ['john.smith','jane.doe','mike.chen','sarah.wilson','alex.johnson','emma.davis','chris.brown'];
const GEN_DEPTS    = ['FINANCE','HR','IT','SALES','DEV','OPS','MGMT'];
const GEN_MALWARE  = ['CobaltStrike Beacon 4.x','Emotet v5','BlackCat/ALPHV','LockBit 3.0','Sliver C2','Brute Ratel C4'];
const GEN_RANSOMWARE_EXTS = ['.locked','.blackcat','.lockbit3','.crypt','.enc','.darkside'];

export function generateDojo2Scenario(
  attackCategory: Dojo2AttackCategory,
  difficulty: Dojo2Difficulty,
  taskType?: Dojo2TaskType,
): Dojo2IncidentScenario {
  const extIp   = randomExtIp();
  const intIp1  = randomIntIp();
  const intIp2  = randomIntIp();
  const c2Domain = randomDomain();
  const user    = randomUser();
  const host1   = randomHost('WS');
  const host2   = randomHost('WS');
  const srv     = randomHost('SRV');
  const hash1   = randomHex(64);
  const hash2   = randomHex(40);
  const base    = new Date('2024-03-20T14:00:00Z');

  // Choose task type based on attack category if not specified
  const inferredTask: Dojo2TaskType = taskType ?? (
    attackCategory === 'Malware Execution'
      ? 'malware-behavior'
      : attackCategory === 'LLM Prompt Injection' || attackCategory === 'Model Evasion'
      ? 'threat-hunt'
      : attackCategory === 'C2 Beaconing' || attackCategory === 'DNS Tunneling' || attackCategory === 'Credential Dumping'
      ? 'detection-rule-gen'
      : attackCategory === 'Supply Chain' || attackCategory === 'Cloud Identity Abuse' || attackCategory === 'Phishing'
      ? 'alert-enrichment'
      : 'log-triage'
  );

  // ── Brute Force ────────────────────────────────────────────────────────────
  if (attackCategory === 'Brute Force') {
    const numFails = difficulty === 'beginner' ? 8 : difficulty === 'intermediate' ? 22 : 80;
    const targetUser = ['svcadmin','helpdesk','backup_svc','api_user'][rnd(0,3)];
    let logs = `INCIDENT: SSH Authentication Log, ${srv}\nAnalyze the following auth log and determine if a breach occurred.\n\n`;
    const commonUsers = ['admin','root','ubuntu','test','backup','user'];
    for (let i = 0; i < numFails; i++) {
      const u = i < 4 ? 'invalid user ' + commonUsers[i % commonUsers.length] : targetUser;
      logs += `${ts(base, i * 2)} sshd[${4800+i}]: Failed password for ${u} from ${extIp} port ${50000+i} ssh2\n`;
    }
    logs += `${ts(base, numFails * 2)} sshd[${4800+numFails}]: Accepted password for ${targetUser} from ${extIp} port ${50000+numFails} ssh2\n`;
    logs += `${ts(base, numFails * 2)} sshd[${4800+numFails}]: pam_unix(sshd:session): session opened for user ${targetUser} by (uid=0)\n`;
    if (difficulty !== 'beginner') {
      logs += `${ts(base, numFails*2+8)} sudo[${5000+numFails}]: ${targetUser} : USER=root ; COMMAND=/bin/bash\n`;
    }
    if (difficulty === 'advanced') {
      logs += `${ts(base, numFails*2+20)} useradd[${5100+numFails}]: new user: name=svc-maint, UID=1337, by root\n`;
      logs += `${ts(base, numFails*2+25)} sshd[${5200+numFails}]: Accepted publickey for svc-maint from ${extIp} port ${50100+numFails} ssh2\n`;
    }
    logs += `\nIdentify: attack type, total attempts, breach outcome, post-compromise activity, and provide IOCs + containment steps.`;

    return {
      id: `GEN-BF-${randomHex(6).toUpperCase()}`,
      title: `[Generated] SSH Brute Force, ${srv}`,
      taskType: inferredTask,
      difficulty,
      attackCategory: 'Brute Force',
      mitre: { tactic: 'Credential Access', techniques: ['T1110.001: Brute Force: Password Guessing'] },
      iocs: { ips: [extIp], domains: [], hashes: [] },
      description: `Generated: SSH brute-force log from ${srv}. ${numFails} failed attempts before success. ${difficulty} difficulty.`,
      incidentData: logs,
      generated: true,
    };
  }

  // ── Phishing ───────────────────────────────────────────────────────────────
  if (attackCategory === 'Phishing') {
    const doc = ['Invoice_Q1_2024.xlsm','Contract_Amendment.docm','Salary_Review.xlsm','Purchase_Order_8821.docm'][rnd(0,3)];
    let data = `INCIDENT: Phishing Alert, ${host1}\nUser: ${user}@corp.internal | Timestamp: ${ts(base,0)}\n\n`;
    data += `FROM: "Finance Team" <billing@${randomDomain()}>\n`;
    data += `TO: ${user}@corp.internal\n`;
    data += `SUBJECT: ${['URGENT: Payment Required','Invoice Overdue: Action Required','Q1 Budget Approval Needed','Contract Signature Deadline'][rnd(0,3)]}\n\n`;
    data += `ATTACHMENT: ${doc}\n  SHA256: ${hash1}\n  Macro: YES | Signed: NO\n\n`;
    data += `Sender IP: ${extIp} | AbuseIPDB score: ${rnd(85,100)}/100\n`;
    data += `SPF: FAIL | DKIM: FAIL | DMARC: FAIL\n`;
    if (difficulty !== 'beginner') {
      data += `\n=== ENDPOINT TELEMETRY (${host1}) ===\n`;
      data += `${ts(base,120)} EXCEL.EXE opened: ${doc}\n`;
      data += `${ts(base,128)} EXCEL.EXE → CMD.EXE (PID ${rnd(7000,9000)})\n`;
      data += `${ts(base,130)} CMD.EXE → PowerShell.exe -ep bypass -enc [base64]\n`;
      data += `${ts(base,135)} Network connection to ${extIp}:443, C2 channel: ${c2Domain}\n`;
      data += `${ts(base,138)} File dropped: C:\\Users\\${user}\\AppData\\Roaming\\${randomHex(8)}.exe (SHA256: ${hash2})\n`;
    }
    if (difficulty === 'advanced') {
      data += `\n=== LATERAL MOVEMENT ===\n`;
      data += `${ts(base,300)} ${host1} → SMB → ${host2}\\ADMIN$\n`;
      data += `${ts(base,310)} Beacon deployed on ${host2}\n`;
      data += `${ts(base,320)} C2 beacon interval: ~60s ±30% jitter to ${c2Domain}\n`;
      data += `${ts(base,600)} Domain enumeration: net user /domain, net group "Domain Admins" /domain\n`;
    }
    data += `\nEnrich this alert: classify attack, map to MITRE ATT&CK, extract all IOCs, determine execution outcome, and recommend containment.`;

    return {
      id: `GEN-PH-${randomHex(6).toUpperCase()}`,
      title: `[Generated] Phishing, ${user}@corp`,
      taskType: inferredTask,
      difficulty,
      attackCategory: 'Phishing',
      mitre: { tactic: 'Initial Access', techniques: ['T1566.001: Phishing: Spearphishing Attachment', 'T1204.002: User Execution: Malicious File'] },
      iocs: { ips: [extIp], domains: [c2Domain], hashes: [hash1] },
      description: `Generated: Phishing email targeting ${user}@corp.internal with macro-enabled attachment. ${difficulty} difficulty.`,
      incidentData: data,
      generated: true,
    };
  }

  // ── Malware Execution ──────────────────────────────────────────────────────
  if (attackCategory === 'Malware Execution') {
    const malware = GEN_MALWARE[rnd(0, GEN_MALWARE.length - 1)];
    let data = `INCIDENT: Malware Execution Alert\nHost: ${host1} (${intIp1}) | Malware: ${malware}\nTimestamp: ${ts(base,0)}\n\n`;
    data += `=== EDR DETECTION ===\n`;
    data += `${ts(base,0)} Process created: C:\\Windows\\Temp\\${randomHex(8)}.exe (SHA256: ${hash1})\n`;
    data += `  Parent: ${['WINWORD.EXE','EXCEL.EXE','OUTLOOK.EXE','mshta.exe'][rnd(0,3)]}\n`;
    data += ` Signature: ${malware} variant, confidence HIGH\n`;
    data += `${ts(base,5)} Network: ${intIp1}:${rnd(49152,65535)} → ${extIp}:443 (${c2Domain}) ESTABLISHED\n`;
    data += `${ts(base,10)} Registry: HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\ = "${randomHex(8)}.exe"\n`;
    data += `${ts(base,15)} File: C:\\Users\\${user}\\AppData\\Roaming\\${randomHex(8)}.dll created (MD5: ${randomHex(32)})\n`;
    if (difficulty !== 'beginner') {
      data += `${ts(base,60)} Process injection: ${randomHex(8)}.exe → svchost.exe (PID ${rnd(800,4000)})\n`;
      data += `  Technique: Process Hollowing (PE overwrite)\n`;
      data += `${ts(base,120)} Beacon interval: 60s ±15% | JA3: ${randomHex(32)}\n`;
    }
    if (difficulty === 'advanced') {
      data += `\n=== LATERAL SPREAD ===\n`;
      data += `${ts(base,300)} ${host1} → WMI → ${host2}: remote payload execution\n`;
      data += `${ts(base,310)} ${host2}: same ${malware} hash detected\n`;
      data += `${ts(base,600)} Kerberoast attempt: 3 SPN service accounts targeted\n`;
    }
    data += `\nAnalyze this malware execution: identify the malware family, map to MITRE ATT&CK, extract IOCs, determine scope of infection, and provide eradication steps.`;

    return {
      id: `GEN-MW-${randomHex(6).toUpperCase()}`,
      title: `[Generated] Malware: ${malware}, ${host1}`,
      taskType: inferredTask,
      difficulty,
      attackCategory: 'Malware Execution',
      mitre: { tactic: 'Execution / C2', techniques: ['T1204: User Execution', 'T1055: Process Injection', 'T1071.001: C2 Web Protocol'] },
      iocs: { ips: [extIp, intIp1], domains: [c2Domain], hashes: [hash1] },
      description: `Generated: ${malware} detected on ${host1}. Process injection + C2 beacon + persistence. ${difficulty} difficulty.`,
      incidentData: data,
      generated: true,
    };
  }

  // ── Ransomware ─────────────────────────────────────────────────────────────
  if (attackCategory === 'Ransomware') {
    const ext = GEN_RANSOMWARE_EXTS[rnd(0, GEN_RANSOMWARE_EXTS.length - 1)];
    const fileCount = rnd(8000, 25000);
    let data = `INCIDENT: Ransomware Deployment\nHost: ${host1} (${intIp1}) | User: ${user}\nTimestamp: ${ts(base,0)}\n\n`;
    data += `=== DEFENSE EVASION ===\n`;
    data += `${ts(base,0)} vssadmin.exe delete shadows /all /quiet\n`;
    data += `${ts(base,2)} wbadmin.exe delete catalog -quiet\n`;
    data += `${ts(base,4)} bcdedit.exe /set {default} recoveryenabled No\n`;
    data += `\n=== DATA EXFILTRATION (Double Extortion) ===\n`;
    const exfilMB = rnd(300, 1200);
    data += `${ts(base,120)} Outbound HTTPS → ${extIp}:443 (${c2Domain})\n`;
    data += `  Bytes out: ${(exfilMB * 1024 * 1024).toLocaleString()} (~${exfilMB} MB) | Duration: ${rnd(900,3600)}s\n`;
    if (difficulty !== 'beginner') {
      data += `\n=== LATERAL MOVEMENT ===\n`;
      data += `${ts(base,600)} SMB: ${host1} → \\\\${intIp2}\\ADMIN$ | File: ${randomHex(8)}.exe (SHA256: ${hash1})\n`;
      data += `${ts(base,620)} ${host2} (${intIp2}): payload executed\n`;
    }
    data += `\n=== ENCRYPTION EVENT ===\n`;
    data += `${ts(base,900)} Mass rename: ${fileCount.toLocaleString()} files → *${ext}\n`;
    data += `${ts(base,902)} Ransom note: C:\\Users\\Public\\Desktop\\README${ext}.txt\n`;
    if (difficulty === 'advanced') {
      data += `${ts(base,910)} Encryption also triggered on ${host2}: ${rnd(5000,15000).toLocaleString()} files\n`;
      data += `${ts(base,920)} Domain controller backup share targeted: \\\\DC01\\SYSVOL\n`;
    }
    data += `\nAnalyze this ransomware incident: identify the ransomware family if possible, map to MITRE ATT&CK, extract IOCs, estimate the full blast radius, and provide an IR action plan.`;

    return {
      id: `GEN-RW-${randomHex(6).toUpperCase()}`,
      title: `[Generated] Ransomware, ${host1}`,
      taskType: inferredTask,
      difficulty,
      attackCategory: 'Ransomware',
      mitre: { tactic: 'Impact', techniques: ['T1486: Data Encrypted for Impact', 'T1490: Inhibit System Recovery', 'T1048: Exfil Over Alternative Protocol'] },
      iocs: { ips: [extIp], domains: [c2Domain], hashes: [hash1] },
      description: `Generated: Ransomware deployment on ${host1}. Shadow copy deletion, ${exfilMB} MB exfil, ${fileCount.toLocaleString()} files encrypted. ${difficulty} difficulty.`,
      incidentData: data,
      generated: true,
    };
  }

  // ── C2 Beaconing ───────────────────────────────────────────────────────────
  if (attackCategory === 'C2 Beaconing') {
    const jitter = rnd(10, 40);
    const interval = rnd(30, 180);
    const ja3 = randomHex(32);
    const uri = ['/jquery-3.3.1.min.js', '/updates/check', '/api/v1/heartbeat', '/cdn/assets/main.js'][rnd(0,3)];
    let data = `TASK: Detection Rule Generation: C2 Beaconing\n`;
    data += `Source: Network flow analysis + Sysmon logs | Host: ${host1} (${intIp1})\n\n`;
    data += `=== BEHAVIORAL PROFILE ===\n`;
    data += `Beacon destination: ${extIp}:443 (${c2Domain})\n`;
    data += `Beacon interval: ~${interval}s ± ${jitter}% jitter (${Math.round(interval*(1-jitter/100))} ${Math.round(interval*(1+jitter/100))}s range)\n`;
    data += `Protocol: HTTPS/443 | JA3: ${ja3}\n`;
    data += `User-Agent: Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)\n`;
    data += `URI Pattern: ${uri}, /api/v2/status\n\n`;
    data += `=== SYSMON PROCESS CHAIN ===\n`;
    data += `EXCEL.EXE → CMD.EXE → PowerShell.exe → rundll32.exe loading ${randomHex(8)}.dll from %TEMP%\n`;
    data += `Named pipe: \\\\.\\pipe\\MSSE-${rnd(1000,9999)}-server\n`;
    data += `File hash (implant DLL): ${hash1}\n\n`;
    data += `=== NETWORK BASELINE (same host, prior 7 days) ===\n`;
    data += `Normal connections: office365.com, windows.net, corp.internal, no unknown external IPs\n`;
    data += `Normal intervals: irregular (user-driven), NOT periodic\n\n`;
    data += `Generate detection rules:\n1. Sigma rule for the process chain (EXCEL→CMD→PS→rundll32)\n2. Network rule detecting periodic beaconing (interval regularity + JA3 hash)\n3. Tuning guidance and false-positive notes`;

    return {
      id: `GEN-C2-${randomHex(6).toUpperCase()}`,
      title: `[Generated] C2 Beacon Detection, ${host1}`,
      taskType: inferredTask,
      difficulty,
      attackCategory: 'C2 Beaconing',
      mitre: { tactic: 'C2 / Execution', techniques: ['T1071.001: C2 Web Protocol', 'T1059.001: PowerShell', 'T1055: Process Injection'] },
      iocs: { ips: [extIp], domains: [c2Domain], hashes: [hash1], other: [`JA3: ${ja3}`, `Named pipe: MSSE-*-server`] },
      description: `Generated: C2 beacon at ~${interval}s intervals to ${c2Domain}. JA3 + process chain indicators. ${difficulty} difficulty.`,
      incidentData: data,
      generated: true,
    };
  }

  // ── Credential Dumping ─────────────────────────────────────────────────────
  if (attackCategory === 'Credential Dumping') {
    let data = `TASK: Detection Rule Generation: Credential Dumping\n`;
    data += `Host: ${host1} (${intIp1}) | Attacker has SYSTEM\n\n`;
    data += `=== LSASS ACCESS OBSERVED ===\n`;
    data += `Sysmon EventID=10: taskmgr.exe → lsass.exe | GrantedAccess: 0x1fffff\n`;
    data += `Sysmon EventID=10: ${randomHex(8)}.exe → lsass.exe | GrantedAccess: 0x1010\n`;
    data += `Sysmon EventID=1: rundll32.exe comsvcs.dll, MiniDump ${rnd(500,900)} C:\\Windows\\Temp\\out.dmp full\n`;
    data += `File created: C:\\Windows\\Temp\\lsass.dmp (SHA256: ${hash1})\n`;
    if (difficulty !== 'beginner') {
      data += `\n=== DCSYNC (${host1} → DC-01) ===\n`;
      data += `Security EventID=4662 on DC01:\n`;
      data += `  Properties: {1131f0aa-9c07-11d1-f79f-00c04fc2dcd2} DS-Replication-Get-Changes\n`;
      data += `  Properties: {1131f0ad-9c07-11d1-f79f-00c04fc2dcd2} DS-Replication-Get-Changes-All\n`;
      data += ` SubjectAccount: ${host1}$ (machine account, NOT a DC)\n`;
    }
    if (difficulty === 'advanced') {
      data += `\n=== GOLDEN TICKET INDICATORS ===\n`;
      data += `EventID=4769: krbtgt Kerberos ticket with RC4 encryption (0x17) from ${intIp1}\n`;
      data += `EventID=4624: Logon with ticket lifetime >10h (Golden Ticket default)\n`;
    }
    data += `\nGenerate detection rules covering all LSASS dump methods and DCSync. Include the comsvcs.dll LOLBAS bypass specifically.`;

    return {
      id: `GEN-CD-${randomHex(6).toUpperCase()}`,
      title: `[Generated] Credential Dumping, ${host1}`,
      taskType: inferredTask,
      difficulty,
      attackCategory: 'Credential Dumping',
      mitre: { tactic: 'Credential Access', techniques: ['T1003.001: LSASS Memory', 'T1003.006: DCSync'] },
      iocs: { ips: [intIp1], domains: [], hashes: [hash1], other: ['comsvcs.dll MiniDump', 'GrantedAccess 0x1010 / 0x1fffff'] },
      description: `Generated: LSASS dump + DCSync on ${host1}. Includes LOLBAS comsvcs.dll bypass. ${difficulty} difficulty.`,
      incidentData: data,
      generated: true,
    };
  }

  // ── DNS Tunneling ──────────────────────────────────────────────────────────
  if (attackCategory === 'DNS Tunneling') {
    const qps = rnd(40, 100);
    const avgLen = rnd(70, 120);
    let data = `TASK: Detection Rule Generation: DNS Tunneling\n`;
    data += `Source: ${host1} (${intIp1}) | Target: ns1.${c2Domain}\n\n`;
    data += `=== SAMPLE QUERIES ===\n`;
    const b64samples = ['aGVsbG8gd29ybGQ=','dGhpcyBpcyBhIHRlc3Q=','cGF5bG9hZCBkYXRh','ZXhhbXBsZURhdGE=','c2Vuc2l0aXZlRGF0YQ=='];
    for (const s of b64samples) data += `TXT QUERY: ${s}.${c2Domain}\n`;
    data += `[... ${rnd(2000,4000)} further similar queries in 45 minutes ...]\n\n`;
    data += `=== STATISTICAL ANOMALIES vs BASELINE ===\n`;
    data += `Query rate:         ${qps}/min       (baseline: <5/min)\n`;
    data += `Avg subdomain len:  ${avgLen} chars   (baseline: <30)\n`;
    data += `TXT record ratio:   ${rnd(88,97)}%   (baseline: <2%)\n`;
    data += `Subdomain entropy:  ${(rnd(42,52)/10).toFixed(1)} bits/char (baseline: ~2.1)\n`;
    data += `\nGenerate: Sigma rule (statistical thresholds) + Zeek script (entropy-based) + tuning notes.`;

    return {
      id: `GEN-DT-${randomHex(6).toUpperCase()}`,
      title: `[Generated] DNS Tunneling, ${host1}`,
      taskType: inferredTask,
      difficulty,
      attackCategory: 'DNS Tunneling',
      mitre: { tactic: 'Exfiltration / C2', techniques: ['T1048.003: Exfil Over DNS', 'T1071.004: C2: DNS'] },
      iocs: { ips: [intIp1], domains: [c2Domain], hashes: [] },
      description: `Generated: DNS tunneling via TXT queries at ${qps}/min. Avg subdomain ${avgLen} chars. ${difficulty} difficulty.`,
      incidentData: data,
      generated: true,
    };
  }

  // ── Supply Chain ────────────────────────────────────────────────────────────
  if (attackCategory === 'Supply Chain') {
    const pkg = ['log4j-core-2.14.1.jar','openssl-1.0.2t.dll','netsync-agent-3.2.1.exe','update-helper-x64.msi'][rnd(0,3)];
    const legitimateHash = randomHex(64);
    let data = `INCIDENT: Supply Chain Compromise: Trojanised Software Package\n`;
    data += `Scope: ${srv}, ${host1} (${intIp1}) | Duration: ${rnd(24,72)} hours undetected\n`;
    data += `Incident ID: INC-2024-${rnd(1000,9999)} | Classification: CRITICAL\n\n`;
    data += `=== SUPPLY CHAIN ENTRY POINT ===\n`;
    data += `Trojanised package: ${pkg}\n`;
    data += `Expected SHA256:   ${legitimateHash}\n`;
    data += `Compromised SHA256: ${hash1}\n`;
    data += `[ANOMALY] Compile timestamp: ${ts(base,-7*24*3600)} | Code-signing cert date: ${ts(base,-90*24*3600)}, MISMATCH\n`;
    data += `Installed via auto-update on ${ts(base,0)} | DLL loaded: ${ts(base,30)}\n\n`;
    data += `=== INITIAL C2 CALLBACK ===\n`;
    data += `${ts(base,60)} rundll32.exe → ${extIp}:443 (${c2Domain})\n`;
    data += `Beacon size: 4096 bytes | JA3: ${randomHex(32)}\n`;
    data += `Traffic masqueraded as vendor telemetry\n\n`;
    if (difficulty !== 'beginner') {
      data += `=== PRIVILEGE ESCALATION + CREDENTIAL THEFT ===\n`;
      data += `${ts(base,3600)} EventID=4769: RC4-encrypted Kerberos ticket requested for krbtgt (org policy: AES256 only)\n`;
      data += `${ts(base,3660)} ntdsutil "ac i ntds" "ifm" "create full C:\\Windows\\Temp\\ntds_bk" q q\n`;
      data += `File created: C:\\Windows\\Temp\\ntds_bk\\ntds.dit (${rnd(40,120)}.${rnd(1,9)} MB) | Hash: ${hash2}\n`;
      data += `${ts(base,3720)} Exfil: SMTP relay → ${extIp} | Attachment: ntds.dit (${rnd(40,120)} MB)\n\n`;
    }
    if (difficulty === 'advanced') {
      data += `=== LATERAL MOVEMENT + PERSISTENCE ===\n`;
      data += `${ts(base,7200)} Service installed: "${['WindowsUpdateHelper','SolarWindsOrion','TelemetryCollector'][rnd(0,2)]}" (SYSTEM)\n`;
      data += `${ts(base,7260)} Pass-the-hash: ${srv} → ${host2} (${intIp2}) → DC01\n`;
      data += `${ts(base,7320)} Golden Ticket forged, krbtgt hash obtained from NTDS.dit\n`;
      data += `${ts(base,7380)} AD enumeration: all users, groups, GPOs, OUs exfiltrated\n\n`;
    }
    data += `Analyze this incident: identify the initial compromise vector, map the full kill chain to MITRE ATT&CK, extract every IOC, assess blast radius, and provide a prioritised remediation plan.`;

    return {
      id: `GEN-SC-${randomHex(6).toUpperCase()}`,
      title: `[Generated] Supply Chain Compromise, ${pkg.split('-')[0]}`,
      taskType: inferredTask,
      difficulty,
      attackCategory: 'Supply Chain',
      mitre: {
        tactic: 'Initial Access / Credential Access / Exfiltration',
        techniques: ['T1195.002: Supply Chain Compromise', 'T1071.001: C2 Web Protocol', 'T1003.003: NTDS Credential Dumping'],
      },
      iocs: { ips: [extIp, intIp1], domains: [c2Domain], hashes: [hash1, hash2] },
      description: `Generated: Trojanised package "${pkg}" with C2 callback and credential exfiltration. ${difficulty} difficulty.`,
      incidentData: data,
      generated: true,
    };
  }

  // ── Cloud Identity Abuse ────────────────────────────────────────────────────
  if (attackCategory === 'Cloud Identity Abuse') {
    const appId = `${randomHex(8)}-${randomHex(4)}-${randomHex(4)}-${randomHex(4)}-${randomHex(12)}`;
    const appName = ['Microsoft Teams Meeting Add-in','OneDrive Sync Tool','SharePoint Integration Helper','Azure AD Connect Utility'][rnd(0,3)];
    const emailsRead = rnd(5000, 20000);
    const rogueAdmin = `it-support-${randomHex(4)}@corp.com`;
    let data = `INCIDENT: Cloud Identity Abuse: OAuth Consent Phishing\n`;
    data += `Platform: Microsoft 365 / Azure AD | Affected User: ${user}@corp.com\n`;
    data += `Detection: Microsoft Sentinel | Timestamp: ${ts(base,0)}\n\n`;
    data += `=== ALERT 1: Suspicious OAuth App Consent ===\n`;
    data += `App Name: "${appName}"\n`;
    data += `App ID: ${appId}\n`;
    data += `Publisher: ${['Microsott Corp (typosquat)','Azure Team LLC (unverified)','Cloud Security Inc. (not Microsoft)'][rnd(0,2)]}\n`;
    data += `Permissions Granted: Mail.ReadWrite, Files.ReadWrite.All, offline_access\n`;
    data += `Consent IP: ${extIp} (unexpected country)\n`;
    data += `User-Agent: Mozilla/5.0 Python-urllib/3.${rnd(8,11)}\n\n`;
    data += `=== ALERT 2: Impossible Travel Detected ===\n`;
    data += `User: ${user}@corp.com\n`;
    data += `Location 1: ${ts(base,0)}, authenticated from corporate office\n`;
    data += `Location 2: ${ts(base,900)}, authenticated from ${extIp} (${rnd(4000,9000)} km away)\n`;
    data += `Time delta: 15 minutes, PHYSICALLY IMPOSSIBLE\n\n`;
    if (difficulty !== 'beginner') {
      data += `=== ALERT 3: Graph API Mass Data Read ===\n`;
      data += `${ts(base,1320)} App: ${appId}\n`;
      data += `GET /v1.0/me/messages?$top=999 × ${rnd(10,20)} calls\n`;
      data += `Messages read: ${emailsRead.toLocaleString()} | Duration: ${rnd(3,8)} min\n`;
      data += `Exfil destination: ${extIp} (${c2Domain})\n\n`;
      data += `=== ALERT 4: Rogue Global Administrator Created ===\n`;
      data += `${ts(base,1680)} Actor: ${user}@corp.com (compromised OAuth token)\n`;
      data += `New account: ${rogueAdmin}\n`;
      data += `Roles: Global Administrator, Exchange Administrator\n`;
      data += `MFA Status: NOT CONFIGURED\n\n`;
    }
    if (difficulty === 'advanced') {
      data += `=== ALERT 5: Bulk SharePoint Download ===\n`;
      data += `${ts(base,2040)} Actor: ${rogueAdmin}\n`;
      data += `Sites: HR-Confidential, Finance-Board-${new Date().getFullYear()}, M&A-Pipeline\n`;
      data += `Files: ${rnd(1000,3000).toLocaleString()} files (${rnd(10,50)}.${rnd(1,9)} GB) → ${extIp}\n\n`;
      data += `=== THREAT INTEL (Needs Enrichment) ===\n`;
      data += `${extIp}, [PENDING ENRICHMENT]\n`;
      data += `App ID ${appId.slice(0,8)}, [PENDING ENRICHMENT]\n\n`;
    }
    data += `Enrich this Sentinel incident: classify the full attack chain (initial access → exfiltration), enrich all IOCs, identify persistence mechanisms established, assess data exposure, and outline emergency containment steps.`;

    return {
      id: `GEN-CI-${randomHex(6).toUpperCase()}`,
      title: `[Generated] OAuth Token Theft, ${user}@corp`,
      taskType: inferredTask,
      difficulty,
      attackCategory: 'Cloud Identity Abuse',
      mitre: {
        tactic: 'Credential Access / Collection / Persistence',
        techniques: ['T1528: Steal Application Access Token', 'T1530: Data from Cloud Storage', 'T1136.003: Create Account: Cloud Account'],
      },
      iocs: { ips: [extIp], domains: [c2Domain], hashes: [], other: [`App ID: ${appId}`, `Rogue admin: ${rogueAdmin}`] },
      description: `Generated: OAuth consent phishing → ${emailsRead.toLocaleString()} emails read → rogue Global Admin created. ${difficulty} difficulty.`,
      incidentData: data,
      generated: true,
    };
  }

  // ── Lateral Movement (default/fallback) ────────────────────────────────────
  const data = `INCIDENT: Lateral Movement Detected\n` +
    `Source: ${host1} (${intIp1}) → Targets: ${host2} (${intIp2}), ${srv}\n` +
    `Account: ${user} | Timestamp: ${ts(base,0)}\n\n` +
    `[Security] EventID=4648: ${user} → ${host2} (Type 3 Network Logon)\n` +
    `[Sysmon] EventID=1: powershell.exe -EncodedCommand [base64] -NoProfile -W Hidden\n` +
    `  Parent: WmiPrvSE.exe (WMI execution)\n` +
    `[Sysmon] EventID=3: powershell.exe → ${extIp}:443 (${c2Domain})\n` +
    `[Security] EventID=4672: ${user}, SeDebugPrivilege assigned\n` +
    `[Security] EventID=4648: ${user} → ${srv} (Type 3 Network Logon)\n` +
    `[Sysmon] EventID=10: powershell.exe → lsass.exe (GrantedAccess: 0x1010)\n\n` +
    `Analyze this lateral movement: reconstruct the attack path, map to MITRE ATT&CK, extract IOCs, and provide containment steps.`;

  return {
    id: `GEN-LM-${randomHex(6).toUpperCase()}`,
    title: `[Generated] Lateral Movement, ${host1} → ${host2}`,
    taskType: inferredTask,
    difficulty,
    attackCategory: 'Lateral Movement',
    mitre: { tactic: 'Lateral Movement / Credential Access', techniques: ['T1021.006: WMI', 'T1059.001: PowerShell', 'T1003.001: LSASS'] },
    iocs: { ips: [extIp, intIp1, intIp2], domains: [c2Domain], hashes: [] },
    description: `Generated: WMI-based lateral movement from ${host1} to ${host2}. PowerShell C2 + LSASS access. ${difficulty} difficulty.`,
    incidentData: data,
    generated: true,
  };
}

// ─── Selectors ────────────────────────────────────────────────────────────────

// Selector helpers live in dojo2-incidents.ts alongside the data they read.

export const DOJO2_ATTACK_CATEGORIES: Dojo2AttackCategory[] = [
  'Brute Force',
  'Phishing',
  'Lateral Movement',
  'Ransomware',
  'C2 Beaconing',
  'Credential Dumping',
  'DNS Tunneling',
  'Malware Execution',
  'Supply Chain',
  'Cloud Identity Abuse',
  'Data Exfiltration',
  'LLM Prompt Injection',
  'Model Evasion',
];

export const DOJO2_TASK_LABELS: Record<Dojo2TaskType, string> = {
  'log-triage':           'Log Triage',
  'alert-enrichment':     'Alert Enrichment',
  'detection-rule-gen':   'Detection Rule Gen',
  'incident-report-draft':'Incident Report',
  'threat-hunt':          'Threat Hunt',
  'malware-behavior':     'Malware Analysis',
  'cloud-identity-abuse':        'Cloud Identity Abuse',
  'ai-system-compromise':        'AI System Compromise',
  'autonomous-agent-forensics':  'Agent Forensics',
  'ai-model-abuse':              'Model Abuse',
  'adversarial-prompt-forensics':'Prompt Forensics',
  'ransomware-ai-triage':        'Ransomware Triage',
};

/** Shared persona display labels, single source of truth for both panels. */
export const DOJO2_PERSONA_LABELS: Record<string, string> = {
  analyst:  'SOC Analyst',
  ciso:     'CISO',
  'ir-lead':'IR Lead',
};

/**
 * Tailwind badge classes for difficulty levels, shared by ControlPanel and ScenarioPicker
 * so colour changes only need to be made in one place.
 */
export const DIFFICULTY_BADGE_CLASSES: Record<string, string> = {
  beginner:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  advanced:     'bg-red-500/10 text-red-400 border-red-500/30',
};
