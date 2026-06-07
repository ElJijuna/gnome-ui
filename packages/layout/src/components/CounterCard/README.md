Metric card with an animated numeric counter.

Wraps `Card` from `@gnome-ui/react` and counts up to `value` using an
ease-out cubic curve on mount and whenever `value` changes.
Respects `prefers-reduced-motion`.

```tsx
import { CounterCard } from "@gnome-ui/layout";

<CounterCard label="Documents" value={1248} suffix=" files" />
<CounterCard label="Revenue"   value={9420} prefix="$" accent duration={1500} />
```
