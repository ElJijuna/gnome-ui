`MultiSelectDropdown` plus a filter field for narrowing long option lists.

```tsx
import { useState } from 'react';
import { FilterableMultiSelectDropdown } from '@gnome-ui/react';

const [countries, setCountries] = useState<string[]>(['us']);

<FilterableMultiSelectDropdown
  aria-label="Countries"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'gb', label: 'United Kingdom' },
    { value: 'de', label: 'Germany' },
  ]}
  value={countries}
  onChange={setCountries}
/>
```

Same overall shape as `MultiSelectDropdown` — a trigger summarizing the selection, opening a checkbox listbox — but opening it also focuses a filter field pinned above the list. Typing narrows `options` to those whose `label` or `description` contains the query (case-insensitive). Filtering only affects what's shown, never the underlying selection: values selected before a query hides their option stay selected, and the trigger keeps summarizing the real `value`.

Use this instead of plain `MultiSelectDropdown` once the option list is long enough that scanning it visually stops being the fastest way to find an entry (timezones, countries, package names, …). For short, fixed lists `MultiSelectDropdown` is simpler and needs no extra field.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `MultiSelectDropdownOption<V>[]` | — | The list of selectable options |
| `value` | `V[]` | — | The currently selected values |
| `onChange` | `(value: V[]) => void` | — | Called with the full updated selection whenever an option is toggled |
| `placeholder` | `string` | `'Select options'` | Shown on the trigger when no option is selected |
| `filterPlaceholder` | `string` | `'Filter options…'` | Placeholder for the filter field shown once the list is open |
| `aria-label` | `string` | — | Accessible label for the control |
| `disabled` | `boolean` | `false` | Disables the entire control |

### Guidelines

- Opening the list (click, Enter/Space/↑/↓ on the trigger) moves keyboard focus into the filter field so typing can start immediately — unlike `MultiSelectDropdown`, where focus stays on the trigger button.
- ↑/↓ move the active option among the *currently filtered* results; Home/End jump to the first/last filtered option; Enter toggles the active option without closing the list; Escape or Tab closes it and returns focus to the trigger.
- Space is ordinary filter text here, not a toggle shortcut — that's the one interaction that differs from `MultiSelectDropdown`'s listbox, since the listbox no longer holds keyboard focus while open.
- The query resets every time the list closes, so reopening always shows the full option list again.
- Selection state is conveyed via `aria-selected` on each `role="option"`, exactly as in `MultiSelectDropdown`.
