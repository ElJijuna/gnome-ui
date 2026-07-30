# @gnome-ui/web-components

Framework-agnostic GNOME UI widgets implemented with native Custom Elements,
light DOM, and the design tokens from `@gnome-ui/core`.

The package currently contains nine framework-agnostic components:

- `<gnome-button>` — styled native buttons with GNOME variants, sizing,
  loading state, and preserved form behavior.
- `<gnome-checkbox>` — styled native multi-selection checkbox with imperative
  `indeterminate` support.
- `<gnome-dialog>` — modal focus management, Escape/backdrop dismissal, and
  focus restoration.
- `<gnome-menu>` — action menus with arrow-key navigation, typeahead, and
  cancelable selection events.
- `<gnome-radio-group>` — shared naming and group-level disabling around
  native radio inputs, with a normalized `value`/`gnome-change` API.
- `<gnome-switch>` — styled native on/off toggle with preserved form
  behavior and native `change`/`input` events.
- `<gnome-text-field>` — styled native text input/textarea with label and
  helper/error text slots wired via `for`/`id` and `aria-describedby`.
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
all elements:

```ts
import '@gnome-ui/core/styles';
import '@gnome-ui/web-components/styles';
import '@gnome-ui/web-components';
```

Granular entry points register only one element:

```ts
import '@gnome-ui/web-components/button';
import '@gnome-ui/web-components/checkbox';
import '@gnome-ui/web-components/dialog';
import '@gnome-ui/web-components/menu';
import '@gnome-ui/web-components/popover';
import '@gnome-ui/web-components/radio-group';
import '@gnome-ui/web-components/switch';
import '@gnome-ui/web-components/text-field';
import '@gnome-ui/web-components/toast';
```

Every registration function is idempotent. Importing these modules during SSR
is safe; registration occurs only when the Custom Elements registry exists.

## Button

```html
<gnome-button variant="suggested" size="md">
  <button
    type="submit"
    name="intent"
    value="save"
    data-slot="button-control"
    hx-post="/settings"
  >
    Save changes
  </button>
</gnome-button>
```

`gnome-button` deliberately composes a native light-DOM `<button>` instead of
reimplementing button semantics on the custom element. Native form submission,
keyboard activation, accessible naming, `name`/`value`, and htmx attributes
therefore continue to work normally.

The host accepts:

- `variant="default|suggested|destructive|flat|raised"`
- `size="sm|md|lg"`
- `shape="default|pill|circular"`
- Boolean `disabled`, `loading`, and `osd` attributes

`loading` sets `aria-busy="true"` and temporarily disables the native control.
Consumer-owned `disabled` and `aria-busy` values are restored when the state
ends or htmx replaces the control. The host's `focus()` and `click()` methods
delegate to the native button.

## Checkbox

```html
<label>
  <gnome-checkbox>
    <input type="checkbox" data-slot="checkbox-control" />
  </gnome-checkbox>
  Select item
</label>

<script type="module">
  const checkbox = document.querySelector('gnome-checkbox');
  const control = checkbox.querySelector('input');

  control.addEventListener('change', () => {
    console.log('Selected:', control.checked);
  });

  // "Select all" pattern: apply indeterminate on the host, not the input.
  checkbox.indeterminate = true;
</script>
```

`gnome-checkbox` composes a native light-DOM `<input type="checkbox">`.
Native form participation, the `checked` property, and `change`/`input`
events continue to work normally — listen on the input directly or on the
host.

`indeterminate` has no HTML attribute equivalent, so the host applies it to
the control imperatively whenever the `indeterminate` attribute or property
is set on `<gnome-checkbox>`. As with native checkboxes, user interaction
(a click or Space) resolves the visual indeterminate state on the control;
update the host's `indeterminate` property again if your "select all" logic
still considers the group mixed.

The host accepts a boolean `disabled` attribute, which disables the native
control while preserving any disabled state the consumer set directly on it
once the host's `disabled` attribute is removed. `focus()` and `click()`
delegate to the native control.

## Switch

```html
<label>
  Wi-Fi
  <gnome-switch>
    <input type="checkbox" role="switch" data-slot="switch-control" />
  </gnome-switch>
</label>

<script type="module">
  const control = document.querySelector('gnome-switch input');

  control.addEventListener('change', () => {
    console.log('Wi-Fi is now', control.checked ? 'on' : 'off');
  });
</script>
```

`gnome-switch` composes a native light-DOM `<input type="checkbox">` instead
of reimplementing toggle semantics on the custom element. The consumer marks
it `role="switch"` and `data-slot="switch-control"`; native form
participation, the `checked` property, and `change`/`input` events continue
to work normally — listen on the input directly or on the host, since light
DOM lets the events bubble through either.

The host accepts a boolean `disabled` attribute, which disables the native
control while preserving any disabled state the consumer set directly on it
once the host's `disabled` attribute is removed. `gnomeSwitch.checked` proxies
to the native control's `checked` property; `focus()` and `click()` delegate
to it as well.

## Radio Group

```html
<gnome-radio-group name="view-mode">
  <label><input type="radio" data-slot="radio-control" value="list" checked /> List</label>
  <label><input type="radio" data-slot="radio-control" value="grid" /> Grid</label>
  <label><input type="radio" data-slot="radio-control" value="compact" /> Compact</label>
</gnome-radio-group>

<script type="module">
  const group = document.querySelector('gnome-radio-group');

  group.addEventListener('gnome-change', (event) => {
    console.log('View mode:', event.detail.value);
  });
</script>
```

`gnome-radio-group` composes native light-DOM `<input type="radio">`
controls marked `data-slot="radio-control"`. Same-name native radios already
provide mutual exclusivity, arrow-key cycling, and Space/click selection in
every browser, so the host does not reimplement that — it only:

- Assigns a shared `name` to every control: the host's own `name` attribute
  if set, otherwise an auto-generated one, so groups work correctly even
  without an explicit `name`.
- Mirrors a group-level `disabled` attribute onto every control, preserving
  any disabled state a consumer set directly on one of them.
- Normalizes selection into a `value` property (get the checked control's
  value, or set it to check the matching control) and a `gnome-change`
  event with `{ value }`, dispatched whenever any control's native `change`
  fires.

## Text Field

```html
<gnome-text-field>
  <label data-slot="text-field-label">Username</label>
  <input type="text" data-slot="text-field-control" placeholder="octocat" />
  <span data-slot="text-field-hint">Choose a unique handle.</span>
</gnome-text-field>
```

`gnome-text-field` composes a native light-DOM `<input>` or `<textarea>`
marked `data-slot="text-field-control"`, with optional `<label
data-slot="text-field-label">` and `data-slot="text-field-hint"` slots.
Consumers own all label and hint text content; the host only wires ARIA
relationships and state:

- Links the label to the control via `for`/`id` (auto-generated if the
  control has none).
- Links the hint to the control via `aria-describedby` (auto-generated),
  removing it if the hint is removed.
- Mirrors a group-level `disabled` attribute onto the control, dimming the
  whole field, while preserving any disabled state set directly on the
  control.
- Mirrors an `invalid` boolean attribute onto the control's `aria-invalid`
  and applies the error visual treatment to the control and hint —
  consumers still choose what message the hint displays.

`value` proxies to the native control's `value`; `focus()`,
`checkValidity()`, `reportValidity()`, `setCustomValidity()`, and `validity`
delegate to it as well, so standard HTML5 form validation keeps working.

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
`gnome-cancel` event before closing. Dialogs can be stacked; only the most
recently opened dialog remains interactive, and closing it restores the
previous modal and its focus.

## Menu

```html
<gnome-menu placement="bottom">
  <button type="button" data-slot="menu-trigger">Project options</button>

  <section data-slot="menu-content">
    <span data-slot="menu-label">Project</span>
    <button type="button" data-menu-item data-value="rename">Rename</button>
    <button type="button" data-menu-item disabled>Duplicate</button>
    <button type="button" data-menu-item data-value="archive">
      Archive
      <span data-slot="menu-shortcut" aria-hidden="true">⇧⌘A</span>
    </button>
    <hr data-slot="menu-separator" />
    <a href="/settings" data-menu-item data-value="settings">
      Project settings
    </a>
  </section>
</gnome-menu>

<script type="module">
  document.querySelector('gnome-menu').addEventListener('gnome-select', (event) => {
    if (event.detail.value === 'archive' && !window.confirm('Archive project?')) {
      event.preventDefault();
    }
  });
</script>
```

Use semantic buttons and links for items and mark each with `data-menu-item`.
The component adds the menu roles and trigger relationships, skips disabled
items, supports Arrow keys, Home, End, and typeahead, and restores trigger
focus after Escape or selection. Add `data-keep-open` when an item should not
close the menu.

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

Dialog, Menu, and Popover observe light-DOM swaps while open. Replacing Menu or
Popover trigger/content fragments refreshes `aria-controls`, `aria-expanded`,
the accessible name relationship, positioning, and focus without reopening it.

## Events

| Event | Components | Cancelable | Detail |
|-------|------------|------------|--------|
| `gnome-open-change` | Dialog, Menu, Popover, Toast | No | `{ open }` |
| `gnome-cancel` | Dialog, Menu, Popover | Yes | `{ reason }` |
| `gnome-close` | Dialog, Menu, Popover | No | `{ reason }` |
| `gnome-select` | Menu | Yes | `{ item, value }` |
| `gnome-change` | Radio Group | No | `{ value }` |
| `gnome-action` | Toast | Yes | `{ action }` |
| `gnome-before-dismiss` | Toast | Yes | `{ reason }` |
| `gnome-dismiss` | Toast | No | `{ reason }` |

## Accessibility

- Dialogs trap focus while open, support Escape, lock background scrolling,
  label themselves from light-DOM title/description slots, and restore focus.
- Buttons retain native button semantics and form participation; circular
  icon-only controls still require an explicit accessible name.
- Menus expose the WAI-ARIA menu pattern, support directional navigation and
  typeahead, skip disabled items, and restore focus after dismissal.
- Switches retain native checkbox semantics and form participation; the
  consumer must add `role="switch"` and an accessible name (a `<label>` or
  `aria-label`).
- Checkboxes retain native checkbox semantics and form participation,
  including the `indeterminate` visual state.
- Radio groups rely on native same-name radio semantics for mutual
  exclusivity and arrow-key cycling; the host only adds shared naming and
  group-level disabling.
- Text fields link label and hint to the control via `for`/`id` and
  `aria-describedby`, and reflect `invalid` state as `aria-invalid`.
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

Run the real-browser interaction tests against Storybook:

```bash
npm run test:browser --workspace @gnome-ui/web-components
```

These Playwright checks cover native button form behavior and loading state,
modal isolation and focus, menu keyboard navigation and fragment replacement,
popover repositioning after resize, switch and checkbox keyboard toggling
(including indeterminate resolution), radio group keyboard cycling and
group-level disabling, text field label/hint wiring and validation state,
and the toast's combined pointer/focus pause behavior. They also run in the
repository CI workflow.

## Releases

The package follows the repository semantic-release workflow. Release commits
use the package scope, for example:

```text
feat(@gnome-ui/web-components): add menu element
fix(@gnome-ui/web-components): restore focus after reconnect
```
