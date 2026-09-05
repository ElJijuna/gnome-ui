import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { Text } from '@/components/Text';
import { useGnomeTheme } from '@/GnomeProvider';

export interface DividerProps {
  /** Optional centered label (e.g. `"OR"`, `"Continue with"`). */
  children?: ReactNode;
  /** Accessible name. Defaults to `children` when it's a string. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Horizontal rule with an optional centered label — common auth/login-form
 * pattern ("Sign in" / **OR** / "Continue with Google"). Mirrors
 * `@gnome-ui/react`'s `Divider`.
 *
 * For a bare dividing line with no label, use `Separator` instead — it also
 * supports a vertical orientation, which `Divider` does not.
 *
 * `role="separator"` ports 1:1 from RN's newer web-aligned `Role` union
 * (the same one `Avatar`/`Badge`/`LevelBar` already reach for), unlike
 * `Separator`'s own choice to render as `accessible={false}` — that
 * component is purely decorative with nothing for a screen reader to
 * announce, while a labelled `Divider` ("OR") is exactly the kind of
 * content a screen reader user needs read aloud, so it stays in the
 * accessibility tree instead. The label reuses `Text`'s `variant="caption"
 * color="dim"` verbatim rather than hand-rolled styles, since that
 * combination already resolves to the same font-size/weight/dim-opacity
 * the web version's `.label` class hard-codes.
 *
 * The web version's `aria-orientation="horizontal"` has no port — `Divider`
 * has no `orientation` prop at all (unlike `Separator`), so there is only
 * ever one orientation to announce.
 *
 * @see https://developer.gnome.org/hig/patterns/containers.html
 */
export const Divider = ({ children, accessibilityLabel, style, testID }: DividerProps) => {
  const theme = useGnomeTheme();
  const hasLabel = Boolean(children);

  return (
    <View
      testID={testID}
      accessible
      role="separator"
      accessibilityLabel={
        accessibilityLabel ?? (typeof children === 'string' ? children : undefined)
      }
      style={[
        { flexDirection: 'row', alignItems: 'center', width: '100%', gap: theme.space2 },
        style,
      ]}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: theme.cardShadeColor }} />
      {hasLabel && (
        <>
          {typeof children === 'string' ? (
            <Text variant="caption" color="dim">
              {children}
            </Text>
          ) : (
            children
          )}
          <View style={{ flex: 1, height: 1, backgroundColor: theme.cardShadeColor }} />
        </>
      )}
    </View>
  );
};
