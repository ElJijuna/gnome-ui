import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const packageRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.ts', 'src/**/*.stories.ts', 'src/test'],
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(packageRoot, 'src'),
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(packageRoot, 'src/index.ts'),
        button: resolve(packageRoot, 'src/button.ts'),
        dialog: resolve(packageRoot, 'src/dialog.ts'),
        menu: resolve(packageRoot, 'src/menu.ts'),
        popover: resolve(packageRoot, 'src/popover.ts'),
        toast: resolve(packageRoot, 'src/toast.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => (format === 'cjs' ? `${entryName}.cjs` : `${entryName}.js`),
    },
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        assetFileNames: 'style.css',
      },
    },
  },
});
