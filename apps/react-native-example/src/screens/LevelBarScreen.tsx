import { LevelBar, Text } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

export const LevelBarScreen = () => {
  return (
    <>
      <Section title="Basic" description="Continuous fill, default accent color">
        <LevelBar value={0.6} accessibilityLabel="Disk usage" />
      </Section>

      <Section title="Low/high offset zones" description="Warning at ≤25%, error at ≥75%">
        <View style={{ gap: 16 }}>
          <View style={{ gap: 4 }}>
            <Text variant="caption" color="dim">
              15% — low zone
            </Text>
            <LevelBar value={0.15} low={0.25} high={0.75} accessibilityLabel="Battery" />
          </View>
          <View style={{ gap: 4 }}>
            <Text variant="caption" color="dim">
              50% — normal zone
            </Text>
            <LevelBar value={0.5} low={0.25} high={0.75} accessibilityLabel="Battery" />
          </View>
          <View style={{ gap: 4 }}>
            <Text variant="caption" color="dim">
              90% — high zone
            </Text>
            <LevelBar value={0.9} low={0.25} high={0.75} accessibilityLabel="Battery" />
          </View>
        </View>
      </Section>

      <Section title="Discrete mode" description="Signal-strength style, 5 blocks">
        <LevelBar value={0.6} discrete numBlocks={5} accessibilityLabel="Signal strength" />
      </Section>

      <Section title="Custom range">
        <LevelBar value={150} min={0} max={200} accessibilityLabel="Storage (GB)" />
      </Section>
    </>
  );
};
