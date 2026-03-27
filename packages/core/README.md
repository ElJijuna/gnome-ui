# @gnome-ui/core

Framework-agnostic CSS design tokens for the GNOME UI design system, based on the [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/) and the [Adwaita](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/css-variables.html) design language.

[![npm](https://img.shields.io/npm/v/@gnome-ui/core)](https://www.npmjs.com/package/@gnome-ui/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

## Installation

```bash
npm install @gnome-ui/core
```

## Usage

Import the tokens once at the root of your app:

```css
@import "@gnome-ui/core/styles";
```

```js
import "@gnome-ui/core/styles";
```

All tokens are then available as CSS custom properties:

```css
.my-button {
  background-color: var(--gnome-accent-bg-color);
  color: var(--gnome-accent-fg-color);
  border-radius: var(--gnome-radius-md);
  font-family: var(--gnome-font-family);
  padding: var(--gnome-space-1) var(--gnome-space-2);
}
```

Dark mode is handled automatically via `@media (prefers-color-scheme: dark)`.

## Token reference

### Colors

| Token | Light | Dark |
|-------|-------|------|
| `--gnome-accent-color` | `#3584e4` | `#78aeed` |
| `--gnome-accent-bg-color` | `#3584e4` | `#3584e4` |
| `--gnome-accent-fg-color` | `#ffffff` | `#ffffff` |
| `--gnome-destructive-bg-color` | `#e01b24` | `#e01b24` |
| `--gnome-destructive-fg-color` | `#ffffff` | `#ffffff` |
| `--gnome-success-bg-color` | `#2ec27e` | `#2ec27e` |
| `--gnome-warning-bg-color` | `#f6d32d` | `#f6d32d` |
| `--gnome-window-bg-color` | `#fafafa` | `#242424` |
| `--gnome-window-fg-color` | `rgba(0,0,0,.8)` | `rgba(255,255,255,.87)` |
| `--gnome-card-bg-color` | `#ffffff` | `#383838` |
| `--gnome-headerbar-bg-color` | `#ebebeb` | `#303030` |

### Spacing (6 px grid)

| Token | Value |
|-------|-------|
| `--gnome-space-1` | `6px` |
| `--gnome-space-2` | `12px` |
| `--gnome-space-3` | `18px` |
| `--gnome-space-4` | `24px` |
| `--gnome-space-5` | `36px` |
| `--gnome-space-6` | `48px` |

### Border radius

| Token | Value | Use |
|-------|-------|-----|
| `--gnome-radius-sm` | `4px` | Small elements |
| `--gnome-radius-md` | `8px` | Default (buttons, inputs) |
| `--gnome-radius-lg` | `12px` | Cards, popovers |
| `--gnome-radius-xl` | `15px` | Windows |
| `--gnome-radius-pill` | `9999px` | Pill/circular buttons |

### Typography

| Token | Value |
|-------|-------|
| `--gnome-font-family` | `"Adwaita Sans", Cantarell, "Inter", system-ui, sans-serif` |
| `--gnome-font-size-large-title` | `2.25rem` |
| `--gnome-font-size-title-1` | `1.875rem` |
| `--gnome-font-size-title-2` | `1.5rem` |
| `--gnome-font-size-title-3` | `1.25rem` |
| `--gnome-font-size-title-4` | `1.125rem` |
| `--gnome-font-size-body` | `1rem` |
| `--gnome-font-size-caption` | `0.875rem` |
| `--gnome-font-weight-normal` | `400` |
| `--gnome-font-weight-semibold` | `600` |
| `--gnome-font-weight-bold` | `700` |

### Focus ring

| Token | Value |
|-------|-------|
| `--gnome-focus-ring-color` | `var(--gnome-accent-color)` |
| `--gnome-focus-ring-width` | `2px` |
| `--gnome-focus-ring-offset` | `2px` |

### Motion

| Token | Value |
|-------|-------|
| `--gnome-duration-fast` | `100ms` |
| `--gnome-duration-normal` | `200ms` |
| `--gnome-duration-slow` | `400ms` |
| `--gnome-easing-default` | `ease` |
| `--gnome-easing-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

### Shadows

| Token | Use |
|-------|-----|
| `--gnome-shadow-sm` | Subtle card/button shadow |
| `--gnome-shadow-md` | Popovers, dropdowns |
| `--gnome-shadow-lg` | Dialogs, modals |

### Misc

| Token | Value |
|-------|-------|
| `--gnome-opacity-disabled` | `0.5` |

## License

[MIT](../../LICENSE)
