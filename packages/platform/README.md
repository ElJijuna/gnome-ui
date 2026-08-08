# @gnome-ui/platform

<p align="center">
  <img src="https://raw.githubusercontent.com/ElJijuna/gnome-ui/main/public/assets/gnome-ui.png" alt="gnome-ui" width="120" />
</p>

TypeScript API layer for communicating with the GNOME host process from a
React app running inside a WebKitGTK WebView.

[![npm](https://img.shields.io/npm/v/@gnome-ui/platform)](https://www.npmjs.com/package/@gnome-ui/platform)
[![npm downloads](https://img.shields.io/npm/dm/@gnome-ui/platform)](https://www.npmjs.com/package/@gnome-ui/platform)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/ElJijuna/gnome-react)](https://github.com/ElJijuna/gnome-react/commits/main)
[![GitHub issues](https://img.shields.io/github/issues/ElJijuna/gnome-react)](https://github.com/ElJijuna/gnome-react/issues)

> **Status:** all 7 feature modules are implemented, each with a real
> browser/PWA fallback where a genuine web equivalent exists (and an honest
> rejection where one doesn't — see [Modules](#modules)). This package is the
> **web side** of the bridge; it assumes a GJS host that implements the
> matching `window.webkit.messageHandlers` channels and dispatches the
> `gnome:*` response/signal events documented per module below.

## How it works

`@gnome-ui/platform` communicates with the GNOME host process through one
of two mechanisms, resolved at runtime:

| Environment | Bridge |
| --- | --- |
| WebKitGTK WebView (GJS host) | `window.webkit.messageHandlers.*` |
| Flatpak / sandboxed app | XDG Desktop Portals (via `portals`) |
| Browser / PWA / test | real browser APIs where one exists, otherwise rejects |

## Installation

```bash
npm install @gnome-ui/platform
```

## Modules

| Module | Browser / PWA fallback |
| --- | --- |
| [`clipboard`](#clipboard) | Text and images: real `navigator.clipboard`. Files: none — no browser API exposes real filesystem paths. |
| [`settings`](#settings) | None — no web equivalent of an app-schema-scoped `GSettings` store. |
| [`notifications`](#notifications) | Real `Notification` API (single click only — no action buttons). |
| [`fileChooser`](#file-chooser) | None — File System Access API only hands back opaque handles, never real paths. |
| [`colorScheme`](#color-scheme) | Read/subscribe: real `matchMedia('(prefers-color-scheme: dark)')`. Write: none. |
| [`window`](#window) | Partial — see the [window](#window) section for exactly which state/actions have a real equivalent. |
| [`portals`](#portals) | None — portals are meaningless outside a sandboxed GNOME host. |

### Clipboard

```ts
import {
  readText, writeText,
  readImage, writeImage,
  readFiles, writeFiles,
} from "@gnome-ui/platform";

await writeText("hello");
const text = await readText();

// Images cross the bridge as data: URLs either way.
await writeImage(dataUrl);
const image = await readImage(); // string | null — null when nothing's there

// Paths only — WebKitGTK-only, rejects in a browser.
await writeFiles(["/home/user/report.pdf"]);
const paths = await readFiles(); // string[] — [] when nothing's there
```

### Settings

Reads/writes a `GSettings` key. WebKitGTK-only.

```ts
import { getSetting, setSetting, onSettingChanged } from "@gnome-ui/platform";

const scheme = await getSetting<string>("color-scheme");
await setSetting("color-scheme", "prefer-dark");

// Fires for writes from this window AND external changes (another app,
// dconf-editor, `gsettings set` from a terminal).
const off = onSettingChanged<string>("color-scheme", (value) => {
  console.log("color-scheme is now", value);
});
off(); // unsubscribe
```

### Notifications

```ts
import {
  sendNotification, withdrawNotification, onNotificationAction,
} from "@gnome-ui/platform";

const id = await sendNotification({
  title: "Download complete",
  body: "report.pdf",
  actions: [{ id: "open", label: "Open" }], // WebKitGTK only
});

onNotificationAction(id, (actionId) => {
  // actionId is "open" (WebKitGTK) or "default" (a click on the browser
  // fallback's plain Notification — it has no separate action buttons)
});

await withdrawNotification(id);
```

### File chooser

WebKitGTK-only — every function rejects in a browser (see [Modules](#modules)
for why). Each resolves `{ canceled: true, ... }` rather than throwing when
the user dismisses the dialog.

```ts
import { openFile, saveFile, selectFolder } from "@gnome-ui/platform";

const { canceled, paths } = await openFile({ multiple: true });
const { path } = await saveFile({ currentName: "export.csv" });
const { path: folder } = await selectFolder();
```

### Color scheme

**`setColorScheme` only ever overrides this app's own rendering** (maps to
`Adw.StyleManager.set_color_scheme()`), never the desktop-wide preference — a
well-behaved app shouldn't be able to flip the user's whole desktop into dark
mode. In a browser, use `GnomeProvider`'s `colorScheme` prop instead — there
is no JS API to force the browser's own rendering into a scheme.

```ts
import { getColorScheme, setColorScheme, onColorSchemeChanged } from "@gnome-ui/platform";

const scheme = await getColorScheme(); // "light" | "dark" — the resolved scheme
await setColorScheme("dark");          // "light" | "dark" | "system"

const off = onColorSchemeChanged((scheme) => {
  console.log("now rendering", scheme);
});
```

### Window

```ts
import {
  getWindowState, setMaximized, setFullscreen,
  minimizeWindow, closeWindow, onWindowStateChanged,
} from "@gnome-ui/platform";

const { maximized, fullscreen, focused } = await getWindowState();

await setFullscreen(true);  // real Fullscreen API fallback in a browser
await setMaximized(true);   // WebKitGTK only — no browser fallback
await minimizeWindow();     // WebKitGTK only — no browser fallback
await closeWindow();        // real window.close() fallback (browsers only
                             // honor it for windows opened by script)

onWindowStateChanged(({ maximized, fullscreen, focused }) => { /* … */ });
```

`maximized` has no browser equivalent at all — there is no standard way for
page script to ask whether the OS window chrome is maximized, so it is
always reported as `false` outside WebKitGTK.

### Portals

The generic escape hatch behind the other portal-backed modules — reach for
it when the app needs a portal interface this package doesn't wrap in a
dedicated module (`OpenURI`, `Email`, `Print`, `Account`, `Background`,
`Inhibit`, `Location`, `ScreenCast`, …). WebKitGTK-only.

```ts
import { callPortal, onPortalSignal } from "@gnome-ui/platform";

await callPortal({
  interface: "org.freedesktop.portal.OpenURI",
  method: "OpenURI",
  args: { uri: "https://example.com" },
});

const off = onPortalSignal(
  "org.freedesktop.portal.Settings",
  "SettingChanged",
  (payload) => { /* … */ },
);
```

## Bridge utilities

The typed modules above are all built on these — reach for them directly to
talk to a bridge channel this package doesn't wrap yet.

### Fire-and-forget

Send a message to a named GJS handler without waiting for a reply — resolves
once dispatched, not once the host finishes handling it:

```ts
import { isWebKitBridge, postMessage } from "@gnome-ui/platform";

if (isWebKitBridge()) {
  console.log("Running in GNOME app context");
}

await postMessage("notifications", { action: "send", title: "Hello" });
```

### Request/response

Several host operations are inherently asynchronous (a GDK clipboard read, a
GSettings read, a portal call…) and need their reply matched back to the
specific call that triggered it, especially with several calls in flight at
once. `postMessageAndWait` tags the outgoing message with a `requestId` and
resolves once the host dispatches a `gnome:<responseEvent>` carrying that
same id back — every module above that needs a value back from the host is
built on this:

```ts
import { postMessageAndWait } from "@gnome-ui/platform";

const { value } = await postMessageAndWait<{ requestId: string; value: string }>(
  "settings",
  { action: "get", key: "color-scheme" },
  "settings-get-result",
);
```

Rejects after 5s (configurable via a 4th argument) if no matching response
arrives — e.g. because the WebView shell hasn't implemented that channel yet.

### Native → Web events

Subscribe to events dispatched by the GJS host. The host fires them by
evaluating a `CustomEvent` in the WebView:

```js
// GJS side — dispatch an event to the web layer
webView.evaluate_javascript(
  `window.dispatchEvent(new CustomEvent("gnome:open-modal", { detail: { id: "settings" } }))`,
  -1, null, null, null, null
);
```

```ts
// Web side — subscribe (returns an unsubscribe function)
import { onNativeEvent } from "@gnome-ui/platform";

const off = onNativeEvent("open-modal", (payload) => {
  console.log("open modal:", payload.id);
});

// later, clean up:
off();
```

All native events use the `gnome:` prefix internally — pass only the
unprefixed name to `onNativeEvent`.

> **Security note:** events arrive as plain DOM `CustomEvent`s, so any script
> running in the page can forge them — there is no way to verify the sender.
> Treat payloads as untrusted input, and never gate a privileged action
> solely on receiving one.

## Runtime detection

```ts
import { getRuntime } from "@gnome-ui/platform";

const { shell, engine, browser, os } = getRuntime();

if (shell === "webkitgtk-webview") // running inside a GNOME native app
if (shell === "pwa")               // installed PWA
if (browser.epiphany)              // running inside GNOME Web (Epiphany)
if (os.linux)                      // Linux host
```

## License

[MIT](../../LICENSE)
