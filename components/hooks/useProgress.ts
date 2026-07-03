'use client';

import { useEffect, useState } from 'react';
import {
  loadProgress,
  summarize,
  onProgressChange,
  type ProgressState,
  type ProgressSummary,
} from '@/lib/progress-store';

const EMPTY: ProgressState = { quizRuns: [], attackRuns: [] };

/**
 * Subscribes to the localStorage progress store. `hydrated` is false during the
 * first server/client render so pages can render deterministic empty states and
 * avoid hydration mismatches.
 */
export function useProgress(): {
  state: ProgressState;
  summary: ProgressSummary;
  hydrated: boolean;
} {
  const [state, setState] = useState<ProgressState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const refresh = () => setState(loadProgress());
    refresh();
    setHydrated(true);
    return onProgressChange(refresh);
  }, []);

  return { state, summary: summarize(state), hydrated };
}
