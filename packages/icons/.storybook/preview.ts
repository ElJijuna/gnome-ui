import type { Preview } from "@storybook/react";
import { parameters as docsParameters } from "@storybook/addon-docs/preview";

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
      if (theme) {
        document.documentElement.setAttribute("data-theme", theme);
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
      return Story();
    },
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
      options: {
        mobilePortrait:  { name: "Mobile Portrait",  styles: { width: "390px",  height: "844px"  }, type: "mobile"  },
        mobileLandscape: { name: "Mobile Landscape",  styles: { width: "844px",  height: "390px"  }, type: "mobile"  },
        tabletPortrait:  { name: "Tablet Portrait",  styles: { width: "768px",  height: "1024px" }, type: "tablet"  },
        tabletLandscape: { name: "Tablet Landscape",  styles: { width: "1024px", height: "768px"  }, type: "tablet"  },
        desktop:         { name: "Desktop",          styles: { width: "1280px", height: "800px"  }, type: "desktop" },
        largeDesktop:    { name: "Large Desktop",    styles: { width: "1920px", height: "1080px" }, type: "desktop" },
      },
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
