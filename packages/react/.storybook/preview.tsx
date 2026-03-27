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
      {children}
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
