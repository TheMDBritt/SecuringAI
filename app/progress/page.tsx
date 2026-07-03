import { SCENARIOS } from '@/lib/scenarios';
import { EXAM_CERTS } from '@/lib/cert-exam-domains';
import { ProgressClient } from '@/components/progress/ProgressClient';

export const metadata = {
  title: 'Progress',
  description:
    'Detailed training progress across all three disciplines and every mapped certification — completion, defense rate, quiz accuracy, and full attempt history.',
};

const DOJO_TITLES: Record<1 | 2 | 3, string> = {
  1: 'LLM Attack & Defense',
  2: 'AI-Assisted SOC',
  3: 'AI GRC',
};

export default function ProgressPage() {
  const scenarios = SCENARIOS.map((s) => ({
    id: s.id,
    title: s.title,
    dojoId: s.dojoId,
    difficulty: s.difficulty,
  }));
  const certs = EXAM_CERTS.map((c) => ({ id: c.id, name: c.name, provider: c.provider }));

  return <ProgressClient scenarios={scenarios} certs={certs} dojoTitles={DOJO_TITLES} />;
}
