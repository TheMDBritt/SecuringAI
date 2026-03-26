import { DojoTabs } from '@/components/dojo/DojoTabs';

export const metadata = {
  title: 'LLM Dojo',
};

export default function DojoPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <DojoTabs />
    </div>
  );
}
