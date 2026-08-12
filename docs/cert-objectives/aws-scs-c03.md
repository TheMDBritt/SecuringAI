# AWS Certified Security: Specialty (SCS-C03), Domain Outline

**Source (primary, still to be fetched):** https://aws.amazon.com/certification/certified-security-specialty/ (linked exam guide PDF)
**Source (secondary, user-transcribed 2026-08-11):** domain summary + weights pasted by the user in-session
**Sandbox status:** ⚠️ Direct network egress to d1.awsstatic.com is blocked. Domain outline + weights below are user-transcribed; per-service task statements still require the official AWS-published exam guide PDF.
**Rule of use:** Roadmap and orientation content may be written from the domain outline below. Individual technical claims about any AWS service (KMS key rotation, GuardDuty finding types, VPC endpoint policies, etc.) MUST cite the specific `docs.aws.amazon.com/<service>/` page they come from, never write from memory.

---

## Domains (user-transcribed, with weights)

| # | Domain | Weight | Focus |
|---|---|---|---|
| 1 | Identity and Access Management | **20%** | Policy evaluation, SCPs, permission boundaries, federation |
| 2 | Infrastructure Security | **20%** | VPC security, network firewalls, edge protections |
| 3 | Data Protection | **18%** | Encryption strategies, KMS, Secrets Manager, Macie |
| 4 | Security Logging and Monitoring | **18%** | CloudTrail, CloudWatch, Security Lake |
| 5 | Threat Detection and Incident Response | **14%** | GuardDuty, Security Hub, automated remediation workflows |
| 6 | Management and Governance | **10%** | Compliance reporting and governance services |
|   | **Total** | **100%** | |

---

## Cert-tag reconciliation note

The current AWS-published version is **SCS-C02** (as of 2026-08). SCS-C03 (this repo's tag) appears to be a forthcoming update. If AWS's published exam code differs when the primary PDF is fetched, either:
- (a) rename the repo tag `SCS-C03` → `SCS-C02` in `lib/cert-exam-domains.ts`, `lib/cert-domain-map.ts`, `components/playbook/CertMap.tsx`, and every glossary/quiz/topic entry, OR
- (b) keep `SCS-C03` if AWS has announced C03 by the time this file is populated.

Do not ship content commits until this is resolved.

---

## Still-needed from the primary source when it becomes available

- Full task-statement list per domain (AWS convention: 3-5 tasks per domain, each with 4-8 knowledge/skill bullets)
- Passing score confirmation (AWS convention: 750/1000 = 75%)
- Question count and time limit (SCS-C02 is 65 Qs, 170 min)
- Sample question types (single-response, multi-response, ordered-response, matching, case study, sample scenario)
- List of AWS services in scope (typically an appendix in the AWS exam guide)
