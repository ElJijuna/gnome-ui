import { FunnelChart } from '@gnome-ui/react-native-charts';

import { Section } from '../Section';

const SIGNUP_FUNNEL = [
  { name: 'Visitors', value: 1000 },
  { name: 'Signups', value: 400 },
  { name: 'Trials', value: 220 },
  { name: 'Purchases', value: 90 },
];

export const FunnelChartScreen = () => {
  return (
    <>
      <Section title="Default" description="Labels centered in each segment (default)">
        <FunnelChart data={SIGNUP_FUNNEL} height={280} aria-label="Signup funnel" />
      </Section>

      <Section title="No labels" description="showLabels={false}">
        <FunnelChart data={SIGNUP_FUNNEL} showLabels={false} height={220} aria-label="No labels" />
      </Section>

      <Section title="Custom colors" description="color overridden per item">
        <FunnelChart
          data={[
            { name: 'Leads', value: 500, color: '#3584e4' },
            { name: 'Qualified', value: 260, color: '#9141ac' },
            { name: 'Won', value: 80, color: '#2ec27e' },
          ]}
          height={220}
          aria-label="Sales funnel"
        />
      </Section>
    </>
  );
};
