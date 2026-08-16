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

  it('renders visible when IntersectionObserver is unavailable', () => {
    expect(reveal).toContain("typeof IntersectionObserver === 'undefined'");
    expect(terminal).toContain("typeof IntersectionObserver === 'undefined'");
  });

  it('renders the final state under prefers-reduced-motion', () => {
    for (const src of [reveal, terminal]) {
      expect(src).toContain('prefers-reduced-motion');
    }
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
