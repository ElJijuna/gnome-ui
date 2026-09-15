import { BulletChart } from '@gnome-ui/react-native-charts';
import { View } from 'react-native';

import { Section } from '../Section';

export const BulletChartScreen = () => {
  return (
    <>
      <Section title="Default" description="value, target, ranges">
        <BulletChart
          label="Revenue"
          value={72}
          target={90}
          ranges={[{ value: 50 }, { value: 75 }, { value: 100 }]}
          aria-label="Revenue"
        />
      </Section>

      <Section title="Custom colors" description="color, ranges with explicit color">
        <BulletChart
          label="CPU"
          value={82}
          max={100}
          color="#e01b24"
          ranges={[
            { value: 60, color: '#2ec27e' },
            { value: 85, color: '#f6d32d' },
            { value: 100, color: '#e01b24' },
          ]}
          aria-label="CPU usage"
        />
      </Section>

      <Section title="Stacked KPIs" description="Multiple charts, no label column">
        <View style={{ gap: 12 }}>
          <BulletChart value={68} target={80} aria-label="Q1" />
          <BulletChart value={91} target={80} color="#2ec27e" aria-label="Q2" />
          <BulletChart value={45} target={80} color="#f6d32d" aria-label="Q3" />
        </View>
      </Section>

      <Section title="No value" description="showValue={false}">
        <BulletChart value={55} target={70} showValue={false} height={20} aria-label="Compact" />
      </Section>
    </>
  );
};
