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
      react:              `${root}/react`,
      "react-dom":        `${root}/react-dom`,
      "react/jsx-runtime":`${root}/react/jsx-runtime`,
    };
    return config;
  },
};

export default config;
