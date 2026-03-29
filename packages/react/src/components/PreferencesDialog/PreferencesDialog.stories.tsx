import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PreferencesDialog } from "./PreferencesDialog";
import { PreferencesPage } from "../PreferencesPage";
import { PreferencesGroup } from "../PreferencesGroup";
import { BoxedList } from "../BoxedList";
import { SwitchRow } from "../SwitchRow";
import { ComboRow } from "../ComboRow";
import { EntryRow } from "../EntryRow";
import { SpinRow } from "../SpinRow";
import { Button } from "../Button";

const meta: Meta<typeof PreferencesDialog> = {
  title: "Components/PreferencesDialog",
  component: PreferencesDialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Multi-page settings dialog using \`PreferencesPage\` tabs.

Renders a wide modal with a sidebar listing pages on the left. Each
\`PreferencesPage\` child becomes a navigation entry. When only one page
is provided the sidebar is hidden. Supports built-in search via the
\`searchable\` prop (default: \`true\`).

Mirrors \`AdwPreferencesDialog\`.

### Usage
\`\`\`tsx
<PreferencesDialog open={open} onClose={() => setOpen(false)}>
  <PreferencesPage title="General" iconName="preferences-system-symbolic">
    <PreferencesGroup title="Appearance">
      <BoxedList>
        <SwitchRow title="Dark mode" />
      </BoxedList>
    </PreferencesGroup>
  </PreferencesPage>
</PreferencesDialog>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PreferencesDialog>;

// ─── Single page ──────────────────────────────────────────────────────────────

export const SinglePage: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="suggested" onClick={() => setOpen(true)}>Open Preferences</Button>
        <PreferencesDialog open={open} onClose={() => setOpen(false)}>
          <PreferencesPage title="General">
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
                <SwitchRow title="Crash reports" />
              </BoxedList>
            </PreferencesGroup>
          </PreferencesPage>
        </PreferencesDialog>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "With a single `PreferencesPage` the sidebar is hidden and the full width is given to the page content.",
      },
    },
  },
};

// ─── Multiple pages ───────────────────────────────────────────────────────────

export const MultiplePages: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="suggested" onClick={() => setOpen(true)}>Open Preferences</Button>
        <PreferencesDialog open={open} onClose={() => setOpen(false)}>
          <PreferencesPage title="General" iconName="preferences-system-symbolic">
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
            <PreferencesGroup title="Language & Region">
              <BoxedList>
                <ComboRow
                  title="Language"
                  options={[
                    { value: "en", label: "English" },
                    { value: "es", label: "Español" },
                    { value: "fr", label: "Français" },
                    { value: "de", label: "Deutsch" },
                  ]}
                  defaultValue="en"
                />
              </BoxedList>
            </PreferencesGroup>
          </PreferencesPage>

          <PreferencesPage title="Privacy" iconName="preferences-privacy-symbolic">
            <PreferencesGroup title="Data collection" description="Control how your data is used.">
              <BoxedList>
                <SwitchRow title="Usage statistics" subtitle="Send anonymous usage data" />
                <SwitchRow title="Crash reports" subtitle="Automatically send crash reports" defaultChecked />
              </BoxedList>
            </PreferencesGroup>
            <PreferencesGroup title="Location">
              <BoxedList>
                <SwitchRow title="Location services" />
              </BoxedList>
            </PreferencesGroup>
          </PreferencesPage>

          <PreferencesPage title="Advanced" iconName="preferences-other-symbolic">
            <PreferencesGroup title="Network">
              <BoxedList>
                <EntryRow title="Proxy server" defaultValue="" />
                <SpinRow title="Timeout (seconds)" min={5} max={120} step={5} defaultValue={30} />
              </BoxedList>
            </PreferencesGroup>
            <PreferencesGroup title="Developer">
              <BoxedList>
                <SwitchRow title="Enable debug logging" />
                <SwitchRow title="Show inspector" />
              </BoxedList>
            </PreferencesGroup>
          </PreferencesPage>
        </PreferencesDialog>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Three pages — General, Privacy, Advanced. The sidebar appears on the left for navigation between pages.",
      },
    },
  },
};

// ─── Without search ───────────────────────────────────────────────────────────

export const WithoutSearch: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open (no search)</Button>
        <PreferencesDialog open={open} onClose={() => setOpen(false)} searchable={false}>
          <PreferencesPage title="General">
            <PreferencesGroup title="Appearance">
              <BoxedList>
                <SwitchRow title="Dark mode" />
              </BoxedList>
            </PreferencesGroup>
          </PreferencesPage>
        </PreferencesDialog>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "`searchable={false}` hides the search input from the header.",
      },
    },
  },
};
