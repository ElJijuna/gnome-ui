import type { Meta, StoryObj } from "@storybook/react";
import { Frame } from "./Frame";
import { BoxedList } from "../BoxedList";
import { ActionRow } from "../ActionRow";
import { Switch } from "../Switch";

const meta: Meta<typeof Frame> = {
  title: "Components/Frame",
  component: Frame,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Simple bordered surface with \`border-radius\` but no background fill.

Use to visually delimit a region without adding the elevated appearance of a \`Card\`.
Mirrors \`GtkFrame\` default styling and the libadwaita \`.frame\` style class.

### Guidelines
- Use \`Frame\` when you need a visible boundary without a background (e.g. wrapping a media preview, a canvas area, or a list).
- Use \`Card\` when you need an elevated surface with its own background.
- \`Frame\` clips its children via \`overflow: hidden\`, so inner content respects the border radius.
      `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Frame>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Frame>
      <div style={{ padding: "24px", color: "var(--gnome-window-fg-color)" }}>
        Content inside a Frame
      </div>
    </Frame>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Wrapping a BoxedList ──────────────────────────────────────────────────────

export const WrappingBoxedList: Story = {
  render: () => (
    <Frame>
      <BoxedList>
        <ActionRow title="Wi-Fi" trailing={<Switch defaultChecked aria-label="Wi-Fi" />} />
        <ActionRow title="Bluetooth" trailing={<Switch aria-label="Bluetooth" />} />
        <ActionRow title="Airplane Mode" trailing={<Switch aria-label="Airplane Mode" />} />
      </BoxedList>
    </Frame>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "A `Frame` around a `BoxedList` adds a visible border without changing the list's own background.",
      },
    },
  },
};

// ─── Media preview ─────────────────────────────────────────────────────────────

export const MediaPreview: Story = {
  render: () => (
    <Frame style={{ aspectRatio: "16 / 9" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          minHeight: 160,
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.6)",
          fontSize: "0.875rem",
        }}
      >
        Preview area
      </div>
    </Frame>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Wrap a media or canvas area in a `Frame` to clip content to the rounded corners.",
      },
    },
  },
};

// ─── Comparison: Frame vs Card ─────────────────────────────────────────────────

export const FrameVsCard: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, flexDirection: "column" }}>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: "0.75rem", opacity: 0.6, color: "var(--gnome-window-fg-color)" }}>
          Frame — border only, no background
        </p>
        <Frame>
          <div style={{ padding: 16, color: "var(--gnome-window-fg-color)" }}>Content</div>
        </Frame>
      </div>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: "0.75rem", opacity: 0.6, color: "var(--gnome-window-fg-color)" }}>
          Card — elevated surface with background
        </p>
        <div
          style={{
            padding: 16,
            borderRadius: "var(--gnome-radius-md)",
            background: "var(--gnome-card-bg-color, #fff)",
            boxShadow: "var(--gnome-shadow-sm)",
            color: "var(--gnome-window-fg-color)",
          }}
        >
          Content
        </div>
      </div>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The key difference: `Frame` is transparent with only a border; `Card` has its own elevated background.",
      },
    },
  },
};
