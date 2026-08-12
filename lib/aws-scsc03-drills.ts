/**
 * AWS Certified Security - Specialty drills, scenario-based
 * click-path simulations of AWS console workflows. Each drill walks through
 * a realistic security task spanning one or more SCS-C03 domains.
 *
 * Bucket taxonomy = the 6 SCS-C03 domains per the exam outline.
 */

import type { Drill, DrillSet } from './sc500-drills';

// Domain bucket names (must match aws-scs-c03.md exactly).
const D1 = 'Identity and Access Management';
const D2 = 'Infrastructure Security';
const D3 = 'Data Protection';
const D4 = 'Security Logging and Monitoring';
const D5 = 'Threat Detection and Incident Response';
const D6 = 'Management and Governance';

export const AWS_SCSC03_DRILLS: Drill[] = [

  // ── Domain 1 (IAM) - Drill 1: Policy evaluation & permission boundaries ─────
  {
    id: 'aws-drill-iam-policy-evaluation',
    portal: D1,
    title: 'Evaluate an IAM policy: identity vs resource vs SCP',
    scenario: 'You receive a ticket: "Developer cannot upload to S3 bucket MyData even though the bucket policy says AllPrincipals can PutObject." Walk the permission evaluation logic to diagnose why.',
    difficulty: 'advanced',
    objectives: ['SCS-C03 Domain 4: Identity and Access Management (20%)'],
    steps: [
      {
        screen: 'AWS Console · S3 bucket · MyData',
        prompt: 'You examine the bucket policy. It has: Effect: Allow, Principal: "*", Action: s3:PutObject, Resource: arn:aws:s3:::MyData/*.',
        question: 'The bucket policy allows the action. Where else might access be blocked?',
        options: [
          'The developer\'s identity-based IAM policy (or lack thereof)',
          'An SCP attached to the account or org unit',
          'A resource-based policy on a different S3 bucket',
          'The developer\'s assigned role session duration',
        ],
        correct: 0,
        explanation: 'Permission evaluation: if EITHER the identity-based policy OR the bucket policy denies, the action is denied. If the bucket allows but the identity policy is missing or denies, access fails. Bucket policy alone is insufficient.',
      },
      {
        screen: 'IAM · Developer\'s role policy',
        prompt: 'You check the developer\'s attached identity-based policy. It grants "s3:Get*" but does NOT grant "s3:PutObject" or "s3:*".',
        question: 'What is the correct action?',
        options: [
          'Add "s3:PutObject" to the developer\'s identity-based policy, scoped to arn:aws:s3:::MyData/*',
          'The bucket policy is enough; the developer needs nothing else',
          'Add an inline policy to the bucket itself',
          'Disable the bucket policy and use IAM only',
        ],
        correct: 0,
        explanation: 'For a PutObject to succeed: the identity policy MUST allow it (even if the bucket policy allows it). Add s3:PutObject to the developer\'s role.',
      },
      {
        screen: 'IAM · Developer\'s role · Trust relationship',
        prompt: 'After adding s3:PutObject, you test and still get Access Denied. You check the role\'s trust policy (assume-role policy).',
        question: 'When would the trust policy block a PutObject call?',
        options: [
          'Never, trust policy only controls who can assume the role, not what they can do with it',
          'If the trust policy Principal does not include the AWS account root or the user principal attempting to use the role',
          'If the trust policy is missing the s3:PutObject action',
          'Trust policy is irrelevant for S3 actions',
        ],
        correct: 1,
        explanation: 'Trust policy gates role assumption. If the developer\'s principal is not allowed to assume the role, they can never get the role\'s permissions. Once assumed, the role\'s permissions policy controls what they can do.',
      },
      {
        screen: 'IAM · Permissions boundary',
        prompt: 'The developer still cannot upload. You notice the role has a Permissions Boundary: arn:aws:iam::ACCOUNT:policy/BoundaryPolicy, which grants only ec2:* and rds:*.',
        question: 'What is the effect of this permissions boundary?',
        options: [
          'It extends the developer\'s permissions to include EC2 and RDS',
          'It caps the developer\'s maximum permissions; s3:PutObject is filtered OUT even though the identity policy grants it',
          'Boundaries only apply to users, not roles',
          'It has no effect on S3 actions',
        ],
        correct: 1,
        explanation: 'Permissions boundaries set a max ceiling: the intersection of (identity policy AND boundary) is what the principal can do. Here, s3:PutObject is NOT in the boundary, so it is capped regardless of the identity policy. Fix: modify the boundary to include s3:*.',
      },
      {
        screen: 'Organizations · SCPs',
        prompt: 'After fixing the boundary, the developer still gets Access Denied. You navigate to Organizations and check the SCP on the developer\'s account.',
        question: 'How do SCPs interact with identity policies?',
        options: [
          'SCPs allow or deny based on the AWS account root. They do NOT apply to individual users or roles',
          'SCPs apply to the account and all its principals; they are a second veto gate after identity policies',
          'SCPs override identity policies, if an SCP denies, it is always denied',
          'SCPs only control billing permissions',
        ],
        correct: 1,
        explanation: 'SCP permission evaluation: (identity policy AND SCP AND resource policy). If an SCP denies s3:PutObject, all principals in that account are denied, even if their identity policy allows it.',
      },
    ],
  },

  // ── Domain 1 (IAM), Drill 2: Federation & temporary credentials ──────────
  {
    id: 'aws-drill-iam-federation',
    portal: D1,
    title: 'Federate an on-prem Okta identity to AWS',
    scenario: 'Your CISO wants on-prem Okta users to authenticate to AWS Console without an AWS IAM user per person. Set up SAML 2.0 federation via IAM Identity Center.',
    difficulty: 'intermediate',
    objectives: ['SCS-C03 Domain 4: Identity and Access Management (20%)'],
    steps: [
      {
        screen: 'AWS Console · IAM Identity Center',
        prompt: 'You navigate to IAM Identity Center (the SAML federation hub for AWS). You see Settings and Users.',
        question: 'Where do you start to connect Okta as the external IdP?',
        options: [
          'Users → Create user',
          'Settings → Authentication',
          'Settings → Identity source → Change identity source',
          'Access portal settings',
        ],
        correct: 2,
        explanation: 'To federate an external IdP (Okta), go to Settings → Identity source → Change identity source. By default, Identity Center uses its built-in directory; changing it to External IdP (SAML/SCIM) enables Okta.',
      },
      {
        screen: 'IAM Identity Center · Change identity source',
        prompt: 'You select "External identity provider" and are prompted for the IdP metadata.',
        question: 'What must you provide to Identity Center to establish SAML trust with Okta?',
        options: [
          'Okta API key',
          'Okta SAML metadata URL (or upload the metadata XML)',
          'Okta admin password',
          'A symmetric encryption key',
        ],
        correct: 1,
        explanation: 'You provide Okta\'s SAML IdP metadata (public key, endpoints) to Identity Center. Identity Center also generates its own SAML SP metadata for you to upload into Okta to complete the trust circle.',
      },
      {
        screen: 'IAM Identity Center · Permission sets',
        prompt: 'After SAML trust is established, you want to map Okta groups to AWS roles. Permission sets define the scope of access.',
        question: 'What does a Permission Set contain?',
        options: [
          'A list of individual Okta users',
          'IAM policies and optional permissions boundary that define what actions are allowed',
          'Okta group membership rules',
          'AWS account numbers only',
        ],
        correct: 1,
        explanation: 'Permission sets are reusable bundles of IAM policies. You can reuse one Permission Set across many (account, group) pairs, similar to an IAM role but managed by Identity Center.',
      },
      {
        screen: 'IAM Identity Center · Assignment',
        prompt: 'You create a Permission Set "ReadOnly" containing ReadOnlyAccess policy. Now you assign it to Okta group "Engineers" across AWS accounts.',
        question: 'When an Okta engineer signs in to the Identity Center portal, what do they see?',
        options: [
          'A list of all AWS accounts in the organization (need to manually pick)',
          'A list of AWS accounts where their Okta group is assigned a Permission Set; they pick the account and role, and temporary credentials are generated',
          'Direct console access without any role selection',
          'An error because Okta is external',
        ],
        correct: 1,
        explanation: 'The portal shows only the (account, role/PermissionSet) pairs assigned to the user\'s groups. Clicking one triggers a federation flow and vends temporary credentials (STS AssumeRole).',
      },
      {
        screen: 'AWS Console · STS · Access advisor',
        prompt: 'You want to validate that temporary credentials from Okta federation are working. You check a user\'s recent activity.',
        question: 'Which STS API call confirms a user is receiving temporary credentials via federation?',
        options: [
          'iam:GetUser (only works for IAM users)',
          'sts:GetCallerIdentity; the response shows UserId as a role (e.g., AIDAI... vs AROA...)',
          'sts:DecodeAuthorizationMessage (for error messages only)',
          'iam:ListUsers to see if they are in the IAM user list',
        ],
        correct: 1,
        explanation: 'sts:GetCallerIdentity returns UserId starting with AROA (role assumed via federation) vs AIDAI (IAM user). Federated users have ARN like arn:aws:iam::ACCOUNT:role/... with a session component.',
      },
    ],
  },

  // ── Domain 2 (Infrastructure Security), Drill 1: VPC isolation ──────────────
  {
    id: 'aws-drill-vpc-isolation',
    portal: D2,
    title: 'Isolate a sensitive workload in a VPC',
    scenario: 'Your financial app must not be reachable from the public internet. Set up a VPC with private subnets, NAT gateways, and a bastion host for admin access.',
    difficulty: 'intermediate',
    objectives: ['SCS-C03 Domain 3: Infrastructure Security (18%)'],
    steps: [
      {
        screen: 'AWS Console · VPC',
        prompt: 'You are creating a new VPC for a financial workload. You see options for CIDR, DNS settings, and subnets.',
        question: 'Which CIDR range is most appropriate for a large private network with room for growth?',
        options: [
          '10.0.0.0/16 (65,536 addresses)',
          '10.0.0.0/24 (256 addresses)',
          '192.168.0.0/16 (65,536 addresses)',
          '172.31.0.0/16 (default, 65,536 addresses)',
        ],
        correct: 0,
        explanation: 'RFC 1918 (private IP ranges). 10.0.0.0/16 provides 65k addresses, large, future-proof, and the de-facto standard for enterprise workloads.',
      },
      {
        screen: 'VPC · Subnets',
        prompt: 'You create two private subnets (10.0.1.0/24 and 10.0.2.0/24) and one public subnet (10.0.0.0/24) across multiple AZs.',
        question: 'Why separate public and private subnets?',
        options: [
          'Public subnets allow EC2 instances to receive inbound traffic from the internet; private subnets do not',
          'Public and private subnets have different pricing',
          'Private subnets are faster',
          'No practical difference, just organizational preference',
        ],
        correct: 0,
        explanation: 'A public subnet routes 0.0.0.0/0 to an Internet Gateway (IGW). A private subnet routes 0.0.0.0/0 to a NAT gateway or instance. Instances in private subnets cannot be directly accessed from the internet.',
      },
      {
        screen: 'VPC · Security Groups',
        prompt: 'You create a security group "FinanceApp-SG" for your application tier (in private subnets). It currently allows ALL inbound traffic.',
        question: 'What should the inbound rules be?',
        options: [
          'Allow all (0.0.0.0/0) on ports 443, 8080',
          'Allow only from the load balancer SG (source = LB-SG) on port 8080; allow from the bastion SG on port 22',
          'Allow everything on port 443 only',
          'Allow SSH from anywhere (0.0.0.0/0) on port 22 for remote debugging',
        ],
        correct: 1,
        explanation: 'Least privilege: only the load balancer should talk to the app (port 8080), and only the bastion should SSH (port 22). Using security group IDs as sources is more secure than CIDR blocks and auto-adapts if SG members change.',
      },
      {
        screen: 'VPC · NAT Gateway',
        prompt: 'Your app tier in private subnets needs to reach an external API. You create a NAT gateway in the public subnet.',
        question: 'Why can the app tier reach the internet OUTBOUND through NAT, but nothing from the internet can initiate inbound to the app?',
        options: [
          'NAT is bidirectional, both inbound and outbound work',
          'NAT translates outbound source IP; return traffic is automatically SNATed back. Inbound connections must originate from outside, which NAT does not allow without explicit port forwarding (rare on AWS)',
          'The private subnet routes block inbound',
          'Security groups block inbound',
        ],
        correct: 1,
        explanation: 'NAT is stateful: outbound initiates a connection, and return traffic is rewritten. Inbound from the internet cannot initiate because there\'s no route; NAT only handles established-connection returns.',
      },
      {
        screen: 'VPC · Bastion Host (Jump Box)',
        prompt: 'Admins need SSH access to app instances for troubleshooting. You place a bastion host in the public subnet.',
        question: 'Why not give app instances elastic IPs and SSH them directly?',
        options: [
          'Bastion is just a preference, direct access is equally secure',
          'Bastion funnels all admin access through one controlled entry point; you audit SSH connections in one place and avoid exposing app instances directly to the internet',
          'Elastic IPs are expensive',
          'App instances cannot use elastic IPs if they are in private subnets',
        ],
        correct: 1,
        explanation: 'Bastion (or Session Manager, which is more modern) provides a controlled, auditable, single point of entry. Direct internet-facing SSH on app instances increases the blast radius.',
      },
    ],
  },

  // ── Domain 2 (Infrastructure Security), Drill 2: Network ACLs & security groups
  {
    id: 'aws-drill-nacls-sg',
    portal: D2,
    title: 'Troubleshoot network ACLs vs security groups',
    scenario: 'Traffic flows from EC2 in subnet A to EC2 in subnet B are blocked, even though security groups allow it. Diagnose the network ACL issue.',
    difficulty: 'advanced',
    objectives: ['SCS-C03 Domain 3: Infrastructure Security (18%)'],
    steps: [
      {
        screen: 'AWS Console · EC2',
        prompt: 'Instance i-1111 in subnet A (subnet-aaa) cannot ping instance i-2222 in subnet B (subnet-bbb). Both are in the same VPC.',
        question: 'Where do you check FIRST to diagnose blocked traffic?',
        options: [
          'Security groups (SGs) on both instances',
          'Network ACLs (NACLs) on both subnets',
          'Route tables to ensure traffic is routed between subnets',
          'VPC Flow Logs (if they exist)',
        ],
        correct: 0,
        explanation: 'Check SGs first (most common), then NACLs, then routes. SGs are stateful (allow response traffic automatically); NACLs are stateless (you must explicitly allow both inbound and outbound + return).',
      },
      {
        screen: 'EC2 Instance i-1111 · Security Group',
        prompt: 'i-1111\'s SG allows outbound to all (0.0.0.0/0) on all ports, but inbound is restricted to SSH (port 22) from 10.0.0.0/8.',
        question: 'Does i-1111\'s SG allow it to send ping (ICMP) to i-2222?',
        options: [
          'No: ICMP is not explicitly allowed in the outbound rules',
          'Yes, outbound allows "all" on all ports, which includes ICMP',
          'Only if i-2222\'s SG echoes back',
          'Depends on the NACL',
        ],
        correct: 1,
        explanation: 'Outbound "all" includes ICMP. If outbound is restricted (e.g., only TCP 443), then ICMP is blocked at the SG level.',
      },
      {
        screen: 'EC2 Instance i-2222 · Security Group',
        prompt: 'i-2222\'s SG has: inbound allows ICMP from 10.0.0.0/8; outbound allows all.',
        question: 'With both SGs configured above, can i-1111 successfully ping i-2222?',
        options: [
          'Yes, both allow ICMP',
          'No: NACLs will still block it',
          'Yes: SGs are sufficient (assuming NACLs are default allow-all)',
          'Cannot determine without seeing NACLs',
        ],
        correct: 2,
        explanation: 'SGs alone: i-1111 can send (outbound all), i-2222 can receive (inbound ICMP). Default NACLs allow all traffic. If NACLs are customized, they become the next check.',
      },
      {
        screen: 'Subnet-aaa · Network ACL',
        prompt: 'You check subnet-aaa\'s NACL. Rule 100 (lowest priority) allows 0.0.0.0/0 on all ports outbound. Rule 110 explicitly denies ICMP (protocol 58) outbound to 10.0.0.0/8.',
        question: 'Will ping from i-1111 leave subnet-aaa?',
        options: [
          'Yes, rule 100 allows all',
          'No, rule 110 denies ICMP before rule 100 is evaluated',
          'Yes, outbound is checked before inbound',
          'Depends on the destination security group',
        ],
        correct: 1,
        explanation: 'NACLs are stateless, evaluated in order (lowest rule number first). Rule 110 (deny ICMP) is evaluated before rule 100 (allow all), so ICMP is blocked at the NACL.',
      },
      {
        screen: 'Subnet-aaa · Network ACL · Edit rules',
        prompt: 'You delete or modify rule 110 to allow ICMP. Now ping succeeds. But the response from i-2222 is still not reaching i-1111.',
        question: 'Which NACL must also allow ICMP inbound?',
        options: [
          'Subnet-aaa (the source subnet)',
          'Subnet-bbb (the destination subnet)',
          'The main route table NACL',
          'Only subnet-aaa matters',
        ],
        correct: 1,
        explanation: 'NACLs are stateless. The response (ICMP echo reply from i-2222 back to i-1111) must exit subnet-bbb (outbound) and enter subnet-aaa (inbound). Both subnets\' NACLs must allow bidirectional ICMP.',
      },
      {
        screen: 'Subnet-bbb · Network ACL',
        prompt: 'You check subnet-bbb\'s NACL. Inbound allows 0.0.0.0/0 all ports; outbound denies ICMP to 10.0.0.0/8 (rule 90).',
        question: 'Fix the NACL rule so the response can leave subnet-bbb.',
        options: [
          'Delete rule 90',
          'Delete all outbound rules',
          'Modify rule 90 to Allow (or add a new rule 80 allowing ICMP outbound to 10.0.0.0/8)',
          'Add a rule allowing ICMP inbound on subnet-bbb',
        ],
        correct: 2,
        explanation: 'The response must leave subnet-bbb outbound, so the outbound NACL on subnet-bbb must allow ICMP to 10.0.0.0/8. Add a rule 80 (lower number, higher priority) to allow it.',
      },
    ],
  },

  // ── Domain 3 (Data Protection), Drill 1: KMS key policy + IAM ──────────────
  {
    id: 'aws-drill-kms-policy',
    portal: D3,
    title: 'Authorize an IAM role to decrypt with KMS',
    scenario: 'Your app in EC2 needs to decrypt an RDS password stored in Secrets Manager. The secret is encrypted with a KMS key. Set up the minimal permissions.',
    difficulty: 'advanced',
    objectives: ['SCS-C03 Domain 5: Data Protection (18%)'],
    steps: [
      {
        screen: 'AWS KMS · Keys',
        prompt: 'You select the KMS key (arn:aws:kms:...:key/abc123) used to encrypt the Secrets Manager secret. You want to check if the EC2 role can decrypt.',
        question: 'Where do you find the key\'s access control?',
        options: [
          'The EC2 instance\'s IAM role policy',
          'The KMS key\'s key policy (the primary access control for KMS)',
          'The Secrets Manager secret\'s policy only',
          'EC2 security group rules',
        ],
        correct: 1,
        explanation: 'KMS enforces access via TWO gates: (1) KMS key policy (the main gate), (2) IAM policy on the principal. BOTH must allow the action. Key policy > IAM policy in priority.',
      },
      {
        screen: 'KMS · Key policy (JSON)',
        prompt: 'You examine the key policy. The Sid "Enable IAM User Permissions" allows root (account principal) all KMS actions. The Sid "Allow Secrets Manager to use the key" allows secretsmanager.amazonaws.com kms:Decrypt and kms:GenerateDataKey on the key.',
        question: 'Can your EC2 role decrypt the secret if its IAM policy grants kms:Decrypt on this key?',
        options: [
          'Yes: IAM policy is enough',
          'No, the key policy allows only Secrets Manager and root, not the EC2 role',
          'Yes, because Secrets Manager is authorized, the role can use it transitively',
          'Only if the role is in the account root',
        ],
        correct: 1,
        explanation: 'Key policy does NOT include the EC2 role. Even if the role\'s IAM policy says "Allow kms:Decrypt", the key policy says "Not allowed". Both gates must allow it.',
      },
      {
        screen: 'KMS · Key policy · Edit',
        prompt: 'You edit the key policy to add a new statement authorizing your EC2 role arn:aws:iam::ACCOUNT:role/EC2-AppRole.',
        question: 'What is the minimal key policy statement to allow the EC2 role to decrypt?',
        options: [
          'Principal: arn:aws:iam::ACCOUNT:role/EC2-AppRole, Action: kms:*',
          'Principal: arn:aws:iam::ACCOUNT:role/EC2-AppRole, Action: [kms:Decrypt, kms:DescribeKey]',
          'Principal: "*", Action: kms:Decrypt (allow anyone)',
          'Principal: root, Action: kms:Decrypt (root can delegate)',
        ],
        correct: 1,
        explanation: 'Minimal: kms:Decrypt allows the operation, kms:DescribeKey (or kms:GenerateDataKey if requesting a fresh key) are standard companions. Never "kms:*" unless necessary.',
      },
      {
        screen: 'IAM · EC2-AppRole',
        prompt: 'You also update the EC2 role\'s IAM policy with: Effect: Allow, Action: kms:Decrypt, Resource: arn:aws:kms:...:key/abc123.',
        question: 'When the EC2 app calls secretsmanager:GetSecretValue, what happens internally?',
        options: [
          'Secrets Manager directly returns the plaintext secret (no KMS call)',
          'The EC2 role calls secretsmanager:GetSecretValue; Secrets Manager internally calls kms:Decrypt on behalf of the role; the response includes plaintext',
          'The EC2 role must call kms:Decrypt separately after calling GetSecretValue',
          'Secrets Manager returns the secret encrypted; the role decrypts it locally',
        ],
        correct: 1,
        explanation: 'Secrets Manager service vends the plaintext when you call GetSecretValue and the role has permission. Internally, Secrets Manager calls KMS decrypt. Your role needs permission for both secretsmanager:GetSecretValue AND (via key policy or IAM) kms:Decrypt.',
      },
      {
        screen: 'Secrets Manager · RDS secret',
        prompt: 'You verify the secret is encrypted with the KMS key and the role can decrypt. The app still gets "User: arn:aws:iam::...role/EC2-AppRole is not authorized to perform: kms:Decrypt".',
        question: 'What is the most likely cause?',
        options: [
          'The key policy was not saved',
          'The IAM policy on the role is correct, but the key policy statement you added has a Condition that excludes the region or service',
          'Secrets Manager is blocking access',
          'The role needs EC2 Instance Profile',
        ],
        correct: 1,
        explanation: 'Common pitfall: key policies with Conditions (e.g., StringEquals: aws:SourceVpc) can silently reject. Review the key policy Condition block; ensure it does not exclude your use case.',
      },
    ],
  },

  // ── Domain 3 (Data Protection), Drill 2: Encryption at rest & transit ─────
  {
    id: 'aws-drill-encryption-strategy',
    portal: D3,
    title: 'Design an encryption strategy: at rest vs in transit',
    scenario: 'Your compliance team requires encryption for PII stored in S3 and transmitted to a third-party API. Decide encryption modes and key management.',
    difficulty: 'intermediate',
    objectives: ['SCS-C03 Domain 5: Data Protection (18%)'],
    steps: [
      {
        screen: 'S3 Bucket · Default encryption',
        prompt: 'You enable "Default encryption" on the S3 bucket storing PII. Options: SSE-S3 (AES-256, S3-managed keys) or SSE-KMS (customer-managed keys in KMS).',
        question: 'Which satisfies "encryption at rest" and why?',
        options: [
          'Only SSE-KMS; S3-managed keys don\'t count as "encryption"',
          'Both satisfy encryption at rest; SSE-KMS adds key rotation, granular access control, and audit logging via CloudTrail',
          'Only SSE-S3; KMS adds unnecessary latency',
          'Neither, you must use client-side encryption before uploading',
        ],
        correct: 1,
        explanation: 'Both are "at rest" encryption. SSE-KMS is stricter: you control the key, can audit access, and can disable/rotate independently. SSE-S3 is simpler but you cannot revoke encryption if AWS account is compromised.',
      },
      {
        screen: 'S3 Bucket · Bucket policy',
        prompt: 'To enforce encryption at rest, you add a bucket policy that denies PutObject if the "x-amz-server-side-encryption" header is not "aws:kms".',
        question: 'What does this policy accomplish?',
        options: [
          'Forces all uploads to use SSE-KMS',
          'Allows both SSE-S3 and SSE-KMS',
          'Prevents unencrypted uploads (if the header is missing, the request is denied)',
          'Only works for new buckets',
        ],
        correct: 0,
        explanation: 'By denying PutObject without the header set to "aws:kms", you force SSE-KMS. Alternatively, you could allow PutObject ONLY if the header = "aws:kms", which is logically equivalent.',
      },
      {
        screen: 'Data transfer · TLS/HTTPS',
        prompt: 'Your app uploads PII to S3 and also sends it to a third-party API. You want encryption in transit. S3 supports HTTPS (TLS 1.2+). The third-party API supports TLS 1.0.',
        question: 'What is the minimum TLS version to accept for transmission to the third-party?',
        options: [
          'TLS 1.0 (legacy support)',
          'TLS 1.2 or higher (industry best practice; TLS 1.0/1.1 are deprecated)',
          'TLS 2.0',
          'No version requirement, encryption is encryption',
        ],
        correct: 1,
        explanation: 'TLS 1.0 and 1.1 are deprecated and have known vulnerabilities. Enforce TLS 1.2 minimum. If the third party only supports TLS 1.0, negotiate an upgrade or use an intermediary proxy with TLS termination.',
      },
      {
        screen: 'S3 Bucket · Block public access',
        prompt: 'You also enable "Block all public access" on the bucket to prevent accidental exposure of encrypted data.',
        question: 'Why is this important even though the data is encrypted?',
        options: [
          'Encryption is only protection, if the bucket is public, an attacker can download encrypted objects and brute-force the keys',
          'Encryption is the PRIMARY protection; blocking public access is a secondary control (defense in depth)',
          'Public S3 buckets automatically disable encryption',
          'It prevents CloudFront from accessing the bucket',
        ],
        correct: 1,
        explanation: 'Defense in depth: even encrypted data should not be exposed to the public internet. Encryption protects the data IF an attacker obtains it; blocking access prevents them from obtaining it in the first place.',
      },
      {
        screen: 'Secrets Manager · API key storage',
        prompt: 'The third-party API requires a static API key. You store it in Secrets Manager, encrypted with the same KMS key as the S3 data.',
        question: 'Why is Secrets Manager better than hardcoding the API key in environment variables?',
        options: [
          'Secrets Manager is a managed service; AWS handles encryption and rotation',
          'Secrets Manager allows automatic rotation (if the third-party supports it) and audit logging',
          'Both allow auditing; environment variables are equally secure',
          'Secrets Manager is mandatory for PII',
        ],
        correct: 1,
        explanation: 'Secrets Manager provides: encryption, automated rotation (if you write a Lambda rotator function), audit logging via CloudTrail, and access control via IAM + KMS key policy.',
      },
    ],
  },

  // ── Domain 4 (Security Logging & Monitoring), Drill 1: CloudTrail ─────────
  {
    id: 'aws-drill-cloudtrail',
    portal: D4,
    title: 'Investigate an unauthorized API call via CloudTrail',
    scenario: 'A security alarm fires: a non-admin user called iam:AttachUserPolicy on the CISO account. Investigate using CloudTrail logs.',
    difficulty: 'intermediate',
    objectives: ['SCS-C03 Domain 1: Detection (16%)'],
    steps: [
      {
        screen: 'CloudTrail · Event history',
        prompt: 'You query CloudTrail Event history for events in the past hour. You see iam:AttachUserPolicy called by arn:aws:iam::ACCOUNT:user/developer-1.',
        question: 'Where do you look to find the DETAILED CloudTrail log entries (including request/response body)?',
        options: [
          'CloudTrail Event history alone (shows high-level info only)',
          'CloudTrail Trails configured to send logs to S3; query those logs with Athena (see full JSON payloads)',
          'CloudWatch Logs only (does not show IAM events by default)',
          'VPC Flow Logs (for network traffic, not API calls)',
        ],
        correct: 1,
        explanation: 'Event history is a UI preview (limited fields, 90-day retention). For full audit, create a Trail that writes to S3; query with Athena or load into Splunk.',
      },
      {
        screen: 'CloudTrail · S3 logs (Athena query)',
        prompt: 'You query the S3 logs with Athena using the CloudTrail database. You find the full event: eventName = "AttachUserPolicy", eventSource = "iam.amazonaws.com", errorCode = "AccessDenied", errorMessage = "User: ... is not authorized".',
        question: 'Did the API call succeed or fail?',
        options: [
          'Succeeded, the policy was attached',
          'Failed, errorCode "AccessDenied" means the action was denied by the IAM policy or key policy',
          'Unclear, need to check the response body',
          'Succeeded, but returned a warning',
        ],
        correct: 1,
        explanation: 'If errorCode exists, the call failed. No errorCode = success. The developer-1 attempted but was denied.',
      },
      {
        screen: 'CloudTrail log entry · Examine fields',
        prompt: 'You inspect the full JSON log. The event includes: sourceIPAddress = "203.0.113.45", userAgent = "aws-cli/2.13", awsRegion = "us-east-1", requestParameters: { userName: "admin", policyArn: "arn:aws:iam::ACCOUNT:policy/AdminAccess" }.',
        question: 'What does sourceIPAddress tell you?',
        options: [
          'The IP of the attacker',
          'The IP from which the API call originated (the developer\'s machine or corporate proxy); useful for tracking insider threat or IP spoofing',
          'The IP of the IAM API endpoint',
          'Nothing useful, all IPs are logged equally',
        ],
        correct: 1,
        explanation: 'sourceIPAddress is the origin of the request. If it\'s an unexpected/foreign IP or outside business hours, it may indicate account compromise. Compare against expected corporate proxies or VPN endpoints.',
      },
      {
        screen: 'CloudTrail · User activity',
        prompt: 'You filter for all events from developer-1 in the past 24 hours. You see: CreateAccessKey (successful), AttachUserPolicy (denied), iam:UpdateAccessKeyLastUsed (successful).',
        question: 'What might explain this pattern?',
        options: [
          'The developer is doing routine work',
          'The developer may have been compromised or is testing privilege escalation; they created a new access key (to use elsewhere?) and attempted to escalate privileges (denied by policy), then updated activity logs to cover tracks',
          'CloudTrail logs are corrupted',
          'The developer is a rogue admin',
        ],
        correct: 1,
        explanation: 'Suspicious pattern: CreateAccessKey + PrivEsc attempt = credential compromise. Immediate response: disable developer-1\'s access, rotate all keys, and review all API calls.',
      },
      {
        screen: 'CloudTrail · Data events (optional advanced logging)',
        prompt: 'You also enable CloudTrail Data events for S3 to log object-level access (GetObject, PutObject), useful for detecting data exfiltration.',
        question: 'Why might you enable Data events in addition to Management events?',
        options: [
          'Management events are enough; Data events add cost without value',
          'Data events log actual data access (S3 GetObject, DynamoDB queries); Management events only log resource configuration changes (PutBucket, DeleteTable)',
          'Data events replace Management events (cannot use both)',
          'Data events are mandatory for CloudTrail',
        ],
        correct: 1,
        explanation: 'Management events: API calls to configure AWS. Data events: actual data access within resources. Together, they give you full visibility.',
      },
    ],
  },

  // ── Domain 4 (Security Logging & Monitoring), Drill 2: Security Lake ──────
  {
    id: 'aws-drill-security-lake',
    portal: D4,
    title: 'Centralize security logs with AWS Security Lake',
    scenario: 'Your organization has logs spread across CloudTrail, VPC Flow Logs, Guardduty findings, and multiple AWS accounts. Set up Security Lake to centralize and query.',
    difficulty: 'intermediate',
    objectives: ['SCS-C03 Domain 1: Detection (16%)'],
    steps: [
      {
        screen: 'Security Lake · Dashboard',
        prompt: 'You enable Security Lake in your organization. It creates a data lake in S3 (in the delegated admin account) and ingests from multiple sources.',
        question: 'What normalized schema does Security Lake use?',
        options: [
          'Raw CloudTrail JSON (each source has its own schema)',
          'OCSF (Open Cybersecurity Schema Framework), a vendor-neutral normalized format',
          'Splunk\'s internal format',
          'Parquet files with no schema',
        ],
        correct: 1,
        explanation: 'OCSF is the standard. Security Lake automatically converts CloudTrail, VPC Flow Logs, GuardDuty findings, Route 53 logs, etc. into one normalized schema.',
      },
      {
        screen: 'Security Lake · Sources',
        prompt: 'You configure multiple AWS accounts to send logs to Security Lake. You also want to ingest third-party firewall logs.',
        question: 'How do you ingest third-party logs into Security Lake?',
        options: [
          'Security Lake only supports AWS native sources',
          'Upload third-party logs to S3; Security Lake ingests them if they match OCSF',
          'Use a Lambda function to convert third-party logs to OCSF and write to Security Lake S3 bucket',
          'Third-party logs must use Kinesis Data Firehose (requires additional setup)',
        ],
        correct: 2,
        explanation: 'Security Lake accepts OCSF-formatted data. For third-party sources, you build a Lambda or use existing connectors to transform and load into Security Lake.',
      },
      {
        screen: 'Security Lake · Athena queries',
        prompt: 'You want to hunt for lateral movement: accounts that accessed an S3 bucket and then spawned EC2 instances in another account.',
        question: 'How do you query Security Lake logs?',
        options: [
          'Web UI manual search (slow)',
          'Athena SQL queries against the Security Lake S3 tables (normalized, searchable)',
          'Download CSV and analyze locally',
          'Ask AWS Support to run queries',
        ],
        correct: 1,
        explanation: 'Security Lake automatically creates Athena tables (partitioned by source, region, time). Run SQL queries to correlate events across sources.',
      },
      {
        screen: 'Security Lake · Query result',
        prompt: 'Your Athena query returns: Account A user called s3:GetObject on Account B\'s S3 bucket at 14:30, then the same user called ec2:RunInstances at 14:35.',
        question: 'What additional investigation would you do?',
        options: [
          'Assume it\'s normal activity',
          'Check if the user is cross-account federated (expected); review the S3 object accessed (was it sensitive?); check if the EC2 instance is running in Account B or a different account (lateral move indicator)',
          'Immediately block the user',
          'Check only Security Lake',
        ],
        correct: 1,
        explanation: 'Correlation is a lead, not proof. Cross-account access is sometimes legitimate (federated roles). Review what was accessed (sensitive data?) and where the instance landed (escalation?).',
      },
      {
        screen: 'Security Lake · Cost and retention',
        prompt: 'You want to retain all logs for 2 years (compliance requirement), but Security Lake costs increase with data volume.',
        question: 'How do you manage cost while maintaining compliance?',
        options: [
          'Store all logs in hot Athena tables indefinitely',
          'Use S3 Intelligent-Tiering or lifecycle policies to move older logs to Glacier/Deep Archive; Athena can still query them (slower, but cheaper)',
          'Delete logs after 90 days',
          'Compress logs manually',
        ],
        correct: 1,
        explanation: 'S3 lifecycle rules move old data to cheaper storage tiers. Athena can still query Glacier/Archive objects (takes longer). This balances cost and compliance.',
      },
    ],
  },

  // ── Domain 5 (Threat Detection & Incident Response), Drill 1: GuardDuty ─────
  {
    id: 'aws-drill-guardduty',
    portal: D5,
    title: 'Respond to a GuardDuty finding: compromised EC2 instance',
    scenario: 'GuardDuty raises a Finding: "EC2 instance i-1234 performing network reconnaissance (UnauthorizedAccess:EC2/SSHBrute)". Investigate and remediate.',
    difficulty: 'intermediate',
    objectives: ['SCS-C03 Domain 2: Incident Response (14%)'],
    steps: [
      {
        screen: 'GuardDuty · Findings',
        prompt: 'You open the finding. Severity = High. Type = UnauthorizedAccess:EC2/SSHBrute. Details show the instance has been attempting SSH connections to multiple IPs on port 22.',
        question: 'What does this finding indicate?',
        options: [
          'The instance is misconfigured; no threat',
          'The instance is likely compromised and is launching an SSH brute-force attack against other assets (in your VPC or external)',
          'GuardDuty is malfunctioning',
          'The instance is the victim of an attack, not the attacker',
        ],
        correct: 1,
        explanation: 'GuardDuty detects the EC2 instance as the SOURCE of suspicious outbound traffic (SSH brute-force). This indicates the instance or an application on it is compromised.',
      },
      {
        screen: 'GuardDuty · Finding details',
        prompt: 'You examine the finding metadata. It includes: resource (i-1234 in VPC vpc-xxx, subnet subnet-yyy), network connections (targets: 10.0.2.0/24, external IPs 203.0.113.0/24), first seen = 2 hours ago.',
        question: 'What is your FIRST response action?',
        options: [
          'Terminate the instance immediately',
          'Enable termination protection and isolate the instance (modify security group to deny all outbound) to preserve forensic evidence; take a snapshot of the volume for offline analysis',
          'Ignore until more data arrives',
          'Email the team a notice',
        ],
        correct: 1,
        explanation: 'Best practice: isolate before terminating. Move the instance to a "quarantine" security group that denies all traffic, then capture the volume for forensic analysis before cleanup.',
      },
      {
        screen: 'AWS Systems Manager · Session Manager',
        prompt: 'You use Session Manager (preferred over SSH) to connect to i-1234 for live investigation (while it is isolated). You want to find the malicious process.',
        question: 'What commands help you identify the rogue process?',
        options: [
          'ps aux | grep ssh (find SSH processes); netstat -tuln (find listening sockets); history (check command history for clues)',
          'ifconfig only',
          'aws guardduty get-findings (run inside the instance)',
          'Nothing, just terminate and restore from backup',
        ],
        correct: 0,
        explanation: 'Live forensics: check running processes (ps), network connections (netstat), and command history. Look for unusual process names, high CPU/network, recent edits to SSH configs.',
      },
      {
        screen: 'EC2 Instance · Systems Manager Run Command',
        prompt: 'You run a command to check cron jobs and SSH authorized_keys for backdoors. You find a suspicious entry in ~/.ssh/authorized_keys with a public key not matching any known admin.',
        question: 'What does this indicate?',
        options: [
          'The instance is fine; the key is legitimate',
          'An attacker has added a persistence mechanism; they can log in anytime with the corresponding private key',
          'SSH is misconfigured',
          'The key was expected',
        ],
        correct: 1,
        explanation: 'A backdoor key in authorized_keys allows the attacker to re-enter even after the password is changed. Remove it, review all added keys, and change all credentials.',
      },
      {
        screen: 'Incident Response · Remediation',
        prompt: 'After analysis, you: (1) remove the backdoor key, (2) kill the rogue process, (3) patch the OS, (4) change all credentials (SSH, app API keys). You restore the instance to production.',
        question: 'What is the FINAL verification step?',
        options: [
          'Assume it\'s secure; move on',
          'Re-run GuardDuty finding analysis or trigger a manual detection to confirm no more suspicious activity is detected',
          'Monitor for 24 hours only',
          'Just check CloudWatch metrics',
        ],
        correct: 1,
        explanation: 'After remediation, verify that GuardDuty (and other detections like VPC Flow Logs, System Manager Compliance) show the instance as healthy again. If findings persist, the threat is not fully resolved.',
      },
    ],
  },

  // ── Domain 5 (Threat Detection & Incident Response), Drill 2: Security Hub
  {
    id: 'aws-drill-security-hub',
    portal: D5,
    title: 'Triage findings in AWS Security Hub',
    scenario: 'Security Hub aggregates findings from GuardDuty, Config, Inspector, IAM Access Analyzer, and third-party tools. You have 200 findings and must prioritize.',
    difficulty: 'intermediate',
    objectives: ['SCS-C03 Domain 2: Incident Response (14%)'],
    steps: [
      {
        screen: 'Security Hub · Findings',
        prompt: 'You sort findings by severity. 5 Critical, 30 High, 165 Medium/Low. The Critical ones are: 1 from GuardDuty (UnauthorizedAccess), 3 from Config (unencrypted RDS), 1 from IAM Access Analyzer (external account access).',
        question: 'Which is the highest priority to fix FIRST?',
        options: [
          'The GuardDuty finding (active threat)',
          'The Config findings (compliance drift)',
          'The IAM Access Analyzer finding (misconfigured access)',
          'All equally critical',
        ],
        correct: 0,
        explanation: 'Active threats (GuardDuty) take precedence over compliance drift or misconfigured permissions. Respond to the breach in progress first, then remediate compliance.',
      },
      {
        screen: 'Security Hub · Workflow status',
        prompt: 'You click the GuardDuty finding. It has Workflow status = "NEW" and RecordState = "ACTIVE". You assign it to yourself and change Workflow status to "IN_PROGRESS".',
        question: 'What does changing Workflow status accomplish?',
        options: [
          'Resolves the finding (closes the incident)',
          'Tracks your investigation progress in Security Hub; does not resolve the underlying AWS issue',
          'Automatically remediates the problem',
          'Sends a notification to AWS Support',
        ],
        correct: 1,
        explanation: 'Workflow status is for your team\'s incident tracking (NEW → IN_PROGRESS → NOTIFIED/SUPPRESSED/RESOLVED). RecordState (ACTIVE vs ARCHIVED) tracks the actual AWS security state.',
      },
      {
        screen: 'Security Hub · Integration with Automation',
        prompt: 'You want to auto-remediate the three unencrypted RDS findings. You create an Automation rule that triggers an EventBridge → Lambda → enable RDS encryption.',
        question: 'Why is EventBridge + Lambda the right approach?',
        options: [
          'Security Hub has built-in auto-remediation that handles this',
          'EventBridge fires on new/updated findings; Lambda executes custom remediation (enabling encryption, modifying DB); reduces manual triage time',
          'Manual remediation is the only safe way',
          'Config Remediation is mandatory',
        ],
        correct: 1,
        explanation: 'Security Hub + EventBridge + Automation Rule lets you trigger Lambda for each finding. This enables auto-remediation at scale (e.g., enable encryption on all DBs).',
      },
      {
        screen: 'Security Hub · Standards',
        prompt: 'Security Hub reports compliance against CIS AWS Foundations Benchmark and PCI DSS. You see 45 failing controls across these standards.',
        question: 'How do you prioritize?',
        options: [
          'Fix all 45 at once',
          'Map findings to your business-critical assets first; remediate high-value targets before low-impact ones',
          'Ignore standards; focus only on active threats',
          'All controls are equally important',
        ],
        correct: 1,
        explanation: 'Prioritize: (1) Active threats, (2) High-value assets (databases, VPCs, secrets), (3) Compliance mandates (PCI for payment systems), (4) Best practice (CIS).',
      },
      {
        screen: 'Security Hub · Custom insights',
        prompt: 'You create a custom insight: Findings where Severity = HIGH AND Resource type = "AwsRds" AND RecordState = "ACTIVE".',
        question: 'What does this insight help you do?',
        options: [
          'Automatically fix RDS findings',
          'Quickly filter and focus on high-severity RDS issues across your entire organization; reusable for dashboards and trends',
          'Delete findings',
          'Suppress findings',
        ],
        correct: 1,
        explanation: 'Custom insights are saved searches. You can pin them to dashboards, export for reports, and use them to identify patterns (e.g., "all RDS issues by account").',
      },
    ],
  },

  // ── Domain 6 (Management & Governance), Drill 1: AWS Config ─────────────────
  {
    id: 'aws-drill-aws-config',
    portal: D6,
    title: 'Audit compliance with AWS Config',
    scenario: 'Your compliance audit requires proof that all S3 buckets have versioning enabled. Set up Config to continuously audit this.',
    difficulty: 'beginner',
    objectives: ['SCS-C03 Domain 6: Security Foundations and Governance (14%)'],
    steps: [
      {
        screen: 'AWS Config · Getting started',
        prompt: 'You enable AWS Config. It creates a Config Recorder, Config Delivery Channel, and an S3 bucket for storing config snapshots.',
        question: 'What does the Config Recorder do?',
        options: [
          'Records video of console activity',
          'Periodically snapshots the current state of all AWS resources (EC2, S3, RDS, etc.) and sends events when state changes',
          'Records AWS API calls (that is CloudTrail)',
          'Only records security findings',
        ],
        correct: 1,
        explanation: 'Config Recorder tracks resource configuration state (not API calls; that is CloudTrail). When you modify a resource, Config detects it and evaluates it against Rules.',
      },
      {
        screen: 'AWS Config · Rules',
        prompt: 'You create a Config Rule: "s3-bucket-versioning-enabled". This rule evaluates all S3 buckets and flags those without versioning.',
        question: 'Which rule type is this?',
        options: [
          'AWS-managed rule (pre-built by AWS)',
          'Custom rule (you write the Lambda)',
          'Config Conformance pack (bundled set of rules)',
          'Remediation rule (auto-fixes issues)',
        ],
        correct: 0,
        explanation: 's3-bucket-versioning-enabled is an AWS-managed rule. AWS provides ~250 pre-built rules for common controls. You can use Custom rules or Conformance Packs for more complex logic.',
      },
      {
        screen: 'AWS Config · Rule compliance',
        prompt: 'The rule evaluates 15 S3 buckets. 12 are COMPLIANT (versioning enabled), 3 are NON_COMPLIANT.',
        question: 'What can you do next?',
        options: [
          'Nothing, the rule just reports',
          'Manually enable versioning on the 3 buckets, or use a Remediation action (automated fix) if Config provides one',
          'Delete the non-compliant buckets',
          'Disable the rule',
        ],
        correct: 1,
        explanation: 'Config rules identify drift. Remediation is optional: auto-remediation (Lambda) or manual. For versioning, AWS provides an automated remediation action.',
      },
      {
        screen: 'AWS Config · Conformance Packs',
        prompt: 'Instead of individually creating rules, you deploy a Conformance Pack: "CIS-AWS-Foundations-Benchmark". It includes ~15 rules for S3, EC2, IAM, etc.',
        question: 'Why use a Conformance Pack?',
        options: [
          'Faster deployment; single click to audit against an industry framework (CIS, PCI, HIPAA)',
          'Conformance Packs have special permissions',
          'Must use Conformance Packs for compliance',
          'Conformance Packs auto-remediate everything',
        ],
        correct: 0,
        explanation: 'Conformance Packs bundle related rules aligned to a framework. CIS-AWS includes S3 encryption, CloudTrail, MFA, etc. Deploy once; audit continuously.',
      },
      {
        screen: 'AWS Config · Aggregator (multi-account)',
        prompt: 'Your organization has 5 AWS accounts. You want a central compliance dashboard across all accounts. You create a Config Aggregator.',
        question: 'What does an Aggregator do?',
        options: [
          'Combines Config data from multiple accounts and regions into one view',
          'Deletes non-compliant resources',
          'Only works for S3',
          'Replaces per-account Config',
        ],
        correct: 0,
        explanation: 'A delegated admin account creates a Config Aggregator; member accounts authorize it. You then see all findings in a central dashboard (handy for org-wide audits).',
      },
    ],
  },

  // ── Domain 6 (Management & Governance), Drill 2: IAM Access Analyzer ────────
  {
    id: 'aws-drill-iam-access-analyzer',
    portal: D6,
    title: 'Detect oversharing with IAM Access Analyzer',
    scenario: 'IAM Access Analyzer flags a resource: "S3 bucket MyData is accessible from an external AWS account (123456789012)". Evaluate and remediate.',
    difficulty: 'intermediate',
    objectives: ['SCS-C03 Domain 6: Security Foundations and Governance (14%)'],
    steps: [
      {
        screen: 'IAM Access Analyzer · Findings',
        prompt: 'The finding shows: Resource = S3 bucket MyData, Finding type = EXTERNAL_ACCESS, Principal = arn:aws:iam::123456789012:root (an external account root).',
        question: 'How did IAM Access Analyzer detect this?',
        options: [
          'It monitors actual API calls',
          'It analyzed the bucket policy and found Principal: 123456789012:root with an Allow statement',
          'It monitors VPC Flow Logs',
          'It is a guess',
        ],
        correct: 1,
        explanation: 'Access Analyzer walks all resource-based policies (bucket, SNS, SQS, KMS, Lambda, etc.) and identifies which principals (users, roles, accounts) can access them. If a principal is outside your account, it flags it as external access.',
      },
      {
        screen: 'S3 Bucket policy',
        prompt: 'You review the bucket policy. It grants s3:GetObject and s3:ListBucket to Principal: 123456789012:root on Resource: arn:aws:s3:::MyData/*.',
        question: 'Is this oversharing, and should you fix it?',
        options: [
          'Yes, remove the external account entirely',
          'Depends: if the external account is a trusted partner or subsidiary, this might be intentional; if not, fix it by removing the statement or tightening the principal to a specific role',
          'No, external accounts can always access S3',
          'Cannot determine without knowing the external account',
        ],
        correct: 1,
        explanation: 'External access is contextual. Evaluate: (1) Is the account trusted? (2) Does it need this level of access? (3) Should you limit to a specific role instead of root? If not trusted, remove.',
      },
      {
        screen: 'IAM Access Analyzer · Validation',
        prompt: 'You ask the external account owner (via email) if they still need access. They say no. You remove the account from the bucket policy.',
        question: 'How do you confirm the fix worked?',
        options: [
          'Just delete the policy',
          're-run the Analyzer or wait for the next scan; the finding should clear',
          'Nothing, deletion is instant',
          'The bucket is now private',
        ],
        correct: 1,
        explanation: 'Access Analyzer runs continuous scans (on schedule). After you update the policy, re-run the analyzer manually or wait for the next automatic scan. The finding should resolve.',
      },
      {
        screen: 'IAM Access Analyzer · KMS key',
        prompt: 'Access Analyzer also flags a KMS key: principal = "arn:aws:iam::999999999999:root" can call kms:Decrypt on your KMS key.',
        question: 'How would this happen?',
        options: [
          'KMS key policy explicitly grants Decrypt to the external account',
          'The key was shared via key policy; external account can only decrypt if it also has an identity policy granting kms:Decrypt',
          'KMS keys are never shared',
          'Only root can Decrypt KMS keys',
        ],
        correct: 1,
        explanation: 'The key policy (resource-based) + the external account\'s identity policy (if it allows kms:Decrypt) = the external account can decrypt. Fix: modify the key policy to limit principals.',
      },
      {
        screen: 'IAM Access Analyzer · Suppression',
        prompt: 'You have a finding that represents intentional external access (a partner integration). Instead of removing it, you mark the finding as "Archived" with a note explaining it is intentional.',
        question: 'Why would you suppress rather than ignore?',
        options: [
          'Suppressed findings stop appearing; you maintain a record of approved sharing',
          'Suppressed findings are deleted',
          'No difference, suppression and ignore are the same',
          'Suppression only works for S3',
        ],
        correct: 0,
        explanation: 'Suppression/archiving keeps the finding for audit purposes but removes it from the active list. You can later prove to auditors: "This external access is intentional and approved."',
      },
    ],
  },

];

export const AWS_SCSC03_BUCKET_COLORS: Record<string, string> = {
  'Identity and Access Management':      'bg-blue-500/10 text-blue-300 border-blue-500/30',
  'Infrastructure Security':             'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  'Data Protection':                     'bg-violet-500/10 text-violet-300 border-violet-500/30',
  'Security Logging and Monitoring':     'bg-amber-500/10 text-amber-300 border-amber-500/30',
  'Threat Detection and Incident Response': 'bg-red-500/10 text-red-300 border-red-500/30',
  'Management and Governance':           'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
};

export const AWS_SCSC03_DRILL_SET: DrillSet = {
  certId:    'SCS-C03',
  certLabel: 'AWS SCS-C03',
  drills:    AWS_SCSC03_DRILLS,
  buckets:   [D1, D2, D3, D4, D5, D6],
  bucketColors: AWS_SCSC03_BUCKET_COLORS,
};
