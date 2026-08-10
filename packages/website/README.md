# @gnome-ui/website

Component showcase site for the GNOME UI monorepo — deployed as the root of
GitHub Pages at [eljijuna.github.io/gnome-ui](https://eljijuna.github.io/gnome-ui/).

Private, unpublished (`"private": true`) — this package exists only to be
built and deployed, never installed.

## What it does

- Lists every component in `@gnome-ui/react`, `@gnome-ui/layout`,
  `@gnome-ui/charts`, `@gnome-ui/web-components`, and `@gnome-ui/react-native`
  (~215 at last count), each with a description, a live preview, its source
  code (where one exists), a props table, a copy-paste install command, and
  a link to its Storybook doc page — all **generated from the existing
  `README.md` + `.stories.(ts|tsx)` files (or, for `web-components`/
  `react-native` which have no per-component README, the leading JSDoc
  comment on the component itself)**, not hand-written.
- Each component page shows an **availability matrix** — react /
  web-components / react-native / angular — so it's clear at a glance which
  frameworks ship a component of that name (`angular` is always "coming
  soon": no package implements it yet). See `src/lib/frameworks.ts`.
- Lists every hook in `@gnome-ui/hooks` (description + code, no live demo —
  hooks aren't visual).
- A searchable gallery of all ~672 icons in `@gnome-ui/icons`, rendered with
  the real `<Icon>` component, plus a dedicated section that actually plays
  the 4 `animated` icons via `<AnimatedIcon>`.
- A package overview page for every published package, including the ones
  without per-component pages (`platform`, `core`, `cli`).
- Light/dark/system theme toggle and English/Spanish locale toggle (site
  chrome only — extracted README content stays English this iteration).

## Architecture

```text
scripts/generate-registry.mjs   Build-time content generator (see below)
src/generated/registry.ts       Its output — gitignored, regenerated on every dev/build
src/types/registry.ts           Hand-maintained types the generator's output conforms to
src/i18n/                       Minimal hand-rolled i18n (two JSON dictionaries + a context)
src/theme/                      Wraps GnomeProvider with a persisted light/dark/system toggle
src/live/                       react-live wiring for live component previews
src/shell/AppShell.tsx          Header + sidebar + routing, built from @gnome-ui/layout
src/pages/                      One page per route, data-driven from the generated registry
```

### Content generation

`scripts/generate-registry.mjs` walks `packages/{react,layout,charts}/src/components/*/README.md`
and `.stories.tsx`, the flat `packages/web-components/src/*.ts` (+ matching
`.stories.ts`) files, `packages/react-native/src/components/*/*.tsx`,
`packages/hooks/README.md`'s shared hooks table, and every package's
top-level `README.md`, and writes `src/generated/registry.ts`. The `dev`,
`build`, and `typecheck` npm scripts all run it first (`npm run generate &&`
— plain `pre<script>` hooks only apply to npm's built-in lifecycle script
names, not custom ones like `build`, so this is chained explicitly rather
than relying on that).

README content isn't fully uniform across the monorepo — only about half of
`react`/`layout`/`charts` component READMEs have a ` ```tsx ` example, only
~30% have a `### Props` table, and `web-components`/`react-native` have no
per-component README at all (description comes from the leading JSDoc
comment on the component's own class/export instead) — so every extracted
field is optional and pages render gracefully without it.

The Storybook deep link for each component is computed from its
`.stories.(ts|tsx)` `title` using Storybook's own `toId()` slug algorithm,
verified against a real `storybook build` output rather than guessed from
memory. Falls back to the package's Storybook root (never a broken link)
when a story isn't tagged `autodocs`. The same file's first exported
`Story` name feeds a second, bare-canvas embed URL (see Live previews below)
— also verified against a real build's `index.json`.

Run it standalone to regenerate without a full build:

```bash
node scripts/generate-registry.mjs
```

Its pure parsing functions have unit tests in `generate-registry.test.mjs`.

### Live previews

A component page shows a live preview one of two ways, in order:

1. **`react-live`**, when the component has an extracted code example: the
   snippet (import lines stripped) is evaluated client-side with every
   export of `@gnome-ui/react`, `@gnome-ui/layout`, `@gnome-ui/charts`, and
   `@gnome-ui/icons` in scope (`src/live/scope.ts`). `@gnome-ui/hooks` is
   deliberately excluded — two of its hooks (`useColorScheme`,
   `useBreakpoint`) share a name with an unrelated hook of the same name in
   `@gnome-ui/react`. A snippet that doesn't evaluate cleanly (some READMEs
   weren't written with "must be a self-contained expression" in mind)
   falls back to a friendly message plus the code and a Storybook link,
   rather than crashing the page — see `LiveExample.tsx`'s
   `PreviewBoundary`.
2. **A Storybook embed** (`src/live/StorybookEmbed.tsx`), otherwise — used
   for every `web-components` entry (no README, so no code to run through
   react-live) and for any `react`/`layout`/`charts` component whose README
   has no ` ```tsx ` block. This is a bare-canvas `iframe.html?id=...&viewMode=story`
   embed of the component's own first story — [Storybook's documented embed
   pattern](https://storybook.js.org/docs/sharing/embed) — so it's the real
   component, live, from the package's own deployed Storybook, not a
   synthesized re-implementation.

`react-native` has neither: no README/JSDoc example to run and no
Storybook is built for it (RN components don't render in a browser), so its
pages show description, install command, and the availability matrix only.

### Framework availability matrix

`src/lib/frameworks.ts` groups every `ComponentEntry` by its exact `name`
(e.g. `"Button"`) and records which framework each package belongs to —
`react`, `layout`, and `charts` all count as `react` (different
sub-libraries of the same ecosystem); `web-components` and `react-native`
are their own. `angular` is never a member of any group — no package
implements it — and is always rendered as "coming soon" by
`FrameworkAvailability.tsx`. The matching is by exact name only; a
same-concept component named slightly differently in one framework (rare —
spot-checked at ~93% exact-name overlap between `react` and
`web-components`) won't be linked automatically.

### Styling

`@gnome-ui/core`, `@gnome-ui/react`, `@gnome-ui/layout`, and `@gnome-ui/charts`
each ship their compiled styles as a separate `dist/style.css`, exposed via
a `./styles` subpath export — **not** auto-injected as a side effect of
importing a component. All four are imported once in `src/main.tsx`; if a
future page pulls in a package that isn't imported there yet, its
components will render completely unstyled.

None of those packages ship an app-level reset (they're meant to be dropped
into a host app that already has one) — `src/styles/global.css` is the
site's own reset (`box-sizing`, zeroed `body` margin, a `#root` that fills
the viewport) and is imported last in `main.tsx`.

`SearchBar` is built to sit flush under a `HeaderBar`; used standalone in
page content it has no visible boundary. `src/components/SearchField.tsx`
wraps it (`inline` + a bordered, rounded container with a focus ring) for
the two pages that search inline content (`ComponentIndexPage`,
`IconsGalleryPage`) rather than the header search bar itself.

## Local development

```bash
npm run dev        # regenerates the registry, then starts Vite
npm run build       # regenerates the registry, typechecks, builds to dist/
npm run preview      # serves the production build locally
npm run test          # runs the registry generator's unit tests
```

The dev/build scripts import `@gnome-ui/react`, `@gnome-ui/layout`,
`@gnome-ui/charts`, `@gnome-ui/icons`, and `@gnome-ui/hooks` as real
dependencies — build those packages first (`npm run build` from the repo
root builds everything in the right order via Turborepo).

## Deployment

Built and deployed by `.github/workflows/storybook.yml`'s `build-website`
and `combine-and-deploy` jobs on every push to `main`: this package's
`dist/` becomes the root of GitHub Pages, and `@gnome-ui/react`'s Storybook
(previously at the root) moves to `/react/` alongside the other packages'
Storybooks at `/layout/`, `/charts/`, `/icons/`, `/web-components/`.

Routing is `BrowserRouter` with the standard GitHub Pages SPA fallback
(`public/404.html` redirects back to `index.html`, which restores the
original path). All site routes live under `/components`, `/hooks`,
`/icons`, and `/packages` so they can never collide with those reserved
per-package Storybook subpaths.
