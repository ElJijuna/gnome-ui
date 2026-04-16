import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {},
  refs: {
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
    icons: {
      title: "@gnome-ui/icons",
      url: "https://gnome-ui.org/icons",
      expanded: false,
    },
  },
};

export default config;
