import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { InlineViewSwitcher } from "./InlineViewSwitcher";
import { InlineViewSwitcherItem } from "./InlineViewSwitcherItem";
import { Card } from "../Card";
import { HeaderBar } from "../HeaderBar";

const meta: Meta<typeof InlineViewSwitcher> = {
  title: "Components/InlineViewSwitcher",
  component: InlineViewSwitcher,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Compact inline view switcher for placing inside content areas, cards, or toolbars.

Use when \`ViewSwitcher\` (header-bar sized) is too heavy — \`InlineViewSwitcher\` sits
comfortably inline with other content. Mirrors \`AdwInlineViewSwitcher\`
(libadwaita 1.7 / GNOME 48).

Compose with \`InlineViewSwitcherItem\`. Keyboard: **← →** cycle, **Home / End** jump.

### Variants
| Variant | When to use |
|---------|-------------|
| \`default\` | Standalone control with clear elevation — inside cards or content areas |
| \`flat\` | Inside a toolbar or header bar background — blends with the surface |
| \`round\` | Prominent pill shape for primary view selection in open space |

### Guidelines
- Prefer \`ViewSwitcher\` in a \`HeaderBar\` for top-level navigation.
- Use \`InlineViewSwitcher\` for secondary, in-context view switching (e.g. chart type, layout mode).
- Always provide an \`aria-label\` on the container and \`aria-label\` on icon-only items.
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24, alignItems: "flex-start" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "flat", "round"],
    },
    value: { control: "text" },
  },
  args: {
    variant: "default",
    value: "list",
  },
};

export default meta;
type Story = StoryObj<typeof InlineViewSwitcher>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => {
    const [view, setView] = useState(args.value ?? "list");
    return (
      <InlineViewSwitcher
        {...args}
        value={view}
        onValueChange={setView}
        aria-label="Layout"
      >
        <InlineViewSwitcherItem name="list" label="List" />
        <InlineViewSwitcherItem name="grid" label="Grid" />
        <InlineViewSwitcherItem name="columns" label="Columns" />
      </InlineViewSwitcher>
    );
  },
};

// ─── All variants ──────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  render: () => {
    const [v1, setV1] = useState("list");
    const [v2, setV2] = useState("list");
    const [v3, setV3] = useState("list");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
        <div>
          <p style={{ margin: "0 0 8px", fontSize: "0.75rem", opacity: 0.6, color: "var(--gnome-window-fg-color)" }}>
            default
          </p>
          <InlineViewSwitcher value={v1} onValueChange={setV1} aria-label="Layout default">
            <InlineViewSwitcherItem name="list" label="List" />
            <InlineViewSwitcherItem name="grid" label="Grid" />
            <InlineViewSwitcherItem name="columns" label="Columns" />
          </InlineViewSwitcher>
        </div>

        <div>
          <p style={{ margin: "0 0 8px", fontSize: "0.75rem", opacity: 0.6, color: "var(--gnome-window-fg-color)" }}>
            flat
          </p>
          <div style={{ background: "var(--gnome-headerbar-bg-color, #ebebeb)", borderRadius: 8, padding: "4px 8px", display: "inline-flex" }}>
            <InlineViewSwitcher variant="flat" value={v2} onValueChange={setV2} aria-label="Layout flat">
              <InlineViewSwitcherItem name="list" label="List" />
              <InlineViewSwitcherItem name="grid" label="Grid" />
              <InlineViewSwitcherItem name="columns" label="Columns" />
            </InlineViewSwitcher>
          </div>
        </div>

        <div>
          <p style={{ margin: "0 0 8px", fontSize: "0.75rem", opacity: 0.6, color: "var(--gnome-window-fg-color)" }}>
            round
          </p>
          <InlineViewSwitcher variant="round" value={v3} onValueChange={setV3} aria-label="Layout round">
            <InlineViewSwitcherItem name="list" label="List" />
            <InlineViewSwitcherItem name="grid" label="Grid" />
            <InlineViewSwitcherItem name="columns" label="Columns" />
          </InlineViewSwitcher>
        </div>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "All three variants side by side in their natural contexts." },
    },
  },
};

// ─── Inside a Card ─────────────────────────────────────────────────────────────

export const InsideCard: Story = {
  render: () => {
    const [view, setView] = useState("week");
    const labels: Record<string, string> = {
      day: "Mon 27",
      week: "Mar 24 – 30",
      month: "March 2026",
    };
    return (
      <Card style={{ width: 360, padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontWeight: 600, color: "var(--gnome-window-fg-color)" }}>
            {labels[view]}
          </span>
          <InlineViewSwitcher value={view} onValueChange={setView} aria-label="Calendar view">
            <InlineViewSwitcherItem name="day" label="Day" />
            <InlineViewSwitcherItem name="week" label="Week" />
            <InlineViewSwitcherItem name="month" label="Month" />
          </InlineViewSwitcher>
        </div>
        <div style={{ height: 80, background: "var(--gnome-window-bg-color, #fafafa)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gnome-window-fg-color)", opacity: 0.4, fontSize: "0.875rem" }}>
          Calendar grid — {view} view
        </div>
      </Card>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "`default` variant inside a `Card` header — controls the view without leaving the surface.",
      },
    },
  },
};

// ─── Flat inside HeaderBar ─────────────────────────────────────────────────────

export const FlatInHeaderBar: Story = {
  render: () => {
    const [view, setView] = useState("list");
    return (
      <div style={{ width: 480 }}>
        <HeaderBar
          title={
            <InlineViewSwitcher
              variant="flat"
              value={view}
              onValueChange={setView}
              aria-label="View"
            >
              <InlineViewSwitcherItem name="list" label="List" />
              <InlineViewSwitcherItem name="grid" label="Grid" />
            </InlineViewSwitcher>
          }
        />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "`flat` variant used as the `HeaderBar` title — blends naturally with the header bar background. Prefer `ViewSwitcher` for top-level navigation; use this for secondary in-context switching.",
      },
    },
  },
};

// ─── Round ─────────────────────────────────────────────────────────────────────

export const Round: Story = {
  render: () => {
    const [mode, setMode] = useState("light");
    return (
      <InlineViewSwitcher variant="round" value={mode} onValueChange={setMode} aria-label="Color scheme">
        <InlineViewSwitcherItem name="light" label="Light" />
        <InlineViewSwitcherItem name="dark" label="Dark" />
        <InlineViewSwitcherItem name="auto" label="Auto" />
      </InlineViewSwitcher>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "`round` variant — pill-shaped container with a solid accent active indicator. Good for prominent in-content choices.",
      },
    },
  },
};

// ─── Disabled items ────────────────────────────────────────────────────────────

export const DisabledItems: Story = {
  render: () => {
    const [view, setView] = useState("list");
    return (
      <InlineViewSwitcher value={view} onValueChange={setView} aria-label="Layout">
        <InlineViewSwitcherItem name="list" label="List" />
        <InlineViewSwitcherItem name="grid" label="Grid" disabled />
        <InlineViewSwitcherItem name="columns" label="Columns" disabled />
      </InlineViewSwitcher>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Individual items can be disabled while leaving others active." },
    },
  },
};
