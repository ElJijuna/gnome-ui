Bottom navigation bar for `ViewSwitcher` items on narrow screens (≤ 550 px), mirroring `AdwViewSwitcherBar`.

Use in tandem with a header-bar `ViewSwitcher`:
- **Wide (> 550 px):** show `ViewSwitcher` in the `HeaderBar`, hide the bar (`reveal={false}`).
- **Narrow (≤ 550 px):** hide the header switcher, set `reveal={true}`.

Pair with `useBreakpoint().isMedium` to automate the switch.
