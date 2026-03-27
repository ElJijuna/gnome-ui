import type { Meta, StoryObj } from "@storybook/react";
import { Spacer } from "./Spacer";
import { Toolbar } from "./Toolbar";
import { Button } from "../Button";

const meta: Meta<typeof Spacer> = {
  title: "Components/Spacer",
  component: Spacer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Invisible \`flex: 1\` filler for \`Toolbar\` and \`HeaderBar\`.

Place between leading and trailing button groups to push trailing items to the
far end of the row. Multiple \`Spacer\` elements within the same flex container
share the available space equally, which can be used to center a middle group.

Mirrors \`GtkSeparator\` with the \`.spacer\` style class.

### Guidelines
- Has no visual appearance — it is purely a layout primitive.
- Use inside any \`display: flex\` row container (\`Toolbar\`, \`HeaderBar\` slots, custom bars).
- Avoid using outside a flex context; it has no effect.
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          maxWidth: 600,
          background: "var(--gnome-headerbar-bg-color, #ebebeb)",
          borderRadius: 8,
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Spacer>;

// ─── Push trailing items to end ────────────────────────────────────────────────

export const PushEnd: Story = {
  render: () => (
    <Toolbar>
      <Button variant="flat">Back</Button>
      <Spacer />
      <Button variant="flat">Done</Button>
    </Toolbar>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "A single `<Spacer />` pushes everything after it to the trailing edge.",
      },
    },
  },
};

// ─── Center a middle group ─────────────────────────────────────────────────────

export const CenterGroup: Story = {
  render: () => (
    <Toolbar>
      <Button variant="flat">←</Button>
      <Button variant="flat">→</Button>
      <Spacer />
      <Button variant="flat">Title</Button>
      <Spacer />
      <Button variant="flat">🔍</Button>
      <Button variant="flat">⋮</Button>
    </Toolbar>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Two `<Spacer />` elements flanking a center group split the remaining space equally, centering the group.",
      },
    },
  },
};

// ─── Without Spacer (for comparison) ──────────────────────────────────────────

export const WithoutSpacer: Story = {
  render: () => (
    <Toolbar>
      <Button variant="flat">Back</Button>
      <Button variant="flat">Done</Button>
    </Toolbar>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Without `<Spacer />` buttons stack at the leading edge with only the toolbar gap between them.",
      },
    },
  },
};
