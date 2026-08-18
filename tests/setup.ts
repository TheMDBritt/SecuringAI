/**
 * Shared test setup.
 *
 * jest-dom's matchers are additive and harmless under the node environment, so
 * this is imported for every suite rather than duplicated in the component
 * ones. Anything that genuinely needs a DOM opts in with a per-file
 * `@vitest-environment jsdom` comment.
 */
import '@testing-library/jest-dom/vitest';
