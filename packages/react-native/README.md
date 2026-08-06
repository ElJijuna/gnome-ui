# @gnome-ui/react-native

<p align="center">
  <img src="https://raw.githubusercontent.com/ElJijuna/gnome-ui/main/public/assets/gnome-ui.png" alt="gnome-ui" width="120" />
</p>

React Native component library following the [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/), targeting iOS/Android/GNOME-mobile shells.

[![npm](https://img.shields.io/npm/v/@gnome-ui/react-native)](https://www.npmjs.com/package/@gnome-ui/react-native)
[![CI](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

> **Status:** theme tokens only — no components ship yet. Package structure,
> build tooling, and the `@gnome-ui/core` token generator are in place;
> component ports from `@gnome-ui/react` start next. See
> [ROADMAP.md](../../ROADMAP.md) Priority 3.

## How it works

Bare React Native — no Expo SDK dependency, so the package works in both
Expo-managed and bare RN apps. Components are rebuilt with native primitives
(`View`, `Text`, `Pressable`, `StyleSheet`) rather than ported 1:1 from
`@gnome-ui/react`'s DOM-based JSX, but mirror its component API/props where
the platforms overlap.

## Theme tokens

`scripts/generate-theme.mjs` parses `@gnome-ui/core`'s `src/tokens.css` with
`postcss` and emits `src/theme/tokens.generated.ts` — four plain JS objects
(`lightTheme`, `darkTheme`, `highContrastTheme`, `highContrastDarkTheme`),
one per `@media (prefers-color-scheme)` / `@media (prefers-contrast)`
combination in the source CSS. `var()` chains are resolved at generation
time following the same cascade order as the CSS (base → dark → high
contrast → high contrast + dark), so each object is a flat, fully-resolved
map — no runtime CSS engine needed.

Units are converted to what RN styles expect: `px`/`rem` lengths become bare
dp numbers (1rem = 16), `ms` durations become numbers, modern
`rgb(r g b / a)` colors become `rgba(r, g, b, a)` strings, `cubic-bezier()`
becomes a 4-number array, and a font stack like `"Adwaita Sans", cantarell,
…` is reduced to just `"Adwaita Sans"` (RN's `fontFamily` takes one native
family name — the app still has to load `@gnome-ui/core`'s `.ttf` files).

`oklch()` (unsupported by RN's color parser), `box-shadow` strings, and the
two `clamp()`-based sidebar-width tokens aren't auto-converted — they're
still available, unconverted, in the matching `*RawTokens` export (e.g.
`lightRawTokens['--gnome-shadow-md']`) so nothing is silently lost.

Pick a variant at runtime with `resolveGnomeTheme`:

```ts
import { resolveGnomeTheme } from '@gnome-ui/react-native';
import { useColorScheme } from 'react-native';

const colorScheme = useColorScheme() ?? 'light';
const theme = resolveGnomeTheme({ colorScheme, contrast: 'normal' });

theme.accentColor; // '#3584e4'
theme.space2; // 12
```

The generated file is committed, but always regenerate it after changing
`@gnome-ui/core`'s tokens — `npm run theme:generate`, or just run `build`
/ `typecheck` / `test`, which each regenerate it first.

## Installation

```bash
npm install @gnome-ui/react-native react-native
```

## License

[MIT](../../LICENSE) © el_jijuna
