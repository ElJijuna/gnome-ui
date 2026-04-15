import type { Meta, StoryObj } from "@storybook/react";
import { Blockquote } from "./Blockquote";

const meta: Meta<typeof Blockquote> = {
  title: "Components/Blockquote",
  component: Blockquote,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Styled pull-quote with semantic \`<blockquote>\` markup.

Use it to highlight quoted text, callouts, or editorial notes inline within
content. Five visual variants map to the same severity scale used by
\`Banner\` and \`Badge\`.

### Guidelines
- Keep the quoted text short — one to three sentences.
- Provide a \`cite\` whenever the source is known.
- Use \`variant="default"\` for neutral quotations; reserve coloured variants
  for callouts that match a clear intent (tip, caution, error, confirmation).
- Supply an \`icon\` only when it meaningfully reinforces the variant intent.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "info", "warning", "error", "success"],
    },
    cite: { control: "text" },
    children: { control: "text" },
  },
  args: {
    variant: "default",
    children:
      "The best way to predict the future is to invent it.",
    cite: "Alan Kay",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Blockquote>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── All variants ─────────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 560 }}>
      <Blockquote variant="default" cite="Alan Kay">
        The best way to predict the future is to invent it.
      </Blockquote>
      <Blockquote variant="info" cite="GNOME HIG">
        Prefer progressive disclosure: show only what the user needs right now.
      </Blockquote>
      <Blockquote variant="warning">
        This behaviour changes in the next major release. Update your code before upgrading.
      </Blockquote>
      <Blockquote variant="error">
        This API is deprecated and will be removed in v3. Use the new endpoint instead.
      </Blockquote>
      <Blockquote variant="success" cite="Release notes">
        Migration complete. All data has been verified and is ready to use.
      </Blockquote>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── With icon ────────────────────────────────────────────────────────────────

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 560 }}>
      <Blockquote
        variant="info"
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm1 8H7V7h2v5Z" />
          </svg>
        }
        cite="GNOME HIG"
      >
        Use icons only when they meaningfully reinforce the message, not for decoration.
      </Blockquote>
      <Blockquote
        variant="warning"
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.888 0 1.438-.99.98-1.767L8.982 1.566ZM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5Zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
          </svg>
        }
      >
        Saving while offline will queue changes locally. Sync when reconnected.
      </Blockquote>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── No cite ──────────────────────────────────────────────────────────────────

export const NoCite: Story = {
  args: {
    cite: undefined,
    children: "Simplicity is the ultimate sophistication.",
  },
  parameters: {
    docs: {
      description: {
        story: "Omit `cite` when the source is unknown or attribution is not needed.",
      },
    },
  },
};

// ─── Long quote ───────────────────────────────────────────────────────────────

export const LongQuote: Story = {
  args: {
    variant: "info",
    cite: "Donald Knuth, The Art of Computer Programming",
    children:
      "Programs are meant to be read by humans and only incidentally for computers to execute. " +
      "We should write programs that read well, with meaningful names and clean structure, " +
      "as if they were prose addressed to another programmer.",
  },
  parameters: {
    docs: {
      description: {
        story: "The component wraps naturally; no fixed height or truncation is applied.",
      },
    },
  },
};

// ─── ReactNode cite ───────────────────────────────────────────────────────────

export const RichCite: Story = {
  render: () => (
    <Blockquote
      variant="default"
      cite={
        <span>
          Ada Lovelace,{" "}
          <em>Notes on the Analytical Engine</em>, 1842
        </span>
      }
    >
      The Analytical Engine has no pretensions whatever to originate anything.
      It can only do what we know how to order it to perform.
    </Blockquote>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "`cite` accepts any `ReactNode`, so you can include inline formatting like `<em>`.",
      },
    },
  },
};
