/**
 * The limiter is the only thing between an anonymous caller and the project's
 * provider bill, and it holds module-level state for the life of the server
 * process — so both its counting and its memory behaviour are worth pinning.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { checkRateLimit, MAX_REQUESTS, __resetRateLimit, __rateLimitSize } from '@/lib/rate-limit';

describe('per-IP rate limiter', () => {
  beforeEach(() => {
    __resetRateLimit();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it('allows exactly MAX_REQUESTS in a window, then refuses', () => {
    for (let i = 0; i < MAX_REQUESTS; i++) {
      expect(checkRateLimit('1.1.1.1').allowed).toBe(true);
    }
    expect(checkRateLimit('1.1.1.1').allowed).toBe(false);
  });

  it('counts each IP separately', () => {
    for (let i = 0; i < MAX_REQUESTS; i++) checkRateLimit('1.1.1.1');
    expect(checkRateLimit('1.1.1.1').allowed).toBe(false);
    expect(checkRateLimit('2.2.2.2').allowed).toBe(true);
  });

  it('reports remaining down to zero without going negative', () => {
    const seen: number[] = [];
    for (let i = 0; i < MAX_REQUESTS + 3; i++) seen.push(checkRateLimit('3.3.3.3').remaining);
    expect(seen[0]).toBe(MAX_REQUESTS - 1);
    expect(Math.min(...seen)).toBe(0);
  });

  it('lets a blocked caller through again once the window closes', () => {
    for (let i = 0; i < MAX_REQUESTS; i++) checkRateLimit('4.4.4.4');
    expect(checkRateLimit('4.4.4.4').allowed).toBe(false);
    vi.advanceTimersByTime(61_000);
    expect(checkRateLimit('4.4.4.4').allowed).toBe(true);
  });

  it('reclaims expired entries instead of retaining one per IP forever', () => {
    // Enough distinct callers to cross the sweep interval.
    for (let i = 0; i < 600; i++) checkRateLimit(`10.0.${Math.floor(i / 256)}.${i % 256}`);
    const beforeExpiry = __rateLimitSize();
    expect(beforeExpiry).toBeGreaterThan(100);

    // Every window above has now closed; the next sweep should drop them all.
    vi.advanceTimersByTime(61_000);
    for (let i = 0; i < 600; i++) checkRateLimit('5.5.5.5');

    expect(__rateLimitSize()).toBeLessThan(beforeExpiry);
  });
});
