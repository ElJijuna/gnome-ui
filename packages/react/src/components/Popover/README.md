Floating panel anchored to a trigger element, following the Adwaita `GtkPopover` pattern.

Unlike **Tooltip**, a Popover can contain rich interactive content — menus, forms, sliders, toggles.

### Guidelines
- Use for secondary controls that are not important enough for permanent screen space.
- Keep content focused — one task or group of related settings.
- Prefer **Dialog** for actions that require confirmation or have significant consequences.
- Provide a clear way to close: Escape key, outside click, and a close/done button for longer panels.
- Supports both **uncontrolled** (toggle on trigger click) and **controlled** (`open` + `onClose`) modes.
