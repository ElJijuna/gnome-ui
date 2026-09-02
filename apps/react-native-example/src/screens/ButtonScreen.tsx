import { Button, type ButtonVariant, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const VARIANTS: ButtonVariant[] = ['default', 'suggested', 'destructive', 'flat'];

export const ButtonScreen = () => {
  const [pressCount, setPressCount] = useState(0);

  return (
    <>
      <Section title="Variants">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} onPress={() => setPressCount((c) => c + 1)}>
              {variant}
            </Button>
          ))}
        </View>
        <Text variant="caption" color="dim">
          {`Pressed ${pressCount} time${pressCount === 1 ? '' : 's'}`}
        </Text>
      </Section>

      <Section title="Sizes">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </View>
      </Section>

      <Section title="Shapes">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Button shape="default">Default</Button>
          <Button shape="pill" variant="suggested">
            Pill
          </Button>
          <Button shape="circular" variant="flat">
            {'+'}
          </Button>
        </View>
      </Section>

      <Section title="Disabled">
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button disabled>Default</Button>
          <Button disabled variant="suggested">
            Suggested
          </Button>
        </View>
      </Section>

      <Section title="OSD" description="Overlay style for buttons placed on top of media">
        <View style={{ backgroundColor: '#111', padding: 16, borderRadius: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button osd>Play</Button>
            <Button osd shape="circular">
              {'⏸'}
            </Button>
          </View>
        </View>
      </Section>
    </>
  );
};
