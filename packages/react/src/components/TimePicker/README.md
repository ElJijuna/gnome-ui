Hour/minute selection built from paired [`SpinButton`](../SpinButton)s inside a
[`Popover`](../Popover), behind an entry-styled trigger — mirrors the
`GtkSpinButton` + `GtkPopover` composition GNOME apps use for time entry, with
12- and 24-hour support.

Each column cycles: stepping a minute past `59` rolls back to `00`, and hours
wrap `23 → 00` (or `12 → 01` with the AM/PM column). Columns are independently
keyboard-operable — <kbd>↑</kbd>/<kbd>↓</kbd> step, <kbd>PageUp</kbd>/<kbd>PageDown</kbd>
step by ten. Values update live as the spinners move.

## Usage

```tsx
import { TimePicker, type TimeValue } from '@gnome-ui/react/components/TimePicker';

function Example() {
  const [time, setTime] = useState<TimeValue | null>(null);
  return <TimePicker label="Start time" value={time} onChange={setTime} />;
}
```

12-hour presentation with a five-minute step:

```tsx
<TimePicker hourCycle={12} minuteStep={5} defaultValue={{ hours: 14, minutes: 30 }} />
```
