import { DatePicker, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const TODAY = new Date();

export const DatePickerScreen = () => {
  const [basic, setBasic] = useState<Date | null>(null);
  const [ranged, setRanged] = useState<Date | null>(null);
  const [time24, setTime24] = useState<Date | null>(
    new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate(), 9, 30),
  );
  const [time12, setTime12] = useState<Date | null>(null);
  const [controlled, setControlled] = useState<Date | null>(TODAY);

  return (
    <>
      <Section
        title="Basic"
        description="Uncontrolled — a Popover-anchored Calendar behind a text trigger"
      >
        <DatePicker label="Date" placeholder="Select a date" value={basic} onChange={setBasic} />
        <Text variant="caption" color="dim">
          value: {basic ? basic.toDateString() : 'none'}
        </Text>
      </Section>

      <Section title="min / max" description="Only the current month's first half is selectable">
        <DatePicker
          label="Appointment"
          value={ranged}
          onChange={setRanged}
          min={new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)}
          max={new Date(TODAY.getFullYear(), TODAY.getMonth(), 15)}
        />
      </Section>

      <Section title="Controlled value" description="The app owns the selected date">
        <DatePicker label="Delivery date" value={controlled} onChange={setControlled} />
        <Text variant="caption" color="dim">
          value: {controlled ? controlled.toDateString() : 'none'}
        </Text>
      </Section>

      <Section
        title="showTime — 24-hour"
        description="Picking a day keeps the popover open; only Done closes it"
      >
        <DatePicker label="Meeting time" showTime value={time24} onChange={setTime24} />
      </Section>

      <Section title="showTime — 12-hour" description="hourCycle={12} adds an AM/PM column">
        <DatePicker
          label="Reminder"
          showTime
          hourCycle={12}
          value={time12}
          onChange={setTime12}
          placement="top"
        />
      </Section>

      <Section title="showWeekNumbers" description="Passed straight through to the panel Calendar">
        <DatePicker label="Week-numbered" showWeekNumbers />
      </Section>

      <Section title="Disabled" description="disabled — the trigger can't be pressed">
        <DatePicker label="Locked" defaultValue={TODAY} disabled />
      </Section>

      <View style={{ height: 260 }} />
    </>
  );
};
