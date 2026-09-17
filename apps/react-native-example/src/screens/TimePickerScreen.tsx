import { Text, TimePicker, type TimeValue } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const timeLabel = (value: TimeValue | null) =>
  value
    ? `${String(value.hours).padStart(2, '0')}:${String(value.minutes).padStart(2, '0')}`
    : 'none';

export const TimePickerScreen = () => {
  const [basic, setBasic] = useState<TimeValue | null>(null);
  const [minuteStep, setMinuteStep] = useState<TimeValue | null>({ hours: 9, minutes: 0 });
  const [twelveHour, setTwelveHour] = useState<TimeValue | null>({ hours: 14, minutes: 30 });
  const [controlled, setControlled] = useState<TimeValue | null>({ hours: 8, minutes: 0 });

  return (
    <>
      <Section
        title="Basic"
        description="Uncontrolled — paired SpinButton columns behind a text trigger, 24-hour by default"
      >
        <TimePicker label="Time" placeholder="Select a time" value={basic} onChange={setBasic} />
        <Text variant="caption" color="dim">
          value: {timeLabel(basic)}
        </Text>
      </Section>

      <Section title="12-hour" description="hourCycle={12} adds an AM/PM column">
        <TimePicker label="Reminder" hourCycle={12} value={twelveHour} onChange={setTwelveHour} />
      </Section>

      <Section title="minuteStep" description="Minutes step by 5 instead of 1">
        <TimePicker
          label="Alarm"
          minuteStep={5}
          value={minuteStep}
          onChange={setMinuteStep}
          placement="top"
        />
      </Section>

      <Section title="Controlled value" description="The app owns the selected time">
        <TimePicker label="Departure" value={controlled} onChange={setControlled} />
        <Text variant="caption" color="dim">
          value: {timeLabel(controlled)}
        </Text>
      </Section>

      <Section title="Disabled" description="disabled — the trigger can't be pressed">
        <TimePicker label="Locked" defaultValue={{ hours: 12, minutes: 0 }} disabled />
      </Section>

      <View style={{ height: 260 }} />
    </>
  );
};
