Read-only display of a keyboard shortcut with per-key key-cap styling.

Each token in the `shortcut` string (split by `+`) is rendered as a
separate `<kbd>` element. Modifier keys are normalised to their Unicode
symbols by default (`Ctrl` → `⌃`, `Shift` → `⇧`, etc.).

Mirrors `GtkShortcutLabel`.

### Usage
- Pass the shortcut as a `+`-separated string, e.g. `"Ctrl+S"`.
- Set `symbols={false}` to keep raw token names instead of symbols.
- Use as the `suffix` of an `ActionRow` in a `BoxedList`.

### Modifier ordering (libadwaita 1.10 / GNOME 51)
Modifiers are always displayed in the same order, however the shortcut is
written — Hyper, Super, Ctrl, Alt, Shift, Cmd/Meta (`⌃ ⌥ ⇧ ⌘`, the Apple
ordering) — followed by the other keys in their original order. `"Shift+Ctrl+Z"`
renders as `⌃ ⇧ Z`. The accessible name keeps the original string.
