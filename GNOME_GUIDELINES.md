# GNOME Design System — Guidelines

Reference for building components that follow the [GNOME Human Interface Guidelines (HIG)](https://developer.gnome.org/hig/) and the [Adwaita](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/css-variables.html) design language.

---

## 1. Design Principles

1. **Clarity** — Interfaces should be easy to understand at a glance.
2. **Consistency** — Use system patterns. Users learn the UI once; it must behave the same everywhere.
3. **Efficiency** — Minimize steps to complete tasks.
4. **Forgiveness** — Prefer reversible actions. Confirm destructive ones.
5. **Accessibility** — Use relative font sizes, sufficient contrast, and keyboard navigation.

---

## 2. Color

All colors are exposed as CSS custom properties via `tokens.css`.

### Palette

| Name     | Shade 1 (lightest) | Shade 3 (base)  | Shade 5 (darkest) |
|----------|--------------------|-----------------|-------------------|
| Blue     | `#99c1f1`          | `#3584e4`       | `#1a5fb4`         |
| Green    | `#8ff0a4`          | `#33d17a`       | `#26a269`         |
| Yellow   | `#f9f06b`          | `#f6d32d`       | `#e5a50a`         |
| Orange   | `#ffbe6f`          | `#ff7800`       | `#c64600`         |
| Red      | `#f66151`          | `#e01b24`       | `#a51d2d`         |
| Purple   | `#dc8add`          | `#9141ac`       | `#63452c`         |

### Semantic Tokens

| Token                        | Purpose                                     |
|------------------------------|---------------------------------------------|
| `--gnome-accent-color`       | Interactive elements (links, focus rings)   |
| `--gnome-accent-bg-color`    | Suggested action button background          |
| `--gnome-destructive-bg-color` | Destructive action button background      |
| `--gnome-success-bg-color`   | Positive feedback / success state           |
| `--gnome-warning-bg-color`   | Cautionary state                            |
| `--gnome-error-bg-color`     | Error state                                 |

### Rules

- **Never hard-code colors**. Always reference design tokens.
- Default accent color is **blue** (`--gnome-blue-3: #3584e4`). Users/distributions may override it.
- Always support **dark mode** via `@media (prefers-color-scheme: dark)` or a `.dark` data attribute.
- Minimum contrast ratio: **4.5:1** for text (WCAG AA).

---

## 3. Typography

Font family: **Adwaita Sans** (falls back to Cantarell → Inter → system-ui).

```css
font-family: var(--gnome-font-family);
```

### Scale

| Token                          | Size (rem) | Use case              |
|--------------------------------|------------|-----------------------|
| `--gnome-font-size-caption`    | 0.75rem    | Labels, captions      |
| `--gnome-font-size-body`       | 1rem       | Body text (base)      |
| `--gnome-font-size-title-4`    | 1.125rem   | Small headings        |
| `--gnome-font-size-title-3`    | 1.25rem    | Section headings      |
| `--gnome-font-size-title-2`    | 1.5rem     | Page headings         |
| `--gnome-font-size-title-1`    | 1.875rem   | Modal/dialog titles   |
| `--gnome-font-size-large-title`| 2.25rem    | Hero / welcome screens|

### Rules

- **Always use `rem`/`em`**, never `px` for font sizes — respects user accessibility settings.
- **Minimize font variants** — stick to normal (400) and semibold (600).
- Use **Header Capitalization** for button labels and headings (e.g. "Save Document").
- Use proper Unicode: `"` `"` (U+201C/201D), `…` (U+2026), `–` (U+2013).

---

## 4. Spacing

6 px base grid. All spacing tokens are multiples of 6 px.

| Token              | Value | Use case                                    |
|--------------------|-------|---------------------------------------------|
| `--gnome-space-1`  | 6px   | Icon-label gap, tight inline spacing        |
| `--gnome-space-2`  | 12px  | Label-to-component gap, button padding      |
| `--gnome-space-3`  | 18px  | Group separation (vertical)                 |
| `--gnome-space-4`  | 24px  | Section padding                             |
| `--gnome-space-5`  | 36px  | Dialog / page padding                       |
| `--gnome-space-6`  | 48px  | Large layout gaps                           |

---

## 5. Border Radius

| Token                  | Value    | Use case                          |
|------------------------|----------|-----------------------------------|
| `--gnome-radius-sm`    | 4px      | Small inline elements             |
| `--gnome-radius-md`    | 8px      | **Default** (buttons, inputs…)    |
| `--gnome-radius-lg`    | 12px     | Cards, popovers, dialogs          |
| `--gnome-radius-xl`    | 15px     | Windows                           |
| `--gnome-radius-pill`  | 9999px   | Pill buttons, circular buttons    |

---

## 6. Shadows

| Token                | Use case                       |
|----------------------|--------------------------------|
| `--gnome-shadow-sm`  | Subtle elevation (buttons)     |
| `--gnome-shadow-md`  | Popovers, dropdowns            |
| `--gnome-shadow-lg`  | Dialogs, floating windows      |

---

## 7. Transitions

| Token                     | Value  |
|---------------------------|--------|
| `--gnome-duration-fast`   | 100ms  |
| `--gnome-duration-normal` | 200ms  |
| `--gnome-duration-slow`   | 400ms  |
| `--gnome-easing-default`  | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |

Use `fast` for hover/active state changes. Use `normal` for appearing/disappearing elements.

---

## 8. Component Patterns

### 8.1 Buttons

| Variant       | When to use                                               |
|---------------|-----------------------------------------------------------|
| `default`     | Standard actions with no particular priority              |
| `suggested`   | The single primary / affirmative action in a view         |
| `flat`        | Actions inside header bars, toolbars, or dense UIs        |
| `destructive` | Irreversible or dangerous actions (Delete, Format…)       |

**Rules:**
- Use at most **one `suggested` button** per window/view.
- Use at most **one `destructive` button** per dialog.
- Labels must be **imperative verbs** with Header Capitalization.
- Avoid mixing icon + label on buttons outside header bars.
- Place **affirmative actions on the right**, cancel on the left (dialogs).

### 8.2 Forms & Inputs

- Group related controls with clear labels above or to the left.
- Use `12px` horizontal gap between label and its input.
- Show validation feedback inline, immediately after the control.

### 8.3 Dialogs

- Keep dialogs focused on a **single task**.
- Include a title, optional body text, and a button row.
- Button order: **[Cancel] [Destructive] [Suggested]** (left → right).
- Do not open dialogs from dialogs.

### 8.4 Header Bars

- Use `flat` buttons in header bars.
- Keep the title centered and concise.
- Place primary navigation controls (back, menu) on the left; secondary actions on the right.

---

## 9. Accessibility

- All interactive elements must be **keyboard navigable** (Tab, Enter, Space, Escape).
- Provide `aria-label` for icon-only buttons.
- Focus ring must be clearly visible (`--gnome-focus-ring-width: 3px`).
- Do not rely on color alone to convey meaning.
- Test with a screen reader (Orca on GNOME) and the `@storybook/addon-a11y` panel.

---

## 10. Dark Mode

Components must respond to `@media (prefers-color-scheme: dark)` automatically via the tokens defined in `tokens.css`. No additional logic needed in component code — simply reference CSS custom properties.

```css
/* ✅ correct — adapts automatically */
color: var(--gnome-window-fg-color);

/* ❌ wrong — breaks dark mode */
color: rgba(0, 0, 0, 0.8);
```

---

## 11. File & Component Conventions

```
src/
  components/
    ComponentName/
      ComponentName.tsx        # Component implementation
      ComponentName.module.css # Scoped styles (CSS Modules)
      ComponentName.stories.tsx # Storybook stories
      index.ts                 # Re-exports
  styles/
    tokens.css                 # All design tokens (single source of truth)
  index.ts                     # Library public API
```

- One component per directory.
- CSS Modules for all component styles — no global class names.
- All design values (color, spacing, radius…) **must** come from `tokens.css` variables.
- Props interface must be exported and documented with JSDoc.
- Every component must have a Storybook story with `autodocs` tag.
