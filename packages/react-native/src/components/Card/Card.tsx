import { forwardRef, type ReactNode } from 'react';
import type { PressableProps, StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import { Pressable, View as RNView, StyleSheet } from 'react-native';

import { useGnomeTheme } from '@/GnomeProvider';
import type { GnomeThemeTokens } from '@/theme';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends Omit<PressableProps, 'style' | 'children'> {
  /**
   * When true the card becomes pressable (Adwaita `.activatable`).
   * Renders as `Pressable` with `accessibilityRole="button"`; a plain
   * `View` otherwise. `onPress`/`onLongPress`/etc. only take effect when
   * `interactive` is true — RN's `View` has no touch handling of its own,
   * unlike a DOM `<div>`'s `onClick`.
   */
  interactive?: boolean;
  /** Internal spacing. Defaults to `"md"`. */
  padding?: CardPadding;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

function getPadding(theme: GnomeThemeTokens, padding: CardPadding): number {
  switch (padding) {
    case 'none':
      return 0;
    case 'sm':
      return theme.space2;
    case 'lg':
      return theme.space5;
    default:
      return theme.space4;
  }
}

/**
 * Card component following the GNOME HIG and Adwaita `.card` style class.
 *
 * Use for grouping related content on an elevated surface. Set
 * `interactive` for clickable cards (e.g. grid item, settings shortcut).
 *
 * Rebuilt with `Pressable`/`View` rather than ported from `@gnome-ui/react`'s
 * DOM-based `<button>`/`<div>` + `as` prop — RN has no polymorphic-element
 * equivalent, so `as` is dropped. The web version's `:hover`/`:active`
 * `color-mix()` darken/lighten is reproduced with an absolutely-positioned
 * overlay `View` tinted by `theme.activeOverlay` while pressed, since RN
 * has no `color-mix()` to blend two flat colors directly.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/style-classes.html
 * @see https://developer.gnome.org/hig/patterns/containers.html
 */
export const Card = forwardRef<View, CardProps>(function Card(
  { interactive = false, padding = 'md', style, children, disabled, ...pressableProps },
  ref,
) {
  const theme = useGnomeTheme();

  const baseStyle: ViewStyle = {
    backgroundColor: theme.cardBgColor,
    borderWidth: 1,
    borderColor: theme.cardShadeColor,
    borderRadius: theme.radiusLg,
    overflow: 'hidden',
    padding: getPadding(theme, padding),
  };

  if (!interactive) {
    return (
      <RNView ref={ref} style={[baseStyle, style]} {...(pressableProps as ViewProps)}>
        {children}
      </RNView>
    );
  }

  return (
    <Pressable
      ref={ref}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={[
        baseStyle,
        { position: 'relative', opacity: disabled ? theme.opacityDisabled : 1 },
        style,
      ]}
      {...pressableProps}
    >
      {({ pressed }) => (
        <>
          {children}
          {pressed && !disabled ? (
            <RNView
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: theme.activeOverlay, borderRadius: theme.radiusLg },
              ]}
            />
          ) : null}
        </>
      )}
    </Pressable>
  );
});
