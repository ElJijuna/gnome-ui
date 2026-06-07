App detail header with avatar, name, badge, description, stat row, and actions.
Designed for the MyApps `AppDetail` view — use `EntityCard` for list rows.

```tsx
import { ApplicationCard } from "@gnome-ui/layout";

<ApplicationCard
  avatar={<IconBadge color="blue" size="xl">⛅</IconBadge>}
  name="GNOME Weather"
  badge={<StatusBadge variant="success">published</StatusBadge>}
  description="The official weather app for the GNOME desktop."
  stats={[
    { label: "Version", value: "v4.8.1" },
    { label: "Builds",  value: "24" },
  ]}
  actions={<Button variant="suggested">New Release</Button>}
/>
```
