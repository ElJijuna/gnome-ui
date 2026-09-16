import { Button, Calendar, Text, useGnomeTheme } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const TODAY = new Date();

export const CalendarScreen = () => {
  const theme = useGnomeTheme();
  const [basic, setBasic] = useState<Date | null>(null);
  const [ranged, setRanged] = useState<Date | null>(TODAY);
  const [controlledMonth, setControlledMonth] = useState(new Date(TODAY.getFullYear(), 5, 1));

  return (
    <>
      <Section title="Basic" description="Uncontrolled selection, today ringed">
        <Calendar value={basic} onChange={setBasic} />
        <Text variant="caption" color="dim">
          value: {basic ? basic.toDateString() : 'none'}
        </Text>
      </Section>

      <Section
        title="min / max"
        description="Only the current calendar month's first half is selectable"
      >
        <Calendar
          value={ranged}
          onChange={setRanged}
          min={new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)}
          max={new Date(TODAY.getFullYear(), TODAY.getMonth(), 15)}
        />
        <Text variant="caption" color="dim">
          value: {ranged ? ranged.toDateString() : 'none'}
        </Text>
      </Section>

      <Section title="Week numbers" description="showWeekNumbers adds the ISO week column">
        <Calendar showWeekNumbers />
      </Section>

      <Section
        title="Controlled month"
        description="The app drives navigation; Calendar only reports intent"
      >
        <Calendar month={controlledMonth} onMonthChange={setControlledMonth} />
        <View style={{ flexDirection: 'row', gap: theme.space2, marginTop: theme.space2 }}>
          <Button
            variant="flat"
            onPress={() =>
              setControlledMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
            }
          >
            Back a month
          </Button>
          <Button
            variant="flat"
            onPress={() => setControlledMonth(new Date(TODAY.getFullYear(), 5, 1))}
          >
            Reset
          </Button>
        </View>
      </Section>

      <Section title="No heading" description="showHeading=false — a fixed month, no navigation">
        <Calendar showHeading={false} defaultMonth={TODAY} />
      </Section>

      <Section title="Sunday-first weeks" description="weekStartsOn={0}">
        <Calendar weekStartsOn={0} />
      </Section>

      <View style={{ height: 200 }} />
    </>
  );
};
