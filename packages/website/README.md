# @gnome-ui/website

Component showcase site for the GNOME UI monorepo — deployed as the root of
GitHub Pages at [eljijuna.github.io/gnome-ui](https://eljijuna.github.io/gnome-ui/).

Private, unpublished (`"private": true`) — this package exists only to be
built and deployed, never installed.

## What it does

- Lists every component in `@gnome-ui/react`, `@gnome-ui/layout`, and
  `@gnome-ui/charts` (~169 at last count), each with a description, a live
  interactive example, its source code, a props table, a copy-paste install
  command, and a link to its Storybook doc page — all **generated from the
  existing `README.md` + `.stories.tsx` files already in those packages**,
  not hand-written.
- Lists every hook in `@gnome-ui/hooks` (description + code, no live demo —
  hooks aren't visual).
- A searchable gallery of all ~672 icons in `@gnome-ui/icons`, rendered with
  the real `<Icon>` component.
- A package overview page for every published package, including the ones
  without per-component pages (`web-components`, `platform`, `core`, `cli`).
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
and `.stories.tsx`, `packages/hooks/README.md`'s shared hooks table, and
every package's top-level `README.md`, and writes `src/generated/registry.ts`.
The `dev`, `build`, and `typecheck` npm scripts all run it first
(`npm run generate &&` — plain `pre<script>` hooks only apply to npm's
built-in lifecycle script names, not custom ones like `build`, so this is
chained explicitly rather than relying on that).

README content isn't fully uniform across the monorepo — only ~1/3 of
component READMEs have a ` ```tsx ` example, only ~30% have a `### Props`
table — so every extracted field is optional and pages render gracefully
without it (no live example → a "see Storybook" link instead; no props
table → the section is simply omitted).

The Storybook deep link for each component is computed from its
`.stories.tsx` `title` using Storybook's own `toId()` slug algorithm,
verified against a real `storybook build` output rather than guessed from
memory. Falls back to the package's Storybook root (never a broken link)
when a story isn't tagged `autodocs`.

Run it standalone to regenerate without a full build:

```bash
node scripts/generate-registry.mjs
```

Its pure parsing functions have unit tests in `generate-registry.test.mjs`.

### Live previews

Live component previews use [`react-live`](https://www.npmjs.com/package/react-live):
each example's code (import lines stripped) is evaluated client-side with
every export of `@gnome-ui/react`, `@gnome-ui/layout`, `@gnome-ui/charts`,
and `@gnome-ui/icons` in scope (`src/live/scope.ts`). `@gnome-ui/hooks` is
deliberately excluded from that scope — it isn't live-rendered, and two of
its hooks (`useColorScheme`, `useBreakpoint`) share a name with an unrelated
hook of the same name in `@gnome-ui/react`.

A snippet that doesn't evaluate cleanly (some READMEs weren't written with
"must be a self-contained expression" in mind) falls back to a friendly
message plus the code and a Storybook link, rather than crashing the page —
see `LiveExample.tsx`'s `PreviewBoundary`.

### Styling

`@gnome-ui/core`, `@gnome-ui/react`, `@gnome-ui/layout`, and `@gnome-ui/charts`
each ship their compiled styles as a separate `dist/style.css`, exposed via
a `./styles` subpath export — **not** auto-injected as a side effect of
importing a component. All four are imported once in `src/main.tsx`; if a
future page pulls in a package that isn't imported there yet, its
components will render completely unstyled.

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
