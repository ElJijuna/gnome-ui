import { Button, SplitButton, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const SaveOptions = () => (
  <View style={{ gap: 4 }}>
    <Button variant="flat" size="sm" onPress={() => {}}>
      Save as Template
    </Button>
    <Button variant="flat" size="sm" onPress={() => {}}>
      Save a Copy
    </Button>
    <Button variant="flat" size="sm" onPress={() => {}}>
      Export…
    </Button>
  </View>
);

export const SplitButtonScreen = () => {
  const [lastAction, setLastAction] = useState('(none)');

  return (
    <>
      <Section title="Basic" description="Tap the label to save, tap the arrow for more options">
        <SplitButton
          label="Save"
          onPress={() => setLastAction('Save')}
          dropdownContent={<SaveOptions />}
        />
        <Text variant="caption" color="dim">
          last action: {lastAction}
        </Text>
      </Section>

      <Section title="Variants" description="Matches Button's default/suggested/destructive">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <SplitButton label="Save" dropdownContent={<SaveOptions />} />
          <SplitButton label="Publish" variant="suggested" dropdownContent={<SaveOptions />} />
          <SplitButton label="Delete" variant="destructive" dropdownContent={<SaveOptions />} />
        </View>
      </Section>

      <Section title="Disabled">
        <SplitButton label="Save" disabled dropdownContent={<SaveOptions />} />
      </Section>
    </>
  );
};
