# @gnome-ui/layout — Roadmap

> App-level layout components that compose `@gnome-ui/react` primitives following
> the GNOME Human Interface Guidelines and the Adwaita pattern.

---

## Implemented

| Status | Component | Description |
|--------|-----------|-------------|
| ✅ | **`Layout`** | App shell with named zones: `header`/`topBar` (pinned), `sidebar` (fixed-width nav), `children` (scrollable content), `footer`/`bottomBar` (pinned). Supports `viewport`/`parent` height, scroll models, mobile sidebar overlay, rail collapse, `start`/`end` placement, focus trapped inside the overlay, and `Escape`/backdrop close |
| ✅ | **`AppHeader`** | Ready-to-use top bar with title/subtitle, leading controls, navigation, search, and actions. Wraps `HeaderBar`/`WindowTitle` patterns into one opinionated layout piece |
| ✅ | **`PageContent`** | Page container with GNOME padding rhythm, `as` prop, optional max-width via `Clamp`, and `sm`/`md`/`lg`/`xl`/numeric sizes |
| ✅ | **`SidebarShell`** | Ready-made vertical sidebar: fixed header, scrollable `Sidebar`-based nav area, fixed footer, and passthrough props (`collapsed`, `searchable`, `filter`, `mode`, `variant`) |
| ✅ | **`SidebarTrigger`** | Header button controlling the sidebar with one consistent gesture across sizes: opens/closes the overlay on narrow screens, toggles rail collapse on wide screens |
| ✅ | **`StatusBar`** | Compact footer bar built on `Toolbar`, for status, counters, secondary actions, or app metadata |
| ✅ | **`UserCard`** | User identity panel for sidebars, popovers, or profile pages |
| ✅ | **`DashboardGrid`** | Responsive 12-column grid with per-item breakpoint span, offset, and responsive gap |
| ✅ | **`MasonryGrid`** | Variable-height grid packing items into the shortest column first — suited to heterogeneous content like galleries or feeds |
| ✅ | **`AdaptiveLayout`** | Adaptive shell switching between a bottom nav bar (mobile) and a sidebar (desktop) by breakpoint, following the `AdwNavigationView` pattern |
| ✅ | **`PanelCard`** | Collapsible panel card with header, scrollable content, and action footer — useful for dashboards and detail views |
| ✅ | **`StatCard`** | Metric card with formatted numeric value, directional trend (up/down/neutral), and label. Respects `GnomeProvider` locale/format |
| ✅ | **`CounterCard`** | Metric card with an animated counter (cubic ease-out from 0 to the target value). Respects `prefers-reduced-motion` |
| ✅ | **`ProgressCard`** | Resource-usage card with a labelled progress bar. Fill color changes automatically by threshold: accent (< 75%), warning (≥ 75%), error (≥ 90%). Supports skeleton/spinner loading states |
| ✅ | **`EntityCard`** | Generic entity card with avatar, title, subtitle, metadata, and actions — base for resource lists (contacts, devices, files) |
| ✅ | **`ApplicationCard`** | App card with icon, name, description, stats, and a primary action — for catalogs and GNOME-Software-style app dashboards |
| ✅ | **`IconBadge`** | Rounded-square icon container with a background tinted at 15% opacity. Accepts the seven named colors or any hex value |
| ✅ | **`StatusIndicator`** | Circular status dot (online/offline/warning/error/idle) with an optional label. Follows GNOME HIG semantic color usage |
| ✅ | **`QuickActions`** | Grid of quick-access action buttons, keyboard-navigable (arrow keys). Disabled actions are skipped automatically |
| ✅ | **`EmptyState`** | Empty-state screen with SVG/icon illustration, title, description, and primary/secondary CTA — opinionated take on `StatusPage` for content panels |
| ✅ | **`ErrorState`** | Structured error state with a type (404/500/network/permission), title, description, and recovery action. Preset types adapt the message to context |
| ✅ | **`Toast`** | Transient bottom-center notifications with a FIFO queue, configurable auto-dismiss, one optional action, and enter/exit animation. Exports `ToastProvider`/`useToast` |
| ✅ | **`Banner`** | Persistent status strip at the top of the view. Does not auto-dismiss. Semantic variants (info/success/warning/error), optional action, parent-controlled close — use `Toast` for one-off events |
| ✅ | **`ChartCard`** | Structured card shell for dashboard charts: header, optional metric/trend, action slot |
| ✅ | **`ProfileCard`** | User profile dashboard card: avatar, name, handle, optional status dot, stats row, decorative background chart |
| ✅ | **`ActivityFeed`** | Chronological event list with relative timestamps, optional icons, skeleton loading, and a "Show more" affordance |
| ✅ | **`SectionHeader`** | Section title row with an optional subtitle and trailing action slot |
| ✅ | **`TeamCard`** | Group card: avatar group, team name, member count — distinct from `UserCard`, which represents a single user's identity |

---

## Backlog

> Proposed but unbuilt components, cross-checked against the 27 implemented
> components above to avoid duplication. Each row that could be confused with
> an existing component includes an explicit differentiation clause.

| Status | Component | Description |
|--------|-----------|-------------|
| ⬜ | **`SplitLayout`** | Two-column shell: list/master on the left, detail on the right. Collapses to a single column on mobile, following the `AdwNavigationSplitView` pattern |
| ⬜ | **`ResizablePanel`** | Two or more panels separated by a draggable divider, based on the `GtkPaned` pattern — foundational for user-resizable master-detail layouts (code editors, file explorers, analytics dashboards) |
| ⬜ | **`DrawerPanel`** | Side panel that slides over content from any edge — web equivalent of `AdwBottomSheet` (mobile) and `AdwOverlaySplitView` in overlay mode (desktop). Ideal for filters, contextual settings, and detail views without leaving the page |
| ⬜ | **`SkeletonCard`** | Animated shimmer loading placeholder for cards and lists — per GNOME HIG, perceived structure is preferred over an empty spinner. Supports `card`, `list-item`, `text` variants and free composition |
| ⬜ | **`CommandPalette`** | Global action/navigation search, GNOME Shell Activities style. Triggered by a keyboard shortcut (`Ctrl+K`). Keyboard-first: arrow-key navigation, `Enter` to activate, `Escape` to close. Supports grouped results and preview |
| ⬜ | **`DataTable`** | Sortable data table with multi-select and virtualized scrolling, following the `GtkColumnView` pattern. Configurable columns, per-row actions, built-in empty state, async data support with skeleton loading |
| ⬜ | **`DialogLayout`** | Internal shell for large `Dialog`s (preferences, wizards): side navigation section + scrollable content area + fixed action bar footer. Based on the `AdwPreferencesDialog` pattern |
| ⬜ | **`NotificationCenter`** | Slide-out side panel (right drawer) listing grouped notifications. Uses `DrawerPanel` internally once implemented |
| ⬜ | **`WizardShell`** | Multi-step flow shell composing `StepIndicator` (react) with a content pane and a back/next action footer. GNOME Initial Setup pattern |
| ⬜ | **`OnboardingOverlay`** | "Tour" overlay with a spotlight on a page region, an explanatory callout bubble, and Skip/Next controls — for guided onboarding sequences without leaving the app |
| ⬜ | **`ThreePaneLayout`** | Three-column mail-client-style layout (folders + list + reading pane) — distinct from `SplitLayout`, which is two columns and collapses to one on mobile via the navigable master-detail pattern |
| ⬜ | **`InspectorLayout`** | Three-zone shell for editing/creation apps: central canvas + collapsible left tool rail + collapsible right inspector panel (GIMP/Blender style) |
| ⬜ | **`TabbedWorkspace`** | Multi-document shell: tab strip, new-tab button, overflow menu for tabs that don't fit, and a content area |
| ⬜ | **`KanbanBoard`** | Horizontally scrolling columns for Kanban-style boards — layout only, visual arrangement of columns and slots, no drag-and-drop logic included |
| ⬜ | **`CanvasToolbarOverlay`** | Floating pill-shaped toolbar overlaid on canvas/editor content — distinct from `Toolbar` (react), which is a fixed in-flow bar, not floating |
| ⬜ | **`TimelineLayout`** | Vertical or horizontal chronological timeline with a connector line and markers, with free content slots per entry — distinct from `ActivityFeed`, a fixed list of items with relative timestamps that doesn't support arbitrary rich content per entry |
| ⬜ | **`TimelineCard`** | Individual event card meant for use inside `TimelineLayout`: date badge, icon, title, description, actions |
| ⬜ | **`ComparisonLayout`** | Side-by-side columns (stacked on mobile) for comparing N options, with a highlighted "recommended" column — pricing-table pattern |
| ⬜ | **`ComparisonCard`** | Column card for `ComparisonLayout`: price, feature list, CTA, optional "popular" ribbon |
| ⬜ | **`DiffLayout`** | Side-by-side (or unified) technical comparison shell with a line gutter, for code/config diffs — distinct from `ComparisonLayout`, which is marketing/product-facing, not technical |
| ⬜ | **`OrgChartLayout`** | Hierarchical tree layout for org charts or dependency trees — visual-arrangement algorithm only (like `MasonryGrid`/`DashboardGrid`); each node's content is passed as children |
| ⬜ | **`CalendarGridLayout`** | Month/week grid for calendar apps (cells + event slots) — distinct from `DatePicker` (react, pending), a compact popover picker, not a full calendar view |
| ⬜ | **`HeatmapLayout`** | Generic configurable 2D heatmap grid (rows × columns + color scale) — distinct from `ContributionGraph` (charts), which is specifically the 52-week GitHub-style grid |
| ⬜ | **`GaugeCard`** | Metric card with a radial/arc gauge — distinct from `ProgressCard`, which uses a linear bar |
| ⬜ | **`ComparisonStatCard`** | Metric card showing two values side by side (this period vs. last) plus the delta between them — distinct from `StatCard`, which shows a single trend arrow |
| ⬜ | **`ChecklistCard`** | Card with an onboarding task checklist ("3 of 5 complete") — distinct from `ProgressCard` (resource usage) and `QuickActions` (action-button grid) |
| ⬜ | **`AnnouncementCard`** | Dismissible feature-announcement card with an image and a "Learn more" action — distinct from `Banner`, which communicates system status, not promotional content |
| ⬜ | **`MapCard`** | Location preview card: static map, address, "Open in Maps" action |
| ⬜ | **`MediaCard`** | Card optimized for an image/video thumbnail, title, and metadata (duration or size) — for media galleries/libraries |
| ⬜ | **`IntegrationCard`** | Third-party service connection card: logo, name, connected/disconnected status, connect/disconnect action — for Settings/Integrations pages |
| ⬜ | **`BreadcrumbBar`** | Full-width bar hosting a `PathBar` (react) plus trailing actions — a shell/wrapper, does not duplicate `PathBar` itself |
| ⬜ | **`SecondaryNavBar`** | Horizontal sub-navigation bar under the main header, full-width pill/underline tabs — GNOME Settings category pattern |
| ⬜ | **`PageHeaderBar`** | Page-content header: title, description, trailing action buttons, optional tab strip below. Lives inside `PageContent`; distinct from `AppHeader`, the app/window-level header |
| ⬜ | **`FloatingActionBar`** | Bottom-center floating bar that appears contextually (e.g. "3 items selected" + bulk actions) — distinct from `Toast` (not a notification, persists while the selection lasts) and `StatusBar` (not fixed, appears/disappears) |
| ⬜ | **`StickyToc`** | Sticky table-of-contents side rail with scroll-spy highlighting the active section — for long docs/settings pages |
| ⬜ | **`FilterSidebar`** | Left rail dedicated to faceted filters (checkbox groups, ranges) with a "Clear all"/"Apply" footer |
| ⬜ | **`ResultsLayout`** | Search/listing page shell: `FilterSidebar` slot, sort/view toolbar, results grid/list area, pagination footer — composes `FilterSidebar` and the results toolbar |
| ⬜ | **`MapLayout`** | Split shell for map-based apps: map canvas area plus a collapsible list/detail side panel |
| ⬜ | **`FullscreenOverlay`** | Full-viewport takeover (immersive image viewer, video player, presentation mode) — distinct from `Modal`/`Dialog` (react), which are bounded-size dialogs |
| ⬜ | **`PrintLayout`** | Print-optimized page wrapper: hides nav/sidebar via `@media print`, adds a print header/footer — for exports and reports |

---

## Composition demos

Stories illustrating how to combine this package's primitives into complete
GNOME interfaces. They don't produce exportable components.

- **FileManager** — Nautilus-style file browser with a dual header bar and `AdwOverlaySplitView`.
- **Settings** — GNOME-Settings-style preferences app with `NavigationSplitView` and a side category list.

---

## Package conventions

- Layout components may import from `@gnome-ui/react`, **never the reverse**.
- Own styles go in `ComponentName.module.css`; design tokens come from `@gnome-ui/core`.
- Every component exports a named `Props` type.
- Numeric values must use `@gnome-ui/react`'s `useNumberFormatter` to respect `GnomeProvider` (`locale`, `numberFormat`) unless the component exposes its own explicit `format` prop.
- Stories use `layout: "fullscreen"` to show real-context behavior.
