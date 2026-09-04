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
  // `refs` composition (linking to the layout/charts/icons/web-components
  // sub-Storybooks on gnome-ui.org) is disabled: as of Storybook 10.5.5 the
  // manager crashes with "Cannot read properties of undefined (reading 'id')"
  // whenever a composed ref doesn't serve a metadata.json — which none of our
  // `storybook build` outputs do, since it isn't a standard build artifact in
  // modern Storybook. Reproduced both locally and against the live
  // gnome-ui.org deployment; confirmed NOT fixed by the 10.5.5 upgrade.
};

export default config;
