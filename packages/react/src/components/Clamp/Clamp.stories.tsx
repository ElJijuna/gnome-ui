import type { Meta, StoryObj } from "@storybook/react";
import { Clamp } from "./Clamp";
import { BoxedList } from "../BoxedList";
import { ActionRow } from "../ActionRow";
import { Switch } from "../Switch";
import { Text } from "../Text";

const meta: Meta<typeof Clamp> = {
  title: "Adaptive/Clamp",
  component: Clamp,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Constrains its child to a maximum width while allowing it to shrink freely on narrow screens — mirroring the Adwaita \`AdwClamp\` widget.

### Guidelines
- Use on settings pages and forms so content never becomes too wide to read comfortably.
- The default \`maximumSize\` is **600 px** — the Adwaita recommended narrow-content width.
- The element is always centred horizontally.
- Does not add any padding — wrap content in its own padded container as needed.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Clamp>;

export const Default: Story = {
  render: () => (
    <div style={{ background: "rgba(0,0,0,0.04)", padding: 24 }}>
      <Clamp maximumSize={480}>
        <BoxedList>
          <ActionRow title="Wi-Fi" subtitle="Connected to Home Network" trailing={<Switch defaultChecked aria-label="Wi-Fi" />} />
          <ActionRow title="Bluetooth" trailing={<Switch aria-label="Bluetooth" />} />
          <ActionRow title="Airplane Mode" trailing={<Switch aria-label="Airplane mode" />} />
        </BoxedList>
      </Clamp>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const NarrowContent: Story = {
  render: () => (
    <div style={{ background: "rgba(0,0,0,0.04)", padding: 24 }}>
      <Clamp maximumSize={320}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Text variant="title-4">Narrow clamp</Text>
          <Text variant="body" color="dim">This content is constrained to 320 px maximum. Resize the window to see it shrink below that.</Text>
        </div>
      </Clamp>
    </div>
  ),
  parameters: { controls: { disable: true } },
};
