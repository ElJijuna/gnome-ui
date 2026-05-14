import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ToastProvider, useToast } from "./Toast";
import type { ToastOptions, ToastType } from "./Toast";

const meta: Meta = {
  title: "Layout/Toast",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
In-app notifications following the GNOME Human Interface Guidelines.

Toasts are **transient** messages shown at the bottom-center of the window.
They auto-dismiss after a configurable delay and support a single action button.
Use them for individual events, not for persistent or ongoing states — for those, use \`Banner\`.

## Setup

Wrap your app (or the relevant subtree) with \`ToastProvider\` once, then call
\`useToast().show()\` from any descendant:

\`\`\`tsx
// main.tsx
import { ToastProvider } from "@gnome-ui/layout";

<ToastProvider>
  <App />
</ToastProvider>

// Anywhere inside the tree
import { useToast } from "@gnome-ui/layout";

const { show, dismiss } = useToast();
show({ title: "File saved", action: { label: "Undo", onClick: undo } });
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ─── Interactive demo ────────────────────────────────────────────────────────
function Demo({ options }: { options: ToastOptions }) {
  const { show } = useToast();
  return (
    <button
      style={{
        padding: "8px 16px",
        borderRadius: 8,
        border: "1px solid var(--gnome-border-color, rgba(0,0,0,0.15))",
        background: "var(--gnome-card-bg, #f6f5f4)",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
      }}
      onClick={() => show(options)}
    >
      Show toast
    </button>
  );
}

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <Demo options={{ title: "File saved" }} />
    </ToastProvider>
  ),
};

export const WithAction: Story = {
  render: () => (
    <ToastProvider>
      <Demo
        options={{
          title: "Message deleted",
          action: { label: "Undo", onClick: () => {} },
        }}
      />
    </ToastProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: "Include at most one action button, directly relevant to the message.",
      },
    },
  },
};

export const Types: Story = {
  render: () => {
    const types: { type: ToastType; title: string }[] = [
      { type: "default", title: "Settings updated" },
      { type: "success", title: "Upload complete" },
      { type: "info",    title: "New version available" },
      { type: "warning", title: "Disk space is low" },
      { type: "error",   title: "Connection failed" },
    ];

    function TypeButtons() {
      const { show } = useToast();
      return (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {types.map(({ type, title }) => (
            <button
              key={type}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid var(--gnome-border-color, rgba(0,0,0,0.15))",
                background: "var(--gnome-card-bg, #f6f5f4)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
              }}
              onClick={() => show({ title, type })}
            >
              {type}
            </button>
          ))}
        </div>
      );
    }

    return (
      <ToastProvider>
        <TypeButtons />
      </ToastProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Each type adds a colored dot indicator. Use types sparingly — the message copy should convey the meaning.",
      },
    },
  },
};

export const Persistent: Story = {
  render: () => (
    <ToastProvider>
      <Demo
        options={{
          title: "You are now offline",
          type: "warning",
          timeout: 0,
          action: { label: "Dismiss", onClick: () => {} },
        }}
      />
    </ToastProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: "`timeout: 0` disables auto-dismiss. The user must manually close it. Prefer `Banner` for truly persistent states.",
      },
    },
  },
};

export const Queue: Story = {
  render: () => {
    function QueueDemo() {
      const { show, dismissAll } = useToast();
      const [count, setCount] = useState(0);

      const enqueue = () => {
        const next = count + 1;
        setCount(next);
        show({ title: `Notification ${next}`, timeout: 2500 });
      };

      return (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid var(--gnome-border-color, rgba(0,0,0,0.15))",
              background: "var(--gnome-card-bg, #f6f5f4)",
              cursor: "pointer",
              fontSize: 14,
            }}
            onClick={enqueue}
          >
            Add to queue
          </button>
          <button
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid rgba(224,27,36,0.4)",
              background: "rgba(224,27,36,0.06)",
              cursor: "pointer",
              fontSize: 14,
              color: "#e01b24",
            }}
            onClick={dismissAll}
          >
            Dismiss all
          </button>
        </div>
      );
    }

    return (
      <ToastProvider>
        <QueueDemo />
      </ToastProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Toasts are queued and shown one at a time. `dismissAll()` clears the entire queue immediately.",
      },
    },
  },
};
