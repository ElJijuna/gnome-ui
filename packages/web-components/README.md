# @gnome-ui/web-components

Framework-agnostic GNOME UI widgets implemented with native Custom Elements,
light DOM, and the design tokens from `@gnome-ui/core`.

The package currently contains twenty-eight framework-agnostic components:

- `<gnome-action-row>` — settings row with title/subtitle/prefix/suffix
  slots; `interactive` composes a real `<button data-slot="row-surface">`
  around everything except `row-suffix`, emitting `gnome-activate`.
- `<gnome-avatar>` — circular image or name-derived initials fallback,
  driven by the composed `<img>`'s own `error` event.
- `<gnome-badge>` — pure CSS counter/status indicator, optionally anchored
  over another element.
- `<gnome-banner>` — persistent top-of-view message strip with
  `data-action`/`data-dismiss` descendants and `gnome-action`/`gnome-dismiss`
  events.
- `<gnome-boxed-list>` — rounded bordered list; gives every direct child
  `role="listitem"` and merges their borders with pure CSS dividers.
- `<gnome-button>` — styled native buttons with GNOME variants, sizing,
  loading state, and preserved form behavior.
- `<gnome-card>` — elevated content container; `interactive` composes a real
  `<button data-slot="card-surface">` around its children.
- `<gnome-checkbox>` — styled native multi-selection checkbox with imperative
  `indeterminate` support.
- `<gnome-dialog>` — modal focus management, Escape/backdrop dismissal, and
  focus restoration.
- `<gnome-dropdown>` — combo-box option list; `role="combobox"` trigger +
  `role="listbox"` content, active option tracked via
  `aria-activedescendant` instead of moving DOM focus.
- `<gnome-header-bar>` — title bar with start/title/end regions placed in
  explicit CSS grid columns so the title stays centered without either
  side slot.
- `<gnome-icon-button>` — icon-only action button, always circular; the
  host requires a `label` and syncs it onto the control's `aria-label`.
- `<gnome-level-bar>` — `role="meter"` gauge with colour-coded low/high
  offset zones; continuous fill via a CSS custom property, or a row of
  host-derived blocks in `discrete` mode.
- `<gnome-menu>` — action menus with arrow-key navigation, typeahead, and
  cancelable selection events.
- `<gnome-radio-group>` — shared naming and group-level disabling around
  native radio inputs, with a normalized `value`/`gnome-change` API.
- `<gnome-separator>` — dividing line; the host manages
  `role="separator"`/`aria-orientation` since a custom element can't switch
  between `<hr>` and a `<div>` per orientation like the React version.
- `<gnome-skeleton>` — presentational loading placeholder with rect,
  circle, and text (row-count) variants.
- `<gnome-slider>` — styled native `<input type="range">` with a
  CSS-driven accent fill.
- `<gnome-spin-button>` — styled native `<input type="number">` with
  decrement/increment buttons wired to `stepDown()`/`stepUp()`.
- `<gnome-spinner>` — presentational indeterminate loading indicator with
  `role="status"`.
- `<gnome-progress-bar>` — presentational determinate/indeterminate progress
  indicator with `role="progressbar"`.
- `<gnome-switch>` — styled native on/off toggle with preserved form
  behavior and native `change`/`input` events.
- `<gnome-tab-bar>` — `role="tablist"` roving-tabindex keyboard navigation;
  the host does not create tabs or manage selection, only focus movement.
- `<gnome-text-field>` — styled native text input/textarea with label and
  helper/error text slots wired via `for`/`id` and `aria-describedby`.
- `<gnome-toast>` — live-region announcements, timed dismissal, and
  pause-on-hover/focus.
- `<gnome-popover>` — trigger relationships, adaptive positioning, outside
  dismissal, and focus restoration.
- `<gnome-tooltip>` — hover/focus-triggered informational bubble, sharing
  `gnome-popover`'s floating-position helper; no focus trap.
- `<gnome-view-switcher>` — segmented control (`role="radiogroup"`); all
  four arrow keys cycle and moving focus also activates the target item
  (automatic activation).

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
import '@gnome-ui/web-components/avatar';
import '@gnome-ui/web-components/badge';
import '@gnome-ui/web-components/button';
import '@gnome-ui/web-components/checkbox';
import '@gnome-ui/web-components/dialog';
import '@gnome-ui/web-components/dropdown';
import '@gnome-ui/web-components/icon-button';
import '@gnome-ui/web-components/level-bar';
import '@gnome-ui/web-components/menu';
import '@gnome-ui/web-components/popover';
import '@gnome-ui/web-components/progress-bar';
import '@gnome-ui/web-components/radio-group';
import '@gnome-ui/web-components/slider';
import '@gnome-ui/web-components/spin-button';
import '@gnome-ui/web-components/spinner';
import '@gnome-ui/web-components/switch';
import '@gnome-ui/web-components/tab-bar';
import '@gnome-ui/web-components/text-field';
import '@gnome-ui/web-components/toast';
import '@gnome-ui/web-components/view-switcher';
```

Every registration function is idempotent. Importing these modules during SSR
is safe; registration occurs only when the Custom Elements registry exists.

## Avatar

```html
<gnome-avatar name="Ada Lovelace" size="lg">
  <img data-slot="avatar-image" src="/ada.jpg" />
</gnome-avatar>

<!-- No image (or a broken one): shows initials derived from name -->
<gnome-avatar name="Grace Hopper"></gnome-avatar>
```

`gnome-avatar` composes a real light-DOM `<img data-slot="avatar-image">`
when the consumer wants a photo — its own native `error`/`load` events drive
the fallback, matching ordinary browser image-loading behavior. Unlike
every other component in this package, initials are always *derived* from
`name` (up to two characters, via the same algorithm as `@gnome-ui/react`),
so there is nothing for a consumer to author: the host manages a
`[data-slot="avatar-initials"]` element itself, adopting one already
present in light DOM (e.g. from server-rendered markup) or creating one.

The host defaults `alt` on the image from `name` (without overwriting an
explicit `alt`), and always keeps its own `aria-label` in sync from the
image's `alt` or `name`. `color` (`"blue" | "green" | "yellow" | "orange" |
"red" | "purple" | "brown" | "teal" | "slate"`) overrides the
deterministic name-derived color; `size` accepts
`"sm" | "md" | "lg" | "xl"` (default `"md"`). `getInitials` and
`hashNameToColor` are exported for consumers who need the same derivation
outside the component.

## Badge

```html
<gnome-badge>3</gnome-badge>
<gnome-badge variant="success">12</gnome-badge>
<gnome-badge dot variant="error"></gnome-badge>

<!-- Anchored over another element: the consumer's own wrapper must be
     position: relative (or similar) — the badge only knows about itself. -->
<span style="position: relative; display: inline-flex;">
  <gnome-icon-button aria-label="Notifications">🔔</gnome-icon-button>
  <gnome-badge anchored variant="error">3</gnome-badge>
</span>
```

`gnome-badge` is a pure CSS host — no lifecycle logic, no light-DOM
management. `variant` (`"accent" | "success" | "warning" | "error" |
"neutral"`, default `"accent"`), `dot`, and `anchored` are plain attributes
read directly by CSS. `dot` renders a small dot and visually collapses any
light-DOM text content (`font-size: 0`) rather than removing it — keep dot
badges empty. `anchored` only switches the badge to `position: absolute;
top; right;`; positioning it correctly over a sibling still requires the
consumer's own wrapper to establish the positioning context.

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

## Icon Button

```html
<gnome-icon-button variant="flat" label="Close panel">
  <button type="button" data-slot="icon-button-control">
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" fill="none" />
    </svg>
  </button>
</gnome-icon-button>
```

`gnome-icon-button` composes a native light-DOM `<button>`, same as
`gnome-button`, but is always circular — an icon-only control has no text
that would make a rectangular shape meaningful, so `shape` isn't exposed.
Any SVG or `<img>` child of the control is sized automatically from `size`.

The host accepts:

- `variant="default|suggested|destructive|flat|raised"`
- `size="sm|md|lg"`
- `label` — required accessible name, synced onto the control's
  `aria-label` (restored to any consumer-authored value once `label` is
  removed or the control is swapped, e.g. by htmx)
- Boolean `disabled`, `loading`, and `osd` attributes

`loading` sets `aria-busy="true"`, disables the native control, and hides
the icon in favor of a centered spinner. The host's `focus()` and `click()`
methods delegate to the native button.

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

## Tab Bar

```html
<gnome-tab-bar aria-label="Settings sections">
  <button role="tab" aria-selected="true">General</button>
  <button role="tab" aria-selected="false">Notifications</button>
  <button role="tab" aria-selected="false">Privacy</button>
</gnome-tab-bar>

<script type="module">
  const tabBar = document.querySelector('gnome-tab-bar');

  tabBar.addEventListener('click', (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (!tab) return;

    for (const other of tabBar.querySelectorAll('[role="tab"]')) {
      other.setAttribute('aria-selected', String(other === tab));
    }
  });
</script>
```

`gnome-tab-bar` defaults to `role="tablist"` and only manages roving-tabindex
keyboard navigation — Left/Right/Home/End move focus between descendants
marked `role="tab"` (real `<button>`s recommended, so `disabled` is free).
Same division of responsibility as `@gnome-ui/react`'s `TabBar`: the host
does not create tabs, change `aria-selected`, or show/hide panels — the
consumer owns selection state and panel visibility, same as clicking any
other button.

The host mirrors `aria-selected` onto `tabIndex` the same way
`gnome-radio-group` mirrors native `checked`: whichever tab has
`aria-selected="true"` becomes the roving-tabindex stop (falling back to the
first enabled tab if none is selected), kept in sync via a
`MutationObserver` so it also works after an htmx/Turbo swap. The boolean
`inline` attribute removes the header-bar background for use inside a card
or content area.

## View Switcher

```html
<gnome-view-switcher aria-label="View switcher">
  <button role="radio" aria-checked="true">List</button>
  <button role="radio" aria-checked="false">Grid</button>
  <button role="radio" aria-checked="false">Timeline</button>
</gnome-view-switcher>

<script type="module">
  const viewSwitcher = document.querySelector('gnome-view-switcher');

  viewSwitcher.addEventListener('click', (event) => {
    const item = event.target.closest('[role="radio"]');
    if (!item) return;

    for (const other of viewSwitcher.querySelectorAll('[role="radio"]')) {
      other.setAttribute('aria-checked', String(other === item));
    }
  });
</script>
```

`gnome-view-switcher` defaults to `role="radiogroup"` — same division of
responsibility as `gnome-tab-bar` (the host doesn't create items or manage
`aria-checked`, and mirrors it onto roving `tabIndex` the same way
`gnome-radio-group` mirrors native `checked`), but with two real
differences: all four arrow keys cycle (Left/Up move back, Right/Down move
forward) instead of a tablist's horizontal-only nav, and — since a
radiogroup uses "automatic activation" — moving focus with an arrow key
also clicks the target item, mirroring `@gnome-ui/react`'s `ViewSwitcher`.

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

## Slider

```html
<gnome-slider>
  <input
    type="range"
    data-slot="slider-control"
    aria-label="Brightness"
    min="0"
    max="100"
    value="50"
  />
</gnome-slider>
```

Unlike the React `Slider` (a synthetic `role="slider"` widget built on
pointer-event handlers), `gnome-slider` composes a real
`<input type="range">` marked `data-slot="slider-control"` — native
pointer/touch dragging, ArrowLeft/Right/Up/Down, Home/End, Page Up/Down,
and form participation all keep working without any JS. The host only
recomputes a `--gnome-slider-fill` custom property on every `input` event
so CSS can paint the accent-colored fill up to the thumb on WebKit/Blink
(Firefox paints it natively via `::-moz-range-progress`).

`value` proxies to the control's `valueAsNumber`; `focus()` delegates to
it as well.

## Spin Button

```html
<gnome-spin-button>
  <button type="button" data-slot="spin-button-decrement" aria-hidden="true" tabindex="-1">
    −
  </button>
  <input
    type="number"
    data-slot="spin-button-control"
    aria-label="Volume"
    min="0"
    max="10"
    value="5"
  />
  <button type="button" data-slot="spin-button-increment" aria-hidden="true" tabindex="-1">
    +
  </button>
</gnome-spin-button>
```

Unlike the React `SpinButton` (a synthetic `role="spinbutton"` widget),
`gnome-spin-button` composes a real `<input type="number">` marked
`data-slot="spin-button-control"` — native `min`/`max`/`step` constraint
validation, typing, and ArrowUp/ArrowDown stepping all keep working. The
decrement/increment buttons (`data-slot="spin-button-decrement"` /
`data-slot="spin-button-increment"`) are marked `aria-hidden="true"` and
`tabindex="-1"` since the native control is already the single keyboard-
and screen-reader-facing target; the host wires their clicks to the
control's `stepDown()`/`stepUp()`, dispatches `input`/`change` on the
control afterward, and keeps each button's `disabled` state in sync with
the control's bounds (and with each other, and the control itself, when the
host's own `disabled` attribute is set).

`value` proxies to the control's `valueAsNumber`; `focus()` delegates to it
as well.

## Spinner

```html
<gnome-spinner size="lg"></gnome-spinner>
<gnome-spinner label="Fetching results…"></gnome-spinner>
<gnome-spinner label=""></gnome-spinner>
<!-- silenced: a sibling already announces the loading state -->
```

`gnome-spinner` is purely presentational — no light-DOM children, no
interaction. The host itself is the spinning ring, and manages its own
ARIA: `role="status"` (unless the consumer already set a `role`) and
`aria-label` from the `label` attribute, defaulting to `"Loading…"`. Set
`label=""` to silence it (`aria-hidden="true"`) when a sibling element
already announces the loading state. `size` accepts `"sm" | "md" | "lg"`
(default `"md"`). The animation respects `prefers-reduced-motion`.

## Progress Bar

```html
<gnome-progress-bar aria-label="Download progress" value="0.6"></gnome-progress-bar>
<gnome-progress-bar aria-label="Download progress" variant="success"></gnome-progress-bar>
<!-- indeterminate: omit value -->
<gnome-progress-bar aria-label="Download progress"></gnome-progress-bar>
```

`gnome-progress-bar` is purely presentational — no light-DOM children. Native
`<progress>` has no reliably cross-browser-stylable way to paint a
custom-colored indeterminate pulse (there's no value to hook a
percentage-based pseudo-element onto), so — like `gnome-spinner` — the host
manages `role="progressbar"` and `aria-valuenow`/`aria-valuemin`/
`aria-valuemax` itself and paints the fill through CSS driven by a
`--gnome-progress-value` custom property.

Set `value` between `0` and `1` for the determinate state (out-of-range
values are clamped); omit it (or remove the attribute) for the
indeterminate pulsing state. `variant` accepts
`"accent" | "success" | "warning" | "error"` (default `"accent"`). The
transition and pulse animation both respect `prefers-reduced-motion`.

## Level Bar

```html
<gnome-level-bar
  aria-label="Disk usage"
  value="0.85"
  low="0.2"
  high="0.8"
></gnome-level-bar>

<!-- discrete mode: signal-strength style blocks -->
<gnome-level-bar
  aria-label="Signal strength"
  discrete
  num-blocks="5"
  value="0.6"
></gnome-level-bar>
```

`gnome-level-bar` is `role="meter"` — the WAI-ARIA role for a scalar
measurement within a known range, distinct from `gnome-progress-bar`'s
`role="progressbar"`. Use it for a gauge (disk usage, battery, signal
strength), not task progress.

The host accepts:

- `value`, `min` (default `0`), `max` (default `1`)
- `low` / `low-variant` (default `"warning"`) — colour used at or below the
  low threshold
- `high` / `high-variant` (default `"error"`) — colour used at or above the
  high threshold
- `variant` (default `"accent"`) — colour between the two thresholds;
  accepts `"accent" | "success" | "warning" | "error"`
- Boolean `discrete` + `num-blocks` (default `10`)

In continuous mode the fill is painted through CSS driven by a
`--gnome-level-value` custom property, same technique as
`gnome-progress-bar`. In `discrete` mode there is nothing for a consumer to
author — like `gnome-skeleton`'s `text` variant rows, the host derives
`num-blocks` `[data-slot="level-block"]` elements itself and toggles
`data-filled` up to the current fraction.

## Skeleton

```html
<gnome-skeleton width="240" height="20"></gnome-skeleton>
<gnome-skeleton variant="circle" size="48"></gnome-skeleton>
<gnome-skeleton variant="text" lines="3"></gnome-skeleton>
```

`gnome-skeleton` is a loading placeholder — purely presentational, always
`aria-hidden`. Like `gnome-avatar`'s initials, the `text` variant's row
elements (`[data-slot="skeleton-line"]`) are entirely host-derived from
`lines`; there is nothing for a consumer to author, so — unlike
`gnome-avatar` — no `MutationObserver` is needed, since nothing external
ever swaps this content.

`variant` accepts `"rect" | "circle" | "text"` (default `"rect"`). `width`
(default `"100%"`) and `height` (default `16`) apply to the `rect` variant;
`size` (default `40`) sets the diameter for `circle`; `lines` (default `3`,
minimum `1`) sets the row count for `text`, whose last row renders at 60%
width. Bare numeric values for `width`/`height`/`size` are treated as
pixels; any other CSS length (`"12rem"`, `"2em"`) is used as-is. `animated`
defaults to `true` — set `animated="false"` to disable the shimmer
regardless of `prefers-reduced-motion` (which also disables it
automatically).

## Separator

```html
<gnome-separator></gnome-separator>

<!-- Inside a flex row: stretches via align-self: stretch -->
<div style="display: flex; align-items: center; gap: 12px; height: 32px;">
  <span>Files</span>
  <gnome-separator orientation="vertical"></gnome-separator>
  <span>Music</span>
</div>
```

Unlike the React `Separator` — which renders a semantic `<hr>` for the
horizontal case and a `<div role="separator">` for the vertical one — a
custom element is always a single fixed tag, so `gnome-separator` manages
`role="separator"` and `aria-orientation` itself for both orientations
(guarded so it never overwrites a consumer-authored `role`). `orientation`
accepts `"horizontal" | "vertical"` (default `"horizontal"`; `aria-orientation`
is only set for `"vertical"`, matching the ARIA default). Color comes
entirely from design tokens and adapts to dark mode automatically.

## Banner

```html
<gnome-banner variant="warning">
  <span data-slot="banner-message">Your session will expire in 5 minutes.</span>
  <span data-slot="banner-actions">
    <button type="button" data-action="extend">Extend session</button>
    <button type="button" data-dismiss aria-label="Dismiss">×</button>
  </span>
</gnome-banner>

<script type="module">
  document.querySelector('gnome-banner').addEventListener('gnome-action', (event) => {
    if (event.detail.action === 'extend') {
      // Extend the session.
    }
  });
</script>
```

`gnome-banner` is a persistent message strip, meant to sit at the top of a
view until the user acts or dismisses it. `variant` (`"info" | "warning" |
"error" | "success"`, default `"info"`) is a plain attribute read directly
by CSS, same as `gnome-badge`/`gnome-toast` — there is no JS state to keep
in sync. The host sets `role="status"`/`aria-live="polite"` itself
(guarded, like every other auto-managed ARIA attribute in this package).

Mark a descendant `data-action` to emit `gnome-action` with
`{ action: string }` (the button's own `data-action` value, or `"default"`
if empty) — unlike `gnome-toast`, clicking one does **not** dismiss the
banner, since a banner persists until its underlying condition is
resolved, not just until the next action. Mark a descendant `data-dismiss`
to call `dismiss()`, which fires a cancelable `gnome-before-dismiss`
followed by `gnome-dismiss` and hides the banner (`hidden`) rather than
removing it from the DOM — remove it yourself in a `gnome-dismiss` listener
if that's what you want.

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

## Dropdown

```html
<gnome-dropdown placeholder="Select a theme">
  <button type="button" data-slot="dropdown-trigger"></button>
  <ul data-slot="dropdown-content">
    <li data-option data-value="light">Light</li>
    <li data-option data-value="dark">Dark</li>
    <li data-option data-value="hc" aria-disabled="true">High contrast</li>
  </ul>
</gnome-dropdown>

<script type="module">
  document.querySelector('gnome-dropdown').addEventListener('gnome-change', (event) => {
    console.log('Selected:', event.detail.value);
  });
</script>
```

`gnome-dropdown` combines `gnome-menu`'s internals — light-DOM trigger/
content, floating position with flip, outside-pointer/`Escape`/`Tab`
dismissal, geometry tracking — with a trigger styled as a `<select>`. Two
real differences from `gnome-menu`: focus never leaves the trigger (the
standard `role="combobox"` pattern tracks the active `role="option"`
through `aria-activedescendant` instead of moving DOM focus per item), and
selection is single-value, tracked via the `value` attribute and mirrored
onto each option's `aria-selected` the same way `gnome-radio-group` mirrors
native `checked`.

The host manages the trigger's visible text itself, via a
`[data-slot="dropdown-value"]` span it adopts or creates — nothing for the
consumer to author there, since it's fully derived from `value`/
`placeholder`. Options only need `data-option` + `data-value`; wrap the
label in `[data-slot="option-label"]` if you also want a secondary
`[data-slot="option-description"]` line. `disabled`/`aria-disabled="true"`
options are skipped during keyboard navigation and ignored on click.

Fires a non-cancelable `gnome-change` (`{ value }`) on selection and
`gnome-open-change`/`gnome-close` (`{ reason }`) on open-state transitions,
same shape as `gnome-menu`'s events.

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

## Tooltip

```html
<gnome-tooltip placement="top" delay="500">
  <button type="button" data-slot="tooltip-trigger" aria-label="Save">💾</button>
  <span data-slot="tooltip-content">Save file (Ctrl+S)</span>
</gnome-tooltip>
```

`gnome-tooltip` reuses the same `computeFloatingPosition` helper (and its
flip/clamp/arrow-offset logic) as `gnome-popover` — set via
`internal/floating.ts`, shared between the two. Shows on the trigger's
`mouseenter`/`focus` after `delay` milliseconds (default `500`; `delay="0"`
for instant), hides on `mouseleave`/`blur`/Escape. `placement` accepts
`"top" | "bottom" | "left" | "right"` (default `"top"`). The trigger's
`aria-describedby` is wired to the content automatically (guarded — a
consumer-authored `aria-describedby` is left alone).

Unlike `gnome-popover`, the content is never `hidden` — it stays laid out
at all times with `opacity: 0`, fading in via `[data-state="open"]`. A
`display: none` element can't transition, so this is what makes the
fade/scale animation possible; as a side effect it also keeps the
description available to `aria-describedby` readers even while the visual
bubble is hidden, which the `visibility: hidden` fallback in the React
version does not (that removes it from the accessibility tree between
hovers). There is no focus trap and no dismiss/action events — a tooltip
is purely informational.

## Card

```html
<gnome-card padding="md">
  <strong>Card title</strong>
  <p>Static content grouped on an elevated surface.</p>
</gnome-card>

<!-- Interactive: composes a real <button data-slot="card-surface"> -->
<gnome-card interactive aria-label="Open settings">
  <strong>Settings</strong>
  <p>Manage your account and preferences.</p>
</gnome-card>
```

A custom element is always one fixed tag, so unlike the React version —
which renders `<button>` (or whatever `as` specifies) when `interactive` —
`gnome-card` composes a real `<button type="button" data-slot="card-surface">`
around its existing children for native keyboard/click activation, moving
them inside without cloning (so event listeners survive). Author your own
`data-slot="card-surface"` (e.g. an `<a>` for a card that navigates) to use
a different element; the host adopts it instead of generating one.
Toggling `interactive` off unwraps the surface, moving children back onto
the host directly. An `aria-label` set on the host is copied onto a
generated surface (not onto an adopted one you authored yourself).

`padding` accepts `"none" | "sm" | "md" | "lg"` (default `"md"`) and is a
plain attribute read directly by CSS — no JS state to keep in sync.

## Action Row

```html
<gnome-action-row>
  <span data-slot="row-prefix">🔔</span>
  <span data-slot="row-title">Notifications</span>
  <span data-slot="row-subtitle">Manage app alerts</span>
  <span data-slot="row-suffix">
    <input type="checkbox" role="switch" aria-label="Notifications" checked />
  </span>
</gnome-action-row>

<!-- Interactive: composes a real <button data-slot="row-surface"> -->
<gnome-action-row interactive aria-label="Open Wi-Fi settings">
  <span data-slot="row-title">Wi-Fi</span>
  <span data-slot="row-subtitle">Home Network</span>
</gnome-action-row>

<script type="module">
  document.querySelector('gnome-action-row[interactive]').addEventListener('gnome-activate', () => {
    // Navigate or open a dialog.
  });
</script>
```

`gnome-action-row` groups `data-slot="row-title"` and `data-slot="row-subtitle"`
into a generated (or adopted) `data-slot="row-content"` wrapper so they
stack correctly next to `row-prefix`/`row-suffix` — this happens
regardless of `interactive`.

Unlike the React version — which renders `<button>` around *everything*,
including `trailing`, when `interactive` — `gnome-action-row` only composes
a real `<button data-slot="row-surface">` around `row-prefix` and
`row-content`; **`row-suffix` stays outside it.** The React docs warn that
a trailing `Switch`/`Button` needs manual `stopPropagation()` to avoid
double-nesting inside the row's own `<button>` (invalid, inaccessible
HTML) — here that problem doesn't exist structurally, since suffix is
never inside the surface. The hover/active tint still spans the full row
(`:hover`/`:active` on the host itself, which CSS already matches while the
pointer/press is on any descendant, `row-suffix` included) so it looks the
same as the React version; only the keyboard focus ring stays scoped to
`row-surface`, since it must point at the exact element that has focus —
that's the one place a `row-suffix` control (e.g. a Switch) visibly
diverges, with its own focus ring instead of the row's.

Clicking (or keyboard-activating) the surface emits `gnome-activate` —
already pre-filtered to real row activation, since clicks on a
`row-suffix` control's own elements never reach the surface. Author your
own `data-slot="row-surface"` (e.g. an `<a>` for a row that navigates) to
use a different element; the host adopts it instead of generating one.
`variant="property"` (default `"default"`) flips the visual hierarchy —
`row-title` shrinks to a dim caption label and `row-subtitle` becomes the
prominent value — and, like `padding` on `gnome-card`, is a plain attribute
read directly by CSS.

## Boxed List

```html
<gnome-boxed-list>
  <gnome-action-row>
    <span data-slot="row-title">Wi-Fi</span>
    <span data-slot="row-subtitle">Home Network</span>
    <span data-slot="row-suffix">
      <input type="checkbox" role="switch" aria-label="Wi-Fi" checked />
    </span>
  </gnome-action-row>
  <gnome-action-row>
    <span data-slot="row-title">Bluetooth</span>
    <span data-slot="row-subtitle">Off</span>
    <span data-slot="row-suffix">
      <input type="checkbox" role="switch" aria-label="Bluetooth" />
    </span>
  </gnome-action-row>
</gnome-boxed-list>
```

Rounded bordered list grouping row-shaped children (e.g. `gnome-action-row`,
or any element) with merged borders and a single rounded outline. The host
sets `role="list"` (guarded) and gives every direct child `role="listitem"`
(also guarded, and re-applied to children added later — e.g. an htmx
append — via a lightweight `childList` `MutationObserver`, since ARIA
roles can't be expressed in CSS).

Unlike the React version — which inserts an actual `<Separator>` element
between rows — dividers here are a plain CSS `border-top` on every child
but the first, so rows can be added, removed, or reordered with no
separator bookkeeping at all, JS or otherwise.

`variant="separate"` (default `"default"`) renders each child as its own
standalone rounded card instead of a single joined list; like `padding` on
`gnome-card`, it's a plain attribute read directly by CSS.

## Header Bar

```html
<gnome-header-bar>
  <span data-slot="header-start">
    <button type="button" aria-label="Back">←</button>
  </span>
  <span data-slot="header-title">Contacts</span>
  <span data-slot="header-end">
    <button type="button" aria-label="Add contact">+</button>
  </span>
</gnome-header-bar>
```

Title bar with a centered title and leading/trailing action slots.
`data-slot="header-start"`/`"header-title"`/`"header-end"` are placed into
explicit CSS grid columns (`grid-column: 1/2/3`) rather than relying on DOM
order — so the title stays centered even when a consumer omits
`header-start` or `header-end` entirely, with no placeholder elements
generated to hold the grid's shape.

The host gives `header-title` `aria-live="polite"` (guarded, and
re-applied if the title element itself is swapped — e.g. an htmx view
transition — via a lightweight `childList` `MutationObserver`) so
assistive tech announces title changes. `header-title` also carries the
default single-line typography (`font-weight`, ellipsis truncation); for a
custom multi-line title, override `white-space`/`font-weight` inline on
your own title element (see the *Custom title* story).

`flat` removes the bottom border, for the topmost bar of a full-window
layout — a plain attribute read directly by CSS, no JS state to keep in
sync.

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
Tooltip observes swaps of its trigger/content at all times (not just while
visible), so a replaced trigger keeps its hover/focus listeners and
`aria-describedby` relationship.

## Events

| Event | Components | Cancelable | Detail |
|-------|------------|------------|--------|
| `gnome-open-change` | Dialog, Dropdown, Menu, Popover, Toast | No | `{ open }` |
| `gnome-cancel` | Dialog, Menu, Popover | Yes | `{ reason }` |
| `gnome-close` | Dialog, Dropdown, Menu, Popover | No | `{ reason }` |
| `gnome-select` | Menu | Yes | `{ item, value }` |
| `gnome-change` | Dropdown, Radio Group | No | `{ value }` |
| `gnome-action` | Toast | Yes | `{ action }` |
| `gnome-action` | Banner | No — clicking an action never dismisses the banner | `{ action }` |
| `gnome-before-dismiss` | Toast, Banner | Yes | `{ reason }` |
| `gnome-dismiss` | Toast, Banner | No | `{ reason }` |
| `gnome-activate` | Action Row | No | none |

## Accessibility

- Dialogs trap focus while open, support Escape, lock background scrolling,
  label themselves from light-DOM title/description slots, and restore focus.
- Buttons retain native button semantics and form participation; circular
  icon-only controls still require an explicit accessible name.
- Icon buttons require a `label`, which the host syncs onto the control's
  `aria-label` since the control has no visible text of its own.
- Menus expose the WAI-ARIA menu pattern, support directional navigation and
  typeahead, skip disabled items, and restore focus after dismissal.
- Dropdowns expose the WAI-ARIA combobox/listbox pattern; focus stays on the
  trigger the whole time and the active option is announced via
  `aria-activedescendant`, skipping disabled options during navigation.
- Tab bars default to `role="tablist"`; the consumer marks each descendant
  `role="tab"` and manages `aria-selected` — the host only handles
  roving-tabindex and Left/Right/Home/End focus movement, skipping disabled
  tabs.
- View switchers default to `role="radiogroup"`; all four arrow keys cycle
  and, unlike tab bars, moving focus also clicks the target item
  (automatic activation), skipping disabled items.
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
- Spin buttons rely on the native `<input type="number">` for keyboard
  interaction and screen-reader semantics; the step buttons are
  `aria-hidden` and excluded from the tab order.
- Sliders rely entirely on the native `<input type="range">` for keyboard
  interaction, pointer/touch dragging, and screen-reader semantics.
- Spinners default to `role="status"` and an accessible label, and can be
  silenced with `label=""` when a sibling already announces loading state.
- Progress bars default to `role="progressbar"` and expose `aria-valuenow`/
  `aria-valuemin`/`aria-valuemax` in the determinate state; consumers still
  provide `aria-label` or `aria-labelledby`.
- Level bars default to `role="meter"` and expose `aria-valuenow`/
  `aria-valuemin`/`aria-valuemax`; consumers still provide `aria-label` or
  `aria-labelledby`. Discrete-mode blocks are `aria-hidden`.
- Avatars default to `role="img"` with an `aria-label` kept in sync from the
  image's `alt` or `name`; the initials fallback is `aria-hidden`.
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
spin button stepping and bounds-based button disabling, slider keyboard
interaction and fill computation, spinner ARIA state and reduced-motion
animation duration, progress bar determinate/indeterminate ARIA state,
badge variant/dot/anchored styling, avatar image/initials fallback
behavior, and the toast's combined pointer/focus pause behavior. They also
run in the repository CI workflow.

## Releases

The package follows the repository semantic-release workflow. Release commits
use the package scope, for example:

```text
feat(@gnome-ui/web-components): add menu element
fix(@gnome-ui/web-components): restore focus after reconnect
```
