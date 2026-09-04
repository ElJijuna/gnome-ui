import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    {
      name: '@pilmee/storybook-addon-vitest',
      options: {
        reportPath: './vitest-report.json',
      },
    },
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../../../public', { from: '../storybook-reports', to: '/' }],
  managerHead: (head) => `${head}<link rel="icon" type="image/png" href="/assets/gnome-ui.png" />`,
  docs: {},
  viteFinal: async (config) => {
    const root = new URL('../../../../node_modules', import.meta.url).pathname;

    config.resolve ??= {};
    config.resolve.dedupe = [
      ...(config.resolve.dedupe ?? []),
      'react',
      'react-dom',
      'react/jsx-runtime',
    ];
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string>),
      react: `${root}/react`,
      'react-dom': `${root}/react-dom`,
      'react/jsx-runtime': `${root}/react/jsx-runtime`,
    };

    return config;
  },
  // `refs` composition (linking to the react/charts/icons sub-Storybooks on
  // gnome-ui.org) is disabled: the manager crashes with "Cannot read
  // properties of undefined (reading 'id')" whenever a composed ref doesn't
  // serve a metadata.json — which none of our `storybook build` outputs do,
  // since it isn't a standard build artifact in modern Storybook. Reproduced
  // against the live gnome-ui.org deployment; not fixed by upgrading to
  // Storybook 10.5.5. Separately, the `react` ref URL was also wrong — CI
  // deploys @gnome-ui/react's Storybook to the site root, not `/react`.
};

export default config;
