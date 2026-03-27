# @gnome-ui/icons

Framework-agnostic Adwaita symbolic icon definitions for the [gnome-ui](https://github.com/ElJijuna/gnome-ui) design system.

Each icon is a plain JavaScript object (`IconDefinition`) containing SVG path data — no DOM, no React, no styles. UI framework adapters consume this shape to render inline SVGs.

[![npm](https://img.shields.io/npm/v/@gnome-ui/icons)](https://www.npmjs.com/package/@gnome-ui/icons)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

## Installation

```bash
npm install @gnome-ui/icons
```

## Usage

### With `@gnome-ui/react`

```tsx
import { Icon } from "@gnome-ui/react";
import { Search, Settings, GoHome } from "@gnome-ui/icons";

<Icon icon={Search} size="md" aria-label="Search" />
<Icon icon={Settings} size="lg" aria-hidden />
```

### Framework-agnostic (raw SVG)

```ts
import { Search } from "@gnome-ui/icons";
import type { IconDefinition } from "@gnome-ui/icons";

function renderIcon(icon: IconDefinition, size = 16) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", icon.viewBox);
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("fill", "currentColor");

  for (const path of icon.paths) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
    el.setAttribute("d", path.d);
    if (path.fillRule) el.setAttribute("fill-rule", path.fillRule);
    if (path.clipRule) el.setAttribute("clip-rule", path.clipRule);
    svg.appendChild(el);
  }
  return svg;
}
```

## `IconDefinition` type

```ts
interface IconDefinition {
  readonly viewBox: string;
  readonly paths: ReadonlyArray<{
    readonly d: string;
    readonly fillRule?: "nonzero" | "evenodd" | "inherit";
    readonly clipRule?: "nonzero" | "evenodd" | "inherit";
  }>;
}
```

## Available icons

All icons are Adwaita symbolic icons — monochrome, `currentColor`-based, 16 × 16 viewBox.

| Export | Description |
|--------|-------------|
| `Add` | Plus / add |
| `Attachment` | Paperclip |
| `Check` | Checkmark |
| `Close` | × close / dismiss |
| `Copy` | Copy to clipboard |
| `Cut` | Cut |
| `Delete` | Trash / delete |
| `DocumentOpen` | Open document |
| `Edit` | Pencil / edit |
| `Error` | Error badge |
| `GoHome` | Home |
| `GoNext` | Right chevron |
| `GoPrevious` | Left chevron |
| `GoUp` | Up chevron |
| `Information` | Info badge |
| `MediaPause` | Pause |
| `MediaPlay` | Play |
| `MediaSkipBackward` | Skip backward |
| `MediaSkipForward` | Skip forward |
| `OpenMenu` | Hamburger menu |
| `PanDown` | Pan / caret down |
| `PanEnd` | Pan / caret right |
| `PanStart` | Pan / caret left |
| `PanUp` | Pan / caret up |
| `Paste` | Paste |
| `Redo` | Redo |
| `Refresh` | Refresh / reload |
| `Remove` | Minus / remove |
| `Save` | Save / floppy disk |
| `Search` | Magnifying glass |
| `Settings` | Gear / settings |
| `Share` | Share / export |
| `Star` | Star (filled) |
| `StarOutline` | Star (outline) |
| `Undo` | Undo |
| `ViewMore` | Three dots / overflow |
| `ViewSidebar` | Sidebar toggle |
| `Warning` | Warning triangle |

## License

[MIT](../../LICENSE)
