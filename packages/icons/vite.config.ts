import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import { generateEntries } from 'vite-magic-tree-shaking';
import dts from 'vite-plugin-dts';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: generateEntries(__dirname, 'src', { warnOnExportsMismatch: true }),
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => (format === 'cjs' ? `${entryName}.cjs` : `${entryName}.js`),
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
    sourcemap: true,
  },
});
