import { type ReactNode, useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { Animated, Easing, View } from 'react-native';

import { Separator } from '@/components/Separator';
import { useGnomeTheme, useReducedMotion } from '@/GnomeProvider';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export interface NavigationSplitViewProps {
  /**
   * The sidebar / list pane (left side on wide screens).
   * On narrow screens this is the "list" view shown when `showContent` is false.
   */
  sidebar: ReactNode;
  /**
   * The detail / content pane (right side on wide screens).
   * On narrow screens this is the "detail" view shown when `showContent` is true.
   */
  content: ReactNode;
  /**
   * Controls which pane is visible on narrow screens (≤ 400 dp).
   * - `false` (default) — show the sidebar list.
   * - `true` — show the content detail.
   *
   * Has no effect on wide screens where both panes are visible simultaneously.
   */
  showContent?: boolean;
  /** Minimum sidebar width in dp. Defaults to `180`. */
  minSidebarWidth?: number;
  /** Maximum sidebar width in dp. Defaults to `280`. */
  maxSidebarWidth?: number;
  /** Fraction of total width given to the sidebar (0–1). Defaults to `0.25`. */
  sidebarWidthFraction?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Two-pane sidebar + content layout following the Adwaita
 * `AdwNavigationSplitView` pattern — mirrors `@gnome-ui/react`'s
 * `NavigationSplitView`.
 *
 * On **wide** screens (`useBreakpoint().isNarrow === false`, > 400 dp) both
 * panes are visible side-by-side, separated by a `Separator`. On **narrow**
 * screens only one pane is shown at a time; `showContent` switches between
 * the sidebar list and the detail view.
 *
 * The web version's `clamp(min, fraction * 100%, max)` sidebar width has no
 * RN equivalent (`StyleSheet` values aren't CSS `calc`/`clamp` expressions),
 * so the container measures its own width via `onLayout` and the same clamp
 * is computed in JS — `0` until the first layout pass resolves, the same
 * one-frame imprecision this package already accepts elsewhere (e.g.
 * `ProgressBar`'s `trackWidth`-dependent math).
 *
 * Narrow-mode pane switching is animated (`translateX`, matching the web
 * CSS's own `transition: transform`), so — unlike `TabPanel`'s simpler
 * `display: 'none'` swap — both panes stay laid out and absolutely
 * positioned rather than being removed from flow, using the same measured
 * container width for the slide distance (RN `transform` has no
 * percentage-of-self units, so this can't be a bare `-100%`/`100%` the way
 * the web version's CSS is). One shared `Animated.Value` drives both
 * panes' opposite-direction translation, the same "skip the animation on
 * initial mount, only animate subsequent prop changes" guard `Switch`/
 * `StepIndicator` already established for a controlled boolean prop.
 *
 * The web's `inert` attribute (removes the hidden pane from both the a11y
 * tree and the tab order while it stays mounted off-screen) has no single
 * RN equivalent — reproduced with `accessibilityElementsHidden` +
 * `importantForAccessibility="no-hide-descendants"` (the whole-subtree a11y
 * exclusion, not just the single-element `"no"` `PathBar`'s decorative
 * separator uses) plus `pointerEvents="none"` so the off-screen pane can't
 * intercept touches meant for the visible one.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.NavigationSplitView.html
 */
export const NavigationSplitView = ({
  sidebar,
  content,
  showContent = false,
  minSidebarWidth = 180,
  maxSidebarWidth = 280,
  sidebarWidthFraction = 0.25,
  style,
  testID,
}: NavigationSplitViewProps) => {
  const theme = useGnomeTheme();
  const reducedMotion = useReducedMotion();
  const { isNarrow } = useBreakpoint();

  const [containerWidth, setContainerWidth] = useState(0);
  const progress = useRef(new Animated.Value(showContent ? 1 : 0)).current;
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;

      return;
    }

    if (reducedMotion) {
      progress.setValue(showContent ? 1 : 0);

      return;
    }

    const [x1, y1, x2, y2] = theme.easingDefault;

    Animated.timing(progress, {
      toValue: showContent ? 1 : 0,
      duration: theme.durationNormal,
      easing: Easing.bezier(x1, y1, x2, y2),
      useNativeDriver: true,
    }).start();
  }, [showContent, reducedMotion, progress, theme.durationNormal, theme.easingDefault]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const sidebarWidth = Math.min(
    Math.max(containerWidth * sidebarWidthFraction, minSidebarWidth),
    maxSidebarWidth,
  );

  const sidebarHidden = isNarrow && showContent;
  const contentHidden = isNarrow && !showContent;

  const sidebarTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -containerWidth],
  });
  const contentTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [containerWidth, 0],
  });

  return (
    <View
      testID={testID}
      onLayout={handleLayout}
      style={[
        {
          width: '100%',
          height: '100%',
          flexDirection: isNarrow ? 'column' : 'row',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        accessibilityElementsHidden={sidebarHidden}
        importantForAccessibility={sidebarHidden ? 'no-hide-descendants' : 'yes'}
        pointerEvents={sidebarHidden ? 'none' : 'auto'}
        style={
          isNarrow
            ? {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                transform: [{ translateX: sidebarTranslateX }],
              }
            : { width: sidebarWidth, flexShrink: 0 }
        }
      >
        {sidebar}
      </Animated.View>

      {!isNarrow && <Separator orientation="vertical" testID={testID && `${testID}-divider`} />}

      <Animated.View
        accessibilityElementsHidden={contentHidden}
        importantForAccessibility={contentHidden ? 'no-hide-descendants' : 'yes'}
        pointerEvents={contentHidden ? 'none' : 'auto'}
        style={
          isNarrow
            ? {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                transform: [{ translateX: contentTranslateX }],
              }
            : { flex: 1, minWidth: 0 }
        }
      >
        {content}
      </Animated.View>
    </View>
  );
};
