/**
 * Motion safety.
 *
 * Reveal-on-scroll starts content at opacity 0. That is fine until the
 * observer never fires, at which point the page is permanently blank with no
 * error to explain it. These assert the escape hatches exist.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');

describe('scroll-reveal cannot trap content invisible', () => {
  const reveal = read('components/ui/Reveal.tsx');
  const terminal = read('components/ui/TerminalReplay.tsx');
  const css = read('app/globals.css');
  const layout = read('app/layout.tsx');

  // The escape hatches inside the components all need JS to be running, so
  // they say nothing about the case that actually blanks the page: a bundle
  // that never loads. The hidden start state is gated on a CSS attribute that
  // only an inline script sets, which is the part worth asserting.
  it('only hides content once the document is marked as scripted', () => {
    expect(css).toMatch(/html\[data-js='1'\][^{]*\.reveal\[data-shown='false'\]/);
    expect(layout).toContain("documentElement.dataset.js='1'");
  });

  it('does not hide content from a plain opacity utility', () => {
    // opacity-0 in the component's own class list would apply with or without
    // the gate, which is exactly the regression this guards.
    expect(reveal).not.toMatch(/className=\{\[[^\]]*opacity-0/);
  });

  it('respects the in-app reduce-motion setting, not just the OS one', () => {
    const motion = read('lib/motion.ts');
    expect(motion).toContain('dataset.reduceMotion');
    for (const src of [reveal, terminal]) {
      expect(src).toContain('prefersReducedMotion');
    }
  });

  it('renders visible when IntersectionObserver is unavailable', () => {
    expect(reveal).toContain("typeof IntersectionObserver === 'undefined'");
    expect(terminal).toContain("typeof IntersectionObserver === 'undefined'");
  });

  it('renders the final state under prefers-reduced-motion', () => {
    expect(read('lib/motion.ts')).toContain('prefers-reduced-motion');
    expect(css).toContain('prefers-reduced-motion');
  });

  it('disconnects its observer so the callback cannot outlive the element', () => {
    expect(reveal).toContain('io.disconnect()');
    expect(terminal).toContain('io.disconnect()');
  });
});

describe('the hero has no no-op gradient', () => {
  it('does not declare a gradient between one colour and itself', () => {
    const page = read('app/page.tsx');
    const matches = [...page.matchAll(/from-([a-z]+-\d{3}) to-([a-z]+-\d{3})/g)];
    expect(matches.filter((m) => m[1] === m[2]).map((m) => m[0])).toEqual([]);
  });
});

describe('count-up animation', () => {
  it('starts from zero so the first appearance animates', async () => {
    // Seeding the hook with its target made the initial delta zero, so the
    // number only animated on a later change and the first paint — the one
    // worth animating — was static.
    const src = await import('node:fs/promises').then((fs) =>
      fs.readFile('lib/use-count-up.ts', 'utf8'),
    );
    expect(src).toMatch(/useState\(0\)/);
    expect(src).toMatch(/from\s*=\s*useRef\(0\)/);
  });

  it('short-circuits to the final value under reduced motion', async () => {
    // The count is an embellishment on a value that is always correct. Under
    // reduced motion the value must be shown outright, never revealed.
    const src = await import('node:fs/promises').then((fs) =>
      fs.readFile('lib/use-count-up.ts', 'utf8'),
    );
    const guard = src.indexOf('prefersReducedMotion()');
    const raf = src.indexOf('requestAnimationFrame');
    expect(guard).toBeGreaterThan(-1);
    // The guard must precede any frame scheduling.
    expect(guard).toBeLessThan(raf);
  });

  it('animated primitives live in a client module', async () => {
    // ProgressBar and CountUp use hooks. They were briefly added to the shared
    // server-rendered design system, which would have forced the whole of it
    // into the client bundle.
    const src = await import('node:fs/promises').then((fs) =>
      fs.readFile('components/ui/motion-primitives.tsx', 'utf8'),
    );
    expect(src.trimStart().startsWith("'use client'")).toBe(true);
  });
});
