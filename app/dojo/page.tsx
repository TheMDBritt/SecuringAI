import { DojoTabs } from '@/components/dojo/DojoTabs';
import { OnboardingTour } from '@/components/dojo/OnboardingTour';
import { TrademarkNoticeCompact } from '@/components/layout/TrademarkNotice';

import { CATALOG_COUNTS } from '@/lib/catalog-counts';
import { CONTENT_COUNTS } from '@/lib/content-counts';

export const metadata = {
  title: 'Dojo',
  description:
    `${CATALOG_COUNTS.scenarios} scenarios across Dojo 1 (LLM attack and defense), Dojo 2 (SOC workflows with ${CATALOG_COUNTS.incidents} prebuilt incidents), and Dojo 3 (AI GRC). Every turn is scored deterministically and mapped to OWASP LLM Top 10, MITRE ATLAS, and ${CONTENT_COUNTS.certs} AI & cloud security certifications.`,
};

export default function DojoPage() {
  return (
    <div className="flex h-[calc(100vh-56px)] flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <DojoTabs />
      </div>
      <TrademarkNoticeCompact />
      <OnboardingTour />
    </div>
  );
}
