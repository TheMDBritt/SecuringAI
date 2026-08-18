'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { reportError } from '@/lib/report-error';

/**
 * Shared body for the route-level error boundaries.
 *
 * A single app-wide boundary meant that a crash anywhere, including inside one
 * panel of the Dojo, replaced the entire page. Segment boundaries keep the
 * failure local and let the user retry that segment without losing the rest.
 */
export function RouteError({
  error,
  reset,
  surface,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  /** What broke, in the user's language, e.g. "the Dojo". */
  surface: string;
}) {
  useEffect(() => {
    reportError({ message: error.message, digest: error.digest, boundary: surface });
  }, [error, surface]);

  return (
    <div
      role="alert"
      className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center"
    >
      <p className="mb-3 font-mono text-micro uppercase tracking-widest text-red-400">
        {surface} stopped
      </p>
      <h1 className="mb-3 text-display-sm font-bold tracking-tight text-slate-100">
        Something went wrong here.
      </h1>
      <p className="mb-6 text-sm leading-relaxed text-slate-400">
        The rest of the app is fine. Most failures here are transient, so trying
        again usually works. Your progress is stored in this browser and has not
        been affected.
      </p>
      {error.digest && (
        <p className="mb-5 font-mono text-micro text-slate-400">ref {error.digest}</p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-400"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
        >
          Go to overview
        </Link>
      </div>
    </div>
  );
}
