/**
 * Article markdown rendering.
 *
 * Lives here rather than inside the browser component because it is logic with
 * a security property, and logic with a security property should be directly
 * testable rather than reachable only by rendering a React tree.
 */
/**
 * Escapes the characters that let text become markup.
 *
 * The renderer's output goes through dangerouslySetInnerHTML, so anything not
 * escaped here is executable. Previously only fenced code blocks were escaped,
 * which meant a single stray tag anywhere else in an article body became live
 * HTML. Article bodies also travel over the network now, and the CSP allows
 * inline script, so an injected handler would have run.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderMarkdown(md: string): string {
  // Whether the article has any level-2 headings at all, which decides the
  // level ### renders at further down.
  const hasSubheads = /^## /m.test(md);

  // Escape first, then build markup. Every tag below this line is one this
  // function wrote; nothing from the source can introduce another. Markdown
  // syntax uses #, *, |, - and backticks, none of which are escaped, so the
  // transforms still see what they need.
  md = escapeHtml(md);

  // 1. Fenced code blocks (```... ```), must run before inline code
  md = md.replace(/```[\w]*\n([\s\S]*?)```/g, (_, code) =>
    `<pre class="bg-slate-800 border border-slate-700 rounded-lg p-3 my-3 overflow-x-auto"><code class="text-2xs font-mono text-brand-300 whitespace-pre">${code}</code></pre>`,
  );

  // 2. Tables, | col | col | rows
  md = md.replace(/((?:^\|.+\|\n?)+)/gm, (block) => {
    const rows = block.trim().split('\n').filter((r) => !/^\s*\|[-| :]+\|\s*$/.test(r));
    const toCell = (row: string, tag: string) =>
      row
        .split('|')
        .slice(1, -1)
        .map((c) => `<${tag} class="px-3 py-1.5 text-left border border-slate-700 text-2xs">${c.trim()}</${tag}>`)
        .join('');
    const [head, ...body] = rows;
    return `<div class="overflow-x-auto my-3"><table class="w-full border-collapse text-slate-300"><thead class="bg-slate-800"><tr>${toCell(head, 'th')}</tr></thead><tbody>${body.map((r) => `<tr class="border-t border-slate-700 hover:bg-slate-800/40">${toCell(r, 'td')}</tr>`).join('')}</tbody></table></div>`;
  });

  // 3. Headings
  md = md
    // The article title is an h2, so ## is h3 and ### is h4. An article that
    // uses ### without any ## would jump h2 to h4, which breaks heading
    // navigation, so ### is promoted when there is nothing at the level above.
    .replace(/^## (.+)$/gm, '<h3 class="text-sm font-semibold text-slate-100 mt-5 mb-1.5">$1</h3>')
    .replace(
      /^### (.+)$/gm,
      hasSubheads
        ? '<h4 class="text-xs font-semibold text-slate-300 mt-3 mb-1">$1</h4>'
        : '<h3 class="text-sm font-semibold text-slate-100 mt-5 mb-1.5">$1</h3>',
    );

  // 4. Bold
  md = md.replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-100 font-semibold">$1</strong>');

  // 5. Inline code (after fenced blocks already removed)
  md = md.replace(/`([^`]+)`/g, '<code class="text-2xs bg-slate-700/60 text-brand-300 px-1 py-0.5 rounded font-mono">$1</code>');

  // 6. Lists
  md = md
    .replace(/^- (.+)$/gm, '<li class="text-sm text-slate-300 leading-relaxed ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="text-sm text-slate-300 leading-relaxed ml-4 list-decimal">$2</li>')
    .replace(/(<li[\s\S]*?<\/li>\n?)+/g, '<ul class="space-y-0.5 my-2">$&</ul>');

  // 7. Paragraphs, wrap lines that are not already a block element.
  //
  // The skip list is spelled out rather than matched by first letter. It used
  // to be `<[htupd]`, which has no `l`, so every <li> after the first — the
  // first shares its line with the <ul> opening tag — was wrapped in a <p>.
  // That put <p> elements directly inside <ul>, which is invalid and which
  // screen readers report as a broken list.
  const BLOCK_START = /^(?!<\/?(?:h[1-6]|p|div|table|thead|tbody|tr|th|td|ul|ol|li|pre)\b)(.+)$/gm;
  md = md
    .replace(/\n\n/g, '\n')
    .replace(BLOCK_START, '<p class="text-sm text-slate-300 leading-relaxed my-2">$1</p>');

  return md;
}
