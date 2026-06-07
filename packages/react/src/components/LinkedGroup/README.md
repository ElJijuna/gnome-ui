Renders children as a single visually-connected unit with no gap and merged borders.

The canonical GNOME pattern for button groups and segmented inputs — mirrors the
libadwaita `.linked` style class.

### How it works
- First child retains its outer border radius (left side or top side).
- Last child retains its outer border radius (right side or bottom side).
- All middle children have their border radius removed.
- Adjacent borders are collapsed to a single pixel via `margin: -1px`.
- Hovered and focused children are raised with `z-index` so their border stays visible.

### Guidelines
- Use for tightly related actions that form a logical group (Cut/Copy/Paste, Zoom −/+).
- Use `vertical` for stacked inputs or option lists.
- Prefer `ToggleGroup` for mutually-exclusive toggle buttons — `LinkedGroup` is for generic grouping.
- Avoid mixing very different widget types (e.g. a button and a text field) unless the UX warrants it.
