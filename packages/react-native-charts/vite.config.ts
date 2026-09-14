import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'cjs' ? 'index.cjs' : 'index.js'),
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-native',
        '@gnome-ui/react-native',
        '@shopify/react-native-skia',
        'react-native-reanimated',
        'react-native-gesture-handler',
        'react-native-worklets',
        // victory-native's own npm package ships raw untranspiled JSX in both
        // its "dist" build and its "react-native"-condition source — it's
        // designed to be resolved and compiled by the *consuming app's* Metro
        // bundler directly, not pre-bundled by a library's own Vite/Rolldown
        // build (confirmed: bundling it here throws JSX parse errors).
        'victory-native',
      ],
    },
    sourcemap: true,
  },
});
