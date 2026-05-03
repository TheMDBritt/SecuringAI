import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Analytics } from '@vercel/analytics/next';

const TITLE = 'LLM DOJO — Free LLM Security Training';
const DESCRIPTION =
  'Free study tool for AI/LLM security. Practice attacking, defending, and operating AI systems through scored hands-on scenarios mapped to the top 2026 AI security certifications.';

export const metadata: Metadata = {
  metadataBase: new URL('https://securingai.app'),
  title: {
    default: TITLE,
    template: '%s · LLM DOJO',
  },
  description: DESCRIPTION,
  applicationName: 'LLM DOJO',
  keywords: [
    'AI security',
    'LLM security',
    'prompt injection',
    'OWASP LLM Top 10',
    'CompTIA SecAI+',
    'ISC2 CAISP',
    'ISACA AAISM',
    'NIST AI RMF',
    'EU AI Act',
    'ISO 42001',
    'MITRE ATT&CK',
    'AI security training',
    'AI red team',
  ],
  authors: [{ name: 'LLM DOJO' }],
  category: 'education',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'LLM DOJO',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-900 text-slate-100 antialiased">
        <Header />
        <main className="flex flex-col">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
