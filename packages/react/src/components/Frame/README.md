Simple bordered surface with `border-radius` but no background fill.

Use to visually delimit a region without adding the elevated appearance of a `Card`.
Mirrors `GtkFrame` default styling and the libadwaita `.frame` style class.

### Guidelines
- Use `Frame` when you need a visible boundary without a background (e.g. wrapping a media preview, a canvas area, or a list).
- Use `Card` when you need an elevated surface with its own background.
- `Frame` clips its children via `overflow: hidden`, so inner content respects the border radius.
