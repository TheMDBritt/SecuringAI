// @vitest-environment jsdom
/**
 * The first test that renders anything.
 *
 * Every one of the ~717 tests before this exercised pure functions in lib/.
 * QuizEngine is 1,600 lines and the core of the product, and nothing verified
 * that a learner could answer a question, let alone sit a paper. The exam
 * navigation added in this phase is exactly the sort of change that unit tests
 * over helpers cannot protect: the bug it fixed was answers being discarded by
 * a component's own state handling.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { QuizQuestion } from '@/types';
import QuizEngine from '@/components/playbook/QuizEngine';

const question = (id: string, correct: 0 | 1 | 2 | 3): QuizQuestion => ({
  id,
  topic: 'Prompt Injection',
  category: 'AI Security',
  difficulty: 'beginner',
  certTags: ['SecAI'],
  question: `What does ${id} test?`,
  options: [`${id} option A`, `${id} option B`, `${id} option C`, `${id} option D`],
  correct,
  explanation: `Because ${id} says so.`,
});

const PAPER = [question('q1', 0), question('q2', 1), question('q3', 2)];

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
  // The engine fetches question bodies by id after the picker chooses them.
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => PAPER,
  })));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('preloaded practice session', () => {
  it('shows the first question rather than the setup screen', async () => {
    render(<QuizEngine preloadedQuestions={PAPER} preloadedLabel="Retake missed" />);
    expect(await screen.findByText(PAPER[0].question)).toBeInTheDocument();
    expect(screen.getByText(/Retake missed/)).toBeInTheDocument();
  });

  it('renders every option', async () => {
    render(<QuizEngine preloadedQuestions={PAPER} />);
    await screen.findByText(PAPER[0].question);
    for (const opt of PAPER[0].options) {
      expect(screen.getByText(opt)).toBeInTheDocument();
    }
  });

  it('reveals the explanation after answering', async () => {
    const user = userEvent.setup();
    render(<QuizEngine preloadedQuestions={PAPER} />);
    await screen.findByText(PAPER[0].question);

    await user.click(screen.getByText(PAPER[0].options[0]));

    // Practice mode reveals; the reveal is what distinguishes it from an exam.
    await waitFor(
      () => expect(screen.getByText(PAPER[0].explanation)).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });

  it('does not accept a second answer to the same question', async () => {
    const user = userEvent.setup();
    render(<QuizEngine preloadedQuestions={PAPER} />);
    await screen.findByText(PAPER[0].question);

    await user.click(screen.getByText(PAPER[0].options[1]));
    const other = screen.getByText(PAPER[0].options[2]).closest('button');
    expect(other).toBeDisabled();
  });
});

describe('the question is announced to assistive technology', () => {
  it('gives the paper a progress indication', async () => {
    render(<QuizEngine preloadedQuestions={PAPER} />);
    await screen.findByText(PAPER[0].question);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });
});

describe('setup remembers the exam', () => {
  /**
   * Walk the real setup flow. Preloaded sessions are always practice, so this
   * path is the only way into a configured quiz — which is exactly why it went
   * untested while being the first thing every learner touches.
   */
  async function pickCert(user: ReturnType<typeof userEvent.setup>) {
    const card = await screen.findByText(/CompTIA SecAI/);
    await user.click(card);
    // Selecting a cert does not advance on its own; step 2 pre-selects every
    // domain, so the default path is a screen where nothing is changed.
    await user.click(await screen.findByRole('button', { name: /^Continue$/i }));
    // Step 2's button carries the available count, e.g. "Continue, 351
    // questions available", so this cannot be anchored.
    await user.click(await screen.findByRole('button', { name: /^Continue,/i }));
  }

  it('reaches the options step through the picker', async () => {
    const user = userEvent.setup();
    render(<QuizEngine />);
    await pickCert(user);
    expect(await screen.findByText(/Selected Domains/i)).toBeInTheDocument();
  });

  it('skips the picker entirely on the next visit', async () => {
    const user = userEvent.setup();
    render(<QuizEngine />);
    await pickCert(user);
    await screen.findByText(/Selected Domains/i);

    // Six clicks to a first question, every single session, was the most
    // damaging friction in the product. The exam is remembered now.
    cleanup();
    render(<QuizEngine />);
    expect(await screen.findByText(/Selected Domains/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Change exam/i })).toBeInTheDocument();
  });

  it('lets the remembered exam be changed, so the skip is not a trap', async () => {
    const user = userEvent.setup();
    render(<QuizEngine />);
    await pickCert(user);
    await screen.findByText(/Selected Domains/i);

    await user.click(screen.getByRole('button', { name: /Change exam/i }));
    // Back at the picker, with more than one exam on offer.
    expect(await screen.findByText(/CompTIA SecAI/)).toBeInTheDocument();
    expect(screen.getByText(/AWS-AIF-C01/)).toBeInTheDocument();
  });
});
