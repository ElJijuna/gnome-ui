import { AreaChart } from '@gnome-ui/react-native-charts';

import { Section } from '../Section';

const CPU_DATA = [
  { day: 'Mon', cpu: 42, memory: 68 },
  { day: 'Tue', cpu: 55, memory: 72 },
  { day: 'Wed', cpu: 38, memory: 65 },
  { day: 'Thu', cpu: 61, memory: 80 },
  { day: 'Fri', cpu: 49, memory: 74 },
  { day: 'Sat', cpu: 33, memory: 58 },
  { day: 'Sun', cpu: 29, memory: 55 },
];

export const AreaChartScreen = () => {
  return (
    <>
      <Section title="Single series" description="Flat tint fill (default), no legend">
        <AreaChart data={CPU_DATA} series={[{ dataKey: 'cpu', name: 'CPU %' }]} xAxisKey="day" />
      </Section>

      <Section title="Gradient fill" description="gradient, fades to transparent">
        <AreaChart
          data={CPU_DATA}
          series={[{ dataKey: 'cpu', name: 'CPU %' }]}
          xAxisKey="day"
          gradient
        />
      </Section>

      <Section title="Overlapping multi-series" description="Legend below the chart (default)">
        <AreaChart
          data={CPU_DATA}
          series={[
            { dataKey: 'cpu', name: 'CPU %' },
            { dataKey: 'memory', name: 'Memory %' },
          ]}
          xAxisKey="day"
          showLegend
        />
      </Section>

      <Section title="Stacked" description="stacked, gradient — legend on the right">
        <AreaChart
          data={CPU_DATA}
          series={[
            { dataKey: 'cpu', name: 'CPU %' },
            { dataKey: 'memory', name: 'Memory %' },
          ]}
          xAxisKey="day"
          stacked
          gradient
          showLegend
          legendPosition="right"
          height={220}
        />
      </Section>
    </>
  );
};
