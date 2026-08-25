import { PreferencesSystemTime } from '@gnome-ui/icons';
import { type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react';

import { Icon } from '@/components/Icon';
import { Popover, type PopoverPlacement } from '@/components/Popover';
import { SpinButton } from '@/components/SpinButton';

import styles from './TimePicker.module.css';

/** A wall-clock time, in 24-hour terms. */
export interface TimeValue {
  /** Hours, `0`–`23`. */
  hours: number;
  /** Minutes, `0`–`59`. */
  minutes: number;
}

export interface TimePickerProps {
  /** Controlled selected time. Pass `null` for "no selection". */
  value?: TimeValue | null;
  /** Initial selected time when uncontrolled. Defaults to `null`. */
  defaultValue?: TimeValue | null;
  /** Called when the user changes the time. */
  onChange?: (value: TimeValue) => void;
  /** 12- or 24-hour presentation. Defaults to `24`. */
  hourCycle?: 12 | 24;
  /** Minute increment for the spinner. Defaults to `1`. */
  minuteStep?: number;
  /** BCP-47 locale for the displayed time. Defaults to the runtime locale. */
  locale?: string;
  /** Text shown in the trigger while no time is selected. */
  placeholder?: string;
  /** Visible label rendered above the trigger. */
  label?: string;
  /** Accessible name for the trigger when no visible `label` is provided. */
  'aria-label'?: string;
  /** Disable the control. */
  disabled?: boolean;
  /** Preferred popover placement relative to the trigger. Defaults to `'bottom'`. */
  placement?: PopoverPlacement;
  /** Explicit id for the trigger. Auto-generated when omitted. */
  id?: string;
  className?: string;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Split a 0–23 hour into its 12-hour parts. */
const to12 = (hours24: number) => ({
  hour: hours24 % 12 === 0 ? 12 : hours24 % 12,
  period: hours24 < 12 ? 0 : 1, // 0 = AM, 1 = PM
});

/** Recombine a 12-hour clock reading into a 0–23 hour. */
const to24 = (hour12: number, period: number) => (period === 1 ? (hour12 % 12) + 12 : hour12 % 12);

/**
 * Hour/minute selection built from paired `SpinButton`s inside a `Popover`,
 * behind an entry-styled trigger — mirrors the `GtkSpinButton` + `GtkPopover`
 * composition GNOME apps use for time entry, with 12- and 24-hour support.
 *
 * The columns cycle: stepping a minute past `59` rolls to `00` and bumps
 * nothing else, and each column is independently keyboard-operable
 * (↑/↓ step, PageUp/PageDown ×10). Values update live as the spinners move.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/spin-buttons.html
 */
export const TimePicker = ({
  value: controlledValue,
  defaultValue = null,
  onChange,
  hourCycle = 24,
  minuteStep = 1,
  locale,
  placeholder = 'Select a time',
  label,
  'aria-label': ariaLabel,
  disabled = false,
  placement = 'bottom',
  id: idProp,
  className,
}: TimePickerProps) => {
  const isControlled = controlledValue !== undefined;
  const [uncontrolled, setUncontrolled] = useState<TimeValue | null>(defaultValue);
  const selected = isControlled ? controlledValue : uncontrolled;

  const [open, setOpen] = useState(false);

  const autoId = useId();
  const id = idProp ?? autoId;
  const labelId = `${id}-label`;

  // The spinners always need concrete numbers; fall back to noon when nothing
  // is selected yet, without treating that fallback as a real selection.
  const draft: TimeValue = selected ?? { hours: 12, minutes: 0 };

  const timeFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: hourCycle === 12 ? 'h12' : 'h23',
      }),
    [locale, hourCycle],
  );
  const displayValue = selected
    ? timeFmt.format(new Date(2000, 0, 1, selected.hours, selected.minutes))
    : placeholder;

  const commit = (next: TimeValue) => {
    if (!isControlled) {
      setUncontrolled(next);
    }
    onChange?.(next);
  };

  const setHours24 = (hours: number) => commit({ hours, minutes: draft.minutes });
  const setMinutes = (minutes: number) => commit({ hours: draft.hours, minutes });

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!open && event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
    }
  };

  // Pull focus onto the first spinner when the popover opens. A `Popover` keeps
  // its panel `visibility:hidden` until positioned, and hidden elements cannot
  // take focus, so retry across frames until it lands (capped so it can't spin).
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) {
      return;
    }
    let raf = 0;
    let tries = 0;
    const tryFocus = () => {
      const panel = panelRef.current;
      // Stop as soon as focus is anywhere in the panel — otherwise the retry
      // would fight a user (or the popover) moving focus to another column.
      if (panel?.contains(document.activeElement)) {
        return;
      }
      panel?.querySelector<HTMLElement>('[role="spinbutton"]')?.focus();
      if (!panel?.contains(document.activeElement) && tries++ < 10) {
        raf = requestAnimationFrame(tryFocus);
      }
    };
    raf = requestAnimationFrame(tryFocus);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const twelve = to12(draft.hours);

  const panel = (
    <div ref={panelRef} className={styles.panel}>
      {hourCycle === 12 ? (
        <SpinButton
          value={twelve.hour}
          min={1}
          max={12}
          wrap
          format={pad2}
          onChange={(h) => setHours24(to24(h, twelve.period))}
          aria-label="Hours"
          className={styles.column}
        />
      ) : (
        <SpinButton
          value={draft.hours}
          min={0}
          max={23}
          wrap
          format={pad2}
          onChange={setHours24}
          aria-label="Hours"
          className={styles.column}
        />
      )}

      <span className={styles.colon} aria-hidden="true">
        :
      </span>

      <SpinButton
        value={draft.minutes}
        min={0}
        max={59}
        step={minuteStep}
        wrap
        format={pad2}
        onChange={setMinutes}
        aria-label="Minutes"
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
          aria-label="AM/PM"
          className={styles.column}
        />
      )}
    </div>
  );

  return (
    <div className={[styles.timePicker, className].filter(Boolean).join(' ')}>
      {label && (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      )}

      <Popover placement={placement} open={open} onOpenChange={setOpen} content={panel}>
        <button
          type="button"
          id={id}
          className={styles.trigger}
          disabled={disabled}
          data-placeholder={selected ? undefined : ''}
          aria-label={ariaLabel}
          aria-labelledby={label ? labelId : undefined}
          onKeyDown={handleTriggerKeyDown}
        >
          <span className={styles.value}>{displayValue}</span>
          <Icon icon={PreferencesSystemTime} size="sm" aria-hidden className={styles.icon} />
        </button>
      </Popover>
    </div>
  );
};
