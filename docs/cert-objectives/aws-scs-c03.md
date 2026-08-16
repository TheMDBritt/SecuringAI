# AWS Certified Security: Specialty (SCS-C03), Domain Outline

**Cert id:** SCS-C03

**Source (primary):** AWS Certified Security - Specialty (SCS-C03) exam guide, docs.aws.amazon.com/aws-certification/latest/security-specialty-03/
**Verified:** 2026-08-14 via search of the published AWS exam guide and two independent secondary sources (Pluralsight, Tutorials Dojo), which agree on all six domain names and weights.
**Sandbox status:** Direct egress to docs.aws.amazon.com and d1.awsstatic.com is blocked by the environment proxy, so the weights below are confirmed from published summaries of the official guide rather than read from the PDF. Task statements below cover Domain 1 only; the rest still need the PDF.
**Rule of use:** Individual technical claims about any AWS service (KMS key rotation, GuardDuty finding types, VPC endpoint policies) MUST cite the specific `docs.aws.amazon.com/<service>/` page they come from. Never write from memory.

---

## Exam facts

- **Exam code:** SCS-C03, live since 2 December 2025 (SCS-C02 retired 1 December 2025)
- **Question formats:** multiple choice, multiple response, plus ordering and matching introduced in C03
- **Six scored domains.** There is no separate AI/ML domain; generative AI security sits inside Domain 3 as Skill 3.2.7, "Implement protections and guardrails for generative AI applications"

## Domains (official SCS-C03 weights)

| # | Domain | Weight |
|---|---|---|
| 1 | Detection | **16%** |
| 2 | Incident Response | **14%** |
| 3 | Infrastructure Security | **18%** |
| 4 | Identity and Access Management | **20%** |
| 5 | Data Protection | **18%** |
| 6 | Security Foundations and Governance | **14%** |
|   | **Total** | **100%** |

### What changed from SCS-C02

C02's "Threat Detection and Incident Response" and "Security Logging and Monitoring" were restructured into two separate domains, Detection and Incident Response. IAM rose from 16% to 20% and is now the single heaviest domain. IAM, Data Protection and Infrastructure Security together account for 56% of the exam.

### Task statements captured so far

- **Task 1.1** Design and implement monitoring and alerting solutions for an AWS account or organization
  - Skill 1.1.1 Analyze workloads to determine monitoring requirements
  - Skill 1.1.2 Design and implement workload monitoring strategies
- **Task 2.1** Design and test an incident response plan
- **Skill 3.2.7** Implement protections and guardrails for generative AI applications

### Still needed from the primary source

- Full task and skill statements for Domains 2 through 6
- The in-scope AWS services and features list

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
