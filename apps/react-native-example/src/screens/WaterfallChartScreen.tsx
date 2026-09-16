import { WaterfallChart } from '@gnome-ui/react-native-charts';

import { Section } from '../Section';

// Shorter category labels than the web version's demo (`Starting revenue`/
// `Ending revenue`) — a phone-width x-axis has far less room per category
// than a desktop Storybook canvas, and the full-length labels overlapped
// their neighbors on-device. Same "adapt demo data to the screen, not the
// component" call ComposedChart's own demo made for its series magnitudes.
const REVENUE_BRIDGE = [
  { label: 'Start', value: 42000, isTotal: true },
  { label: 'New sales', value: 12000 },
  { label: 'Upsells', value: 4000 },
  { label: 'Churn', value: -6000 },
  { label: 'Refunds', value: -1500 },
  { label: 'End', value: 50500, isTotal: true },
];

const BUDGET_BREAKDOWN = [
  { label: 'Budget', value: 100000, isTotal: true },
  { label: 'Eng', value: -45000 },
  { label: 'Marketing', value: -22000 },
  { label: 'Ops', value: -18000 },
  { label: 'Left', value: 15000, isTotal: true },
];

export const WaterfallChartScreen = () => {
  return (
    <>
      <Section title="Default" description="Revenue bridge with values shown">
        <WaterfallChart data={REVENUE_BRIDGE} showValues aria-label="Revenue bridge" />
      </Section>

      <Section title="No grid" description="showGrid={false}">
        <WaterfallChart
          data={REVENUE_BRIDGE}
          showGrid={false}
          showValues
          aria-label="Revenue bridge, no grid"
        />
      </Section>

      <Section
        title="Custom colors and formatting"
        description="increaseColor/decreaseColor/totalColor"
      >
        <WaterfallChart
          data={REVENUE_BRIDGE}
          increaseColor="#3584e4"
          decreaseColor="#ff7800"
          totalColor="#9141ac"
          showValues
          valueFormatter={(v) => `$${v.toLocaleString()}`}
          aria-label="Revenue bridge, custom colors"
        />
      </Section>

      <Section title="Budget breakdown" description="A different bridge, no custom colors">
        <WaterfallChart data={BUDGET_BREAKDOWN} showValues aria-label="Budget breakdown" />
      </Section>
    </>
  );
};
