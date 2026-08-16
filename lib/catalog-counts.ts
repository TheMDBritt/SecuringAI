/**
 * Catalogue sizes, as plain numbers.
 *
 * The marketing page, the dashboard and the footer each want a handful of
 * counts. Reading them from the source arrays meant importing 222kB of
 * incident bodies and every scenario description to render six integers, and
 * because Next prefetches route chunks from any page that links to them, that
 * weight followed the visitor onto the landing page.
 *
 * These are asserted against the real data in tests/content-integrity.test.ts,
 * so they cannot drift without the suite failing.
 */
export const CATALOG_COUNTS = {
  scenarios: 70,
  dojo1: 41,
  dojo2: 12,
  dojo3: 17,
  incidents: 56,
} as const;
