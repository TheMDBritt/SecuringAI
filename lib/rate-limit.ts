// Simple in-memory per-IP rate limiter.
// NOTE: resets on serverless cold start — swap for Vercel KV in M9.

const WINDOW_MS = 60_000;   // 1 minute
const MAX_REQUESTS = 20;
const CLEANUP_INTERVAL = 5 * 60_000; // purge stale entries every 5 min

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Prevent unbounded memory growth: evict expired entries periodically.
// setInterval is safe in serverless because it only runs while the instance
// is alive; the cleanup is simply skipped on cold-start instances.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, CLEANUP_INTERVAL).unref?.(); // .unref() lets Node exit even if the timer is pending

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
