# Contributing

## Getting started

```bash
git clone https://github.com/ElJijuna/gnome-ui.git
cd gnome-react
npm install
```

## Development workflow

```bash
npm run storybook     # Storybook at localhost:6006
npm run build         # Build all packages
npm run typecheck     # TypeScript check
npm run lint          # ESLint
```

## Commit conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Every commit message must follow this format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description | Release |
|------|-------------|---------|
| `feat` | New component or feature | minor |
| `fix` | Bug fix | patch |
| `perf` | Performance improvement | patch |
| `refactor` | Code change with no behavior change | patch |
| `docs` | Documentation only | none |
| `chore` | Build, deps, config | none |
| `test` | Tests only | none |
| `style` | Formatting, whitespace | none |

### Scopes

| Scope | Package |
|-------|---------|
| `core` | `@gnome-ui/core` |
| `react` | `@gnome-ui/react` |
| `button` | Button component |
| `tokens` | Design tokens |
| `storybook` | Storybook config |
| `ci` | GitHub Actions |

### Examples

```bash
feat(react): add Switch component
fix(button): fix focus ring on Firefox
perf(core): reduce tokens.css bundle size
docs(react): add Avatar usage examples
chore(ci): update Node.js to v22
refactor(button): simplify class name logic
```

### Breaking changes

Add `!` after the type or include `BREAKING CHANGE:` in the footer:

```bash
feat(core)!: rename --gnome-accent to --gnome-accent-color

# or

feat(core): rename token prefix

BREAKING CHANGE: all tokens renamed from --gnome-* to --adw-*
```

Breaking changes trigger a **major** version bump.

## Adding a new component

1. Create the component directory:
   ```
   packages/react/src/components/ComponentName/
   ├── ComponentName.tsx
   ├── ComponentName.module.css
   ├── ComponentName.stories.tsx
   └── index.ts
   ```

2. Export it from `packages/react/src/index.ts`.

3. Follow the patterns in [GNOME_GUIDELINES.md](GNOME_GUIDELINES.md).

4. Mark it as `✅` in [ROADMAP.md](ROADMAP.md).

5. Every component needs:
   - All styles using CSS custom properties from `@gnome-ui/core`
   - A Storybook story with `autodocs` tag
   - Dark mode support via `@media (prefers-color-scheme: dark)`
   - Keyboard navigation and `aria-*` attributes where needed

## Pull requests

- Keep PRs focused on one component or fix.
- Include a story update if the change affects the UI.
- Use the PR template — describe what changed and why.
- PRs merge into `main`. Releases are automated via semantic-release.
