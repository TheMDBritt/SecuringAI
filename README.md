# Securing AI

[![CI](https://github.com/themdbritt/securingai/actions/workflows/ci.yml/badge.svg)](https://github.com/themdbritt/securingai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-informational.svg)](LICENSE)

A free, browser-based study tool for AI and LLM security. Practice attacking,
defending, and governing AI systems through hands-on scenarios mapped to the
published objectives of current AI security certifications.

> No accounts. No tracking. No ads. Open the app, pick a lab, start practising.

**Independent project.** Not affiliated with, endorsed by, or sponsored by
CompTIA, Microsoft, Amazon Web Services, Google, EC-Council, GIAC, ISC2, ISACA,
OWASP, MITRE, NIST or ISO. Certification names and exam codes identify the
subject matter studied and belong to their respective owners. Practice
questions are original material written against publicly published objectives,
not real exam questions. See [LICENSE](LICENSE) for the full notice.

## What it is

Three connected dojos covering the full offensive/defensive AI security loop:

| Dojo | Focus | Scenarios |
|------|-------|-----------|
| **Dojo 1, LLM Attack / Defense** | Attack and defend an LLM under live guardrail toggles. | Prompt Injection · Data Exfiltration · Policy Bypass · Tool Abuse · RAG Injection |
| **Dojo 2, AI-Assisted SOC** | Use AI as a SOC analyst. Score the AI's analysis against a quality rubric. | Log Triage · Alert Enrichment · Detection Rule Generation · Incident Report Draft |
| **Dojo 3, AI GRC** | Govern AI: risk-tier deployments, draft policy and controls, review third-party AI vendors. | AI Risk Classification · Policy & Controls Drafting · Third-Party AI Vendor Review |

Every turn is scored, classified, and mapped to certification exam domains.

## How the scoring works

* **Dojo 1** uses a deterministic outcome engine: guardrail settings
  (`injectionShield`, `strictPolicy`, `allowTools`, `ragEnabled`) decide whether
  an attack is *vulnerable*, *partial*, or *blocked*. Session score starts at
  100 and decays as attacks land, chained attacks stack penalties.
* **Dojo 2 / 3** use a quality rubric: per-scenario regex checks evaluate the
  AI's response for IOCs, MITRE T-codes, executive summaries, framework
  mappings, and so on. Disabled analyst capabilities are excluded from scoring.
* The evaluator also returns OWASP LLM Top 10 categorisation, MITRE ATT&CK
  references, and the relevant 2026 AI-security certification domains.

## Top 2026 AI Security Certifications mapped

Each scenario is tagged to exam domains drawn from the leading AI-security
certifications and frameworks. The tags appear in the Scoring pane after every
turn so you can see exactly which exam topic you just practiced.

| Certification / Framework | Provider | Coverage in this app |
|---------------------------|----------|----------------------|
| **CompTIA SecAI+** | CompTIA | All three dojos, vendor-neutral AI security practitioner |
| **ISC2 CAISP** | ISC2 | Dojo 1 + Dojo 2, Certified in AI Systems Security Practitioner |
| **ISACA AAISM** | ISACA | Dojo 2 + Dojo 3, Advanced AI Security Management |
| **EC-Council CAIS** | EC-Council | Dojo 1 + Dojo 3, Certified AI Security Specialist |
| **CSA AI Controls Matrix**    | Cloud Security Alliance | Agentic + RAG controls (Dojo 1 + Dojo 3) |
| **OWASP LLM Top 10 (2025)**   | OWASP        | Dojo 1 attack scenarios |
| **NIST AI RMF 1.0**           | NIST         | Govern / Map / Measure / Manage across all dojos |
| **ISO/IEC 42001**             | ISO          | Dojo 3 policy & governance |
| **EU AI Act**                 | EU           | Dojo 3 high-risk AI obligations |
| **MITRE ATT&CK**              | MITRE        | Dojo 2 SOC scenarios |
| **Microsoft SC-500** (beta May 2026) | Microsoft | Playbook: Cloud and AI Security Engineer Associate (replaces AZ-500). 7 deep-dive topics + 44 glossary terms + 110 practice questions covering Entra ID, Defender XDR, Sentinel/KQL, Defender for Cloud, Purview DSPM for AI, Azure OpenAI hardening, and Security Copilot |
| **AWS Certified Security - Specialty** | Amazon Web Services | Playbook, cloud security engineering mapped to AI/ML workloads: threat detection & IR, logging & monitoring, infrastructure security, IAM, data protection, and governance |

## Running locally

```bash
git clone https://github.com/themdbritt/securingai.git
cd securingai
npm install
npm run dev
```

Open http://localhost:3000.

Before opening a PR:

```bash
npm run verify   # typecheck, lint and tests
npm run build
```

The app runs out of the box with **no API key**. In stub mode every Dojo 1
attack outcome is fully deterministic and scoring is unaffected; only the
free-form Dojo 2 / Dojo 3 model output is replaced with a placeholder.

To enable real AI replies in Dojo 2 / Dojo 3, copy `.env.example` to `.env`
and set `OPENAI_API_KEY`. That is the only required environment variable.

> **Before setting a key on a public deployment**, set a monthly budget limit
> on the provider account (platform.openai.com, Settings, Limits). The app has
> no accounts, so three endpoints spend money for anonymous callers. The in-app
> per-IP rate limit and `DAILY_MODEL_REQUEST_LIMIT` are process-local and reset
> on serverless cold start, which makes them a brake rather than a ceiling. The
> provider-side cap is the only hard stop.

## Deploying

Push the repo to Vercel, it auto-detects the Next.js framework via
`vercel.json`. The only optional environment variable to configure in the
Vercel dashboard is `OPENAI_API_KEY`.

## Security and privacy

* No accounts, no logins, no analytics, no ads.
* Study progress is stored in `localStorage` only and never transmitted.
  Export and import it from Settings.
* Model API keys are read server-side only and never reach the browser.
* Every API route validates input with Zod and enforces same-origin, a per-IP
  rate limit, a 64 KB body ceiling, and a shared daily request budget
  (`lib/api-guard.ts`).
* Security headers including CSP, HSTS and X-Frame-Options are set in
  `next.config.js`.
* A safety pre-filter rejects functional exploit syntax. Payloads in this app
  are conceptual training artifacts, not working exploits.

Known limitation: the rate limiter and daily budget are process-local and reset
on serverless cold start, so they brake casual abuse rather than guarantee a
ceiling. The durable backstop is a spend cap on the provider account. See
[SECURITY.md](SECURITY.md) to report an issue.

## Testing

```bash
npm run test        # vitest
npm run typecheck
npm run lint
```

`tests/content-integrity.test.ts` enforces invariants on the study data:
unique ids, in-range answer indices, no truncated or duplicated options, no
answers that explain themselves, and no distractors a test-wise reader can
eliminate on sight. CI runs typecheck, lint, tests and build on every push.

## Contributing

Issues and PRs welcome. The architecture is documented in [`DESIGN.md`](./DESIGN.md).

## License

MIT for the code and the original study material. See [LICENSE](LICENSE),
which includes the trademark and content notice.
