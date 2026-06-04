import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';

const TITLE = 'LLM DOJO — Free AI Security Training';
const DESCRIPTION =
  'Free hands-on AI security training. Three interactive dojos: LLM attack and defense, AI-assisted SOC, and AI GRC. 1,080+ quiz questions · 579+ glossary terms · 27 scenarios across 10 AI security certifications including CompTIA SecAI+, SC-500, GIAC GOAA, EC-Council C|AI Security, and CAISP. No account, no API key required.';

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
    'CAISP',
    'EC-Council C|AI Security',
    'SC-500 Cloud AI Security',
    'GIAC GASAE',
    'GIAC GOAA',
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
      </body>
    </html>
  );
}
