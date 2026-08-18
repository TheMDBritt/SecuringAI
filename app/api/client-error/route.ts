import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { guard, readJsonBody } from '@/lib/api-guard';

/**
 * POST /api/client-error
 *
 * Receives what a client-side error boundary caught, so an error digest shown
 * to a user is findable afterwards. Previously the boundaries logged to the
 * browser console and the digest they displayed correlated to nothing.
 *
 * Writes to the server log and returns 204. It stores nothing and reads
 * nothing, which is the point: this is the smallest thing that makes a reported
 * reference traceable, and the seam a hosted error service would replace.
 *
 * Guarded like every other route. An unauthenticated endpoint that appends to a
 * log is a denial-of-service surface and a log-injection surface, so it takes
 * the same rate limit as the model routes and validates its body rather than
 * logging whatever arrives. Field lengths are capped because the log line is
 * the product here.
 */
const ReportSchema = z.object({
  message: z.string().max(500),
  digest: z.string().max(120).optional(),
  boundary: z.string().max(60),
  path: z.string().max(200).optional(),
  at: z.string().max(40).optional(),
});

/** Control characters would let a report forge extra log lines. */
function oneLine(value: string): string {
  return value.replace(/[\r\n\t]+/g, ' ').slice(0, 500);
}

export async function POST(req: NextRequest) {
  // spendsBudget is false: this never reaches a model provider, and charging
  // error reports against the daily model budget would let a broken page
  // exhaust the allowance that the dojos run on.
  const blocked = await guard(req, { cost: 1, spendsBudget: false });
  if (blocked) return blocked;

  const read = await readJsonBody(req);
  if (!read.ok) return read.response;

  const result = ReportSchema.safeParse(read.body);
  // A malformed report is not worth an error response: the caller is already
  // in a failure path and cannot act on one.
  if (!result.success) return new NextResponse(null, { status: 204 });
  const parsed = result.data;

  // eslint-disable-next-line no-console
  console.error(
    '[client-error]',
    oneLine(parsed.boundary),
    oneLine(parsed.digest ?? '-'),
    oneLine(parsed.path ?? '-'),
    oneLine(parsed.message),
  );

  return new NextResponse(null, { status: 204 });
}
