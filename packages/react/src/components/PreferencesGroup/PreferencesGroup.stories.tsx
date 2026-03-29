import type { Meta, StoryObj } from "@storybook/react";
import { PreferencesGroup } from "./PreferencesGroup";
import { BoxedList } from "../BoxedList";
import { SwitchRow } from "../SwitchRow";
import { ComboRow } from "../ComboRow";
import { ActionRow } from "../ActionRow";
import { Button } from "../Button";

const meta: Meta<typeof PreferencesGroup> = {
  title: "Components/PreferencesGroup",
  component: PreferencesGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Titled section that wraps a \`BoxedList\` with an optional description.

Use inside a \`PreferencesPage\` to group related settings under a named
heading. The group is purely a layout and labelling wrapper — pass a
\`BoxedList\` as \`children\`.

Mirrors \`AdwPreferencesGroup\`.

### Usage
- \`title\` labels the group (e.g. "Appearance", "Privacy").
- \`description\` adds a dimmed subtitle below the title.
- \`headerSuffix\` places a widget (e.g. a reset Button) at the trailing edge of the header.
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
  },
  args: {
    title: "Appearance",
    description: "",
  },
};

export default meta;
type Story = StoryObj<typeof PreferencesGroup>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => (
    <PreferencesGroup {...args}>
      <BoxedList>
        <SwitchRow title="Dark mode" subtitle="Use dark colour scheme" />
        <ComboRow
          title="Text size"
          options={[
            { value: "small", label: "Small" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" },
          ]}
          defaultValue="medium"
        />
      </BoxedList>
    </PreferencesGroup>
  ),
};

// ─── With description ─────────────────────────────────────────────────────────

export const WithDescription: Story = {
  render: () => (
    <PreferencesGroup
      title="Privacy"
      description="Control how your data is used and shared."
    >
      <BoxedList>
        <SwitchRow title="Usage statistics" subtitle="Send anonymous usage data to improve the app" />
        <SwitchRow title="Crash reports" subtitle="Automatically send crash reports" />
      </BoxedList>
    </PreferencesGroup>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "A `description` provides additional context below the group title.",
      },
    },
  },
};

// ─── With header suffix ───────────────────────────────────────────────────────

export const WithHeaderSuffix: Story = {
  render: () => (
    <PreferencesGroup
      title="Keyboard shortcuts"
      headerSuffix={<Button variant="flat" style={{ padding: "4px 8px", fontSize: "0.875rem" }}>Reset all</Button>}
    >
      <BoxedList>
        <ActionRow title="New window" subtitle="Open a new application window" />
        <ActionRow title="Close window" subtitle="Close the current window" />
      </BoxedList>
    </PreferencesGroup>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "`headerSuffix` places a widget at the trailing edge of the title row — typically a reset button.",
      },
    },
  },
};

// ─── No title ─────────────────────────────────────────────────────────────────

export const NoTitle: Story = {
  render: () => (
    <PreferencesGroup>
      <BoxedList>
        <SwitchRow title="Notifications" />
        <SwitchRow title="Sounds" />
      </BoxedList>
    </PreferencesGroup>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Without a `title` the group renders without a header — just the content.",
      },
    },
  },
};
