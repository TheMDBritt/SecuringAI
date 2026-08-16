/**
 * The counter store backs both the rate limiter and the daily spend ceiling —
 * the only things between an anonymous caller and the project's provider bill.
 * These cases cover the unconfigured (in-process) path, which is what runs
 * unless Redis env vars are set.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { increment, isShared, __resetCounters, __localSize } from '@/lib/counter-store';

describe('counter store (in-process fallback)', () => {
  beforeEach(() => {
    __resetCounters();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it('falls back to local counters when Redis is not configured', async () => {
    expect(isShared()).toBe(false);
    expect((await increment('k', 60_000)).shared).toBe(false);
  });

  it('counts up within a window', async () => {
    expect((await increment('a', 60_000)).count).toBe(1);
    expect((await increment('a', 60_000)).count).toBe(2);
    expect((await increment('a', 60_000, 4)).count).toBe(6);
  });

  it('keys are independent', async () => {
    await increment('a', 60_000);
    await increment('a', 60_000);
    expect((await increment('b', 60_000)).count).toBe(1);
  });

  it('resets once the window elapses', async () => {
    await increment('a', 60_000);
    await increment('a', 60_000);
    vi.advanceTimersByTime(61_000);
    expect((await increment('a', 60_000)).count).toBe(1);
  });

  it('does not slide the expiry forward on later hits in the window', async () => {
    const first = await increment('a', 60_000);
    vi.advanceTimersByTime(30_000);
    const second = await increment('a', 60_000);
    expect(second.expiresAt).toBe(first.expiresAt);
  });

  it('reclaims expired entries rather than retaining one per key forever', async () => {
    for (let i = 0; i < 600; i++) await increment(`ip-${i}`, 60_000);
    const before = __localSize();
    expect(before).toBeGreaterThan(100);

    vi.advanceTimersByTime(61_000);
    for (let i = 0; i < 600; i++) await increment('steady', 60_000);

    expect(__localSize()).toBeLessThan(before);
  });
});
