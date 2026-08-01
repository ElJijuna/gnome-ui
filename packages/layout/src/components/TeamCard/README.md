Group identity card: avatar group, team name, and member count.

Distinct from `UserCard`, which represents a single user's identity —
`TeamCard` is for teams, groups, or shared workspaces.

```tsx
import { TeamCard } from "@gnome-ui/layout";
import { Button } from "@gnome-ui/react";

<TeamCard
  name="Design"
  description="Product design and research"
  members={[{ name: "Ada Lovelace" }, { name: "Grace Hopper" }]}
  action={<Button size="sm">View team</Button>}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | — | Team name |
| `description` | `string` | — | Optional secondary line describing the team's purpose |
| `members` | `AvatarGroupItem[]` | — | Members rendered in the `AvatarGroup` |
| `avatarSize` | `AvatarSize` | `"md"` | Avatar size within the group |
| `maxAvatars` | `number` | `5` | Max visible avatars before the overflow chip |
| `action` | `ReactNode` | — | Optional trailing action next to the member count (e.g. a "View team" button) |
| `interactive` | `boolean` | `true` | Delegates hover/active behavior to `Card`. Automatically forced to `false` whenever `action` is set, since `Card`'s interactive mode renders as a `<button>` and nesting a button inside it is invalid HTML |
| `loading` | `boolean` | `false` | Renders a loading placeholder |
| `loadingType` | `"skeleton" \| "spinner"` | `"skeleton"` | Loading placeholder style |
