import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GoHome, Search, Star, Settings, Share, Folder, Document, Applications } from "@gnome-ui/icons";
import { HeaderBar, Avatar } from "@gnome-ui/react";
import { AdaptiveLayout } from "./AdaptiveLayout";
import { UserCard } from "../UserCard";
import type { AdaptiveNavItem, GnomeColor, GnomeColorShade } from "./AdaptiveLayout";

const meta: Meta<typeof AdaptiveLayout> = {
  title: "Adaptive/AdaptiveLayout",
  component: AdaptiveLayout,
  tags: ["autodocs"],
  argTypes: {
    bgColor: {
      control: "select",
      options: ["white", "blue", "green", "yellow", "orange", "red", "purple", "brown"],
      description: "Background color from the gnome palette",
    },
    bgShade: {
      control: { type: "range", min: 1, max: 5, step: 1 },
      description: "Shade of the background color (1 = lightest, 5 = darkest)",
    },
    bgOpacity: {
      control: { type: "range", min: 0, max: 1, step: 0.05 },
      description: "Opacity of the background color (0–1)",
    },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Full-page adaptive shell that switches navigation automatically based on viewport width.
Use the **viewport toolbar** to preview each breakpoint:

- **Mobile** (< 480 px): \`ViewSwitcherBar\` pinned at the bottom.
- **Tablet** (480–1023 px): \`ViewSwitcherSidebar\` collapsed to icon-only.
- **Desktop** (≥ 1024 px): \`ViewSwitcherSidebar\` expanded with labels.

Pass \`sidebarHeader\` for the user card (expanded) and \`sidebarHeaderCollapsed\`
for the avatar-only version (collapsed). Grouped items (\`group\` field) become
sidebar sections on tablet/desktop and a single slot + \`BottomSheet\` on mobile.
When mobile bar slots exceed 4, the first 3 are shown and a **More** button handles
the rest.

Use \`bgColor\`, \`bgShade\` (1–5), and \`bgOpacity\` (0–1) to tint the shell background.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AdaptiveLayout>;

// ─── Shared data ──────────────────────────────────────────────────────────────

const items: AdaptiveNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: GoHome                                   },
  { id: "following", label: "Following",  icon: Star,         badge: 5                  },
  { id: "my-apps",   label: "My Apps",    icon: Applications, badge: 3, group: "Develop" },
  { id: "api-docs",  label: "API Docs",   icon: Document,               group: "Develop" },
  { id: "settings",  label: "Settings",   icon: Settings                                },
];

const overflowItems: AdaptiveNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: GoHome,    badge: 2  },
  { id: "following", label: "Following",  icon: Star,      badge: 5  },
  { id: "starred",   label: "Starred",    icon: Search               },
  { id: "files",     label: "Files",      icon: Folder               },
  { id: "share",     label: "Share",      icon: Share                },
  { id: "settings",  label: "Settings",   icon: Settings             },
];

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    const [active, setActive] = useState("dashboard");
    const activeItem = items.find((i) => i.id === active);

    return (
      <AdaptiveLayout
        items={items}
        value={active}
        onValueChange={setActive}
        topBar={<HeaderBar title="Developer Portal" />}
        sidebarHeader={
          <UserCard
            name="El Jijuna"
            email="Developer"
            orientation="horizontal"
            avatarColor="red"
            avatarSize="md"
          />
        }
        sidebarHeaderCollapsed={
          <div style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}>
            <Avatar name="El Jijuna" color="red" size="md" />
          </div>
        }
      >
        <div style={{ padding: 24 }}>
          <p style={{ fontFamily: "var(--gnome-font-family)", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px" }}>
            {activeItem?.label}
          </p>
          <p style={{ fontFamily: "var(--gnome-font-family)", opacity: 0.6, margin: 0 }}>
            Resize the viewport using the toolbar to see Mobile, Tablet, and Desktop layouts.
          </p>
        </div>
      </AdaptiveLayout>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Grouped items (Develop section), badges, and a user card in the sidebar header. Resize via the viewport toolbar to switch between Mobile / Tablet / Desktop.",
      },
    },
  },
};

export const MobileOverflow: Story = {
  render: function OverflowStory() {
    const [active, setActive] = useState("dashboard");
    const activeItem = overflowItems.find((i) => i.id === active);

    return (
      <AdaptiveLayout
        items={overflowItems}
        value={active}
        onValueChange={setActive}
        topBar={<HeaderBar title="My App" />}
      >
        <div style={{ padding: 24 }}>
          <p style={{ fontFamily: "var(--gnome-font-family)", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px" }}>
            {activeItem?.label}
          </p>
          <p style={{ fontFamily: "var(--gnome-font-family)", opacity: 0.6, margin: 0 }}>
            6 items on mobile: first 3 visible, rest accessible via the <strong>More</strong> button.
          </p>
        </div>
      </AdaptiveLayout>
    );
  },
  parameters: {
    controls: { disable: true },
    viewport: { defaultViewport: "iphonexr" },
    docs: {
      description: {
        story: "6 ungrouped items on mobile: the first 3 appear in the bar, the rest open via a **More** BottomSheet. If the active item is in the overflow group, More renders in its active state.",
      },
    },
  },
};

export const WithBackground: Story = {
  render: function BackgroundStory(args) {
    const [active, setActive] = useState("dashboard");
    const activeItem = items.find((i) => i.id === active);

    return (
      <AdaptiveLayout
        {...args}
        items={items}
        value={active}
        onValueChange={setActive}
        topBar={<HeaderBar title="Developer Portal" />}
        sidebarHeader={
          <UserCard
            name="El Jijuna"
            email="Developer"
            orientation="horizontal"
            avatarColor="red"
            avatarSize="md"
          />
        }
        sidebarHeaderCollapsed={
          <div style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}>
            <Avatar name="El Jijuna" color="red" size="md" />
          </div>
        }
      >
        <div style={{ padding: 24 }}>
          <p style={{ fontFamily: "var(--gnome-font-family)", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px" }}>
            {activeItem?.label}
          </p>
          <p style={{ fontFamily: "var(--gnome-font-family)", opacity: 0.6, margin: 0 }}>
            Use the <strong>Controls</strong> panel to change <code>bgColor</code>, <code>bgShade</code>, and <code>bgOpacity</code>.
          </p>
        </div>
      </AdaptiveLayout>
    );
  },
  args: {
    bgColor: "white" as GnomeColor,
    bgShade: 3 as GnomeColorShade,
    bgOpacity: 1,
  },
  parameters: {
    docs: {
      description: {
        story: "Use the **Controls** panel to experiment with `bgColor`, `bgShade` (1–5), and `bgOpacity` (0–1) on any breakpoint.",
      },
    },
  },
};
