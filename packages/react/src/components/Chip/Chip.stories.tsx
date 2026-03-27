import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Chip } from "./Chip";
import { WrapBox } from "../WrapBox";
import { Text } from "../Text";
import { Star, Search, Settings, GoHome } from "@gnome-ui/icons";

const meta: Meta<typeof Chip> = {
  title: "Components/Chip",
  component: Chip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Compact pill-shaped label for tags, filters, and selection states.

Three usage modes:

- **Static** — visual label only. No interaction.
- **Removable** — add \`onRemove\` to show a × button that removes the chip.
- **Selectable** — add \`selectable\` + \`selected\` + \`onToggle\` for toggle behaviour.

Pair with \`WrapBox\` for multi-chip layouts.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Static: Story = {
  render: () => (
    <WrapBox childSpacing={6}>
      <Chip label="React" />
      <Chip label="TypeScript" icon={Star} />
      <Chip label="GNOME" />
      <Chip label="Adwaita" icon={Settings} />
    </WrapBox>
  ),
  parameters: { controls: { disable: true } },
};

export const Removable: Story = {
  render: function RemovableStory() {
    const [tags, setTags] = useState(["React", "TypeScript", "GNOME", "Adwaita", "libadwaita"]);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <WrapBox childSpacing={6} lineSpacing={6}>
          {tags.map(t => (
            <Chip
              key={t}
              label={t}
              onRemove={() => setTags(prev => prev.filter(x => x !== t))}
            />
          ))}
          {tags.length === 0 && (
            <Text variant="caption" color="dim">No tags. Refresh the story to reset.</Text>
          )}
        </WrapBox>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

export const Selectable: Story = {
  render: function SelectableStory() {
    const options = ["Design", "Development", "Research", "Testing", "Documentation", "DevOps"];
    const [selected, setSelected] = useState<Set<string>>(new Set(["Design", "Testing"]));

    const toggle = (label: string) =>
      setSelected(prev => {
        const next = new Set(prev);
        next.has(label) ? next.delete(label) : next.add(label);
        return next;
      });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <WrapBox childSpacing={6} lineSpacing={6}>
          {options.map(o => (
            <Chip
              key={o}
              label={o}
              selectable
              selected={selected.has(o)}
              onToggle={() => toggle(o)}
            />
          ))}
        </WrapBox>
        <Text variant="caption" color="dim">
          Selected: {[...selected].join(", ") || "none"}
        </Text>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

export const WithIcons: Story = {
  render: () => (
    <WrapBox childSpacing={6}>
      <Chip label="Home" icon={GoHome} />
      <Chip label="Search" icon={Search} />
      <Chip label="Settings" icon={Settings} />
      <Chip label="Starred" icon={Star} />
    </WrapBox>
  ),
  parameters: { controls: { disable: true } },
};

export const Disabled: Story = {
  render: () => (
    <WrapBox childSpacing={6}>
      <Chip label="Static disabled" disabled />
      <Chip label="Removable disabled" onRemove={() => {}} disabled />
      <Chip label="Selected disabled" selectable selected disabled />
    </WrapBox>
  ),
  parameters: { controls: { disable: true } },
};

export const FilterBar: Story = {
  render: function FilterBarStory() {
    const filters = ["All", "Unread", "Flagged", "Attachments", "From me"];
    const [active, setActive] = useState("All");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <WrapBox childSpacing={6}>
          {filters.map(f => (
            <Chip
              key={f}
              label={f}
              selectable
              selected={active === f}
              onToggle={() => setActive(f)}
            />
          ))}
        </WrapBox>
        <Text variant="caption" color="dim">Filter: {active}</Text>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
