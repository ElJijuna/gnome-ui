import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "./Link";
import { Text } from "../Text";

const meta: Meta<typeof Link> = {
  title: "Components/Link",
  component: Link,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Inline hyperlink following GNOME HIG.

- Accent-coloured text with an animated underline on hover.
- \`external\` prop (or \`target="_blank"\`) opens in a new tab safely and appends a visual ↗ indicator.
- Fully keyboard accessible with a focus ring.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {
  args: {
    href: "#",
    children: "Visit GNOME HIG",
  },
};

export const External: Story = {
  args: {
    href: "https://developer.gnome.org/hig/",
    children: "GNOME Human Interface Guidelines",
    external: true,
  },
};

export const InlineText: Story = {
  render: () => (
    <Text variant="body">
      Learn more about{" "}
      <Link href="https://developer.gnome.org/hig/" external>
        GNOME HIG
      </Link>{" "}
      before building your application. You can also read the{" "}
      <Link href="#">local documentation</Link>.
    </Text>
  ),
  parameters: { controls: { disable: true } },
};
