import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Dropdown } from "./Dropdown";
import { Text } from "../Text";
import { Button } from "../Button";

const meta: Meta<typeof Dropdown> = {
  title: "Components/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Expandable option list following the Adwaita combo-row / drop-down style.

### Guidelines
- Use when the user must pick exactly one option from a list of 4 or more.
- For 2–3 options prefer **Radio Buttons** (all choices visible at once).
- Keep labels short — one to three words.
- Provide a meaningful \`placeholder\` that describes what to select.
- The list flips above the trigger when there is not enough space below.
- Keyboard: Space / Enter / ↓ opens; ↑↓ navigates; Enter selects; Escape closes.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <div style={{ maxWidth: 260 }}>
        <Dropdown
          aria-label="Colour scheme"
          placeholder="Choose colour scheme"
          options={[
            { value: "light",  label: "Light" },
            { value: "dark",   label: "Dark" },
            { value: "system", label: "Follow system" },
          ]}
          value={value}
          onChange={setValue}
        />
        {value && (
          <Text variant="caption" color="dim" style={{ marginTop: 8, display: "block" }}>
            Selected: {value}
          </Text>
        )}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── With descriptions ────────────────────────────────────────────────────────

export const WithDescriptions: Story = {
  render: function DescStory() {
    const [value, setValue] = useState("balanced");
    return (
      <div style={{ maxWidth: 300 }}>
        <Dropdown
          aria-label="Power mode"
          options={[
            { value: "performance", label: "Performance",  description: "Maximum speed, higher power use" },
            { value: "balanced",    label: "Balanced",     description: "Recommended for most use cases" },
            { value: "saver",       label: "Power Saver",  description: "Extends battery life" },
          ]}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Each option can have an optional `description` shown in a dimmed second line.",
      },
    },
  },
};

// ─── With disabled option ─────────────────────────────────────────────────────

export const WithDisabledOption: Story = {
  render: function DisabledOptStory() {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <div style={{ maxWidth: 240 }}>
        <Dropdown
          aria-label="Output device"
          placeholder="Select output"
          options={[
            { value: "speakers",   label: "Speakers" },
            { value: "headphones", label: "Headphones" },
            { value: "hdmi",       label: "HDMI",       disabled: true },
            { value: "bluetooth",  label: "Bluetooth",  disabled: true },
          ]}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Disabled options are skipped by keyboard navigation." },
    },
  },
};

// ─── Disabled control ─────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: 240 }}>
      <Dropdown
        aria-label="Region"
        value="eu-west"
        disabled
        options={[
          { value: "us-east",  label: "US East" },
          { value: "eu-west",  label: "EU West" },
          { value: "ap-south", label: "AP South" },
        ]}
      />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Many options (scroll) ────────────────────────────────────────────────────

export const ManyOptions: Story = {
  render: function ManyStory() {
    const [value, setValue] = useState<string | undefined>(undefined);
    const timezones = [
      "Pacific/Honolulu", "America/Anchorage", "America/Los_Angeles",
      "America/Denver", "America/Chicago", "America/New_York",
      "America/Sao_Paulo", "Europe/London", "Europe/Paris",
      "Europe/Helsinki", "Africa/Nairobi", "Asia/Dubai",
      "Asia/Kolkata", "Asia/Bangkok", "Asia/Tokyo",
      "Australia/Sydney", "Pacific/Auckland",
    ];
    return (
      <div style={{ maxWidth: 260 }}>
        <Dropdown
          aria-label="Timezone"
          placeholder="Select timezone"
          options={timezones.map((tz) => ({ value: tz, label: tz }))}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "The list scrolls when there are more options than fit in 280 px.",
      },
    },
  },
};

// ─── In a form ────────────────────────────────────────────────────────────────

export const InForm: Story = {
  render: function FormStory() {
    const [lang,   setLang]   = useState("en");
    const [region, setRegion] = useState<string | undefined>(undefined);
    const [format, setFormat] = useState("24h");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 300 }}>
        {[
          {
            label: "Language",
            el: (
              <Dropdown
                aria-label="Language"
                value={lang}
                onChange={setLang}
                options={[
                  { value: "en", label: "English" },
                  { value: "es", label: "Español" },
                  { value: "fr", label: "Français" },
                  { value: "de", label: "Deutsch" },
                ]}
              />
            ),
          },
          {
            label: "Region",
            el: (
              <Dropdown
                aria-label="Region"
                placeholder="Select region"
                value={region}
                onChange={setRegion}
                options={[
                  { value: "us", label: "United States" },
                  { value: "gb", label: "United Kingdom" },
                  { value: "es", label: "Spain" },
                  { value: "de", label: "Germany" },
                ]}
              />
            ),
          },
          {
            label: "Time format",
            el: (
              <Dropdown
                aria-label="Time format"
                value={format}
                onChange={setFormat}
                options={[
                  { value: "24h", label: "24-hour" },
                  { value: "12h", label: "12-hour (AM/PM)" },
                ]}
              />
            ),
          },
        ].map(({ label, el }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Text variant="body" style={{ fontWeight: 600 }}>{label}</Text>
            {el}
          </div>
        ))}

        <Button variant="suggested" style={{ alignSelf: "flex-end" }}>
          Apply
        </Button>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
