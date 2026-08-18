import type { MetadataRoute } from 'next';

/**
 * Makes the app installable and gives it an identity outside the browser tab.
 *
 * There was no manifest at all, while app/layout.tsx already declared a
 * themeColor with nothing to pair it with. This is the cheap half of offline
 * support: everything the learner needs is either static or already in
 * localStorage, so an installed instance behaves like an app rather than a
 * bookmark, and the study material is exactly the sort of thing people open on
 * a commute where the connection is not there.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Securing AI',
    short_name: 'Securing AI',
    description:
      'Free AI security training: interactive dojo labs and exam preparation across eleven certifications.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0b1120',
    theme_color: '#0b1120',
    orientation: 'portrait-primary',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}
