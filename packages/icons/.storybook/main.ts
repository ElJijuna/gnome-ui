import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: ["../../../public"],
  managerHead: (head) => `${head}<link rel="icon" type="image/png" href="/assets/gnome-ui.png" />`,
  docs: {},
  refs: {
    react: {
      title: "@gnome-ui/react",
      url: "https://gnome-ui.org/react",
      expanded: false,
    },
    layout: {
      title: "@gnome-ui/layout",
      url: "https://gnome-ui.org/layout",
      expanded: false,
    },
    charts: {
      title: "@gnome-ui/charts",
      url: "https://gnome-ui.org/charts",
      expanded: false,
    },
  },
};

export default config;
