# @gnome-ui/layout

Full-page application shell components following the [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/), built on the [Adwaita](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/) design language.

[![npm](https://img.shields.io/npm/v/@gnome-ui/layout)](https://www.npmjs.com/package/@gnome-ui/layout)
[![CI](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

Live documentation: **[Storybook →](https://eljijuna.github.io/gnome-ui/?path=/docs/layout-Layout--docs)**

## Installation

```bash
npm install @gnome-ui/layout
```

## Setup

Import the stylesheet once at the root of your app:

```tsx
// main.tsx or App.tsx
import "@gnome-ui/layout/styles";
```

## Components

### `Layout`

Full-page application shell with four named, optional zones:

| Zone | Prop | Description |
|------|------|-------------|
| Top bar | `topBar` | Pinned header — typically a `Toolbar` or `HeaderBar`. Never scrolls. |
| Sidebar | `sidebar` | Fixed-width lateral navigation — typically a `Sidebar`. |
| Content | `children` | Scrollable main area. Fills remaining space. |
| Bottom bar | `bottomBar` | Pinned footer — typically a status `Toolbar`. Never scrolls. |

All props of `<div>` are forwarded to the root element.

```tsx
import { Layout } from "@gnome-ui/layout";
import "@gnome-ui/layout/styles";

// With @gnome-ui/react for inner components:
import { Toolbar, Spacer, Sidebar, SidebarSection, SidebarItem, Text } from "@gnome-ui/react";

export default function App() {
  return (
    <Layout
      topBar={
        <Toolbar style={{ minHeight: 48, padding: "0 16px" }}>
          <Text variant="heading">My App</Text>
          <Spacer />
        </Toolbar>
      }
      sidebar={
        <Sidebar>
          <SidebarSection>
            <SidebarItem label="Home" active />
            <SidebarItem label="Settings" />
          </SidebarSection>
        </Sidebar>
      }
      bottomBar={
        <Toolbar style={{ minHeight: 36, padding: "0 16px" }}>
          <Text variant="caption" color="dim">Ready</Text>
        </Toolbar>
      }
    >
      <main style={{ padding: 24 }}>
        <Text variant="title-2">Welcome</Text>
      </main>
    </Layout>
  );
}
```

## License

[MIT](../../LICENSE)
