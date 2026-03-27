import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./Separator";
import { Text } from "../Text";

const meta: Meta<typeof Separator> = {
  title: "Components/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Thin dividing line that separates groups of content.

### Guidelines
- Use to visually group related items without adding heavy structure.
- Prefer \`horizontal\` (default) between stacked sections.
- Use \`vertical\` inside flex rows — e.g. between toolbar actions or header bar buttons.
- Don't overuse separators; whitespace and headings are often enough.
        `,
      },
    },
  },
  argTypes: {
    orientation: { control: "radio", options: ["horizontal", "vertical"] },
  },
  args: {
    orientation: "horizontal",
  },
};

export default meta;
type Story = StoryObj<typeof Separator>;

// ─── Horizontal ────────────────────────────────────────────────────────────────

export const Horizontal: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 320 }}>
      <Text variant="body">First section</Text>
      <Separator {...args} />
      <Text variant="body">Second section</Text>
    </div>
  ),
};

// ─── Vertical ─────────────────────────────────────────────────────────────────

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, height: 32 }}>
      <Text variant="body">Files</Text>
      <Separator {...args} />
      <Text variant="body">Music</Text>
      <Separator {...args} />
      <Text variant="body">Photos</Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Vertical separators work inside flex rows. The line stretches to match the row height via `align-self: stretch`.",
      },
    },
  },
};

// ─── In a list ─────────────────────────────────────────────────────────────────

export const InList: Story = {
  render: () => {
    const items = ["Inbox", "Drafts", "Sent", "Trash"];
    return (
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 240 }}>
        {items.map((item, i) => (
          <div key={item}>
            <div style={{ padding: "8px 12px" }}>
              <Text variant="body">{item}</Text>
            </div>
            {i < items.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
