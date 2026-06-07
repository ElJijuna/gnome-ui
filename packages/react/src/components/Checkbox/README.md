Checkbox for multi-selection, following the GNOME HIG and Adwaita style.

### Guidelines
- Use for multi-selection where multiple items can be active at once.
- Prefer `Switch` over `Checkbox` for settings that take effect immediately.
- Use the `indeterminate` state for "select all" controls when only some items are selected.
- Always pair with a visible label or supply `aria-label`.
- Changes should not take effect until the user confirms (e.g. a Save button).
