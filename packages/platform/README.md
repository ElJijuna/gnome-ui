# @gnome-ui/platform

TypeScript API layer for communicating with the GNOME host process from a React app running inside a WebKitGTK WebView.

[![npm](https://img.shields.io/npm/v/@gnome-ui/platform)](https://www.npmjs.com/package/@gnome-ui/platform)
[![npm downloads](https://img.shields.io/npm/dm/@gnome-ui/platform)](https://www.npmjs.com/package/@gnome-ui/platform)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/ElJijuna/gnome-react)](https://github.com/ElJijuna/gnome-react/commits/main)
[![GitHub issues](https://img.shields.io/github/issues/ElJijuna/gnome-react)](https://github.com/ElJijuna/gnome-react/issues)

> **Status:** work in progress — API surface is defined, implementations are pending.

## How it works

`@gnome-ui/platform` communicates with the GNOME host process through one of two mechanisms, resolved at runtime:

| Environment | Bridge |
| --- | --- |
| WebKitGTK WebView (GJS host) | `window.webkit.messageHandlers.*` |
| Flatpak / sandboxed app | XDG Desktop Portals |
| Browser / test | no-op stubs (never throws) |

## Installation

```bash
npm install @gnome-ui/platform
```

## Modules

| Module | Description |
| --- | --- |
| `settings` | Read/write application settings via `GSettings` |
| `notifications` | Send and withdraw desktop notifications (`Gio.Notification`) |
| `fileChooser` | Open/save file dialogs (`GtkFileChooserDialog` / XDG portal) |
| `colorScheme` | Detect and change the Adwaita color scheme (light/dark/auto) |
| `window` | Query and change window state (maximize, minimize, fullscreen) |
| `clipboard` | Read and write the GDK clipboard (text, files, images) |
| `portals` | Low-level XDG Desktop Portal access for Flatpak apps |

## Bridge utilities

```ts
import { isWebKitBridge, postMessage } from "@gnome-ui/platform";

// Check if running inside a WebKitGTK WebView
if (isWebKitBridge()) {
  console.log("Running in GNOME app context");
}

// Send a raw message to a named GJS handler
await postMessage("notifications", { title: "Hello", body: "World" });
```

## License

[MIT](../../LICENSE)
