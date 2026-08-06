import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    passWithNoTests: true,
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
  },
});
