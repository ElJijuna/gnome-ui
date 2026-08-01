Searchable emoji grid in a `Popover`. Mirrors `GtkEmojiChooser`.

```tsx
import { EmojiPicker, IconButton } from '@gnome-ui/react';
import { EmojiObjects } from '@gnome-ui/icons';

<EmojiPicker onSelect={(emoji) => console.log(emoji)}>
  <IconButton icon={EmojiObjects} label="Insert emoji" tooltip="Insert emoji" />
</EmojiPicker>
```

A search field filters the flat emoji list by name; otherwise emoji are grouped by category with a jump-to-category tab bar at the bottom, matching the real Adwaita widget's clickable category strip.

Recently used emoji are tracked in memory for the current session only — they are **not** persisted across page reloads.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSelect` | `(emoji: string) => void` | — | Called with the emoji character when the user picks one |
| `children` | `ReactElement` | — | The trigger element that opens the picker |
| `placement` | `PopoverPlacement` | `'bottom'` | Preferred popover placement relative to the trigger |
| `maxRecent` | `number` | `12` | Maximum number of recently used emoji shown |

### Guidelines

- The curated emoji set covers common entries per category — it is not an exhaustive Unicode dataset. For a full emoji keyboard, use the operating system's native picker (most OSes bind one to a system shortcut).
- The trigger is any single element (typically an `IconButton`) — `EmojiPicker` clones it the same way `Popover` does, so existing `onClick` handlers on the trigger keep working.
