User identity panel for popovers, sidebar footers, and profile pages.

Renders an `Avatar`, a display name, an optional sub-line (e-mail, role…),
and a list of action buttons. A separator is automatically inserted before
any `"destructive"` action.

The component has **no card chrome** — place it inside a `Popover` or wrap
it in `<Card>` depending on context.

```tsx
import { UserCard } from "@gnome-ui/layout";

<UserCard
  name="Ada Lovelace"
  email="ada@gnome.org"
  actions={[
    { label: "View Profile",     onClick: () => {} },
    { label: "Account Settings", onClick: () => {} },
    { label: "Sign Out",         onClick: () => {}, variant: "destructive" },
  ]}
/>
```
