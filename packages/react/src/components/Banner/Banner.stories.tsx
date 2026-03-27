import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Banner } from "./Banner";

const meta: Meta<typeof Banner> = {
  title: "Components/Banner",
  component: Banner,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Persistent message strip displayed at the top of a view.

Mirrors the Adwaita \`AdwBanner\` pattern.

### Guidelines
- Place at the very top of the content area, below the header bar.
- Keep the message short — one sentence. Use a **Dialog** for longer explanations.
- Provide an \`actionLabel\` only when there is a clear, single action the user can take.
- Use \`dismissible\` when the message is informational and non-critical.
- Choose the \`variant\` that matches the severity: \`info\` → \`warning\` → \`error\`.
- Don't stack multiple banners — show only the most important one at a time.
        `,
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["info", "warning", "error", "success"] },
    actionLabel: { control: "text" },
    dismissible: { control: "boolean" },
    children: { control: "text" },
  },
  args: {
    variant: "info",
    children: "A new software update is available.",
    dismissible: false,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Banner>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── All variants ─────────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Banner variant="info">A new software update is available.</Banner>
      <Banner variant="warning">Your session will expire in 5 minutes.</Banner>
      <Banner variant="error">Failed to sync. Check your connection.</Banner>
      <Banner variant="success">Your changes have been saved.</Banner>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── With action ──────────────────────────────────────────────────────────────

export const WithAction: Story = {
  args: {
    variant: "info",
    children: "A new software update is available.",
    actionLabel: "Update Now",
    onAction: () => alert("Update started"),
  },
  parameters: {
    docs: {
      description: {
        story: "Supply `actionLabel` + `onAction` to add a trailing button for the primary action.",
      },
    },
  },
};

// ─── Dismissible ──────────────────────────────────────────────────────────────

export const Dismissible: Story = {
  render: function DismissibleStory() {
    const [visible, setVisible] = useState(true);
    return visible ? (
      <Banner
        variant="warning"
        dismissible
        onDismiss={() => setVisible(false)}
      >
        Your session will expire in 5 minutes.
      </Banner>
    ) : (
      <p style={{ fontFamily: "sans-serif", opacity: 0.5 }}>Banner dismissed.</p>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Set `dismissible` and handle `onDismiss` to remove the banner when the user closes it.",
      },
    },
  },
};

// ─── With action and dismissible ──────────────────────────────────────────────

export const WithActionAndDismiss: Story = {
  render: function FullBannerStory() {
    const [visible, setVisible] = useState(true);
    return visible ? (
      <Banner
        variant="error"
        actionLabel="Retry"
        onAction={() => alert("Retrying…")}
        dismissible
        onDismiss={() => setVisible(false)}
      >
        Failed to back up your files. Check your storage connection.
      </Banner>
    ) : (
      <p style={{ fontFamily: "sans-serif", opacity: 0.5 }}>Banner dismissed.</p>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── In context ───────────────────────────────────────────────────────────────

export const InContext: Story = {
  render: function InContextStory() {
    const [visible, setVisible] = useState(true);
    return (
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 12,
          overflow: "hidden",
          maxWidth: 600,
        }}
      >
        {visible && (
          <Banner
            variant="warning"
            actionLabel="Free Up Space"
            onAction={() => alert("Opening storage settings")}
            dismissible
            onDismiss={() => setVisible(false)}
          >
            Storage is almost full — 18.3 GB of 20 GB used.
          </Banner>
        )}
        <div style={{ padding: 24, fontFamily: "sans-serif", opacity: 0.5 }}>
          View content area
        </div>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "The banner sits directly below the header bar, spanning the full width of the content area.",
      },
    },
  },
};
