// Simple in-memory per-IP rate limiter.
// NOTE: resets on serverless cold start, swap for Vercel KV in M9.

const WINDOW_MS = 60_000; // 1 minute

/** Exported so response headers advertise the real limit instead of a literal
 *  that silently drifts out of sync with it. */
export const MAX_REQUESTS = 20;

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// An entry is dead once its window closes, but nothing reads it again to notice.
// Without a sweep the map retains one entry per unique IP for the life of the
// instance, so a warm instance facing a wide caller range grows without bound.
// Sweeping on an interval of calls keeps this O(1) amortised rather than paying
// a full scan on every request.
const SWEEP_EVERY = 500;
let sinceSweep = 0;

function sweep(now: number): void {
  for (const [ip, entry] of store) {
    if (now > entry.resetAt) store.delete(ip);
  }
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();

  if (++sinceSweep >= SWEEP_EVERY) {
    sinceSweep = 0;
    sweep(now);
  }

  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + WINDOW_MS;
    store.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetAt: entry.resetAt };
}

/** Test seam: the limiter is module-level state shared across cases. */
export function __resetRateLimit(): void {
  store.clear();
  sinceSweep = 0;
}

/** Live entry count, for tests asserting the sweep actually reclaims. */
export function __rateLimitSize(): number {
  return store.size;
}
