/**
 * The article renderer writes straight into dangerouslySetInnerHTML, so
 * anything it fails to escape is executable. Article bodies are fetched over
 * the network, and the CSP permits inline script, so this is the one place in
 * the app where an unescaped angle bracket is a real finding rather than a
 * theoretical one.
 */
import { describe, it, expect } from 'vitest';
import { TOPIC_ARTICLES } from '@/lib/playbook-content';
import { renderMarkdown as render } from '@/lib/markdown';

describe('article markdown rendering is not an injection point', () => {
  const payloads = [
    '<script>alert(1)</script>',
    '<img src=x onerror="alert(1)">',
    'text <iframe src="javascript:alert(1)"></iframe> more',
    '**bold** with <svg onload=alert(1)>',
    '| a | <script>alert(1)</script> |\n| --- | --- |\n| b | c |',
  ];

  for (const payload of payloads) {
    it(`neutralises ${payload.slice(0, 34)}`, () => {
      // The right assertion is that no tag survives except the ones the
      // renderer itself writes. An escaped `onerror=` sitting in text content
      // is inert, so matching on the substring would fail correct output.
      const EMITTED = /<\/?(?:p|h3|h4|strong|code|pre|li|ul|div|table|thead|tbody|tr|th|td)\b[^>]*>/gi;
      const stripped = render(payload).replace(EMITTED, '');
      expect(stripped).not.toMatch(/</);
    });
  }

  it('still renders the markdown it is supposed to', () => {
    const html = render('## Heading\n\n**bold** and `code`\n\n- item');
    expect(html).toContain('<h3');
    expect(html).toContain('<strong');
    expect(html).toContain('<code');
    expect(html).toContain('<li');
  });

  it('no shipped article contains raw HTML that would now be shown literally', () => {
    // Escaping changes behaviour only for articles that relied on inline HTML.
    // Two things are deliberately not offenders:
    //   - angle brackets inside code spans/fences (`<region>`, `<repo>`), which
    //     are CLI placeholder syntax and are meant to render literally;
    //   - `<word>` in prose that is not an HTML element name, same reason.
    // So strip code first, then match only against real element names.
    const HTML_ELEMENTS = new Set([
      'a', 'b', 'br', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i',
      'iframe', 'img', 'input', 'li', 'ol', 'p', 'pre', 'script', 'span', 'strong',
      'style', 'svg', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'ul',
    ]);
    const stripCode = (s: string) => s.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');

    const offenders = TOPIC_ARTICLES.filter((a) =>
      Array.from(stripCode(a.content).matchAll(/<\/?([a-z][a-z0-9]*)[\s/>]/gi)).some((m) =>
        HTML_ELEMENTS.has(m[1].toLowerCase()),
      ),
    );
    expect(offenders.map((a) => a.id)).toEqual([]);
  });
});

describe('article markdown produces valid block structure', () => {
  it('puts nothing but list items directly inside a list', () => {
    const html = render('- alpha\n- beta\n- gamma');
    // Strip the <li> elements; what remains inside the <ul> must be the
    // wrapper and whitespace only. A <p> here is invalid and is reported by
    // screen readers as a broken list.
    const inner = /<ul[^>]*>([\s\S]*?)<\/ul>/.exec(html)?.[1] ?? '';
    expect(inner).not.toContain('<p');
    expect(inner.replace(/<li[^>]*>[\s\S]*?<\/li>/g, '').trim()).toBe('');
  });

  it('wraps every list item, not just the first', () => {
    const html = render('- alpha\n- beta\n- gamma');
    expect((html.match(/<li\b/g) ?? []).length).toBe(3);
    expect((html.match(/<ul\b/g) ?? []).length).toBe(1);
  });

  it('numbered lists are structured too', () => {
    const html = render('1. one\n2. two');
    const inner = /<ul[^>]*>([\s\S]*?)<\/ul>/.exec(html)?.[1] ?? '';
    expect(inner).not.toContain('<p');
    expect((html.match(/<li\b/g) ?? []).length).toBe(2);
  });

  it('still wraps ordinary prose in paragraphs', () => {
    expect(render('just a sentence')).toContain('<p');
  });

  it('no shipped article emits a <p> directly inside a list', () => {
    const bad = TOPIC_ARTICLES.filter((a) =>
      Array.from(render(a.content).matchAll(/<ul[^>]*>([\s\S]*?)<\/ul>/g)).some((m) =>
        m[1].includes('<p'),
      ),
    );
    expect(bad.map((a) => a.id)).toEqual([]);
  });
});
