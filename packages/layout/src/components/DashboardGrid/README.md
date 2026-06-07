Responsive 12-column grid container for dashboard widgets and panels.

## Breakpoints

| Breakpoint | Min-width |
|---|---|
| xs | — (base) |
| sm | 576px |
| md | 768px |
| lg | 992px |
| xl | 1200px |
| xxl | 1600px |

## Usage

```tsx
import { DashboardGrid } from "@gnome-ui/layout";

// Static layout
<DashboardGrid columns={12} gap="md">
  <DashboardGrid.Item span={6} offset={3}>
    <Card />
  </DashboardGrid.Item>
</DashboardGrid>

// Responsive layout
<DashboardGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap={{ xs: "sm", md: "md" }}>
  <DashboardGrid.Item span={{ xs: 12, sm: 6, md: 4 }}>
    <StatCard />
  </DashboardGrid.Item>
</DashboardGrid>
```
