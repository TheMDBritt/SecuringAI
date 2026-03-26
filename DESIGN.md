# LLM Dojo — Design Specification

> Status: Draft v1.0 | Branch: claude/llm-dojo-design-29Ibi
> Stack: Next.js 14 (App Router) · TypeScript · Tailwind CSS · Vercel

---

## 1. Feature List Per Dojo

---

### Dojo 1 — Attack & Defend an LLM

**Theme:** You are both the red team and blue team against a sandboxed LLM target.

**Scenarios (5):**
- `prompt-injection` — Inject adversarial text via user turn to override the system prompt
- `data-exfiltration` — Coax the model into revealing simulated "hidden" secrets in its context
- `policy-bypass` — Circumvent topic/content restrictions via jailbreak patterns
- `tool-abuse` — Abuse simulated function-calling tools (e.g., fake file-read, fake web-search)
- `rag-injection` — Inject malicious content into a simulated retrieval document to hijack responses

**Features per scenario:**
- Scenario picker (card grid with difficulty badge: Beginner / Intermediate / Advanced)
- Chat console — dual-pane: user input + model response stream
- Attack Control Panel
  - Payload library (pre-built injection templates, editable)
  - Context injection slot (insert text that appears to be retrieved docs)
  - Tool call forge (craft malicious tool responses)
- Defense Control Panel
  - System prompt editor (user configures the "victim" LLM's instructions)
  - Input guardrail toggles: keyword blocklist, regex filter, LLM-as-judge input screen
  - Output guardrail toggles: PII redaction, topic classifier, refusal detector
  - RAG source sanitizer toggle
- Scoring panel
  - Attack score: did the payload succeed? (binary + confidence %)
  - Defense score: did the guardrail catch it? detection latency
  - OWASP LLM Top 10 tag per result (e.g., LLM01: Prompt Injection)
- "Why It Worked / Failed" pane
  - Plain-English explanation of the attack vector exploited
  - Which defensive layer caught or missed it
  - Suggested remediation steps
  - Reference link to relevant OWASP / NIST AI RMF guidance

---

### Dojo 2 — AI as Security Tool (SOC Assistant)

**Theme:** You are a Tier-1 SOC analyst augmented by an AI assistant.

**Scenarios (4):**
- `log-triage` — Paste raw SIEM/syslog output; AI classifies severity, extracts IOCs, summarizes
- `alert-enrichment` — Paste a security alert; AI enriches with CVE context, threat actor attribution hypotheses, MITRE ATT&CK mapping
- `detection-rule-gen` — Describe anomalous behavior in natural language; AI proposes Sigma / KQL / YARA rules
- `incident-report-draft` — Provide a timeline of events; AI drafts a structured IR report (executive summary + technical appendix)

**Features per scenario:**
- Input console — text area with paste, file-drop (.log, .json, .csv up to 50 KB), or use a canned sample
- AI response panel — streamed, structured output with collapsible sections
- Analyst Control Panel
  - AI role configuration (verbosity: terse / detailed, persona: analyst / CISO / IR lead)
  - Output format selector (Markdown / JSON / Structured report)
  - Confidence threshold slider (only show findings above N% confidence)
  - Redaction mode (strip real IPs/hostnames from output before display)
- Scoring panel
  - Ground-truth comparison against a hidden answer key per canned sample
  - Precision / recall estimates for extracted IOCs
  - Rule quality score for generated detection rules (syntax valid? covers scenario?)
- "Why" pane
  - Explains AI reasoning chain (chain-of-thought surfaced)
  - Highlights AI limitations for this task (hallucination risk, stale training data)
  - Suggests human verification steps

---

### Dojo 3 — Defend Against AI Attacks

**Theme:** You are a defender building controls against AI-enabled threats.

**Scenarios (3):**
- `phishing-deepfake-detection` — Analyze a simulated AI-generated spear-phishing email or deepfake audio transcript; build and tune a detection workflow
- `ai-abuse-threat-model` — Given a description of an organization's AI deployment, generate and score an abuse threat model (threat actors, attack trees, likelihood × impact)
- `policy-and-controls` — Given a breach scenario, draft AI acceptable use policy clauses and technical controls checklist; scored against a reference framework (NIST AI RMF / EU AI Act categories)

**Features per scenario:**
- Workflow/simulation console — step-by-step wizard UI showing the detection pipeline
- Evidence panel — display the simulated artifact (email, transcript, deployment diagram)
- Defense Control Panel
  - Detection rule builder (keyword, behavioral, embedding-similarity thresholds)
  - Policy clause library (drag-and-drop policy sections)
  - Threat model canvas (threat actor → attack path → asset mapping)
- Scoring panel
  - Detection rate vs. false positive rate
  - Policy completeness score (% of reference controls covered)
  - Threat model coverage (% of attack paths identified)
- "Why" pane
  - Explains the AI attack technique used (e.g., LLM-generated phishing bypasses)
  - Maps to real-world incidents or CVEs where applicable
  - Suggests tooling (e.g., email auth headers, liveness detection APIs)

---

## 2. Data Model

All data is session-scoped (no persistent DB for MVP). JSON structures shown below.
For a production version, these map directly to a Postgres schema (e.g., via Supabase or Drizzle ORM).

---

### `Scenario`
```ts
{
  id: string;                    // "prompt-injection", "log-triage", etc.
  dojoId: 1 | 2 | 3;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  owaspTags: string[];           // e.g., ["LLM01", "LLM06"]
  mitreAttackIds?: string[];     // for Dojo 2/3
  answerKey?: AnswerKey;         // hidden, server-side only
}
```

### `AnswerKey` (server-side only, never sent to client)
```ts
{
  scenarioId: string;
  successCriteria: string[];     // conditions that constitute attack success
  defenseChecks: string[];       // conditions that constitute defense success
  groundTruthIOCs?: string[];    // for Dojo 2 log-triage
  referenceRules?: string[];     // for Dojo 2 detection-rule-gen
  referencePolicy?: string[];    // for Dojo 3 policy scenario
}
```

### `Session`
```ts
{
  sessionId: string;             // uuid, set in httpOnly cookie
  dojoId: 1 | 2 | 3;
  scenarioId: string;
  startedAt: ISO8601;
  guardrailConfig: GuardrailConfig;
  analystConfig?: AnalystConfig;
  conversationId: string;
}
```

### `Conversation`
```ts
{
  conversationId: string;
  scenarioId: string;
  messages: Message[];
  metadata: {
    attackAttempts: number;
    defenseTriggered: number;
    currentScore: ScoreResult;
  };
}
```

### `Message`
```ts
{
  id: string;
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  timestamp: ISO8601;
  metadata: {
    injectedContext?: string;    // RAG content that was prepended
    toolCalls?: ToolCall[];
    guardrailFlags?: GuardrailFlag[];  // which guardrails fired
    scoreContribution?: number;
  };
}
```

### `GuardrailConfig`
```ts
{
  inputFilters: {
    keywordBlocklist: string[];
    regexPatterns: string[];
    llmJudgeEnabled: boolean;    // calls a second LLM to screen input
    llmJudgePrompt?: string;
  };
  outputFilters: {
    piiRedaction: boolean;
    topicClassifier: boolean;
    allowedTopics: string[];
    refusalDetector: boolean;
  };
  ragSanitizer: boolean;
  systemPrompt: string;
}
```

### `AnalystConfig` (Dojo 2)
```ts
{
  persona: "analyst" | "ciso" | "ir-lead";
  verbosity: "terse" | "detailed";
  outputFormat: "markdown" | "json" | "report";
  confidenceThreshold: number;   // 0–1
  redactionMode: boolean;
}
```

### `ScoreResult`
```ts
{
  scenarioId: string;
  timestamp: ISO8601;
  attackScore?: {
    succeeded: boolean;
    confidence: number;          // 0–1
    vectorExploited: string;
    owaspTag: string;
  };
  defenseScore?: {
    caught: boolean;
    latencyMs: number;
    layersCaught: string[];      // which guardrail(s) fired
  };
  socScore?: {                   // Dojo 2
    iocPrecision: number;
    iocRecall: number;
    ruleSyntaxValid: boolean;
    ruleSemanticScore: number;
  };
  defenderScore?: {              // Dojo 3
    detectionRate: number;
    falsePositiveRate: number;
    policyCompleteness: number;
    threatModelCoverage: number;
  };
  explanation: ExplanationEntry;
}
```

### `ExplanationEntry`
```ts
{
  summary: string;               // 2–3 sentence plain English
  whatWorked: string[];
  whatFailed: string[];
  remediations: string[];
  references: { label: string; url: string }[];
  owaspMapping: string;
}
```

### `ToolCall` (Dojo 1 tool-abuse scenario)
```ts
{
  toolName: string;              // "file_read", "web_search", "send_email" (all simulated)
  args: Record<string, unknown>;
  simulatedResponse: string;     // pre-defined safe sandbox response
  abused: boolean;               // flagged if args deviate from expected
}
```

---

## 3. API Route Design

All routes live under `/api/`. No secrets or answer keys are ever returned to the client.

---

### Core Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/scenarios` | Returns all scenarios (no answer keys) filtered by `?dojoId=` |
| `GET` | `/api/scenarios/[id]` | Returns one scenario metadata |
| `POST` | `/api/chat` | Main streaming chat endpoint |
| `POST` | `/api/score` | Evaluates an attempt and returns ScoreResult |
| `POST` | `/api/guardrail/test` | Test a guardrail config against a payload (Dojo 1) |
| `POST` | `/api/soc/analyze` | SOC analysis endpoint (Dojo 2) |
| `POST` | `/api/defender/analyze` | Defender workflow endpoint (Dojo 3) |
| `GET` | `/api/health` | Health check |

---

### `/api/chat` — POST

**Request:**
```ts
{
  sessionId: string;
  scenarioId: string;
  dojoId: 1 | 2 | 3;
  userMessage: string;
  injectedContext?: string;       // RAG injection slot (Dojo 1)
  forgedToolResponse?: ToolCall;  // Tool abuse slot (Dojo 1)
  guardrailConfig?: GuardrailConfig;
  analystConfig?: AnalystConfig;
}
```

**Server processing:**
1. Validate and sanitize sessionId (httpOnly cookie check)
2. Load scenario config server-side (system prompt, tool definitions)
3. Apply input guardrails — keyword check, regex, optional LLM-judge call
4. If guardrail fires: return early with `{ blocked: true, guardRailFired: string }`
5. Build final message list (system prompt + history + injected context + user message)
6. Call model provider abstraction layer
7. Apply output guardrails (PII scrub, topic check)
8. Stream response via Server-Sent Events
9. Append message + metadata to in-memory conversation store

**Response:** SSE stream of `{ delta: string }` chunks, final `{ done: true, messageId: string }`

---

### `/api/score` — POST

**Request:**
```ts
{
  sessionId: string;
  scenarioId: string;
  conversationId: string;
  attemptType: "attack" | "defense" | "soc" | "defender";
}
```

**Server processing:**
1. Load conversation from session store
2. Load answer key for scenario (server-side only)
3. Run scoring logic:
   - For attack: check if success criteria strings appear in model responses
   - For defense: check if guardrails fired on the right payloads
   - For SOC: compare extracted IOCs to ground truth (fuzzy match)
   - For defender: check policy clause coverage against reference
4. Generate explanation via a dedicated LLM call (GPT-4o / Claude — summarize what happened)
5. Return ScoreResult (never includes answer key)

---

### `/api/guardrail/test` — POST

**Request:**
```ts
{
  payload: string;
  guardrailConfig: GuardrailConfig;
}
```

**Response:**
```ts
{
  blocked: boolean;
  layersFired: string[];
  rationale: string;
  latencyMs: number;
}
```

---

### `/api/soc/analyze` — POST

**Request:**
```ts
{
  sessionId: string;
  scenarioId: string;
  inputData: string;             // raw log / alert text
  analystConfig: AnalystConfig;
}
```

**Response:** SSE stream of structured analysis sections

---

### `/api/defender/analyze` — POST

**Request:**
```ts
{
  sessionId: string;
  scenarioId: string;
  artifact: string;              // phishing email, deployment desc, breach timeline
  detectionRules?: string[];
  policyDraft?: string;
}
```

**Response:** SSE stream + final `{ score: DefenderScore; explanation: ExplanationEntry }`

---

### Model Provider Abstraction Layer

Located at `lib/providers/index.ts`. Exposes a single interface:

```ts
interface ModelProvider {
  complete(params: CompletionParams): Promise<ReadableStream>;
  judge(params: JudgeParams): Promise<JudgeResult>;  // for LLM-as-judge guardrails
}

// Concrete implementations (server-side only):
// - OpenAIProvider (gpt-4o)
// - AnthropicProvider (claude-sonnet-4-6)
// - OllamaProvider (local, for dev/testing)

// Selected via env var: MODEL_PROVIDER=openai|anthropic|ollama
```

---

## 4. Threat Model for the Dojo Itself

The Dojo is inherently a high-risk surface because it is *designed* to accept adversarial input. The following threats apply to the app itself, not the simulated scenarios.

---

### Threat 1 — Prompt Injection into API Routes

**Risk:** User crafts a message that escapes the scenario sandbox and manipulates the *actual* server-side system prompt (not the simulated victim prompt).

**Attack path:** `userMessage` → server builds final prompt → injected instruction overrides server behavior

**Controls:**
- Strict separation: user input is always wrapped in `<user_input>` XML tags before concatenation
- The real server-side instructions are prepended *after* a hard delimiter never shown to the user
- Input length cap (2 KB per message)
- LLM-as-judge screens user input for meta-injection attempts (e.g., "ignore all previous instructions")
- Output scanning rejects responses that contain the literal server system prompt

---

### Threat 2 — Tool Abuse via Forged Tool Responses

**Risk:** Dojo 1 allows users to craft forged tool responses. A malicious user could attempt to forge responses that cause the model to execute real side effects.

**Controls:**
- All tools are **simulated** — no real tool integrations exist on the server
- Tool definitions are loaded from a read-only server-side manifest; client cannot register new tools
- Forged tool response content is sanitized and length-capped before being passed to the model
- Tool call results are never executed as code

---

### Threat 3 — Exfiltration of Real Server Secrets via Model Response

**Risk:** User tricks the model into revealing env vars, API keys, or real system prompts.

**Controls:**
- Env vars never placed in model context — model only receives scenario-specific content
- Output filter scans responses for patterns matching `sk-`, `Bearer `, PII patterns, and the literal text of the real system prompt
- API keys stored only in Vercel env vars, never bundled into client JS

---

### Threat 4 — RAG Context Injection Escaping Sandbox

**Risk:** Dojo 1 RAG injection slot allows user to provide "retrieved documents." A user could inject content that causes the real server LLM to behave unexpectedly.

**Controls:**
- Injected context is marked with explicit `<retrieved_document>` tags and a preamble warning: "The following is untrusted user-supplied content for simulation purposes."
- Length cap on injected context (4 KB)
- Input guardrail runs on injected context as well as user message

---

### Threat 5 — Cost / Rate Limit Abuse

**Risk:** Dojo is publicly accessible; malicious actors flood the API routes to exhaust model API quotas.

**Controls:**
- Vercel Edge rate limiting: 20 requests/minute per IP, 100/hour
- Session token (httpOnly cookie) required for all `/api/chat` calls
- Session creation rate-limited: 5 new sessions/hour per IP
- Max conversation length: 30 messages; after that, session must be reset
- Model call budget cap per session (configurable via `MAX_TOKENS_PER_SESSION` env var)

---

### Threat 6 — Harmful Content Generation via Scenario Framing

**Risk:** User uses the "attack" scenario framing to elicit actually harmful instructions (real exploits, malware, etc.) from the model.

**Controls:**
- System prompt for all scenarios includes an immovable safety preamble the user cannot override
- The "Attack Control Panel" payload library contains only *conceptual* payloads (no real shellcode, real malware, real illegal instructions)
- Output classifier runs on all responses; refuses and flags if response contains real attack tooling
- Scoring system gives zero points if the detected attack vector is outside the defined scenario scope
- Clear UI disclaimer: "All scenarios are simulated for educational purposes. Payloads represent concepts, not functional exploits."

---

### Threat 7 — Session Hijacking

**Risk:** Session IDs are guessable or transmitted insecurely, allowing one user to read another's conversation.

**Controls:**
- Session IDs are UUIDs v4 (128-bit random)
- Set as `httpOnly; Secure; SameSite=Strict` cookies
- Server validates session ownership on every request
- In-memory session store (or Redis) with 2-hour TTL; no cross-session data leakage

---

## 5. Build Plan — 10 Milestones

---

### M1 — Repo & Toolchain Setup
- Init Next.js 14 App Router project with TypeScript strict mode
- Configure Tailwind CSS, ESLint, Prettier
- Set up Vercel project, environment variable structure (`.env.example`)
- Create `/lib/providers/` abstraction skeleton (interface only, no implementation)
- Add `DESIGN.md` and `ARCHITECTURE.md` to repo
- **Exit criterion:** `next dev` runs; blank page deploys to Vercel preview

---

### M2 — Layout Shell & 3-Tab Navigation
- Build `RootLayout` with sidebar or top-nav tab bar (Dojo 1 / 2 / 3)
- Create placeholder page components for each Dojo
- Design system tokens: color palette (security-themed dark mode), typography scale, component primitives (Card, Badge, Button, Panel)
- Responsive layout: desktop-first 3-column (scenario picker | chat | control panel), collapsible on mobile
- **Exit criterion:** Tab switching works; layout renders correctly at 1280px and 768px

---

### M3 — Model Provider Abstraction Layer
- Implement `OpenAIProvider` (streaming, function calling)
- Implement `AnthropicProvider` (streaming, tool use)
- Implement `OllamaProvider` for local dev (no API key needed)
- Provider selected via `MODEL_PROVIDER` env var; zero client-side exposure
- Unit tests for provider interface compliance
- **Exit criterion:** Switching `MODEL_PROVIDER` changes which backend is called; client code is identical

---

### M4 — Dojo 1 Scenarios & Chat Console
- Load scenarios from server-side JSON manifest
- Build scenario picker (card grid with difficulty badges)
- Build chat console component (SSE streaming, message bubbles, tool call display)
- Wire `/api/chat` route for Dojo 1: system prompt construction, message history, SSE response
- Implement in-memory session/conversation store
- **Exit criterion:** User can select a scenario and have a streaming conversation with the sandbox LLM

---

### M5 — Dojo 1 Attack/Defense Control Panel & Scoring
- Build Attack Control Panel: payload library, context injection slot, tool forge
- Build Defense Control Panel: system prompt editor, guardrail toggles
- Implement all input/output guardrails (keyword, regex, LLM-judge, PII redaction, topic classifier)
- Wire `/api/guardrail/test` and `/api/score` routes
- Build Scoring Panel and "Why It Worked/Failed" pane with OWASP tags
- **Exit criterion:** All 5 Dojo 1 scenarios are playable; attack/defense scoring works end-to-end

---

### M6 — Dojo 2 SOC Assistant Scenarios
- Implement all 4 SOC scenarios with canned sample data (logs, alerts, behavior descriptions, timelines)
- Build Analyst Control Panel (persona, verbosity, output format, confidence threshold)
- Wire `/api/soc/analyze` with structured output parsing (extract IOCs, generate Sigma rules, draft IR report)
- Build scoring against ground-truth answer keys (IOC precision/recall, rule syntax validation)
- Build "Why" pane surfacing AI reasoning chain and limitations callout
- **Exit criterion:** All 4 Dojo 2 scenarios produce scored, structured output

---

### M7 — Dojo 3 Defender Scenarios
- Implement 3 defender scenarios with simulated artifacts (phishing emails, deployment diagrams, breach timelines)
- Build detection rule builder UI and policy clause drag-and-drop
- Build threat model canvas (simplified — text-based tree, not graphical for MVP)
- Wire `/api/defender/analyze` with scoring against reference frameworks
- **Exit criterion:** All 3 Dojo 3 scenarios are playable with scored output

---

### M8 — Scoring Engine & Explanation Quality
- Centralize scoring logic in `lib/scoring/`; deduplicate across all dojos
- Improve explanation generation: dedicated LLM call with chain-of-thought, structured output schema
- Add score history panel (within session): radar chart showing progress across attack/defense dimensions
- Add OWASP LLM Top 10 reference sidebar (expandable, with scenario tagging)
- **Exit criterion:** Explanations are consistently high quality; score history persists across scenarios within session

---

### M9 — Safety Hardening & Sandbox Controls
- Implement all threat model controls (Threats 1–7 from Section 4)
- Add rate limiting middleware (Vercel Edge)
- Add output classifier guardrail (real harmful content detection)
- Security audit: review all API routes for injection surfaces, information leakage
- Add UI disclaimer and safe-use acknowledgment on first load
- Load testing: simulate 50 concurrent sessions
- **Exit criterion:** All 7 threat model controls implemented and verified; no real harmful content passthrough

---

### M10 — Vercel Deployment & Polish
- Configure Vercel project: production env vars, Edge Runtime for rate limiting, regional deployment
- Add `vercel.json` for route config and Edge Middleware
- Performance optimization: lazy-load dojo panels, streaming UI skeleton states
- Accessibility pass: keyboard navigation, ARIA labels, color contrast (WCAG AA)
- Final UX polish: onboarding tooltips, scenario difficulty progression, keyboard shortcuts
- Write `README.md` with local dev setup, env var reference, and contribution guide
- **Exit criterion:** Production URL live on Vercel; all 13 scenarios playable; Lighthouse score > 85

---

## Open Questions for Stakeholder (Clarifying)

1. **Auth:** Should Dojo be public (anonymous sessions) or require login (GitHub OAuth / magic link)? Login enables persistent score history across sessions.
2. **Model preference:** Primary provider — OpenAI (gpt-4o) or Anthropic (claude-sonnet-4-6)? Or both available as a user toggle?
3. **Persistence:** MVP uses in-memory session state (lost on serverless cold start). Should we add a lightweight persistent store (Upstash Redis, Vercel KV, or Supabase) for session/score history?
4. **RAG scenario depth:** For `rag-injection`, do you want a real vector store (e.g., Pinecone / pgvector) to make retrieval authentic, or a fully simulated/canned retrieval for safety/simplicity?
5. **Scoring strictness:** Should scoring be purely rule-based (fast, deterministic) or LLM-as-judge (slower, more nuanced)? Or a hybrid?
6. **Multiplayer / leaderboard:** Single-player only, or a leaderboard comparing scores across sessions?
7. **Export:** Should users be able to export their session (conversation + score report) as a PDF or JSON?
8. **Dojo 2 file upload:** Real file parsing (`.log`, `.json`, `.csv`) or text-paste only for MVP?
9. **Dojo 3 threat model canvas:** Text-based tree (simpler) or interactive drag-and-drop graph (richer but heavier to build)?
10. **Compliance framing:** Should scoring in Dojo 3 reference NIST AI RMF, EU AI Act, or both? Any internal framework to incorporate?
