import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { NavigationSplitView } from "./NavigationSplitView";
import { Sidebar } from "../Sidebar";
import { SidebarItem } from "../Sidebar/SidebarItem";
import { HeaderBar } from "../HeaderBar";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { GoHome, Star, Search, Settings, GoPrevious } from "@gnome-ui/icons";

const meta: Meta<typeof NavigationSplitView> = {
  title: "Adaptive/NavigationSplitView",
  component: NavigationSplitView,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Two-pane sidebar + content layout that collapses to a single navigable pane on narrow screens (≤ 400 px), mirroring \`AdwNavigationSplitView\`.

- **Wide (> 400 px):** sidebar and content are side-by-side. \`showContent\` is ignored.
- **Narrow (≤ 400 px):** only one pane is visible at a time. Use \`showContent\` to switch.

### Guidelines
- Use for apps with a list → detail navigation pattern (mail, files, contacts).
- The sidebar should contain a navigable list; the content pane shows the selected item.
- On narrow screens, add a **Back** button to the content header bar so users can return to the sidebar.
- The \`showContent\` prop is typically driven by whether a selection has been made.
      `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof NavigationSplitView>;

const items = [
  { id: "home",     label: "Home",     icon: GoHome },
  { id: "starred",  label: "Starred",  icon: Star },
  { id: "search",   label: "Search",   icon: Search },
  { id: "settings", label: "Settings", icon: Settings },
];

export const Default: Story = {
  render: function DefaultStory() {
    const [active, setActive]           = useState("home");
    const [showContent, setShowContent] = useState(false);
    const { isNarrow }                  = useBreakpoint();

    return (
      <div style={{ height: 480, display: "flex", flexDirection: "column", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden" }}>
        <HeaderBar
          title={isNarrow && showContent
            ? items.find(i => i.id === active)?.label
            : "Mail"}
          start={isNarrow && showContent
            ? (
              <Button variant="flat" aria-label="Back" onClick={() => setShowContent(false)}>
                <Icon icon={GoPrevious} size="md" aria-hidden />
                Back
              </Button>
            )
            : undefined}
        />
        <NavigationSplitView
          style={{ flex: 1 }}
          showContent={showContent}
          sidebar={
            <Sidebar style={{ height: "100%" }}>
              {items.map(({ id, label, icon }) => (
                <SidebarItem
                  key={id}
                  icon={icon}
                  label={label}
                  active={active === id}
                  onClick={() => { setActive(id); setShowContent(true); }}
                />
              ))}
            </Sidebar>
          }
          content={
            <div style={{ padding: 24 }}>
              <Text variant="title-3">{items.find(i => i.id === active)?.label}</Text>
              <Text variant="body" color="dim" style={{ marginTop: 8 }}>
                Content for the {active} view. Resize the window below 400 px to see the layout collapse.
              </Text>
            </div>
          }
        />
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
