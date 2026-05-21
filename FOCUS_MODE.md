# focusMode — hover highlight + dim effect

## Context

A "presentation / focus" mode where when active:

1. The component under the cursor receives an animated accent-color ring
2. Optionally, the other components in the region are dimmed

Useful for demos, walkthroughs, and interactive presentation modes.

---

## Recommended architecture

### Three independent parts

```
1. GnomeProvider.focusMode prop  →  [data-focus-mode] on <html>
2. CSS in packages/core          →  animated ring + dim styles
3. <FocusModeRegion> component   →  scope for the dimming effect
```

---

## Part 1: GnomeProvider + hook

### `GnomeContext.ts`

Add to `GnomeContextValue`:

```typescript
focusMode: boolean;
```

Hook:

```typescript
export function useFocusMode(): boolean {
  return useContext(GnomeContext).focusMode;
}
```

Default in `createContext`: `focusMode: false`

### `GnomeProvider.tsx`

New prop:

```typescript
focusMode?: boolean; // default false
```

DOM effect (same pattern as `colorScheme`):

```typescript
useEffect(() => {
  const root = document.documentElement;
  if (focusMode) {
    root.setAttribute("data-focus-mode", "");
  } else {
    root.removeAttribute("data-focus-mode");
  }
}, [focusMode]);
```

Update `contextValue` to include `focusMode`.

### `packages/react/src/index.ts`

```typescript
export { useFocusMode } from "./components/GnomeProvider/GnomeContext";
```

---

## Part 2: CSS in `packages/core`

### New file: `packages/core/src/focus-mode.css`

Imported from `packages/core/src/index.css`.

**Animated ring on hover — using `outline` to avoid colliding with existing `box-shadow`:**

```css
[data-focus-mode] *:hover {
  outline: 2px solid var(--gnome-accent-color, #3584e4);
  outline-offset: 2px;
  transition: outline-color 150ms ease, outline-offset 150ms ease;
}

/* No ring on the document root itself */
[data-focus-mode]:hover {
  outline: none;
}
```

`outline` does not affect layout and does not collide with component `box-shadow` — cleanest option.

**Dimming via `<FocusModeRegion>` (requires scope container — see Part 3):**

```css
/* When something inside the region is hovered,
   dim all non-hovered direct children */
[data-focus-region]:has(*:hover) > * {
  opacity: var(--gnome-focus-dim-opacity, 0.45);
  transition: opacity 200ms ease;
}

[data-focus-region]:has(*:hover) > *:hover,
[data-focus-region]:has(*:hover) > *:has(*:hover) {
  opacity: 1;
}
```

New token in `tokens.css`:

```css
:root {
  --gnome-focus-dim-opacity: 0.45;
}
```

---

## Part 3: `<FocusModeRegion>` component

**Why it is needed:** `:has(*:hover)` dimming needs a well-defined scope.
Applying it globally on `<html>` would give unpredictable results since the
direct children of `<html>` are `<head>` and `<body>`.

```
packages/react/src/components/FocusModeRegion/
├── FocusModeRegion.tsx
└── index.ts
```

**FocusModeRegion.tsx:**

```tsx
interface FocusModeRegionProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
}

export function FocusModeRegion({
  children, className, style, as: Tag = "div",
}: FocusModeRegionProps) {
  const focusMode = useFocusMode();
  return (
    <Tag
      data-focus-region={focusMode ? "" : undefined}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}
```

Only activates `data-focus-region` when `focusMode` is active —
no CSS overhead in normal mode.

### Scope of the dimming effect

**The dim ONLY affects direct children of `<FocusModeRegion>`.**
The toolbar, sidebar, and any element outside `<FocusModeRegion>` are NOT dimmed.
Only sibling elements within the region compete with each other.

The hover ring IS global (applies to any element under `[data-focus-mode]`).
To scope the ring as well, move its CSS from `[data-focus-mode] *:hover`
to `[data-focus-region] *:hover`.

**Typical usage — only the content area:**

```tsx
<GnomeProvider focusMode>
  <AppLayout>
    <Sidebar />       {/* NOT affected by dim */}
    <Toolbar />       {/* NOT affected by dim */}
    <main>
      {/* Only siblings here compete — others are dimmed on hover */}
      <FocusModeRegion style={{ display: "grid", gap: 16 }}>
        <Card>A</Card>
        <Card>B</Card>  {/* hover B → A and C are dimmed */}
        <Card>C</Card>
      </FocusModeRegion>
    </main>
  </AppLayout>
</GnomeProvider>
```

---

## Files to modify / create

| File | Change |
|------|--------|
| `packages/react/src/components/GnomeProvider/GnomeContext.ts` | Add `focusMode: boolean`, `useFocusMode()` |
| `packages/react/src/components/GnomeProvider/GnomeProvider.tsx` | Prop `focusMode?`, `useEffect` sets/removes `data-focus-mode` |
| `packages/react/src/components/FocusModeRegion/FocusModeRegion.tsx` | New |
| `packages/react/src/components/FocusModeRegion/index.ts` | New |
| `packages/react/src/index.ts` | Export `useFocusMode`, `FocusModeRegion`, `FocusModeRegionProps` |
| `packages/core/src/focus-mode.css` | New — animated ring + dim CSS |
| `packages/core/src/tokens.css` | Add `--gnome-focus-dim-opacity` to `:root` |
| `packages/core/src/index.css` | Import `focus-mode.css` |

---

## Design notes

- **Ring via `outline`** (not `box-shadow`): avoids collision with existing interactive
  component styles, does not affect layout, is animatable.
- **Dimming is opt-in** via `<FocusModeRegion>`: the ring works without it;
  dimming requires a scope container to be predictable.
- **`data-focus-mode` on `<html>`**: same pattern as `data-theme` — any CSS at
  any level can react to it.
- **`[data-focus-region]` only active when `focusMode=true`**: zero overhead
  in normal mode.
- **CSS `:has()`**: supported in all modern browsers (Chrome 105+, Safari 15.4+,
  Firefox 121+). No fallback needed for a modern design system.
