import type { MetadataRoute } from 'next';

const BASE = 'https://securingai.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`,         lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/dojo`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/playbook`, lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/about`,    lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
