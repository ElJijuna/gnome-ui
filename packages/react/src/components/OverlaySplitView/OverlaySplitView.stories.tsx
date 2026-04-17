import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OverlaySplitView } from "./OverlaySplitView";
import { Sidebar } from "../Sidebar";
import { SidebarItem } from "../Sidebar/SidebarItem";
import { HeaderBar } from "../HeaderBar";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { GoHome, Star, Search, Settings, ViewSidebar } from "@gnome-ui/icons";

const meta: Meta<typeof OverlaySplitView> = {
  title: "Adaptive/OverlaySplitView",
  component: OverlaySplitView,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Sidebar + content layout where the sidebar becomes a slide-over **overlay** on narrow screens (≤ 400 px), mirroring \`AdwOverlaySplitView\`.

- **Wide (> 400 px):** sidebar and content are side-by-side. \`showSidebar\` is ignored.
- **Narrow (≤ 400 px):** content fills full width; sidebar slides in as an overlay when \`showSidebar\` is true.

### Guidelines
- Use when the sidebar is contextual and not always needed (e.g. document outline, filters).
- A hamburger / menu button in the HeaderBar typically toggles it on narrow screens.
- Backdrop click and Escape close the overlay. Provide an \`onClose\` handler.
- Prefer \`NavigationSplitView\` for primary list → detail navigation.
      `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof OverlaySplitView>;

const items = [
  { id: "home",     label: "Home",     icon: GoHome },
  { id: "starred",  label: "Starred",  icon: Star },
  { id: "search",   label: "Search",   icon: Search },
  { id: "settings", label: "Settings", icon: Settings },
];

export const NarrowViewport: Story = {
  render: function NarrowStory() {
    const [active, setActive]    = useState("home");
    const [showSidebar, setShow] = useState(false);
    const { isNarrow }           = useBreakpoint();

    return (
      <div style={{ height: 480, display: "flex", flexDirection: "column", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden" }}>
        <HeaderBar
          title={items.find(i => i.id === active)?.label}
          start={isNarrow
            ? (
              <Button variant="flat" shape="circular" aria-label="Toggle sidebar" onClick={() => setShow(s => !s)}>
                <Icon icon={ViewSidebar} size="md" aria-hidden />
              </Button>
            )
            : undefined}
        />
        <OverlaySplitView
          style={{ flex: 1 }}
          showSidebar={showSidebar}
          onClose={() => setShow(false)}
          sidebar={
            <Sidebar style={{ height: "100%" }}>
              {items.map(({ id, label, icon }) => (
                <SidebarItem
                  key={id}
                  icon={icon}
                  label={label}
                  active={active === id}
                  onClick={() => { setActive(id); setShow(false); }}
                />
              ))}
            </Sidebar>
          }
          content={
            <div style={{ padding: 24 }}>
              <Text variant="title-3">{items.find(i => i.id === active)?.label}</Text>
              <Text variant="body" color="dim" style={{ marginTop: 8 }}>
                Tap the sidebar icon to open the overlay. Tap the backdrop,
                press Escape, or swipe the sidebar toward the edge to close it.
              </Text>
            </div>
          }
        />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "Narrow viewport (≤ 400 px): content fills full width, sidebar slides in as an overlay. " +
          "Close via backdrop tap, Escape, or swipe toward the leading edge.",
      },
    },
  },
};

export const Default: Story = {
  render: function DefaultStory() {
    const [active, setActive]         = useState("home");
    const [showSidebar, setShow]      = useState(false);
    const { isNarrow }                = useBreakpoint();

    return (
      <div style={{ height: 480, display: "flex", flexDirection: "column", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden" }}>
        <HeaderBar
          title={items.find(i => i.id === active)?.label}
          start={isNarrow
            ? (
              <Button variant="flat" shape="circular" aria-label="Toggle sidebar" onClick={() => setShow(s => !s)}>
                <Icon icon={ViewSidebar} size="md" aria-hidden />
              </Button>
            )
            : undefined}
        />
        <OverlaySplitView
          style={{ flex: 1 }}
          showSidebar={showSidebar}
          onClose={() => setShow(false)}
          sidebar={
            <Sidebar style={{ height: "100%" }}>
              {items.map(({ id, label, icon }) => (
                <SidebarItem
                  key={id}
                  icon={icon}
                  label={label}
                  active={active === id}
                  onClick={() => { setActive(id); setShow(false); }}
                />
              ))}
            </Sidebar>
          }
          content={
            <div style={{ padding: 24 }}>
              <Text variant="title-3">{items.find(i => i.id === active)?.label}</Text>
              <Text variant="body" color="dim" style={{ marginTop: 8 }}>
                Content area. Resize below 400 px to see the sidebar become an overlay toggled by the menu button.
              </Text>
            </div>
          }
        />
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
