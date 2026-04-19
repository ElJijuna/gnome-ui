# @gnome-ui/hooks

React hooks that expose [@gnome-ui/platform](../platform/README.md) APIs
as idiomatic React state.

[![npm](https://img.shields.io/npm/v/@gnome-ui/hooks)](https://www.npmjs.com/package/@gnome-ui/hooks)
[![CI](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

> **Status:** work in progress — API surface is defined, implementations are pending.

## Installation

```bash
npm install @gnome-ui/hooks
```

Requires `@gnome-ui/platform` and `react` ≥ 19 as peer dependencies.

## Hooks

### Viewport

| Hook | Returns | Description |
| --- | --- | --- |
| `useBreakpoint()` | `BreakpointInfo` | Reactive `isMobile`, `isTablet`, `isDesktop` flags based on GNOME HIG breakpoints |

### Platform & runtime

| Hook | Returns | Description |
| --- | --- | --- |
| `usePlatform()` | `PlatformInfo` | Convenience booleans for the current shell context |
| `useRuntime()` | `RuntimeInfo` | Full runtime snapshot: shell, engine, browser, OS |
| `useNativeEvent(type, handler)` | `void` | Subscribe to an event dispatched by the GJS host |

### GNOME integrations

| Hook | Returns | Description |
| --- | --- | --- |
| `useSettings(schema, key)` | `[value, setValue]` | Read/write a GSettings key; re-renders on changes |
| `useNotification()` | `{ send, dismiss }` | Send and dismiss desktop notifications |
| `useColorScheme()` | `[scheme, setScheme]` | Reactive `"light"`, `"dark"`, or `"auto"` color scheme |
| `useFileChooser()` | `{ open, save, path }` | Trigger file open/save dialogs |
| `useClipboard()` | `{ value, copy, paste }` | Reactive clipboard with copy/paste helpers |
| `useWindowState()` | `{ maximized, fullscreen, ... }` | Reactive window state with matching setters |

## Examples

### Adapt layout to viewport size

```tsx
import { useBreakpoint } from "@gnome-ui/hooks";

export function AdaptiveLayout() {
  const { isMobile, isDesktop } = useBreakpoint();

  return isDesktop ? <SidebarLayout /> : <StackedLayout />;
}
```

Breakpoints follow the GNOME HIG adaptive layout recommendations:

| Flag | Range |
| --- | --- |
| `isMobile` | `width < 480 px` |
| `isTablet` | `480 px ≤ width < 1024 px` |
| `isDesktop` | `width ≥ 1024 px` |

SSR-safe: defaults to `isDesktop: true` when `window` is not available.

### Detect GNOME WebView context

```tsx
import { usePlatform } from "@gnome-ui/hooks";

export function NativeOnlyBanner() {
  const { isGnomeWebView } = usePlatform();

  if (!isGnomeWebView) return null;
  return <Banner>Running inside a GNOME app</Banner>;
}
```

### Listen to a native event from the GJS host

```tsx
import { useNativeEvent } from "@gnome-ui/hooks";

export function SettingsModal() {
  const [open, setOpen] = useState(false);

  useNativeEvent("open-modal", (payload: { id: string }) => {
    if (payload.id === "settings") setOpen(true);
  });

  return <Modal open={open} onClose={() => setOpen(false)} />;
}
```

The GJS host dispatches the event by evaluating JS in the WebView:

```js
webView.evaluate_javascript(
  `window.dispatchEvent(new CustomEvent("gnome:open-modal", {
    detail: { id: "settings" }
  }))`,
  -1, null, null, null, null
);
```

### Toggle color scheme

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
