'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Securing AI] Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6 py-20 text-center">
      <p className="text-micro font-mono text-red-400 uppercase tracking-widest mb-3">
        Something broke
      </p>
      <h1 className="text-3xl md:text-5xl font-bold text-slate-100 tracking-tight mb-4">
        That wasn&apos;t supposed to happen.
      </h1>
      <p className="text-slate-400 max-w-md mb-2 leading-relaxed">
        The app hit an unexpected error. Try the action again, most failures
        are transient. If it keeps happening, refresh or head home.
      </p>
      {error.digest && (
        <p className="text-micro font-mono text-slate-400 mb-6">
          ref: {error.digest}
        </p>
      )}
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-slate-100 text-sm font-medium transition-colors"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
