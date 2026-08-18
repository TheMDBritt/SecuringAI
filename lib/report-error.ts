'use client';

/**
 * Where an unhandled error goes.
 *
 * The error boundaries called console.error and stopped. The digest shown to
 * the user, "ref: a3f9c2", was a dead reference: nothing on the server ever
 * correlated it to a stack trace, so someone reporting it got you nothing, and
 * there was no way to know whether a release had broken anything at all.
 *
 * This is deliberately not an SDK. A hosted error service is the right answer
 * for a funded product, and this file is where it would be plugged in — one
 * function, one call site per boundary. Until a provider and its DSN exist,
 * shipping a beacon to the app's own origin means the digest at least reaches
 * server logs, where it can be found, and costs a few lines rather than a
 * dependency in a bundle every page pays for.
 *
 * Never throws. An error reporter that can fail during error handling turns one
 * broken page into two.
 */
export interface ErrorReport {
  message: string;
  digest?: string;
  /** Which boundary caught it, so the log says where without a stack. */
  boundary: string;
  path?: string;
}

export function reportError(report: ErrorReport): void {
  try {
    // eslint-disable-next-line no-console
    console.error('[Securing AI]', report.boundary, report.digest ?? '', report.message);

    if (typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') return;
    // sendBeacon rather than fetch: the page is in a broken state and may be
    // navigated away from immediately, and a beacon survives that where a
    // pending fetch does not.
    const body = JSON.stringify({
      ...report,
      path: report.path ?? (typeof location !== 'undefined' ? location.pathname : undefined),
      at: new Date().toISOString(),
    });
    navigator.sendBeacon('/api/client-error', new Blob([body], { type: 'application/json' }));
  } catch {
    // Reporting must never be the reason a page fails twice.
  }
}
