import { SparkLineChart } from '@gnome-ui/react-native-charts';
import { Text, View } from 'react-native';

import { Section } from '../Section';

const TREND = [42, 58, 35, 72, 88, 93, 60, 75, 50, 66];
const TRAFFIC = [
  { sent: 42, received: 18 },
  { sent: 58, received: 24 },
  { sent: 35, received: 30 },
  { sent: 72, received: 45 },
  { sent: 88, received: 52 },
];

export const SparkLineChartScreen = () => {
  return (
    <>
      <Section title="Plain number array" description="Accent-colored by default">
        <View style={{ width: 220 }}>
          <SparkLineChart data={TREND} aria-label="Weekly trend" />
        </View>
      </Section>

      <Section title="Object array with dataKey" description="Custom color">
        <View style={{ width: 220 }}>
          <SparkLineChart data={TRAFFIC} dataKey="sent" color="#2ec27e" aria-label="Sent" />
        </View>
      </Section>

      <Section title="Multiple series" description="series prop, one line each">
        <View style={{ width: 220 }}>
          <SparkLineChart
            data={TRAFFIC}
            series={[{ key: 'sent' }, { key: 'received', color: '#e01b24' }]}
            aria-label="Sent vs received"
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
            <SparkLineChart data={TREND} height={28} aria-label="CPU usage trend" />
          </View>
        </View>
      </Section>
    </>
  );
};
