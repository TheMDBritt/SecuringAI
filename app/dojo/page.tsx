import { DojoTabs } from '@/components/dojo/DojoTabs';
import { OnboardingTour } from '@/components/dojo/OnboardingTour';

export const metadata = {
  title: 'Dojo',
  description:
    'Three connected dojos covering AI/LLM offence, defence, and SOC operations. Every turn is scored and mapped to the top 2026 AI security certifications.',
};

export default function DojoPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <DojoTabs />
      <OnboardingTour />
    </div>
  );
}
