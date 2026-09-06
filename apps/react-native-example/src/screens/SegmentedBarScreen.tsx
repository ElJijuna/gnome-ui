import { SegmentedBar, Text } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

export const SegmentedBarScreen = () => {
  return (
    <>
      <Section title="Repository language distribution" description="Custom colors per segment">
        <SegmentedBar
          values={[
            { label: 'TypeScript', value: 60, color: '#3178c6' },
            { label: 'JavaScript', value: 30, color: '#f7df1e' },
            { label: 'CSS', value: 10, color: '#563d7c' },
          ]}
        />
      </Section>

      <Section title="Default palette" description="Cycles through GNOME's design tokens">
        <SegmentedBar
          values={[
            { label: 'A', value: 40 },
            { label: 'B', value: 35 },
            { label: 'C', value: 15 },
            { label: 'D', value: 10 },
          ]}
        />
      </Section>

      <Section title="Normalized" description="Values that don't sum to 100 are redistributed">
        <View style={{ gap: 4 }}>
          <Text variant="caption" color="dim">
            1 / 3 split — each segment still takes its proportional share
          </Text>
          <SegmentedBar
            values={[
              { label: 'A', value: 1 },
              { label: 'B', value: 3 },
            ]}
          />
        </View>
      </Section>

      <Section title="Touch to highlight" description="Press and hold a segment for its tooltip">
        <SegmentedBar
          accessibilityLabel="Storage breakdown"
          values={[
            { label: 'Photos', value: 45 },
            { label: 'Apps', value: 30 },
            { label: 'Documents', value: 15 },
            { label: 'Other', value: 10 },
          ]}
        />
      </Section>
    </>
  );
};
