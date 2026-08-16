import { SCENARIOS } from '@/lib/scenarios';
import { QUIZ_TOTAL } from '@/lib/quiz-index';
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

  return <DashboardClient catalog={catalog} />;
}
