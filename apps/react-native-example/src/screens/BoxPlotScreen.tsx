import { BoxPlot } from '@gnome-ui/react-native-charts';

import { Section } from '../Section';

const RESPONSE_TIMES = [
  { label: 'API', values: [120, 135, 128, 150, 142, 118, 310, 133, 145, 127] },
  { label: 'DB', values: [45, 52, 48, 61, 55, 44, 58, 49, 205, 53] },
  { label: 'Cache', values: [3, 4, 3, 5, 4, 3, 4, 6, 3, 4] },
];

export const BoxPlotScreen = () => {
  return (
    <>
      <Section title="Default" description="Response times (ms) per service, with outliers">
        <BoxPlot data={RESPONSE_TIMES} height={260} aria-label="Response times" />
      </Section>

      <Section title="No outliers" description="showOutliers={false}">
        <BoxPlot
          data={RESPONSE_TIMES}
          height={260}
          showOutliers={false}
          aria-label="Response times, no outliers"
        />
      </Section>

      <Section title="Precomputed stats" description="Skips the automatic quartile computation">
        <BoxPlot
          data={[
            { label: 'Team A', min: 9, q1: 13, median: 15.5, q3: 19, max: 22, outliers: [31] },
            { label: 'Team B', min: 7, q1: 8.5, median: 10, q3: 11.5, max: 14 },
            { label: 'Team C', min: 20, q1: 24, median: 27, q3: 31, max: 36 },
          ]}
          height={260}
          aria-label="Team scores"
        />
      </Section>

      <Section title="Custom colors and formatting" description="Explicit per-item color">
        <BoxPlot
          data={[
            { label: 'API', values: RESPONSE_TIMES[0]!.values, color: '#3584e4' },
            { label: 'DB', values: RESPONSE_TIMES[1]!.values, color: '#9141ac' },
          ]}
          height={220}
          valueFormatter={(v) => `${v}ms`}
          aria-label="Response times, custom colors"
        />
      </Section>

      <Section title="Single item" description="One group, no crowding">
        <BoxPlot data={[RESPONSE_TIMES[0]!]} height={220} aria-label="API response time" />
      </Section>
    </>
  );
};
