import { Button, Overlay, Text, useGnomeTheme } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const OverlayScreen = () => {
  const theme = useGnomeTheme();
  const [open, setOpen] = useState(false);

  return (
    <Section
      title="Custom overlay UI"
      description="Deliberately minimal — no card, no title, no focus trap. Bring your own content and styling; tap the backdrop (not the card) to dismiss."
    >
      <Button onPress={() => setOpen(true)}>Open custom overlay</Button>

      <Overlay open={open} onDismiss={() => setOpen(false)}>
        <View
          style={{
            width: 260,
            padding: theme.space4,
            borderRadius: theme.radiusLg,
            backgroundColor: theme.cardBgColor,
            gap: theme.space2,
          }}
        >
          <Text variant="title-4">Custom content</Text>
          <Text variant="body" color="dim">
            This card is authored entirely by the consumer — Overlay only provides the fade and the
            backdrop dismiss.
          </Text>
          <Button variant="suggested" onPress={() => setOpen(false)}>
            Done
          </Button>
        </View>
      </Overlay>
    </Section>
  );
};
