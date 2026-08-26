A [`Popover`](../Popover)-anchored [`Calendar`](../Calendar) behind an
entry-styled trigger — mirrors the `GtkCalendar` + `GtkPopover` composition
GNOME apps use for date entry.

The trigger reads out the formatted selection (or a placeholder), opens the
calendar on click, <kbd>Enter</kbd>/<kbd>Space</kbd>, or <kbd>↓</kbd>, and
closes it once a day is chosen — returning focus to the trigger. All keyboard
navigation inside the panel is provided by `Calendar` (arrow keys, Home/End,
PageUp/PageDown, Enter to select).

## Usage

```tsx
import { DatePicker } from '@gnome-ui/react/components/DatePicker';

function Example() {
  const [date, setDate] = useState<Date | null>(null);
  return <DatePicker label="Start date" value={date} onChange={setDate} />;
}
```

Restrict the range and change the displayed format:

```tsx
<DatePicker
  min={new Date()}
  max={new Date(2027, 11, 31)}
  formatOptions={{ dateStyle: 'full' }}
  weekStartsOn={0}
/>
```

## Date and time

`showTime` adds `TimePicker`'s hour/minute columns under the calendar, turning
the emitted `Date` from a civil date into a point in time:

```tsx
<DatePicker label="Appointment" showTime hourCycle={12} minuteStep={15} />
```

Two behaviours change with it:

- **The popover no longer closes on a day click** — there is still a time to
  set. It closes on the Done button (`doneLabel`), or the usual Escape/outside
  click.
- **The time is carried across day clicks.** `Calendar` hands back local
  midnight, so each pick is merged with the clock currently shown. Before any
  day is chosen the columns start at 12:00, and editing them first attaches the
  reading to today.

`onChange` still fires on every change, so a controlled `value` follows the
calendar and the spinners live; Done only dismisses.
