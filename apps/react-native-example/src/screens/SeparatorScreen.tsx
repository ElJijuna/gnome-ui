import { Separator, Text } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

export const SeparatorScreen = () => {
  return (
    <>
      <Section title="Horizontal">
        <View style={{ gap: 12 }}>
          <Text>Above the separator</Text>
          <Separator />
          <Text>Below the separator</Text>
        </View>
      </Section>

      <Section title="Vertical">
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 32, gap: 12 }}>
          <Text>Left</Text>
          <Separator orientation="vertical" />
          <Text>Right</Text>
        </View>
      </Section>
    </>
  );
};
