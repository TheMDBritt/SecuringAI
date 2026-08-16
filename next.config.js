/** @type {import('next').NextConfig} */

// Security headers applied to every response.
//
// The CSP is deliberately strict about where code and data may come from. Two
// concessions are unavoidable on Next.js App Router:
//   - 'unsafe-inline' for styles, because Tailwind and Next inject style tags.
//   - 'unsafe-eval' in development only, which the dev overlay and Fast Refresh
//     require. Production gets neither.
//
// connect-src stays 'self' because the browser never talks to a model provider
// directly. All provider traffic goes through the app's own API routes.
const isDev = process.env.NODE_ENV !== 'production';

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
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
