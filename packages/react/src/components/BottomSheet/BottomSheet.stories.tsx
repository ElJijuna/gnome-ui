import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BottomSheet } from "./BottomSheet";
import { Button } from "../Button";
import { BoxedList } from "../BoxedList";
import { ActionRow } from "../ActionRow";
import { Text } from "../Text";

const meta: Meta<typeof BottomSheet> = {
  title: "Components/BottomSheet",
  component: BottomSheet,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Slide-up panel that overlays content from the bottom edge.

Mirrors \`AdwBottomSheet\` (libadwaita 1.6+). Renders into a portal on
\`document.body\`. Traps focus, closes on Escape or backdrop click (configurable).

### Guidelines
- Use for actions or supplementary content on mobile/narrow viewports.
- Keep content concise — the sheet should not exceed ~90 % of the viewport height.
- Provide an \`onClose\` handler to close the sheet on Escape and backdrop tap.
        `,
      },
    },
  },
  argTypes: {
    open: { control: "boolean" },
    title: { control: "text" },
    closeOnBackdrop: { control: "boolean" },
  },
  args: {
    open: false,
    title: "Actions",
    closeOnBackdrop: true,
  },
};

export default meta;
type Story = StoryObj<typeof BottomSheet>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Bottom Sheet</Button>
        <BottomSheet {...args} open={open} onClose={() => setOpen(false)}>
          <Text variant="body" color="dim">Bottom sheet content goes here.</Text>
        </BottomSheet>
      </>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── With actions ─────────────────────────────────────────────────────────────

export const WithActions: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Share…</Button>
        <BottomSheet open={open} title="Share via" onClose={() => setOpen(false)}>
          <BoxedList>
            <ActionRow title="Copy link"      subtitle="Copy to clipboard"  onClick={() => setOpen(false)} />
            <ActionRow title="Send by email"  subtitle="Open mail composer" onClick={() => setOpen(false)} />
            <ActionRow title="Bluetooth"      subtitle="Send to nearby device" onClick={() => setOpen(false)} />
          </BoxedList>
        </BottomSheet>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "A share sheet using `BoxedList` + `ActionRow` inside a `BottomSheet`." },
    },
  },
};

// ─── No backdrop close ────────────────────────────────────────────────────────

export const NoBackdropClose: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <BottomSheet
          open={open}
          title="Persistent sheet"
          onClose={() => setOpen(false)}
          closeOnBackdrop={false}
        >
          <Text variant="body" color="dim">This sheet can only be closed with the Escape key.</Text>
          <div style={{ marginTop: 16 }}>
            <Button variant="suggested" onClick={() => setOpen(false)}>Done</Button>
          </div>
        </BottomSheet>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Set `closeOnBackdrop={false}` to prevent dismissal by tapping outside." },
    },
  },
};
