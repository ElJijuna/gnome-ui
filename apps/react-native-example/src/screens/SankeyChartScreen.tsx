import { SankeyChart } from '@gnome-ui/react-native-charts';

import { Section } from '../Section';

const FUNNEL_NODES = [
  { name: 'Visitors' },
  { name: 'Signups' },
  { name: 'Customers' },
  { name: 'Churn' },
];

const FUNNEL_LINKS = [
  { source: 'Visitors', target: 'Signups', value: 1000 },
  { source: 'Signups', target: 'Customers', value: 600 },
  { source: 'Signups', target: 'Churn', value: 400 },
];

export const SankeyChartScreen = () => {
  return (
    <>
      <Section title="Default" description="Simple sign-up funnel">
        <SankeyChart nodes={FUNNEL_NODES} links={FUNNEL_LINKS} aria-label="Sign-up funnel" />
      </Section>

      <Section title="Acquisition channels" description="Multiple sources, showValues">
        <SankeyChart
          nodes={[
            { name: 'Organic', color: '#2ec27e' },
            { name: 'Paid', color: '#ff7800' },
            { name: 'Referral', color: '#9141ac' },
            { name: 'Trial' },
            { name: 'Converted' },
            { name: 'Churned' },
          ]}
          links={[
            { source: 'Organic', target: 'Trial', value: 420 },
            { source: 'Paid', target: 'Trial', value: 260 },
            { source: 'Referral', target: 'Trial', value: 140 },
            { source: 'Trial', target: 'Converted', value: 480 },
            { source: 'Trial', target: 'Churned', value: 340 },
          ]}
          showValues
          aria-label="Acquisition channels"
        />
      </Section>

      <Section title="Wide nodes" description="nodeWidth={24}, nodePadding={32}">
        <SankeyChart
          nodes={FUNNEL_NODES}
          links={FUNNEL_LINKS}
          nodeWidth={24}
          nodePadding={32}
          aria-label="Wide nodes"
        />
      </Section>
    </>
  );
};
