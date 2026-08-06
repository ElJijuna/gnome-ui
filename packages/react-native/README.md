# @gnome-ui/react-native

<p align="center">
  <img src="https://raw.githubusercontent.com/ElJijuna/gnome-ui/main/public/assets/gnome-ui.png" alt="gnome-ui" width="120" />
</p>

React Native component library following the [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/), targeting iOS/Android/GNOME-mobile shells.

[![npm](https://img.shields.io/npm/v/@gnome-ui/react-native)](https://www.npmjs.com/package/@gnome-ui/react-native)
[![CI](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

> **Status:** scaffold only — no components ship yet. Package structure and
> build tooling are in place; component ports from `@gnome-ui/react` start
> next. See [ROADMAP.md](../../ROADMAP.md) Priority 3.

## How it works

Bare React Native — no Expo SDK dependency, so the package works in both
Expo-managed and bare RN apps. Components are rebuilt with native primitives
(`View`, `Text`, `Pressable`, `StyleSheet`) rather than ported 1:1 from
`@gnome-ui/react`'s DOM-based JSX, but mirror its component API/props where
the platforms overlap. Design tokens come from `@gnome-ui/core` via a
generated RN-compatible theme object (plain JS values, not CSS custom
properties) — that generator lands before the first component.

## Installation

```bash
npm install @gnome-ui/react-native react-native
```

## License

[MIT](../../LICENSE) © el_jijuna
