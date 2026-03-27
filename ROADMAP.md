# Roadmap — @gnome-ui/react

Component implementation plan following the [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/).

Legend: ✅ Done · 🚧 In progress · ⬜ Pending

---

## Tier 1 — Base

> Foundation components. Everything else depends on these.

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **Button** | Default, Suggested, Destructive, Flat, Pill, Circular |
| ✅ | **Text** | All 12 Adwaita styles: large-title, title-1…4, heading, body, document, caption, caption-heading, monospace, numeric |
| ✅ | **Text Field** | Text input with label, helper text, and error state |
| ✅ | **Switch** | On/off toggle — replaces checkbox in settings UIs |
| ✅ | **Checkbox** | Multi-selection with indeterminate state |
| ⬜ | **Radio Button** | Single selection within a group |

---

## Tier 2 — Layout & Containers

> Structure and grouping. Core patterns of GNOME app UIs.

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **Separator** | Horizontal/vertical divider line |
| ✅ | **Card** | Elevated surface for grouping related content |
| ✅ | **Boxed List** | Rounded bordered list of `ActionRow` items — the most common GNOME pattern |
| ✅ | **Action Row** | Row with title, subtitle, and an end widget (switch, button…) |
| ⬜ | **Header Bar** | Title bar with centered title and action buttons |

---

## Tier 3 — Navigation

| Status | Component | Description |
|--------|-----------|-------------|
| ⬜ | **Tabs / Tab Bar** | Tab-based navigation |
| ⬜ | **View Switcher** | Segmented control for switching between views |
| ⬜ | **Sidebar** | Lateral navigation panel |
| ⬜ | **Search Bar** | Collapsible search bar |

---

## Tier 4 — Feedback

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **Spinner** | Indeterminate loading indicator |
| ⬜ | **Progress Bar** | Determinate and indeterminate progress |
| ⬜ | **Toast** | Non-blocking temporary notification |
| ⬜ | **Banner** | Persistent message at the top of a view |
| ⬜ | **Dialog** | Blocking modal with title, body, and buttons |
| ⬜ | **Tooltip** | Informational text on hover |
| ⬜ | **Status Page** | Empty state with icon, title, and description |

---

## Tier 5 — Advanced Controls

| Status | Component | Description |
|--------|-----------|-------------|
| ⬜ | **Dropdown / Select** | Expandable option list |
| ⬜ | **Slider** | Numeric range with draggable handle |
| ⬜ | **Spin Button** | Numeric input with +/− buttons |
| ✅ | **Avatar** | Circular user image with initials fallback |
| ⬜ | **Badge** | Counter or status indicator overlaid on another element |
| ⬜ | **Popover** | Floating panel anchored to a trigger element |
