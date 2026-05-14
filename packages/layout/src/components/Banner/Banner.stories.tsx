import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Banner } from "./Banner";
import type { BannerType } from "./Banner";

const meta: Meta<typeof Banner> = {
  title: "Layout/Banner",
  component: Banner,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Persistent in-app message strip shown at the top of a view, following GNOME HIG banner guidelines.

Use banners to communicate **ongoing states** — offline mode, read-only access, pending updates.
They do not auto-dismiss. For individual events and short-lived messages, use \`Toast\` instead.

\`\`\`tsx
import { Banner } from "@gnome-ui/layout";

<Banner type="warning" action={{ label: "Reconnect", onClick: retry }}>
  Working offline — changes will sync when you reconnect
</Banner>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Banner>;

export const Default: Story = {
  args: { children: "Your session will expire in 10 minutes." },
};

export const Types: Story = {
  render: () => {
    const items: { type: BannerType; message: string }[] = [
      { type: "default", message: "A new version is ready to install." },
      { type: "info",    message: "Metered network — automatic updates paused." },
      { type: "success", message: "All files backed up successfully." },
      { type: "warning", message: "Disk space is running low." },
      { type: "error",   message: "Could not connect to the server." },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {items.map(({ type, message }) => (
          <Banner key={type} type={type}>{message}</Banner>
        ))}
      </div>
    );
  },
  parameters: {
    docs: { description: { story: "All five visual variants." } },
  },
};

export const WithAction: Story = {
  args: {
    type: "warning",
    children: "Working offline — changes will sync when you reconnect.",
    action: { label: "Reconnect", onClick: () => {} },
  },
  parameters: {
    docs: {
      description: {
        story: "Include at most one action button, directly relevant to the state being communicated.",
      },
    },
  },
};

export const Dismissible: Story = {
  render: () => {
    function Demo() {
      const [visible, setVisible] = useState(true);
      if (!visible) {
        return (
          <button
            style={{ fontSize: 13, padding: "6px 12px" }}
            onClick={() => setVisible(true)}
          >
            Show banner
          </button>
        );
      }
      return (
        <Banner
          type="info"
          action={{ label: "Learn more", onClick: () => {} }}
          onDismiss={() => setVisible(false)}
        >
          A new version of this app is available.
        </Banner>
      );
    }

    return <Demo />;
  },
  parameters: {
    docs: {
      description: {
        story: "Pass `onDismiss` to render a close button. The parent controls visibility.",
      },
    },
  },
};

export const InLayout: Story = {
  render: () => (
    <div
      style={{
        border: "1px solid var(--gnome-border-color, rgba(0,0,0,0.12))",
        borderRadius: 12,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <Banner type="error" action={{ label: "Retry", onClick: () => {} }}>
        Could not load data. Check your connection and try again.
      </Banner>
      <div style={{ padding: 24, color: "var(--gnome-dim-label-color, #77767b)", fontSize: 14 }}>
        Page content goes here…
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Banners sit at the top of a view, directly above the page content.",
      },
    },
  },
};
