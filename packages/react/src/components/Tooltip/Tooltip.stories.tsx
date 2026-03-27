import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./Tooltip";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Text } from "../Text";
import {
  Save, Delete, Edit, Copy, Settings, Search, Information,
} from "@gnome-ui/icons";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Informational floating label following the GNOME HIG tooltip pattern.

Wraps a single trigger element and shows a label on hover or keyboard focus.

### Guidelines
- Use to clarify icon-only controls that have no visible label.
- Keep the text short — a noun phrase or brief description (< 10 words).
- Do not repeat information already visible on screen.
- Never put interactive content (links, buttons) inside a tooltip.
- Tooltips are not shown on touch — do not rely on them for critical information.
- The default delay is 500 ms to avoid flickering during normal mouse movement.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
      <Tooltip label="Save file (Ctrl+S)">
        <Button variant="flat" shape="circular" aria-label="Save">
          <Icon icon={Save} size="md" aria-hidden />
        </Button>
      </Tooltip>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── All placements ───────────────────────────────────────────────────────────

export const Placements: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, auto)",
        gridTemplateRows: "repeat(3, auto)",
        gap: 12,
        justifyContent: "center",
        alignItems: "center",
        padding: 48,
      }}
    >
      {/* top-left empty */}
      <span />
      <Tooltip label="Placement: top" placement="top" delay={0}>
        <Button>Top</Button>
      </Tooltip>
      <span />

      <Tooltip label="Placement: left" placement="left" delay={0}>
        <Button>Left</Button>
      </Tooltip>
      <span />
      <Tooltip label="Placement: right" placement="right" delay={0}>
        <Button>Right</Button>
      </Tooltip>

      <span />
      <Tooltip label="Placement: bottom" placement="bottom" delay={0}>
        <Button>Bottom</Button>
      </Tooltip>
      <span />
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "All four placements. The tooltip flips automatically if there is not enough viewport space.",
      },
    },
  },
};

// ─── Icon toolbar ─────────────────────────────────────────────────────────────

export const IconToolbar: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 4, padding: 24 }}>
      {[
        { icon: Edit,     label: "Edit"   },
        { icon: Copy,     label: "Copy"   },
        { icon: Delete,   label: "Delete" },
        { icon: Settings, label: "Settings" },
      ].map(({ icon, label }) => (
        <Tooltip key={label} label={label}>
          <Button variant="flat" shape="circular" aria-label={label}>
            <Icon icon={icon} size="md" aria-hidden />
          </Button>
        </Tooltip>
      ))}
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "The canonical use case: icon-only toolbar buttons where the tooltip provides the missing label.",
      },
    },
  },
};

// ─── On any element ───────────────────────────────────────────────────────────

export const OnText: Story = {
  render: () => (
    <div style={{ padding: 32 }}>
      <Tooltip label="This is truncated — the full value is 'document-important-final-v3-FINAL.pdf'" placement="bottom">
        <Text
          variant="body"
          style={{
            maxWidth: 180,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            cursor: "default",
            display: "block",
          }}
        >
          document-important-final-v3-FINAL.pdf
        </Text>
      </Tooltip>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Tooltip can wrap any focusable or hoverable element, not just buttons.",
      },
    },
  },
};

// ─── No delay ─────────────────────────────────────────────────────────────────

export const NoDelay: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, padding: 32 }}>
      <Tooltip label="Appears instantly" delay={0}>
        <Button>Hover me (delay=0)</Button>
      </Tooltip>
      <Tooltip label="Standard 500 ms delay">
        <Button>Hover me (default)</Button>
      </Tooltip>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "`delay={0}` makes the tooltip appear immediately. The default 500 ms delay avoids distracting flicker during normal mouse movement.",
      },
    },
  },
};

// ─── With keyboard focus ──────────────────────────────────────────────────────

export const KeyboardFocus: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, padding: 32, flexDirection: "column" }}>
      <Text variant="caption" color="dim">Tab into the buttons to see tooltips via keyboard</Text>
      <div style={{ display: "flex", gap: 8 }}>
        <Tooltip label="Search the library" delay={0}>
          <Button variant="flat" shape="circular" aria-label="Search">
            <Icon icon={Search} size="md" aria-hidden />
          </Button>
        </Tooltip>
        <Tooltip label="More information" delay={0}>
          <Button variant="flat" shape="circular" aria-label="Info">
            <Icon icon={Information} size="md" aria-hidden />
          </Button>
        </Tooltip>
      </div>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Tooltips appear on keyboard focus too, making them accessible without a mouse.",
      },
    },
  },
};
