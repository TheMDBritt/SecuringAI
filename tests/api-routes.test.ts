/**
 * Behavioural tests for the public content routes.
 *
 * An earlier version of these asserted that the source contained the strings
 * KNOWN_CERTS and MAX_QUERY_CHARS, which tests the name of a fix rather than
 * the fix: renaming a constant failed a working implementation, and restoring
 * an unbounded scan under the same name passed. The handlers are plain
 * functions over a Request, so they can just be called.
 */
import { describe, it, expect } from 'vitest';
import { GET as questions } from '@/app/api/questions/route';
import { GET as content } from '@/app/api/content/route';

const call = (handler: (r: Request) => Promise<Response>, url: string) =>
  handler(new Request(`http://test${url}`));

describe('/api/questions', () => {
  it('serves a known cert', async () => {
    const res = await call(questions, '/api/questions?cert=SC-500');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body.every((q: { certTags: string[] }) => q.certTags.includes('SC-500'))).toBe(true);
  });

  it('rejects an unknown cert rather than scanning the bank for it', async () => {
    const res = await call(questions, '/api/questions?cert=' + encodeURIComponent('../../etc/passwd'));
    expect(res.status).toBe(400);
  });

  it('rejects an oversized id list', async () => {
    const res = await call(questions, '/api/questions?ids=' + 'a'.repeat(50_000));
    expect(res.status).toBe(413);
  });

  it('returns only the ids asked for', async () => {
    const all = await (await call(questions, '/api/questions?cert=SC-500')).json();
    const wanted = all.slice(0, 3).map((q: { id: string }) => q.id);
    const res = await call(questions, `/api/questions?ids=${wanted.join(',')}`);
    const body = await res.json();
    expect(body.map((q: { id: string }) => q.id).sort()).toEqual([...wanted].sort());
  });

  it('requires a parameter', async () => {
    expect((await call(questions, '/api/questions')).status).toBe(400);
  });
});

describe('/api/content', () => {
  it('searches definitions', async () => {
    const res = await call(content, '/api/content?q=prompt%20injection');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.length).toBeGreaterThan(0);
    expect(body.length).toBeLessThanOrEqual(120);
  });

  it('ignores a query too short to be meaningful', async () => {
    const res = await call(content, '/api/content?q=a');
    expect(await res.json()).toEqual([]);
  });

  it('rejects an oversized query rather than scanning every definition', async () => {
    const res = await call(content, '/api/content?q=' + 'a'.repeat(5_000));
    expect(res.status).toBe(413);
  });

  it('rejects an oversized term list', async () => {
    const res = await call(content, '/api/content?terms=' + 'a'.repeat(50_000));
    expect(res.status).toBe(413);
  });

  it('requires a parameter', async () => {
    expect((await call(content, '/api/content')).status).toBe(400);
  });
});
