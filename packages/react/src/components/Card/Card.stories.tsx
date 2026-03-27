import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";
import { Text } from "../Text";
import { Button } from "../Button";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Card component following the [GNOME HIG containers](https://developer.gnome.org/hig/patterns/containers.html) and the Adwaita \`.card\` style class.

### Guidelines
- Use cards to group related content on an elevated surface.
- Use \`interactive\` for clickable cards (grid items, settings shortcuts). They render as \`<button>\` for accessibility.
- Avoid nesting interactive elements (buttons, links) inside an \`interactive\` card — it creates nested interactive elements.
- Cards work at any width; let the layout dictate their size.
- Prefer \`padding="md"\` (24px) for most cases; \`"sm"\` for compact UIs.
        `,
      },
    },
  },
  argTypes: {
    interactive: { control: "boolean" },
    padding: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
  },
  args: {
    interactive: false,
    padding: "md",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Card>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <Text variant="heading">Card title</Text>
      <Text variant="body" color="dim" style={{ marginTop: 4 }}>
        This is a static card that groups related content on an elevated surface.
      </Text>
    </Card>
  ),
};

// ─── Interactive ───────────────────────────────────────────────────────────────

export const Interactive: Story = {
  args: { interactive: true },
  render: (args) => (
    <Card {...args} onClick={() => alert("Card clicked")}>
      <Text variant="heading">Clickable card</Text>
      <Text variant="body" color="dim" style={{ marginTop: 4 }}>
        Rendered as a <code>&lt;button&gt;</code>. Hover and click to see the
        activatable states.
      </Text>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Interactive cards render as `<button>` for correct keyboard navigation and screen reader support.",
      },
    },
  },
};

// ─── Padding sizes ─────────────────────────────────────────────────────────────

export const PaddingSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {(["none", "sm", "md", "lg"] as const).map((p) => (
        <Card key={p} padding={p}>
          <Text variant="caption-heading" color="dim">
            padding="{p}"
          </Text>
        </Card>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── With action ───────────────────────────────────────────────────────────────

export const WithAction: Story = {
  render: () => (
    <Card>
      <Text variant="heading">Storage almost full</Text>
      <Text variant="body" color="dim" style={{ marginTop: 4, marginBottom: 16 }}>
        You have used 18.3 GB of your 20 GB quota. Free up space to continue
        syncing files.
      </Text>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Button variant="flat">Later</Button>
        <Button variant="suggested">Manage Storage</Button>
      </div>
    </Card>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Grid of interactive cards ─────────────────────────────────────────────────

export const InteractiveGrid: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 12,
        maxWidth: 480,
      }}
    >
      {["Files", "Music", "Photos", "Videos"].map((label) => (
        <Card key={label} interactive padding="md" onClick={() => {}}>
          <Text variant="heading">{label}</Text>
          <Text variant="caption" color="dim" style={{ marginTop: 2 }}>
            Open app
          </Text>
        </Card>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};
