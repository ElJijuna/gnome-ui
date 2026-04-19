import type { Preview } from "@storybook/react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { parameters as docsParameters } from "@storybook/addon-docs/preview";
import "@gnome-ui/core/styles";

function CenteredDecorator({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        minHeight: "6rem",
      }}
    >
      {/*
       * This inner wrapper gives children a definite width so that
       * width:100% inside story decorators (e.g. maxWidth:400) resolves
       * correctly. Without it, flex items have no definite inline size and
       * width:100% components (ProgressBar, Banner, Separator…) render at 0px.
       */}
      <div style={{ flex: "1 1 0%", minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}

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
    (Story) => (
      <CenteredDecorator>
        <Story />
      </CenteredDecorator>
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
