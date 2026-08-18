import type { MetadataRoute } from 'next';

const BASE = 'https://securingai.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
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
