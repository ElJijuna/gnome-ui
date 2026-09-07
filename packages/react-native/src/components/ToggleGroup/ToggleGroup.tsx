import { createContext, forwardRef, type ReactNode, useContext, useMemo } from 'react';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import { View as RNView } from 'react-native';

import { useGnomeTheme, useResolvedColorScheme } from '@/GnomeProvider';

// ─── Context ──────────────────────────────────────────────────────────────────

interface ToggleGroupContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

/** Internal — `ToggleGroupItem` reads the selected value and setter from here. */
// eslint-disable-next-line react-refresh/only-export-components
export function useToggleGroup() {
  const ctx = useContext(ToggleGroupContext);

  if (!ctx) {
    throw new Error('ToggleGroupItem must be used inside ToggleGroup');
  }

  return ctx;
}

// ─── ToggleGroup ──────────────────────────────────────────────────────────────

export interface ToggleGroupProps extends Omit<ViewProps, 'style'> {
  /** Name of the currently active toggle. */
  value: string;
  /** Called with the new value when a toggle is selected. */
  onValueChange: (value: string) => void;
  /** Accessible label for the group. */
  accessibilityLabel?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Mutually-exclusive group of toggle buttons for in-place option selection.
 * Mirrors `AdwToggleGroup` (libadwaita 1.7 / GNOME 48) and
 * `@gnome-ui/react`'s own `ToggleGroup`.
 *
 * Use for formatting controls, view-mode selectors, and toolbar options —
 * wherever a `ViewSwitcher` would be too heavy or doesn't belong in a
 * `HeaderBar`. Compose with `ToggleGroupItem`.
 *
 * The context and its `value`/`onValueChange` shape port 1:1 — pure React,
 * no DOM involved. What doesn't port is the keyboard layer: the web version
 * owns an `onKeyDown` handler implementing ← / → cycling and Home / End
 * jumps over a roving `tabIndex`, none of which has a touch counterpart.
 * That's this package's standing convention, already set by `ViewSwitcher`
 * and `TabBar`; the `radiogroup`/`radio` + `checked` accessibility pairing
 * that VoiceOver and TalkBack actually announce is what carries the
 * semantics here instead.
 *
 * The group carries `accessibilityRole="radiogroup"` but deliberately
 * **not** `accessible` — on iOS, `accessible` on a container collapses the
 * whole subtree into one accessibility element, which would make the
 * individual toggles unreachable for VoiceOver and defeat the point of the
 * role. Without it the role still groups on Android while every item stays
 * individually focusable. (`ViewSwitcher`, built earlier, does set
 * `accessible` alongside the same role — see this package's ROADMAP note;
 * worth revisiting there.) The visible trade-off is that the group won't
 * match a `getByRole('radiogroup')` query, since Testing Library only
 * matches roles on accessible elements — the items are what matter to a
 * screen reader, and they each match `getByRole('radio')`.
 *
 * `display: inline-flex` becomes `alignSelf: 'flex-start'` (the same
 * hug-your-content trick `ViewSwitcher` uses), and `box-shadow:
 * var(--gnome-shadow-sm)` is dropped rather than approximated — the theme
 * generator deliberately keeps the shadow tokens in `raw` only, and `Card`
 * already established that a border carries the same separation on RN.
 * The dark-mode border color is hardcoded per scheme (`rgba(255,255,255,
 * 0.12)`) exactly as the source CSS hardcodes it, rather than read from
 * `theme.light3`, which stays `#deddda` in every theme.
 *
 * @example
 * const [align, setAlign] = useState('left');
 *
 * <ToggleGroup value={align} onValueChange={setAlign} accessibilityLabel="Alignment">
 *   <ToggleGroupItem name="left" icon={FormatJustifyLeft} accessibilityLabel="Left" />
 *   <ToggleGroupItem name="center" icon={FormatJustifyCenter} accessibilityLabel="Center" />
 *   <ToggleGroupItem name="right" icon={FormatJustifyRight} accessibilityLabel="Right" />
 * </ToggleGroup>
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ToggleGroup.html
 */
export const ToggleGroup = forwardRef<View, ToggleGroupProps>(function ToggleGroup(
  { value, onValueChange, accessibilityLabel = 'Options', children, style, ...viewProps },
  ref,
) {
  const theme = useGnomeTheme();
  const scheme = useResolvedColorScheme();
  const context = useMemo(() => ({ value, onValueChange }), [value, onValueChange]);

  return (
    <ToggleGroupContext.Provider value={context}>
      <RNView
        ref={ref}
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel}
        style={[
          {
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'stretch',
            gap: 2,
            padding: 2,
            borderRadius: theme.radiusMd,
            borderWidth: 1,
            borderColor: scheme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : theme.light3,
            backgroundColor: theme.cardBgColor,
          },
          style,
        ]}
        {...viewProps}
      >
        {children}
      </RNView>
    </ToggleGroupContext.Provider>
  );
});
