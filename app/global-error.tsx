'use client';

/**
 * Last-resort boundary for failures in the root layout itself.
 *
 * app/error.tsx cannot catch those, because it renders inside the layout that
 * is broken. This one replaces the whole document, so it ships its own minimal
 * styling rather than relying on anything the app provides.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#080d18',
          color: '#e2e8f0',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '2rem',
        }}
      >
        <div style={{ maxWidth: '32rem', textAlign: 'center' }}>
          <p
            style={{
              margin: 0,
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#f87171',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            Securing AI
          </p>
          <h1 style={{ fontSize: '1.75rem', margin: '0.75rem 0 0.5rem', letterSpacing: '-0.02em' }}>
            The app failed to start.
          </h1>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
            This is usually a bad deploy or a stale cached script. Reloading
            picks up the current version. Nothing stored in this browser is lost.
          </p>
          {error.digest && (
            <p style={{ color: '#94a3b8', fontFamily: 'ui-monospace, monospace', fontSize: '0.7rem' }}>
              ref {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: '0.5rem',
              background: '#06b6d4',
              color: '#04121a',
              border: 0,
              borderRadius: '0.5rem',
              padding: '0.7rem 1.4rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
