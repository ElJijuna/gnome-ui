Button that opens a family/size/weight chooser. Mirrors `GtkFontDialogButton`: the trigger itself previews the current selection rendered in that font.

```tsx
import { useState } from 'react';
import { FontPicker } from '@gnome-ui/react';

const [font, setFont] = useState({ family: 'Cantarell', size: 11, weight: 400 });

<FontPicker value={font} onChange={setFont} />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `FontValue` (`{ family, size, weight }`) | — | Current font selection |
| `onChange` | `(value: FontValue) => void` | — | Called whenever the family, size, or weight changes |
| `families` | `string[]` | `DEFAULT_FONT_FAMILIES` | Families offered in the family dropdown |
| `minSize` | `number` | `6` | Minimum selectable point size |
| `maxSize` | `number` | `96` | Maximum selectable point size |
| `placement` | `PopoverPlacement` | `'bottom'` | Preferred popover placement relative to the trigger |
| `disabled` | `boolean` | `false` | Disables the trigger and popover contents |
| `label` | `string` | `'Font'` | Accessible label prefix for the trigger button |

`weight` uses the standard 9-step scale (100 Thin – 900 Black); `FONT_WEIGHTS` is exported for building your own weight UI if needed.

### Guidelines

- Pass your app's actual available fonts via `families` — the default list is a small, representative placeholder (GNOME's default UI/document/monospace families plus the generic CSS keywords), not a real font enumeration.
- The trigger's own text renders in the selected family and weight, matching `GtkFontDialogButton`'s live-preview behavior — no separate preview area is needed.
