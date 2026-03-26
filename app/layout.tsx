import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'LLM Dojo — AI Security Training',
  description:
    'Practice attacking and defending LLMs, using AI for security operations, and defending against AI-powered attacks.',
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
