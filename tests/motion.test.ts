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
