import { SpinButton } from '@/components/SpinButton';

import styles from './TimePicker.module.css';
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
   * Prefix for the columns' accessible names — `"Start"` gives "Start hours".
   * Needed when a panel carries more than one set of columns.
   */
  labelPrefix?: string;
  className?: string;
}

/**
 * The hour/minute (and AM/PM) `SpinButton` columns — the panel half of
 * `TimePicker`, split out so the date pickers can put the same columns under a
 * calendar without re-implementing the 12/24-hour bookkeeping.
 *
 * Not exported from the package: `TimePicker` is its public face.
 */
export const TimeFields = ({
  value,
  onChange,
  hourCycle = 24,
  minuteStep = 1,
  labelPrefix,
  className,
}: TimeFieldsProps) => {
  const twelve = to12(value.hours);
  const label = (name: string) => (labelPrefix ? `${labelPrefix} ${name}` : name);

  const setHours24 = (hours: number) => onChange({ hours, minutes: value.minutes });
  const setMinutes = (minutes: number) => onChange({ hours: value.hours, minutes });

  return (
    <div className={[styles.panel, className].filter(Boolean).join(' ')}>
      {hourCycle === 12 ? (
        <SpinButton
          value={twelve.hour}
          min={1}
          max={12}
          wrap
          format={pad2}
          onChange={(h) => setHours24(to24(h, twelve.period))}
          aria-label={label('Hours')}
          className={styles.column}
        />
      ) : (
        <SpinButton
          value={value.hours}
          min={0}
          max={23}
          wrap
          format={pad2}
          onChange={setHours24}
          aria-label={label('Hours')}
          className={styles.column}
        />
      )}

      <span className={styles.colon} aria-hidden="true">
        :
      </span>

      <SpinButton
        value={value.minutes}
        min={0}
        max={59}
        step={minuteStep}
        wrap
        format={pad2}
        onChange={setMinutes}
        aria-label={label('Minutes')}
        className={styles.column}
      />

      {hourCycle === 12 && (
        <SpinButton
          value={twelve.period}
          min={0}
          max={1}
          wrap
          format={(p) => (p === 1 ? 'PM' : 'AM')}
          onChange={(p) => setHours24(to24(twelve.hour, p))}
          aria-label={label('AM/PM')}
          className={styles.column}
        />
      )}
    </div>
  );
};
