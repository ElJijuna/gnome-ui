import { Text } from '@gnome-ui/react-native';
import { SparkBulletChart } from '@gnome-ui/react-native-charts';
import { View } from 'react-native';

import { Section } from '../Section';

export const SparkBulletChartScreen = () => {
  return (
    <>
      <Section title="Default" description="value, target">
        <SparkBulletChart value={72} target={90} aria-label="Revenue" />
      </Section>

      <Section title="Custom colors" description="color, ranges with explicit color">
        <SparkBulletChart
          value={82}
          max={100}
          color="#e01b24"
          ranges={[
            { value: 60, color: '#2ec27e' },
            { value: 85, color: '#f6d32d' },
            { value: 100, color: '#e01b24' },
          ]}
          aria-label="CPU usage"
        />
      </Section>

      <Section title="Stacked KPIs" description="Multiple tracks, one per row">
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ width: 48 }}>Q1</Text>
            <View style={{ flex: 1 }}>
              <SparkBulletChart value={68} target={80} aria-label="Q1" />
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ width: 48 }}>Q2</Text>
            <View style={{ flex: 1 }}>
              <SparkBulletChart value={91} target={80} color="#2ec27e" aria-label="Q2" />
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ width: 48 }}>Q3</Text>
            <View style={{ flex: 1 }}>
              <SparkBulletChart value={45} target={80} color="#f6d32d" aria-label="Q3" />
            </View>
          </View>
        </View>
      </Section>

      <Section title="Custom height" description="height prop">
        <SparkBulletChart value={55} target={70} height={8} aria-label="Compact" />
      </Section>
    </>
  );
};
