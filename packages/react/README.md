# @gnome-ui/react

React component library following the [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/).

[![npm](https://img.shields.io/npm/v/@gnome-ui/react)](https://www.npmjs.com/package/@gnome-ui/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

## Installation

```bash
npm install @gnome-ui/react
```

## Setup

Import the styles once at the root of your app:

```tsx
// main.tsx or App.tsx
import "@gnome-ui/react/styles";
```

## Components

### Button

```tsx
import { Button } from "@gnome-ui/react";

// Variants
<Button variant="default">Cancel</Button>
<Button variant="suggested">Save</Button>
<Button variant="destructive">Delete</Button>
<Button variant="flat">Back</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>   {/* default */}
<Button size="lg">Large</Button>

// Shapes
<Button shape="pill" variant="suggested">New Document</Button>
<Button shape="circular" variant="suggested">+</Button>

// With icons
<Button variant="suggested" leadingIcon={<SaveIcon />}>Save</Button>

// Disabled
<Button disabled>Unavailable</Button>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "suggested" \| "destructive" \| "flat"` | `"default"` | Visual style |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size |
| `shape` | `"default" \| "pill" \| "circular"` | `"default"` | Shape |
| `leadingIcon` | `ReactNode` | — | Icon before label |
| `trailingIcon` | `ReactNode` | — | Icon after label |
| `disabled` | `boolean` | `false` | Disabled state |

All native `<button>` HTML attributes are also accepted.

## Guidelines

- Use **`suggested`** for the single primary/affirmative action per view. Never use more than one.
- Use **`destructive`** only for irreversible actions (Delete, Format…).
- Use **`flat`** inside header bars and toolbars.
- Button labels must use **imperative verbs** with **Header Capitalization** (e.g. "Save Changes").

## Storybook

[View live component documentation →](https://github.com/ElJijuna/gnome-ui.git)

## License

[MIT](../../LICENSE)
