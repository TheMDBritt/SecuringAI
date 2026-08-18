import { Skeleton } from '@/components/ui';

/**
 * Shown while a route's server payload is in flight.
 *
 * There was no loading.tsx anywhere, so navigating to any route showed the
 * previous page until the payload landed and then swapped wholesale. On a
 * fast connection that is invisible; on a phone it reads as a dead tap, and a
 * dead tap gets tapped again.
 *
 * Deliberately generic: it stands in for pages of different shapes, so it
 * suggests a header and a body without pretending to know which.
 */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <p className="sr-only" role="status" aria-live="polite">
        Loading page
      </p>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-3 h-4 w-full max-w-xl" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <Skeleton className="mt-6 h-64 w-full" />
    </div>
  );
}
