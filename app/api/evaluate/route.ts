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
  'policy_bypass', 'tool_abuse', 'rag_injection', 'unknown',
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
});

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = EvaluateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  // evaluate() is synchronous, pure, and makes no external calls.
  const result = evaluate({
    dojoId:               parsed.data.dojoId,
    scenarioId:           parsed.data.scenarioId,
    settings:             parsed.data.settings,
    messages:             parsed.data.messages,
    ragContext:           parsed.data.ragContext,
    sessionAttackHistory: parsed.data.sessionAttackHistory,
  });

  return NextResponse.json(result);
}
