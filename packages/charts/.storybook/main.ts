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
  },
};

export default config;
