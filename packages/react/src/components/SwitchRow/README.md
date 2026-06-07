Activatable row with an integrated switch.

Mirrors `AdwSwitchRow` — the entire row is a button that toggles the switch when clicked.
This differs from `ActionRow` with a `trailing` switch: here the row itself carries the
`role="switch"` and clicking anywhere (title, subtitle, or the visual switch) toggles state.

### Guidelines
- Use when a single boolean setting should occupy a full list row.
- Prefer `SwitchRow` over `ActionRow + Switch trailing` when there is no other trailing widget needed.
- Supports controlled (`checked`) and uncontrolled (`defaultChecked`) modes.
- Wrap in `BoxedList` for the canonical GNOME settings appearance.
