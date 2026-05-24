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
gnomeui verify
gui verify

gnomeui update
gui update
```

| Command | Description |
|---------|-------------|
| `gnomeui verify` | Reads the current project's `package.json`, compares installed `@gnome-ui/*` packages with npm `latest`, and asks whether to update outdated packages |
| `gui verify` | Short alias for `gnomeui verify` |
| `gnomeui update` | Updates outdated `@gnome-ui/*` dependencies to npm `latest` automatically, runs the detected package manager install command, and prints a summary |
| `gui update` | Short alias for `gnomeui update` |

## Verify

Run `verify` from a consuming project:

```bash
gnomeui verify
```

The CLI scans these sections in the nearest `package.json`:

| Section |
|---------|
| `dependencies` |
| `devDependencies` |
| `optionalDependencies` |
| `peerDependencies` |

It only checks dependencies whose names start with `@gnome-ui/`.

Example output:

```text
GNOME UI dependencies
/path/to/my-app/package.json
┌─────────┬───────────────────┬───────────────────┬──────────┬──────────┬────────────┐
│ (index) │ Paquete           │ Seccion           │ Actual   │ Latest   │ Estado     │
├─────────┼───────────────────┼───────────────────┼──────────┼──────────┼────────────┤
│ 0       │ '@gnome-ui/core'  │ 'dependencies'    │ '1.42.3' │ '1.42.3' │ '🔥 ultima' │
│ 1       │ '@gnome-ui/react' │ 'dependencies'    │ '1.40.1' │ '1.44.0' │ 'actualizar'│
└─────────┴───────────────────┴───────────────────┴──────────┴──────────┴────────────┘

Actualizar ahora? SI o NO
```

If every GNOME UI package is already on the latest published version, the status column shows `🔥 ultima`.

## Update

Run `update` to skip the prompt and update outdated GNOME UI packages immediately:

```bash
gnomeui update
```

The CLI updates the dependency ranges in `package.json`, preserving the current range prefix when possible:

| Current range | Updated range example |
|---------------|-----------------------|
| `^1.40.1` | `^1.44.0` |
| `~1.40.1` | `~1.44.0` |
| `1.40.1` | `1.44.0` |

After editing `package.json`, it runs the package manager install command for the current project.

## Package Manager Detection

The CLI detects the package manager from lockfiles in the project root:

| Lockfile | Command |
|----------|---------|
| `pnpm-lock.yaml` | `pnpm install` |
| `yarn.lock` | `yarn install` |
| `bun.lock` or `bun.lockb` | `bun install` |
| none of the above | `npm install` |

## Version Resolution

Current versions are read from `package-lock.json` when available. If no npm lockfile is present, the CLI falls back to the version range declared in `package.json`.

Latest versions are resolved through [`npmjs-api-client`](https://www.npmjs.com/package/npmjs-api-client), a typed client for the npm Registry API.

## Summary

Every command ends with a summary:

```text
Summary
Total @gnome-ui: 2
Al dia: 1
Actualizadas: 1
Pendientes: 0
```

## Requirements

`@gnome-ui/cli` is published as an ESM package and uses `commander` for command parsing.

Because `commander@14` requires Node.js 20 or newer, use:

```bash
node --version
```

and make sure the result is `v20.0.0` or newer.

## License

[MIT](../../LICENSE)
