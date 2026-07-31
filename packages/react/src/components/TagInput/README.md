Type-to-add multi-value input rendering entries as removable `Chip`s in a `WrapBox`.

```tsx
import { useState } from 'react';
import { TagInput } from '@gnome-ui/react';

const [tags, setTags] = useState(['react', 'gnome']);

<TagInput label="Tags" value={tags} onChange={setTags} placeholder="Add a tag…" />
```

`WrapBox`/`Chip` alone only support static, pre-populated display — `TagInput` adds interactive entry:

- Type and press **Enter** or **,** to commit the current draft as a tag.
- Press **Backspace** with an empty draft to remove the last tag.
- **Paste** a comma or newline-separated list to add several tags at once.
- Click a chip's **×** button to remove that specific tag.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string[]` | — | Current list of tags |
| `onChange` | `(value: string[]) => void` | — | Called when a tag is added or removed |
| `label` | `string` | — | Visible label rendered above the input |
| `helperText` | `string` | — | Helper text below the input, hidden when `error` is set |
| `error` | `string` | — | Error message shown in place of `helperText`; also applies the error border |
| `maxTags` | `number` | — | Maximum number of tags allowed. Once reached, the text input is hidden |
| `preventDuplicates` | `boolean` | `true` | Reject a new tag that already exists (case-insensitive) |

### Guidelines

- Always provide a `label` — it is the primary accessible name for the input.
- Clicking anywhere in the tag box focuses the draft input, matching the behavior of native multi-value fields (e.g. an email "To" field).
- Set `preventDuplicates={false}` only when duplicate entries are meaningful for your data (e.g. free-text notes) — for most tag/category use cases, leave it enabled.
