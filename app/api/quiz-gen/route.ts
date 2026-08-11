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
  /**
   * Optional cert tag ('SecAI' | 'SC-500' | 'SCS-C03' | others). When
   * present, the system prompt gets cert-specific voice + objective-anchor
   * scaffolding, and returned questions are tagged so they surface in the
   * per-cert filters + Progress dashboard.
   */
  certTag:    z.string().min(2).max(20).optional(),
});

// ─── Response schema (validates LLM output) ───────────────────────────────────
const GeneratedQuestionSchema = z.object({
  question:    z.string().min(10).max(500),
  options:     z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correct:     z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  explanation: z.string().min(20).max(800),
});

// ─── Cert-specific scaffolding ────────────────────────────────────────────────
// Per-cert voice + objective anchor + one worked example. Keeps the generator
// grounded in the actual exam style rather than generic multiple-choice.
const CERT_SCAFFOLDS: Record<string, string> = {
  'SecAI': `EXAM VOICE — CompTIA SecAI+ CY0-001:
Short scenario (1-2 sentences) + "Which of the following..." + 4 short options.
Every question maps to a CY0-001 objective (Domain 1 Basic AI Concepts 17% / Domain 2 Securing AI Systems 40% / Domain 3 AI-assisted Security 24% / Domain 4 AI GRC 19%).
Prefer 2.6 attack categories, 2.4 data safety (anonymization vs pseudonymization vs minimization is a favourite distractor pattern), 3.2 AI-enhanced attacks (deepfake / social engineering), 4.2 Responsible AI principles (explainability vs transparency, consistency, fairness).

WORKED EXAMPLE:
{"question":"A disgruntled employee changed the company policies that a chatbot references in order to create confusion and disrupt the business. Which of the following AI-generated content vulnerabilities is the employee exploiting?","options":["Data reduction","Data masking","Data poisoning","Data leaking"],"correct":2,"explanation":"Data poisoning corrupts the knowledge base or training data the model references (CY0-001 obj 2.6 Poisoning → Data poisoning). Data masking hides values without altering meaning; data reduction / leaking are not the SecAI+ names for this pattern."}`,

  'SC-500': `EXAM VOICE — Microsoft SC-500 Cloud & AI Security Engineer:
Multi-sentence scenario referencing specific Microsoft services (Entra ID, Conditional Access, Defender XDR, Sentinel, Defender for Cloud, Purview, Azure OpenAI, Prompt Shields, Security Copilot) + "What should you do?" or "Which action achieves..." + 4 options that are all plausible Microsoft-service configurations.
Always cite the specific product/pane a real admin would use.
Prefer identity + Zero Trust (Domain 1), infra hardening (D2), data protection (D3), AI defense with Prompt Shields + DSPM for AI (D4), Sentinel + KQL + Defender XDR posture (D5).

WORKED EXAMPLE:
{"question":"You must ensure that a Microsoft 365 Copilot user cannot retrieve any SharePoint documents labeled 'Highly Confidential'. Which action achieves this with least admin effort?","options":["Disable Copilot for the user","Create a DLP policy with the 'Microsoft 365 Copilot' location and condition on the 'Highly Confidential' sensitivity label","Apply an Azure Firewall rule blocking Copilot traffic","Deploy a Conditional Access session policy on SharePoint"],"correct":1,"explanation":"Purview DLP added a 'Microsoft 365 Copilot' location — block-on-label prevents Copilot from grounding on labelled content. Disabling Copilot is broader than needed; Azure Firewall does not know about M365 traffic; CA session policy on SharePoint doesn't cover Copilot's ground-truth path."}`,

  'SCS-C03': `EXAM VOICE — AWS Certified Security – Specialty:
Detailed scenario (often 3-5 sentences) with concrete AWS services + Region + account context + "Which combination of steps..." or "What is the MOST secure way..." + 4 options each being a specific AWS configuration change.
Every technical claim must be AWS-documented behavior.
Prefer IAM policy evaluation (D1, key-policy vs IAM-policy trap), VPC networking (D2, SG vs NACL, PrivateLink), KMS + envelope encryption + Secrets Manager (D3), CloudTrail + Config + Security Lake (D4), GuardDuty + Security Hub + Detective (D5), Organizations + Control Tower (D6).

WORKED EXAMPLE:
{"question":"A security engineer created an IAM role and attached an IAM policy allowing 'kms:Decrypt' on a customer-managed KMS key. When the role attempts to decrypt an object, access is denied. What is the MOST likely cause?","options":["The IAM policy has an implicit deny","The KMS key policy does not delegate access to IAM principals","The KMS key is disabled","The role lacks a permission boundary"],"correct":1,"explanation":"KMS key policies are the authoritative access controller. Without a key-policy statement permitting the principal (or delegating via 'Principal': {'AWS': 'arn:aws:iam::ACCOUNT:root'}), an IAM policy alone grants zero KMS access. The #1 SCS-C03 trick question. Docs: docs.aws.amazon.com/kms/latest/developerguide/key-policies.html."}`,
};

// ─── System prompt ────────────────────────────────────────────────────────────
function buildSystemPrompt(topic: string, category: string, difficulty: string, count: number, certTag?: string): string {
  const scaffold = certTag && CERT_SCAFFOLDS[certTag]
    ? `\n\n${CERT_SCAFFOLDS[certTag]}\n`
    : '';
  return `You are an expert IT certification exam question writer.
Generate exactly ${count} multiple-choice questions about "${topic}" in the category "${category}" at ${difficulty} difficulty${certTag ? ` for the ${certTag} exam` : ''}.

Rules:
- Each question must have exactly 4 options (A/B/C/D)
- All 4 options must be plausible — no obviously wrong answers
- correct is the 0-indexed position of the correct answer (0=A, 1=B, 2=C, 3=D)
- explanation must clearly explain why the correct answer is right AND briefly note why the others are wrong (2-4 sentences)
- ${difficulty === 'beginner' ? 'Focus on definitions and basic concepts.' : difficulty === 'intermediate' ? 'Focus on how things work and comparisons.' : 'Focus on edge cases, best practices, and scenario-based reasoning.'}
- Do NOT make the correct answer noticeably longer than the distractors — an exam-writing tell.
- Do NOT include obvious throwaway options ("None of the above", "All of the above", joke answers). Every distractor should be defensible until you compare to the correct answer.
${scaffold}
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

// ─── Post-gen quality gate ────────────────────────────────────────────────────
// Rejects questions that fail exam-quality heuristics. Applied after schema
// validation, before returning to the client. Bad questions are silently
// dropped; the client only sees what passes.
function passesQualityGate(q: { question: string; options: [string, string, string, string]; correct: 0 | 1 | 2 | 3; explanation: string }): boolean {
  // 1. Explanation is meaningful (>= 80 chars).
  if (q.explanation.trim().length < 80) return false;

  // 2. No obvious "None/All of the above" style throwaway options.
  const throwaway = /^(none|all)\s+of\s+the\s+above/i;
  if (q.options.some((o) => throwaway.test(o.trim()))) return false;

  // 3. No two options are near-identical (case-insensitive, whitespace-normalised).
  const norm = q.options.map((o) => o.toLowerCase().replace(/\s+/g, ' ').trim());
  for (let i = 0; i < norm.length; i++) {
    for (let j = i + 1; j < norm.length; j++) {
      if (norm[i] === norm[j]) return false;
    }
  }

  // 4. Correct answer isn't the longest option by more than 30 characters —
  //    the classic "longest = correct" exam-writing tell.
  const lens = q.options.map((o) => o.length);
  const correctLen = lens[q.correct];
  const otherMax = Math.max(...lens.filter((_, i) => i !== q.correct));
  if (correctLen - otherMax > 30) return false;

  return true;
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

  const { topic, category, difficulty, count, certTag } = parsed.data;

  try {
    const client = getModelClient();
    const raw = await client.chat(
      [
        { role: 'system', content: buildSystemPrompt(topic, category, difficulty, count, certTag) },
        { role: 'user',   content: `Generate ${count} ${difficulty} questions about ${topic}${certTag ? ` for the ${certTag} exam` : ''}.` },
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
        if (!passesQualityGate(result.data)) return null;
        return {
          id:          `gen-${Date.now()}-${i}`,
          topic,
          category,
          difficulty,
          // Tag with the requested cert (if any) so generated questions surface
          // in per-cert Quiz filters + Progress dashboard + Readiness score.
          certTags:    certTag ? [certTag] : ([] as string[]),
          question:    result.data.question,
          options:     result.data.options,
          correct:     result.data.correct,
          explanation: result.data.explanation,
        };
      })
      .filter(Boolean);

    if (validated.length === 0) {
      return NextResponse.json({ error: 'No valid questions generated (post-quality-gate).' }, { status: 502 });
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
