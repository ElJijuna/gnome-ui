# @gnome-ui/cli

<p align="center">
  <img src="https://raw.githubusercontent.com/ElJijuna/gnome-ui/main/public/assets/gnome-ui.png" alt="gnome-ui" width="120" />
</p>

Command-line tools for keeping GNOME UI packages up to date in consuming projects.

[![npm](https://img.shields.io/npm/v/@gnome-ui/cli)](https://www.npmjs.com/package/@gnome-ui/cli)
[![npm downloads](https://img.shields.io/npm/dm/@gnome-ui/cli)](https://www.npmjs.com/package/@gnome-ui/cli)
[![CI](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

## Installation

Install globally when you want the commands available from any project:

```bash
npm install -g @gnome-ui/cli
```

Or install it in a consuming project:

```bash
npm install --save-dev @gnome-ui/cli
```

Then run it through your package manager:

```bash
npx gnomeui verify
```

## Commands

Both binary names point to the same CLI:

```bash
gnomeui
gnomeui status
gui status

gnomeui verify
gui verify

gnomeui update
gui update
```

| Command | Description |
|---------|-------------|
| `gnomeui` / `gnomeui status` | Read-only: shows the comparison table and exits. No confirmation, no update. This is what runs when no command is given |
| `gnomeui verify` | Reads the current project's `package.json`, compares installed `@gnome-ui/*` packages with npm `latest`, and asks whether to update outdated packages before letting you pick which ones |
| `gui verify` | Short alias for `gnomeui verify` |
| `gnomeui update` | Same comparison, but skips the confirmation — goes straight to picking which outdated packages to update |
| `gui update` | Short alias for `gnomeui update` |

All three commands share the same fetch-and-render-table step, and `verify`/
`update` additionally share the confirm → select → apply pipeline — the only
difference between them is whether a Yes/No confirmation runs before the
selection step. See [`src/cli.ts`](src/cli.ts).

## Interactive flow

All three commands open a terminal UI, built with
[`blessed-components`](https://www.npmjs.com/package/blessed-components):

1. A spinner shows while the latest version of each `@gnome-ui/*` package is
   fetched from npm.
2. A table compares every installed package against its npm `latest`.
3. If there are no `@gnome-ui/*` dependencies, an alert says so and the CLI
   exits — same for `status`, `verify`, and `update`.
4. `status` stops here: press any key to close the table and exit.
5. `verify`/`update` continue: if everything is already up to date, an alert
   says so and the CLI exits. Otherwise:
   - `verify` first asks **Yes/No**: update outdated packages now?
   - `update` skips that question.
6. If proceeding, a checklist lets you pick which outdated packages to
   update — **all of them are selected by default**.
7. The terminal UI closes, `package.json` is rewritten with the updated
   ranges (preserving `^`/`~` prefixes), and your package manager's install
   command runs with normal terminal output so you can watch it.
8. A plain-text summary is printed.

### Checklist keys

| Key | Action |
|-----|--------|
| `↑` / `↓` | Move the cursor |
| `Space` / `Enter` | Toggle the highlighted package |
| `a` | Select all |
| `n` | Select none |
| `y` | Confirm the selection and continue |
| `q` / `Escape` / `Ctrl+C` | Cancel — no changes are made |

### Non-interactive environments

When stdin/stdout isn't a TTY (CI, piped output, `NODE_ENV` scripts), the CLI
skips the terminal UI entirely and prints a plain comparison table instead:

- `gnomeui status` (or no command) just prints the table and a summary.
- `gnomeui verify` reports outdated packages but does not update them — there's
  no terminal to ask a question in.
- `gnomeui update` updates every outdated package automatically, same as the
  interactive flow's "select all" default.

## `blessed-components` usage

| Component | Where | Why |
|-----------|-------|-----|
| `renderTable` (pure) | [`ui/comparison-table.ts`](src/ui/comparison-table.ts) | Read-only comparison — no interactivity needed, so the pure renderer is enough |
| `renderStatus` (pure) | [`ui/comparison-table.ts`](src/ui/comparison-table.ts) | Latest/Outdated/Unknown marker embedded in the table's Status column |
| `spinner` | [`ui/spinner.ts`](src/ui/spinner.ts) | Shown while the npm registry calls resolve |
| `confirmDialog` | [`ui/confirm.ts`](src/ui/confirm.ts) | The Yes/No decision `verify` asks before updating |
| `multiSelect` | [`ui/select-dependencies.ts`](src/ui/select-dependencies.ts) | The "which packages to update" checklist, defaulting to all selected |
| `alert` | [`ui/alert.ts`](src/ui/alert.ts) | "No dependencies found" / "already up to date" messages |
| `createTheme` | [`ui/theme.ts`](src/ui/theme.ts) | Shared theme applied across the widgets above that accept one |

Every other command-line output (non-interactive mode, the final summary) is
plain `console.log`/`console.table` — `blessed-components` widgets only exist
while the interactive screen is open.

## Package Manager Detection

The CLI detects the package manager from lockfiles in the project root:

| Lockfile | Command |
|----------|---------|
| `pnpm-lock.yaml` | `pnpm install` |
| `yarn.lock` | `yarn install` |
| `bun.lock` or `bun.lockb` | `bun install` |
| none of the above | `npm install` |

## Version Resolution

Current versions are read from `package-lock.json` when available. If no npm
lockfile is present (pnpm/yarn/bun projects), the CLI falls back to the
version range declared in `package.json` — the resolved installed version
isn't visible without parsing each package manager's own lockfile format,
which isn't implemented yet.

Latest versions are resolved through
[`npmjs-api-client`](https://www.npmjs.com/package/npmjs-api-client), a typed
client for the npm Registry API.

## Requirements

`@gnome-ui/cli` is published as an ESM package and uses `commander` for
command parsing and `blessed`/`blessed-components` for its terminal UI.

Because `commander@14` requires Node.js 20 or newer, use:

```bash
node --version
```

and make sure the result is `v20.0.0` or newer.

## License

[MIT](../../LICENSE)
