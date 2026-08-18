'use client';

/**
 * Writing to localStorage without losing work silently.
 *
 * Two separate bugs lived in the two progress stores, and both mattered.
 *
 * progress-store wrote without a try/catch at all, on the path that records a
 * finished quiz. localStorage.setItem throws a QuotaExceededError when full,
 * and Safari in private browsing throws on every write regardless of space. So
 * finishing a sixty-question mock exam could throw out of the completion
 * handler and trip the route error boundary: the user sat the exam and was
 * shown a crash instead of a score.
 *
 * quiz-progress did catch, but then returned silently with a comment saying
 * there was nothing else to do. That was true once and is not any more, because
 * the app now has both a backup export and cross-device sync. Studying for
 * weeks against a full disk while every session is dropped, with nothing on
 * screen, is worse than an error: the learner believes the record exists.
 *
 * So writes go through here. A failure is remembered and announced, and the
 * shell shows a banner pointing at the export. Callers get a boolean rather
 * than an exception, because no caller should have to decide whether a storage
 * problem is worth interrupting a study session for.
 */

/** Fired when a write starts failing, or recovers. The shell listens. */
export const STORAGE_HEALTH_EVENT = 'securingai:storage-health';

let failing = false;

/** Whether the last write attempt failed. Drives the warning banner. */
export function storageFailing(): boolean {
  return failing;
}

function setFailing(next: boolean): void {
  if (failing === next) return;
  failing = next;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(STORAGE_HEALTH_EVENT));
  }
}

/**
 * Write one key, reporting success rather than throwing.
 *
 * Returns false on quota exhaustion, disabled storage, or private browsing.
 * The caller decides whether to skip its change notification: firing a change
 * event after a failed write would tell every open view to re-read a store
 * that did not change.
 */
export function safeWrite(key: string, value: string): boolean {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false;
  }
  try {
    window.localStorage.setItem(key, value);
    setFailing(false);
    return true;
  } catch {
    setFailing(true);
    return false;
  }
}

export function onStorageHealthChange(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(STORAGE_HEALTH_EVENT, cb);
  return () => window.removeEventListener(STORAGE_HEALTH_EVENT, cb);
}

/** Test seam: forget the remembered failure. */
export function resetStorageHealth(): void {
  failing = false;
}
