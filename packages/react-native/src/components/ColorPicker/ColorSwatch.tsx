import { forwardRef } from 'react';
import type { PressableProps, StyleProp, View, ViewStyle } from 'react-native';
import { Pressable, View as RNView } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useGnomeTheme, useResolvedColorScheme } from '@/GnomeProvider';

export type ColorSwatchSize = 'sm' | 'md' | 'lg';

/** `.swatch-sm` / `-md` / `-lg`. */
// eslint-disable-next-line react-refresh/only-export-components
export const SWATCH_DIAMETER: Record<ColorSwatchSize, number> = {
  sm: 22,
  md: 30,
  lg: 38,
};

/**
 * Width of the selected state's outer ring. Reserved as padding on every
 * swatch, selected or not, so selecting one never reflows the row — the web
 * gets this for free because `box-shadow` rings don't take up space.
 */
export const RING_WIDTH = 2;

export interface ColorSwatchProps
  extends Omit<PressableProps, 'children' | 'style' | 'onPress' | 'disabled'> {
  /** Color value displayed as the swatch background. */
  color: string;
  /** Whether this swatch is the currently selected color. */
  selected?: boolean;
  /** Swatch diameter. Defaults to `"md"`. */
  size?: ColorSwatchSize;
  /** Called with `color` when the swatch is pressed. */
  onSelect?: (color: string) => void;
  /** Accessible name. Defaults to the color value. */
  accessibilityLabel?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Single circular color swatch. Usable standalone or composed inside
 * `ColorPicker`, and shows a white checkmark when `selected`.
 *
 * The web's three `box-shadow` rings collapse into real box-model pieces,
 * since RN gives a `View` exactly one border: the resting
 * `inset 0 0 0 1px` hairline becomes `borderWidth: 1`, the selected state's
 * `inset 0 0 0 2px rgb(255 255 255 / .9)` becomes a 2 dp white border, and
 * the outer `0 0 0 2px var(--swatch-color)` becomes a wrapper painted in the
 * swatch color. That wrapper is always rendered with the same 2 dp padding
 * and only changes color, because a `box-shadow` ring costs no layout space
 * on the web while a real padded wrapper does — reserving it unconditionally
 * is what keeps the row from reflowing as the selection moves.
 *
 * The checkmark is hand-drawn with `react-native-svg` rather than taken from
 * `@gnome-ui/icons`, mirroring the web version, which also hand-draws it:
 * it's a stroked path, and `Icon`'s palette has no white to give it anyway.
 * `filter: drop-shadow(...)` has no RN counterpart, so the path is drawn
 * twice — a translucent black copy offset 1 dp down, then the white one on
 * top — which is what that filter renders and is why it exists: without it
 * the check disappears on a yellow swatch.
 *
 * `:hover { transform: scale(1.12) }` drops with hover; the selected
 * `scale(1.05)` ports as-is.
 */
export const ColorSwatch = forwardRef<View, ColorSwatchProps>(function ColorSwatch(
  {
    color,
    selected = false,
    size = 'md',
    onSelect,
    accessibilityLabel,
    disabled = false,
    style,
    ...pressableProps
  },
  ref,
) {
  const theme = useGnomeTheme();
  const isDark = useResolvedColorScheme() === 'dark';
  const diameter = SWATCH_DIAMETER[size];
  const hairline = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.15)';
  const checkSize = Math.round(diameter * 0.55);

  return (
    <RNView
      style={[
        {
          padding: RING_WIDTH,
          borderRadius: theme.radiusPill,
          backgroundColor: selected ? color : 'transparent',
          alignSelf: 'flex-start',
          opacity: disabled ? theme.opacityDisabled : 1,
        },
        // Kept as its own entry so an unselected swatch carries no
        // `transform` key at all, rather than one set to `undefined` —
        // RN's transform validator is unforgiving about what reaches it.
        selected ? { transform: [{ scale: 1.05 }] } : null,
        style,
      ]}
    >
      <Pressable
        ref={ref}
        disabled={disabled}
        onPress={() => onSelect?.(color)}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected, disabled }}
        accessibilityLabel={accessibilityLabel ?? color}
        style={{
          width: diameter,
          height: diameter,
          borderRadius: theme.radiusPill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? 'rgba(255, 255, 255, 0.9)' : hairline,
        }}
        {...pressableProps}
      >
        {selected ? (
          <Svg width={checkSize} height={checkSize} viewBox="0 0 16 16">
            <Path
              d="M3 8l3.5 3.5L13 5"
              stroke="rgba(0, 0, 0, 0.35)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              translateY={1}
            />
            <Path
              d="M3 8l3.5 3.5L13 5"
              stroke="white"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        ) : null}
      </Pressable>
    </RNView>
  );
});
