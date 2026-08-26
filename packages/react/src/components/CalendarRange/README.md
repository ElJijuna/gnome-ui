Start/end date-range selection driving the same grid engine as `Calendar` —
roving `tabindex`, month/year drill-down, `min`/`max`, week numbers,
localisation.

The first click **anchors** the range and paints a live band up to the day under
the pointer (or under the roving keyboard focus); the second click commits it.
`onChange` therefore only ever fires with **both** ends filled in — there is no
half-emitted range to defend against downstream:

```tsx
import { CalendarRange } from '@gnome-ui/react/components/CalendarRange';

function Example() {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  return <CalendarRange value={range} onChange={setRange} />;
}
```

Picking backwards is fine — the pair is ordered before it is emitted — and
<kbd>Esc</kbd> cancels a half-made range. Inside a popover Escape is layered:
it closes the month/year drill-down first, then cancels the pending range, and
only then reaches the popover.

## More than one month

`visibleMonths` renders N month panels side by side, paged together by the
shared heading, so a range spanning months needs no navigation:

```tsx
<CalendarRange visibleMonths={2} />
```

The heading names the span (`August – September 2026`), each panel keeps its own
`role="grid"` and month caption, and the roving `tabindex` stays global: exactly
one day is tabbable across every panel, and walking off the last panel pages the
whole window by one month.

## Limiting the length

`minRange` / `maxRange` cap the range in days, counting both ends. While the
range is being drawn, days that could only produce an invalid range are disabled
rather than silently rejected on click:

```tsx
<CalendarRange minRange={2} maxRange={14} min={new Date()} />
```

## Keyboard

Identical to `Calendar` — <kbd>←</kbd>/<kbd>→</kbd>/<kbd>↑</kbd>/<kbd>↓</kbd>,
<kbd>Home</kbd>/<kbd>End</kbd>, <kbd>PageUp</kbd>/<kbd>PageDown</kbd> (hold
<kbd>Shift</kbd> for a year) — plus:

- <kbd>Enter</kbd> / <kbd>Space</kbd> anchor the range, then commit it.
- <kbd>Esc</kbd> cancels the range being drawn.

Moving the focus while anchoring updates the preview band, so the range is fully
selectable without a pointer. Every in-range cell carries `aria-selected`, the
ends and the days between them are named (`", start of range"`, `", in selected
range"`, `", end of range"`), and a polite live region announces both the
half-made state and the finished range.

## Props

Everything `Calendar` takes (`month`, `defaultMonth`, `onMonthChange`, `min`,
`max`, `weekStartsOn`, `locale`, `showHeading`, `showDayNames`,
`showWeekNumbers`, `showViewSwitcher`, `defaultView`, `onViewChange`,
`autoFocus`) plus `value` / `defaultValue` as a `DateRange`, `onChange`,
`onRangeStart`, `minRange`, `maxRange` and `visibleMonths`.
