# LLM Dojo — Autonomous Improvement Log
**Date:** 2026-03-25
**Scope:** Dojo 2 (AI Secures Assets) + Dojo 3 (Defense vs AI Attacks)
**File Modified:** `lib/evaluator.ts`
**Dojo 1:** UNTOUCHED — all code paths verified intact

---

## What Was Audited

Performed a full read of all key files before making changes:
- `lib/evaluator.ts` — quality evaluation logic and scoring
- `lib/system-prompts.ts` — Dojo 2/3 system prompt construction
- `app/api/chat/route.ts` — request routing and Dojo 2 config handling
- `components/dojo/ControlPanel.tsx` — UI controls and their wiring
- `components/dojo/ScoringPane.tsx` — evaluation result rendering
- `components/dojo/DojoTabs.tsx` — state orchestration

**Finding:** Dojo 2 and Dojo 3 quality evaluation was functional but had two significant gaps:
1. **Scoring inaccuracy** — quality check regexes missed common valid AI response patterns, causing false negatives (marking good analyses as failing)
2. **Weak teaching layer** — the "How to Improve" section gave a single generic message instead of per-element actionable coaching; no "what a real analyst does next" content existed

---

## Cycle 1 — Dojo 2: Stronger Quality Check Regexes

### Problem
Quality check regexes in `DOJO2_QUALITY_CHECKS` had gaps that caused valid AI responses to fail checks and receive lower-than-deserved scores. Examples:
- **IOC extraction check** only matched keyword labels like "IP address" — not actual extracted IPs (e.g. `192.168.1.100`) or hashes (`a1b2c3…`)
- **Threat actor check** required `APT\d*|threat_actor|nation.state` — missed named groups like "Lazarus", "Cozy Bear", "FIN7"
- **KQL detection check** only matched a narrow set of table names — missed `TimeGenerated`, `Sysmon`, `AzureActivity`, `SourceSystem`
- **Lessons learned check** missed common phrasings: "Going forward", "Recommendations:", "Future improvements"
- **Sigma rule check** didn't look for `status:` or `level:` fields present in many valid rules

### Fix Applied
Expanded all 4 Dojo 2 scenario quality check regex sets:

| Scenario | Check | Change |
|---|---|---|
| `log-triage` | IOC extraction | Added IP/hash/URL pattern matching (not just keyword labels) |
| `log-triage` | Timeline | Added `first seen`, `last seen`, `HH:MM:SS` timestamp patterns |
| `log-triage` | Actions | Added `next steps`, `immediately`, `quarantine` |
| `alert-enrichment` | Threat actor | Added Lazarus, FIN7, Cozy Bear, Sandworm, UNC groups |
| `alert-enrichment` | CVE | Added `advisory`, `zero-day` terms |
| `detection-rule-gen` | Sigma | Added `status:`, `level:` fields |
| `detection-rule-gen` | KQL/YARA | Added `TimeGenerated`, `Sysmon`, `AzureActivity`, `SourceSystem` |
| `detection-rule-gen` | False positives | Added `allowlist`, `whitelist`, `suppress`, `benign` |
| `incident-report-draft` | Executive summary | Added `board-level`, `c-suite`, `financial impact` |
| `incident-report-draft` | Timeline | Added ISO date+time pattern matching |
| `incident-report-draft` | Root cause | Added `entry point`, `attack chain` |
| `incident-report-draft` | Containment | Added `reset password`, `disable account`, `re-image` |
| `incident-report-draft` | Lessons learned | Added "Going forward", "Recommendations:", "Future improvements" |

**Result:** False negatives eliminated for well-formed AI responses. Strong responses now reliably score 80–100 (PASS); weak/generic responses correctly score FAIL.

---

## Cycle 2 — Dojo 2: Teaching Layer — Per-Element Coaching

### Problem
When quality criteria were missed, the scoring pane displayed a single generic message:
> "Ask BlackBeltAI to include the following missing elements: X; Y; Z"

This told the learner *what* was missing but not:
- *Why* each element matters in a real SOC context
- *What specific follow-up prompt* would fix the gap

### Fix Applied
Added `DOJO2_ELEMENT_COACHING: Record<string, string>` — a mapping from each quality criterion label to an actionable coaching string containing:
1. **Why it matters** — the real-world operational consequence of the gap
2. **Example follow-up prompt** — the exact prompt to give BlackBeltAI to fill the gap

15 coaching entries added covering all Dojo 2 quality criteria across 4 scenario types.

Updated `evaluateQuality()` to generate `recommendedMitigations` as one coaching string per missing criterion (instead of one combined generic string).

**Before:**
> Ask BlackBeltAI to include the following missing elements: MITRE ATT&CK technique identified (T-code); IOCs or indicators extracted

**After (per element):**
> T-codes enable threat correlation, detection tuning, and playbook lookup. Prompt: "Map every observed behaviour to a MITRE ATT&CK technique by T-code."

> Without concrete IOCs (IPs, hashes, domains), analysts cannot add blocklist entries or pivot in threat intel. Prompt: "Extract all IOCs — IP addresses, domain names, file hashes, URLs, and registry keys."

---

## Cycle 3 — Dojo 2: Teaching Layer — "What a Real Analyst Does Next"

### Problem
The `defensiveTakeaway` / "SecurityAI+ Connection" section was the same for all analysis quality levels and only referenced SecurityAI+ exam topics. It didn't tell learners what happens *after* the AI analysis — the human analyst workflow.

### Fix Applied
Added `DOJO2_NEXT_ANALYST_STEPS: Record<string, string>` — 4 scenario-specific entries describing what a real analyst does after receiving AI output:

- **log-triage:** Severity paging → IOC blocklisting → Tier-2 escalation → log preservation
- **alert-enrichment:** VirusTotal/Shodan pivot → patch status cross-reference → ticket SLA classification → owner notification
- **detection-rule-gen:** 30-day back-test → FP tuning → detection-as-code commit → 2-week review
- **incident-report-draft:** 24h stakeholder distribution → lessons-learned meeting → remediation tracker → regulatory notification (GDPR/HIPAA)

These are appended to the `defensiveTakeaway` displayed in the "SecurityAI+ Connection" panel.

---

## Cycle 4 — Dojo 3: Same Improvements Applied

Applied the same two-level upgrade to Dojo 3:

### Quality Check Regex Improvements
- `phishing-deepfake`: Added formulaic/inconsistent tone markers; sandbox/header analysis detection; phishing simulation terms
- `ai-abuse-threat-model`: Added insider threat terminology; expanded NIST AI RMF patterns; added EU AI Act "prohibited AI" and "transparency requirement" patterns
- `policy-and-controls`: Added role-based access, data governance control terms; added gap/coverage scoring terms

### Per-Element Coaching Added
Added `DOJO3_ELEMENT_COACHING: Record<string, string>` — 15 entries covering all Dojo 3 quality criteria across 3 scenario types, each with "why it matters" and "what prompt to use".

---

## Validation Results

| Test | Result |
|---|---|
| Strong log-triage response scores 100/100 PASS | ✓ |
| Weak/generic response scores 0/100 FAIL | ✓ |
| Per-element coaching fires for each missing criterion | ✓ |
| Dojo 1 BENIGN_OPENERS preserved | ✓ |
| Dojo 1 ATTACK_PATTERNS preserved | ✓ |
| Dojo 1 chain scoring logic preserved | ✓ |
| Dojo 2/3 quality branch in evaluate() preserved | ✓ |
| All key regex patterns validated with Node.js | ✓ |
| Cozy Bear / Lazarus / FIN7 threat actor detection | ✓ |
| SecurityEvent | where KQL detection | ✓ |
| TimeGenerated KQL pattern detection | ✓ |
| "Going forward" lessons-learned detection | ✓ |
| "Recommendations:" lessons-learned detection | ✓ |

---

## What Was NOT Changed
- `lib/system-prompts.ts` — Dojo 2 analyst modifiers are complete and functional
- `components/dojo/ControlPanel.tsx` — all toggles properly wired to Dojo2Config
- `components/dojo/ScoringPane.tsx` — rendering is compatible with new array-per-element mitigations
- `app/api/chat/route.ts` — Dojo 2 routing and config handling is correct
- `lib/dojo2-scenarios.ts` — scenarios are realistic and well-structured
- **Dojo 1** — zero modifications

---

## Impact Summary

The Dojo 2 and Dojo 3 evaluation system now:
- **Accurately scores** AI-generated security analyses (fewer false negatives)
- **Teaches specifically** — each missing criterion triggers targeted coaching explaining why it matters
- **Models real analyst workflow** — learners understand what happens after AI analysis, not just how to prompt it
- **Covers Dojo 3** — the same quality and teaching improvements applied to AI threat modeling and policy scenarios
