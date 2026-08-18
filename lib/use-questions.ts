'use client';

import { useEffect, useState } from 'react';
import type { QuizQuestion } from '@/types';

/**
 * Loads question bodies by id, with a module-level cache.
 *
 * The review surfaces only ever show questions the learner has already
 * answered, which is tens of questions, not thousands. They used to import the
 * whole 2.2MB bank to look up that handful.
 *
 * The hook reports failure rather than swallowing it. It previously caught the
 * rejection, cleared `loading` and left `byId` empty, so a network error was
 * indistinguishable from "you have not answered anything yet" — the caller
 * rendered an empty state and the learner was told, in effect, that their work
 * did not exist. That is the likely failure on the commute this app is meant to
 * serve. Callers that already track their own error state do it this way:
 * QuizEngine and ObjectiveBreakdown both surface a retry.
 */
const cache = new Map<string, QuizQuestion>();

export function useQuestionsByIds(ids: string[]): {
  byId: Record<string, QuizQuestion>;
  loading: boolean;
  error: string | null;
} {
  const key = ids.join(',');
  const [byId, setById] = useState<Record<string, QuizQuestion>>({});
  const [loading, setLoading] = useState(ids.length > 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const wanted = key ? key.split(',') : [];
    if (wanted.length === 0) {
      setById({});
      setLoading(false);
      setError(null);
      return;
    }

    const missing = wanted.filter((id) => !cache.has(id));
    const resolve = () => {
      const out: Record<string, QuizQuestion> = {};
      for (const id of wanted) {
        const q = cache.get(id);
        if (q) out[id] = q;
      }
      setById(out);
      setLoading(false);
    };

    if (missing.length === 0) {
      setError(null);
      resolve();
      return;
    }

    let live = true;
    setLoading(true);
    setError(null);
    (async () => {
      const CHUNK = 60;
      for (let i = 0; i < missing.length; i += CHUNK) {
        const slice = missing.slice(i, i + CHUNK);
        const res = await fetch(`/api/questions?ids=${encodeURIComponent(slice.join(','))}`);
        if (!res.ok) throw new Error(`questions ${res.status}`);
        for (const q of (await res.json()) as QuizQuestion[]) cache.set(q.id, q);
      }
      if (live) resolve();
    })().catch(() => {
      if (!live) return;
      // Whatever earlier chunks did land are already in the shared cache, so
      // show them rather than nothing: a partial review beats a blank screen.
      // The error still surfaces, because a partial list silently presented as
      // complete would be the worse lie.
      resolve();
      setError('Could not load these questions. Check your connection and try again.');
    });

    return () => {
      live = false;
    };
  }, [key]);

  return { byId, loading, error };
}
