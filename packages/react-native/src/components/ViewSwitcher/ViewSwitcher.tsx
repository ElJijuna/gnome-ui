import { forwardRef, type ReactNode } from 'react';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import { View as RNView, StyleSheet } from 'react-native';

import { useGnomeTheme, useResolvedColorScheme } from '@/GnomeProvider';

export interface ViewSwitcherProps extends Omit<ViewProps, 'style'> {
  children?: ReactNode;
  /** Accessible label for the group. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Segmented control for switching between major views.
 *
 * Mirrors the Adwaita `AdwViewSwitcher` pattern. Place as a `HeaderBar`'s
 * `title` for the canonical GNOME layout. Compose with `ViewSwitcherItem`
 * for each option.
 *
 * The web version's pill background is `color-mix(in srgb,
 * var(--gnome-headerbar-bg-color) 75%, black 25%)` (70/30 in dark mode) —
 * RN has no `color-mix()`, but alpha-compositing a flat semi-transparent
 * black `View` over an opaque background produces the exact same math
 * (`background × (1 − alpha) + black × alpha`), so that's what's layered
 * here instead, matching `Card`'s established color-mix-avoidance pattern.
 * `useResolvedColorScheme()` picks the 25%/30% split to match the web
 * value exactly rather than reusing a nearby overlay token.
 *
 * Roving-tabindex ← → / Home / End keyboard navigation isn't ported —
 * same reasoning as `TabBar`: no per-app arrow-key convention exists in
 * RN's touch-first focus model to port it to.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ViewSwitcher.html
 * @see https://developer.gnome.org/hig/patterns/nav/view-switchers.html
 */
export const ViewSwitcher = forwardRef<View, ViewSwitcherProps>(function ViewSwitcher(
  { children, accessibilityLabel = 'View switcher', style, ...viewProps },
  ref,
) {
  const theme = useGnomeTheme();
  const scheme = useResolvedColorScheme();

  return (
    <RNView
      ref={ref}
      accessible
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          alignSelf: 'flex-start',
          borderRadius: theme.radiusPill,
          overflow: 'hidden',
          backgroundColor: theme.headerbarBgColor,
        },
        style,
      ]}
      {...viewProps}
    >
      <RNView
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: scheme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.25)' },
        ]}
      />
      <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 2, padding: 3 }}>
        {children}
      </RNView>
    </RNView>
  );
});
