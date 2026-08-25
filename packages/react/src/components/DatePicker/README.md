# DatePicker

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
