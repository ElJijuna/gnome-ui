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
| ✅ | **Link** | Inline hyperlink with accent colour, hover underline, and external-URL variant |
| ✅ | **Text Field** | Text input with label, helper text, and error state |
| ✅ | **Switch** | On/off toggle — replaces checkbox in settings UIs |
| ✅ | **Checkbox** | Multi-selection with indeterminate state |
| ✅ | **Radio Button** | Single selection within a group |

---

## Tier 2 — Layout & Containers

> Structure and grouping. Core patterns of GNOME app UIs.

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **Separator** | Horizontal/vertical divider line |
| ✅ | **Card** | Elevated surface for grouping related content |
| ✅ | **Boxed List** | Rounded bordered list of `ActionRow` items — the most common GNOME pattern |
| ✅ | **Action Row** | Row with title, subtitle, and an end widget (switch, button…) |
| ✅ | **Header Bar** | Title bar with centered title and action buttons |

---

## Tier 3 — Navigation

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **Tabs / Tab Bar** | Tab-based navigation |
| ✅ | **View Switcher** | Segmented control for switching between views |
| ✅ | **Sidebar** | Lateral navigation panel |
| ✅ | **Search Bar** | Collapsible search bar |

---

## Tier 4 — Feedback

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **Spinner** | Indeterminate loading indicator |
| ✅ | **Progress Bar** | Determinate and indeterminate progress |
| ✅ | **Toast** | Non-blocking temporary notification |
| ✅ | **Banner** | Persistent message at the top of a view |
| ✅ | **Dialog** | Blocking modal with title, body, and buttons |
| ✅ | **Tooltip** | Informational text on hover |
| ✅ | **Status Page** | Empty state with icon, title, and description |

---

## Tier 5 — Advanced Controls

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **Dropdown / Select** | Expandable option list |
| ✅ | **Slider** | Numeric range with draggable handle |
| ✅ | **Spin Button** | Numeric input with +/− buttons |
| ✅ | **Avatar** | Circular user image with initials fallback |
| ✅ | **Badge** | Counter or status indicator overlaid on another element |
| ✅ | **Popover** | Floating panel anchored to a trigger element |

---

## Tier 6 — Adaptive Layout

> Responsive primitives mirroring the libadwaita adaptive layout system.
>
> **GNOME breakpoints** (1 sp ≈ 1 px at 1× density):
> | Threshold | Pattern triggered |
> |-----------|-------------------|
> | ≤ 400 sp | Collapse split views to single pane; sidebar becomes overlay |
> | ≤ 550 sp | Move `ViewSwitcher` from header bar to a bottom bar |
> | ≤ 860 sp | Collapse outer pane in nested two-level split views |
>
> **Sizing guidelines for sidebars:**
> - Width fraction: 25 % of total width
> - Min width: 180 sp · Max width: 280 sp

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **`useBreakpoint`** | Hook that tracks viewport width against GNOME breakpoints and fires callbacks on change — mirrors `AdwBreakpoint` |
| ✅ | **Clamp** | Constrains content to a maximum width while allowing it to shrink freely — mirrors `AdwClamp` |
| ✅ | **NavigationSplitView** | Two-pane sidebar + content layout; collapses to a single navigable pane at ≤ 400 sp — mirrors `AdwNavigationSplitView` |
| ✅ | **OverlaySplitView** | Sidebar + content layout where the sidebar becomes a slide-over overlay at ≤ 400 sp — mirrors `AdwOverlaySplitView` |
| ✅ | **ViewSwitcherBar** | Bottom bar that replaces the header-bar `ViewSwitcher` on narrow windows (≤ 550 sp) — mirrors `AdwViewSwitcherBar` |

---

## Tier 7 — GNOME 48–50 (libadwaita 1.7–1.9)

> New widgets introduced in libadwaita 1.7 (GNOME 48), 1.8 (GNOME 49), and 1.9 (GNOME 50 "Tokyo", March 2026).

### libadwaita 1.7 — GNOME 48

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **ToggleGroup** | Unified group of mutually-exclusive toggle buttons — replaces the pattern of multiple `Button` in a box; mirrors `AdwToggleGroup` |
| ✅ | **WrapBox** | Flexible wrapping layout for tag/chip lists that flows across multiple lines — mirrors `AdwWrapBox` |
| ✅ | **Chip** | Compact pill-shaped label for tags, filters, and multi-select states; static, removable, and selectable modes |

### libadwaita 1.8 — GNOME 49

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **ShortcutsDialog** | Modal listing keyboard shortcuts with integrated search — mirrors `AdwShortcutsDialog` (replaces deprecated `GtkShortcutsWindow`) |

### libadwaita 1.9 — GNOME 50

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **Sidebar** (v2) | Rewrite of the existing `Sidebar` component following `AdwSidebar`: named sections, per-row suffix widgets, context menus, and tooltip |
| ✅ | **ViewSwitcherSidebar** | Sidebar-based view switcher — mirrors `AdwViewSwitcherSidebar` (replaces `GtkStackSidebar`) |
| ✅ | **BreakpointBin** | Applies layout changes when the **component** (not the viewport) crosses a size threshold — CSS container queries equivalent of `AdwBreakpointBin` |

### Cross-cutting — accessibility

| Status | Item | Description |
|--------|------|-------------|
| ✅ | **High-contrast support** | Add `@media (prefers-contrast: more)` overrides to design tokens and all components — formalised in libadwaita 1.8 |

---

## Tier 8 — Style-class Utilities & Composition Helpers

> Lightweight components and props derived from the libadwaita 1.9 **style-class reference**.
> These fill gaps between what we already ship and what the full Adwaita toolkit offers.

### Layout primitives

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **`Toolbar`** | `.toolbar` box: flat-buttons, 6 px margins/gap — wraps `AdwHeaderBar`, `GtkActionBar`, and generic tool rows |
| ✅ | **`Spacer`** | `.spacer` separator: invisible `flex: 1` filler for `Toolbar`/`HeaderBar` to push trailing items to the end — mirrors `GtkSeparator.spacer` |
| ✅ | **`LinkedGroup`** | `.linked` box: children rendered as a single connected unit with no gap and merged borders — canonical GNOME pattern for button groups and segmented inputs |
| ✅ | **`Frame`** | `.frame` container: simple bordered surface (`border` + `border-radius`) without background — mirrors `GtkFrame` default styling |

### BoxedList / ActionRow variants

| Status | Component | Description |
|--------|-----------|-------------|
| ⬜ | **`BoxedList` `separate` prop** | Add `variant="separate"` to `BoxedList`: renders each child as its own rounded card — mirrors `.boxed-list-separate` |
| ✅ | **`ButtonRow`** | Full-width activatable row styled as a button inside a `BoxedList` — mirrors `AdwButtonRow`; supports `suggested` and `destructive` variants |
| ⬜ | **`ActionRow` `property` variant** | Add `variant="property"` to `ActionRow`: flips weight so the subtitle is the primary text (read-only property display) — mirrors `.property` style class |
| ✅ | **`ExpanderRow`** | Collapsible `ActionRow` that reveals nested rows on activation — mirrors `AdwExpanderRow` |

### Button additions

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **`SplitButton`** | Primary action button with an attached dropdown arrow — mirrors `AdwSplitButton`; supports `suggested` and `destructive` variants |
| ✅ | **`Button` `raised` variant** | Add `variant="raised"` to `Button`: explicit raised look for buttons inside flat/toolbar contexts — mirrors `.raised` style class |
| ✅ | **`Button` `osd` modifier** | Add `osd` prop to `Button`: dark semi-transparent style for controls overlaid on media/images — mirrors `.osd` style class |

### View Switcher additions

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **`InlineViewSwitcher`** | Compact inline view switcher built on `ToggleGroup` internals; `flat` and `round` style variants — mirrors `AdwInlineViewSwitcher` (GNOME 48) |

### StatusPage addition

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **`StatusPage` `compact` prop** | Add `compact` prop to the existing `StatusPage`: reduces spacing and icon size for sidebars/popovers — mirrors `.compact` style class |

### Tab / Search inline variant

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **`TabBar` `inline` prop** | Add `inline` prop to `TabBar`: removes the header-bar background so the bar blends into any surface — mirrors `.inline` style class |
| ✅ | **`SearchBar` `inline` prop** | Add `inline` prop to `SearchBar`: same neutral-background treatment as above — mirrors `.inline` style class |
