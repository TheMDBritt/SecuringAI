'use client';

import { useEffect, useState } from 'react';
import type { QuizQuestion } from '@/types';

/**
 * Loads question bodies by id, with a module-level cache.
 *
 * The review surfaces only ever show questions the learner has already
 * answered, which is tens of questions, not thousands. They used to import the
 * whole 2.2MB bank to look up that handful.
 */
const cache = new Map<string, QuizQuestion>();

export function useQuestionsByIds(ids: string[]): {
  byId: Record<string, QuizQuestion>;
  loading: boolean;
} {
  const key = ids.join(',');
  const [byId, setById] = useState<Record<string, QuizQuestion>>({});
  const [loading, setLoading] = useState(ids.length > 0);

  useEffect(() => {
    const wanted = key ? key.split(',') : [];
    if (wanted.length === 0) {
      setById({});
      setLoading(false);
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
      resolve();
      return;
    }

    let live = true;
    setLoading(true);
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
      if (live) setLoading(false);
    });

    return () => {
      live = false;
    };
  }, [key]);

  return { byId, loading };
}
