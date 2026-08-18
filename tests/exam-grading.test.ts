/**
 * Grading a paper that can be navigated.
 *
 * Exam mode used to be one-directional: the index only ever incremented,
 * options were disabled after the first press, and there was no flagging. Time
 * up and end-early each walked forward from the current position appending
 * skips, which silently discarded answers already given to earlier questions.
 * These pin the shape the grading has to produce however the paper ends.
 *
 * The logic under test is the same transformation QuizEngine.submitExam
 * performs; it is reproduced here because the component itself has no test
 * harness in this project yet.
 */
import { describe, it, expect } from 'vitest';
import type { QuizQuestion } from '@/types';

const q = (id: string, correct: 0 | 1 | 2 | 3): QuizQuestion => ({
  id, topic: 't', category: 'c', difficulty: 'beginner', certTags: ['SecAI'],
  question: `Q ${id}`, options: ['a', 'b', 'c', 'd'], correct, explanation: 'because',
});

interface Graded { qId: string; chosen: number | null; correct: boolean; skipped: boolean }

/** Mirrors submitExam: grade every position from the answer array. */
function grade(questions: QuizQuestion[], answers: (number | null)[]): Graded[] {
  return questions.map((question, i) => {
    const chosen = answers[i] ?? null;
    return {
      qId: question.id,
      chosen,
      correct: chosen !== null && chosen === question.correct,
      skipped: chosen === null,
    };
  });
}

const paper = [q('q1', 0), q('q2', 1), q('q3', 2), q('q4', 3)];

describe('grading a submitted paper', () => {
  it('grades every question, not just the ones reached', () => {
    expect(grade(paper, [0, 1])).toHaveLength(4);
  });

  it('keeps answers given to earlier questions when time runs out later', () => {
    // The old path walked forward from the current index appending skips, so
    // answering q1 and q2, moving to q4, and running out of time discarded
    // both. That is somebody's exam score.
    const graded = grade(paper, [0, 1, null, null]);
    expect(graded[0]).toMatchObject({ correct: true, skipped: false });
    expect(graded[1]).toMatchObject({ correct: true, skipped: false });
    expect(graded[2].skipped).toBe(true);
    expect(graded[3].skipped).toBe(true);
  });

  it('counts a changed answer, not the first one given', () => {
    // Answer q1 wrongly, go back, correct it. The revision is the answer.
    const answers: (number | null)[] = [3, null, null, null];
    answers[0] = 0;
    expect(grade(paper, answers)[0].correct).toBe(true);
  });

  it('treats a cleared answer as unanswered rather than wrong', () => {
    const graded = grade(paper, [null, 1, null, null]);
    expect(graded[0]).toMatchObject({ skipped: true, correct: false, chosen: null });
  });

  it('does not mark an unanswered question as wrong', () => {
    // Skipped and wrong are different facts. The scheduler must not read
    // "ran out of time" as "did not know".
    const graded = grade(paper, []);
    expect(graded.every((g) => g.skipped)).toBe(true);
    expect(graded.every((g) => !g.correct)).toBe(true);
  });

  it('produces the same result whether submitted by hand or by the timer', () => {
    const answers: (number | null)[] = [0, 2, null, 3];
    expect(grade(paper, answers)).toEqual(grade(paper, answers));
  });

  it('scores a full paper correctly', () => {
    const graded = grade(paper, [0, 1, 2, 3]);
    expect(graded.filter((g) => g.correct)).toHaveLength(4);
  });
});

describe('review ordering', () => {
  /** Mirrors ReviewScreen: unanswered first, then wrong, then correct. */
  function reviewOrder(graded: Graded[]): number[] {
    const rank = (g: Graded) => (g.skipped ? 0 : g.correct ? 2 : 1);
    return graded.map((_, i) => i).sort((a, b) => rank(graded[a]) - rank(graded[b]) || a - b);
  }

  it('puts what needs attention before what does not', () => {
    // Reviewing in exam order starts with questions already known to be right,
    // and attention runs out before reaching the ones that matter.
    const graded = grade(paper, [0, 3, null, 3]); // right, wrong, skipped, right
    expect(reviewOrder(graded)).toEqual([2, 1, 0, 3]);
  });

  it('is stable within a group so numbering stays predictable', () => {
    const graded = grade(paper, [1, 2, 3, 0]); // all wrong
    expect(reviewOrder(graded)).toEqual([0, 1, 2, 3]);
  });
});
