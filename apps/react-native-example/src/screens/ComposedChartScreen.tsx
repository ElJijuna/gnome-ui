import { ComposedChart } from '@gnome-ui/react-native-charts';

import { Section } from '../Section';

const MONTHLY = [
  { month: 'Jan', revenue: 4000, target: 3800, expenses: 2800 },
  { month: 'Feb', revenue: 4500, target: 4000, expenses: 3100 },
  { month: 'Mar', revenue: 4100, target: 4200, expenses: 3300 },
  { month: 'Apr', revenue: 5200, target: 4400, expenses: 3600 },
  { month: 'May', revenue: 5600, target: 4600, expenses: 3900 },
];

export const ComposedChartScreen = () => {
  return (
    <>
      <Section title="Bar + line" description="Revenue bars with a target-line overlay">
        <ComposedChart
          data={MONTHLY}
          series={[
            { dataKey: 'revenue', type: 'bar', name: 'Revenue' },
            { dataKey: 'target', type: 'line', name: 'Target' },
          ]}
          xAxisKey="month"
          height={280}
          showLegend
          aria-label="Revenue vs target"
        />
      </Section>

      <Section title="Bar + area + line" description="All three series types combined">
        <ComposedChart
          data={MONTHLY}
          series={[
            { dataKey: 'revenue', type: 'bar', name: 'Revenue' },
            { dataKey: 'expenses', type: 'area', name: 'Expenses' },
            { dataKey: 'target', type: 'line', name: 'Target' },
          ]}
          xAxisKey="month"
          height={280}
          showLegend
          legendPosition="right"
          aria-label="Revenue, expenses, and target"
        />
      </Section>

      <Section title="No grid" description="showGrid={false}">
        <ComposedChart
          data={MONTHLY}
          series={[
            { dataKey: 'revenue', type: 'bar', name: 'Revenue' },
            { dataKey: 'target', type: 'line', name: 'Target' },
          ]}
          xAxisKey="month"
          height={220}
          showGrid={false}
          aria-label="Revenue vs target, no grid"
        />
      </Section>
    </>
  );
};
