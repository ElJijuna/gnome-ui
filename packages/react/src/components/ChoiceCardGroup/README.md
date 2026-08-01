Card-based single-choice selector — large selectable cards instead of radio buttons.

```tsx
import { useState } from 'react';
import { ChoiceCardGroup } from '@gnome-ui/react';

const [plan, setPlan] = useState('personal');

<ChoiceCardGroup
  label="Account type"
  value={plan}
  onChange={setPlan}
  options={[
    { value: 'personal', title: 'Personal', description: 'For individual use' },
    { value: 'team', title: 'Team', description: 'For small groups' },
    { value: 'enterprise', title: 'Enterprise', description: 'Advanced controls and support' },
  ]}
/>
```

Mirrors the pattern used in GNOME Initial Setup / welcome flows (e.g. choosing an account type or a starting template).

Implements the WAI-ARIA `radiogroup`/`radio` pattern with roving tabindex: only the selected card (or the first enabled one, if none is selected) is in the tab order; ←/→/↑/↓ move the selection between cards.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `ChoiceCardOption<V>[]` | — | The list of selectable cards |
| `value` | `V` | — | The currently selected value |
| `onChange` | `(value: V) => void` | — | Called when the user selects a card |
| `label` | `string` | — | Visible label, rendered as the group's `<legend>` |
| `helperText` | `string` | — | Helper text below the label, hidden when `error` is set |
| `error` | `string` | — | Error message shown in place of `helperText` |
| `disabled` | `boolean` | `false` | Disables every card |

Each `ChoiceCardOption` accepts `value`, `title`, an optional `description`, an optional `icon` (from `@gnome-ui/icons`), and an optional `disabled` flag for that specific card.

### Guidelines

- Use `ChoiceCardGroup` when each option benefits from a title, description, or icon that wouldn't fit a compact radio button row — for a short list of simple text-only options, prefer `RadioButton` instead.
- The radio dot in each card's corner is decorative — selection state is conveyed to assistive technology via `aria-checked` on the card itself, not the dot.
