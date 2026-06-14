Stack of avatars with overflow indicator.

### Guidelines

- Pass `avatars` as an array of `{ name, src, alt, color }` objects.
- Use `max` to cap visible avatars; excess shows a `+N` chip.
- Provide `name` on each item for accessible labels and initials fallback.
- `size` applies uniformly to all avatars and the overflow chip.
