import { NextResponse } from 'next/server';

/**
 * Reads a bounded, delimited list from a query parameter.
 *
 * Both content routes need the same guard, and each had grown its own pair of
 * constants: a character cap and a count cap, with the count applied by slicing
 * the result of the split, which allocates the whole array first. One helper,
 * one rule: reject anything over the byte budget, then split.
 *
 * Returns a 413 response instead of a value when the input is over budget, so
 * the caller can return it directly.
 */
export function boundedList(
  raw: string,
  { max, separator = ',', label }: { max: number; separator?: string; label: string },
): Set<string> | NextResponse {
  // 40 characters is a generous ceiling for any id or term in this data set.
  if (raw.length > max * 40) {
    return NextResponse.json({ error: `Too many ${label}` }, { status: 413 });
  }
  return new Set(raw.split(separator).filter(Boolean).slice(0, max));
}

export function isOverBudget(v: Set<string> | NextResponse): v is NextResponse {
  return v instanceof NextResponse;
}
