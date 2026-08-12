import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // The content-integrity suite loads multi-megabyte data modules.
    testTimeout: 30_000,
  },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
});
