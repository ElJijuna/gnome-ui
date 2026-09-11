import { forwardRef, type ReactNode } from 'react';
import type { PressableProps, StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import { Pressable, View as RNView, StyleSheet } from 'react-native';
import type { TextColor } from '@/components/Text';
import { Text } from '@/components/Text';
import { useGnomeTheme } from '@/GnomeProvider';

export type ButtonRowVariant = 'default' | 'suggested' | 'destructive';

export interface ButtonRowProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Label displayed centered in the row. */
  title: string;
  /** Visual style that colours the title text. */
  variant?: ButtonRowVariant;
  /** Icon placed at the leading edge. Rendered as-is — size/color it yourself. */
  leading?: ReactNode;
  /** Icon placed at the trailing edge. Rendered as-is — size/color it yourself. */
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** `ButtonRowVariant` maps 1:1 onto `Text`'s own `TextColor` union — no separate color table needed. */
const TEXT_COLOR: Record<ButtonRowVariant, TextColor> = {
  default: 'default',
  suggested: 'accent',
  destructive: 'destructive',
};

/**
 * Full-width activatable row styled as a button, for use inside a
 * `BoxedList`. Mirrors `AdwButtonRow` and `@gnome-ui/react`'s own
 * `ButtonRow` — use when an entire list row should trigger a single action
 * with a centered label; prefer `ActionRow` with `interactive` when the row
 * also needs a title/subtitle layout.
 *
 * Rebuilt with `Pressable` rather than ported from the web `<button>` —
 * same pressed-state-overlay recipe `ActionRow`/`Card` already established
 * (`theme.activeOverlay` stands in for the web's `:hover`/`:active`
 * `background-color` transition, since RN has no hover state). The title's
 * color reuses `Text`'s own `TextColor` union (`"accent"`/`"destructive"`
 * already resolve to the exact same `theme.accentColor`/`destructiveColor`
 * tokens the source CSS's `suggested`/`destructive` variants reference) —
 * no separate color-resolution logic needed. Unlike the web version, the
 * variant color does *not* propagate to `leading`/`trailing` — RN's `Icon`
 * has no `currentColor` equivalent and only accepts a fixed named-swatch
 * palette, the same dropped nicety `Chip` already accepted for its own
 * leading/remove icons. The title gets `flex: 1` + `textAlign: 'center'`
 * (the source CSS's own `.title { flex: 1; text-align: center }`) rather
 * than centering the row via `justifyContent` — that keeps the label
 * centered in the row's full width even when only one of `leading`/
 * `trailing` is present, matching the web behavior exactly.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ButtonRow.html
 */
export const ButtonRow = forwardRef<View, ButtonRowProps>(function ButtonRow(
  { title, variant = 'default', leading, trailing, style, disabled, ...pressableProps },
  ref,
) {
  const theme = useGnomeTheme();

  return (
    <Pressable
      ref={ref}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityLabel={title}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.space2,
          paddingVertical: theme.space2,
          paddingHorizontal: theme.space4,
          minHeight: 52,
          width: '100%',
          opacity: disabled ? theme.opacityDisabled : 1,
        },
        style,
      ]}
      {...pressableProps}
    >
      {({ pressed }) => (
        <>
          {leading && <RNView style={{ flexShrink: 0 }}>{leading}</RNView>}

          <Text
            variant="body"
            color={TEXT_COLOR[variant]}
            style={{
              flex: 1,
              textAlign: 'center',
              fontWeight: String(theme.fontWeightSemibold) as TextStyle['fontWeight'],
            }}
          >
            {title}
          </Text>

          {trailing && <RNView style={{ flexShrink: 0 }}>{trailing}</RNView>}

          {pressed && !disabled ? (
            <RNView
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { backgroundColor: theme.activeOverlay }]}
            />
          ) : null}
        </>
      )}
    </Pressable>
  );
});
