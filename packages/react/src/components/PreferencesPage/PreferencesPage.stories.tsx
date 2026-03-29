import type { Meta, StoryObj } from "@storybook/react";
import { PreferencesPage } from "./PreferencesPage";
import { PreferencesGroup } from "../PreferencesGroup";
import { BoxedList } from "../BoxedList";
import { SwitchRow } from "../SwitchRow";
import { ComboRow } from "../ComboRow";
import { SpinRow } from "../SpinRow";
import { EntryRow } from "../EntryRow";

const meta: Meta<typeof PreferencesPage> = {
  title: "Components/PreferencesPage",
  component: PreferencesPage,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Scrollable page composed of \`PreferencesGroup\` sections.

Use as a child of \`PreferencesDialog\`. Each page appears as a labelled
navigation entry in the dialog sidebar.

Mirrors \`AdwPreferencesPage\`.

### Usage
- \`title\` is used as the sidebar navigation label.
- \`iconName\` optionally places an icon next to the title in the sidebar.
- Put \`PreferencesGroup\` children inside to build the page layout.
        `,
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    iconName: { control: "text" },
  },
  args: {
    title: "General",
    iconName: "preferences-system-symbolic",
  },
};

export default meta;
type Story = StoryObj<typeof PreferencesPage>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => (
    <div style={{ height: 500, display: "flex", flexDirection: "column", border: "1px solid var(--gnome-borders-color)", borderRadius: 12, overflow: "hidden" }}>
      <PreferencesPage {...args}>
        <PreferencesGroup title="Appearance">
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
        <PreferencesGroup title="Privacy">
          <BoxedList>
            <SwitchRow title="Usage statistics" subtitle="Send anonymous usage data" />
            <SwitchRow title="Crash reports" subtitle="Automatically send crash reports" />
          </BoxedList>
        </PreferencesGroup>
      </PreferencesPage>
    </div>
  ),
};

// ─── Multiple groups ──────────────────────────────────────────────────────────

export const MultipleGroups: Story = {
  render: () => (
    <div style={{ height: 560, display: "flex", flexDirection: "column", border: "1px solid var(--gnome-borders-color)", borderRadius: 12, overflow: "hidden" }}>
      <PreferencesPage title="Advanced">
        <PreferencesGroup title="Network">
          <BoxedList>
            <EntryRow title="Proxy server" defaultValue="" />
            <SpinRow title="Timeout (seconds)" min={5} max={120} step={5} defaultValue={30} />
          </BoxedList>
        </PreferencesGroup>
        <PreferencesGroup title="Updates" description="Configure how the application checks for updates.">
          <BoxedList>
            <SwitchRow title="Automatic updates" defaultChecked />
            <ComboRow
              title="Update channel"
              options={[
                { value: "stable", label: "Stable" },
                { value: "beta", label: "Beta" },
                { value: "nightly", label: "Nightly" },
              ]}
              defaultValue="stable"
            />
          </BoxedList>
        </PreferencesGroup>
        <PreferencesGroup title="Developer">
          <BoxedList>
            <SwitchRow title="Enable debug logging" />
            <SwitchRow title="Show inspector" />
          </BoxedList>
        </PreferencesGroup>
      </PreferencesPage>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "A page with multiple `PreferencesGroup` sections, demonstrating vertical scrolling.",
      },
    },
  },
};
