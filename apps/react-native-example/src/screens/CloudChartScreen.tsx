import { CloudChart } from '@gnome-ui/react-native-charts';

import { Section } from '../Section';

const TECH_TAGS = [
  { text: 'React', value: 90 },
  { text: 'TypeScript', value: 82 },
  { text: 'GNOME', value: 55 },
  { text: 'Skia', value: 48 },
  { text: 'Expo', value: 40 },
  { text: 'Adwaita', value: 35 },
  { text: 'Victory', value: 28 },
  { text: 'Turborepo', value: 20 },
  { text: 'Jest', value: 15 },
];

export const CloudChartScreen = () => {
  return (
    <>
      <Section title="Default" description="Font size scaled by value (12-48)">
        <CloudChart data={TECH_TAGS} height={220} />
      </Section>

      <Section title="Custom size range" description="minFontSize=16, maxFontSize=64">
        <CloudChart data={TECH_TAGS} minFontSize={16} maxFontSize={64} height={260} />
      </Section>

      <Section title="Custom colors" description="color overridden per item">
        <CloudChart
          data={[
            { text: 'Urgent', value: 90, color: '#e01b24' },
            { text: 'Important', value: 60, color: '#ff7800' },
            { text: 'Normal', value: 30, color: '#3584e4' },
          ]}
          height={160}
        />
      </Section>
    </>
  );
};
