import PlaybookView from '@/components/playbook/PlaybookView';

export const metadata = {
  title: 'Playbook',
  description:
    'AI security study handbook — topics, glossary, certification map, and a quiz bank covering CompTIA SecAI+, ISC2 CAISP, ISACA AAISM, EC-Council CAIS, AWS, Azure, Google Cloud, and GIAC AI exams.',
};

export default function PlaybookPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <PlaybookView />
    </div>
  );
}
