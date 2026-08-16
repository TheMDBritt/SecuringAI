/**
 * Whether motion should be suppressed.
 *
 * Two sources, and both matter: the OS preference, and the app's own Reduce
 * motion setting, which writes data-reduce-motion on the document. The CSS
 * override handles transitions and keyframes, but it cannot stop a setInterval,
 * so any JS-driven animation has to ask as well.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  if (document.documentElement.dataset.reduceMotion === 'true') return true;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}
