import { DojoTabs } from '@/components/dojo/DojoTabs';
import { OnboardingTour } from '@/components/dojo/OnboardingTour';

export const metadata = {
  title: 'Dojo',
  description:
    '59 scenarios across Dojo 1 (32 LLM attack/defense), Dojo 2 (12 SOC workflows, 47 prebuilt incidents), and Dojo 3 (15 AI GRC). Every turn is scored deterministically and mapped to OWASP LLM Top 10, MITRE ATLAS, and 11 AI & cloud security certifications.',
};

export default function DojoPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <DojoTabs />
      <OnboardingTour />
    </div>
  );
}
