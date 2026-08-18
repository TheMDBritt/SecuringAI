'use client';

/**
 * Keeping every signed-in browser current, without anyone pressing a button.
 *
 * Sync used to run exactly once, on page load. That is enough to *pull* work
 * done elsewhere, but it is not enough to *push* work done here: finish a quiz
 * and close the tab, and the session sat in localStorage until the next time
 * the app happened to be opened on that same machine. On a work computer
 * someone uses once, that is never, and the work is stranded on a device they
 * may not come back to.
 *
 * So this schedules syncs around the two moments that matter:
 *
 *   - Progress changed here, so there is something to push. Debounced, because
 *     a quiz writes after every answer and 60 answers must not be 60 requests.
 *   - The tab is being left or returned to. Leaving is the last safe moment to
 *     flush; returning is when another device's work is most likely waiting.
 *
 * `visibilitychange` is the flush point rather than `unload` or `pagehide`.
 * Those are unreliable on mobile Safari, which frequently kills a backgrounded
 * tab without firing either, whereas hidden always fires first. The request is
 * an ordinary fetch that may not finish if the tab dies immediately after; that
 * is acceptable because nothing is lost, the local copy is still authoritative
 * and the next sync anywhere picks it up.
 *
 * Everything here is best-effort by design. syncNow resolves with an error
 * state rather than throwing, never touches local data on failure, and returns
 * immediately when signed out or unconfigured, so a failing network costs one
 * rejected promise and changes nothing.
 */
import { PROGRESS_CHANGED_EVENT } from './progress-store';
import { QUIZ_PROGRESS_CHANGED_EVENT } from './quiz-progress';
import { syncNow } from './sync';
import { consumeCredentialLink, hasCredentialLink } from './sync-client';

/** Long enough to cover a burst of answers, short enough to survive a tab close. */
const DEBOUNCE_MS = 4000;

/**
 * Floor between syncs triggered by returning to the tab.
 *
 * Alt-tabbing is not a signal that another device did something. Without this,
 * switching between windows while studying would sync on every switch.
 */
const REFRESH_MIN_MS = 60_000;

export function startAutoSync(): () => void {
  if (typeof window === 'undefined') return () => {};

  let timer: ReturnType<typeof setTimeout> | null = null;
  let running = false;
  let lastPullAt = 0;
  let stopped = false;

  const cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  async function run(): Promise<void> {
    if (stopped || running) return;
    running = true;
    cancel();
    try {
      await syncNow();
      lastPullAt = Date.now();
    } catch {
      // syncNow already reports failures through its return value. Reaching
      // here means something truly unexpected, and a background sync is never
      // worth surfacing an error for.
    } finally {
      running = false;
    }
  }

  /**
   * Arm the debounce, unless a sync is already in flight.
   *
   * That exclusion is the loop guard, and it has to be here rather than inside
   * run(). A sync writes the merged result to localStorage, which fires the
   * very events this is listening to. Queueing a follow-up pass instead means
   * the follow-up writes, fires, and queues another: an endless chain of
   * requests every DEBOUNCE_MS for as long as the tab stays open.
   *
   * The cost is that a genuine local change landing during the second or two a
   * sync is in flight does not arm the timer. Nothing is lost by that: it is
   * already saved locally, and the next answer, the next tab switch or the next
   * load pushes it. A dropped timer is recoverable, a request loop is not.
   */
  function schedule() {
    if (stopped || running) return;
    cancel();
    timer = setTimeout(() => void run(), DEBOUNCE_MS);
  }

  function onVisibility() {
    if (document.visibilityState === 'hidden') {
      // Last dependable moment before the tab may be discarded: flush whatever
      // the debounce is still holding rather than waiting out the timer.
      if (timer !== null) void run();
      return;
    }
    if (Date.now() - lastPullAt >= REFRESH_MIN_MS) void run();
  }

  window.addEventListener(PROGRESS_CHANGED_EVENT, schedule);
  window.addEventListener(QUIZ_PROGRESS_CHANGED_EVENT, schedule);
  document.addEventListener('visibilitychange', onVisibility);
  // Coming back from offline is the one case where the previous attempt is
  // known to have failed, so retry immediately rather than on the next change.
  window.addEventListener('online', () => void run());

  // A key link signs this browser in before the first sync, so arriving on one
  // both authenticates and pulls in a single pass rather than needing a reload.
  // Handled here rather than in the settings panel so the link works on any
  // route: the whole point is that it can be the everyday bookmark.
  //
  // Awaited deliberately. Starting the sync first would race the sign-in and
  // the first pass would run signed out, quietly doing nothing on the very
  // visit the link exists to serve.
  void (async () => {
    // consumeCredentialLink persists the session itself, via
    // signInWithPassword, so there is nothing to store here.
    if (hasCredentialLink()) await consumeCredentialLink();
    await run();
  })();

  return () => {
    stopped = true;
    cancel();
    window.removeEventListener(PROGRESS_CHANGED_EVENT, schedule);
    window.removeEventListener(QUIZ_PROGRESS_CHANGED_EVENT, schedule);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
