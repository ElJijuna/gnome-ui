import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { WrapBox } from "./WrapBox";
import { Chip } from "../Chip";
import { Star, Settings, GoHome, Search } from "@gnome-ui/icons";

const meta: Meta<typeof WrapBox> = {
  title: "Components/WrapBox",
  component: WrapBox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Flexible wrapping layout container.

Children flow horizontally and wrap to new lines when they don't fit,
like words in a paragraph — without locking them into a grid.

Mirrors \`AdwWrapBox\` (libadwaita 1.7 / GNOME 48).

Pair with \`Chip\` for tag lists and filter rows, or use standalone for
any collection of variable-width items.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof WrapBox>;

const tags = [
  "React", "TypeScript", "GNOME", "Adwaita", "libadwaita",
  "GTK", "CSS", "Accessibility", "Dark mode", "Responsive",
  "Components", "Design system",
];

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 480, padding: 16 }}>
      <WrapBox childSpacing={6} lineSpacing={6}>
        {tags.map(t => <Chip key={t} label={t} />)}
      </WrapBox>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const Centered: Story = {
  render: () => (
    <div style={{ maxWidth: 480, padding: 16 }}>
      <WrapBox childSpacing={6} lineSpacing={6} justify="center">
        {tags.map(t => <Chip key={t} label={t} />)}
      </WrapBox>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const SpaceBetween: Story = {
  render: () => (
    <div style={{ maxWidth: 480, padding: 16 }}>
      <WrapBox childSpacing={6} lineSpacing={8} justify="space-between">
        {tags.map(t => <Chip key={t} label={t} />)}
      </WrapBox>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ maxWidth: 480, padding: 16 }}>
      <WrapBox childSpacing={6} lineSpacing={6}>
        <Chip label="Home" icon={GoHome} />
        <Chip label="Search" icon={Search} />
        <Chip label="Starred" icon={Star} />
        <Chip label="Settings" icon={Settings} />
        <Chip label="React" />
        <Chip label="TypeScript" />
        <Chip label="GNOME" />
      </WrapBox>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const Removable: Story = {
  render: function RemovableStory() {
    const [items, setItems] = useState(tags);
    return (
      <div style={{ maxWidth: 480, padding: 16 }}>
        <WrapBox childSpacing={6} lineSpacing={6}>
          {items.map(t => (
            <Chip
              key={t}
              label={t}
              onRemove={() => setItems(prev => prev.filter(x => x !== t))}
            />
          ))}
        </WrapBox>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

export const Selectable: Story = {
  render: function SelectableStory() {
    const [selected, setSelected] = useState<Set<string>>(new Set(["React", "GNOME"]));
    const toggle = (t: string) =>
      setSelected(prev => {
        const next = new Set(prev);
        next.has(t) ? next.delete(t) : next.add(t);
        return next;
      });
    return (
      <div style={{ maxWidth: 480, padding: 16 }}>
        <WrapBox childSpacing={6} lineSpacing={6}>
          {tags.map(t => (
            <Chip
              key={t}
              label={t}
              selectable
              selected={selected.has(t)}
              onToggle={() => toggle(t)}
            />
          ))}
        </WrapBox>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
