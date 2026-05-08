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
| ✅ | **PathBar** | Breadcrumb path bar for hierarchical navigation; ancestor segments are interactive buttons, current segment is bold non-interactive label; optional per-segment icons — issue [#17](https://github.com/ElJijuna/gnome-ui/issues/17) |

---

## Tier 4 — Feedback

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **Spinner** | Indeterminate loading indicator |
| ✅ | **Progress Bar** | Determinate and indeterminate progress |
| ✅ | **Skeleton** | Content-shaped loading placeholder for web-style skeleton screens; pragmatic extension beyond GNOME HIG loading patterns — issue [#95](https://github.com/ElJijuna/gnome-ui/issues/95) |
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

### Cross-cutting — internationalization

| Status | Item | Description |
|--------|------|-------------|
| ✅ | **Provider-level Intl formatting** | `GnomeProvider` supplies `locale`, `dir`, `numberFormat`, and `dateTimeFormat`; `useNumberFormatter` and `useDateTimeFormatter` apply those defaults across `@gnome-ui/react`, `@gnome-ui/layout`, and `@gnome-ui/charts` |

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
| ✅ | **`BoxedList` `variant="separate"`** | Add `variant="separate"` to `BoxedList`: renders each child as its own rounded card — mirrors `.boxed-list-separate` |
| ✅ | **`ButtonRow`** | Full-width activatable row styled as a button inside a `BoxedList` — mirrors `AdwButtonRow`; supports `suggested` and `destructive` variants |
| ✅ | **`ActionRow` `variant="property"`** | Add `variant="property"` to `ActionRow`: flips weight so the subtitle is the primary text (read-only property display) — mirrors `.property` style class |
| ✅ | **`ExpanderRow`** | Collapsible `ActionRow` that reveals nested rows on activation — mirrors `AdwExpanderRow` |

### Button additions

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **`SplitButton`** | Primary action button with an attached dropdown arrow — mirrors `AdwSplitButton`; supports `suggested` and `destructive` variants |
| ✅ | **`IconButton`** | Accessible icon-only action button composed from `Button`, `Icon`, and optional `Tooltip`; supports variants, sizes, disabled state, refs, and HTML button attributes — issue [#102](https://github.com/ElJijuna/gnome-ui/issues/102) |
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
| ✅ | **`SearchBar` autocomplete** | `suggestions` prop + `Popover`-based typeahead list anchored to the input; keyboard navigation (`↑↓ Enter`); `role="listbox"` + `aria-activedescendant`; replaces deprecated `GtkEntryCompletion` following the GTK4 `AdwSearchBar` + `GtkPopover` + `GtkListView` pattern — issue [#24](https://github.com/ElJijuna/gnome-ui/issues/24) |

---

## Tier 9 — Stories & Composition Examples

> Full-page composition stories that demonstrate real-world use of the component library.

| Status | Story | Description |
|--------|-------|-------------|
| ✅ | **`Layout/Dashboard`** | Full-page app layout: `Toolbar` with logo + inline `SearchBar` + action buttons + avatar `Popover`, collapsible sidebar with `SidebarItem` + `Badge`, content area with `Card`, `BoxedList`, `ExpanderRow`, `InlineViewSwitcher`, `StatusPage`, and footer `Toolbar` |
| ✅ | **`Layout/FileManager`** | GNOME Files (Nautilus)–style file browser: `PathBar` breadcrumb navigation in toolbar, collapsible `Sidebar` with Places + Network sections, `InlineViewSwitcher` for grid/list toggle, folder drill-down, and mobile overlay sidebar — issue [#16](https://github.com/ElJijuna/gnome-ui/issues/16) |
| ✅ | **`Layout/Settings`** | GNOME Settings–style preferences app: dual-headerbar pattern, 14-category sidebar with per-category icons, sub-page drill-down (Accessibility → Seeing), `SwitchRow` toggle rows, `ActionRow` for value navigation, `PreferencesGroup` sections |

---

## Tier 10 — Sidebar Enhancements (identified via Dashboard story)

> Gaps discovered while building the Dashboard composition story.

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **`Sidebar` `collapsed` prop** | Built-in icon-only (mini/rail) mode: `collapsed` prop animates width (240 px → 56 px), hides labels/suffixes/section titles, and auto-shows tooltips on hover. `SidebarCollapsedContext` and `useSidebarCollapsed` hook exported for custom consumers. Dashboard story updated to use the real `Sidebar` component. |

---

## Tier 11 — Sidebar 1.9 Completeness

> Gaps vs `AdwSidebar` in libadwaita 1.9 identified by reviewing the [release notes](https://nyaa.place/blog/libadwaita-1-9/).

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **`Sidebar` search/filter** | Built-in `filter` prop + `SearchBar` integration; shows a `StatusPage` placeholder when the filtered list is empty — mirrors `AdwSidebar`'s `GtkFilter` support |
| ✅ | **`Sidebar` adaptive mode** | `mode` prop (`"sidebar" \| "page"`) that switches to a boxed-list layout on narrow viewports (≤ 400 sp), mirroring `AdwSidebar` mobile behaviour |
| ✅ | **`SidebarItem` drop target** | `onDrop` / `acceptTypes` props to turn individual rows into drag-and-drop targets — mirrors `AdwSidebar` per-row drop target support |

---

## Tier 12 — Boxed List Row Variants

> Specialised row types present in the libadwaita [widget gallery](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/widget-gallery.html) but not yet implemented.

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **`SwitchRow`** | `ActionRow` with an embedded `Switch` as the end widget — mirrors `AdwSwitchRow`; the canonical GNOME settings toggle pattern |
| ✅ | **`ComboRow`** | `ActionRow` with an inline dropdown selector — mirrors `AdwComboRow`; common for single-choice preferences |
| ✅ | **`EntryRow`** | `ActionRow` where the subtitle area is a live text input — mirrors `AdwEntryRow` |
| ✅ | **`PasswordEntryRow`** | `EntryRow` variant with masked input and a reveal toggle — mirrors `AdwPasswordEntryRow` |
| ✅ | **`SpinRow`** | `ActionRow` with an embedded `SpinButton` — mirrors `AdwSpinRow` |

---

## Tier 13 — Preferences UI

> Full preferences-window pattern used by most GNOME applications.

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **`PreferencesGroup`** | Titled section that wraps a `BoxedList` with an optional description — mirrors `AdwPreferencesGroup` |
| ✅ | **`PreferencesPage`** | Scrollable page composed of `PreferencesGroup` sections — mirrors `AdwPreferencesPage` |
| ✅ | **`PreferencesDialog`** | Multi-page settings dialog using `PreferencesPage` tabs — mirrors `AdwPreferencesDialog` (replaces `AdwPreferencesWindow`) |

---

## Tier 14 — Missing Navigation & Overlays

> Navigation and overlay patterns present in the widget gallery but not yet shipped.

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **`NavigationView`** | Single-pane push/pop navigation stack — mirrors `AdwNavigationView`; the mobile-first counterpart to `NavigationSplitView` |
| ✅ | **`BottomSheet`** | Slide-up panel that overlays content from the bottom edge — mirrors `AdwBottomSheet` (libadwaita 1.6+) |
| ✅ | **`Carousel`** | Swipeable horizontal/vertical content carousel with `CarouselIndicatorDots` and `CarouselIndicatorLines` — mirrors `AdwCarousel` |
| ✅ | **`AlertDialog`** | `role="alertdialog"` + `responses`/`onResponse` API added to `Dialog` — mirrors `AdwAlertDialog` |
| ✅ | **`AboutDialog`** | `variant="about"` + app info props added to `Dialog` (details/credits/legal tabs) — mirrors `AdwAboutDialog` |

---

## Tier 15 — Layout & Utility Gaps

> Small primitives and helpers present in the widget gallery that round out the system.

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **`Bin`** | Single-child container with no visual styling — mirrors `AdwBin`; useful as a base for custom components |
| ✅ | **`ToolbarView`** | Layout container that attaches a `HeaderBar`/`ActionBar` at top or bottom and scrolls only the middle content — mirrors `AdwToolbarView` |
| ✅ | **`WindowTitle`** | Two-line title + subtitle widget centred in a `HeaderBar` — mirrors `AdwWindowTitle` |
| ✅ | **`ShortcutLabel`** | Read-only display of a keyboard shortcut (e.g. `Ctrl+S`) with proper key-cap styling — mirrors `GtkShortcutLabel` |
| ✅ | **`ButtonContent`** | Icon + label layout helper for buttons with both an icon and text — mirrors `AdwButtonContent` |

---

## `@gnome-ui/icons` — Icon Library

> Framework-agnostic Adwaita symbolic icon definitions. Each icon is a plain `IconDefinition` object (SVG path data) consumed by the `<Icon>` component in `@gnome-ui/react`.

| Status | Category | Icons |
|--------|----------|-------|
| ✅ | **Navigation** | `GoPrevious`, `GoNext`, `GoHome`, `GoUp`, `PanDown`, `PanUp`, `PanStart`, `PanEnd` |
| ✅ | **Actions** | `Add`, `Remove`, `Delete`, `Edit`, `Copy`, `Paste`, `Cut`, `Undo`, `Redo`, `Save`, `DocumentOpen`, `Close`, `Search`, `Refresh`, `Share`, `Attachment` |
| ✅ | **UI** | `OpenMenu`, `ViewMore`, `ViewSidebar`, `ViewReveal`, `ViewConceal`, `Settings` |
| ✅ | **Status** | `Information`, `Warning`, `Error`, `Check` |
| ✅ | **People & Identity** | `Person`, `Accessibility` |
| ✅ | **System & Hardware** | `Applications`, `Notifications`, `InputMouse`, `InputKeyboard`, `InputTablet`, `ColorManagement`, `Printer`, `Lock` |
| ✅ | **Misc** | `Star`, `StarOutline`, `Heart` |
| ✅ | **Media** | `MediaPlay`, `MediaPause`, `MediaSkipForward`, `MediaSkipBackward` |

---

## Tier 17 — `@gnome-ui/layout` Package

> Dedicated npm package that ships the full-page application shell as a first-class primitive.
> Consumers can compose any GNOME application layout without pulling in the full `@gnome-ui/react` bundle.

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **`Layout`** | Full-page shell with four named zones: `topBar` (pinned header), `sidebar` (fixed-width navigation), `children` (scrollable content), and `bottomBar` (pinned footer). All zones are optional. Mirrors the composition pattern demonstrated in `Layout/Dashboard`. Ships as `@gnome-ui/layout` with its own CSS output, Vitest unit tests, and Storybook story (`Layout/Layout`). |

---

## Tier 16 — Platform Integration

> New workspaces that bridge the React layer with the GNOME host process.
> See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full dependency graph and communication model.

### `@gnome-ui/platform` — TypeScript API layer

Pure TypeScript package. Communicates with GNOME via the WebKitGTK `window.webkit.messageHandlers` bridge or XDG Desktop Portals. Falls back to no-op stubs in standard browsers / test environments.

| Status | Module | Description |
|--------|--------|-------------|
| ✅ | **`settings`** | Read/write application settings via `GSettings` |
| ✅ | **`notifications`** | Send and withdraw desktop notifications (`Gio.Notification`) |
| ✅ | **`fileChooser`** | Open/save file dialogs (`GtkFileChooserDialog` / XDG portal) |
| ✅ | **`colorScheme`** | Detect and change the Adwaita color scheme (light/dark/auto) |
| ✅ | **`window`** | Query and change window state (maximize, minimize, fullscreen, close) |
| ✅ | **`clipboard`** | Read and write the GDK clipboard (text, files, images) |
| ✅ | **`portals`** | Low-level XDG Desktop Portal access for sandboxed (Flatpak) apps |

### `@gnome-ui/hooks` — React hooks

React hooks that surface every `@gnome-ui/platform` module as idiomatic React state.

| Status | Hook | Description |
|--------|------|-------------|
| ✅ | **`useRuntime`** | Full runtime snapshot: shell, engine, browser, OS |
| ✅ | **`usePlatform`** | Convenience booleans for the current shell context (`isGnomeWebView`, `isPWA`…) |
| ✅ | **`useNativeEvent`** | Subscribe to an event dispatched by the GJS host via `gnome:` prefix |
| ✅ | **`useBreakpoint`** | Reactive `isMobile`, `isTablet`, `isDesktop` flags based on GNOME HIG breakpoints |
| ✅ | **`useSettings`** | Read and write a GSettings key; re-renders on external changes |
| ✅ | **`useNotification`** | Returns a `send(title, body, icon?)` helper and dismissal control |
| ✅ | **`useColorScheme`** | Returns `"light" \| "dark" \| "auto"` and a setter |
| ✅ | **`useFileChooser`** | Returns an `open()` / `save()` trigger and the resolved file path |
| ✅ | **`useClipboard`** | Returns `{ value, copy, paste }` with reactive clipboard state |
| ✅ | **`useWindowState`** | Returns `{ maximized, fullscreen, focused }` and matching setters |
| ⬜ | **`useHapticFeedback`** | Trigger haptic feedback via feedbackd (native) or Vibration API (browser) — issue [#81](https://github.com/ElJijuna/gnome-ui/issues/81) |

---

## GNOME 50 Compatibility

> Items identified from GNOME 50 (libadwaita 1.9, March 2026) that require new work or updates.

### Accessibility — `prefers-reduced-motion`

| Status | Item | Description |
|--------|------|-------------|
| ✅ | **`ExpanderRow`** | Disable `grid-template-rows` transition and chevron rotate on reduced-motion |
| ✅ | **`PanelCard`** (`@gnome-ui/layout`) | Disable `grid-template-rows` collapse transition on reduced-motion |
| ✅ | **`Layout`** (`@gnome-ui/layout`) | Disable mobile sidebar slide-in transition on reduced-motion |

### CSS theming

| Status | Item | Description |
|--------|------|-------------|
| ✅ | **Unified `style.css`** | GNOME 50 deprecates autoloaded `style-dark.css` / `style-hc.css` in favour of a single file with `@media` queries — `tokens.css` already follows this pattern |

### Adaptive layout guidance

| Status | Item | Description |
|--------|------|-------------|
| ✅ | **Mobile-first audit** | Verified 400/550/860 sp thresholds and mobile-first defaults; added swipe-to-dismiss to `OverlaySplitView`; added `NarrowViewport` stories to `NavigationSplitView`, `OverlaySplitView`, and `BreakpointBin` — issue [#15](https://github.com/ElJijuna/gnome-ui/issues/15) |

### New widgets

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **`ColumnView`** | Multi-column sortable data table — mirrors `GtkColumnView` / `AdwColumnView` (issue [#14](https://github.com/ElJijuna/gnome-ui/issues/14)) |

---

## `@gnome-ui/charts` — Chart Components

> Data visualisation components built on top of Recharts, fully styled with Adwaita design tokens.

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **`LineChart`** | Multi-series time-series line chart |
| ✅ | **`BarChart`** | Grouped and stacked bar chart |
| ✅ | **`AreaChart`** | Filled-area chart for cumulative data |

---

## Tier 18 — Data Display

> Read-only data display widgets rendered in pure HTML/SVG — no Recharts dependency.

| Status | Component | Description |
|--------|-----------|-------------|
| 🚧 | **`ContributionGraph`** | Activity heatmap calendar: a 52-week grid of rounded SVG cells where colour intensity (Adwaita green palette) represents activity count; supports dark mode, keyboard navigation (`role="grid"`), and screen-reader labels — issue [#21](https://github.com/ElJijuna/gnome-ui/issues/21) |

---

## Tier 19 — Dashboard Components (`@gnome-ui/layout`)

> Purpose-built components for composing dashboard and monitoring views.

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **`DashboardGrid`** | Responsive CSS Grid container for arranging dashboard widgets; supports column count and per-item span — issue [#82](https://github.com/ElJijuna/gnome-ui/issues/82) |
| ✅ | **`StatCard`** | Key metric display with optional trend indicator (direction, percentage, period) and loading skeleton — issue [#83](https://github.com/ElJijuna/gnome-ui/issues/83) |
| ⬜ | **`ProgressCard`** | Resource usage card with labelled progress bar; color thresholds at 75 % (warning) and 90 % (critical) — issue [#84](https://github.com/ElJijuna/gnome-ui/issues/84) |
| ⬜ | **`ActivityFeed`** | Chronological event list with relative timestamps, icons, and truncation — issue [#85](https://github.com/ElJijuna/gnome-ui/issues/85) |
| ⬜ | **`QuickActions`** | Grid of shortcut action buttons with keyboard navigation — issue [#86](https://github.com/ElJijuna/gnome-ui/issues/86) |
| ⬜ | **`StatusIndicator`** | Service/connection status dot: `online`, `offline`, `warning`, `error`, `loading` — issue [#87](https://github.com/ElJijuna/gnome-ui/issues/87) |
| ⬜ | **`SectionHeader`** | Section title row with optional subtitle and trailing action slot — issue [#88](https://github.com/ElJijuna/gnome-ui/issues/88) |
| ✅ | **`EmptyState`** | Centered empty-state illustration: icon, title, description, optional CTA — issue [#89](https://github.com/ElJijuna/gnome-ui/issues/89) |
| ✅ | **`StatusIndicator`** | Service/connection status dot: `online`, `offline`, `warning`, `error`, `loading` — issue [#87](https://github.com/ElJijuna/gnome-ui/issues/87) |
| ✅ | **`ErrorState`** | Error state with preset types (`generic`, `network`, `permission`, `not-found`) and recovery action slot — issue [#90](https://github.com/ElJijuna/gnome-ui/issues/90) |

---

## Infrastructure

| Status | Item | Description |
|--------|------|-------------|
| ✅ | **`@gnome-ui/hooks` tree-shaking** | `sideEffects: false` + `vite-magic-tree-shaking` per-hook entries; consumers importing a single hook no longer receive the full bundle — issue [#76](https://github.com/ElJijuna/gnome-ui/issues/76) |
