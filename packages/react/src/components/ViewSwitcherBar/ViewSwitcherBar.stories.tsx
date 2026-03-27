import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ViewSwitcherBar } from "./ViewSwitcherBar";
import { ViewSwitcher } from "../ViewSwitcher";
import { ViewSwitcherItem } from "../ViewSwitcher/ViewSwitcherItem";
import { HeaderBar } from "../HeaderBar";
import { Text } from "../Text";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { GoHome, Search, Star, Settings } from "@gnome-ui/icons";

const meta: Meta<typeof ViewSwitcherBar> = {
  title: "Adaptive/ViewSwitcherBar",
  component: ViewSwitcherBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Bottom navigation bar for \`ViewSwitcher\` items on narrow screens (≤ 550 px), mirroring \`AdwViewSwitcherBar\`.

Use in tandem with a header-bar \`ViewSwitcher\`:
- **Wide (> 550 px):** show \`ViewSwitcher\` in the \`HeaderBar\`, hide the bar (\`reveal={false}\`).
- **Narrow (≤ 550 px):** hide the header switcher, set \`reveal={true}\`.

Pair with \`useBreakpoint().isMedium\` to automate the switch.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ViewSwitcherBar>;

const views = [
  { id: "home",     label: "Home",     icon: GoHome },
  { id: "search",   label: "Search",   icon: Search },
  { id: "starred",  label: "Starred",  icon: Star },
  { id: "settings", label: "Settings", icon: Settings },
];

export const AdaptiveDemo: Story = {
  render: function AdaptiveStory() {
    const [active, setActive] = useState("home");
    const { isMedium } = useBreakpoint();

    const switcher = views.map(({ id, label, icon }) => (
      <ViewSwitcherItem
        key={id}
        label={label}
        icon={icon}
        active={active === id}
        onClick={() => setActive(id)}
      />
    ));

    return (
      <div style={{ display: "flex", flexDirection: "column", height: 420, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden" }}>
        <HeaderBar
          title={
            !isMedium
              ? <ViewSwitcher aria-label="Section">{switcher}</ViewSwitcher>
              : views.find(v => v.id === active)?.label
          }
        />

        <div style={{ flex: 1, padding: 24, overflow: "auto" }}>
          <Text variant="body" color="dim">
            {isMedium
              ? "Narrow mode — ViewSwitcher moved to the bottom bar."
              : "Wide mode — ViewSwitcher is in the HeaderBar. Resize below 550 px to see the bottom bar appear."}
          </Text>
        </div>

        <ViewSwitcherBar reveal={isMedium}>
          {switcher}
        </ViewSwitcherBar>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
