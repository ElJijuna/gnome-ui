import type { Meta, StoryObj } from "@storybook/react";
import { ToolbarView } from "./ToolbarView";
import { HeaderBar } from "../HeaderBar";
import { Toolbar } from "../Toolbar";
import { Button } from "../Button";
import { Text } from "../Text";
import { BoxedList } from "../BoxedList";
import { ActionRow } from "../ActionRow";
import { WindowTitle } from "../WindowTitle";

const meta: Meta<typeof ToolbarView> = {
  title: "Components/ToolbarView",
  component: ToolbarView,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Layout container that attaches bars at the top and/or bottom while
scrolling only the middle content.

The top/bottom bars remain fixed; the inner content area gets
\`overflow-y: auto\` so it scrolls independently.

Mirrors \`AdwToolbarView\`.

### Usage
- Pass a \`HeaderBar\` or \`Toolbar\` to \`topBar\`.
- Pass a \`Toolbar\` or \`ViewSwitcherBar\` to \`bottomBar\`.
- Put scrollable page content in \`children\`.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ToolbarView>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <div style={{ height: 400 }}>
      <ToolbarView
        topBar={
          <HeaderBar title={<WindowTitle title="Files" subtitle="/home/user/Documents" />} />
        }
      >
        <div style={{ padding: 16 }}>
          <BoxedList>
            {Array.from({ length: 12 }, (_, i) => (
              <ActionRow key={i} title={`Document ${i + 1}.pdf`} subtitle="Modified just now" />
            ))}
          </BoxedList>
        </div>
      </ToolbarView>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Scrollable content with a fixed `HeaderBar` at the top. Resize the preview to see scrolling behaviour.",
      },
    },
  },
};

// ─── Top and bottom bars ──────────────────────────────────────────────────────

export const TopAndBottomBars: Story = {
  render: () => (
    <div style={{ height: 400 }}>
      <ToolbarView
        topBar={<HeaderBar title="Notes" />}
        bottomBar={
          <Toolbar>
            <Button variant="flat">Format</Button>
            <Button variant="flat">Insert</Button>
            <Button variant="suggested" style={{ marginLeft: "auto" }}>Done</Button>
          </Toolbar>
        }
      >
        <div style={{ padding: 16 }}>
          <Text variant="body">
            {Array.from({ length: 8 }, (_, i) => (
              <p key={i} style={{ marginBottom: 12 }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            ))}
          </Text>
        </div>
      </ToolbarView>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Fixed `HeaderBar` at the top and an action `Toolbar` pinned to the bottom, with scrollable content in between.",
      },
    },
  },
};

// ─── Bottom bar only ──────────────────────────────────────────────────────────

export const BottomBarOnly: Story = {
  render: () => (
    <div style={{ height: 300 }}>
      <ToolbarView
        bottomBar={
          <Toolbar style={{ justifyContent: "center", gap: 8 }}>
            <Button variant="flat">Cancel</Button>
            <Button variant="suggested">Apply</Button>
          </Toolbar>
        }
      >
        <div style={{ padding: 16 }}>
          <BoxedList>
            <ActionRow title="Option A" subtitle="Description of option A" />
            <ActionRow title="Option B" subtitle="Description of option B" />
            <ActionRow title="Option C" subtitle="Description of option C" />
          </BoxedList>
        </div>
      </ToolbarView>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Only a bottom action bar — no top bar. The content fills the remaining height.",
      },
    },
  },
};
