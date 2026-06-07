import { GoHome, Search, Settings, Star } from '@gnome-ui/icons';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Chip } from '../Chip';
import readme from './README.md?raw';
import { WrapBox } from './WrapBox';

const meta: Meta<typeof WrapBox> = {
  title: 'Components/WrapBox',
  component: WrapBox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof WrapBox>;

const tags = [
  'React',
  'TypeScript',
  'GNOME',
  'Adwaita',
  'libadwaita',
  'GTK',
  'CSS',
  'Accessibility',
  'Dark mode',
  'Responsive',
  'Components',
  'Design system',
];

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 480, padding: 16 }}>
      <WrapBox childSpacing={6} lineSpacing={6}>
        {tags.map((t) => (
          <Chip key={t} label={t} />
        ))}
      </WrapBox>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const Centered: Story = {
  render: () => (
    <div style={{ maxWidth: 480, padding: 16 }}>
      <WrapBox childSpacing={6} lineSpacing={6} justify="center">
        {tags.map((t) => (
          <Chip key={t} label={t} />
        ))}
      </WrapBox>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const SpaceBetween: Story = {
  render: () => (
    <div style={{ maxWidth: 480, padding: 16 }}>
      <WrapBox childSpacing={6} lineSpacing={8} justify="space-between">
        {tags.map((t) => (
          <Chip key={t} label={t} />
        ))}
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
          {items.map((t) => (
            <Chip
              key={t}
              label={t}
              onRemove={() => setItems((prev) => prev.filter((x) => x !== t))}
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
    const [selected, setSelected] = useState<Set<string>>(new Set(['React', 'GNOME']));
    const toggle = (t: string) =>
      setSelected((prev) => {
        const next = new Set(prev);

        if (next.has(t)) {
          next.delete(t);
        } else {
          next.add(t);
        }

        return next;
      });

    return (
      <div style={{ maxWidth: 480, padding: 16 }}>
        <WrapBox childSpacing={6} lineSpacing={6}>
          {tags.map((t) => (
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
