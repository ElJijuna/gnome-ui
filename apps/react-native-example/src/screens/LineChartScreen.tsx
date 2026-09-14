import { LineChart } from '@gnome-ui/react-native-charts';

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

export const LineChartScreen = () => {
  return (
    <>
      <Section title="Single series" description="One line, default grid, no legend">
        <LineChart data={CPU_DATA} series={[{ dataKey: 'cpu', name: 'CPU %' }]} xAxisKey="day" />
      </Section>

      <Section title="Multi-series with legend" description="Legend below the chart (default)">
        <LineChart
          data={CPU_DATA}
          series={[
            { dataKey: 'cpu', name: 'CPU %' },
            { dataKey: 'memory', name: 'Memory %' },
          ]}
          xAxisKey="day"
          showLegend
        />
      </Section>

      <Section title="Legend on the side" description='legendPosition="right"'>
        <LineChart
          data={CPU_DATA}
          series={[
            { dataKey: 'cpu', name: 'CPU %' },
            { dataKey: 'memory', name: 'Memory %' },
          ]}
          xAxisKey="day"
          showLegend
          legendPosition="right"
          height={220}
        />
      </Section>

      <Section title="No grid" description="showGrid={false}">
        <LineChart
          data={CPU_DATA}
          series={[{ dataKey: 'cpu', name: 'CPU %', color: '#9141ac' }]}
          xAxisKey="day"
          showGrid={false}
          height={220}
        />
      </Section>
    </>
  );
};
