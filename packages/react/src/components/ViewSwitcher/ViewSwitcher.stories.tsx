import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GoHome, Search, Star, MediaPlay } from "@gnome-ui/icons";
import { ViewSwitcher } from "./ViewSwitcher";
import { ViewSwitcherItem } from "./ViewSwitcherItem";
import { HeaderBar } from "../HeaderBar";
import { Button } from "../Button";
import { Text } from "../Text";

const meta: Meta<typeof ViewSwitcher> = {
  title: "Components/ViewSwitcher",
  component: ViewSwitcher,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Segmented control for switching between major views, mirroring the Adwaita \`AdwViewSwitcher\`.

Two components:
- **\`ViewSwitcher\`** — the pill-shaped container with \`role="radiogroup"\` and roving-tabindex keyboard navigation.
- **\`ViewSwitcherItem\`** — individual option with \`role="radio"\` and optional icon.

### Guidelines
- Use for 2–4 top-level views that are parallel (not sequential).
- Prefer placing it as the \`title\` of a \`HeaderBar\` — the canonical GNOME pattern.
- For more than 4 options, use **Tabs** or a **Sidebar** instead.
- Do not use for settings that have side-effects; use **Switch** for that.
- Keyboard: ← / → (or ↑ / ↓) cycle through items and activate them immediately.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ViewSwitcher>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    const [view, setView] = useState("list");
    return (
      <ViewSwitcher aria-label="View mode">
        {["List", "Grid", "Board"].map((v) => (
          <ViewSwitcherItem
            key={v}
            label={v}
            active={view === v.toLowerCase()}
            onClick={() => setView(v.toLowerCase())}
          />
        ))}
      </ViewSwitcher>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── With icons ────────────────────────────────────────────────────────────────

export const WithIcons: Story = {
  render: function WithIconsStory() {
    const views = [
      { id: "home",   label: "Home",   icon: GoHome },
      { id: "music",  label: "Music",  icon: MediaPlay },
      { id: "search", label: "Search", icon: Search },
    ];
    const [active, setActive] = useState("home");
    return (
      <ViewSwitcher aria-label="Section">
        {views.map(({ id, label, icon }) => (
          <ViewSwitcherItem
            key={id}
            label={label}
            icon={icon}
            active={active === id}
            onClick={() => setActive(id)}
          />
        ))}
      </ViewSwitcher>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Two options ───────────────────────────────────────────────────────────────

export const TwoOptions: Story = {
  render: function TwoStory() {
    const [view, setView] = useState("day");
    return (
      <ViewSwitcher aria-label="Calendar view">
        <ViewSwitcherItem label="Day"  active={view === "day"}  onClick={() => setView("day")} />
        <ViewSwitcherItem label="Week" active={view === "week"} onClick={() => setView("week")} />
      </ViewSwitcher>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── In a HeaderBar (canonical pattern) ────────────────────────────────────────

export const InHeaderBar: Story = {
  render: function InHeaderBarStory() {
    const views = [
      { id: "inbox",  label: "Inbox",   icon: GoHome },
      { id: "sent",   label: "Sent",    icon: Star },
      { id: "search", label: "Search",  icon: Search },
    ];
    const [active, setActive] = useState("inbox");

    return (
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 12,
          overflow: "hidden",
          maxWidth: 560,
        }}
      >
        <HeaderBar
          title={
            <ViewSwitcher aria-label="Mailbox section">
              {views.map(({ id, label, icon }) => (
                <ViewSwitcherItem
                  key={id}
                  label={label}
                  icon={icon}
                  active={active === id}
                  onClick={() => setActive(id)}
                />
              ))}
            </ViewSwitcher>
          }
          end={<Button variant="flat" aria-label="Settings"><span style={{ fontSize: 16 }}>⚙</span></Button>}
        />
        <div style={{ padding: 24 }}>
          <Text variant="title-4">{views.find(v => v.id === active)?.label}</Text>
          <Text variant="body" color="dim" style={{ marginTop: 8 }}>
            Content for the {active} view.
          </Text>
        </div>
      </div>
    );
  },
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The canonical GNOME pattern: pass `ViewSwitcher` as the `title` of `HeaderBar`. It is centered automatically by the 3-column grid layout.",
      },
    },
  },
};

// ─── With disabled item ────────────────────────────────────────────────────────

export const WithDisabledItem: Story = {
  render: function DisabledStory() {
    const [view, setView] = useState("overview");
    return (
      <ViewSwitcher aria-label="Dashboard">
        <ViewSwitcherItem label="Overview"  active={view === "overview"}  onClick={() => setView("overview")} />
        <ViewSwitcherItem label="Analytics" active={view === "analytics"} onClick={() => setView("analytics")} />
        <ViewSwitcherItem label="Reports"   disabled />
      </ViewSwitcher>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Disabled items are skipped by keyboard navigation." },
    },
  },
};
