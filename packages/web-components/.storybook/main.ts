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
  refs: {
    react: {
      title: '@gnome-ui/react',
      url: 'https://gnome-ui.org/react',
      expanded: false,
    },
    layout: {
      title: '@gnome-ui/layout',
      url: 'https://gnome-ui.org/layout',
      expanded: false,
    },
    charts: {
      title: '@gnome-ui/charts',
      url: 'https://gnome-ui.org/charts',
      expanded: false,
    },
    icons: {
      title: '@gnome-ui/icons',
      url: 'https://gnome-ui.org/icons',
      expanded: false,
    },
  },
};

export default config;
