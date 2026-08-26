A [`Popover`](../Popover)-anchored [`CalendarRange`](../CalendarRange) behind an
entry-styled trigger — the range counterpart of `DatePicker`, and the same
`GtkCalendar` + `GtkPopover` composition GNOME apps use for date entry.

The trigger reads out both ends (`Aug 10, 2026 – Aug 19, 2026`) or a
placeholder, and opens on click, <kbd>Enter</kbd>/<kbd>Space</kbd> or
<kbd>↓</kbd>. Because `CalendarRange` only emits a finished range, the popover
stays open through the first click and closes on the second — returning focus to
the trigger.

## Usage

```tsx
import { DateRangePicker } from '@gnome-ui/react/components/DateRangePicker';

function Example() {
  const [range, setRange] = useState<DateRange | null>(null);
  return <DateRangePicker label="Stay" value={range} onChange={setRange} />;
}
```

`onChange` receives `{ start, end }` with both ends filled in — there is no
half-emitted range to guard against.

## Two months, or however many

The popover shows `visibleMonths={2}` panels by default, paged together, so a
range spanning months needs no navigation. Pass `1` for a compact picker, or
more for a wide one.

## Presets

`presets` adds one-click shortcuts beside the calendar. A preset's `range` may
be a literal or a function, so relative shortcuts are computed at click time:

```tsx
<DateRangePicker
  label="Report period"
  presets={[
    { label: 'Last 7 days', range: () => ({ start: addDays(new Date(), -6), end: new Date() }) },
    { label: 'This month', range: () => ({ start: startOfMonth(new Date()), end: new Date() }) },
  ]}
/>
```

Choosing a preset commits the range and closes the popover, exactly like a
second day click.

## Props

`value` / `defaultValue` (a `DateRange`), `onChange`, `min`, `max`, `minRange`,
`maxRange`, `visibleMonths`, `presets`, `weekStartsOn`, `locale`,
`formatOptions`, `placeholder`, `separator`, `label`, `aria-label`,
`showWeekNumbers`, `disabled`, `placement`, `id`, `className`.

## Date and time

`showTime` gives **each end its own** hour/minute columns — the shape bookings
need — plus a Done button, since the second day click no longer finishes the
selection:

```tsx
<DateRangePicker label="Stay" showTime hourCycle={12} minuteStep={15} />
```

The calendar keeps handing back civil dates, so both clock readings are merged
into the pair on every change. On a **single-day** range the two times can
invert; the end you just edited wins and the other follows it, so `start` is
never after `end`. Committing a fresh pair of day clicks with inverted times
collapses the end onto the start.

`startTimeLabel` / `endTimeLabel` name the two column groups (visibly and for
screen readers, as `"Start hours"`, `"End minutes"`…), and `doneLabel` renames
the closing button. Note that `minRange` / `maxRange` still count **calendar
days**, not elapsed hours.
