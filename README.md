# gnome-ui

A React component library that faithfully implements the [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/), built on top of the [Adwaita](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/) design language.

[![npm](https://img.shields.io/npm/v/@gnome-ui/react)](https://www.npmjs.com/package/@gnome-ui/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@gnome-ui/core`](packages/core) | Framework-agnostic design tokens (CSS custom properties) | [![npm](https://img.shields.io/npm/v/@gnome-ui/core)](https://www.npmjs.com/package/@gnome-ui/core) |
| [`@gnome-ui/icons`](packages/icons) | Framework-agnostic Adwaita symbolic icon definitions (SVG path data) | [![npm](https://img.shields.io/npm/v/@gnome-ui/icons)](https://www.npmjs.com/package/@gnome-ui/icons) |
| [`@gnome-ui/react`](packages/react) | React component library | [![npm](https://img.shields.io/npm/v/@gnome-ui/react)](https://www.npmjs.com/package/@gnome-ui/react) |

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

> **Tokens only** (framework-agnostic):
> ```bash
> npm install @gnome-ui/core
> ```
> ```css
> @import "@gnome-ui/core/styles";
> ```

## Components

Live examples and documentation: **[Storybook →](https://eljijuna.github.io/gnome-ui/)**

| Component | Description | Story |
|-----------|-------------|-------|
| `Button` | Default, Suggested, Destructive, Flat, Pill, Circular | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-button--docs) |
| `Text` | 12 Adwaita type styles: large-title, title-1…4, heading, body, caption… | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-text--docs) |
| `Card` | Elevated surface for grouping content; static or interactive (activatable) | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-card--docs) |
| `Spinner` | Indeterminate loading indicator; sm/md/lg sizes, accessible label | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-spinner--docs) |
| `Avatar` | Circular user image with deterministic-color initials fallback | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-avatar--docs) |
| `Separator` | Horizontal/vertical dividing line between content groups | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-separator--docs) |
| `Switch` | On/off toggle for settings that apply immediately | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-switch--docs) |
| `Checkbox` | Multi-selection with checked, unchecked, and indeterminate states | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-checkbox--docs) |
| `TextField` | Text input with label, helper text, and error state | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-textfield--docs) |
| `RadioButton` | Single-selection within a group; keyboard arrow-key navigation | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-radiobutton--docs) |
| `ProgressBar` | Determinate (0–1) and indeterminate progress indicator | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-progressbar--docs) |
| `Banner` | Persistent message strip with optional action and dismiss | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-banner--docs) |
| `HeaderBar` | Title bar with centered title and leading/trailing action slots | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-headerbar--docs) |
| `Badge` | Counter or status dot, optionally anchored over another element | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-badge--docs) |
| `Icon` | React adapter for `@gnome-ui/icons` — inline SVG, inherits `currentColor` | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-icon--docs) |
| `Sidebar` / `SidebarItem` | Lateral navigation panel with active state and badge support | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-sidebar--docs) |
| `SpinButton` | Numeric input with −/+ buttons, keyboard nav, decimal support | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-spinbutton--docs) |
| `TabBar` / `TabItem` / `TabPanel` | Tab-based navigation with keyboard support and optional close buttons | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-tabs--docs) |
| `ActionRow` | Settings row with title, subtitle, and trailing widget | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-actionrow--docs) |
| `BoxedList` | Rounded bordered list of rows — canonical GNOME settings pattern | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-boxedlist--docs) |
| `ViewSwitcher` / `ViewSwitcherItem` | Segmented pill control for switching between 2–4 top-level views | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-viewswitcher--docs) |
| `SearchBar` | Collapsible search bar with auto-focus, clear button, and optional filter row | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-searchbar--docs) |
| `Toast` / `Toaster` | Non-blocking temporary notification with auto-dismiss, action, and queue support | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-toast--docs) |
| `Dialog` | Blocking modal with title, body, focus trap, and configurable buttons | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-dialog--docs) |
| `Tooltip` | Floating informational label on hover/focus with auto-flip positioning | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-tooltip--docs) |
| `StatusPage` | Empty-state page with icon, title, description, and optional actions | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-statuspage--docs) |
| `Dropdown` | Expandable option list with keyboard nav, flip positioning, and descriptions | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-dropdown--docs) |
| `Slider` | Draggable range control with tick marks, decimal steps, and keyboard nav | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-slider--docs) |
| `Popover` | Floating panel with rich interactive content, arrow, and auto-flip positioning | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-popover--docs) |
| `useBreakpoint` | Hook tracking viewport width against GNOME breakpoints (400 / 550 / 860 px) | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/adaptive-usebreakpoint--docs) |
| `Clamp` | Constrains content to a max width, centering it — mirrors `AdwClamp` | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/adaptive-clamp--docs) |
| `NavigationSplitView` | Two-pane layout that collapses to single pane at ≤ 400 px | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/adaptive-navigationsplitview--docs) |
| `OverlaySplitView` | Sidebar becomes slide-over overlay at ≤ 400 px | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/adaptive-overlaysplitview--docs) |
| `ViewSwitcherBar` | Bottom bar for `ViewSwitcher` items on narrow screens (≤ 550 px) | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/adaptive-viewswitcherbar--docs) |
| `Link` | Inline hyperlink with accent colour, animated underline, and external-URL variant | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-link--docs) |
| `ToggleGroup` / `ToggleGroupItem` | Mutually-exclusive toggle buttons for in-place option selection — mirrors `AdwToggleGroup` (GNOME 48) | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-togglegroup--docs) |
| `WrapBox` | Flexible wrapping layout container — mirrors `AdwWrapBox` (GNOME 48) | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-wrapbox--docs) |
| `Chip` | Compact pill label for tags and filters; static, removable, and selectable modes | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-chip--docs) |
| `ShortcutsDialog` | Modal listing keyboard shortcuts by section with integrated search — mirrors `AdwShortcutsDialog` (GNOME 49) | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-shortcutsdialog--docs) |

See [ROADMAP.md](ROADMAP.md) for the full list of planned components.

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
gnome-react/
├── packages/
│   ├── core/          # @gnome-ui/core  — CSS design tokens
│   ├── icons/         # @gnome-ui/icons — Adwaita icon definitions (SVG path data)
│   └── react/         # @gnome-ui/react — React components
├── GNOME_GUIDELINES.md
├── ROADMAP.md
└── turbo.json
```

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Your commit messages determine the next version automatically via semantic-release:

| Prefix | Release |
|--------|---------|
| `feat:` | minor |
| `fix:`, `perf:`, `refactor:` | patch |
| `feat!:` or `BREAKING CHANGE:` | major |
| `chore:`, `docs:`, `test:` | no release |

## License

[MIT](LICENSE) © el_jijuna
