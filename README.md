# gnome-ui

A React component library that faithfully implements the [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/), built on top of the [Adwaita](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/) design language.

[![npm](https://img.shields.io/npm/v/@gnome-ui/react)](https://www.npmjs.com/package/@gnome-ui/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@gnome-ui/core`](packages/core) | Framework-agnostic design tokens (CSS custom properties) | [![npm](https://img.shields.io/npm/v/@gnome-ui/core)](https://www.npmjs.com/package/@gnome-ui/core) |
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
| `ActionRow` | Settings row with title, subtitle, and trailing widget | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-actionrow--docs) |
| `BoxedList` | Rounded bordered list of rows — canonical GNOME settings pattern | [Docs](https://eljijuna.github.io/gnome-ui/?path=/docs/components-boxedlist--docs) |

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
│   ├── core/          # @gnome-ui/core — CSS design tokens
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
