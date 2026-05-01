/**
 * POST /api/quiz-gen
 *
 * Generates fresh quiz questions via LLM for the Playbook tab.
 * Returns a JSON array of QuizQuestion objects validated with Zod.
 * Falls back gracefully — callers should catch errors and use the static bank.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModelClient } from '@/lib/model-client';
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

// ─── Request schema ───────────────────────────────────────────────────────────
const QuizGenRequestSchema = z.object({
  topic:      z.string().min(1).max(100),
  category:   z.string().min(1).max(100),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  count:      z.number().int().min(1).max(10),
});

// ─── Response schema (validates LLM output) ───────────────────────────────────
const GeneratedQuestionSchema = z.object({
  question:    z.string().min(10).max(500),
  options:     z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correct:     z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  explanation: z.string().min(20).max(800),
});

// ─── System prompt ────────────────────────────────────────────────────────────
function buildSystemPrompt(topic: string, category: string, difficulty: string, count: number): string {
  return `You are an expert AI certification exam question writer.
Generate exactly ${count} multiple-choice questions about "${topic}" in the category "${category}" at ${difficulty} difficulty.

Rules:
- Each question must have exactly 4 options (A/B/C/D)
- All 4 options must be plausible — no obviously wrong answers
- correct is the 0-indexed position of the correct answer (0=A, 1=B, 2=C, 3=D)
- explanation must clearly explain why the correct answer is right AND briefly note why the others are wrong (2-4 sentences)
- ${difficulty === 'beginner' ? 'Focus on definitions and basic concepts.' : difficulty === 'intermediate' ? 'Focus on how things work and comparisons.' : 'Focus on edge cases, best practices, and scenario-based reasoning.'}

Respond with ONLY a valid JSON array — no markdown, no commentary, no code fences.

Format:
[
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correct": 0,
    "explanation": "..."
  }
]`;
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const ip =
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ??
    '127.0.0.1';

  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = QuizGenRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed.' }, { status: 422 });
  }

  const { topic, category, difficulty, count } = parsed.data;

  try {
    const client = getModelClient();
    const raw = await client.chat(
      [
        { role: 'system', content: buildSystemPrompt(topic, category, difficulty, count) },
        { role: 'user',   content: `Generate ${count} ${difficulty} questions about ${topic}.` },
      ],
      { temperature: 0.8, maxTokens: 2048 },
    );

    // Parse and validate the LLM's JSON output
    let parsed: unknown;
    try {
      // Strip any accidental markdown fences
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Model returned invalid JSON.' }, { status: 502 });
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json({ error: 'Model response was not an array.' }, { status: 502 });
    }

    const validated = parsed
      .map((q, i) => {
        const result = GeneratedQuestionSchema.safeParse(q);
        if (!result.success) return null;
        return {
          id:          `gen-${Date.now()}-${i}`,
          topic,
          category,
          difficulty,
          certTags:    [] as string[],
          question:    result.data.question,
          options:     result.data.options,
          correct:     result.data.correct,
          explanation: result.data.explanation,
        };
      })
      .filter(Boolean);

    if (validated.length === 0) {
      return NextResponse.json({ error: 'No valid questions generated.' }, { status: 502 });
    }

    return NextResponse.json({ questions: validated });
  } catch (err) {
    console.error('[quiz-gen] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Quiz generation failed. Please try again.' },
      { status: 503 },
    );
  }
}
