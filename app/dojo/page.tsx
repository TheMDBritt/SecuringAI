import { DojoTabs } from '@/components/dojo/DojoTabs';
import { OnboardingTour } from '@/components/dojo/OnboardingTour';

export const metadata = {
  title: 'Dojo',
  description:
    '13 scenarios across Dojo 1 (LLM attack/defense), Dojo 2 (AI-assisted SOC with 20 prebuilt incidents), and Dojo 3 (AI GRC). Every turn is scored and mapped to OWASP LLM Top 10, MITRE ATT&CK, and AI security certifications.',
};

export default function DojoPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <DojoTabs />
      <OnboardingTour />
    </div>
  );
}
