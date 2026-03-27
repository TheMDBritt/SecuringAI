// Simple in-memory per-IP rate limiter.
//
// SECURITY NOTES:
// - Cold-start reset: Vercel spins up a fresh serverless instance on cold start,
//   clearing this store. Use Vercel KV (Upstash Redis) for persistent rate limits.
// - IP source: callers MUST pass the IP extracted from x-real-ip (Vercel edge-set,
//   not spoofable) rather than the leftmost x-forwarded-for entry, which a client
//   can inject to cycle fake IPs and bypass rate limits. Both API routes do this.
// - Per-user: this is per-IP only; once auth is added, rate-limit by user ID too.

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 20;

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
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
