/** @type {import('next').NextConfig} */
//
// DEPENDENCY CVE STATUS (next@14.2.35, last audited 2026-03-27):
//
//   GHSA-9g9p-9gw9-jx7f  DoS via Image Optimizer remotePatterns
//     → NOT APPLICABLE: no remotePatterns configured; next/image not used.
//
//   GHSA-h25m-26qc-wcjf  HTTP request deserialization with insecure RSC
//     → NOT APPLICABLE: no insecure RSC usage in this app.
//
//   GHSA-ggv3-7p47-pfv8  HTTP request smuggling in rewrites
//     → NOT APPLICABLE: no rewrites() configured in next.config.js.
//
//   GHSA-3x4c-7xq6-9pq8  Unbounded next/image disk cache growth
//     → NOT APPLICABLE: next/image not used.
//
// Full fix requires Next.js 16 (breaking change). Safe to remain on 14.2.35
// until a breaking upgrade is planned. Re-audit on each Next.js release.

const securityHeaders = [
  // Prevent MIME-type sniffing attacks
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Block the site from being embedded in iframes (clickjacking)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Stop browsers from sending referrer info outside the origin
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable browser features that aren't needed
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  // Enforce HTTPS for 1 year (only active on HTTPS deployments)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  // Content Security Policy — restricts resource loading to own origin,
  // with the narrow exceptions required for the AI API calls (server-side only,
  // but CSP still needs to allow fetch() from Next.js server components/actions).
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js requires 'unsafe-inline' for its runtime styles; nonces are the
      // proper fix but require custom _document changes — scoped to a future task.
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js HMR + hydration
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'", // redundant with X-Frame-Options but belt-and-suspenders
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        // Apply to every route
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
