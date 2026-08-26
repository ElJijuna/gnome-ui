Month-grid date display with full keyboard navigation — mirrors
[`GtkCalendar`](https://gnome.pages.gitlab.gnome.org/gtk/gtk4/class.Calendar.html).
Usable standalone (settings, forms) or as the panel inside a `DatePicker`.

Implements the [WAI-ARIA grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/):
the grid holds a roving `tabindex`, so a single <kbd>Tab</kbd> reaches the current
day. Then:

- <kbd>←</kbd> / <kbd>→</kbd> move one day; <kbd>↑</kbd> / <kbd>↓</kbd> move one week.
- <kbd>Home</kbd> / <kbd>End</kbd> jump to the start / end of the week.
- <kbd>PageUp</kbd> / <kbd>PageDown</kbd> page by month (hold <kbd>Shift</kbd> for a year).
- <kbd>Enter</kbd> / <kbd>Space</kbd> select the focused day.

Leading and trailing days from adjacent months are shown dimmed and remain
selectable — choosing one navigates to that month, matching `GtkCalendar`.

## Changing the year

The heading label is a button that drills down the way modern date pickers do,
so a distant year is two clicks away instead of twelve pages:

```
August 2026  →  month grid (2026)  →  year grid (2016 – 2027)  →  back to days
```

Picking a year drops to that year's month grid; picking a month drops to its day
grid. The step arrows follow the active view — a month at a time on the day grid,
a year on the month grid, twelve years on the year grid — and each grid keeps the
same roving-tabindex keyboard model (<kbd>←</kbd> <kbd>→</kbd> one cell,
<kbd>↑</kbd> <kbd>↓</kbd> one row of four, <kbd>Home</kbd> / <kbd>End</kbd> the
ends of the page, <kbd>Enter</kbd> to drill down, <kbd>Esc</kbd> back to days).
Months and years with no selectable day inside `[min, max]` are disabled.

Pass `showViewSwitcher={false}` for the plain `GtkCalendar` heading, or
`defaultView="years"` to open on the year grid — handy for date-of-birth entry:

```tsx
<Calendar defaultView="years" max={new Date()} onViewChange={(view) => console.log(view)} />
```

## Related

For start/end selection use [`CalendarRange`](../CalendarRange/README.md), which
drives the same grid engine (and takes the same `visibleMonths` prop to show
several month panels side by side).

## Usage

```tsx
import { Calendar } from '@gnome-ui/react/components/Calendar';

function Example() {
  const [date, setDate] = useState<Date | null>(null);
  return <Calendar value={date} onChange={setDate} />;
}
```

Restrict the selectable range and start weeks on Sunday:

```tsx
<Calendar
  min={new Date()}
  max={new Date(2027, 11, 31)}
  weekStartsOn={0}
  showWeekNumbers
/>
```
