import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "./StatusBadge";
import type { StatusBadgeVariant } from "./StatusBadge";

const meta: Meta<typeof StatusBadge> = {
  title: "Components/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Pill-shaped text label for entity status. Use for human-readable state labels
like \`published\`, \`beta\`, or \`new\` — not for numeric counts (use \`Badge\` for those).

\`\`\`tsx
import { StatusBadge } from "@gnome-ui/react";

<StatusBadge variant="success">published</StatusBadge>
<StatusBadge variant="warning">beta</StatusBadge>
<StatusBadge variant="new">new</StatusBadge>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

// ─── All variants ──────────────────────────────────────────────────────────────

const VARIANTS: { variant: StatusBadgeVariant; label: string }[] = [
  { variant: "success", label: "published" },
  { variant: "warning", label: "beta" },
  { variant: "error",   label: "failed" },
  { variant: "new",     label: "new" },
  { variant: "accent",  label: "featured" },
  { variant: "neutral", label: "draft" },
];

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {VARIANTS.map(({ variant, label }) => (
        <StatusBadge key={variant} variant={variant}>
          {label}
        </StatusBadge>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: { story: "All six variants with representative status labels." },
    },
  },
};

export const Success: Story = {
  args: { variant: "success", children: "published" },
};

export const Warning: Story = {
  args: { variant: "warning", children: "beta" },
};

export const Error: Story = {
  args: { variant: "error", children: "failed" },
};

export const New: Story = {
  args: { variant: "new", children: "new" },
};

export const Neutral: Story = {
  args: { variant: "neutral", children: "draft" },
};
