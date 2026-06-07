Settings row with an integrated spin button for numeric values.

Mirrors `AdwSpinRow` — a standard row layout with − and + buttons at the trailing
edge. Use inside a `BoxedList` for settings with numeric ranges such as volume,
timeout durations, item counts, or font sizes.

### Guidelines
- Set `min`, `max`, and `step` to constrain the allowed range.
- Use `subtitle` to clarify the unit (e.g. "seconds", "pixels").
- Supports controlled (`value`) and uncontrolled (`defaultValue`) modes.
- Keyboard: ↑/↓ step by one, Page Up/Down step by 10×, Home/End jump to min/max.
