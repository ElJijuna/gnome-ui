import { TreeMap } from '@gnome-ui/react-native-charts';

import { Section } from '../Section';

export const TreeMapScreen = () => {
  return (
    <>
      <Section title="Default" description="Grouped by browser vendor">
        <TreeMap
          data={[
            { label: 'Chrome', value: 6500, group: 'Desktop' },
            { label: 'Safari', value: 2100, group: 'Desktop' },
            { label: 'Firefox', value: 900, group: 'Desktop' },
            { label: 'Edge', value: 600, group: 'Desktop' },
            { label: 'Chrome Mobile', value: 4800, group: 'Mobile' },
            { label: 'Safari Mobile', value: 3200, group: 'Mobile' },
            { label: 'Samsung Internet', value: 700, group: 'Mobile' },
          ]}
          aria-label="Browser usage share"
        />
      </Section>

      <Section title="Ungrouped" description="No group — one color per item">
        <TreeMap
          data={[
            { label: 'Engineering', value: 42 },
            { label: 'Sales', value: 28 },
            { label: 'Marketing', value: 18 },
            { label: 'Support', value: 12 },
            { label: 'Ops', value: 8 },
          ]}
          height={280}
          aria-label="Headcount by department"
        />
      </Section>

      <Section title="No labels" description="showLabels={false}">
        <TreeMap
          data={[
            { label: 'A', value: 80 },
            { label: 'B', value: 55 },
            { label: 'C', value: 40 },
            { label: 'D', value: 25 },
            { label: 'E', value: 10 },
          ]}
          showLabels={false}
          height={240}
          aria-label="No labels"
        />
      </Section>
    </>
  );
};
