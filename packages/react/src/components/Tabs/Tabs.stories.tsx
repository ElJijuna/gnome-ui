import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GoHome, Search, Star, Settings, MediaPlay } from "@gnome-ui/icons";
import { TabBar } from "./TabBar";
import { TabItem } from "./TabItem";
import { TabPanel } from "./TabPanel";
import { Text } from "../Text";

const meta: Meta<typeof TabBar> = {
  title: "Components/Tabs",
  component: TabBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Tab-based navigation following the Adwaita \`AdwTabBar\` pattern.

Three components work together:
- **\`TabBar\`** — the horizontal bar that holds \`TabItem\` elements; manages roving-tabindex keyboard navigation.
- **\`TabItem\`** — individual tab button with optional icon, close button, and ARIA wiring.
- **\`TabPanel\`** — content panel linked to its tab via \`id\` / \`panelId\`.

### Guidelines
- Use tabs for parallel views of the same data, not sequential steps (use a wizard for those).
- Keep labels short — one or two words.
- The active tab has an accent underline and higher contrast.
- Keyboard: ← / → cycle through tabs, Home / End jump to first / last.
- When tabs are closeable, always keep at least one tab open.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TabBar>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    const tabs = ["Files", "Music", "Photos"];
    const [active, setActive] = useState("Files");
    return (
      <div>
        <TabBar>
          {tabs.map((t) => (
            <TabItem
              key={t}
              label={t}
              active={active === t}
              panelId={`panel-${t}`}
              onClick={() => setActive(t)}
            />
          ))}
        </TabBar>
        {tabs.map((t) => (
          <TabPanel key={t} id={`panel-${t}`} active={active === t} style={{ padding: 24 }}>
            <Text variant="body" color="dim">Content for {t}</Text>
          </TabPanel>
        ))}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── With icons ────────────────────────────────────────────────────────────────

export const WithIcons: Story = {
  render: function WithIconsStory() {
    const tabs = [
      { id: "home",    label: "Home",    icon: GoHome },
      { id: "search",  label: "Search",  icon: Search },
      { id: "starred", label: "Starred", icon: Star },
    ];
    const [active, setActive] = useState("home");
    return (
      <div>
        <TabBar>
          {tabs.map(({ id, label, icon }) => (
            <TabItem
              key={id}
              label={label}
              icon={icon}
              active={active === id}
              panelId={`wi-panel-${id}`}
              onClick={() => setActive(id)}
            />
          ))}
        </TabBar>
        {tabs.map(({ id, label }) => (
          <TabPanel key={id} id={`wi-panel-${id}`} active={active === id} style={{ padding: 24 }}>
            <Text variant="body" color="dim">{label} panel</Text>
          </TabPanel>
        ))}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Closeable tabs ────────────────────────────────────────────────────────────

export const Closeable: Story = {
  render: function CloseableStory() {
    const [tabs, setTabs] = useState([
      { id: "files",  label: "Files" },
      { id: "music",  label: "Music" },
      { id: "photos", label: "Photos" },
      { id: "videos", label: "Videos" },
    ]);
    const [active, setActive] = useState("files");

    function close(id: string) {
      const next = tabs.filter((t) => t.id !== id);
      setTabs(next);
      if (active === id && next.length > 0) setActive(next[0].id);
    }

    return (
      <div>
        <TabBar>
          {tabs.map(({ id, label }) => (
            <TabItem
              key={id}
              label={label}
              active={active === id}
              panelId={`cl-panel-${id}`}
              onClick={() => setActive(id)}
              onClose={tabs.length > 1 ? () => close(id) : undefined}
            />
          ))}
        </TabBar>
        {tabs.map(({ id, label }) => (
          <TabPanel key={id} id={`cl-panel-${id}`} active={active === id} style={{ padding: 24 }}>
            <Text variant="body" color="dim">{label} panel</Text>
          </TabPanel>
        ))}
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Pass `onClose` to show the × button. The last tab never shows a close button here to prevent leaving an empty bar.",
      },
    },
  },
};

// ─── Many tabs (scrollable) ────────────────────────────────────────────────────

export const Scrollable: Story = {
  render: function ScrollableStory() {
    const tabs = [
      { id: "home", label: "Home", icon: GoHome },
      { id: "music", label: "Music", icon: MediaPlay },
      { id: "search", label: "Search", icon: Search },
      { id: "starred", label: "Starred", icon: Star },
      { id: "settings", label: "Settings", icon: Settings },
      { id: "extra1", label: "Downloads" },
      { id: "extra2", label: "Documents" },
      { id: "extra3", label: "Pictures" },
    ];
    const [active, setActive] = useState("home");
    return (
      <div style={{ maxWidth: 480 }}>
        <TabBar>
          {tabs.map(({ id, label, icon }) => (
            <TabItem
              key={id}
              label={label}
              icon={icon}
              active={active === id}
              panelId={`sc-panel-${id}`}
              onClick={() => setActive(id)}
            />
          ))}
        </TabBar>
        {tabs.map(({ id, label }) => (
          <TabPanel key={id} id={`sc-panel-${id}`} active={active === id} style={{ padding: 24 }}>
            <Text variant="body" color="dim">{label} panel</Text>
          </TabPanel>
        ))}
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "When tabs overflow the bar scrolls horizontally (scrollbar hidden via CSS).",
      },
    },
  },
};

// ─── In a full layout ─────────────────────────────────────────────────────────

export const InLayout: Story = {
  render: function LayoutStory() {
    const tabs = [
      { id: "overview", label: "Overview" },
      { id: "commits",  label: "Commits" },
      { id: "files",    label: "Files" },
    ];
    const [active, setActive] = useState("overview");
    return (
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 12,
          overflow: "hidden",
          maxWidth: 560,
        }}
      >
        <TabBar aria-label="Repository sections">
          {tabs.map(({ id, label }) => (
            <TabItem
              key={id}
              label={label}
              active={active === id}
              panelId={`il-panel-${id}`}
              onClick={() => setActive(id)}
            />
          ))}
        </TabBar>
        {tabs.map(({ id, label }) => (
          <TabPanel key={id} id={`il-panel-${id}`} active={active === id} style={{ padding: 24 }}>
            <Text variant="title-4">{label}</Text>
            <Text variant="body" color="dim" style={{ marginTop: 8 }}>
              Content for the {label.toLowerCase()} tab.
            </Text>
          </TabPanel>
        ))}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Inline ───────────────────────────────────────────────────────────────────

export const Inline: Story = {
  render: () => {
    const [active, setActive] = useState("overview");
    const tabs = [
      { id: "overview", label: "Overview" },
      { id: "files", label: "Files" },
      { id: "history", label: "History" },
    ];
    return (
      <div
        style={{
          border: "1px solid var(--gnome-light-3, rgba(0,0,0,0.1))",
          borderRadius: 12,
          overflow: "hidden",
          maxWidth: 560,
          background: "var(--gnome-card-bg-color, #fff)",
        }}
      >
        <TabBar inline aria-label="Document sections">
          {tabs.map(({ id, label }) => (
            <TabItem
              key={id}
              label={label}
              active={active === id}
              panelId={`inline-panel-${id}`}
              onClick={() => setActive(id)}
            />
          ))}
        </TabBar>
        {tabs.map(({ id, label }) => (
          <TabPanel key={id} id={`inline-panel-${id}`} active={active === id} style={{ padding: 24 }}>
            <Text variant="title-4">{label}</Text>
            <Text variant="body" color="dim" style={{ marginTop: 8 }}>
              Content for the {label.toLowerCase()} tab.
            </Text>
          </TabPanel>
        ))}
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Use `inline` to remove the header-bar background so the tab bar blends into any surface — cards, content areas, or custom containers.",
      },
    },
  },
};
