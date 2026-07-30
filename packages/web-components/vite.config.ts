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
        avatar: resolve(packageRoot, 'src/avatar.ts'),
        badge: resolve(packageRoot, 'src/badge.ts'),
        button: resolve(packageRoot, 'src/button.ts'),
        checkbox: resolve(packageRoot, 'src/checkbox.ts'),
        dialog: resolve(packageRoot, 'src/dialog.ts'),
        menu: resolve(packageRoot, 'src/menu.ts'),
        popover: resolve(packageRoot, 'src/popover.ts'),
        'progress-bar': resolve(packageRoot, 'src/progress-bar.ts'),
        'radio-group': resolve(packageRoot, 'src/radio-group.ts'),
        separator: resolve(packageRoot, 'src/separator.ts'),
        skeleton: resolve(packageRoot, 'src/skeleton.ts'),
        slider: resolve(packageRoot, 'src/slider.ts'),
        'spin-button': resolve(packageRoot, 'src/spin-button.ts'),
        spinner: resolve(packageRoot, 'src/spinner.ts'),
        switch: resolve(packageRoot, 'src/switch.ts'),
        'text-field': resolve(packageRoot, 'src/text-field.ts'),
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
