import { SCENARIOS } from '@/lib/scenarios';
import { QUIZ_TOTAL, QUIZ_INDEX } from '@/lib/quiz-index';
import { GLOSSARY_TERMS } from '@/lib/playbook-glossary';
import { CATALOG_COUNTS } from '@/lib/catalog-counts';
import { EXAM_CERTS } from '@/lib/cert-exam-domains';
import { DashboardClient, type CatalogScenario } from '@/components/dashboard/DashboardClient';

export const metadata = {
  title: 'Dashboard',
  description:
    'Your executive AI security training dashboard, completion, quiz accuracy, difficulty distribution, recent activity, and recommended next scenario.',
};

const DOJO_META: Record<1 | 2 | 3, { title: string; accent: string }> = {
  1: { title: 'LLM Attack & Defense', accent: 'red' },
  2: { title: 'AI-Assisted SOC', accent: 'cyan' },
  3: { title: 'AI GRC', accent: 'emerald' },
};

export default function DashboardPage() {
  const scenarios: CatalogScenario[] = SCENARIOS.map((s) => ({
    id: s.id,
    title: s.title,
    dojoId: s.dojoId,
    difficulty: s.difficulty,
  }));

  // Counted here so the client never has to import the question index for it.
  const poolSizes: Record<string, number> = {};
  for (const c of EXAM_CERTS) {
    poolSizes[c.id] = QUIZ_INDEX.filter((q) => q.certTags.includes(c.id)).length;
  }

  const catalog = {
    scenarios,
    counts: {
      scenarios: SCENARIOS.length,
      questions: QUIZ_TOTAL,
      glossary: GLOSSARY_TERMS.length,
      incidents: CATALOG_COUNTS.incidents,
      certs: EXAM_CERTS.length,
    },
    dojoMeta: DOJO_META,
  };

  return <DashboardClient catalog={catalog} poolSizes={poolSizes} />;
}
