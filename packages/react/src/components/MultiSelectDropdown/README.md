Checkbox-list variant of `Dropdown` for selecting multiple values from a single trigger.

```tsx
import { useState } from 'react';
import { MultiSelectDropdown } from '@gnome-ui/react';

const [languages, setLanguages] = useState<string[]>(['ts']);

<MultiSelectDropdown
  aria-label="Languages"
  options={[
    { value: 'js', label: 'JavaScript' },
    { value: 'ts', label: 'TypeScript' },
    { value: 'py', label: 'Python' },
  ]}
  value={languages}
  onChange={setLanguages}
/>
```

`Dropdown`/`ComboRow` are single-select only — use `MultiSelectDropdown` when more than one value can be chosen at once (e.g. filtering by several categories). Toggling an option keeps the list open so the user can pick several in a row; close it via Escape, Tab, or clicking outside.

The trigger shows the single option's label when exactly one is selected, or `"N selected"` once more than one is chosen.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `MultiSelectDropdownOption<V>[]` | — | The list of selectable options |
| `value` | `V[]` | — | The currently selected values |
| `onChange` | `(value: V[]) => void` | — | Called with the full updated selection whenever an option is toggled |
| `placeholder` | `string` | `'Select options'` | Shown when no option is selected |
| `aria-label` | `string` | — | Accessible label for the control |
| `disabled` | `boolean` | `false` | Disables the entire control |

### Guidelines

- Fully keyboard-navigable: Space/Enter opens the list; ↑/↓ move between options; Enter/Space toggles the active option without closing the list; Escape or Tab closes it.
- Selection state is conveyed via `aria-selected` on each `role="option"` — the checkbox square shown next to each option is decorative only, not a separate focusable control, so screen reader behavior matches the standard multi-selectable listbox pattern.
