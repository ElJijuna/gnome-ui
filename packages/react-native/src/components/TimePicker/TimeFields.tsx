import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { SpinButton } from '@/components/SpinButton';
import { Text } from '@/components/Text';
import { useGnomeTheme } from '@/GnomeProvider';

import { pad2, type TimeValue, to12, to24 } from './timeUtils';

export interface TimeFieldsProps {
  /** The time the columns show. Always concrete — callers supply the fallback. */
  value: TimeValue;
  /** Called with the whole time whenever any column moves. */
  onChange: (value: TimeValue) => void;
  /** 12- or 24-hour presentation. Defaults to `24`. */
  hourCycle?: 12 | 24;
  /** Minute increment for the spinner. Defaults to `1`. */
  minuteStep?: number;
  /**
   * Prefix for each column's accessible label — `"Start"` gives
   * "Start hours". Needed when a panel carries more than one set of columns.
   */
  labelPrefix?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The hour/minute (and AM/PM) `SpinButton` columns — the panel half of
 * `TimePicker`, split out so `DatePicker`'s `showTime` footer can reuse the
 * same 12/24-hour bookkeeping without re-implementing it.
 *
 * Ported from `@gnome-ui/react`'s `TimePicker/TimeFields.tsx`: mirrors its
 * prop API and `to12`/`to24` bookkeeping exactly, rebuilt on this package's
 * own `SpinButton` (already shipped in Tier 5, with a matching `wrap`
 * boolean and `format: (n: number) => string` callback — confirmed by
 * reading `SpinButton.tsx` before wiring this up, no new prop needed for the
 * AM/PM column's "numeric spinner whose `format` maps 0/1 to text" trick).
 *
 * **Not exported from the package**: `TimePicker` is this module's public
 * face; `DatePicker`'s `showTime` footer imports it directly via
 * `@/components/TimePicker/TimeFields`, the same cross-folder internal
 * import `Calendar/calendarUtils.ts`'s `WeekStart` already established.
 */
export const TimeFields = ({
  value,
  onChange,
  hourCycle = 24,
  minuteStep = 1,
  labelPrefix,
  style,
}: TimeFieldsProps) => {
  const theme = useGnomeTheme();
  const twelve = to12(value.hours);
  const label = (name: string) => (labelPrefix ? `${labelPrefix} ${name}` : name);

  const setHours24 = (hours: number) => onChange({ hours, minutes: value.minutes });
  const setMinutes = (minutes: number) => onChange({ hours: value.hours, minutes });

  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: theme.space1, flexWrap: 'wrap' },
        style,
      ]}
    >
      {hourCycle === 12 ? (
        <SpinButton
          value={twelve.hour}
          min={1}
          max={12}
          wrap
          format={pad2}
          onChange={(h) => setHours24(to24(h, twelve.period))}
          accessibilityLabel={label('Hours')}
        />
      ) : (
        <SpinButton
          value={value.hours}
          min={0}
          max={23}
          wrap
          format={pad2}
          onChange={setHours24}
          accessibilityLabel={label('Hours')}
        />
      )}

      <Text variant="body" accessible={false}>
        :
      </Text>

      <SpinButton
        value={value.minutes}
        min={0}
        max={59}
        step={minuteStep}
        wrap
        format={pad2}
        onChange={setMinutes}
        accessibilityLabel={label('Minutes')}
      />

      {hourCycle === 12 && (
        <SpinButton
          value={twelve.period}
          min={0}
          max={1}
          wrap
          format={(p) => (p === 1 ? 'PM' : 'AM')}
          onChange={(p) => setHours24(to24(twelve.hour, p))}
          accessibilityLabel={label('AM/PM')}
        />
      )}
    </View>
  );
};
