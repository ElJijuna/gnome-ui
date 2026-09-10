import { Bin, Text } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

export const BinScreen = () => {
  return (
    <>
      <Section title="Passthrough" description="Renders its child, nothing else">
        <Bin>
          <Text>Just a child, no chrome of its own</Text>
        </Bin>
      </Section>

      <Section
        title="Applying layout constraints"
        description="No styling of its own — whatever you pass via style is all it adds"
      >
        <Bin style={{ maxWidth: 220, padding: 12, borderWidth: 1, borderColor: '#c0c0c0' }}>
          <Text>
            This text wraps at 220dp because the Bin around it was given a maxWidth — the border
            here comes entirely from the style prop, not from Bin itself.
          </Text>
        </Bin>
      </Section>

      <Section title="As a neutral base" description="A custom card built on top of Bin">
        <Bin
          style={{ backgroundColor: '#3584e4', borderRadius: 8, padding: 16 }}
          accessibilityLabel="Accent card"
        >
          <Text style={{ color: 'white' }}>Custom chrome, supplied entirely by the consumer</Text>
        </Bin>
      </Section>

      <View style={{ height: 200 }} />
    </>
  );
};
