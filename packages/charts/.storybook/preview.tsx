import type { Preview } from "@storybook/react";
import { useEffect } from "react";
import { parameters as docsParameters } from "@storybook/addon-docs/preview";
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import "@gnome-ui/core/styles";
import { GnomeProvider } from "@gnome-ui/react";

const preview: Preview = {
  globalTypes: {
    locale: {
      description: "Locale for number and date formatting",
      toolbar: {
        title: "Locale",
        icon: "globe",
        items: [
          { value: "", title: "Browser default" },
          { value: "en-US", title: "English (US)" },
          { value: "es-ES", title: "Spanish (ES)" },
          { value: "de-DE", title: "German (DE)" },
          { value: "fr-FR", title: "French (FR)" },
          { value: "ar-SA", title: "Arabic (SA)" },
        ],
        dynamicTitle: true,
      },
    },
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
    locale: "",
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
    (Story, context) => (
      <GnomeProvider locale={context.globals.locale || undefined}>
        <Story />
      </GnomeProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "gnome-light",
      values: [
        { name: "gnome-light", value: "#fafafa" },
        { name: "gnome-dark", value: "#242424" },
      ],
    },
    viewport: {
      options: INITIAL_VIEWPORTS,
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
