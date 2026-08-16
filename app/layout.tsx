import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

const TITLE = 'Securing AI: Enterprise AI Security Training Platform';
const DESCRIPTION =
  'Enterprise-grade hands-on AI security training. Three practice disciplines: LLM attack and defense, AI-assisted SOC, and AI GRC. 2,113 quiz questions, 774 glossary terms and 70 dojo scenarios across 11 AI and cloud security certifications including CompTIA SecAI+, SC-500, AWS Certified Security - Specialty, GIAC GOAA, EC-Council CAIS, and CAISP.';

export const metadata: Metadata = {
  metadataBase: new URL('https://securingai.app'),
  title: {
    default: TITLE,
    template: '%s · Securing AI',
  },
  description: DESCRIPTION,
  applicationName: 'Securing AI',
  keywords: [
    'AI security',
    'LLM security',
    'prompt injection',
    'OWASP LLM Top 10',
    'CompTIA SecAI+',
    'AWS Certified Security Specialty',
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
  authors: [{ name: 'Securing AI' }],
  category: 'education',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'Securing AI',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: '#0b1120',
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
      <body className="min-h-screen bg-navy-900 text-slate-100 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
