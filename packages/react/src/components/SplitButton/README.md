Primary action button with an attached dropdown arrow.

Clicking the **label** half fires `onClick`. Clicking the **arrow** half opens a floating panel
with `dropdownContent` (menus, options, etc.).

Mirrors `AdwSplitButton` — supports `default`, `suggested`, and `destructive` variants.

### Guidelines
- Put the most common action in the primary half with a clear imperative label.
- Use `dropdownContent` for secondary variants of the same action (e.g. "Save as Template").
- Prefer `suggested` when this is the primary CTA in a dialog or toolbar.
- Never use `destructive` unless the primary action is irreversible.
