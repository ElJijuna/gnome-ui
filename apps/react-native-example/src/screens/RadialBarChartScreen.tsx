import { RadialBarChart } from '@gnome-ui/react-native-charts';

import { Section } from '../Section';

const RESOURCE_USAGE = [
  { label: 'CPU', value: 62 },
  { label: 'Memory', value: 80 },
  { label: 'Disk', value: 35 },
];

export const RadialBarChartScreen = () => {
  return (
    <>
      <Section title="Rings" description="Default palette, no legend">
        <RadialBarChart data={RESOURCE_USAGE} height={220} />
      </Section>

      <Section title="With labels and legend" description="showLabels, showLegend">
        <RadialBarChart data={RESOURCE_USAGE} showLabels showLegend height={240} />
      </Section>

      <Section title="Thicker rings" description='innerRadius="10%"'>
        <RadialBarChart data={RESOURCE_USAGE} innerRadius="10%" height={220} />
      </Section>

      <Section title="Legend on the side" description='legendPosition="right"'>
        <RadialBarChart data={RESOURCE_USAGE} showLegend legendPosition="right" height={200} />
      </Section>
    </>
  );
};
