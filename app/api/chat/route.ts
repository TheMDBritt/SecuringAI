import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModelClient } from '@/lib/model-client';
import { getSystemPrompt } from '@/lib/system-prompts';
import { checkRateLimit } from '@/lib/rate-limit';

// ─── Zod schema ──────────────────────────────────────────────────────────────
// Only user/assistant roles are accepted — system prompt is added server-side.

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(2000),
});

const ControlConfigSchema = z.object({
  strictPolicy: z.boolean(),
  allowTools: z.boolean(),
  ragEnabled: z.boolean(),
  injectionShield: z.enum(['off', 'basic', 'strict']),
  loggingLevel: z.enum(['minimal', 'verbose']),
});

const ChatRequestSchema = z.object({
  dojoId: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  scenarioId: z.string().min(1).max(64).regex(/^[a-z0-9-]+$/),
  messages: z.array(MessageSchema).min(1).max(30),
  controlConfig: ControlConfigSchema,
});

// ─── Safety pre-filter ────────────────────────────────────────────────────────
// Blocks messages that contain functional exploit patterns.
// The model's system prompt enforces safety at generation time; this is an
// extra layer at the network boundary.

const BLOCKED_PATTERNS = [
  /exec\s*\(/i,
  /eval\s*\(/i,
  /system\s*\(/i,
  /rm\s+-rf/i,
  /DROP\s+TABLE/i,
  /base64_decode/i,
];

function isSafeContent(text: string): boolean {
  return !BLOCKED_PATTERNS.some((p) => p.test(text));
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Rate limit
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1';

  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Max 20 requests per minute.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '20',
          'X-RateLimit-Remaining': '0',
          'Retry-After': '60',
        },
      },
    );
  }

  // 2. Parse + validate
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { dojoId, scenarioId, messages, controlConfig } = parsed.data;

  // 3. Safety pre-filter on last user message
  const lastUserContent =
    [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';

  if (!isSafeContent(lastUserContent)) {
    return NextResponse.json(
      {
        error:
          'Message contains patterns not permitted in this sandbox. ' +
          'Payloads are conceptual here — no functional exploit syntax.',
      },
      { status: 400 },
    );
  }

  // 4. Build system prompt and call model
  // The system prompt is constructed server-side and never returned to the client.
  const systemPrompt = getSystemPrompt(dojoId, scenarioId, controlConfig);
  const client = getModelClient();

  let content: string;
  try {
    content = await client.chat(messages, { systemPrompt });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error.';
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // 5. Return only the assistant content — no keys, no internal details
  return NextResponse.json(
    { role: 'assistant', content, scenarioId, dojoId },
    {
      headers: {
        'X-RateLimit-Limit': '20',
        'X-RateLimit-Remaining': String(remaining),
      },
    },
  );
}
