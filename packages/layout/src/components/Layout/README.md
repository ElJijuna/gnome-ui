Full-page application shell from **`@gnome-ui/layout`** that composes four
named zones following the GNOME Human Interface Guidelines.

| Zone | Prop | Behaviour |
|------|------|-----------|
| Header | `header` / `topBar` | Pinned header — never scrolls |
| Sidebar | `sidebar` | Fixed-width lateral navigation, overlay, or rail |
| Content | `children` | Scrollable main area |
| Footer | `footer` / `bottomBar` | Pinned footer — never scrolls |

**Install:**
```bash
npm install @gnome-ui/layout
```

**Usage:**
```tsx
import { Layout } from "@gnome-ui/layout";
import "@gnome-ui/layout/styles";

<Layout header={<AppHeader />} sidebar={<AppSidebar />} footer={<AppStatusBar />}>
  <AppContent />
</Layout>
```

The shell supports pinned headers and footers, scroll-contained content,
sidebar overlays, rail collapse, right-side placement, GNOME breakpoints, and
the project's `--gnome-*` design tokens.
