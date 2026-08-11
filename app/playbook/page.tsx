import { Suspense } from 'react';
import PlaybookView from '@/components/playbook/PlaybookView';

export const metadata = {
  title: 'Playbook',
  description:
    '1,731 practice questions · 860 glossary terms · 76 topic articles · 11 cert maps. Select a certification, drill its official exam domains, get per-domain score breakdown. Covers CompTIA SecAI+, EC-Council C|AI Security, GIAC GOAA/GASAE, Microsoft SC-500, AWS AIF-C01, AWS Security Specialty (SCS-C03), Azure AI-103, and more.',
};

// PlaybookView calls useSearchParams() for deep-link support
// (?section=progress&session=<id>). Next.js requires that to live inside a
// Suspense boundary or the whole page opts out of static prerendering.
export default function PlaybookPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <Suspense fallback={null}>
        <PlaybookView />
      </Suspense>
    </div>
  );
}
