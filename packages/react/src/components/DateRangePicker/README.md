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
