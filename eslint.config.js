import reactRefresh from 'eslint-plugin-react-refresh';
import eslintReactTsx from 'super-configs/eslint/react/tsx';

export default [
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'storybook-static/**',
      'node_modules/**',
      '.turbo/**',
      'packages/*/dist/**',
      'packages/*/coverage/**',
      'packages/*/storybook-static/**',
      'packages/*/.turbo/**',
    ],
  },
  ...eslintReactTsx,
  {
    name: 'gnome-ui/react-refresh',
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-refresh': reactRefresh },
    rules: {
      '@stylistic/brace-style': 'off',
      '@stylistic/indent': 'off',
      'import/order': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    name: 'gnome-ui/storybook',
    files: ['**/*.stories.{ts,tsx}'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
];
