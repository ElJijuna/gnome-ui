# @gnome-ui/layout

Full-page application shell components following the [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/), built on the [Adwaita](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/) design language.

[![npm](https://img.shields.io/npm/v/@gnome-ui/layout)](https://www.npmjs.com/package/@gnome-ui/layout)
[![CI](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml)
[![Storybook](https://img.shields.io/badge/Storybook-live-ff4785?logo=storybook&logoColor=white)](https://eljijuna.github.io/gnome-ui/layout/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

Live documentation: **[Storybook →](https://eljijuna.github.io/gnome-ui/layout/)**

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

#### Mobile sidebar overlay

On viewports narrower than **640 px** the sidebar becomes a slide-in overlay panel. Two additional props control its visibility:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sidebarOpen` | `boolean` | `false` | Whether the sidebar overlay is visible on mobile |
| `onSidebarClose` | `() => void` | — | Called when the user taps the backdrop — use it to set `sidebarOpen` back to `false` |

On wider (desktop) viewports the sidebar is always visible in the layout flow and these props are ignored.

```tsx
import { useState } from "react";
import { Layout } from "@gnome-ui/layout";
import "@gnome-ui/layout/styles";
import { Toolbar, Spacer, Button, Sidebar, SidebarSection, SidebarItem, Text } from "@gnome-ui/react";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Layout
      topBar={
        <Toolbar style={{ minHeight: 48, padding: "0 8px" }}>
          <Button
            variant="flat"
            aria-label="Toggle sidebar"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            ☰
          </Button>
          <Text variant="heading">My App</Text>
          <Spacer />
        </Toolbar>
      }
      sidebar={
        <Sidebar>
          <SidebarSection>
            <SidebarItem label="Home" active onClick={() => setSidebarOpen(false)} />
            <SidebarItem label="Settings" onClick={() => setSidebarOpen(false)} />
          </SidebarSection>
        </Sidebar>
      }
      sidebarOpen={sidebarOpen}
      onSidebarClose={() => setSidebarOpen(false)}
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
