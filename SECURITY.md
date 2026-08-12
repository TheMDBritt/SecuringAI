# Security policy

## Reporting a vulnerability

Report security issues by opening a
[GitHub security advisory](https://github.com/themdbritt/securingai/security/advisories/new)
rather than a public issue.

Please include the affected route or component, reproduction steps, and what an
attacker gains. Expect an acknowledgement within a few days. This is a personal
project, not a staffed product, so please size your expectations accordingly.

## Scope

In scope:

- The three API routes under `app/api/` (`chat`, `evaluate`, `quiz-gen`)
- Cross-site scripting or content injection in rendered study material
- Anything that leaks the server-side model provider credential
- Bypasses of the rate limiting, origin checks, or daily budget in
  `lib/api-guard.ts`

Out of scope:

- The absence of user accounts and server-side persistence. This is a
  deliberate design choice: the app stores progress in `localStorage` only and
  holds no user data.
- Rate limits being per-instance and resettable on cold start. This is a known
  and documented limitation of the in-memory limiter, noted in
  `lib/api-guard.ts`. Reports that simply restate it will be closed.
- Content accuracy in study material. Open a normal issue for that.

## Deliberately unsafe-looking content

This project teaches AI security. It contains prompt-injection strings,
jailbreak framings, and simulated attacker payloads as **study material**.
They are illustrative, are not functional exploits, and are confined to
data files under `lib/`. Finding them is not a vulnerability report.
