import { GitTag } from '@gnome-ui/icons';
import { Chip } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const ChipScreen = () => {
  const [selected, setSelected] = useState<Record<string, boolean>>({
    all: true,
    open: false,
    closed: false,
  });
  const [tags, setTags] = useState(['bug', 'design', 'urgent']);

  return (
    <>
      <Section title="Static" description="Just a visual label">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Chip label="React" />
          <Chip label="TypeScript" icon={GitTag} />
        </View>
      </Section>

      <Section title="Removable" description="Add onRemove to show a × button">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onRemove={() => setTags((prev) => prev.filter((t) => t !== tag))}
            />
          ))}
        </View>
      </Section>

      <Section title="Selectable" description="Toggle group of filters">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(['all', 'open', 'closed'] as const).map((key) => (
            <Chip
              key={key}
              label={key}
              selectable
              selected={selected[key]}
              onToggle={() => setSelected((prev) => ({ ...prev, [key]: !prev[key] }))}
            />
          ))}
        </View>
      </Section>

      <Section title="Disabled">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Chip label="Static" disabled />
          <Chip label="Removable" onRemove={() => {}} disabled />
          <Chip label="Selectable" selectable selected onToggle={() => {}} disabled />
        </View>
      </Section>
    </>
  );
};
