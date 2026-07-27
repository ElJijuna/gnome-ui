# @gnome-ui/web-components

Framework-agnostic GNOME UI widgets implemented with native Custom Elements,
light DOM, and the design tokens from `@gnome-ui/core`.

This initial proof set intentionally contains three behavior-rich components:

- `<gnome-dialog>` — modal focus management, Escape/backdrop dismissal, and
  focus restoration.
- `<gnome-toast>` — live-region announcements, timed dismissal, and
  pause-on-hover/focus.
- `<gnome-popover>` — trigger relationships, adaptive positioning, outside
  dismissal, and focus restoration.

The package does not depend on React, Angular, Lit, or htmx.

## Installation

```bash
npm install @gnome-ui/core @gnome-ui/web-components
```

Import tokens and component styles once, then import the package to register
all three elements:

```ts
import '@gnome-ui/core/styles';
import '@gnome-ui/web-components/styles';
import '@gnome-ui/web-components';
```

Granular entry points register only one element:

```ts
import '@gnome-ui/web-components/dialog';
import '@gnome-ui/web-components/popover';
import '@gnome-ui/web-components/toast';
```

Every registration function is idempotent. Importing these modules during SSR
is safe; registration occurs only when the Custom Elements registry exists.

## Dialog

```html
<button id="delete-trigger" type="button">Delete</button>

<gnome-dialog id="delete-dialog" close-on-backdrop>
  <section data-slot="dialog-surface">
    <header data-slot="dialog-header">
      <h2 data-slot="dialog-title">Delete item?</h2>
      <p data-slot="dialog-description">This action cannot be undone.</p>
    </header>

    <div data-slot="dialog-actions">
      <button type="button" autofocus data-cancel>Cancel</button>
      <button type="button" data-confirm>Delete</button>
    </div>
  </section>
</gnome-dialog>

<script type="module">
  const dialog = document.querySelector('#delete-dialog');

  document.querySelector('#delete-trigger').addEventListener('click', () => {
    dialog.showModal();
  });

  dialog.querySelector('[data-cancel]').addEventListener('click', () => {
    dialog.close();
  });
</script>
```

`close-on-backdrop` is opt-in. Escape and backdrop requests emit a cancelable
`gnome-cancel` event before closing.

## Toast

```html
<gnome-toast id="saved-toast" duration="5000" variant="success">
  <span data-slot="toast-title">Changes saved</span>
  <span data-slot="toast-actions">
    <button type="button" data-action="undo">Undo</button>
    <button type="button" data-dismiss aria-label="Dismiss notification">×</button>
  </span>
</gnome-toast>

<script type="module">
  const toast = document.querySelector('#saved-toast');
  toast.show();

  toast.addEventListener('gnome-action', (event) => {
    if (event.detail.action === 'undo') {
      // Undo the operation.
    }
  });
</script>
```

Set `duration="0"` for a persistent toast. `gnome-before-dismiss` is
cancelable; `gnome-dismiss` reports the final dismissal reason.

## Popover

```html
<gnome-popover placement="bottom">
  <button type="button" data-slot="popover-trigger">Options</button>

  <section data-slot="popover-content">
    <a href="/profile">Profile</a>
    <button type="button">Sign out</button>
  </section>
</gnome-popover>
```

The trigger receives `aria-haspopup`, `aria-expanded`, and `aria-controls`.
The popover flips and clamps itself to remain inside the viewport.

## htmx

Because all content remains in light DOM, htmx can process and replace
fragments without `htmx.process()`:

```html
<gnome-dialog id="editor">
  <section data-slot="dialog-surface">
    <form hx-put="/items/42" hx-target="#item-42" hx-swap="outerHTML">
      <!-- server-rendered fields -->
      <button type="submit">Save</button>
    </form>
  </section>
</gnome-dialog>
```

## Events

| Event | Components | Cancelable | Detail |
|-------|------------|------------|--------|
| `gnome-open-change` | Dialog, Popover, Toast | No | `{ open }` |
| `gnome-cancel` | Dialog, Popover | Yes | `{ reason }` |
| `gnome-close` | Dialog, Popover | No | `{ reason }` |
| `gnome-action` | Toast | Yes | `{ action }` |
| `gnome-before-dismiss` | Toast | Yes | `{ reason }` |
| `gnome-dismiss` | Toast | No | `{ reason }` |

## Accessibility

- Dialogs trap focus while open, support Escape, lock background scrolling,
  label themselves from light-DOM title/description slots, and restore focus.
- Toasts use a polite atomic live region and pause timers during hover or
  keyboard interaction.
- Popovers expose trigger/content relationships, move focus into their
  content, and restore focus after keyboard dismissal.
- Animations are disabled when `prefers-reduced-motion` is enabled.
- High-contrast borders respect `prefers-contrast: more`.

Consumers remain responsible for accessible names on their own controls,
including icon-only dismiss buttons.

## Storybook

Run the package Storybook to exercise controls, keyboard behavior, focus
management, viewport collision handling, themes, and accessibility checks:

```bash
npm run storybook --workspace @gnome-ui/web-components
```

Create the static Storybook used by GitHub Pages:

```bash
npm run build-storybook --workspace @gnome-ui/web-components
```

The deployed catalog is available under `/web-components/` alongside the
other package Storybooks.

## Releases

The package follows the repository semantic-release workflow. Release commits
use the package scope, for example:

```text
feat(@gnome-ui/web-components): add menu element
fix(@gnome-ui/web-components): restore focus after reconnect
```
