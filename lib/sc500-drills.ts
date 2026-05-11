/**
 * SC-500 Portal Drills — interactive click-path simulations of Microsoft
 * security portals. Each drill is a sequence of "screens" (multiple-choice
 * picks) that mimic the menu/wizard flow you'd see in Entra, Defender XDR,
 * Sentinel, Defender for Cloud, Purview, Azure OpenAI, and Security Copilot.
 *
 * Built so the user can practice the click-paths SC-500 case studies test
 * without provisioning a tenant.
 */

export interface DrillStep {
  /** Title shown above the screen (mimics the portal breadcrumb / pane heading). */
  screen: string;
  /** Optional short description of the current state ("You are here…"). */
  prompt?: string;
  /** Question / instruction shown to the user. */
  question: string;
  /** Multiple-choice options the user picks from. */
  options: string[];
  /** Index of the correct option. */
  correct: number;
  /** Short explanation shown after the user picks. */
  explanation: string;
}

export interface Drill {
  id: string;
  portal: 'Entra' | 'Defender XDR' | 'Sentinel' | 'Defender for Cloud' | 'Purview' | 'Azure OpenAI' | 'Security Copilot';
  title: string;
  /** Scenario / business goal. */
  scenario: string;
  /** Difficulty tag for filtering. */
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: DrillStep[];
}

export const SC500_DRILLS: Drill[] = [

  // ── Drill 1 — Entra: Conditional Access for Admins ─────────────────────────
  {
    id: 'drill-ca-admins',
    portal: 'Entra',
    title: 'Create a CA policy: require phishing-resistant MFA for Global Admins',
    scenario: 'You are a Security Administrator. The CISO requires that all Global Administrators sign in with phishing-resistant MFA (FIDO2 / Windows Hello / Passkey). Build the Conditional Access policy.',
    difficulty: 'intermediate',
    steps: [
      {
        screen: 'entra.microsoft.com',
        prompt: 'You just signed in to the Entra admin center. The left rail shows ~12 top-level items.',
        question: 'Which navigation path opens the Conditional Access policy list?',
        options: [
          'Identity → Users → Active users',
          'Identity → Protection → Conditional Access',
          'Identity governance → Access reviews',
          'Identity → Applications → App registrations',
        ],
        correct: 1,
        explanation: 'Conditional Access lives under Protection (formerly "Security"). The path is: Identity → Protection → Conditional Access → Policies.',
      },
      {
        screen: 'Conditional Access · Policies',
        prompt: 'You see a list of existing policies and a top toolbar.',
        question: 'Which button starts a new policy from scratch?',
        options: [
          'New policy from template',
          'New policy',
          'Named locations',
          'What If',
        ],
        correct: 1,
        explanation: '"New policy" creates a blank policy. "New policy from template" uses Microsoft pre-built baselines — useful but the question said *build* it.',
      },
      {
        screen: 'New policy · Assignments → Users',
        question: 'How should you target only Global Administrators?',
        options: [
          'Include All users',
          'Include Users and groups → All guest and external users',
          'Include Directory roles → Global Administrator',
          'Include Workload identities',
        ],
        correct: 2,
        explanation: 'Directory roles lets you target the role itself, so the policy automatically follows whoever holds the role today and in the future. Adding users individually would drift.',
      },
      {
        screen: 'New policy · Assignments → Target resources',
        question: 'What is the safest scope for an admin-MFA policy?',
        options: [
          'Cloud apps → Select apps → Microsoft Graph only',
          'Cloud apps → All cloud apps',
          'User actions → Register security information',
          'Authentication context → c1',
        ],
        correct: 1,
        explanation: 'Admins authenticate to many apps. "All cloud apps" guarantees MFA on every sign-in. Narrower scopes leave gaps.',
      },
      {
        screen: 'New policy · Access controls → Grant',
        question: 'Which grant control enforces FIDO2 / Windows Hello / Passkey specifically?',
        options: [
          'Require multifactor authentication',
          'Require authentication strength → Phishing-resistant MFA',
          'Require compliant device',
          'Require approved client app',
        ],
        correct: 1,
        explanation: '"Require multifactor authentication" accepts SMS / phone call (phishable). Authentication Strengths lets you require a *specific* MFA method — choose the built-in "Phishing-resistant MFA".',
      },
      {
        screen: 'New policy · Enable policy',
        question: 'Before flipping to "On", what should you verify?',
        options: [
          'Nothing — just enable it',
          'Run "Report-only" first, watch the sign-in logs for unintended impact, AND confirm your break-glass account is excluded',
          'Disable all other CA policies',
          'Apply to guest users only',
        ],
        correct: 1,
        explanation: 'Always run new CA policies in Report-only first. ALWAYS exclude break-glass (emergency-access) accounts so a misconfigured CA policy cannot lock everyone out.',
      },
    ],
  },

  // ── Drill 2 — Entra: PIM activate ──────────────────────────────────────────
  {
    id: 'drill-pim-activate',
    portal: 'Entra',
    title: 'Activate an eligible Global Reader role in PIM',
    scenario: 'You hold an Eligible assignment for the Global Reader role. You need to activate it for a 4-hour audit.',
    difficulty: 'beginner',
    steps: [
      {
        screen: 'entra.microsoft.com',
        question: 'How do you reach Privileged Identity Management?',
        options: [
          'Identity → Roles & admins → Roles',
          'Identity governance → Privileged Identity Management',
          'Identity → Users → Audit logs',
          'Protection → Identity Protection',
        ],
        correct: 1,
        explanation: 'PIM lives under Identity governance. Roles & admins lets you see role *assignments*; PIM lets you *activate* eligibility.',
      },
      {
        screen: 'PIM · Tasks',
        question: 'Which menu shows roles you are eligible to activate?',
        options: [
          'My roles',
          'Approve requests',
          'Review access',
          'Access reviews',
        ],
        correct: 0,
        explanation: '"My roles" shows your own eligible + active assignments across Entra and Azure resources. Other menus are for approvers / reviewers.',
      },
      {
        screen: 'My roles · Eligible assignments',
        question: 'You select "Global Reader" and click Activate. What two fields are mandatory before submission?',
        options: [
          'Username + password',
          'Justification (free text) + duration (hours, within max activation)',
          'New password + confirm',
          'TOTP code + recovery email',
        ],
        correct: 1,
        explanation: 'PIM activation requires a justification (audit trail) and a duration (≤ max activation set by Owner). MFA is also required if the role setting demands it.',
      },
      {
        screen: 'Activate role · Verify MFA',
        question: 'PIM prompts you for MFA. Why is this required even though you signed in with MFA an hour ago?',
        options: [
          'It is a bug',
          'PIM role settings can require fresh MFA at activation time to prove identity before granting privileged access',
          'Microsoft randomly tests you',
          'Your session is over 24h old',
        ],
        correct: 1,
        explanation: 'PIM "on activation, require MFA" is a per-role setting that demands fresh proof of identity — closes the window where a stolen token could activate.',
      },
      {
        screen: 'Activation submitted',
        question: 'Activation needs approval. Where does the approval show up?',
        options: [
          'Email only',
          'In the approver\'s PIM → Approve requests queue (and via email/Teams notification)',
          'In Azure DevOps',
          'It auto-approves after 5 min',
        ],
        correct: 1,
        explanation: 'Approval is a queue in the approver\'s PIM. Email + Teams notifications are courtesy; the approver acts inside PIM. If multi-approval is set, all must approve.',
      },
    ],
  },

  // ── Drill 3 — Defender XDR: Incident triage ────────────────────────────────
  {
    id: 'drill-xdr-incident',
    portal: 'Defender XDR',
    title: 'Triage a suspected AiTM phishing incident',
    scenario: 'You are an L2 SOC analyst. A new High-severity incident "Suspected AiTM phishing attack" appeared. Walk through the triage.',
    difficulty: 'advanced',
    steps: [
      {
        screen: 'security.microsoft.com',
        question: 'Where do you find the incident queue?',
        options: [
          'Endpoints → Device inventory',
          'Investigations → Incidents & alerts → Incidents',
          'Email & collaboration → Submissions',
          'Identities → Dashboard',
        ],
        correct: 1,
        explanation: 'Defender XDR\'s unified incident queue lives at Investigations → Incidents & alerts → Incidents. Alerts is the sibling tab for raw detections.',
      },
      {
        screen: 'Incident details · Attack story',
        prompt: 'You opened the incident. The Attack story graph shows: User → Sign-in from new IP → Mailbox rule "forward to gmail" → OAuth app "Mail Reader" consented.',
        question: 'Which response action takes precedence?',
        options: [
          'Run an antivirus scan on the user\'s laptop',
          'Confirm Automatic Attack Disruption already disabled the user and suspended the OAuth app (check the response history in the incident)',
          'Open a low-priority ticket and wait for management',
          'Reset the user\'s MFA method',
        ],
        correct: 1,
        explanation: 'On high-confidence AiTM, Auto Attack Disruption usually acts before you arrive. Confirm that it did. If not, you take the same actions manually: disable user + suspend the OAuth app.',
      },
      {
        screen: 'Incident · Evidence and response',
        question: 'You want to see the malicious OAuth app\'s permissions before revoking. Which evidence entity do you click?',
        options: [
          'IP address',
          'Cloud application',
          'Process',
          'File',
        ],
        correct: 1,
        explanation: 'Cloud application entities show consented permissions (e.g. Mail.Read), publisher verification status, and consent history.',
      },
      {
        screen: 'Cloud application detail · Actions',
        question: 'After confirming malicious intent, which action revokes the app tenant-wide?',
        options: [
          'Block sign-in',
          'Disable the app and remove existing consents (Disable + Remove user consents)',
          'Send to admin for approval',
          'Tag the app',
        ],
        correct: 1,
        explanation: 'Disabling the app stops new sign-ins; removing user consents revokes existing tokens. Both are needed to fully evict an AiTM-consented app.',
      },
      {
        screen: 'Incident · Manage',
        question: 'Closing out: what do you do before marking the incident resolved?',
        options: [
          'Just close it',
          'Assign yourself, classify (True positive · multi-stage attack), set determination (compromised account), and post the incident summary (Security Copilot or manual) as a comment',
          'Delete the incident',
          'Export to CSV',
        ],
        correct: 1,
        explanation: 'Classification + determination feed Microsoft\'s detection ML and your internal metrics. Comments give the next-shift analyst the audit trail.',
      },
      {
        screen: 'Advanced hunting · Follow-up',
        question: 'Which KQL would find other users whose mailbox was accessed by the same OAuth app?',
        options: [
          'DeviceProcessEvents | take 5',
          'CloudAppEvents | where ActionType == "MailItemsAccessed" and ApplicationId == "<malicious-app-guid>" | summarize count() by AccountObjectId',
          'SigninLogs | summarize count() by IPAddress',
          'AlertInfo | union AlertEvidence',
        ],
        correct: 1,
        explanation: 'CloudAppEvents with the offending ApplicationId reveals every account the app touched — your scope-of-compromise query.',
      },
    ],
  },

  // ── Drill 4 — Sentinel: Build a password-spray analytics rule ──────────────
  {
    id: 'drill-sentinel-rule',
    portal: 'Sentinel',
    title: 'Author a Scheduled analytics rule for password spray',
    scenario: 'You want Sentinel to create an incident when an IP source has > 20 failed sign-ins against > 5 distinct UPNs in 1 hour.',
    difficulty: 'advanced',
    steps: [
      {
        screen: 'Microsoft Sentinel · Workspace',
        question: 'Which left-rail item opens the analytics rule list?',
        options: [
          'Logs',
          'Analytics',
          'Hunting',
          'Workbooks',
        ],
        correct: 1,
        explanation: 'Analytics is the rule management hub. Hunting is for ad-hoc queries; Logs is the raw Log Analytics editor.',
      },
      {
        screen: 'Analytics · Create',
        question: 'For this recurring 1-hour-window detection, which rule type is correct?',
        options: [
          'Microsoft Security rule',
          'Scheduled query rule',
          'NRT rule',
          'Threat intelligence rule',
        ],
        correct: 1,
        explanation: 'Scheduled (configurable frequency + lookback). NRT is for sub-minute time-sensitive detections with limited query complexity.',
      },
      {
        screen: 'Rule wizard · Set rule logic',
        question: 'Which KQL is correct for password-spray (>20 failures across >5 distinct UPNs in 1h)?',
        options: [
          'SigninLogs | where ResultType == 0',
          'SigninLogs | where TimeGenerated > ago(1h) | where ResultType != 0 | summarize Failures = count(), DistinctUsers = dcount(UserPrincipalName) by IPAddress | where Failures > 20 and DistinctUsers > 5',
          'SigninLogs | summarize count() by UserPrincipalName',
          'AzureActivity | take 10',
        ],
        correct: 1,
        explanation: 'Correct shape: time bound, failure filter, summarize with count + dcount, where on aggregates. Spray pattern = many distinct targets per source IP.',
      },
      {
        screen: 'Rule wizard · Entity mapping',
        question: 'Which entity columns are most valuable to map for response actions?',
        options: [
          'Just TimeGenerated',
          'IP (IPAddress) and Account (UserPrincipalName) — at minimum',
          'Hostname only',
          'No mapping required',
        ],
        correct: 1,
        explanation: 'Entity mapping lets the incident link to entity timelines and lets playbooks/Defender pivot. For spray, IP + Account are the minimum useful pair.',
      },
      {
        screen: 'Rule wizard · Incident settings',
        question: 'You want one incident per IP, not one per query run. Which option?',
        options: [
          'Group all events into one alert',
          'Group related alerts triggered by this analytics rule into incidents → Grouping → Group by selected entities → IP',
          'Disable incident grouping',
          'Run rule manually only',
        ],
        correct: 1,
        explanation: 'Incident grouping (per rule) by IP entity dedupes alerts so repeat detections of the same source roll into one ongoing incident — kinder to the analyst.',
      },
      {
        screen: 'Rule wizard · Automated response',
        question: 'You want the SOC Teams channel to get a card whenever the rule fires. Best approach?',
        options: [
          'Write a custom function app',
          'Add an Automation rule that runs a Logic Apps playbook posting to Teams; the playbook authenticates via managed identity',
          'Hard-code the Teams webhook in KQL',
          'Use a Workbook',
        ],
        correct: 1,
        explanation: 'Automation rule → Playbook is the Sentinel SOAR pattern. Always use managed identity for the playbook\'s Microsoft connectors.',
      },
    ],
  },

  // ── Drill 5 — Defender for Cloud: Enable AI workload protection ────────────
  {
    id: 'drill-mdc-ai',
    portal: 'Defender for Cloud',
    title: 'Enable Defender for AI workloads + AI-SPM',
    scenario: 'You have an Azure OpenAI resource. Enable the right Defender for Cloud plans to get prompt-injection alerts and AI attack-path analysis.',
    difficulty: 'intermediate',
    steps: [
      {
        screen: 'portal.azure.com · Defender for Cloud',
        question: 'Where do you toggle the paid Defender plans for a subscription?',
        options: [
          'Inventory',
          'Environment settings → <subscription> → Defender plans',
          'Workload protections only',
          'Regulatory compliance',
        ],
        correct: 1,
        explanation: 'Environment settings is the per-scope (subscription / management group / multi-cloud) plan configuration. Each scope has its own plan matrix.',
      },
      {
        screen: 'Defender plans · subscription scope',
        question: 'Which plan must be ON for AI-Security Posture Management (AI-SPM)?',
        options: [
          'Defender for Servers P1',
          'Defender CSPM (cloud-posture management — paid tier)',
          'Defender for SQL',
          'Defender for Containers',
        ],
        correct: 1,
        explanation: 'AI-SPM is a feature of Defender CSPM. Foundational CSPM (free) gives you posture; Defender CSPM (paid) adds AI-SPM, attack paths, agentless scan, and Cloud Security Explorer.',
      },
      {
        screen: 'Defender plans · subscription scope',
        question: 'Which plan adds runtime alerts for prompt injection against Azure OpenAI?',
        options: [
          'Defender for Storage',
          'Defender for AI workloads',
          'Defender for App Service',
          'Defender for Resource Manager',
        ],
        correct: 1,
        explanation: 'Defender for AI workloads inspects Azure OpenAI traffic and raises alerts for suspected prompt injection, sensitive data leak in completions, and wallet abuse.',
      },
      {
        screen: 'Settings · AI threat protection',
        question: 'For "sensitive data exposure" alerts to work, what extra integration do you enable?',
        options: [
          'Connect Microsoft Purview Information Protection (sensitivity labels) to Defender for AI',
          'Disable content filters',
          'Use a public IP on Azure OpenAI',
          'Nothing — it works without setup',
        ],
        correct: 0,
        explanation: 'AI threat protection cross-references Purview sensitivity labels to flag when labeled content shows up in prompts/completions. Pair Purview + Defender for AI for full coverage.',
      },
      {
        screen: 'Recommendations · AI',
        question: 'Defender for Cloud surfaces a recommendation: "Azure OpenAI resource should use private endpoint". Best way to handle at scale?',
        options: [
          'Ignore it',
          'Use Quick Fix where available, or assign to the resource owner via a Governance Rule with SLA',
          'Manually email each owner',
          'Delete the resource',
        ],
        correct: 1,
        explanation: 'Governance Rules assign ownership + SLA + reminders for recommendations. Combine with Quick Fix to remediate compliant ones automatically.',
      },
    ],
  },

  // ── Drill 6 — Purview: Configure DSPM for AI policies ──────────────────────
  {
    id: 'drill-purview-dspm-ai',
    portal: 'Purview',
    title: 'Roll out DSPM for AI starter policies',
    scenario: 'Your CISO wants visibility into Copilot prompts and DLP enforcement on labeled content. Onboard DSPM for AI.',
    difficulty: 'intermediate',
    steps: [
      {
        screen: 'purview.microsoft.com',
        question: 'Where does DSPM for AI live in Purview\'s left nav?',
        options: [
          'Audit',
          'Solutions → DSPM for AI',
          'Information protection → Labels',
          'eDiscovery → Cases',
        ],
        correct: 1,
        explanation: 'DSPM for AI is its own Solution tile in Purview, alongside DSPM, Insider Risk Management, etc.',
      },
      {
        screen: 'DSPM for AI · Overview',
        question: 'Activity Explorer here shows prompts from which sources?',
        options: [
          'Only Microsoft 365 Copilot',
          'Microsoft 365 Copilot, Copilot Studio agents, Azure OpenAI (via connector), ChatGPT Enterprise (via connector), and other connected GenAI apps (browser-based via Edge for Business)',
          'Only Azure OpenAI',
          'Only ChatGPT',
        ],
        correct: 1,
        explanation: 'DSPM for AI is the cross-source AI activity console — Microsoft + third-party + browser-detected.',
      },
      {
        screen: 'DSPM for AI · Recommendations',
        question: 'Which ready-to-deploy policy detects sensitive content being pasted into AI prompts?',
        options: [
          '"Detect risky AI usage" (IRM)',
          '"Detect sensitive info in AI prompts" (DLP)',
          '"Fortify your data security posture"',
          'None — must build from scratch',
        ],
        correct: 1,
        explanation: 'The DLP one-click policy creates a DLP rule with Microsoft 365 Copilot + Endpoint browser locations targeting sensitive info / labels.',
      },
      {
        screen: 'Data protection · Endpoint DLP',
        question: 'To block paste into ChatGPT in a browser, which prerequisite is required?',
        options: [
          'Defender for Office 365 P2',
          'Devices onboarded to Endpoint DLP AND users browse via Edge for Business with the Purview extension',
          'Sentinel ingestion of firewall logs',
          'PIM activation',
        ],
        correct: 1,
        explanation: 'Browser DLP for "unsanctioned GenAI sites" requires Endpoint DLP onboarding + Edge for Business. Other browsers can be blocked via the Purview extension or via Defender for Cloud Apps reverse proxy.',
      },
      {
        screen: 'Recommendations · Oversharing assessment',
        question: 'An oversharing assessment shows "Marketing SharePoint site shared with Everyone except external users" — Copilot returns it for any user. What\'s the cleanest fix?',
        options: [
          'Disable Copilot for the tenant',
          'Apply restricted-access controls (SharePoint Advanced Management) to the site AND tighten sharing to specific groups; verify with DSPM for AI re-scan',
          'Email everyone a warning',
          'Delete the site',
        ],
        correct: 1,
        explanation: 'Restricted-access controls + tightened sharing fix the root cause; the oversharing assessment re-scans and confirms remediation.',
      },
    ],
  },

  // ── Drill 7 — Azure OpenAI: Production hardening checklist ─────────────────
  {
    id: 'drill-aoai-hardening',
    portal: 'Azure OpenAI',
    title: 'Harden a new Azure OpenAI resource for HIPAA workload',
    scenario: 'You\'re deploying GPT-4o for a HIPAA-bound RAG chatbot. Walk through the configuration choices.',
    difficulty: 'advanced',
    steps: [
      {
        screen: 'Create · Azure OpenAI · Networking',
        question: 'Which networking option is required for HIPAA?',
        options: [
          'Public endpoint (all networks)',
          'Public endpoint with selected networks',
          'Disabled public access + private endpoint inside your VNet',
          'Service endpoint only',
        ],
        correct: 2,
        explanation: 'Regulated workloads disable public access and bind to a private endpoint in the customer VNet. Traffic stays on the Microsoft backbone, never the public internet.',
      },
      {
        screen: 'Create · Identity',
        question: 'For the calling application to authenticate, what do you configure?',
        options: [
          'Generate and copy an API key into the app',
          'Assign a system- or user-assigned managed identity to the calling app and grant it the Cognitive Services User role on the AOAI resource — also "Disable local authentication" on AOAI',
          'Use SAS tokens',
          'Anonymous access',
        ],
        correct: 1,
        explanation: 'Disable local auth = require Entra. Managed identity on the caller eliminates stored secrets. RBAC role: Cognitive Services User on the AOAI scope.',
      },
      {
        screen: 'Create · Encryption',
        question: 'For HIPAA, what is the encryption posture?',
        options: [
          'Default Microsoft-managed keys are sufficient',
          'Customer-managed keys (CMK) in Azure Key Vault Premium (HSM-backed), with soft-delete and purge protection enabled',
          'No encryption needed',
          'Encrypt only blob outputs',
        ],
        correct: 1,
        explanation: 'CMK gives you key control + revocation. Key Vault Premium (HSM) is FIPS 140-3 L3. Soft-delete + purge protection prevent accidental key loss that would brick the data.',
      },
      {
        screen: 'Azure OpenAI Studio · Content filters',
        question: 'What is the default safety threshold across hate / sexual / violence / self-harm?',
        options: [
          'Off',
          'Low',
          'Medium (the default)',
          'High',
        ],
        correct: 2,
        explanation: 'Medium is the default. Lower (Off / Low) requires Microsoft Limited Access approval. Higher (High) tightens but may over-block legitimate medical content — tune per use case.',
      },
      {
        screen: 'Content filters · Advanced',
        question: 'You retrieve grounding documents from SharePoint. Which Prompt Shield must you enable to block embedded jailbreaks in those docs?',
        options: [
          'User Prompt Shield',
          'Document Prompt Shield (a.k.a. indirect-prompt-injection shield)',
          'Protected material detection',
          'Groundedness detection',
        ],
        correct: 1,
        explanation: 'Document Prompt Shield analyzes external grounding content for embedded malicious instructions. User Prompt Shield protects against direct jailbreaks. Both are needed in RAG workloads.',
      },
      {
        screen: 'Resource · Diagnostic settings',
        question: 'You want completions + prompts logged for forensic analysis. Which diagnostic category do you enable?',
        options: [
          'AuditLogs only',
          'RequestResponse (plus AllMetrics) — note this category is opt-in and incurs additional storage cost',
          'AzureActivity',
          'Operational logs only',
        ],
        correct: 1,
        explanation: 'RequestResponse is the opt-in category that captures prompt + completion text. Treat the resulting log as Confidential — protect with sensitivity labels on the Log Analytics workspace.',
      },
      {
        screen: 'Defender for Cloud · Plans',
        question: 'Last step: turn on which Defender plan to get prompt-injection alerts?',
        options: [
          'Defender for Resource Manager',
          'Defender for AI workloads',
          'Defender for Storage',
          'Defender for App Service',
        ],
        correct: 1,
        explanation: 'Defender for AI workloads adds runtime threat detection (prompt injection, sensitive data leak, wallet abuse, credential abuse) that surfaces as Defender XDR alerts.',
      },
    ],
  },

  // ── Drill 8 — Security Copilot: Provision and govern ───────────────────────
  {
    id: 'drill-copilot-bootstrap',
    portal: 'Security Copilot',
    title: 'Provision Security Copilot capacity and govern plugins',
    scenario: 'Your tenant is new to Security Copilot. Set up capacity, roles, and decide which plugins your SOC can use.',
    difficulty: 'intermediate',
    steps: [
      {
        screen: 'portal.azure.com · Create resource',
        question: 'What resource type backs Security Copilot capacity?',
        options: [
          'App Service plan',
          'Microsoft Security Copilot capacity (Security Compute Units · SCUs)',
          'Cognitive Services account',
          'Azure OpenAI deployment',
        ],
        correct: 1,
        explanation: 'Capacity is a dedicated resource type — Security Compute Units. Billed per SCU per hour (~$4 USD/SCU/hr at GA). Recommended start: 3 SCUs.',
      },
      {
        screen: 'Capacity · Sizing',
        question: 'Microsoft\'s recommended starting size for a typical SOC?',
        options: [
          '1 SCU',
          '3 SCUs',
          '10 SCUs',
          '50 SCUs',
        ],
        correct: 1,
        explanation: '3 SCUs is the published starting recommendation. Scale based on throttling and adoption metrics.',
      },
      {
        screen: 'securitycopilot.microsoft.com · Settings',
        question: 'You want a specific Entra group to author promptbooks and run prompts, but NOT to manage capacity. Which role do you assign?',
        options: [
          'Copilot Owner',
          'Copilot Contributor',
          'Global Administrator',
          'Reader',
        ],
        correct: 1,
        explanation: 'Contributor: use Copilot, create promptbooks, install user-scoped plugins. Owner: manage capacity, role assignments, plugin allow-list, data sharing.',
      },
      {
        screen: 'Settings · Plugins',
        question: 'Your policy says "SOC may use Defender XDR + Sentinel + Defender TI plugins; not Intune". How do you enforce?',
        options: [
          'Tell users not to use Intune',
          'As Owner, configure the plugin allow-list — uninstall / disable Intune; keep Defender XDR, Sentinel, Defender TI enabled',
          'Disable Copilot entirely',
          'Use Conditional Access',
        ],
        correct: 1,
        explanation: 'Plugin allow-list is the canonical governance lever — Owner-controlled. Users only see / enable what Owners have permitted.',
      },
      {
        screen: 'Promptbooks · New',
        question: 'You build a custom "Incident Report" promptbook with a parameter {incident_id}. Where would a user invoke it embedded?',
        options: [
          'Outlook',
          'Defender XDR incident page → "Copilot" pane → run promptbook',
          'Azure Portal Cloud Shell',
          'GitHub',
        ],
        correct: 1,
        explanation: 'Promptbooks are surfaced in standalone Copilot and embedded panes (Defender XDR incident, Sentinel rule, Intune device, Entra group, Purview risk). The {incident_id} parameter prefills.',
      },
      {
        screen: 'Settings · Audit',
        question: 'For forensic correlation, you want Copilot session logs in Sentinel. How?',
        options: [
          'Manually export each session',
          'Install the "Microsoft Security Copilot" data connector in Sentinel, then verify ingest into the SecurityCopilotEvents (or equivalent) table',
          'Use a Logic App to scrape the portal',
          'Disable logging',
        ],
        correct: 1,
        explanation: 'The Sentinel data connector ingests Copilot session + audit events for long retention, KQL hunting, and cross-correlation with incidents.',
      },
    ],
  },
];

export const SC500_DRILL_PORTAL_COLORS: Record<Drill['portal'], string> = {
  'Entra':              'bg-blue-500/10 text-blue-300 border-blue-500/30',
  'Defender XDR':       'bg-red-500/10 text-red-300 border-red-500/30',
  'Sentinel':           'bg-amber-500/10 text-amber-300 border-amber-500/30',
  'Defender for Cloud': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  'Purview':            'bg-violet-500/10 text-violet-300 border-violet-500/30',
  'Azure OpenAI':       'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  'Security Copilot':   'bg-pink-500/10 text-pink-300 border-pink-500/30',
};
