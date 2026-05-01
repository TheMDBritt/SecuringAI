/**
 * Client-side helper for the Playbook quiz generator.
 * Calls POST /api/quiz-gen and returns validated QuizQuestion objects.
 * Throws on failure — callers should catch and fall back to the static bank.
 */
import type { QuizQuestion, QuizDifficulty } from '@/types';

export interface QuizGenRequest {
  topic:      string;
  category:   string;
  difficulty: QuizDifficulty;
  count:      number;
}

export async function generateQuizQuestions(req: QuizGenRequest): Promise<QuizQuestion[]> {
  const res = await fetch('/api/quiz-gen', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(req),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  const data = await res.json() as { questions: QuizQuestion[] };
  return data.questions;
}
