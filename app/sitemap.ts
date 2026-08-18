import type { MetadataRoute } from 'next';

const BASE = 'https://securingai.app';

/**
 * Pinned at build time, not request time.
 *
 * `new Date()` evaluated per request told crawlers that every URL on the site
 * had changed, every time they looked. A lastModified that is always now
 * carries no information, and a crawler that learns the signal is worthless
 * stops using it — which costs exactly the recrawl priority the field exists
 * to earn. The build time is the honest answer: the content is static and is
 * rebuilt when it changes.
 */
const BUILT_AT = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const now = BUILT_AT;
  return [
    { url: `${BASE}/`,          lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/dojo`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/playbook`,  lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/dashboard`, lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/help`,      lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/about`,     lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/privacy`,   lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/terms`,     lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
