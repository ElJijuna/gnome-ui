import { BarChart } from '@gnome-ui/react-native-charts';

import { Section } from '../Section';

const TRAFFIC_DATA = [
  { month: 'Jan', users: 420, sessions: 680 },
  { month: 'Feb', users: 380, sessions: 590 },
  { month: 'Mar', users: 510, sessions: 740 },
  { month: 'Apr', users: 460, sessions: 700 },
  { month: 'May', users: 600, sessions: 860 },
];

export const BarChartScreen = () => {
  return (
    <>
      <Section title="Single series" description="One bar per category, default grid, no legend">
        <BarChart
          data={TRAFFIC_DATA}
          series={[{ dataKey: 'users', name: 'Users' }]}
          xAxisKey="month"
        />
      </Section>

      <Section
        title="Grouped multi-series with legend"
        description="Legend below the chart (default)"
      >
        <BarChart
          data={TRAFFIC_DATA}
          series={[
            { dataKey: 'users', name: 'Users' },
            { dataKey: 'sessions', name: 'Sessions' },
          ]}
          xAxisKey="month"
          showLegend
        />
      </Section>

      <Section title="Legend on the side" description='legendPosition="right"'>
        <BarChart
          data={TRAFFIC_DATA}
          series={[
            { dataKey: 'users', name: 'Users' },
            { dataKey: 'sessions', name: 'Sessions' },
          ]}
          xAxisKey="month"
          showLegend
          legendPosition="right"
          height={220}
        />
      </Section>

      <Section title="No grid" description="showGrid={false}">
        <BarChart
          data={TRAFFIC_DATA}
          series={[{ dataKey: 'users', name: 'Users', color: '#9141ac' }]}
          xAxisKey="month"
          showGrid={false}
          height={220}
        />
      </Section>
    </>
  );
};
