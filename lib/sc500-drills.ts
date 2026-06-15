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

  // ── Drill 8 — Entra: Register an app for a custom Copilot Studio agent ────────
  {
    id: 'drill-entra-app-reg',
    portal: 'Entra',
    title: 'Register an app & delegate API permissions for a Copilot Studio agent',
    scenario: 'Your team is building a Copilot Studio agent that reads SharePoint documents on behalf of signed-in users. Register an app with the minimum required delegated permissions.',
    difficulty: 'intermediate',
    steps: [
      {
        screen: 'entra.microsoft.com',
        question: 'Where do you register a new application?',
        options: [
          'Identity → Users → New user',
          'Applications → App registrations → New registration',
          'Identity governance → Access packages',
          'Protection → Conditional Access',
        ],
        correct: 1,
        explanation: 'App registrations is the app identity management hub. New registration starts the app creation wizard.',
      },
      {
        screen: 'Register an application',
        question: 'For an internal-only Copilot Studio agent used by employees in your tenant, what is the correct "Supported account types"?',
        options: [
          'Accounts in any organizational directory',
          'Accounts in any organizational directory and personal Microsoft accounts',
          'Accounts in this organizational directory only (single tenant)',
          'Personal Microsoft accounts only',
        ],
        correct: 2,
        explanation: 'Single-tenant limits sign-in to your own tenant users only — correct for internal enterprise agents. Multi-tenant or personal expands to external identities unnecessarily.',
      },
      {
        screen: 'App registration · API permissions',
        question: 'Your agent reads SharePoint sites on behalf of the signed-in user (delegated, not application). Which permission scope is correct?',
        options: [
          'Sites.FullControl.All (Application)',
          'Sites.Read.All (Delegated)',
          'Sites.Manage.All (Application)',
          'AllSites.Write (legacy)',
        ],
        correct: 1,
        explanation: 'Delegated = acts as the signed-in user. Sites.Read.All delegated means the agent can read what that user can read — no more. Application permissions would give admin-level access regardless of user.',
      },
      {
        screen: 'API permissions · Grant admin consent',
        question: 'After adding the permission, the status shows "Not granted for <tenant>". What must a Global Admin or Privileged Role Admin do?',
        options: [
          'Nothing — users will consent individually at sign-in',
          'Click "Grant admin consent for <tenant>" to pre-consent for all users',
          'Delete and re-add the permission',
          'Change the permission to Application type',
        ],
        correct: 1,
        explanation: 'Admin consent eliminates the per-user consent prompt. For Sites.Read.All (high-privilege), per-user consent may be blocked by policy — admin consent is typically required.',
      },
      {
        screen: 'App registration · Certificates & secrets',
        question: 'Your Copilot Studio agent connection needs to authenticate. Which credential type is preferred over client secrets?',
        options: [
          'Client secret (auto-rotate daily)',
          'Certificate credential (uploaded public certificate; private key stays on the calling side)',
          'Username/password',
          'API key passed in headers',
        ],
        correct: 1,
        explanation: 'Certificates are harder to steal than secrets (private key never leaves the calling system). For non-interactive workloads, managed identity is even better — but that requires Azure hosting, not always available for Copilot Studio.',
      },
    ],
  },

  // ── Drill 9 — Defender XDR: Custom hunting query ──────────────────────────
  {
    id: 'drill-xdr-hunting',
    portal: 'Defender XDR',
    title: 'Write and schedule an advanced hunting query for token theft',
    scenario: 'A threat report describes a campaign that steals OAuth refresh tokens from browser caches. Build a hunting query to detect the known file path access pattern, then schedule it.',
    difficulty: 'advanced',
    steps: [
      {
        screen: 'security.microsoft.com',
        question: 'Where do you run ad-hoc KQL across all Defender telemetry?',
        options: [
          'Incidents & alerts → Incidents',
          'Hunting → Advanced hunting',
          'Reports → Device health',
          'Assets → Devices',
        ],
        correct: 1,
        explanation: 'Advanced hunting is the cross-signal KQL workspace: DeviceEvents, DeviceFileEvents, CloudAppEvents, IdentityLogonEvents, EmailEvents, etc.',
      },
      {
        screen: 'Advanced hunting · Query editor',
        question: 'Token cache files commonly live in \\AppData\\Local\\Microsoft\\TokenBroker\\. Which table and filter detect file-read events targeting that path?',
        options: [
          'AlertInfo | where Title contains "token"',
          'DeviceFileEvents | where ActionType == "FileRead" and FolderPath has "TokenBroker" | project DeviceName, InitiatingProcessFileName, FileName, Timestamp',
          'DeviceProcessEvents | take 10',
          'IdentityLogonEvents | where Protocol == "NTLM"',
        ],
        correct: 1,
        explanation: 'DeviceFileEvents captures file read/create/delete/rename actions. Filter on the known TokenBroker path; project device, process, and file for triage. Add InitiatingProcessParentFileName for parent context.',
      },
      {
        screen: 'Results · Review',
        prompt: 'Query returned 3 rows with processes: chrome.exe, unknown_stealer.exe, python3.exe reading token broker files.',
        question: 'Which hit is most suspicious and why?',
        options: [
          'chrome.exe — browsers legitimately read their own token caches',
          'unknown_stealer.exe — a process named "stealer" reading token caches is a clear indicator',
          'python3.exe — scripting engines are never legitimate on endpoints',
          'All equally suspicious',
        ],
        correct: 1,
        explanation: 'unknown_stealer.exe is the obvious indicator — an arbitrary process reading the token broker folder with a suggestive name. chrome.exe legitimately reads its own files. python3.exe needs context (dev machine vs. server).',
      },
      {
        screen: 'Advanced hunting · Save as · Detection rule',
        question: 'You want this query to run every 6 hours and create a High-severity alert. Which save action?',
        options: [
          'Save query (bookmarks only)',
          'Create detection rule (sets frequency, severity, alert title, entity mapping)',
          'Export to CSV',
          'Pin to dashboard',
        ],
        correct: 1,
        explanation: '"Create detection rule" converts the hunting query into a recurring, alerting custom detection. Set the lookback to match frequency (e.g., 6h query every 6h) to avoid gaps or double-count.',
      },
      {
        screen: 'Detection rule · Entity mapping',
        question: 'Which entity columns should you map so response actions (isolate device) are available on the alert?',
        options: [
          'No mapping needed',
          'DeviceName → Device entity (Device identifier)',
          'Timestamp only',
          'FileName only',
        ],
        correct: 1,
        explanation: 'Mapping DeviceName to a Device entity unlocks "Isolate device" and "Run antivirus scan" one-click response actions directly from the alert.',
      },
    ],
  },

  // ── Drill 10 — Sentinel: Connect a Defender XDR data connector ────────────
  {
    id: 'drill-sentinel-connector',
    portal: 'Sentinel',
    title: 'Onboard Defender XDR (Microsoft 365 Defender) data connector into Sentinel',
    scenario: 'Your org uses both Microsoft Sentinel and Defender XDR. You want a unified SOC view in Sentinel with all XDR incidents and raw hunting tables available.',
    difficulty: 'beginner',
    steps: [
      {
        screen: 'Microsoft Sentinel · Workspace',
        question: 'Where do you add new data sources (connectors) to Sentinel?',
        options: [
          'Analytics',
          'Content hub',
          'Data connectors',
          'Workbooks',
        ],
        correct: 2,
        explanation: 'Data connectors lists all available data sources (first-party, partner, custom). Content hub is the solution package marketplace (bundles connector + rules + workbooks).',
      },
      {
        screen: 'Data connectors · Search',
        question: 'Which connector name brings in all Defender XDR incidents, alerts, and raw hunting tables (AdvancedHunting_*)?',
        options: [
          'Microsoft Defender for Endpoint',
          'Microsoft 365 Defender (the unified Defender XDR connector)',
          'Azure Active Directory Identity Protection',
          'Office 365',
        ],
        correct: 1,
        explanation: '"Microsoft 365 Defender" is the unified connector. It ingests incidents, alerts, and the full AdvancedHunting schema tables into Sentinel. Individual product connectors are narrower.',
      },
      {
        screen: 'Microsoft 365 Defender connector · Configuration',
        question: 'What checkbox is critical when your org already uses Defender XDR for incident management?',
        options: [
          '"Ingest all additional events" — always check this',
          '"Turn off all Microsoft incident creation rules for these products" — prevents duplicate incidents if Sentinel and XDR both fire',
          '"Delete existing incidents"',
          '"Export all events to storage"',
        ],
        correct: 1,
        explanation: 'Without disabling built-in incident creation rules, you get duplicate incidents (one from Sentinel, one imported from XDR). Keep incident management in one system.',
      },
      {
        screen: 'Connector · Status',
        question: 'The connector shows "Connected" but AdvancedHunting_DeviceEvents is not in Logs. What is the most likely reason?',
        options: [
          'The connector is broken',
          'Defender for Endpoint must be licensed and onboarded — raw hunting tables only appear when the relevant Defender workload is enabled and streaming data',
          'Delete and reconnect',
          'The table is case-sensitive',
        ],
        correct: 1,
        explanation: 'AdvancedHunting tables are gated by workload licensing. If Defender for Endpoint is not provisioned, DeviceEvents won\'t exist. Check which plans are active.',
      },
      {
        screen: 'Logs · Verify',
        question: 'Which KQL confirms Defender XDR incidents are arriving in Sentinel?',
        options: [
          'AzureActivity | take 5',
          'SecurityIncident | where ProviderName == "Microsoft 365 Defender" | take 10',
          'Syslog | take 5',
          'DeviceNetworkEvents | take 5',
        ],
        correct: 1,
        explanation: 'SecurityIncident with ProviderName "Microsoft 365 Defender" confirms the unified connector is importing XDR incidents into Sentinel\'s incident management.',
      },
    ],
  },

  // ── Drill 11 — Purview: Create and publish a sensitivity label ─────────────
  {
    id: 'drill-purview-label',
    portal: 'Purview',
    title: 'Create a "Confidential - AI Processed" sensitivity label and auto-label policy',
    scenario: 'Your data governance team needs a label applied automatically to any document processed by Azure OpenAI. Create the label and an auto-labeling policy.',
    difficulty: 'intermediate',
    steps: [
      {
        screen: 'purview.microsoft.com',
        question: 'Where do you create and manage sensitivity labels?',
        options: [
          'DSPM for AI',
          'Solutions → Information protection → Labels',
          'Data catalog',
          'eDiscovery',
        ],
        correct: 1,
        explanation: 'Information protection is the label management hub. DSPM for AI uses labels for policy conditions but does not create them.',
      },
      {
        screen: 'Labels · Create a label',
        question: 'You need to set the visual marking so PDFs stamped with this label show a header saying "Confidential - AI Processed". Where do you configure this?',
        options: [
          'Access control settings',
          'Content marking (header, footer, watermark)',
          'Auto-labeling for files and emails',
          'Label color only',
        ],
        correct: 1,
        explanation: 'Content marking adds visible headers, footers, and watermarks to documents. Configure the text, font size, color, and alignment here.',
      },
      {
        screen: 'Labels · Encryption',
        question: 'This label does NOT encrypt — it only marks. Which encryption option should you select?',
        options: [
          'Apply encryption',
          'Remove encryption if already applied',
          'None (no encryption for this label)',
          'Always encrypt with external key',
        ],
        correct: 2,
        explanation: 'Choose "None" when the label is marking/tracking-only. Encryption is a separate decision — not all marking labels should also restrict access.',
      },
      {
        screen: 'Auto-labeling · New policy',
        question: 'You want the label applied automatically to files in SharePoint that contain the phrase "Generated by AI". Which policy type and condition is correct?',
        options: [
          'Client-side labeling with no conditions',
          'Service-side auto-labeling policy → location: SharePoint sites → condition: content contains the custom sensitive info type or exact keyword "Generated by AI"',
          'DLP policy with block action',
          'IRM policy',
        ],
        correct: 1,
        explanation: 'Service-side auto-labeling (in Purview) scans SharePoint/OneDrive/Exchange at rest without requiring a user action. Set location to your SharePoint sites and add the keyword/sensitive info type condition.',
      },
      {
        screen: 'Auto-labeling policy · Simulation mode',
        question: 'Before enabling the policy to actually label files, what should you do?',
        options: [
          'Enable immediately — simulation wastes time',
          'Run the policy in simulation mode first, review the matched files report, then enable when satisfied with the scope',
          'Delete all existing labels',
          'Run as Global Admin only',
        ],
        correct: 1,
        explanation: 'Simulation mode previews which files would be labeled without actually labeling them. Always validate scope before enabling, especially on large SharePoint environments.',
      },
    ],
  },

  // ── Drill 12 — Defender for Cloud: Implement a Governance Rule ─────────────
  {
    id: 'drill-mdc-governance',
    portal: 'Defender for Cloud',
    title: 'Create a Governance Rule to assign AI security recommendations',
    scenario: 'Defender for Cloud surfaced 8 Azure OpenAI recommendations with no owner. Create a governance rule that assigns them to the AI Platform team with a 14-day SLA.',
    difficulty: 'intermediate',
    steps: [
      {
        screen: 'Defender for Cloud · Environment settings',
        question: 'Where do you create Governance rules in Defender for Cloud?',
        options: [
          'Recommendations → Filters',
          'Governance (under Recommendations or Environment settings)',
          'Workload protections',
          'Regulatory compliance',
        ],
        correct: 1,
        explanation: 'Governance lives under Recommendations → Governance or directly in Environment settings. It lets you assign remediation owners, ETAs, and email notifications per rule.',
      },
      {
        screen: 'Governance · New rule',
        question: 'You want to target only recommendations with "Azure OpenAI" in the resource name. Which condition type is correct?',
        options: [
          'By resource type: Microsoft.Insights/components',
          'By resource name contains: OpenAI',
          'By severity: High',
          'By compliance framework: NIST',
        ],
        correct: 1,
        explanation: 'Condition "Resource name contains" lets you scope to specific resource patterns. You can also combine with severity, recommendation name, or resource type filters.',
      },
      {
        screen: 'Governance rule · Assignment',
        question: 'To send notification emails to a group (ai-platform@company.com), what must be true about that email address in Entra?',
        options: [
          'Nothing — any email address works',
          'The address must be a valid Entra user or security group with an Entra member email; distribution lists may not receive Defender notifications',
          'The address must be a Global Admin',
          'The email domain must match the tenant primary domain',
        ],
        correct: 1,
        explanation: 'Governance rule email notifications work best with Entra security groups or user accounts. External email addresses and distribution lists may not receive Azure system emails reliably.',
      },
      {
        screen: 'Governance rule · Remediation timeframe',
        question: 'Setting "Owner" and "Due in 14 days" — what will happen to an unmediated recommendation after 14 days?',
        options: [
          'The resource is automatically deleted',
          'The recommendation is marked "overdue" in the Governance dashboard and can trigger escalation workflows via Logic Apps',
          'Nothing — governance rules have no enforcement',
          'Defender for Cloud remediates it automatically',
        ],
        correct: 1,
        explanation: 'Governance tracks SLA compliance in the dashboard. Overdue items are visible in reporting. You can build Logic Apps triggered by governance events for escalation, ticketing, or Slack/Teams alerts.',
      },
      {
        screen: 'Governance dashboard · Review',
        question: 'Which metric shows the percentage of assigned recommendations resolved within SLA?',
        options: [
          'Secure Score',
          'Governance health: "% completed on time" (resolved within due date)',
          'Compliance percentage',
          'Defender coverage',
        ],
        correct: 1,
        explanation: '"% completed on time" in the Governance dashboard is the SLA adherence metric — key for reporting to leadership on cloud security hygiene velocity.',
      },
    ],
  },

  // ── Drill 13 — Sentinel: Configure a Logic Apps playbook for Entra disable ─
  {
    id: 'drill-sentinel-playbook',
    portal: 'Sentinel',
    title: 'Build and test a Logic Apps playbook that disables an Entra user on alert',
    scenario: 'You want Sentinel automation to immediately disable a compromised user in Entra whenever a "Successful sign-in from impossible travel" alert fires.',
    difficulty: 'advanced',
    steps: [
      {
        screen: 'Microsoft Sentinel · Automation',
        question: 'Where do you create new Logic Apps playbooks from within Sentinel?',
        options: [
          'Analytics',
          'Automation → Playbooks → Create → Playbook with incident trigger',
          'Data connectors',
          'Workbooks',
        ],
        correct: 1,
        explanation: 'Automation → Playbooks is the managed hub. "Playbook with incident trigger" creates a Logic App pre-wired to the Sentinel incident trigger schema.',
      },
      {
        screen: 'Logic Apps designer · Trigger',
        question: 'The playbook starts with a "Microsoft Sentinel Incident" trigger. Your playbook needs to extract the UPN of the affected user from incident entities. Which action follows the trigger?',
        options: [
          'Condition: Is equal to',
          'Entities - Get Accounts (Sentinel action that parses account entities from the incident)',
          'HTTP request to the user\'s inbox',
          'Send email',
        ],
        correct: 1,
        explanation: '"Entities - Get Accounts" returns a list of Account entities in the incident. The output array feeds into an Apply-to-each loop so you can act on every compromised account, not just the first.',
      },
      {
        screen: 'Apply to each · Actions',
        question: 'Inside the loop, which action disables the user in Entra ID?',
        options: [
          'Send email to user',
          'HTTP PATCH to https://graph.microsoft.com/v1.0/users/{userPrincipalName} with body { "accountEnabled": false }',
          'Azure AD Revoke sessions only',
          'Delete user',
        ],
        correct: 1,
        explanation: 'Graph API PATCH with accountEnabled: false disables sign-in. Combine with Revoke-AzureADUserAllRefreshTokens action to also invalidate live sessions. Disable ≠ delete — the account remains for recovery.',
      },
      {
        screen: 'Logic Apps · Identity',
        question: 'For the HTTP PATCH to Graph to succeed, which identity and permission does the Logic App need?',
        options: [
          'Anonymous — Graph is public',
          'System-assigned managed identity with "User.ReadWrite.All" (or "Directory.ReadWrite.All") app permission granted in Entra → Enterprise applications',
          'Hard-coded service account credentials in the step',
          'Client secret in connection settings',
        ],
        correct: 1,
        explanation: 'Managed identity on the Logic App eliminates stored credentials. Grant the app permission to the Logic App\'s managed identity in Entra (not delegated — the playbook runs unattended). Prefer User.EnableDisableAccount if available (least privilege).',
      },
      {
        screen: 'Sentinel · Automation rules',
        question: 'After saving the playbook, how do you trigger it automatically when the "Impossible travel" analytics rule fires?',
        options: [
          'Edit the analytics rule and add the playbook there',
          'Create an Automation rule: condition = "Alert product name contains Sentinel" + "Analytic rule name equals Impossible travel" → action = Run playbook',
          'Set it as a workbook default',
          'Upload to GitHub',
        ],
        correct: 1,
        explanation: 'Automation rules are the decoupled trigger layer — they fire on incident creation/update and call playbooks. Separating rule from playbook lets you re-use playbooks across multiple scenarios.',
      },
    ],
  },

  // ── Drill 14 — Security Copilot: Investigate an incident prompt flow ────────
  {
    id: 'drill-copilot-investigate',
    portal: 'Security Copilot',
    title: 'Use Security Copilot embedded in Defender XDR to investigate an incident',
    scenario: 'A critical "Multi-stage attack" incident is open. Use Copilot to accelerate the investigation — incident summary, script analysis, and recommended response.',
    difficulty: 'intermediate',
    steps: [
      {
        screen: 'Defender XDR incident detail',
        question: 'Where is Security Copilot embedded in the Defender XDR incident experience?',
        options: [
          'A separate browser tab you open manually',
          'The Copilot pane on the right side of the incident detail page',
          'Settings menu',
          'Reports → Summary',
        ],
        correct: 1,
        explanation: 'The Copilot pane appears natively in the incident sidebar once capacity is provisioned. No context switching — you interact with the active incident without leaving XDR.',
      },
      {
        screen: 'Copilot pane · Incident summary',
        question: 'Copilot automatically generates an incident summary. What should you verify before sharing the summary with management?',
        options: [
          'Nothing — Copilot is always accurate',
          'Validate key claims against the raw evidence: timeline accuracy, entities cited, attack chain logic. Copilot can hallucinate or omit evidence — always ground-truth before sending.',
          'Rewrite it entirely',
          'Copy it verbatim to email',
        ],
        correct: 1,
        explanation: 'LLM summaries are starting points, not final products. Validate severity, timeline, and entities against the attack story graph. Look for missing events Copilot did not surface.',
      },
      {
        screen: 'Copilot pane · Script analysis',
        prompt: 'An alert shows a suspicious PowerShell one-liner was executed: powershell -enc <base64blob>.',
        question: 'Which Copilot prompt will give you a deobfuscated explanation of the script?',
        options: [
          '"What is PowerShell?"',
          '"Analyze this script: <paste encoded command>" or click Analyze script on the alert evidence directly',
          '"Ignore the script"',
          '"Run a scan"',
        ],
        correct: 1,
        explanation: 'Copilot\'s script analysis decodes base64, deobfuscates common techniques, and explains intent and likely impact. Faster than manual CyberChef + read for most analysts.',
      },
      {
        screen: 'Copilot pane · Guided response',
        question: 'Copilot suggests "Isolate the affected device". Before clicking the one-click action, what must you verify?',
        options: [
          'Nothing — execute immediately',
          'That isolation is appropriate: the device is not a domain controller, not a patient-care device, and that network isolation won\'t break a critical service. Confirm scope with your incident commander.',
          'That the device is running Windows 7',
          'That Copilot has enough SCUs',
        ],
        correct: 1,
        explanation: 'AI-suggested response actions require human judgement — isolation can break critical services. Copilot accelerates identification; a human must approve the action, especially in regulated environments.',
      },
      {
        screen: 'Copilot standalone · Incident report',
        question: 'After investigation, how do you generate a structured incident report from Copilot?',
        options: [
          'Manually write it in Word',
          'Use the "Incident report" built-in promptbook (or a custom one), passing the incident ID; review, edit, then export to Word or paste to your ITSM tool',
          'Export from the graph',
          'Ask Copilot to email it',
        ],
        correct: 1,
        explanation: 'The incident report promptbook chains: incident summary → timeline → entities → recommended actions → executive narrative. Customize the promptbook to match your org\'s report format.',
      },
    ],
  },

  // ── Drill 15 — Security Copilot: Provision and govern ─────────────────────
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
