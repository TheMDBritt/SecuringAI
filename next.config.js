/** @type {import('next').NextConfig} */

// Security headers applied to every response.
//
// The CSP is deliberately strict about where code and data may come from. Two
// concessions are unavoidable on Next.js App Router:
//   - 'unsafe-inline' for styles, because Tailwind and Next inject style tags.
//   - 'unsafe-eval' in development only, which the dev overlay and Fast Refresh
//     require. Production gets neither.
//
// connect-src is 'self' plus the Supabase project, when one is configured.
// Model provider traffic still goes through the app's own API routes and never
// leaves the origin, so nothing is opened up for that.
//
// Progress sync is the one exception: it talks to Supabase from the browser,
// and a CSP of 'self' alone blocks every one of those requests before it is
// sent. Nothing in the app would report the failure, because a CSP violation is
// not an exception the calling code can catch; sync would simply never work and
// the panel would show a network error with no cause.
//
// The origin is read from the same variable the client uses, so a deployment
// with no sync configured keeps the original, tighter policy and a deployment
// with sync allows exactly one extra host rather than a wildcard.
const isDev = process.env.NODE_ENV !== 'production';

const supabaseOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return '';
  try {
    return new URL(raw).origin;
  } catch {
    return '';
  }
})();

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${supabaseOrigin ? ` ${supabaseOrigin}` : ''}`,
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // API responses are never cacheable and never embeddable. This is the
        // right default: the chat and evaluate routes carry user text, and the
        // question routes vary per request. It is also why setting a
        // Cache-Control header inside a route handler has no effect, the header
        // set here joins it and no-store wins.
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex' },
        ],
      },
      {
        // Generated study content: identical for every visitor, rebuilt on
        // every deploy, and addressed by a path that changes when the content
        // does. Safe to cache hard, which is the reason it is a static file
        // rather than a route.
        source: '/content/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
