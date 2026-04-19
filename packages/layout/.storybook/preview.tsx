import type { Preview } from "@storybook/react";
import { useEffect } from "react";
import { parameters as docsParameters } from "@storybook/addon-docs/preview";
import "@gnome-ui/react/styles";
import "@gnome-ui/core/styles"; // source import: ensures live [data-theme] tokens override the dist bundle

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "", title: "System (OS preference)" },
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
          { value: "high-contrast", title: "High Contrast" },
          { value: "high-contrast-dark", title: "High Contrast Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "",
  },
  decorators: [
    (Story, context) => {
      const { theme } = context.globals;
      useEffect(() => {
        if (theme) {
          document.documentElement.setAttribute("data-theme", theme);
        } else {
          document.documentElement.removeAttribute("data-theme");
        }
      }, [theme]);
      return <Story />;
    },
  ],
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "gnome-light",
      values: [
        { name: "gnome-light", value: "#fafafa" },
        { name: "gnome-dark",  value: "#242424" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date:  /Date$/i,
      },
    },
    docs: {
      ...docsParameters.docs,
      toc: true,
    },
  },
};

export default preview;
