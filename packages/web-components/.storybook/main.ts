import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/web-components-vite',
    options: {
      builder: {
        // Storybook must not inherit the package library build plugins.
        viteConfigPath: '.storybook/vite.config.ts',
      },
    },
  },
  staticDirs: ['../../../public'],
  managerHead: (head) => `${head}<link rel="icon" type="image/png" href="/assets/gnome-ui.png" />`,
  docs: {},
  // `refs` composition (linking to the react/layout/charts/icons
  // sub-Storybooks on gnome-ui.org) is disabled: the manager crashes with
  // "Cannot read properties of undefined (reading 'id')" whenever a composed
  // ref doesn't serve a metadata.json — which none of our `storybook build`
  // outputs do, since it isn't a standard build artifact in modern
  // Storybook. Reproduced against the live gnome-ui.org deployment; not
  // fixed by upgrading to Storybook 10.5.5. Separately, the `react` ref URL
  // was also wrong — CI deploys @gnome-ui/react's Storybook to the site
  // root, not `/react`.
};

export default config;
