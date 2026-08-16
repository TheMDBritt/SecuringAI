/**
 * Shared guard layer for the three model-spending API routes.
 *
 * The app has no accounts, so every endpoint that reaches a model provider is
 * anonymous and publicly reachable. Three controls stand between a stranger and
 * the project's provider bill:
 *
 *   1. Per-IP rate limiting        (below, via lib/counter-store)
 *   2. A global daily spend ceiling (below, via lib/counter-store)
 *   3. Same-origin enforcement      (below, blocks trivial scripted abuse)
 *
 * Controls 1 and 2 are counters with a TTL. Set UPSTASH_REDIS_REST_URL and
 * UPSTASH_REDIS_REST_TOKEN and they are shared across every instance. Leave
 * them unset and they fall back to per-process Maps, where the true ceiling
 * becomes (limit x warm instances) and a cold start resets it — a brake on
 * casual abuse rather than a guarantee.
 *
 * The hard backstop that does NOT depend on this file is a spend cap configured
 * on the provider account itself. Set one.
 */

import { NextRequest, NextResponse } from 'next/server';
import { increment } from './counter-store';

/** Requests per IP per minute. Exported so headers advertise the real limit. */
export const MAX_REQUESTS = 20;
const RATE_WINDOW_MS = 60_000;

// ─── Global daily request ceiling ────────────────────────────────────────────
// Counts model-bound requests across all callers, so a distributed caller that
// slips past per-IP limits still hits a wall. Resets on the UTC day boundary.

const DAILY_LIMIT = Number(process.env.DAILY_MODEL_REQUEST_LIMIT ?? 2000);
const DAY_MS = 24 * 60 * 60 * 1000;

function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Consumes units of the daily budget. Returns false once exhausted.
 *
 * The key carries the UTC date, so the counter rolls over at midnight without
 * anyone needing to reset it, and yesterday's key expires on its own TTL.
 */
export async function consumeDailyBudget(
  units = 1,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const { count } = await increment(`budget:${utcDay()}`, DAY_MS, units);

  if (count > DAILY_LIMIT) {
    return { allowed: false, used: count - units, limit: DAILY_LIMIT };
  }
  return { allowed: true, used: count, limit: DAILY_LIMIT };
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
export async function guard(
  req: NextRequest,
  opts: GuardOptions = {},
): Promise<NextResponse | null> {
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

  const { count, expiresAt } = await increment(`rl:${ip}`, RATE_WINDOW_MS);
  if (count > MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in a minute.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(MAX_REQUESTS),
          'X-RateLimit-Remaining': '0',
          'Retry-After': String(Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000))),
        },
      },
    );
  }

  if (spendsBudget) {
    const day = await consumeDailyBudget(cost);
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
