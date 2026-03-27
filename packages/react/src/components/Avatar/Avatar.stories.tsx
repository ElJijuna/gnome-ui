import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./Avatar";
import { Text } from "../Text";

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Circular avatar following the Adwaita \`AdwAvatar\` pattern.

### Guidelines
- Provide a \`name\` whenever possible — it generates the initials fallback and a deterministic background color.
- Use \`src\` for a real photo; the initials layer is hidden automatically.
- Always ensure the \`name\` or \`alt\` prop conveys who the avatar represents for screen readers.
- Prefer \`"md"\` (32 px) in lists and \`"lg"\`/\`"xl"\` in profile headers.
        `,
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
    color: {
      control: "select",
      options: ["blue", "green", "yellow", "orange", "red", "purple", "brown", "teal", "slate"],
    },
    name: { control: "text" },
    src: { control: "text" },
  },
  args: {
    name: "Jane Doe",
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

// ─── Default (initials) ────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── Sizes ─────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {(["sm", "md", "lg", "xl"] as const).map((s) => (
        <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Avatar name="Jane Doe" size={s} />
          <Text variant="caption" color="dim">{s}</Text>
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Color palette ─────────────────────────────────────────────────────────────

export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {(["blue", "green", "yellow", "orange", "red", "purple", "brown", "teal", "slate"] as const).map(
        (c) => (
          <div key={c} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Avatar name="AB" color={c} size="lg" />
            <Text variant="caption" color="dim">{c}</Text>
          </div>
        )
      )}
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "All nine named colors available for the initials fallback.",
      },
    },
  },
};

// ─── Deterministic color from name ────────────────────────────────────────────

export const AutoColor: Story = {
  render: () => {
    const names = ["Alice Martin", "Bob Smith", "Carol White", "David Brown", "Eva Green"];
    return (
      <div style={{ display: "flex", gap: 12 }}>
        {names.map((n) => (
          <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Avatar name={n} size="lg" />
            <Text variant="caption" color="dim">{n.split(" ")[0]}</Text>
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "When `color` is omitted, a stable background color is derived from the `name` string — the same name always produces the same color.",
      },
    },
  },
};

// ─── With image ────────────────────────────────────────────────────────────────

export const WithImage: Story = {
  args: {
    name: "Jane Doe",
    src: "https://i.pravatar.cc/128?img=47",
    size: "lg",
  },
  parameters: {
    docs: {
      description: {
        story: "When `src` is provided the initials layer is replaced by the image.",
      },
    },
  },
};

// ─── In a list ─────────────────────────────────────────────────────────────────

export const InList: Story = {
  render: () => {
    const contacts = [
      { name: "Alice Martin",  msg: "See you tomorrow!" },
      { name: "Bob Smith",     msg: "The build is ready." },
      { name: "Carol White",   msg: "Thanks for the review." },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 320 }}>
        {contacts.map(({ name, msg }) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={name} size="md" />
            <div>
              <Text variant="heading">{name}</Text>
              <Text variant="caption" color="dim" style={{ marginTop: 2 }}>{msg}</Text>
            </div>
          </div>
        ))}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
