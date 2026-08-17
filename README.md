# gnome-ui

A React component library that faithfully implements the [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/), built on top of the [Adwaita](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/) design language.

[![npm](https://img.shields.io/npm/v/@gnome-ui/react)](https://www.npmjs.com/package/@gnome-ui/react)
[![CI](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/badge/gnome--ui-docs-3584e4)](https://gnome-ui.org/)
[![Storybook](https://img.shields.io/badge/Storybook-live-ff4785?logo=storybook&logoColor=white)](https://gnome-ui.org/react/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Read the guides, architecture, design guidelines, roadmap, and changelog at
**[gnome-ui.org](https://gnome-ui.org/)** — and
browse every component live, with real interactive previews, in each
package's own Storybook (linked throughout, and per-row in the tables
below).

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@gnome-ui/core`](packages/core) | Framework-agnostic design tokens (CSS custom properties) | [![npm](https://img.shields.io/npm/v/@gnome-ui/core)](https://www.npmjs.com/package/@gnome-ui/core) |
| [`@gnome-ui/icons`](packages/icons) | Framework-agnostic Adwaita symbolic icon definitions (SVG path data) | [![npm](https://img.shields.io/npm/v/@gnome-ui/icons)](https://www.npmjs.com/package/@gnome-ui/icons) |
| [`@gnome-ui/react`](packages/react) | React component library | [![npm](https://img.shields.io/npm/v/@gnome-ui/react)](https://www.npmjs.com/package/@gnome-ui/react) |
| [`@gnome-ui/layout`](packages/layout) | Full-page application shell and dashboard components | [![npm](https://img.shields.io/npm/v/@gnome-ui/layout)](https://www.npmjs.com/package/@gnome-ui/layout) |
| [`@gnome-ui/platform`](packages/platform) | TypeScript bridge to GNOME host APIs (GSettings, portals, notifications…) | [![npm](https://img.shields.io/npm/v/@gnome-ui/platform)](https://www.npmjs.com/package/@gnome-ui/platform) |
| [`@gnome-ui/hooks`](packages/hooks) | React hooks that surface `@gnome-ui/platform` APIs as idiomatic React state | [![npm](https://img.shields.io/npm/v/@gnome-ui/hooks)](https://www.npmjs.com/package/@gnome-ui/hooks) |
| [`@gnome-ui/charts`](packages/charts) | Data visualisation components (Line, Bar, Area) styled with Adwaita tokens | [![npm](https://img.shields.io/npm/v/@gnome-ui/charts)](https://www.npmjs.com/package/@gnome-ui/charts) |
| [`@gnome-ui/react-native`](packages/react-native) | React Native components for iOS/Android/GNOME-mobile | [![npm](https://img.shields.io/npm/v/@gnome-ui/react-native)](https://www.npmjs.com/package/@gnome-ui/react-native) |

## Quick start

```bash
npm install @gnome-ui/react
```

```tsx
import { Button } from "@gnome-ui/react";
import "@gnome-ui/react/styles";

export default function App() {
  return (
    <Button variant="suggested" onClick={() => console.log("clicked")}>
      Save Changes
    </Button>
  );
}
```

### Locale & number formatting

Wrap your app in `GnomeProvider` to share locale, text direction, and default `Intl` options across `@gnome-ui/react`, `@gnome-ui/layout`, and `@gnome-ui/charts`.

```tsx
import { GnomeProvider } from "@gnome-ui/react";

<GnomeProvider
  locale="en-US"
  numberFormat={{ notation: "compact", compactDisplay: "short" }}
>
  <App />
</GnomeProvider>
```

Compact notation renders values like `1K`; standard notation renders values like `1,000`.

> **Tokens only** (framework-agnostic):
> ```bash
> npm install @gnome-ui/core
> ```
> ```css
> @import "@gnome-ui/core/styles";
> ```

## Components

Live examples and documentation: **[Storybook →](https://gnome-ui.org/react/)**

AI assistants and coding agents can use [`llms.txt`](https://gnome-ui.org/llms.txt)
for a compact documentation index or
[`llms-full.txt`](https://gnome-ui.org/llms-full.txt) for complete context.

| Component | Description | Story |
|-----------|-------------|-------|
| `Button` | Default, Suggested, Destructive, Flat, Pill, Circular | [Docs](https://gnome-ui.org/react/?path=/docs/components-button--docs) |
| `IconButton` | Accessible icon-only action button with variants, sizes, optional tooltip, and ref/HTML button attribute support | [Docs](https://gnome-ui.org/react/?path=/docs/components-iconbutton--docs) |
| `Text` | 12 Adwaita type styles: large-title, title-1…4, heading, body, caption… | [Docs](https://gnome-ui.org/react/?path=/docs/components-text--docs) |
| `Card` | Elevated surface for grouping content; static or interactive (activatable) | [Docs](https://gnome-ui.org/react/?path=/docs/components-card--docs) |
| `Spinner` | Indeterminate loading indicator; sm/md/lg sizes, accessible label | [Docs](https://gnome-ui.org/react/?path=/docs/components-spinner--docs) |
| `Avatar` | Circular user image with deterministic-color initials fallback | [Docs](https://gnome-ui.org/react/?path=/docs/components-avatar--docs) |
| `Separator` | Horizontal/vertical dividing line between content groups | [Docs](https://gnome-ui.org/react/?path=/docs/components-separator--docs) |
| `Switch` | On/off toggle for settings that apply immediately | [Docs](https://gnome-ui.org/react/?path=/docs/components-switch--docs) |
| `Checkbox` | Multi-selection with checked, unchecked, and indeterminate states | [Docs](https://gnome-ui.org/react/?path=/docs/components-checkbox--docs) |
| `TextField` | Text input with label, helper text, and error state | [Docs](https://gnome-ui.org/react/?path=/docs/components-textfield--docs) |
| `RadioButton` | Single-selection within a group; keyboard arrow-key navigation | [Docs](https://gnome-ui.org/react/?path=/docs/components-radiobutton--docs) |
| `ProgressBar` | Determinate (0–1) and indeterminate progress indicator | [Docs](https://gnome-ui.org/react/?path=/docs/components-progressbar--docs) |
| `Banner` | Persistent message strip with optional action and dismiss | [Docs](https://gnome-ui.org/react/?path=/docs/components-banner--docs) |
| `HeaderBar` | Title bar with centered title and leading/trailing action slots | [Docs](https://gnome-ui.org/react/?path=/docs/components-headerbar--docs) |
| `Badge` | Counter or status dot, optionally anchored over another element | [Docs](https://gnome-ui.org/react/?path=/docs/components-badge--docs) |
| `Icon` | React adapter for `@gnome-ui/icons` — inline SVG, inherits `currentColor` | [Docs](https://gnome-ui.org/react/?path=/docs/components-icon--docs) |
| `Sidebar` / `SidebarSection` / `SidebarItem` | Lateral navigation panel with sections, suffix widgets, tooltips, and context menus — updated for GNOME 50 | [Docs](https://gnome-ui.org/react/?path=/docs/components-sidebar--docs) |
| `SpinButton` | Numeric input with −/+ buttons, keyboard nav, decimal support | [Docs](https://gnome-ui.org/react/?path=/docs/components-spinbutton--docs) |
| `TabBar` / `TabItem` / `TabPanel` | Tab-based navigation with keyboard support and optional close buttons | [Docs](https://gnome-ui.org/react/?path=/docs/components-tabs--docs) |
| `ActionRow` | Settings row with title, subtitle, and trailing widget | [Docs](https://gnome-ui.org/react/?path=/docs/components-actionrow--docs) |
| `BoxedList` | Rounded bordered list of rows — canonical GNOME settings pattern | [Docs](https://gnome-ui.org/react/?path=/docs/components-boxedlist--docs) |
| `ViewSwitcher` / `ViewSwitcherItem` | Segmented pill control for switching between 2–4 top-level views | [Docs](https://gnome-ui.org/react/?path=/docs/components-viewswitcher--docs) |
| `ViewSwitcherSidebar` / `ViewSwitcherSidebarItem` | Sidebar-style view switcher for 5+ views with optional counts — mirrors `AdwViewSwitcherSidebar` (GNOME 50) | [Docs](https://gnome-ui.org/react/?path=/docs/components-viewswitchersidebar--docs) |
| `SearchBar` | Collapsible search bar with auto-focus, clear button, and optional filter row | [Docs](https://gnome-ui.org/react/?path=/docs/components-searchbar--docs) |
| `Toast` / `Toaster` | Non-blocking temporary notification with auto-dismiss, action, and queue support | [Docs](https://gnome-ui.org/react/?path=/docs/components-toast--docs) |
| `Dialog` | Blocking modal with title, body, focus trap, and configurable buttons | [Docs](https://gnome-ui.org/react/?path=/docs/components-dialog--docs) |
| `Drawer` | Slide-over panel that opens from the left or right with React content | [Docs](https://gnome-ui.org/react/?path=/docs/components-drawer--docs) |
| `Tooltip` | Floating informational label on hover/focus with auto-flip positioning | [Docs](https://gnome-ui.org/react/?path=/docs/components-tooltip--docs) |
| `StatusPage` | Empty-state page with icon, title, description, and optional actions | [Docs](https://gnome-ui.org/react/?path=/docs/components-statuspage--docs) |
| `Dropdown` | Expandable option list with keyboard nav, flip positioning, and descriptions | [Docs](https://gnome-ui.org/react/?path=/docs/components-dropdown--docs) |
| `Slider` | Draggable range control with tick marks, decimal steps, and keyboard nav | [Docs](https://gnome-ui.org/react/?path=/docs/components-slider--docs) |
| `Popover` | Floating panel with rich interactive content, arrow, and auto-flip positioning | [Docs](https://gnome-ui.org/react/?path=/docs/components-popover--docs) |
| `useBreakpoint` | Hook tracking viewport width against GNOME breakpoints (400 / 550 / 860 px) | [Docs](https://gnome-ui.org/react/?path=/docs/adaptive-usebreakpoint--docs) |
| `Clamp` | Constrains content to a max width, centering it — mirrors `AdwClamp` | [Docs](https://gnome-ui.org/react/?path=/docs/adaptive-clamp--docs) |
| `NavigationSplitView` | Two-pane layout that collapses to single pane at ≤ 400 px | [Docs](https://gnome-ui.org/react/?path=/docs/adaptive-navigationsplitview--docs) |
| `OverlaySplitView` | Sidebar becomes slide-over overlay at ≤ 400 px | [Docs](https://gnome-ui.org/react/?path=/docs/adaptive-overlaysplitview--docs) |
| `ViewSwitcherBar` | Bottom bar for `ViewSwitcher` items on narrow screens (≤ 550 px) | [Docs](https://gnome-ui.org/react/?path=/docs/adaptive-viewswitcherbar--docs) |
| `BreakpointBin` | Fires layout changes when the **container** crosses a width threshold (`ResizeObserver`) — mirrors `AdwBreakpointBin` (GNOME 50) | [Docs](https://gnome-ui.org/react/?path=/docs/adaptive-breakpointbin--docs) |
| `Link` | Inline hyperlink with accent colour, animated underline, and external-URL variant | [Docs](https://gnome-ui.org/react/?path=/docs/components-link--docs) |
| `ToggleGroup` / `ToggleGroupItem` | Mutually-exclusive toggle buttons for in-place option selection — mirrors `AdwToggleGroup` (GNOME 48) | [Docs](https://gnome-ui.org/react/?path=/docs/components-togglegroup--docs) |
| `WrapBox` | Flexible wrapping layout container — mirrors `AdwWrapBox` (GNOME 48) | [Docs](https://gnome-ui.org/react/?path=/docs/components-wrapbox--docs) |
| `Chip` | Compact pill label for tags and filters; static, removable, and selectable modes | [Docs](https://gnome-ui.org/react/?path=/docs/components-chip--docs) |
| `ShortcutsDialog` | Modal listing keyboard shortcuts by section with integrated search — mirrors `AdwShortcutsDialog` (GNOME 49) | [Docs](https://gnome-ui.org/react/?path=/docs/components-shortcutsdialog--docs) |

### Layout shells & dashboard (`@gnome-ui/layout`)

| Component | Description | Story |
|-----------|-------------|-------|
| `Layout` | Full-page shell with named zones: `header`/`topBar`, `sidebar`, `children`, `footer`/`bottomBar`; supports sidebar overlay, rail collapse, placement, and scroll modes | [Docs](https://gnome-ui.org/react/?path=/docs/layout-layout--docs) |
| `AppHeader` | GNOME application header for `Layout.header` with leading, title/subtitle, navigation, search, and action slots | [Docs](https://gnome-ui.org/react/?path=/docs/layout-appheader--docs) |
| `SidebarShell` | Full-height sidebar composition with fixed header/footer and scrollable `Sidebar` navigation | [Docs](https://gnome-ui.org/react/?path=/docs/layout-sidebarshell--docs) |
| `SidebarTrigger` | Header button that toggles sidebar overlay on narrow screens and rail collapse on wider screens | [Docs](https://gnome-ui.org/react/?path=/docs/layout-sidebartrigger--docs) |
| `PageContent` | Scroll-safe content container with GNOME page padding and optional Adwaita clamp widths | [Docs](https://gnome-ui.org/react/?path=/docs/layout-pagecontent--docs) |
| `StatusBar` | Compact footer/status bar for `Layout.footer` with optional trailing status/actions | [Docs](https://gnome-ui.org/react/?path=/docs/layout-statusbar--docs) |
| `AdaptiveLayout` | Responsive layout that adapts column structure to the available width | [Docs](https://gnome-ui.org/react/?path=/docs/layout-adaptivelayout--docs) |
| `CounterCard` | Card displaying a labelled numeric count | [Docs](https://gnome-ui.org/react/?path=/docs/layout-countercard--docs) |
| `StatCard` | Key metric card with unit, trend indicator, icon, optional spark background, and loading state | [Docs](https://gnome-ui.org/react/?path=/docs/layout-statcard--docs) |
| `UserCard` | Card displaying user identity (avatar, name, role) | [Docs](https://gnome-ui.org/react/?path=/docs/layout-usercard--docs) |
| `PanelCard` | Collapsible card panel with header and body | [Docs](https://gnome-ui.org/react/?path=/docs/layout-panelcard--docs) |
| `EntityCard` | Card for displaying a generic named entity with metadata | [Docs](https://gnome-ui.org/react/?path=/docs/layout-entitycard--docs) |
| `ApplicationCard` | Card for displaying an application entry (icon, name, description) | [Docs](https://gnome-ui.org/react/?path=/docs/layout-applicationcard--docs) |
| `IconBadge` | Badge with an embedded icon | [Docs](https://gnome-ui.org/react/?path=/docs/layout-iconbadge--docs) |
| `EmptyState` | Centered empty-state with icon, title, description, and optional CTA | [Docs](https://gnome-ui.org/react/?path=/docs/layout-emptystate--docs) |
| `StatusIndicator` | Service/connection status dot: `online`, `offline`, `warning`, `error`, `loading` | [Docs](https://gnome-ui.org/react/?path=/docs/layout-statusindicator--docs) |
| `ErrorState` | Error state with presets: `generic`, `network`, `permission`, `not-found` | [Docs](https://gnome-ui.org/react/?path=/docs/layout-errorstate--docs) |
| `DashboardGrid` | Responsive dashboard container with fixed, auto, breakpoint-mapped columns, column layout, and per-item `span` | [Docs](https://gnome-ui.org/react/?path=/docs/layout-dashboardgrid--docs) |
| `QuickActions` | Grid of keyboard-navigable shortcut action buttons for dashboards and control panels | [Docs](https://gnome-ui.org/react/?path=/docs/layout-quickactions--docs) |
| `ContributionGraph` | Activity heatmap calendar (GitHub-style) rendered in pure SVG, with keyboard navigation and dark mode | [Docs](https://gnome-ui.org/react/?path=/docs/data-display-contributiongraph--docs) |

See [ROADMAP.md](https://github.com/ElJijuna/gnome-ui/blob/main/ROADMAP.md) for the full list of planned components.

## Development

### Prerequisites

- Node.js 22+
- npm 10+

### Setup

```bash
git clone https://github.com/your-org/gnome-react.git
cd gnome-react
npm install
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build all packages |
| `npm run storybook` | Start Storybook dev server at `localhost:6006` |
| `npm run build-storybook` | Build Storybook for production |
| `npm run typecheck` | Type-check all packages |
| `npm run lint` | Lint all packages |

### Project structure

```
gnome-ui/
├── packages/
│   ├── core/          # @gnome-ui/core     — CSS design tokens
│   ├── icons/         # @gnome-ui/icons    — Adwaita icon definitions (SVG path data)
│   ├── react/         # @gnome-ui/react    — React components
│   ├── layout/        # @gnome-ui/layout   — Application shell & dashboard components
│   ├── platform/      # @gnome-ui/platform — GNOME host bridge (GSettings, portals…)
│   ├── hooks/         # @gnome-ui/hooks    — React hooks for platform APIs
│   └── charts/        # @gnome-ui/charts   — Adwaita-styled chart components
├── GNOME_GUIDELINES.md
├── ROADMAP.md
└── turbo.json
```

## Contributing

Read [CONTRIBUTING.md](https://github.com/ElJijuna/gnome-ui/blob/main/CONTRIBUTING.md) before opening a pull request.

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Your commit messages determine the next version automatically via semantic-release:

| Prefix | Release |
|--------|---------|
| `feat:` | minor |
| `fix:`, `perf:`, `refactor:` | patch |
| `feat!:` or `BREAKING CHANGE:` | major |
| `chore:`, `docs:`, `test:` | no release |

## License

[MIT](LICENSE) © el_jijuna
