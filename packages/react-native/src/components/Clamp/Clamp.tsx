import type { ReactNode } from 'react';
import { forwardRef } from 'react';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import { View as RNView } from 'react-native';

export interface ClampProps extends Omit<ViewProps, 'style'> {
  /**
   * Maximum content width in density-independent pixels.
   * The container shrinks freely below this value.
   * Defaults to `600` — the Adwaita recommended narrow-content width.
   */
  maximumSize?: number;
  /**
   * Fractional width (`0`–`1`) of the available space to use while that
   * space is narrower than `maximumSize` — useful for keeping a
   * comfortable margin on medium-width screens. Defaults to `1` (always
   * fill the width).
   */
  tighteningThreshold?: number;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Keeps a nonsensical `tighteningThreshold` from collapsing the container. */
const clampFraction = (value: number) => Math.min(Math.max(value, 0), 1);

/**
 * Constrains its children to a maximum width while letting them shrink
 * freely, mirroring the Adwaita `AdwClamp` widget and `@gnome-ui/react`'s
 * own `Clamp`.
 *
 * Use it on settings pages and forms so content never becomes too wide to
 * read comfortably on a tablet or a landscape phone, while still filling
 * the available width on a narrow one.
 *
 * The web version's `margin-inline: auto` centering becomes
 * `alignSelf: 'center'` here rather than `marginHorizontal: 'auto'` —
 * RN auto-margin support was left unverified for this Yoga version when
 * `Drawer` needed the same trick, so this follows `Drawer`'s resolution of
 * using flex alignment instead. The one consequence is that `Clamp`
 * expects a column-direction parent (RN's default): `alignSelf` acts on
 * the cross axis, so inside a `flexDirection: 'row'` parent it would
 * centre vertically instead. Wrap it in a plain `View` there.
 *
 * `tighteningThreshold` is a real percentage width here, unlike in
 * `@gnome-ui/react` where the prop is declared and documented but never
 * reaches the DOM — implementing it exactly as that package documents it
 * (a fraction of the available width, still capped by `maximumSize`)
 * costs nothing on RN and avoids shipping a dead prop.
 *
 * Adds no padding of its own — wrap the content in its own padded
 * container as needed.
 *
 * @example
 * // Settings page — content never wider than 600 dp
 * <Clamp>
 *   <BoxedList>…</BoxedList>
 * </Clamp>
 *
 * @example
 * // Leave a 10% margin while the screen is narrower than 480 dp
 * <Clamp maximumSize={480} tighteningThreshold={0.9}>
 *   <Text>…</Text>
 * </Clamp>
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Clamp.html
 */
export const Clamp = forwardRef<View, ClampProps>(function Clamp(
  { maximumSize = 600, tighteningThreshold = 1, children, style, ...viewProps },
  ref,
) {
  const widthFraction = clampFraction(tighteningThreshold);

  return (
    <RNView
      ref={ref}
      style={[
        {
          width: `${widthFraction * 100}%`,
          maxWidth: maximumSize,
          alignSelf: 'center',
        },
        style,
      ]}
      {...viewProps}
    >
      {children}
    </RNView>
  );
});
