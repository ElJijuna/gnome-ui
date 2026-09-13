import { forwardRef } from 'react';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import { View as RNView } from 'react-native';

export interface SpacerProps extends Omit<ViewProps, 'style'> {
  style?: StyleProp<ViewStyle>;
}

/**
 * Invisible `flex: 1` filler for `Toolbar` and `HeaderBar` — mirrors
 * `@gnome-ui/react`'s `Spacer`. Place between leading and trailing groups
 * to push trailing items to the end.
 *
 * `accessible={false}` mirrors the web version's `aria-hidden="true"` —
 * same "purely decorative, exclude from the accessibility tree entirely"
 * call `Separator` already made, rather than reaching for `role`'s newer
 * `"separator"` value (which exists but implies a divider a screen
 * reader user might care about; a plain flex filler has no such meaning).
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/1-latest/style-classes.html#spacer
 *
 * @example
 * <Toolbar>
 *   <Button variant="flat">Back</Button>
 *   <Spacer />
 *   <Button variant="flat">Done</Button>
 * </Toolbar>
 */
export const Spacer = forwardRef<View, SpacerProps>(function Spacer({ style, ...viewProps }, ref) {
  return (
    <RNView ref={ref} accessible={false} style={[{ flex: 1, minWidth: 0 }, style]} {...viewProps} />
  );
});
