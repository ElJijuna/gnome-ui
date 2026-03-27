import { useState, useCallback } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Toast } from "./Toast";
import { Toaster } from "./Toaster";
import { Button } from "../Button";
import { Text } from "../Text";

const meta: Meta<typeof Toast> = {
  title: "Components/Toast",
  component: Toast,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Non-blocking temporary notification following the Adwaita \`AdwToast\` pattern.

Two components:
- **\`Toast\`** — the notification card. Manages its own auto-dismiss timer.
- **\`Toaster\`** — fixed-position portal container at bottom (or top) center that stacks toasts.

### Guidelines
- Keep messages short — one sentence.
- Use an action button for the single most relevant response (e.g. "Undo").
- Auto-dismiss after 3 s by default; set \`duration={0}\` for persistent toasts.
- The timer pauses while the user hovers or focuses the toast.
- Do not use for errors that require user action — use **Dialog** or **Banner** instead.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    const [show, setShow] = useState(false);
    return (
      <>
        <Button variant="suggested" onClick={() => setShow(true)}>
          Show toast
        </Button>
        <Toaster>
          {show && (
            <Toast
              title="File saved successfully"
              onDismiss={() => setShow(false)}
            />
          )}
        </Toaster>
      </>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── With action ──────────────────────────────────────────────────────────────

export const WithAction: Story = {
  render: function WithActionStory() {
    const [show, setShow] = useState(false);
    const [undone, setUndone] = useState(false);

    const trigger = () => { setShow(true); setUndone(false); };

    return (
      <>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Button variant="destructive" onClick={trigger}>
            Delete item
          </Button>
          {undone && (
            <Text variant="caption" color="dim">Deletion undone</Text>
          )}
        </div>
        <Toaster>
          {show && (
            <Toast
              title="Item deleted"
              actionLabel="Undo"
              onAction={() => { setUndone(true); }}
              onDismiss={() => setShow(false)}
            />
          )}
        </Toaster>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Action button dismisses the toast and calls `onAction`. Clicking Undo here marks the deletion as reversed.",
      },
    },
  },
};

// ─── Dismissible (no auto-dismiss) ───────────────────────────────────────────

export const Persistent: Story = {
  render: function PersistentStory() {
    const [show, setShow] = useState(false);
    return (
      <>
        <Button onClick={() => setShow(true)}>Show persistent toast</Button>
        <Toaster>
          {show && (
            <Toast
              title="Background sync in progress…"
              duration={0}
              dismissible
              onDismiss={() => setShow(false)}
            />
          )}
        </Toaster>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "`duration={0}` disables auto-dismiss. The dismiss (×) button is the only way to close it.",
      },
    },
  },
};

// ─── Stacked queue ────────────────────────────────────────────────────────────

let nextId = 0;

export const Queue: Story = {
  render: function QueueStory() {
    const [toasts, setToasts] = useState<{ id: number; title: string }[]>([]);

    const add = useCallback(() => {
      const id = ++nextId;
      setToasts((prev) => [
        ...prev,
        { id, title: `Notification #${id}` },
      ]);
    }, []);

    const remove = useCallback((id: number) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
      <>
        <Button onClick={add}>Add notification</Button>
        <Toaster>
          {toasts.map((t) => (
            <Toast
              key={t.id}
              title={t.title}
              dismissible
              onDismiss={() => remove(t.id)}
            />
          ))}
        </Toaster>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Multiple toasts stack vertically inside `<Toaster>`. Each auto-dismisses independently.",
      },
    },
  },
};

// ─── Top position ─────────────────────────────────────────────────────────────

export const TopPosition: Story = {
  render: function TopStory() {
    const [show, setShow] = useState(false);
    return (
      <>
        <Button onClick={() => setShow(true)}>Show top toast</Button>
        <Toaster position="top">
          {show && (
            <Toast
              title="Upload complete"
              actionLabel="View"
              onAction={() => {}}
              onDismiss={() => setShow(false)}
            />
          )}
        </Toaster>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "`<Toaster position=\"top\">` places the stack at the top-center of the viewport.",
      },
    },
  },
};
