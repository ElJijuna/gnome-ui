import { ScatterChart } from '@gnome-ui/react-native-charts';

import { Section } from '../Section';

const GROUP_A = [
  { hours: 1, score: 40 },
  { hours: 2, score: 55 },
  { hours: 3, score: 58 },
  { hours: 4, score: 70 },
  { hours: 5, score: 66 },
];
const GROUP_B = [
  { hours: 1, score: 30 },
  { hours: 2, score: 42 },
  { hours: 3, score: 50 },
  { hours: 4, score: 48 },
  { hours: 5, score: 60 },
];

const BUBBLES = [
  { revenue: 20, growth: 30, employees: 50 },
  { revenue: 40, growth: 55, employees: 200 },
  { revenue: 60, growth: 25, employees: 900 },
  { revenue: 80, growth: 70, employees: 400 },
  { revenue: 30, growth: 45, employees: 1200 },
];

export const ScatterChartScreen = () => {
  return (
    <>
      <Section title="Single series" description="Custom xKey/yKey, no legend">
        <ScatterChart series={[{ data: GROUP_A, xKey: 'hours', yKey: 'score' }]} />
      </Section>

      <Section title="Multiple series with legend" description="Legend below the chart (default)">
        <ScatterChart
          series={[
            { data: GROUP_A, xKey: 'hours', yKey: 'score', name: 'Group A' },
            { data: GROUP_B, xKey: 'hours', yKey: 'score', name: 'Group B' },
          ]}
          showLegend
        />
      </Section>

      <Section title="Bubble sizing" description="zKey sizes each dot — legend on the right">
        <ScatterChart
          series={[
            {
              data: BUBBLES,
              xKey: 'revenue',
              yKey: 'growth',
              zKey: 'employees',
              name: 'Companies',
              color: '#9141ac',
            },
          ]}
          showLegend
          legendPosition="right"
          height={240}
        />
      </Section>

      <Section title="No grid" description="showGrid={false}">
        <ScatterChart
          series={[{ data: GROUP_A, xKey: 'hours', yKey: 'score', color: '#2ec27e' }]}
          showGrid={false}
          height={220}
        />
      </Section>
    </>
  );
};
