# GOAA, GASAE, CAISP, CAIS: exam facts and blueprint status

**Cert ids:** GIAC-GOAA, GIAC-GASAE, CAISP, CAIS

**Verified:** 2026-08-17, by web search. Direct egress to `giac.org`, `sans.org`,
`eccouncil.org`, `isc2.org`, `practical-devsecops.com` and `certmap.de` is blocked by the
environment proxy, so nothing below was read from the vendor page directly. Each figure
records how it was obtained.

**Sandbox status:** These four certifications have no full objective document in this repo
and cannot get one until a primary source is reachable. What follows is exam-level facts
only — format, duration, pass mark — not sub-objective IDs.

**Rule of use:** unchanged from `secai-cy001.md`. Individual technical claims in questions
MUST cite an objective ID from a primary source. Never write from memory. Nothing in this
file licenses writing a question "to" one of these blueprints, because there is no
blueprint here to write to.

---

## Why this file exists

These four certs had no domain weights and, for three of them, no mock preset. The effect
in the product was worse than an empty state: `pickByDomainWeight` found no weights, fell
through to `pickWeighted`, and drew flat-random across the whole pool. A mock therefore
over-sampled whichever domain happened to have the most questions written for it. A
learner could sit three mocks and barely meet a domain.

Two of the four are also not multiple-choice exams at all, which changes what a question
bank can honestly claim to do for a candidate.

---

## Exam facts

| Cert | Provider | Format | Pass mark | Mock offered |
|---|---|---|---|---|
| GIAC-GOAA | GIAC / SANS | Multiple choice, proctored | **67%** | No — question count and time limit unsourced |
| GIAC-GASAE | GIAC / SANS | **CyberLive**, hands-on lab tasks | 70% | No — wrong format |
| CAISP | Practical DevSecOps | **5 hands-on challenges / 6 hours + 24h report** | **80%** | No — wrong format |
| CAIS | EC-Council | Multiple choice, closed book | 70% | Yes — 80 questions / 100 minutes |

### GIAC-GOAA — passing score corrected

The app previously carried **73%**. GIAC's own certification page states the passing score
is **67%** for the exam version released on or after 24 January 2026. Three separate
searches returned the same sentence, including one restricted to `giac.org`, so this is
quoted from the vendor page rather than inferred.

A wrong pass mark is not a cosmetic error. It is the number a learner calibrates readiness
against, and 73 versus 67 is the difference between "keep studying" and "book the exam".

Question count and time limit are still unsourced. GIAC exam pages state them per
certification and the page is unreachable here, so no mock preset is offered rather than a
guessed one.

### GIAC-GASAE — hands-on, not recall

GASAE is a GIAC CyberLive certification: the candidate performs tasks in a live
environment. Pass mark 70% for the exam version released on or after 10 April 2026.
Multiple-choice questions cannot rehearse this. The pool is retained because the underlying
concepts are the same and worth studying; the mock preset is not offered, and the UI says
why rather than showing nothing.

### CAISP — hands-on, and the pass mark was wrong

CAISP is five practical challenges attempted over six hours, with a report submitted within
a further 24 hours. Scoring combines the challenges and the report. There are **no
multiple-choice questions**.

The pass mark is **80%**, not the 70% the app carried.

This is the product decision the plan flagged. The resolution: scope CAISP as concept
preparation, label it as such in the product, and do not offer a mock. Building a lab-based
path on the Dojo engine remains the better long-term answer and is not attempted here.

### CAIS — mock preset now sourced

EC-Council publishes 80 questions, 100 minutes, closed book, pass 70%, across nine domains.
The mock preset now matches the published question count and duration.

Note the domain count disagreement: the source describes **nine** domains; this repo models
CAIS with **five**. The five are our own grouping and are not the published blueprint. Until
a primary source is reachable, CAIS is marked `blueprintSource: 'unweighted'` and its draw
is an even split, not a weighting.

CAISP is marked the same way, for the same reason. Its pass mark and format are sourced;
its five domains are our grouping and carry no published weighting. `blueprintSource`
describes the weighting alone, which is why a cert can have well-sourced exam facts and
still be marked unweighted.

---

## What the product does with this

`ExamCert` now carries two fields that make the above visible rather than implicit:

- `format: 'multiple-choice' | 'performance-based'` — performance-based certs get no mock
  preset and show `formatNote` explaining what the real exam is.
- `blueprintSource: 'published' | 'secondhand' | 'unweighted'` — where it is `unweighted`,
  the quiz setup tells the learner that questions are drawn evenly across domains rather
  than to a blueprint.

`pickByDomainWeight` no longer falls through to flat-random when weights are absent. It
draws evenly across the cert's domains. An even split is a stated assumption rather than an
invented blueprint, and it is strictly closer to any real exam than a draw shaped by how
many questions we happened to write per domain.

---

## What is still missing

- Sub-objective IDs for all four. No question in the bank should claim to map to one.
- Published per-domain weights for all four.
- GOAA question count and time limit.
- CAIS's real nine-domain structure.
- A decision on whether CAISP and GASAE deserve a Dojo-based practical path rather than a
  question pool.

Any of these becomes actionable the moment `giac.org`, `eccouncil.org` or
`practical-devsecops.com` is reachable, or the objective PDFs are added to this directory.
