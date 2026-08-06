# @gnome-ui/react-native

<p align="center">
  <img src="https://raw.githubusercontent.com/ElJijuna/gnome-ui/main/public/assets/gnome-ui.png" alt="gnome-ui" width="120" />
</p>

React Native component library following the [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/), targeting iOS/Android/GNOME-mobile shells.

[![npm](https://img.shields.io/npm/v/@gnome-ui/react-native)](https://www.npmjs.com/package/@gnome-ui/react-native)
[![CI](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

> **Status:** theme tokens, `GnomeProvider`, and the first component
> (`Button`) ship. Component ports from `@gnome-ui/react` continue tier by
> tier. See [ROADMAP.md](../../ROADMAP.md) Priority 3.

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

## GnomeProvider

RN has no CSS cascade, so components can't read a custom-property-style
theme the way `@gnome-ui/react`'s components do — they need the resolved
theme object handed to them directly. `GnomeProvider` computes it once and
exposes it (plus locale, direction, and formatting defaults) via context:

```tsx
import { GnomeProvider, useGnomeTheme } from '@gnome-ui/react-native';
import { Text, View } from 'react-native';

function App() {
  return (
    <GnomeProvider accentColor="green">
      <Screen />
    </GnomeProvider>
  );
}

function Screen() {
  const theme = useGnomeTheme();

  return (
    <View style={{ backgroundColor: theme.windowBgColor, padding: theme.space4 }}>
      <Text style={{ color: theme.windowFgColor, fontSize: theme.fontSizeBody }}>Hello</Text>
    </View>
  );
}
```

`colorScheme` and `contrast` both default to `"system"`: color scheme
follows `useColorScheme()`/`Appearance`, and contrast follows the OS
accessibility setting where one exists — Android's "High text contrast",
iOS's "Increase Contrast" — falling back to `"normal"` elsewhere (e.g. web).
Pass `"light"`/`"dark"` or `"normal"`/`"more"` to override either
explicitly.

`accentColor` accepts a named Adwaita palette color (`"green"`, `"red"`,
…) — resolved to the matching shade for the active color scheme, same as
`@gnome-ui/react` — or any RN color string. It's threaded through
`theme.accentColor`/`theme.accentBgColor` (and `theme.focusRingColor`
outside high contrast, which keeps its own fixed value there for maximum
contrast, matching `tokens.css`).

Other hooks: `useLocale`, `useDir`, `useNumberFormatter`,
`useDateTimeFormatter`, `useColorScheme`/`useResolvedColorScheme`,
`useContrast`/`useResolvedContrast`, `useAccentColor` — each reads one slice
of the same context, mirroring `@gnome-ui/react`'s `GnomeProvider` hook set.

Unlike the web provider, `dir` is exposed for consumers to branch on but
never calls `I18nManager.forceRTL()` — RN's layout direction is a single
global flag that needs an app reload and is set once at bootstrap, not per
provider tree.

## Components

### Button

```tsx
import { Button } from '@gnome-ui/react-native';

<Button variant="suggested" onPress={() => save()}>
  Save
</Button>;
```

Mirrors `@gnome-ui/react`'s `Button` props (`variant`, `size`, `shape`, `osd`,
`leadingIcon`/`trailingIcon`), rebuilt on `Pressable` — hover/`:active` CSS
states become the `pressed` render-prop, and `filter: brightness()` (not
available in RN) becomes a `0.85` opacity dip on press for the solid
`suggested`/`destructive` variants. `leadingIcon`/`trailingIcon` render
as-is: RN has no `currentColor` equivalent, so size and color icons
yourself, matching the resolved label color (`theme.accentFgColor`,
`theme.destructiveFgColor`, `theme.windowFgColor`, …) if you want them to
match.

## Installation

```bash
npm install @gnome-ui/react-native react-native
```

## Testing

This package uses **Jest**, not the Vitest used elsewhere in the monorepo.
`react-native`'s published entry ships untranspiled Flow syntax
(`import typeof * as X from './index.js.flow'`) that only Jest's official
`@react-native/jest-preset` + `@react-native/babel-preset` know how to
strip before the module loads — Vitest has no hook that reaches a plain
`require("react-native")` call inside an already-external dependency (confirmed
against both `resolve.alias` and a custom `resolveId` plugin), so component
tests run under `jest.config.cjs` / `babel.config.cjs` instead. Pure-logic
tests (`resolveTheme`, `resolveContext`) run under the same Jest setup for
consistency rather than splitting the package across two runners.

Rendering uses `@testing-library/react-native` on top of `test-renderer`
(the actively maintained successor to the deprecated `react-test-renderer`).

## License

[MIT](../../LICENSE) © el_jijuna
