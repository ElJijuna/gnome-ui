import type { Preview } from "@storybook/react";
import type { ReactNode } from "react";
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
  decorators: [
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
