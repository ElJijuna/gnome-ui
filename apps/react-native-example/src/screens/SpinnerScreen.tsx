import { Spinner, Text } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

export const SpinnerScreen = () => {
  return (
    <>
      <Section title="Sizes">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Spinner size="sm" />
            <Text variant="caption" color="dim">
              sm
            </Text>
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Spinner size="md" />
            <Text variant="caption" color="dim">
              md
            </Text>
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Spinner size="lg" />
            <Text variant="caption" color="dim">
              lg
            </Text>
          </View>
        </View>
      </Section>

      <Section title="With a label" description="Rendered alongside the spinner, not by it">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Spinner label="" />
          <Text color="dim">Fetching updates…</Text>
        </View>
      </Section>

      <Section title="Custom accessible label">
        <Spinner label="Syncing your library…" />
      </Section>
    </>
  );
};
