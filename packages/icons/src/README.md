`@gnome-ui/icons` exports framework-agnostic icon definitions. The main gallery separates Adwaita-style symbolic icons from GitHub Octicons and third-party brand/fullcolor previews.

Each icon is an `IconDefinition` object (a set of SVG paths + viewBox). Pass it to `<Icon>` from `@gnome-ui/react`, or render it directly with any SVG renderer.

```tsx
import { Search, Settings } from '@gnome-ui/icons';
import { Icon } from '@gnome-ui/react';

<Icon icon={Search} size="md" />
<Icon icon={Settings} size="lg" aria-label="Settings" />
```

### Icon families

| Family | Import path | Count |
|--------|-------------|-------|
| Adwaita Symbolic | `@gnome-ui/icons` | 600+ |
| GitHub Octicons (version control) | `@gnome-ui/icons` | 20 |
| Third-party brand marks | `@gnome-ui/icons` | 5 (GitHub, GitLab, Bitbucket, X, npm) |

### Third-party brand icons

Brand marks follow the same `IconDefinition` shape and can be used with `<Icon>`. They are single-color glyphs — pass a `color` prop or style them with CSS.

```tsx
import { GitHub, GitLab, Npm } from '@gnome-ui/icons';
import { Icon } from '@gnome-ui/react';

<Icon icon={GitHub} size="md" color="#24292f" />
```

### Guidelines

- Import only the icons you use — the package is tree-shakeable.
- Use `aria-label` on `<Icon>` when the icon conveys meaning not available from surrounding context.
- Pass `aria-hidden` when the icon is decorative and a sibling text label is present.
