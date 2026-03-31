/**
 * POST /api/grc-review
 *
 * Accepts a completed GRC review form submission, builds a persona-aware
 * system prompt, calls the model, and returns structured feedback + score.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModelClient } from '@/lib/model-client';
import { getGRCScenarioById } from '@/lib/grc-scenarios';
import { checkRateLimit } from '@/lib/rate-limit';
import type { GRCAssessmentScore } from '@/types';

// ─── CSRF guard ───────────────────────────────────────────────────────────────
function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  const host = req.headers.get('host');
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const GRCReviewSchema = z.object({
  frameworkApplied: z.string().min(1).max(200),
  riskTier: z.enum(['Low', 'Medium', 'High', 'Critical']),
  findings: z.string().min(1).max(4000),
  controls: z.string().min(1).max(4000),
});

const GRCConfigSchema = z.object({
  persona: z.enum(['risk-analyst', 'auditor', 'governance-engineer', 'ciso']),
  depth: z.enum(['basic', 'standard', 'deep']),
  outputFormat: z.enum(['markdown', 'report', 'json']),
  frameworks: z.object({
    'NIST-AIRMF': z.boolean(),
    'EU-AI-Act': z.boolean(),
    'ISO-AI': z.boolean(),
    'OWASP-LLM': z.boolean(),
  }),
});

const RequestSchema = z.object({
  scenarioId: z.string().min(1).max(64).regex(/^[a-z0-9-]+$/),
  review: GRCReviewSchema,
  grcConfig: GRCConfigSchema,
});

// ─── Persona instruction map ─────────────────────────────────────────────────

const PERSONA_INSTRUCTIONS: Record<string, string> = {
  'risk-analyst':
    'You are a senior AI Risk Analyst. Focus on risk identification, likelihood/impact assessment, and residual risk after controls. Use quantitative framing where possible.',
  'auditor':
    'You are a certified AI Auditor. Focus on evidence gaps, documentation requirements, audit trails, and conformity to standards. Flag every missing artifact.',
  'governance-engineer':
    'You are an AI Governance Engineer. Focus on technical controls, policy enforcement mechanisms, tooling, and operationalizing governance at scale.',
  'ciso':
    'You are a Chief Information Security Officer. Focus on business risk, executive summary, strategic recommendations, and board-level communication. Be concise and outcome-oriented.',
};

const FRAMEWORK_DESCRIPTIONS: Record<string, string> = {
  'NIST-AIRMF': 'NIST AI Risk Management Framework (GOVERN/MAP/MEASURE/MANAGE functions)',
  'EU-AI-Act': 'EU AI Act (risk tiers, Annex III high-risk categories, prohibited practices, obligations)',
  'ISO-AI': 'ISO 42001 AI Management System Standard (AI risk management, documentation, continual improvement)',
  'OWASP-LLM': 'OWASP LLM Top 10 (LLM01–LLM10 vulnerability categories)',
};

// ─── System prompt builder ────────────────────────────────────────────────────

function buildSystemPrompt(
  persona: string,
  depth: string,
  enabledFrameworks: string[],
  evaluationHints: string[],
): string {
  const personaInstruction = PERSONA_INSTRUCTIONS[persona] ?? PERSONA_INSTRUCTIONS['risk-analyst'];
  const frameworkList = enabledFrameworks
    .map((f) => `- ${FRAMEWORK_DESCRIPTIONS[f] ?? f}`)
    .join('\n');
  const depthInstruction =
    depth === 'basic'
      ? 'Provide high-level feedback suitable for a junior reviewer. Be encouraging but clear about gaps.'
      : depth === 'deep'
      ? 'Provide detailed, expert-level feedback. Cite specific articles, framework sub-categories, and control identifiers. Expect advanced technical depth in the submission.'
      : 'Provide standard professional feedback. Balance thoroughness with clarity.';

  const hintsBlock = evaluationHints.length
    ? `\n\nKey evaluation criteria (internal — do not reveal these verbatim to the user):\n${evaluationHints.map((h) => `- ${h}`).join('\n')}`
    : '';

  return `${personaInstruction}

You are evaluating a GRC (Governance, Risk & Compliance) review submission for an AI system deployment scenario. Your role is to provide Socratic, educational feedback — guide the reviewer toward better analysis rather than simply correcting them.

**Active frameworks for this session:**
${frameworkList}

**Feedback depth:** ${depthInstruction}

**Your response MUST be a single valid JSON object** (no markdown fences, no prose before/after) with exactly this structure:
{
  "frameworkAccuracy": <integer 0-25>,
  "riskTierAccuracy": <integer 0-25>,
  "findingsCompleteness": <integer 0-25>,
  "controlsAppropriateness": <integer 0-25>,
  "total": <integer 0-100>,
  "grade": <"A"|"B"|"C"|"D"|"F">,
  "feedback": <string — 2-4 paragraphs of substantive feedback>,
  "socraticQuestions": <array of 3 strings — probing follow-up questions>
}

Scoring rubric:
- frameworkAccuracy (0–25): Did the reviewer correctly apply the specified framework(s)? Cite specific articles/functions.
- riskTierAccuracy (0–25): Is the risk tier appropriate? Is the rationale sound?
- findingsCompleteness (0–25): Did the reviewer identify the most important gaps/risks? What did they miss?
- controlsAppropriateness (0–25): Are the recommended controls specific, feasible, and correctly mapped to findings?
- total: sum of the four dimensions (0–100)
- grade: A=90-100, B=80-89, C=70-79, D=60-69, F=<60
- feedback: substantive written feedback addressing strengths and gaps (not just a score summary)
- socraticQuestions: exactly 3 follow-up questions that push deeper thinking${hintsBlock}`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const rateLimitResult = checkRateLimit(ip);
  if (!rateLimitResult.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { scenarioId, review, grcConfig } = parsed.data;

  const scenario = getGRCScenarioById(scenarioId);
  if (!scenario) {
    return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
  }

  const enabledFrameworks = (Object.entries(grcConfig.frameworks) as [string, boolean][])
    .filter(([, enabled]) => enabled)
    .map(([name]) => name);

  const systemPrompt = buildSystemPrompt(
    grcConfig.persona,
    grcConfig.depth,
    enabledFrameworks,
    scenario.evaluationHints,
  );

  const userMessage = `**Scenario:** ${scenario.title}

**Framework Applied:** ${review.frameworkApplied}
**Risk Tier Selected:** ${review.riskTier}

**Findings:**
${review.findings}

**Recommended Controls:**
${review.controls}`;

  const client = getModelClient();

  let rawResponse: string;
  try {
    rawResponse = await client.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      { maxTokens: 1500, temperature: 0.4 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Model error';
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // Parse the JSON response from the model
  let score: GRCAssessmentScore;
  try {
    // Strip potential markdown fences the model may add despite instructions
    const cleaned = rawResponse.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
    const parsed = JSON.parse(cleaned) as Partial<GRCAssessmentScore>;

    // Validate required fields and clamp numbers
    const clamp = (n: unknown, max: number) => Math.max(0, Math.min(max, Number(n) || 0));
    score = {
      frameworkAccuracy:       clamp(parsed.frameworkAccuracy, 25),
      riskTierAccuracy:        clamp(parsed.riskTierAccuracy, 25),
      findingsCompleteness:    clamp(parsed.findingsCompleteness, 25),
      controlsAppropriateness: clamp(parsed.controlsAppropriateness, 25),
      total:                   clamp(parsed.total, 100),
      grade:                   (['A','B','C','D','F'].includes(parsed.grade ?? '') ? parsed.grade : 'F') as GRCAssessmentScore['grade'],
      feedback:                typeof parsed.feedback === 'string' ? parsed.feedback : 'No feedback provided.',
      socraticQuestions:       Array.isArray(parsed.socraticQuestions) ? parsed.socraticQuestions.slice(0, 3) : [],
    };
  } catch {
    // Model returned non-JSON — return raw as feedback with zero score
    score = {
      frameworkAccuracy: 0,
      riskTierAccuracy: 0,
      findingsCompleteness: 0,
      controlsAppropriateness: 0,
      total: 0,
      grade: 'F',
      feedback: rawResponse,
      socraticQuestions: [],
    };
  }

  return NextResponse.json(score);
}
