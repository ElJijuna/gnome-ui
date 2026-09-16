import { Text } from '@gnome-ui/react-native';
import { SparkGaugeChart } from '@gnome-ui/react-native-charts';
import { View } from 'react-native';

import { Section } from '../Section';

const THRESHOLDS = [
  { value: 0, color: '#2ec27e' },
  { value: 50, color: '#f6d32d' },
  { value: 80, color: '#e01b24' },
];

export const SparkGaugeChartScreen = () => {
  return (
    <>
      <Section title="Default" description="A single ring against a min/max range">
        <SparkGaugeChart value={62} aria-label="CPU usage" />
      </Section>

      <Section title="Custom colors" description="explicit color prop">
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <SparkGaugeChart value={82} color="#e01b24" aria-label="Disk usage, red" />
          <SparkGaugeChart value={45} color="#2ec27e" aria-label="Memory usage, green" />
        </View>
      </Section>

      <Section title="Thresholds" description="Ascending value/color status bands">
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <SparkGaugeChart value={30} thresholds={THRESHOLDS} aria-label="CPU 30 percent" />
            <Text>CPU 30%</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <SparkGaugeChart value={65} thresholds={THRESHOLDS} aria-label="CPU 65 percent" />
            <Text>CPU 65%</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <SparkGaugeChart value={92} thresholds={THRESHOLDS} aria-label="CPU 92 percent" />
            <Text>CPU 92%</Text>
          </View>
        </View>
      </Section>

      <Section title="Sizes" description="size and strokeWidth">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <SparkGaugeChart value={70} size={20} strokeWidth={3} aria-label="Small" />
          <SparkGaugeChart value={70} size={40} strokeWidth={4} aria-label="Default" />
          <SparkGaugeChart value={70} size={72} strokeWidth={6} aria-label="Large" />
        </View>
      </Section>
    </>
  );
};
