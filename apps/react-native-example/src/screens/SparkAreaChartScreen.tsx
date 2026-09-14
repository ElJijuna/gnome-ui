import { SparkAreaChart } from '@gnome-ui/react-native-charts';
import { Text, View } from 'react-native';

import { Section } from '../Section';

const TREND = [42, 58, 35, 72, 88, 93, 60, 75, 50, 66];
const TRAFFIC = [
  { up: 42, down: 18 },
  { up: 58, down: 24 },
  { up: 35, down: 30 },
  { up: 72, down: 45 },
  { up: 88, down: 52 },
];

export const SparkAreaChartScreen = () => {
  return (
    <>
      <Section title="Gradient fill (default)" description="Accent-colored, fades to transparent">
        <View style={{ width: 220 }}>
          <SparkAreaChart data={TREND} aria-label="Weekly trend" />
        </View>
      </Section>

      <Section title="Flat fill" description="gradient={false}, custom color">
        <View style={{ width: 220 }}>
          <SparkAreaChart
            data={TRAFFIC}
            dataKey="up"
            color="#2ec27e"
            gradient={false}
            aria-label="Up"
          />
        </View>
      </Section>

      <Section title="Multiple series" description="series prop, one area each">
        <View style={{ width: 220 }}>
          <SparkAreaChart
            data={TRAFFIC}
            series={[{ key: 'up' }, { key: 'down', color: '#e01b24' }]}
            aria-label="Up vs down"
          />
        </View>
      </Section>

      <Section
        title="Inline in a row"
        description="Meant to sit beside other content, like a table cell"
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: '#deddda',
            borderRadius: 8,
          }}
        >
          <Text>CPU usage</Text>
          <View style={{ width: 100, flex: 1 }}>
            <SparkAreaChart data={TREND} height={28} aria-label="CPU usage trend" />
          </View>
        </View>
      </Section>
    </>
  );
};
