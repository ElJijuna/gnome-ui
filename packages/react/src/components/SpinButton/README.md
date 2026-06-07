Numeric input with − and + buttons following the Adwaita `GtkSpinButton` style.

### Guidelines
- Use for small bounded integer or decimal values (font size, quantity, opacity…).
- Always set meaningful `min`, `max`, and `step`.
- Prefer a **Slider** when the range is large or the exact value matters less than relative position.
- Keyboard: ↑/↓ step once, Page Up/Down step ×10, Home/End jump to min/max.
- The `−` button disables automatically at `min`; `+` at `max`.
