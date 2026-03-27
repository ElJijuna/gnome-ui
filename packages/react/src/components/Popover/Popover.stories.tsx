import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Popover } from "./Popover";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { Separator } from "../Separator";
import { Switch } from "../Switch";
import { Slider } from "../Slider";
import { ViewMore, Settings, Share, Copy, Edit, Delete } from "@gnome-ui/icons";

const meta: Meta<typeof Popover> = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Floating panel anchored to a trigger element, following the Adwaita \`GtkPopover\` pattern.

Unlike **Tooltip**, a Popover can contain rich interactive content — menus, forms, sliders, toggles.

### Guidelines
- Use for secondary controls that are not important enough for permanent screen space.
- Keep content focused — one task or group of related settings.
- Prefer **Dialog** for actions that require confirmation or have significant consequences.
- Provide a clear way to close: Escape key, outside click, and a close/done button for longer panels.
- Supports both **uncontrolled** (toggle on trigger click) and **controlled** (\`open\` + \`onClose\`) modes.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Popover>;

// ─── Context menu ─────────────────────────────────────────────────────────────

const menuItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  padding: "8px 10px",
  border: "none",
  background: "transparent",
  borderRadius: 6,
  cursor: "pointer",
  textAlign: "left" as const,
  fontSize: "1rem",
  fontFamily: "inherit",
  color: "inherit",
};

export const ContextMenu: Story = {
  render: () => (
    <Popover
      placement="bottom"
      content={
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 180 }}>
          {[
            { icon: Edit,   label: "Edit" },
            { icon: Copy,   label: "Copy link" },
            { icon: Share,  label: "Share…" },
          ].map(({ icon, label }) => (
            <button key={label} style={menuItemStyle}>
              <Icon icon={icon} size="md" aria-hidden />
              <Text variant="body">{label}</Text>
            </button>
          ))}
          <Separator style={{ margin: "4px 0" }} />
          <button style={{ ...menuItemStyle, color: "var(--gnome-destructive-color, #e01b24)" }}>
            <Icon icon={Delete} size="md" aria-hidden />
            <Text variant="body">Delete</Text>
          </button>
        </div>
      }
    >
      <Button variant="flat" shape="circular" aria-label="More options">
        <Icon icon={ViewMore} size="md" aria-hidden />
      </Button>
    </Popover>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Context menu — the most common Popover use case. A ⋮ button reveals actions.",
      },
    },
  },
};

// ─── Settings panel ───────────────────────────────────────────────────────────

export const SettingsPanel: Story = {
  render: function SettingsStory() {
    const [wifi,       setWifi]       = useState(true);
    const [bluetooth,  setBluetooth]  = useState(false);
    const [brightness, setBrightness] = useState(70);

    return (
      <Popover
        placement="bottom"
        content={
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 240 }}>
            <Text variant="heading">Quick Settings</Text>
            <Separator />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text variant="body">Wi-Fi</Text>
              <Switch checked={wifi} onChange={(e) => setWifi(e.target.checked)} aria-label="Wi-Fi" />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text variant="body">Bluetooth</Text>
              <Switch checked={bluetooth} onChange={(e) => setBluetooth(e.target.checked)} aria-label="Bluetooth" />
            </div>
            <Separator />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text variant="body">Brightness</Text>
                <Text variant="body" color="dim">{brightness}%</Text>
              </div>
              <Slider aria-label="Brightness" value={brightness} onChange={setBrightness} min={0} max={100} step={5} />
            </div>
          </div>
        }
      >
        <Button variant="flat" shape="circular" aria-label="Quick settings">
          <Icon icon={Settings} size="md" aria-hidden />
        </Button>
      </Popover>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Popover as a quick-settings panel — contains toggles, a slider, and a separator.",
      },
    },
  },
};

// ─── All placements ───────────────────────────────────────────────────────────

export const Placements: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, auto)", gap: 16, alignItems: "center", justifyContent: "center", padding: 48 }}>
      <span />
      <Popover placement="top" content={<Text variant="body">Placement: top</Text>}>
        <Button>Top</Button>
      </Popover>
      <span />

      <Popover placement="left" content={<Text variant="body">Placement: left</Text>}>
        <Button>Left</Button>
      </Popover>
      <span />
      <Popover placement="right" content={<Text variant="body">Placement: right</Text>}>
        <Button>Right</Button>
      </Popover>

      <span />
      <Popover placement="bottom" content={<Text variant="body">Placement: bottom</Text>}>
        <Button>Bottom</Button>
      </Popover>
      <span />
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "All four placements. The panel flips when it would exceed the viewport." },
    },
  },
};

// ─── Controlled ───────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: function ControlledStory() {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Button onClick={() => setOpen(true)}>Open externally</Button>
        <Text variant="caption" color="dim">{open ? "open" : "closed"}</Text>
        <Popover
          open={open}
          onClose={() => setOpen(false)}
          content={
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Text variant="body">Controlled popover</Text>
              <Button variant="suggested" onClick={() => setOpen(false)}>Close</Button>
            </div>
          }
        >
          <Button variant="flat" aria-label="Toggle">Toggle</Button>
        </Popover>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Controlled mode — pass `open` + `onClose`. The external button can also open the popover.",
      },
    },
  },
};

// ─── Share sheet ──────────────────────────────────────────────────────────────

export const ShareSheet: Story = {
  render: () => (
    <Popover
      placement="top"
      content={
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 200 }}>
          <Text variant="heading">Share</Text>
          <Separator />
          {["Copy link", "Send by email", "Post to Mastodon"].map((action) => (
            <button key={action} style={menuItemStyle}>
              <Text variant="body">{action}</Text>
            </button>
          ))}
        </div>
      }
    >
      <Button leadingIcon={<Icon icon={Share} size="md" aria-hidden />}>
        Share
      </Button>
    </Popover>
  ),
  parameters: {
    controls: { disable: true },
  },
};
