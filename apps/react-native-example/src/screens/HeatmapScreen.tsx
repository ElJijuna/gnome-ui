import { Heatmap } from '@gnome-ui/react-native-charts';

import { Section } from '../Section';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const HOURS = ['9am', '12pm', '3pm', '6pm'];

const ACTIVITY = DAYS.flatMap((day, dayIndex) =>
  HOURS.map((hour, hourIndex) => ({
    row: day,
    column: hour,
    value: Math.round(10 + Math.abs(2 - hourIndex) * 8 + (dayIndex % 2) * 15 + dayIndex * 3),
  })),
);

const SPARSE = [
  { row: 'Team A', column: 'Q1', value: 82 },
  { row: 'Team A', column: 'Q2', value: 91 },
  { row: 'Team B', column: 'Q2', value: 40 },
  { row: 'Team B', column: 'Q3', value: 65 },
  { row: 'Team C', column: 'Q1', value: 12 },
  { row: 'Team C', column: 'Q3', value: 55 },
];

export const HeatmapScreen = () => {
  return (
    <>
      <Section title="Default" description="Weekly activity by day and hour">
        <Heatmap data={ACTIVITY} aria-label="Weekly activity" />
      </Section>

      <Section title="With values and legend" description="showValues, showLegend">
        <Heatmap data={ACTIVITY} showValues showLegend aria-label="Weekly activity with legend" />
      </Section>

      <Section title="Custom color" description="color prop">
        <Heatmap data={ACTIVITY} color="#9141ac" showLegend aria-label="Weekly activity, purple" />
      </Section>

      <Section
        title="Sparse data"
        description="Missing row/column combinations render as a placeholder"
      >
        <Heatmap data={SPARSE} showValues aria-label="Team scores by quarter" />
      </Section>
    </>
  );
};
