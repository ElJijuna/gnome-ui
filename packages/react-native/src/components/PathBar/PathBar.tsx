import type { ReactNode } from 'react';
import { Fragment } from 'react';
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native';
import { Pressable, Text as RNText, View as RNView } from 'react-native';

import { useGnomeTheme } from '@/GnomeProvider';

export interface PathBarSegment {
  /** Display label for this path segment. */
  label: string;
  /** Opaque path value passed to `onNavigate` when the segment is pressed. */
  path: string;
  /** Optional icon placed before the label (e.g. a folder icon). Rendered as-is. */
  icon?: ReactNode;
}

export interface PathBarProps extends Omit<ViewProps, 'style'> {
  /**
   * Ordered path segments from root to current location. The last segment
   * is the current folder and is rendered non-interactive.
   */
  segments: PathBarSegment[];
  /**
   * Called when the user presses a non-current segment. Receives the
   * `path` and zero-based `index` of the pressed segment.
   */
  onNavigate?: (path: string, index: number) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Breadcrumb path bar for navigating a hierarchical location.
 *
 * Mirrors the location bar in GNOME Files (Nautilus). Segments are
 * separated by chevron dividers. All segments except the last are
 * interactive — pressing them calls `onNavigate`. The last segment
 * represents the current location and renders as a static, bold label.
 *
 * Rebuilt with `Pressable`/`View`/`Text` rather than ported from
 * `@gnome-ui/react`'s `<nav><ol><li>`: RN's `AccessibilityRole` union has
 * neither a "navigation" landmark nor a breadcrumb-list role (the same gap
 * that dropped `Sidebar`'s `<nav>` role), so those are dropped rather than
 * faked — each interactive segment still gets its own
 * `accessibilityRole="button"` and `accessibilityLabel`. The separator
 * chevron is a Unicode `›` glyph instead of the web version's inline SVG
 * path, matching this package's established no-SVG-dependency convention.
 *
 * @see https://developer.gnome.org/hig/patterns/nav/search.html
 */
export const PathBar = ({ segments, onNavigate, style, ...viewProps }: PathBarProps) => {
  const theme = useGnomeTheme();

  return (
    <RNView
      style={[{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }, style]}
      {...viewProps}
    >
      {segments.map((segment, index) => {
        const isCurrent = index === segments.length - 1;

        return (
          <Fragment key={segment.path}>
            {index > 0 && (
              <RNText
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={{
                  color: theme.windowFgColor,
                  opacity: 0.5,
                  marginHorizontal: 1,
                  fontSize: theme.fontSizeBody,
                }}
              >
                {'›'}
              </RNText>
            )}

            {isCurrent ? (
              <RNView
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingVertical: 2,
                  paddingHorizontal: theme.space1,
                  maxWidth: 200,
                }}
              >
                {segment.icon && <RNView style={{ flexShrink: 0 }}>{segment.icon}</RNView>}
                <RNText
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    fontFamily: theme.fontFamily,
                    fontSize: theme.fontSizeBody,
                    fontWeight: String(theme.fontWeightSemibold) as TextStyle['fontWeight'],
                    color: theme.windowFgColor,
                  }}
                >
                  {segment.label}
                </RNText>
              </RNView>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={segment.label}
                onPress={() => onNavigate?.(segment.path, index)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingVertical: 2,
                  paddingHorizontal: theme.space1,
                  maxWidth: 160,
                  borderRadius: theme.radiusSm,
                  backgroundColor: pressed ? theme.activeOverlay : 'transparent',
                })}
              >
                {segment.icon && <RNView style={{ flexShrink: 0 }}>{segment.icon}</RNView>}
                <RNText
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    fontFamily: theme.fontFamily,
                    fontSize: theme.fontSizeBody,
                    color: theme.windowFgColor,
                  }}
                >
                  {segment.label}
                </RNText>
              </Pressable>
            )}
          </Fragment>
        );
      })}
    </RNView>
  );
};
