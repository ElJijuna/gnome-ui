import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {},
  viteFinal: async (config) => {
    const root = new URL("../../../../node_modules", import.meta.url).pathname;

    config.resolve ??= {};
    config.resolve.dedupe = [
      ...(config.resolve.dedupe ?? []),
      "react",
      "react-dom",
      "react/jsx-runtime",
    ];
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string>),
      react: `${root}/react`,
      "react-dom": `${root}/react-dom`,
      "react/jsx-runtime": `${root}/react/jsx-runtime`,
    };
    return config;
  },
  refs: {
    react: {
      title: "@gnome-ui/react",
      url: "https://gnome-ui.org/react",
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
