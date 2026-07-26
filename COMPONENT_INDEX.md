# Component Index

Snapshot: 2026-06-30.

Scope: `@gnome-ui/react`, `@gnome-ui/layout`, `@gnome-ui/charts`.

## Inventory

| Package | Public component dirs | Root index | Package subpath exports | Notes |
|---------|-----------------------|------------|--------------------------|-------|
| `@gnome-ui/react` | 84 | 84 | 84 component paths + 2 provider internals | Full root export parity. Added missing `ScrollToTop` subpath export. |
| `@gnome-ui/layout` | 28 | 28 | 28 | Added `ChartCard`; added missing `LoadingStatus` subpath export. |
| `@gnome-ui/charts` | 14 | 14 | 14 | Added missing `ComposedChart`, `FunnelChart`, `ScatterChart` subpath exports. |

Coverage/doc shape:

| Artifact | Count |
|----------|-------|
| Component `index.ts` files | 126 |
| Component READMEs | 123 |
| Component stories | 124 |
| Component tests | 101 |

## `@gnome-ui/react`

Foundation:

- Controls: `Button`, `IconButton`, `SplitButton`, `ButtonContent`, `Switch`, `Checkbox`, `RadioButton`, `TextField`, `SpinButton`, `Slider`, `Dropdown`, `SearchBar`, `Link`, `ToggleGroup`, `InlineViewSwitcher`, `PathBar`, `ScrollToTop`.
- Display: `Text`, `Icon`, `Avatar`, `AvatarGroup`, `AvatarRotator`, `Badge`, `StatusBadge`, `Blockquote`, `Spinner`, `ProgressBar`, `SegmentedBar`, `Skeleton`, `CountDownTimer`, `StatusPage`, `Separator`, `Chip`, `ShortcutLabel`, `WindowTitle`, `Timeline`, `ContributionGraph`, `TerminalView`.
- Layout/containers: `Box`, `Card`, `Frame`, `Bin`, `HeaderBar`, `Toolbar`, `Spacer`, `ToolbarView`, `LinkedGroup`, `Sidebar`, `SidebarSection`, `SidebarItem`, `BoxedList`, `ActionRow`, `ButtonRow`, `ExpanderRow`, `SwitchRow`, `CheckRow`, `ComboRow`, `EntryRow`, `PasswordEntryRow`, `SpinRow`, `WrapBox`, `TabBar`, `TabItem`, `TabPanel`, `ViewSwitcher`, `ViewSwitcherItem`, `ViewSwitcherBar`, `ViewSwitcherSidebar`, `ViewSwitcherSidebarItem`, `Carousel`, `ShortcutsDialog`.
- Overlays: `Toast`, `Toaster`, `Dialog`, `Modal`, `BottomSheet`, `Drawer`, `Tooltip`, `Popover`, `Banner`, `AboutDialog`.
- Preferences: `PreferencesGroup`, `PreferencesPage`, `PreferencesDialog`.
- Adaptive: `useBreakpoint`, `Clamp`, `BreakpointBin`, `NavigationView`, `NavigationPage`, `NavigationSplitView`, `OverlaySplitView`.
- Provider: `GnomeProvider`, `useLocale`, `useDir`, `useColorScheme`, `useResolvedColorScheme`, `useAccentColor`, `useNumberFormatter`, `useDateTimeFormatter`.

Assessment:

- Strong GNOME/libadwaita coverage. Most widget-gallery patterns already exist.
- Main risk now: API bloat without composition guidance. New low-level widgets should be rare.
- More useful next layer: app workflow components, data density, empty/loading/error consistency.

## `@gnome-ui/layout`

Application shell:

- `Layout`, `AppHeader`, `PageContent`, `SidebarShell`, `SidebarTrigger`, `StatusBar`, `AdaptiveLayout`.

Dashboard/application composition:

- `DashboardGrid`, `MasonryGrid`, `PanelCard`, `SectionHeader`, `ActivityFeed`, `QuickActions`, `StatCard`, `CounterCard`, `ProgressCard`, `ChartCard`, `StatusIndicator`, `LoadingStatus`.

Entity/state cards:

- `ApplicationCard`, `EntityCard`, `UserCard`, `ProfileCard`, `IconBadge`, `EmptyState`, `ErrorState`, `Banner`, `Toast`.

Assessment:

- Package duplicates some `react` primitives by intention (`Banner`, `Toast`, state components) but naming can confuse consumers.
- Best future work: higher-level shells where app teams otherwise hand-roll layout glue.
- Avoid moving data table here while `ColumnView` exists in `react`; build wrappers only when async/stateful needs justify it.

## `@gnome-ui/charts`

General charts:

- `LineChart`, `AreaChart`, `BarChart`, `ComposedChart`, `PieChart`, `RadarChart`, `RadialBarChart`, `TreeMap`, `CloudChart`, `ScatterChart`, `FunnelChart`.

Compact charts:

- `SparkLineChart`, `SparkAreaChart`, `SparkBarChart`.

Utilities:

- `GNOME_CHART_PALETTE`, `ChartLegendPosition`.

Assessment:

- Chart type coverage is broad enough for dashboards.
- Biggest missing piece is not more chart shapes; it is shared chart scaffolding: headers, summaries, loading/error/empty, accessibility, export actions.
- `ContributionGraph` currently lives in `react` as pure SVG/data display; keep it there unless chart package becomes umbrella for all visualizations.

## Recommended New Components

Priority 1:

| Component | Package | Why useful | Shape |
|-----------|---------|------------|-------|
| `ChartCard` | `@gnome-ui/layout` | Done. Every dashboard chart needs same shell: title, subtitle, metric, actions, loading, empty, error. Prevents repeated `Card` + `SectionHeader` + chart glue. | `title`, `subtitle`, `value`, `trend`, `actions`, `loading`, `error`, `empty`, `children`. |
| `MetricGrid` | `@gnome-ui/layout` | Common pattern: 2-6 `StatCard`/`CounterCard` blocks with responsive columns. Thin wrapper over `DashboardGrid`, but names intent. | `items`, `columns`, `loading`, `renderItem`. |
| `ResourceMeter` | `@gnome-ui/react` | `ProgressBar` + threshold label/status appears in CPU/memory/storage/settings. Smaller primitive than `ProgressCard`. | `value`, `max`, `label`, `format`, `thresholds`, `variant`. |
| `FilterBar` | `@gnome-ui/react` | Search + chips + dropdown filters + clear action is common across lists/tables. Current pieces exist, composition repeats. | `query`, `filters`, `activeFilters`, `onClear`, slots. |
| `PageHeader` | `@gnome-ui/layout` | App pages need consistent title/subtitle/actions above content; `AppHeader` is shell-level. | `title`, `subtitle`, `breadcrumbs`, `actions`, `metadata`. |

Priority 2:

| Component | Package | Why useful | Shape |
|-----------|---------|------------|-------|
| `DataState` | `@gnome-ui/react` | Standardizes loading/empty/error/success branching around content. Reduces repeated conditional UI. | `loading`, `error`, `empty`, `skeleton`, `children`. |
| `SelectionToolbar` | `@gnome-ui/react` | Lists/tables need bulk actions once items selected. GNOME apps use contextual bars often. | `selectedCount`, `actions`, `onClear`. |
| `DateRangePicker` | `@gnome-ui/react` | Charts/filtering need time ranges. Current controls lack date/range primitive. | `value`, `onChange`, `presets`, `locale`. |
| `Pagination` | `@gnome-ui/react` | `ColumnView`/cards need page controls when virtualization not desired. | `page`, `pageCount`, `onPageChange`, `totalItems`. |
| `DetailsList` | `@gnome-ui/react` | Read-only key/value metadata is common; `ActionRow variant="property"` helps but verbose. | `items`, `columns`, `copyable`, `orientation`. |

Priority 3:

| Component | Package | Why useful | Shape |
|-----------|---------|------------|-------|
| `ResizablePanel` | `@gnome-ui/layout` | Existing layout roadmap item; useful for editors/file managers/analytics. | `direction`, `defaultSizes`, `minSizes`, children. |
| `CommandPalette` | `@gnome-ui/layout` | Existing roadmap item; app-level nav/action search. High utility but bigger API. | `open`, `items`, `groups`, `onSelect`, `shortcut`. |
| `NotificationCenter` | `@gnome-ui/layout` | Complements `Toast`; useful for persistent notifications/history. | `items`, `groups`, `onDismiss`, `actions`. |
| `KpiChartCard` | `@gnome-ui/layout` | Opinionated combo: metric + spark chart + trend. Very dashboard-useful, but can be built after `ChartCard`. | `metric`, `trend`, `spark`, `period`. |
| `ExportMenu` | `@gnome-ui/react` | Charts/tables commonly expose CSV/PNG/copy actions. Generic menu avoids per-chart duplication. | `items`, `formats`, `onExport`. |

## Do Not Add Yet

- New primitive chart types before `ChartCard`/data-state exists. Current chart coverage already broad.
- More row variants unless direct libadwaita/HIG pattern exists. `ActionRow` + slots covers many.
- Another `DataTable` in `layout`; `ColumnView` exists in `react`. If async table needed, make `DataView` wrapper using `ColumnView`.
- Separate `DrawerPanel`; `Drawer`, `BottomSheet`, `OverlaySplitView` already cover most overlay panel needs. Add only if common filter/detail drawer API emerges.

## Implementation Rules For Next Components

- Package boundary: `react` = primitives, `layout` = app/workflow composition, `charts` = visualization primitives/utilities.
- Export parity: every public component needs root export, per-component `index.ts`, package subpath export, README, story, focused test.
- Accessibility: named controls, keyboard path, ARIA only where semantic HTML is insufficient.
- Intl: numbers/dates use `GnomeProvider` formatter hooks unless component receives explicit formatter.
- Motion: all transitions respect `prefers-reduced-motion`.
- Dependencies: avoid new runtime deps unless domain logic is hard and proven lib exists.
