import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from "./TextField";

const meta: Meta<typeof TextField> = {
  title: "Components/TextField",
  component: TextField,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Single-line text input with label, helper text, and error state.

Follows the Adwaita \`GtkEntry\` / \`.entry\` style class.

### Guidelines
- Always provide a \`label\` — it is the primary accessible name for the input.
- Use \`helperText\` for formatting hints or constraints (e.g. "Must be at least 8 characters").
- Replace \`helperText\` with \`error\` to communicate validation failure — never show both.
- Show errors only after the user has interacted (on blur or on submit), not while typing.
- Keep labels short and in sentence case ("Full name", not "Full Name").
        `,
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    helperText: { control: "text" },
    error: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Full name",
    placeholder: "e.g. Jane Doe",
    disabled: false,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TextField>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── With helper text ──────────────────────────────────────────────────────────

export const WithHelperText: Story = {
  args: {
    label: "Username",
    placeholder: "e.g. jdoe",
    helperText: "Only letters, numbers, and underscores.",
  },
};

// ─── Error state ───────────────────────────────────────────────────────────────

export const Error: Story = {
  args: {
    label: "Email",
    defaultValue: "not-an-email",
    error: "Enter a valid email address.",
  },
  parameters: {
    docs: {
      description: {
        story: "Set `error` to apply the error border and show the message. It replaces `helperText` automatically.",
      },
    },
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: {
    label: "Username",
    defaultValue: "jdoe",
    helperText: "Contact your admin to change your username.",
    disabled: true,
  },
};

// ─── No label ─────────────────────────────────────────────────────────────────

export const NoLabel: Story = {
  args: {
    label: undefined,
    placeholder: "Search…",
    "aria-label": "Search",
  },
  parameters: {
    docs: {
      description: {
        story: "When no visible label is needed (e.g. inside a search bar), omit `label` and supply `aria-label` for accessibility.",
      },
    },
  },
};

// ─── Form example ─────────────────────────────────────────────────────────────

export const FormExample: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <TextField label="Full name" placeholder="e.g. Jane Doe" />
      <TextField label="Email" placeholder="jane@example.com" type="email" />
      <TextField
        label="Password"
        type="password"
        helperText="Must be at least 8 characters."
      />
      <TextField
        label="Confirm password"
        type="password"
        error="Passwords do not match."
      />
    </div>
  ),
  parameters: { controls: { disable: true } },
};
