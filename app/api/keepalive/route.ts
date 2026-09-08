import { NextResponse, type NextRequest } from 'next/server';

/**
 * GET /api/keepalive
 *
 * Touches the database so the Supabase project is not paused for inactivity.
 *
 * Free-tier projects pause after seven consecutive days without requests, and
 * this one came within a day of it. The failure that follows is quiet and
 * expensive: sync stops working, syncNow returns an error state that is only
 * visible inside the settings panel, and a learner keeps studying on a device
 * whose progress is no longer reaching anywhere. The account holder would find
 * out when a second device failed to show their work.
 *
 * Pinging by hand is not a fix. It has to be remembered every week, forever,
 * and it is precisely the sort of chore that gets forgotten during the weeks
 * when nobody is studying — which are exactly the weeks the project pauses.
 *
 * Runs from a Vercel cron (see vercel.json). Once a day rather than once a
 * week: the schedule needs enough margin that a single failed run, or a day the
 * platform is busy, does not spend the whole allowance.
 *
 * The query itself is deliberately the cheapest thing that still reaches
 * Postgres. It reads through RLS as an anonymous caller, so it returns nothing
 * and can see nothing; the point is the round trip, not the rows.
 */
export const dynamic = 'force-dynamic';

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

/**
 * Vercel sends `Authorization: Bearer $CRON_SECRET` when that variable is set.
 *
 * Checked when configured and skipped when not, so the keep-alive works the
 * moment it deploys rather than silently doing nothing until someone adds an
 * environment variable. Unauthenticated, the worst this offers a stranger is
 * the ability to do what the cron already does once a day, against a limit
 * that is measured in weeks.
 */
function authorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorised(req)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  if (!URL_BASE || !PUBLISHABLE) {
    // Nothing configured on this deployment, which is a valid state: sync is
    // optional and the app is fully usable without it.
    return NextResponse.json({ ok: true, skipped: 'sync not configured' });
  }

  try {
    const res = await fetch(`${URL_BASE}/rest/v1/progress?select=user_id&limit=1`, {
      headers: { apikey: PUBLISHABLE, Authorization: `Bearer ${PUBLISHABLE}` },
      cache: 'no-store',
    });
    // Any answer from PostgREST means the project served a request, which is
    // the whole job. A 401 counts as much as a 200 here.
    return NextResponse.json({ ok: res.ok, status: res.status });
  } catch (err) {
    // Reported rather than thrown: a failed keep-alive is worth seeing in the
    // cron log, and is not worth a 500 that reads as the site being down.
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'unreachable' },
      { status: 200 },
    );
  }
}
