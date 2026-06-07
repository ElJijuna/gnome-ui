Horizontal bar split into proportional segments, one per category.

Hover any segment to highlight it and reveal a tooltip with its label and percentage.
Values are automatically normalized if they don't sum to exactly 100.

Typical use case: repository language distribution (similar to GitHub's language bar).

```tsx
<SegmentedBar
  values={[
    { label: "TypeScript", value: 60, color: "#3178c6" },
    { label: "JavaScript", value: 30, color: "#f7df1e" },
    { label: "CSS",        value: 10, color: "#563d7c" },
  ]}
/>
```
