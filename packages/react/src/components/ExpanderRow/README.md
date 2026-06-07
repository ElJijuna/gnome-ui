Collapsible `ActionRow` that reveals nested rows on activation.

Mirrors `AdwExpanderRow` — clicking the header row toggles a smooth reveal
animation exposing child rows. Supports both **controlled** and **uncontrolled**
expand state.

### Guidelines
- Always wrap in `BoxedList` for the canonical GNOME appearance.
- Use for settings groups where sub-options only make sense when a parent option is relevant.
- Nest `ActionRow`, `ButtonRow`, or any row-shaped element as children — separators are inserted automatically.
- Use `trailing` for a value label or status indicator; stop event propagation inside interactive trailing widgets.
- Do not nest `ExpanderRow` more than one level deep.
