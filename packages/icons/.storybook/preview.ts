import type { Preview } from "@storybook/react";
import { parameters as docsParameters } from "@storybook/addon-docs/preview";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "gnome-light",
      values: [
        { name: "gnome-light", value: "#fafafa" },
        { name: "gnome-dark", value: "#242424" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      ...docsParameters.docs,
      toc: true,
    },
  },
};

export default preview;
