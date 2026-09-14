import { SparkBarChart } from '@gnome-ui/react-native-charts';
import { Text, View } from 'react-native';

import { Section } from '../Section';

const TREND = [42, 58, 35, 72, 88, 93, 60, 75, 50, 66];
const HITS = [{ hits: 12 }, { hits: 28 }, { hits: 8 }, { hits: 40 }, { hits: 22 }];

export const SparkBarChartScreen = () => {
  return (
    <>
      <Section title="Plain number array" description="Accent-colored by default">
        <View style={{ width: 220 }}>
          <SparkBarChart data={TREND} aria-label="Weekly trend" />
        </View>
      </Section>

      <Section title="Object array with dataKey" description="Custom color and barSize">
        <View style={{ width: 220 }}>
          <SparkBarChart
            data={HITS}
            dataKey="hits"
            color="#e01b24"
            barSize={10}
            aria-label="Hits"
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
          <Text>Requests/day</Text>
          <View style={{ width: 100, flex: 1 }}>
            <SparkBarChart data={TREND} height={28} aria-label="Requests per day" />
          </View>
        </View>
      </Section>
    </>
  );
};
