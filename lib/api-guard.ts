/**
 * Shared guard layer for the three model-spending API routes.
 *
 * The app has no accounts, so every endpoint that reaches a model provider is
 * anonymous and publicly reachable. Three controls stand between a stranger and
 * the project's provider bill:
 *
 *   1. Per-IP rate limiting        (lib/rate-limit.ts, best-effort)
 *   2. A global daily spend ceiling (below, best-effort)
 *   3. Same-origin enforcement      (below, blocks trivial scripted abuse)
 *
 * Controls 1 and 2 are process-local. On serverless each instance keeps its own
 * counters, so the true ceiling is (limit x warm instances) and a cold start
 * resets it. That is a real limitation, not a rounding error: treat these as a
 * brake on casual abuse, not as a guarantee. A determined distributed caller
 * needs a shared store. Set RATE_LIMIT_KV_URL and swap the two Map-backed stores
 * for that store when the project outgrows this.
 *
 * The hard backstop that does NOT depend on this file is a spend cap configured
 * on the provider account itself. Set one.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, MAX_REQUESTS } from './rate-limit';

// ─── Global daily request ceiling ────────────────────────────────────────────
// Counts model-bound requests across all callers, so a distributed caller that
// slips past per-IP limits still hits a wall. Resets on the UTC day boundary.

const DAILY_LIMIT = Number(process.env.DAILY_MODEL_REQUEST_LIMIT ?? 2000);

interface DayBudget {
  day: string;
  used: number;
}

const budget: DayBudget = { day: '', used: 0 };

function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Consumes one unit of the daily budget. Returns false when exhausted. */
export function consumeDailyBudget(units = 1): { allowed: boolean; used: number; limit: number } {
  const today = utcDay();
  if (budget.day !== today) {
    budget.day = today;
    budget.used = 0;
  }
  if (budget.used + units > DAILY_LIMIT) {
    return { allowed: false, used: budget.used, limit: DAILY_LIMIT };
  }
  budget.used += units;
  return { allowed: true, used: budget.used, limit: DAILY_LIMIT };
}

// ─── Same-origin enforcement ─────────────────────────────────────────────────

/**
 * True when the request plausibly came from this site's own UI.
 *
 * A missing Origin header is treated as FAILING in production. Browsers send
 * Origin on cross-origin requests and on same-origin non-GET fetches, so a POST
 * with no Origin is almost always a script. Development is exempt so curl and
 * local tooling keep working.
 */
export function isSameOrigin(req: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'production') return true;

  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// ─── Request body size ───────────────────────────────────────────────────────

const MAX_BODY_BYTES = 64 * 1024; // 64 KB, far above any legitimate payload

/**
 * Parses JSON with an explicit byte ceiling, so an oversized body is rejected
 * before it is buffered and parsed. Zod caps the useful shape afterwards; this
 * caps the raw bytes.
 */
export async function readJsonBody<T = unknown>(
  req: NextRequest,
): Promise<{ ok: true; body: T } | { ok: false; response: NextResponse }> {
  const declared = req.headers.get('content-length');
  if (declared && Number(declared) > MAX_BODY_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Request body too large.' }, { status: 413 }),
    };
  }

  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Request body too large.' }, { status: 413 }),
    };
  }

  try {
    return { ok: true, body: JSON.parse(text) as T };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Malformed JSON body.' }, { status: 400 }),
    };
  }
}

// ─── Combined gate ───────────────────────────────────────────────────────────

export interface GuardOptions {
  /** Budget units this request costs. Generation is dearer than a chat turn. */
  cost?: number;
  /** Set false for routes that never reach a model provider. */
  spendsBudget?: boolean;
}

/**
 * Runs origin, rate-limit and budget checks in order. Returns a NextResponse to
 * short-circuit with, or null when the request may proceed.
 */
export function guard(req: NextRequest, opts: GuardOptions = {}): NextResponse | null {
  const { cost = 1, spendsBudget = true } = opts;

  if (!isSameOrigin(req)) {
    return NextResponse.json(
      { error: 'Requests must originate from the application.' },
      { status: 403 },
    );
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1';

  const { allowed, remaining, resetAt } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in a minute.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(MAX_REQUESTS),
          'X-RateLimit-Remaining': '0',
          'Retry-After': String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))),
        },
      },
    );
  }

  if (spendsBudget) {
    const day = consumeDailyBudget(cost);
    if (!day.allowed) {
      return NextResponse.json(
        {
          error:
            'The shared daily capacity for AI-backed features is used up. ' +
            'Everything else in the app still works. Capacity resets at 00:00 UTC.',
        },
        { status: 503, headers: { 'Retry-After': '3600' } },
      );
    }
  }

  return null;
}

/** Rate-limit headers for successful responses. */
export function rateLimitHeaders(remaining: number): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(MAX_REQUESTS),
    'X-RateLimit-Remaining': String(remaining),
  };
}
