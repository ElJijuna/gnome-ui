import { Button, Spacer, Text, useGnomeTheme } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

export const SpacerScreen = () => {
  const theme = useGnomeTheme();

  const row = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.cardBgColor,
    borderRadius: theme.radiusMd,
    padding: theme.space2,
  };

  return (
    <>
      <Section title="Without Spacer" description="Items sit next to each other">
        <View style={row}>
          <Text>Leading</Text>
          <Text>Trailing</Text>
        </View>
      </Section>

      <Section title="With one Spacer" description="Pushes everything after it to the end">
        <View style={row}>
          <Text>Leading</Text>
          <Spacer />
          <Text>Trailing</Text>
        </View>
      </Section>

      <Section title="With two Spacers" description="Centers the middle item">
        <View style={row}>
          <Text>Leading</Text>
          <Spacer />
          <Text>Centered</Text>
          <Spacer />
          <Text>Trailing</Text>
        </View>
      </Section>

      <Section title="Inside a row of Buttons" description="The most common real use">
        <View style={row}>
          <Button variant="flat">Cancel</Button>
          <Spacer />
          <Button variant="suggested">Save</Button>
        </View>
      </Section>
    </>
  );
};
