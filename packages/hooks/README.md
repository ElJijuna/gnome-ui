# @gnome-ui/hooks

<p align="center">
  <img src="https://raw.githubusercontent.com/ElJijuna/gnome-ui/main/public/assets/gnome-ui.png" alt="gnome-ui" width="120" />
</p>

React hooks that expose [@gnome-ui/platform](../platform/README.md) APIs
as idiomatic React state.

[![npm](https://img.shields.io/npm/v/@gnome-ui/hooks)](https://www.npmjs.com/package/@gnome-ui/hooks)
[![CI](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

## Installation

```bash
npm install @gnome-ui/hooks
```

Requires `@gnome-ui/platform` and `react` ≥ 19 as peer dependencies.

The package is fully tree-shakeable (`sideEffects: false`). Each hook has its
own deep entry point so bundlers can eliminate unused hooks:

```ts
// barrel import — all hooks
import { useBreakpoint } from "@gnome-ui/hooks";

// deep import — only useBreakpoint in the bundle
import { useBreakpoint } from "@gnome-ui/hooks/useBreakpoint";
```

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
| `useSettings(key, defaultValue)` | `UseSettingsResult<T>` | Read/write a GSettings key; re-renders on external changes |
| `useNotification()` | `{ send, dismiss }` | Send and dismiss desktop notifications, scoped to the component's lifetime |
| `useColorScheme()` | `UseColorSchemeResult` | Reactive resolved `"light"`/`"dark"` scheme, with a `"light"`/`"dark"`/`"system"` setter |
| `useFileChooser()` | `{ open, save, path }` | Trigger file open/save dialogs |
| `useClipboard()` | `{ value, copy, paste }` | Reactive clipboard with copy/paste helpers |
| `useWindowState()` | `{ maximized, fullscreen, ... }` | Reactive window state with matching setters |
| `useHapticFeedback()` | `{ trigger, isSupported, ... }` | Haptic feedback via feedbackd (native) or Vibration API (browser/PWA) |

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

### Read and write a GSettings key

```tsx
import { useSettings } from "@gnome-ui/hooks";

export function DarkModeToggle() {
  const { value: darkMode, setValue: setDarkMode, loading } = useSettings("prefer-dark", false);

  return <Switch checked={darkMode} onChange={setDarkMode} disabled={loading} label="Dark mode" />;
}
```

`value` starts at the given default and updates once the initial read
completes, then stays in sync with external changes too — another app,
`dconf-editor`, or `gsettings set` from a terminal. `setValue` updates
`value` immediately (optimistic) and persists the write in the background;
if the write fails, `error` is set (and cleared again on the next
successful write).

Outside a WebKitGTK environment (a browser, Storybook, tests) there is no
GSettings equivalent — `value` stays at the default forever and `error` is
set. See [`@gnome-ui/platform`'s `settings` module](../platform/README.md#settings)
for details.

| Return value | Type | Description |
| --- | --- | --- |
| `value` | `T` | Current value — the default until the first successful read |
| `setValue(value)` | `(value: T) => void` | Writes a new value (optimistic) |
| `loading` | `boolean` | `true` until the first read completes |
| `error` | `Error \| null` | Set when reading or writing failed |

### Send and dismiss desktop notifications

```tsx
import { useNotification } from "@gnome-ui/hooks";

export function DownloadButton() {
  const { send, dismiss } = useNotification();

  async function onDownloadComplete() {
    const id = await send({
      title: "Download complete",
      body: "report.pdf",
      actions: [{ id: "open", label: "Open" }],
      onAction: (actionId) => {
        if (actionId === "open") openFile("report.pdf");
      },
    });

    setTimeout(() => dismiss(id), 5000);
  }

  return <button onClick={onDownloadComplete}>Download</button>;
}
```

Every notification sent through `send` — and every `onAction` listener
attached to it — is automatically withdrawn/unsubscribed when the component
unmounts. `@gnome-ui/platform`'s `sendNotification`/`onNotificationAction`
don't do that for you on their own, since they have no concept of a React
component's lifetime.

| Return value | Type | Description |
| --- | --- | --- |
| `send(options)` | `(options: UseNotificationSendOptions) => Promise<string>` | Sends a notification, resolves with its id |
| `dismiss(id)` | `(id: string) => Promise<void>` | Withdraws a previously sent notification |

`options` accepts everything `@gnome-ui/platform`'s `SendNotificationOptions`
does (`title`, `body`, `icon`, `priority`, `actions`), plus an optional
`onAction(actionId)` callback.

### Toggle color scheme

```tsx
import { useColorScheme } from "@gnome-ui/hooks";

export function ThemeToggle() {
  const { scheme, setScheme } = useColorScheme();

  return (
    <button onClick={() => setScheme(scheme === "dark" ? "light" : "dark")}>
      Switch to {scheme === "dark" ? "light" : "dark"} mode
    </button>
  );
}
```

> **Not the same hook as `@gnome-ui/react`'s `useColorScheme`.** That one
> reads the `colorScheme`/`resolvedColorScheme` set by the nearest
> `GnomeProvider` — a plain `matchMedia` read that drives your CSS theme and
> works everywhere. *This* hook talks to `Adw.StyleManager` through
> `@gnome-ui/platform`'s bridge, so `setScheme` forces this app's own
> Adwaita rendering independently of your CSS. Reach for it only if you
> specifically need that — outside a WebKitGTK environment `setScheme` has
> no effect (see `error` below).

| Return value | Type | Description |
| --- | --- | --- |
| `scheme` | `"light" \| "dark"` | Current resolved scheme — defaults to `"light"` until the first read completes |
| `setScheme(preference)` | `(preference: "light" \| "dark" \| "system") => void` | Sets this app's color scheme preference |
| `loading` | `boolean` | `true` until the first read completes |
| `error` | `Error \| null` | Set when reading or writing failed |

### Trigger haptic feedback

```tsx
import { useHapticFeedback } from "@gnome-ui/hooks";

export function SendButton() {
  const { trigger, isSupported } = useHapticFeedback();

  return (
    <button
      onClick={() => {
        trigger("button-pressed");
        sendMessage();
      }}
    >
      Send
    </button>
  );
}
```

Resolution order: **feedbackd** (via `window.webkit.messageHandlers` inside a
WebKitGTK WebView) → **Vibration API** (browser / PWA) → no-op.

Event names follow the [GNOME Event Naming Specification](https://honk.sigxcpu.org/projects/feedbackd/doc/Event-naming-spec-0.0.0.html).
App-specific events must use the `x-` prefix:

```ts
trigger("x-myapp-task-complete");
```

| Return value | Type | Description |
| --- | --- | --- |
| `trigger(event)` | `(event: GnomeHapticEvent) => void` | Fire haptic feedback for the given event name |
| `isSupported` | `boolean` | `true` if any haptic mechanism is available |
| `isNativeSupported` | `boolean` | `true` inside a WebKitGTK WebView (feedbackd) |
| `isVibrationApiSupported` | `boolean` | `true` when `navigator.vibrate` is available |

## License

[MIT](../../LICENSE)
