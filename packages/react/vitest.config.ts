import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { configDefaults, defineConfig } from 'vitest/config';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    css: true,
    passWithNoTests: true,
    // Playwright owns e2e/*.spec.ts (its own `test()` global conflicts with
    // Vitest's) — Vitest's default include glob would otherwise pick these
    // up too since they match `*.spec.ts`.
    exclude: [...configDefaults.exclude, 'e2e/**'],
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
  },
});
