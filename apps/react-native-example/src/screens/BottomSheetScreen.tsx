import { BottomSheet, Button, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const BottomSheetScreen = () => {
  const [basicOpen, setBasicOpen] = useState(false);
  const [contentOpen, setContentOpen] = useState(false);
  const [noBackdropOpen, setNoBackdropOpen] = useState(false);

  return (
    <>
      <Section title="Basic" description="Drag the handle down past ~150px, or tap outside">
        <Button onPress={() => setBasicOpen(true)}>Open sheet</Button>
        <BottomSheet open={basicOpen} title="Options" onClose={() => setBasicOpen(false)}>
          <Text>This is a bottom sheet with a title and some content.</Text>
        </BottomSheet>
      </Section>

      <Section title="Rich content">
        <Button onPress={() => setContentOpen(true)}>Open with actions</Button>
        <BottomSheet open={contentOpen} title="Share" onClose={() => setContentOpen(false)}>
          <View style={{ gap: 8 }}>
            <Button variant="flat" onPress={() => setContentOpen(false)}>
              Copy link
            </Button>
            <Button variant="flat" onPress={() => setContentOpen(false)}>
              Send message
            </Button>
            <Button variant="destructive" onPress={() => setContentOpen(false)}>
              Delete
            </Button>
          </View>
        </BottomSheet>
      </Section>

      <Section
        title="closeOnBackdrop disabled"
        description="Must drag the handle or use the button"
      >
        <Button onPress={() => setNoBackdropOpen(true)}>Open (backdrop locked)</Button>
        <BottomSheet
          open={noBackdropOpen}
          title="Locked"
          closeOnBackdrop={false}
          onClose={() => setNoBackdropOpen(false)}
        >
          <View style={{ gap: 8 }}>
            <Text>Tapping the backdrop does nothing here.</Text>
            <Button onPress={() => setNoBackdropOpen(false)}>Close</Button>
          </View>
        </BottomSheet>
      </Section>
    </>
  );
};
