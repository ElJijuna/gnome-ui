# @gnome-ui/icons

Framework-agnostic Adwaita symbolic icon definitions for the [gnome-ui](https://github.com/ElJijuna/gnome-ui) design system.

Each icon is a plain JavaScript object (`IconDefinition`) containing SVG path data — no DOM, no React, no styles. UI framework adapters consume this shape to render inline SVGs.

The `Icon` React adapter also accepts icons from [`simple-icons`](https://simpleicons.org/) directly, without any conversion.

[![npm](https://img.shields.io/npm/v/@gnome-ui/icons)](https://www.npmjs.com/package/@gnome-ui/icons)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

## Installation

```bash
npm install @gnome-ui/icons
```

## Tree-shaking

This package is fully tree-shakeable. Importing a single icon only pulls that icon's module into your bundle — not the entire registry.

```ts
// Only `Add` and `Search` are included in the final bundle
import { Add, Search } from "@gnome-ui/icons";
```

Each icon is also available as a direct sub-path import for bundlers that prefer explicit paths:

```ts
import { Add } from "@gnome-ui/icons/icons";
import { GitHub } from "@gnome-ui/icons/third-party";
```

## Usage

### With `@gnome-ui/react`

```tsx
import { Icon } from "@gnome-ui/react";
import { Search, Settings, GoHome } from "@gnome-ui/icons";

<Icon icon={Search} size="md" aria-label="Search" />
<Icon icon={Settings} size="lg" aria-hidden />
```

### With `simple-icons`

The `Icon` component accepts any `simple-icons` icon directly — no adapter or conversion needed. `simple-icons` is not a dependency of this package; install it separately in your project.

```tsx
import { Icon } from "@gnome-ui/react";
import { siGithub, siNpm } from "simple-icons";

<Icon icon={siGithub} label="GitHub" />
<Icon icon={siNpm} size="lg" label="npm" />
```

You can also pass a plain `{ path }` object for any single-path SVG icon:

```tsx
import { Icon } from "@gnome-ui/react";

<Icon icon={{ path: "M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12..." }} label="My icon" />
// Custom viewBox (defaults to "0 0 24 24"):
<Icon icon={{ path: "M0 0h32v32H0z", viewBox: "0 0 32 32" }} />
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

## Types

```ts
/** Icons from @gnome-ui/icons — multi-path, fixed viewBox. */
interface IconDefinition {
  readonly viewBox: string;
  readonly paths: ReadonlyArray<{
    readonly d: string;
    readonly fillRule?: "nonzero" | "evenodd" | "inherit";
    readonly clipRule?: "nonzero" | "evenodd" | "inherit";
  }>;
}

/** Single-path icons from simple-icons or any { path } object. */
interface RawPathIconDefinition {
  readonly path: string;
  readonly viewBox?: string; // defaults to "0 0 24 24"
}

/** Union accepted by the Icon component. */
type AnyIconDefinition = IconDefinition | RawPathIconDefinition;
```

## Available icons

All icons are Adwaita symbolic icons — monochrome, `currentColor`-based, 16 × 16 viewBox.

### Navigation

| Export | Symbolic name |
|--------|--------------|
| `GoPrevious` | `go-previous-symbolic` |
| `GoNext` | `go-next-symbolic` |
| `GoHome` | `go-home-symbolic` |
| `GoUp` | `go-up-symbolic` |
| `PanDown` | `pan-down-symbolic` |
| `PanUp` | `pan-up-symbolic` |
| `PanStart` | `pan-start-symbolic` |
| `PanEnd` | `pan-end-symbolic` |

### Actions

| Export | Symbolic name |
|--------|--------------|
| `Add` | `list-add-symbolic` |
| `Remove` | `list-remove-symbolic` |
| `Delete` | `edit-delete-symbolic` |
| `Edit` | `document-edit-symbolic` |
| `Copy` | `edit-copy-symbolic` |
| `Paste` | `edit-paste-symbolic` |
| `Cut` | `edit-cut-symbolic` |
| `Undo` | `edit-undo-symbolic` |
| `Redo` | `edit-redo-symbolic` |
| `Save` | `document-save-symbolic` |
| `Document` | `document-symbolic` |
| `DocumentOpen` | `document-open-symbolic` |
| `Close` | `window-close-symbolic` |
| `Search` | `system-search-symbolic` |
| `Refresh` | `view-refresh-symbolic` |
| `Share` | `emblem-shared-symbolic` |
| `Attachment` | `mail-attachment-symbolic` |

### UI

| Export | Symbolic name |
|--------|--------------|
| `OpenMenu` | `open-menu-symbolic` |
| `ViewMore` | `view-more-symbolic` |
| `ViewSidebar` | `sidebar-show-symbolic` |
| `ViewReveal` | `view-reveal-symbolic` |
| `ViewConceal` | `view-conceal-symbolic` |
| `Settings` | `preferences-system-symbolic` |

### Status

| Export | Symbolic name |
|--------|--------------|
| `Information` | `dialog-information-symbolic` |
| `Warning` | `dialog-warning-symbolic` |
| `Error` | `dialog-error-symbolic` |
| `Check` | `object-select-symbolic` |

### People & Identity

| Export | Symbolic name |
|--------|--------------|
| `Person` | `system-users-symbolic` |
| `Accessibility` | `preferences-desktop-accessibility-symbolic` |

### System & Hardware

| Export | Symbolic name |
|--------|--------------|
| `Applications` | `view-app-grid-symbolic` |
| `Notifications` | `notifications-symbolic` |
| `InputMouse` | `input-mouse-symbolic` |
| `InputKeyboard` | `input-keyboard-symbolic` |
| `InputTablet` | `input-tablet-symbolic` |
| `ColorManagement` | `preferences-color-symbolic` |
| `Printer` | `printer-symbolic` |
| `Lock` | `changes-prevent-symbolic` |

### Files & Media

| Export | Symbolic name |
|--------|--------------|
| `Folder` | `folder-symbolic` |
| `Image` | `image-x-generic-symbolic` |

### Misc

| Export | Symbolic name |
|--------|--------------|
| `Star` | `starred-symbolic` |
| `StarOutline` | `non-starred-symbolic` |
| `Heart` | `emblem-favorite-symbolic` |

### Media

| Export | Symbolic name |
|--------|--------------|
| `MediaPlay` | `media-playback-start-symbolic` |
| `MediaPause` | `media-playback-pause-symbolic` |
| `MediaSkipForward` | `media-skip-forward-symbolic` |
| `MediaSkipBackward` | `media-skip-backward-symbolic` |

### Third-party brand icons

Available via `@gnome-ui/icons` or the `@gnome-ui/icons/third-party` sub-path.

| Export | Brand |
|--------|-------|
| `GitHub` | GitHub |
| `GitLab` | GitLab |
| `Bitbucket` | Bitbucket |
| `X` | X (Twitter) |

## License

[MIT](../../LICENSE)
