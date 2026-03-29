import type { Meta, StoryObj } from "@storybook/react";
import { Bin } from "./Bin";
import { Text } from "../Text";
import { Button } from "../Button";

const meta: Meta<typeof Bin> = {
  title: "Components/Bin",
  component: Bin,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Single-child container with no visual styling.

A transparent wrapper that constrains its content to one child while
forwarding all HTML \`div\` attributes. Useful as a base for custom components
that need a neutral container without introducing visual chrome.

Mirrors \`AdwBin\`.

### Usage
- Use when you need to apply CSS classes, layout, or size constraints to a single child.
- Does not add any background, border, or padding.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Bin>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Bin style={{ padding: 16, border: "1px dashed var(--gnome-borders-color)" }}>
      <Text variant="body">Content inside a Bin</Text>
    </Bin>
  ),
  parameters: {
    docs: {
      description: {
        story: "A `Bin` with a dashed border added via `style` to make it visible. The border is not part of the component.",
      },
    },
  },
};

// ─── With size constraint ──────────────────────────────────────────────────────

export const WithSizeConstraint: Story = {
  render: () => (
    <Bin style={{ maxWidth: 200, overflow: "hidden" }}>
      <Button variant="suggested" style={{ width: "100%" }}>Constrained Button</Button>
    </Bin>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Use `Bin` to apply `maxWidth` or other layout constraints without wrapping in a styled div.",
      },
    },
  },
};
