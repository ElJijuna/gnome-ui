import type { ReactNode } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import { View as RNView } from 'react-native';

import { useGnomeTheme } from '@/GnomeProvider';

export interface ToasterProps extends Omit<ViewProps, 'style'> {
  /**
   * Where to position the toast stack within its container.
   * - `"bottom"` (default) — bottom-center, following the GNOME HIG.
   * - `"top"` — top-center.
   */
  position?: 'bottom' | 'top';
  /** `Toast` elements to display. */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Absolutely-positioned container that stacks `Toast` notifications.
 *
 * RN has no `document.body`/portal target to render into the way the web
 * version's `createPortal(node, container ?? document.body)` does, so
 * there's no `container` prop here — mount `Toaster` yourself as the
 * **last** child of your app's root-level `View` (so it paints on top of
 * everything else) with that root `View` given `position: 'relative'` (or
 * left as the default relative positioning). `Toaster` then positions
 * itself with `position: 'absolute'`, spanning the full width and
 * anchored to `top`/`bottom` by `position`.
 *
 * `pointerEvents="box-none"` is RN's equivalent of the web version's
 * `pointer-events: none` on the container — the empty space around the
 * toast stack doesn't intercept touches, but each `Toast` inside (a
 * `Pressable`) still handles its own.
 *
 * @example
 * ```tsx
 * <View style={{ flex: 1 }}>
 *   <YourAppContent />
 *   <Toaster>
 *     {toasts.map((t) => (
 *       <Toast key={t.id} title={t.message} onDismiss={() => remove(t.id)} />
 *     ))}
 *   </Toaster>
 * </View>
 * ```
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Toast.html
 */
export const Toaster = ({ position = 'bottom', children, style, ...viewProps }: ToasterProps) => {
  const theme = useGnomeTheme();

  return (
    <RNView
      pointerEvents="box-none"
      accessibilityLabel="Notifications"
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          alignItems: 'center',
          gap: theme.space1,
          zIndex: 9999,
        },
        position === 'top' ? { top: theme.space4 } : { bottom: theme.space4 },
        style,
      ]}
      {...viewProps}
    >
      {children}
    </RNView>
  );
};
