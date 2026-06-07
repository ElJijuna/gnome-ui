Read-only display of a keyboard shortcut with per-key key-cap styling.

Each token in the `shortcut` string (split by `+`) is rendered as a
separate `<kbd>` element. Modifier keys are normalised to their Unicode
symbols by default (`Ctrl` → `⌃`, `Shift` → `⇧`, etc.).

Mirrors `GtkShortcutLabel`.

### Usage
- Pass the shortcut as a `+`-separated string, e.g. `"Ctrl+S"`.
- Set `symbols={false}` to keep raw token names instead of symbols.
- Use as the `suffix` of an `ActionRow` in a `BoxedList`.
