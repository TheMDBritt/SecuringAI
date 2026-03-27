/**
 * POST /api/evaluate
 *
 * Rules-based evaluator — Milestone 6.
 * IMPORTANT: This route NEVER calls the chat model or any external service.
 * All logic is pure pattern matching inside lib/evaluator.ts.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { evaluate } from '@/lib/evaluator';
import { checkRateLimit } from '@/lib/rate-limit';

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

// ─── Validation schemas ───────────────────────────────────────────────────────

const MessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().max(8000),
});

const SettingsSchema = z.object({
  strictPolicy: z.boolean(),
  allowTools: z.boolean(),
  ragEnabled: z.boolean(),
  injectionShield: z.enum(['off', 'basic', 'strict']),
  loggingLevel: z.enum(['minimal', 'verbose']),
});

const AttackTypeEnum = z.enum([
  'benign', 'probing', 'prompt_injection', 'data_exfiltration',
  'policy_bypass', 'tool_abuse', 'mixed_attack', 'rag_injection', 'unknown',
]);

const EvaluateRequestSchema = z.object({
  dojoId: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  scenarioId: z.string().min(1).max(64).regex(/^[a-z0-9-]+$/),
  settings: SettingsSchema,
  messages: z.array(MessageSchema).min(1).max(60),
  /** Forwarded from the chat turn so rag_injection attacks can be detected. */
  ragContext: z.string().max(4000).optional(),
  /** Dojo 1 only — ordered list of attack types that succeeded in prior turns of this session. */
  sessionAttackHistory: z.array(AttackTypeEnum).max(20).optional(),
  /** Dojo 2 only — analyst config used during this turn; evaluator skips checks for disabled capabilities. */
  dojo2Config: z.object({
    persona:          z.enum(['analyst', 'ciso', 'ir-lead']),
    outputFormat:     z.enum(['markdown', 'json', 'report']),
    analysisDepth:    z.enum(['basic', 'standard', 'deep']),
    responseStyle:    z.enum(['concise', 'detailed', 'structured']),
    iocExtraction:    z.boolean(),
    mitreMapping:     z.boolean(),
    threatCorrelation:z.boolean(),
    contextLevel:     z.enum(['none', 'limited', 'full']),
    confidenceLevel:  z.enum(['low', 'medium', 'high']),
    riskAssessment:   z.enum(['low', 'medium', 'high', 'critical']),
  }).optional(),
});

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // CSRF guard
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  // Rate limit — prefer x-real-ip (Vercel edge-set, not spoofable) over the
  // leftmost x-forwarded-for entry which a client can inject to bypass limits.
  const ip =
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ??
    '127.0.0.1';

  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Max 20 requests per minute.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = EvaluateRequestSchema.safeParse(body);
  if (!parsed.success) {
    const details =
      process.env.NODE_ENV === 'development' ? parsed.error.flatten() : undefined;
    return NextResponse.json(
      { error: 'Validation failed.', ...(details && { details }) },
      { status: 422 },
    );
  }

  // Require dojo2Config for Dojo 2 requests so the evaluator can apply
  // capability-aware scoring (e.g. skip IOC check when iocExtraction=false).
  if (parsed.data.dojoId === 2 && !parsed.data.dojo2Config) {
    return NextResponse.json(
      { error: 'dojo2Config is required for Dojo 2 evaluation.' },
      { status: 422 },
    );
  }

  // evaluate() is pure pattern-matching for Dojo 2/3, and calls the LLM
  // classifier only for Dojo 1 prompt-injection turns.
  let result;
  try {
    result = await evaluate({
      dojoId:               parsed.data.dojoId,
      scenarioId:           parsed.data.scenarioId,
      settings:             parsed.data.settings,
      messages:             parsed.data.messages,
      ragContext:           parsed.data.ragContext,
      sessionAttackHistory: parsed.data.sessionAttackHistory,
      dojo2Config:          parsed.data.dojo2Config,
    });
  } catch (err) {
    console.error('[evaluate] Evaluation error:', err);
    return NextResponse.json(
      { error: 'Evaluation service error. Please try again.' },
      { status: 503 },
    );
  }

  return NextResponse.json(result);
}
