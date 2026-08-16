/**
 * Shared counter store behind the rate limiter and the daily spend ceiling.
 *
 * Both controls are counters with a TTL: "how many times has this key been hit
 * inside this window". Held in a per-process Map, they are per-instance — on
 * serverless the effective ceiling becomes (limit x warm instances) and any
 * cold start resets it. That is the gap this file closes.
 *
 * When UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set, counters
 * live in Redis and every instance shares them. When they are not, the store
 * falls back to the in-process Map and behaves exactly as before. This is
 * deliberate: the app must run with zero configuration for local development
 * and for anyone self-hosting, so the shared store is an upgrade, never a
 * prerequisite.
 *
 * Redis is reached over its REST API with plain fetch rather than an SDK, so
 * this adds no dependency and no cold-start cost.
 *
 * Failure policy is fail-open. If Redis is unreachable the request proceeds
 * rather than 500s, because a study app that stops working during a Redis
 * blip is worse than one that briefly over-serves its rate limit. The
 * provider-side spend cap is the backstop that does not depend on this file
 * being correct — set one.
 */

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

/** True when counters are shared across instances rather than per-process. */
export function isShared(): boolean {
  return Boolean(REDIS_URL && REDIS_TOKEN);
}

// ─── In-process fallback ─────────────────────────────────────────────────────

interface Entry {
  count: number;
  expiresAt: number;
}

const local = new Map<string, Entry>();

const SWEEP_EVERY = 500;
let sinceSweep = 0;

function localIncr(key: string, ttlMs: number, by: number): { count: number; expiresAt: number } {
  const now = Date.now();

  // Expired entries are never read again, so without a sweep the map retains
  // one entry per key for the life of the instance.
  if (++sinceSweep >= SWEEP_EVERY) {
    sinceSweep = 0;
    for (const [k, e] of local) if (now > e.expiresAt) local.delete(k);
  }

  const existing = local.get(key);
  if (!existing || now > existing.expiresAt) {
    const fresh = { count: by, expiresAt: now + ttlMs };
    local.set(key, fresh);
    return fresh;
  }

  existing.count += by;
  return existing;
}

// ─── Redis over REST ─────────────────────────────────────────────────────────

/**
 * INCRBY then EXPIRE ... NX in one pipelined round trip. NX sets the TTL only
 * when the key has none, so the window is anchored to its first hit and later
 * hits inside the same window do not slide the expiry forward. Without NX a
 * steady stream of requests would keep pushing the reset out and the window
 * would never close.
 */
async function redisIncr(
  key: string,
  ttlMs: number,
  by: number,
): Promise<{ count: number; expiresAt: number } | null> {
  const ttlSec = Math.max(1, Math.ceil(ttlMs / 1000));

  try {
    const res = await fetch(`${REDIS_URL}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCRBY', key, String(by)],
        ['EXPIRE', key, String(ttlSec), 'NX'],
      ]),
      // A counter check must never be what makes a request slow. If Redis is
      // not answering promptly, fail open rather than hold the user's request.
      signal: AbortSignal.timeout(1000),
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const body = (await res.json()) as Array<{ result?: unknown; error?: string }>;
    const count = Number(body?.[0]?.result);
    if (!Number.isFinite(count)) return null;

    return { count, expiresAt: Date.now() + ttlMs };
  } catch {
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface CounterResult {
  count: number;
  expiresAt: number;
  /** False when the shared store was configured but did not answer. */
  shared: boolean;
}

/**
 * Increments `key` by `by`, creating it with a `ttlMs` lifetime if absent, and
 * returns the running count for the current window.
 */
export async function increment(key: string, ttlMs: number, by = 1): Promise<CounterResult> {
  if (isShared()) {
    const remote = await redisIncr(key, ttlMs, by);
    if (remote) return { ...remote, shared: true };
    // Fall through to the local counter so a Redis outage degrades to the
    // previous per-instance behaviour instead of removing the limit entirely.
  }

  return { ...localIncr(key, ttlMs, by), shared: false };
}

/** Test seam: counters are module-level state shared across cases. */
export function __resetCounters(): void {
  local.clear();
  sinceSweep = 0;
}

/** Live entry count in the local map, for tests asserting the sweep reclaims. */
export function __localSize(): number {
  return local.size;
}
