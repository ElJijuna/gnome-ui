import { PieChart } from '@gnome-ui/react-native-charts';

import { Section } from '../Section';

const BROWSER_SHARE = [
  { label: 'Chrome', value: 62 },
  { label: 'Safari', value: 20 },
  { label: 'Firefox', value: 10 },
  { label: 'Other', value: 8 },
];

export const PieChartScreen = () => {
  return (
    <>
      <Section title="Pie" description="Default palette, no legend">
        <PieChart data={BROWSER_SHARE} height={260} />
      </Section>

      <Section title="Donut with legend" description="donut, showLegend">
        <PieChart data={BROWSER_SHARE} donut showLegend height={260} />
      </Section>

      <Section title="Slice labels" description="showLabels — small slices skip their label">
        <PieChart data={BROWSER_SHARE} showLabels height={260} />
      </Section>

      <Section title="Legend on the side" description='legendPosition="right"'>
        <PieChart data={BROWSER_SHARE} donut showLegend legendPosition="right" height={220} />
      </Section>
    </>
  );
};
