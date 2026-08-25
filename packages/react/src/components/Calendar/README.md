# Calendar

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
