import { CalendarRange, type DateRange, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const TODAY = new Date();

const rangeLabel = (range: DateRange | null) =>
  range?.start && range.end
    ? `${range.start.toDateString()} – ${range.end.toDateString()}`
    : range?.start
      ? `${range.start.toDateString()} – (choose an end date)`
      : 'none';

export const CalendarRangeScreen = () => {
  const [basic, setBasic] = useState<DateRange | null>(null);
  const [limited, setLimited] = useState<DateRange | null>(null);
  const [controlled, setControlled] = useState<DateRange>({
    start: TODAY,
    end: new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 4),
  });

  return (
    <>
      <Section
        title="Basic"
        description="Tap a start day, then an end day — onChange only fires once both are picked"
      >
        <CalendarRange value={basic} onChange={setBasic} />
        <Text variant="caption" color="dim">
          value: {rangeLabel(basic)}
        </Text>
      </Section>

      <Section title="minRange / maxRange" description="Between 2 and 5 days, inclusive">
        <CalendarRange minRange={2} maxRange={5} value={limited} onChange={setLimited} />
        <Text variant="caption" color="dim">
          value: {rangeLabel(limited)}
        </Text>
      </Section>

      <Section title="Controlled value" description="The app owns the selected range">
        <CalendarRange value={controlled} onChange={setControlled} />
        <Text variant="caption" color="dim">
          value: {rangeLabel(controlled)}
        </Text>
      </Section>

      <Section title="min / max" description="Only the current month is selectable">
        <CalendarRange
          min={new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)}
          max={new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0)}
        />
      </Section>

      <Section title="Week numbers" description="showWeekNumbers adds the ISO week column">
        <CalendarRange showWeekNumbers />
      </Section>

      <View style={{ height: 260 }} />
    </>
  );
};
