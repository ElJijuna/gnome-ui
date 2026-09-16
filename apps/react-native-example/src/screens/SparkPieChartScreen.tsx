import { SparkPieChart } from '@gnome-ui/react-native-charts';
import { View } from 'react-native';

import { Section } from '../Section';

const BREAKDOWN = [{ value: 40 }, { value: 30 }, { value: 20 }, { value: 10 }];

export const SparkPieChartScreen = () => {
  return (
    <>
      <Section title="Default" description="A small pie breakdown">
        <SparkPieChart data={BREAKDOWN} aria-label="Revenue breakdown" />
      </Section>

      <Section title="Donut" description="donut prop">
        <SparkPieChart data={BREAKDOWN} donut aria-label="Revenue breakdown, donut" />
      </Section>

      <Section title="Custom colors" description="explicit color per slice">
        <SparkPieChart
          data={[
            { value: 60, color: '#e01b24' },
            { value: 40, color: '#2ec27e' },
          ]}
          donut
          aria-label="Pass/fail rate"
        />
      </Section>

      <Section title="No padding" description="paddingAngle={0}">
        <SparkPieChart data={BREAKDOWN} paddingAngle={0} aria-label="No gap between slices" />
      </Section>

      <Section title="Single slice" description="paddingAngle is ignored for one item">
        <SparkPieChart data={[{ value: 1 }]} aria-label="Single slice" />
      </Section>

      <Section title="Sizes" description="size prop">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <SparkPieChart data={BREAKDOWN} size={20} aria-label="Small" />
          <SparkPieChart data={BREAKDOWN} size={40} aria-label="Default" />
          <SparkPieChart data={BREAKDOWN} size={72} aria-label="Large" />
        </View>
      </Section>
    </>
  );
};
