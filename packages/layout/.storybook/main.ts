import { resolve } from "path";
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
    // Resolve workspace deps from source for proper HMR in the monorepo.
    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string>),
      "@gnome-ui/react": resolve(import.meta.dirname, "../../react/src/index.ts"),
      "@gnome-ui/icons": resolve(import.meta.dirname, "../../icons/src/index.ts"),
    };
    return config;
  },
};

export default config;
