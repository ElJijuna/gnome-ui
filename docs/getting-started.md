# Getting Started

## Install a package

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

Wrap your app in `GnomeProvider` to share locale, text direction, and
default `Intl` options across `@gnome-ui/react`, `@gnome-ui/layout`, and
`@gnome-ui/charts`.

```tsx
import { GnomeProvider } from "@gnome-ui/react";

<GnomeProvider
  locale="en-US"
  numberFormat={{ notation: "compact", compactDisplay: "short" }}
>
  <App />
</GnomeProvider>
```

Compact notation renders values like `1K`; standard notation renders values
like `1,000`.

!!! tip "Tokens only (framework-agnostic)"
    ```bash
    npm install @gnome-ui/core
    ```
    ```css
    @import "@gnome-ui/core/styles";
    ```

Every component, live and interactive, lives in its package's own
Storybook — start at [`@gnome-ui/react`](https://gnome-ui.org/react/).

## Working on the monorepo itself

### Prerequisites

- Node.js 22+
- npm 10+

### Setup

```bash
git clone https://github.com/ElJijuna/gnome-ui.git
cd gnome-ui
npm install
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build all packages |
| `npm run storybook` | Start every package's Storybook dev server |
| `npm run build-storybook` | Build every package's Storybook for production |
| `npm run typecheck` | Type-check all packages |
| `npm run lint` | Lint all packages |
| `npm run docs:dev` | Serve this documentation site locally |
| `npm run docs:build` | Build this documentation site |

See [Contributing](contributing.md) for commit conventions and the PR
process before opening one.
