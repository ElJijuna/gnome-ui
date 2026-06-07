Draggable range control following the Adwaita `GtkScale` pattern.

### Guidelines
- Use when the range is large or the exact value matters less than relative position (volume, zoom, brightness).
- Prefer **SpinButton** when the user needs to enter a precise value.
- Always set meaningful `min`, `max`, and `step`.
- Provide an `aria-label` or associate with a visible label via `aria-labelledby`.
- Keyboard: ← / → move by one step; Page Up/Down by 10 steps; Home/End jump to bounds.
