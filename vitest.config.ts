import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // The content-integrity suite loads multi-megabyte data modules.
    testTimeout: 30_000,
  },
  // tsconfig sets jsx: "preserve" and leaves the transform to Next, so esbuild
  // falls back to the classic runtime and any component pulled into a test
  // fails on an undefined `React`. Tests render components with
  // react-dom/server, so they need the automatic runtime the app itself uses.
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
});
