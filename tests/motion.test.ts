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
  const src = read('lib/use-count-up.ts');

  it('server-renders the real figure, never a zero', async () => {
    // The landing page counts up its content inventory — "2,195 quiz
    // questions" and so on. Those are build-time constants baked into the
    // server HTML, so a hook seeded at zero publishes "0 quiz questions" to
    // every crawler, link preview and reader whose bundle never loads: the
    // app's own headline claim, rendered as empty.
    //
    // Effects do not run during renderToStaticMarkup, so this is exactly the
    // markup a no-JS client receives.
    const { createElement } = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { CountUp } = await import('@/components/ui/motion-primitives');

    const html = renderToStaticMarkup(
      createElement(CountUp, { value: 2195, suffix: ' questions' }),
    );
    expect(html).toContain('2,195 questions');
    expect(html).not.toMatch(/>0[^0-9]/);
  });

  it('resets to zero before the browser paints, not after', () => {
    // The reset that makes the opening sweep start from zero has to land in a
    // layout effect. In a passive effect the browser paints the true value
    // first, so the count reads as the number being taken away and given back.
    expect(src).toContain('useLayoutEffect');
    expect(src).toMatch(/typeof window === 'undefined' \? useEffect : useLayoutEffect/);
  });

  it('short-circuits to the final value under reduced motion', () => {
    // The count is an embellishment on a value that is always correct. Under
    // reduced motion the value must be shown outright, never revealed.
    const guard = src.indexOf('prefersReducedMotion()');
    const raf = src.indexOf('requestAnimationFrame');
    expect(guard).toBeGreaterThan(-1);
    // The guard must precede any frame scheduling.
    expect(guard).toBeLessThan(raf);
  });

  it('animated primitives live in a client module', () => {
    // ProgressBar, Donut and CountUp use hooks. They were briefly added to the
    // shared server-rendered design system, which would have forced the whole
    // of it into the client bundle.
    const mod = read('components/ui/motion-primitives.tsx');
    expect(mod.trimStart().startsWith("'use client'")).toBe(true);
    const index = read('components/ui/index.tsx');
    expect(index.trimStart().startsWith("'use client'")).toBe(false);
    for (const name of ['ProgressBar', 'CountUp', 'Donut']) {
      expect(index).toContain(name);
      expect(mod).toContain(`export function ${name}`);
    }
  });
});

describe('reduced motion leaves nothing hidden', () => {
  const css = read('app/globals.css');

  it('zeroes delays as well as durations', () => {
    // Staggered entrances hold their `from` state for the length of the delay.
    // Collapsing only the duration left every staggered element invisible for
    // its stagger — a flash of nothing, which is worse than the motion it
    // replaced. Both the media query and the in-app opt-in need the rule.
    const blocks = css.split('html[data-reduce-motion=');
    expect(blocks.length).toBeGreaterThan(1);
    expect(css.match(/transition-delay: 0ms !important/g)?.length).toBe(2);
    expect(css.match(/animation-delay: 0ms !important/g)?.length).toBe(2);
  });
});

describe('the animation vocabulary is registered', () => {
  it('every keyframe is reachable from a utility class', () => {
    // grow-x was declared as a keyframe and never added to the animation map,
    // so `animate-grow-x` compiled to nothing at all.
    const cfg = read('tailwind.config.ts');
    const keyframes = cfg.slice(cfg.indexOf('keyframes: {'), cfg.indexOf('animation: {'));
    const animation = cfg.slice(cfg.indexOf('animation: {'));
    const declared = [...keyframes.matchAll(/^\s{8}'?([a-z-]+)'?: \{/gm)].map((m) => m[1]);
    expect(declared.length).toBeGreaterThan(4);
    for (const name of declared) {
      expect(animation, `keyframe "${name}" has no animate- utility`).toContain(`${name} `);
    }
  });
});
