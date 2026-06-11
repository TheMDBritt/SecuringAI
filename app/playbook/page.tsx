import PlaybookView from '@/components/playbook/PlaybookView';

export const metadata = {
  title: 'Playbook',
  description:
    '1,390 practice questions · 734 glossary terms · 76 topic articles · 10 cert maps. Select a certification, drill its official exam domains, get per-domain score breakdown. Covers CompTIA SecAI+, EC-Council C|AI Security, GIAC GOAA/GASAE, Microsoft SC-500, AWS AIF-C01, Azure AI-103, and more.',
};

export default function PlaybookPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <PlaybookView />
    </div>
  );
}
