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

`SCS-C03` is retained as the **internal cert tag** across `lib/cert-exam-domains.ts`,
`lib/cert-domain-map.ts` and the tagged question, glossary and drill data. It is a
stable identifier only.

User-visible copy says **AWS Certified Security - Specialty** with no version
code, because AWS's published code has moved between C02 and C03 and pinning a
version in marketing copy is what created the earlier accuracy problem. The
domain structure and weightings below are what the material is written against.

If AWS republishes with materially different domains or weightings, update the
domain table here and in `lib/cert-exam-domains.ts`. The internal tag does not
need to change.
