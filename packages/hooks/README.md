# @gnome-ui/hooks

React hooks that expose [@gnome-ui/platform](../platform/README.md) APIs as idiomatic React state.

[![npm](https://img.shields.io/npm/v/@gnome-ui/hooks)](https://www.npmjs.com/package/@gnome-ui/hooks)
[![npm downloads](https://img.shields.io/npm/dm/@gnome-ui/hooks)](https://www.npmjs.com/package/@gnome-ui/hooks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/ElJijuna/gnome-react)](https://github.com/ElJijuna/gnome-react/commits/main)
[![GitHub issues](https://img.shields.io/github/issues/ElJijuna/gnome-react)](https://github.com/ElJijuna/gnome-react/issues)

> **Status:** work in progress — API surface is defined, implementations are pending.

## Installation

```bash
npm install @gnome-ui/hooks
```

Requires `@gnome-ui/platform` and `react` ≥ 19 as peer dependencies.

## Hooks

| Hook | Returns | Description |
| --- | --- | --- |
| `useSettings(schema, key)` | `[value, setValue]` | Read/write a GSettings key; re-renders on external changes |
| `useNotification()` | `{ send, dismiss }` | Send and dismiss desktop notifications |
| `useColorScheme()` | `[scheme, setScheme]` | Reactive `"light"`, `"dark"`, or `"auto"` color scheme |
| `useFileChooser()` | `{ open, save, path }` | Trigger file open/save dialogs and get the resolved path |
| `useClipboard()` | `{ value, copy, paste }` | Reactive clipboard contents with copy/paste helpers |
| `useWindowState()` | `{ maximized, fullscreen, focused, ... }` | Reactive window state with matching setters |

## Quick example

```tsx
import { useColorScheme } from "@gnome-ui/hooks";

export function ThemeToggle() {
  const [scheme, setScheme] = useColorScheme();

  return (
    <button onClick={() => setScheme(scheme === "dark" ? "light" : "dark")}>
      Switch to {scheme === "dark" ? "light" : "dark"} mode
    </button>
  );
}
```

## License

[MIT](../../LICENSE)
