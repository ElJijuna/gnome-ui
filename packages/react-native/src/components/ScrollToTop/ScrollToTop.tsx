import { GoUp } from '@gnome-ui/icons';
import { forwardRef } from 'react';
import type { StyleProp, View, ViewStyle } from 'react-native';
import { View as RNView } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { useGnomeTheme } from '@/GnomeProvider';

/**
 * Controls when the button is rendered.
 *
 * - `"auto"` — hidden until `scrollY` exceeds `threshold` (default).
 * - `"always"` — always rendered regardless of scroll position.
 */
export type ScrollToTopVisible = 'always' | 'auto';

/**
 * Anchor corner or edge for the absolutely-positioned container.
 * The button is inset `theme.space4` (24 dp) from each named edge.
 */
export type ScrollToTopPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'top-right'
  | 'top-left'
  | 'top-center';

export interface ScrollToTopProps {
  /**
   * Controls when the button is visible.
   *
   * - `"auto"` (default) — shown only once `scrollY` exceeds `threshold`.
   * - `"always"` — permanently visible.
   */
  visible?: ScrollToTopVisible;
  /**
   * Corner or edge where the button is anchored. Default: `"bottom-right"`.
   */
  position?: ScrollToTopPosition;
  /**
   * Offset the user must scroll past before the button appears.
   * Only relevant when `visible="auto"`. Default: `300`.
   */
  threshold?: number;
  /**
   * The observed `ScrollView`/`FlatList`'s current vertical scroll offset —
   * pass `nativeEvent.contentOffset.y` from its `onScroll` handler. Only
   * relevant when `visible="auto"`; ignored (and safe to omit) otherwise.
   * Default: `0`.
   */
  scrollY?: number;
  /**
   * Called when the button is pressed. There's no RN equivalent of the web
   * version's own `scrollTarget.scrollTo({ top: 0, behavior: 'smooth' })` —
   * `ScrollView`/`FlatList` are scrolled through a ref's imperative
   * `scrollTo`/`scrollToOffset`, which this component has no way to hold on
   * a consumer's behalf. Typically
   * `() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })`.
   */
  onPress: () => void;
  /**
   * Extra inset added on top of the base edge spacing when anchored to a
   * `"top-*"` position — pass your own `useSafeAreaInsets().top` so the
   * button clears a notch/status bar. Same "no new peer dependency" call
   * `BottomTabBar`'s `bottomInset` already made. Default: `0`.
   */
  topInset?: number;
  /** Same as `topInset`, for a `"bottom-*"` position. Default: `0`. */
  bottomInset?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function getPositionStyle(
  position: ScrollToTopPosition,
  space4: number,
  topInset: number,
  bottomInset: number,
): ViewStyle {
  switch (position) {
    case 'bottom-right':
      return { bottom: space4 + bottomInset, right: space4 };
    case 'bottom-left':
      return { bottom: space4 + bottomInset, left: space4 };
    case 'bottom-center':
      return { bottom: space4 + bottomInset, left: 0, right: 0, alignItems: 'center' };
    case 'top-right':
      return { top: space4 + topInset, right: space4 };
    case 'top-left':
      return { top: space4 + topInset, left: space4 };
    case 'top-center':
      return { top: space4 + topInset, left: 0, right: 0, alignItems: 'center' };
  }
}

/**
 * Absolutely-positioned OSD button that scrolls a `ScrollView`/`FlatList`
 * back to the top — mirrors `@gnome-ui/react`'s `ScrollToTop`, reimagined
 * rather than ported 1:1 per this package's own ROADMAP note: RN has no
 * page-level scroll event to observe internally the way the web version's
 * `useScrollToTopVisibility` attaches a `window`/element `scroll` listener,
 * so that hook doesn't port at all — `visible="auto"` is instead a pure
 * function of a `scrollY` prop the consumer feeds from their own
 * `ScrollView`'s `onScroll`, re-evaluated on every render with no internal
 * state or listener needed.
 *
 * Same "no `document.body`/portal target" gap `Toaster` already
 * documents — mount this yourself as the last child of the `View` wrapping
 * your scrollable content (left at its default relative positioning) so it
 * paints on top; `pointerEvents="box-none"` (the same technique `Toaster`
 * uses) keeps the empty space around the button from intercepting touches
 * meant for the content underneath.
 *
 * The web version's resting `opacity: 0.5`-until-hover/focus is dropped —
 * the same call `PasswordEntryRow`'s reveal button already made: that
 * effect exists purely so the control can brighten on hover, and touch has
 * no hover, so a permanently dimmed control would just be harder to see.
 *
 * Forwards `ref` to the root positioning `View`, not the inner button —
 * matching the web version's own `forwardRef` target.
 *
 * @example
 * // Minimal — appears once `scrollY` exceeds 300, anchored bottom-right
 * const [scrollY, setScrollY] = useState(0);
 * const scrollRef = useRef<ScrollView>(null);
 * <View style={{ flex: 1 }}>
 *   <ScrollView
 *     ref={scrollRef}
 *     onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
 *     scrollEventThrottle={16}
 *   >
 *     ...
 *   </ScrollView>
 *   <ScrollToTop
 *     scrollY={scrollY}
 *     onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
 *   />
 * </View>
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ScrollToTop.html
 */
export const ScrollToTop = forwardRef<View, ScrollToTopProps>(function ScrollToTop(
  {
    visible = 'auto',
    position = 'bottom-right',
    threshold = 300,
    scrollY = 0,
    onPress,
    topInset = 0,
    bottomInset = 0,
    style,
    testID,
  },
  ref,
) {
  const theme = useGnomeTheme();
  const isVisible = visible === 'always' || scrollY > threshold;

  if (!isVisible) {
    return null;
  }

  return (
    <RNView
      ref={ref}
      testID={testID}
      pointerEvents="box-none"
      style={[
        { position: 'absolute', zIndex: 9999 },
        getPositionStyle(position, theme.space4, topInset, bottomInset),
        style,
      ]}
    >
      <IconButton icon={GoUp} label="Scroll to top" variant="osd" onPress={onPress} />
    </RNView>
  );
});
