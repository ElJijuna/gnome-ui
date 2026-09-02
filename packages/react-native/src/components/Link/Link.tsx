import { forwardRef, type ReactNode } from 'react';
import type { PressableProps, StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import { Linking, Pressable, Text as RNText } from 'react-native';
import { Text } from '@/components/Text';
import { useGnomeTheme } from '@/GnomeProvider';

export interface LinkProps extends Omit<PressableProps, 'children' | 'style'> {
  /**
   * Target URL. Passed to `Linking.openURL` when pressed, unless a custom
   * `onPress` is supplied (e.g. to hand internal links to a router like
   * React Navigation instead of the device browser).
   */
  href: string;
  /**
   * When true the link is treated as external: appends a trailing ↗
   * indicator and an "Opens in browser" accessibility hint. RN has no tab
   * concept, so unlike the web `Link` this doesn't change navigation
   * behaviour — `href` always opens via `Linking.openURL` regardless.
   */
  external?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Style applied to the label `Text`. */
  textStyle?: StyleProp<TextStyle>;
}

/**
 * Inline hyperlink following GNOME HIG.
 *
 * Rebuilt on `Pressable`/themed `Text` rather than ported from
 * `@gnome-ui/react`'s `<a>`: touch devices have no `:hover`, so the
 * underline that the web version reveals on hover instead reveals on
 * press — the closest native equivalent — alongside the same `0.7`
 * press-opacity dip as `@gnome-ui/react`'s `:active` state.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/links.html
 */
export const Link = forwardRef<View, LinkProps>(function Link(
  { href, external = false, children, style, textStyle, onPress, ...pressableProps },
  ref,
) {
  const theme = useGnomeTheme();

  return (
    <Pressable
      ref={ref}
      accessibilityRole="link"
      accessibilityHint={external ? 'Opens in browser' : undefined}
      onPress={onPress ?? (() => Linking.openURL(href))}
      style={style}
      {...pressableProps}
    >
      {({ pressed }) => (
        <Text
          style={[
            {
              color: theme.accentColor,
              textDecorationLine: pressed ? 'underline' : 'none',
              opacity: pressed ? 0.7 : 1,
            },
            textStyle,
          ]}
        >
          {children}
          {external && (
            <RNText
              accessibilityElementsHidden
              importantForAccessibility="no"
              style={{ fontSize: 12 }}
            >
              {' ↗'}
            </RNText>
          )}
        </Text>
      )}
    </Pressable>
  );
});
