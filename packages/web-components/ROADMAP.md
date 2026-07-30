# Roadmap — @gnome-ui/web-components

Component porting plan from `@gnome-ui/react` to framework-agnostic Custom
Elements. Same design constraints as the five shipped components:

- **Light DOM only** — no Shadow DOM, so htmx and server-rendered fragments
  keep working without `htmx.process()`.
- **Compose native semantics** — wrap a real `<button>`, `<input>`, `<a>`…
  instead of reimplementing behavior on the host element. The host adds
  ARIA relationships, keyboard handling, and state; it does not replace the
  control.
- **`data-slot` contract** — consumers mark light-DOM children with
  `data-slot="…"` so the host can find and wire them up.
- **`gnome-*` custom events** — `gnome-open-change`, `gnome-cancel`,
  `gnome-close`, `gnome-select`, etc. Cancelable where the interaction can be
  vetoed by the consumer.
- **Mutation-observed fragment replacement** — components observe their
  light-DOM subtree while active so htmx/Turbo swaps don't require
  re-registration.
- **Idempotent registration** + SSR-safe (`customElements` guarded) entry
  points, one per component, plus the barrel `@gnome-ui/web-components`.

Legend: ✅ Done · 🚧 In progress · ⬜ Pending

---

## Shipped (Foundation)

| Status | Element | Ported from |
|--------|---------|-------------|
| ✅ | `<gnome-button>` | `Button` |
| ✅ | `<gnome-dialog>` | `Dialog` / `AlertDialog` |
| ✅ | `<gnome-menu>` | `Dropdown` (menu semantics) |
| ✅ | `<gnome-toast>` | `Toast` |
| ✅ | `<gnome-popover>` | `Popover` |
| ✅ | `<gnome-switch>` | `Switch` |
| ✅ | `<gnome-checkbox>` | `Checkbox` |
| ✅ | `<gnome-radio-group>` | `RadioButton` |

---

## Tier 1 — Native Form Controls

> Highest reuse of native semantics (`<input>`), lowest implementation risk.
> Establishes the form-association pattern other rows/inputs will reuse.

| Priority | Status | Element | Ported from | Notes |
|----------|--------|---------|--------------|-------|
| 1 | ✅ | `<gnome-switch>` | `Switch` | Wraps `<input type="checkbox" role="switch">`; native `change`/`input` events bubble through the light-DOM host, no custom event needed |
| 2 | ✅ | `<gnome-checkbox>` | `Checkbox` | Wraps `<input type="checkbox">`; host applies `indeterminate` imperatively since it has no HTML attribute equivalent |
| 3 | ✅ | `<gnome-radio-group>` | `RadioButton` | Native same-name radios already provide exclusivity and arrow-key cycling; host adds shared/auto-generated `name`, group-level `disabled`, and a `value`/`gnome-change` API |
| 4 | ⬜ | `<gnome-text-field>` | `TextField` | Wraps `<input>`/`<textarea>`; label/helper/error slots; delegates `focus()`/`validity` |
| 5 | ⬜ | `<gnome-spin-button>` | `SpinButton` | Wraps `<input type="number">` with +/− step buttons |
| 6 | ⬜ | `<gnome-slider>` | `Slider` | Wraps `<input type="range">`; custom track/fill styling only |

---

## Tier 2 — Feedback & Status (no interaction)

> Presentational, no focus management required — fast to port, good filler
> between larger tiers.

| Priority | Status | Element | Ported from | Notes |
|----------|--------|---------|--------------|-------|
| 7 | ⬜ | `<gnome-spinner>` | `Spinner` | `role="status"`, respects `prefers-reduced-motion` |
| 8 | ⬜ | `<gnome-progress-bar>` | `ProgressBar` | Wraps `<progress>` for determinate; ARIA `role="progressbar"` for indeterminate |
| 9 | ⬜ | `<gnome-badge>` | `Badge` | Pure CSS host, no JS behavior beyond variant/attribute reflection |
| 10 | ⬜ | `<gnome-avatar>` | `Avatar` | `<img>` with initials/icon fallback on load error |
| 11 | ⬜ | `<gnome-skeleton>` | `Skeleton` | Pure CSS placeholder, `aria-hidden` |
| 12 | ⬜ | `<gnome-separator>` | `Separator` | `role="separator"`, horizontal/vertical |

---

## Tier 3 — Dismissible Feedback

| Priority | Status | Element | Ported from | Notes |
|----------|--------|---------|--------------|-------|
| 13 | ⬜ | `<gnome-banner>` | `Banner` | Persistent top-of-view message; `gnome-dismiss` |
| 14 | ⬜ | `<gnome-tooltip>` | `Tooltip` | Reuses `internal/floating.ts` from `gnome-popover`; hover/focus triggered, no focus trap |

---

## Tier 4 — Layout & Containers

> Mostly structural; validates the `data-slot` pattern for compound
> components with multiple named regions (title, subtitle, end-widget).

| Priority | Status | Element | Ported from | Notes |
|----------|--------|---------|--------------|-------|
| 15 | ⬜ | `<gnome-card>` | `Card` | Structural wrapper, minimal JS |
| 16 | ⬜ | `<gnome-action-row>` | `ActionRow` | `data-slot="row-title/subtitle/prefix/suffix"`; activatable variant emits `gnome-activate` |
| 17 | ⬜ | `<gnome-boxed-list>` | `BoxedList` | Groups `gnome-action-row` children with merged borders; `variant="separate"` |
| 18 | ⬜ | `<gnome-header-bar>` | `HeaderBar` | `data-slot="start/title/end"` regions |

---

## Tier 5 — Navigation

| Priority | Status | Element | Ported from | Notes |
|----------|--------|---------|--------------|-------|
| 19 | ⬜ | `<gnome-tab-bar>` | `Tabs` | `role="tablist"`; arrow-key navigation mirrors `gnome-menu`'s typeahead code path |
| 20 | ⬜ | `<gnome-view-switcher>` | `ViewSwitcher` | Segmented control; pairs with `gnome-tab-bar` selection model |
| 21 | ⬜ | `<gnome-search-bar>` | `SearchBar` | Collapsible; reuses `gnome-popover` positioning for autocomplete list |

---

## Tier 6 — Advanced Controls

> Depends on Tier 1 groundwork (form-associated custom elements) and the
> `gnome-menu` selection model.

| Priority | Status | Element | Ported from | Notes |
|----------|--------|---------|--------------|-------|
| 22 | ⬜ | `<gnome-dropdown>` | `Dropdown` | Combines `gnome-menu` internals with a trigger styled as a select |
| 23 | ⬜ | `<gnome-combo-row>` | `ComboRow` | `gnome-action-row` + `gnome-dropdown` composition |
| 24 | ⬜ | `<gnome-switch-row>` | `SwitchRow` | `gnome-action-row` + `gnome-switch` composition |
| 25 | ⬜ | `<gnome-expander-row>` | `ExpanderRow` | Collapsible `gnome-action-row`; `prefers-reduced-motion` handling ported from React version |

---

## Deferred / Not Planned

> Components better served staying React-only for now: heavy composition
> surface, low demand outside a React app shell, or dependent on React
> context (`GnomeProvider` locale/theme) that has no light-DOM equivalent
> yet.

| Component | Reason |
|-----------|--------|
| `NavigationSplitView`, `OverlaySplitView`, `NavigationView` | Full page-shell layout primitives; revisit alongside `@gnome-ui/layout` parity, not before Tier 6 |
| `PreferencesDialog` / `PreferencesPage` / `PreferencesGroup` | Composite of many not-yet-ported rows; wait until Tier 6 lands |
| `Carousel`, `BottomSheet` | Gesture-heavy; needs a pointer/swipe internal helper first |
| `ColumnView` | Large surface area (sorting, virtualization); needs its own design pass |
| `ContributionGraph`, chart components | SVG data-viz, framework-agnostic port has little value over embedding the React version |

---

## Working Agreement

- One component per PR/commit, `feat(@gnome-ui/web-components): add <name> element`.
- Each ships with: `<name>.ts`, `<name>.test.ts` (Vitest/jsdom), `<name>.stories.ts`
  (Storybook), and a Playwright case in `e2e/` for keyboard/focus behavior.
- Update `src/index.ts` barrel, `package.json` `exports` map, and the
  README's component list + events table in the same change.
- Tell me which numbered item to do next; I'll pick up from wherever this
  list points.
