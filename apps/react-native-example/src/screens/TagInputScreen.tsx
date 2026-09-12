import { TagInput, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const TagInputScreen = () => {
  const [tags, setTags] = useState(['react', 'gnome']);
  const [limited, setLimited] = useState(['bug', 'design']);
  const [free, setFree] = useState<string[]>([]);

  return (
    <>
      <Section
        title="Basic"
        description="Type and press Return or , to add — paste a list to add several"
      >
        <TagInput label="Tags" value={tags} onChange={setTags} placeholder="Add a tag…" />
        <Text variant="caption" color="dim">
          value: {tags.join(', ') || '(none)'}
        </Text>
      </Section>

      <Section title="With helper text and error">
        <View style={{ gap: 16 }}>
          <TagInput
            label="Skills"
            value={[]}
            onChange={() => {}}
            helperText="Press Enter after each skill"
          />
          <TagInput
            label="Recipients"
            value={[]}
            onChange={() => {}}
            error="At least one recipient is required"
          />
        </View>
      </Section>

      <Section title="Max tags" description="Once reached, the draft input hides">
        <TagInput label="Labels" value={limited} onChange={setLimited} maxTags={4} />
      </Section>

      <Section title="Duplicates allowed" description="preventDuplicates={false}">
        <TagInput
          label="Notes"
          value={free}
          onChange={setFree}
          preventDuplicates={false}
          placeholder="Anything goes…"
        />
      </Section>

      <Section title="Disabled">
        <TagInput label="Tags" value={['locked', 'read-only']} onChange={() => {}} disabled />
      </Section>
    </>
  );
};
