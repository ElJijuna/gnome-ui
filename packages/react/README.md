# @gnome-ui/react

React component library following the [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/), built on the [Adwaita](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/) design language.

[![npm](https://img.shields.io/npm/v/@gnome-ui/react)](https://www.npmjs.com/package/@gnome-ui/react)
[![CI](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml)
[![Storybook](https://img.shields.io/badge/Storybook-live-ff4785?logo=storybook&logoColor=white)](https://eljijuna.github.io/gnome-ui/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

Live documentation: **[Storybook →](https://eljijuna.github.io/gnome-ui/)**

## Installation

```bash
npm install @gnome-ui/react
```

## Setup

Import the stylesheet once at the root of your app:

```tsx
// main.tsx or App.tsx
import "@gnome-ui/react/styles";
```

## Quick example

```tsx
import { Button, TextField, Dialog } from "@gnome-ui/react";
import "@gnome-ui/react/styles";

export default function App() {
  return (
    <Button variant="suggested" onClick={() => console.log("saved")}>
      Save Changes
    </Button>
  );
}
```

## Components

### Controls

| Component | Description |
|-----------|-------------|
| [`Button`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-button--docs) | Default, Suggested, Destructive, Flat, Raised variants; `osd` overlay modifier; sm/md/lg sizes; pill and circular shapes |
| [`SplitButton`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-splitbutton--docs) | Primary action button with attached dropdown arrow; Default, Suggested, Destructive variants |
| [`Switch`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-switch--docs) | On/off toggle for settings that apply immediately |
| [`Checkbox`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-checkbox--docs) | Multi-selection with checked, unchecked, and indeterminate states |
| [`RadioButton`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-radiobutton--docs) | Single-selection within a group; keyboard arrow-key navigation |
| [`TextField`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-textfield--docs) | Text input with label, helper text, and error state |
| [`SpinButton`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-spinbutton--docs) | Numeric input with −/+ buttons, keyboard nav, decimal support |
| [`Slider`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-slider--docs) | Draggable range control with tick marks, decimal steps, and keyboard nav |
| [`Dropdown`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-dropdown--docs) | Expandable option list with keyboard nav, flip positioning, and descriptions |
| [`SearchBar`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-searchbar--docs) | Collapsible search bar with auto-focus, clear button, filter row, and `inline` variant |
| [`Link`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-link--docs) | Inline hyperlink with accent colour, animated underline, and external-URL variant |
| [`ToggleGroup`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-togglegroup--docs) / `ToggleGroupItem` | Mutually-exclusive toggle buttons; icon-only, label-only, or icon + label |
| [`InlineViewSwitcher`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-inlineviewswitcher--docs) / `InlineViewSwitcherItem` | Compact inline view switcher; `default`, `flat`, and `round` variants |

### Display

| Component | Description |
|-----------|-------------|
| [`Text`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-text--docs) | 12 Adwaita type styles: large-title, title-1…4, heading, body, caption… |
| [`Icon`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-icon--docs) | React adapter for `@gnome-ui/icons` — inline SVG, inherits `currentColor` |
| [`Avatar`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-avatar--docs) | Circular user image with deterministic-color initials fallback |
| [`Badge`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-badge--docs) | Counter or status dot, optionally anchored over another element |
| [`Spinner`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-spinner--docs) | Indeterminate loading indicator; sm/md/lg sizes |
| [`ProgressBar`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-progressbar--docs) | Determinate (0–1) and indeterminate progress indicator |
| [`StatusPage`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-statuspage--docs) | Empty-state page with icon, title, description, and optional actions; `compact` prop for sidebars/popovers |
| [`Separator`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-separator--docs) | Horizontal/vertical dividing line between content groups |
| [`Chip`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-chip--docs) | Compact pill-shaped label for tags, filters, and multi-select; static, removable, and selectable modes |

### Layout & containers

| Component | Description |
|-----------|-------------|
| [`Card`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-card--docs) | Elevated surface for grouping content; static or interactive (activatable) |
| [`Frame`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-frame--docs) | Bordered surface without background fill — mirrors `GtkFrame` |
| [`HeaderBar`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-headerbar--docs) | Title bar with centered title and leading/trailing action slots |
| [`Toolbar`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-toolbar--docs) | Horizontal action bar with 6 px padding/gap for flat and raised buttons |
| [`Spacer`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-spacer--docs) | Invisible `flex: 1` filler to push trailing items to the end of a `Toolbar` |
| [`LinkedGroup`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-linkedgroup--docs) | Renders children as a single connected unit with merged borders; horizontal and vertical |
| [`Sidebar`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-sidebar--docs) / `SidebarSection` / `SidebarItem` | Lateral navigation panel with named sections, suffix widgets, and context menus |
| [`ActionRow`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-actionrow--docs) | Settings row with title, subtitle, leading icon, and trailing widget |
| [`ButtonRow`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-buttonrow--docs) | Full-width activatable row styled as a button inside a `BoxedList`; Default, Suggested, Destructive |
| [`ExpanderRow`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-expanderrow--docs) | Collapsible `ActionRow` that reveals nested rows; controlled and uncontrolled |
| [`BoxedList`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-boxedlist--docs) | Rounded bordered list of rows — canonical GNOME settings pattern |
| [`WrapBox`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-wrapbox--docs) | Flexible wrapping layout for tag/chip lists that flows across multiple lines |
| [`TabBar`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-tabs--docs) / `TabItem` / `TabPanel` | Tab-based navigation with keyboard support, optional close buttons, and `inline` variant |
| [`ViewSwitcher`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-viewswitcher--docs) / `ViewSwitcherItem` | Segmented pill control for switching between 2–4 top-level views |
| [`ViewSwitcherSidebar`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-viewswitchersidebar--docs) / `ViewSwitcherSidebarItem` | Sidebar-based view switcher — replaces `GtkStackSidebar` |
| [`ShortcutsDialog`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-shortcutsdialog--docs) | Modal listing keyboard shortcuts with integrated search |

### Overlays

| Component | Description |
|-----------|-------------|
| [`Toast`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-toast--docs) / `Toaster` | Non-blocking temporary notification with auto-dismiss, action, and queue support |
| [`Dialog`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-dialog--docs) | Blocking modal with title, body, focus trap, and configurable buttons |
| [`Tooltip`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-tooltip--docs) | Floating informational label on hover/focus with auto-flip positioning |
| [`Popover`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-popover--docs) | Floating interactive panel with arrow and auto-flip positioning |
| [`Banner`](https://eljijuna.github.io/gnome-ui/?path=/docs/components-banner--docs) | Persistent message strip with optional action and dismiss |

### Adaptive layout

| Component | Description |
|-----------|-------------|
| [`useBreakpoint`](https://eljijuna.github.io/gnome-ui/?path=/docs/adaptive-usebreakpoint--docs) | Hook tracking viewport width against GNOME breakpoints (400 / 550 / 860 px) |
| [`Clamp`](https://eljijuna.github.io/gnome-ui/?path=/docs/adaptive-clamp--docs) | Constrains content to a max width, centering it — mirrors `AdwClamp` |
| [`NavigationSplitView`](https://eljijuna.github.io/gnome-ui/?path=/docs/adaptive-navigationsplitview--docs) | Two-pane layout that collapses to a single pane at ≤ 400 px |
| [`OverlaySplitView`](https://eljijuna.github.io/gnome-ui/?path=/docs/adaptive-overlaysplitview--docs) | Sidebar becomes slide-over overlay at ≤ 400 px |
| [`ViewSwitcherBar`](https://eljijuna.github.io/gnome-ui/?path=/docs/adaptive-viewswitcherbar--docs) | Bottom bar for `ViewSwitcher` items on narrow screens (≤ 550 px) |
| [`BreakpointBin`](https://eljijuna.github.io/gnome-ui/?path=/docs/adaptive-breakpointbin--docs) | Applies layout changes when the **component** crosses a size threshold — CSS container queries equivalent |

## License

[MIT](../../LICENSE)
