import { Check, PanDown } from '@gnome-ui/icons';
import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { LayoutChangeEvent, StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import { Animated, Pressable, Text as RNText, View as RNView, ScrollView } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { Icon } from '@/components/Icon';
import { useGnomeTheme, useReducedMotion, useResolvedColorScheme } from '@/GnomeProvider';

import type { InlineViewSwitcherItemProps } from './InlineViewSwitcherItem';
import {
  getVariantStyles,
  type InlineViewSwitcherVariant,
  labelTextStyle,
  type VariantStyles,
} from './variants';

export type { InlineViewSwitcherVariant } from './variants';

export type InlineViewSwitcherOverflow = 'wrap' | 'scroll' | 'compact' | 'menu';

/** Measured position of one item inside the switcher row. */
export interface ItemLayout {
  x: number;
  width: number;
}

// ─── Internal context ──────────────────────────────────────────────────────────

interface InlineViewSwitcherContextValue {
  value: string;
  onValueChange: (value: string) => void;
  compact: boolean;
  styles: VariantStyles;
  onItemLayout: (name: string, layout: ItemLayout) => void;
}

const InlineViewSwitcherContext = createContext<InlineViewSwitcherContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useInlineViewSwitcher() {
  const ctx = useContext(InlineViewSwitcherContext);

  if (!ctx) {
    throw new Error('InlineViewSwitcherItem must be used inside InlineViewSwitcher');
  }

  return ctx;
}

// ─── InlineViewSwitcher ────────────────────────────────────────────────────────

export interface InlineViewSwitcherProps extends Omit<ViewProps, 'style'> {
  /** Currently active view name. */
  value: string;
  /** Called with the new value when a view is selected. */
  onValueChange: (value: string) => void;
  /**
   * Visual style of the switcher.
   * - `default` — card background with border (same shape as `ToggleGroup`).
   * - `flat`    — no background or border; active indicator only.
   * - `round`   — pill-shaped container and items, solid accent indicator.
   * - `pill`    — segmented-control style; active item appears lifted, no accent color.
   */
  variant?: InlineViewSwitcherVariant;
  /**
   * Overflow strategy when the container is too narrow for all items.
   * - `wrap`    — default; items simply overflow.
   * - `scroll`  — horizontal scroll, snapping each item to the start edge.
   * - `compact` — collapses item labels to icons-only when overflowing (needs icons on all items).
   * - `menu`    — shows the active item and a chevron; all items open in a `BottomSheet`.
   */
  overflow?: InlineViewSwitcherOverflow;
  /** Accessible label for the group. */
  accessibilityLabel?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Matches the web's `transform 160ms cubic-bezier(0.34, 1.2, 0.64, 1)`. */
const INDICATOR_DURATION = 160;
/** Stay collapsed until the container is comfortably wider — ported verbatim. */
const HYSTERESIS = 30;

/**
 * Compact inline view switcher for content areas, cards, and toolbars —
 * wherever `ViewSwitcher` (header-bar sized) would be too heavy. Mirrors
 * `AdwInlineViewSwitcher` (libadwaita 1.7 / GNOME 48) and
 * `@gnome-ui/react`'s own `InlineViewSwitcher`.
 *
 * All four variants and all four overflow strategies port, but almost none
 * of the *mechanism* does — this is a rebuild, not a transliteration:
 *
 * - **The sliding indicator** is measured, not laid out. The web reads the
 *   active button's `offsetLeft`/`offsetWidth` in a `useLayoutEffect`; here
 *   each item reports its own `onLayout` up through the context, and the
 *   indicator animates `translateX` + `width` to the active entry. Both run
 *   on **one JS-driven animation** (`useNativeDriver: false`): `width` can't
 *   be native-driven, and mixing a native and a JS value on one component
 *   throws — the same trade-off `Expander` accepted for its own animated
 *   height. `scaleX` would have been native-driveable but distorts the
 *   indicator's corner radii, which is exactly what the variants shape.
 *   `useReducedMotion()` snaps it into place instead, per this package's
 *   per-component convention.
 * - **Overflow detection** replaces `ResizeObserver` + `scrollWidth` vs
 *   `clientWidth` with the item measurements already being collected: their
 *   summed natural widths (RN defaults `flexShrink` to 0, so an overflowing
 *   row reports each item's *natural* width rather than a squeezed one)
 *   against the row's own `onLayout` width. The web's `naturalWidthRef`
 *   capture and 30 px hysteresis port verbatim — without them, collapsing
 *   the labels shrinks the content and would immediately re-expand it.
 * - **`overflow="scroll"`** becomes a horizontal `ScrollView` with the
 *   scrollbar hidden. `scroll-snap-align: start` has no RN style, but the
 *   measured item offsets feed `snapToOffsets`, which reproduces it exactly.
 * - **`overflow="menu"`** reuses the already-shipped `BottomSheet`, the same
 *   component the web version reaches for.
 *
 * The ←/→/Home/End keyboard layer drops, as everywhere else in this package.
 * As in `ToggleGroup`, the group takes `accessibilityRole="radiogroup"` but
 * deliberately not `accessible`, which on iOS would collapse the items into
 * a single unreachable element.
 *
 * @example
 * const [view, setView] = useState('grid');
 *
 * <InlineViewSwitcher value={view} onValueChange={setView} variant="pill">
 *   <InlineViewSwitcherItem name="grid" label="Grid" />
 *   <InlineViewSwitcherItem name="list" label="List" />
 * </InlineViewSwitcher>
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.InlineViewSwitcher.html
 */
export const InlineViewSwitcher = forwardRef<View, InlineViewSwitcherProps>(
  function InlineViewSwitcher(
    {
      value,
      onValueChange,
      variant = 'default',
      overflow = 'wrap',
      accessibilityLabel = 'View switcher',
      children,
      style,
      ...viewProps
    },
    ref,
  ) {
    const theme = useGnomeTheme();
    const isDark = useResolvedColorScheme() === 'dark';
    const reducedMotion = useReducedMotion();
    const styles = useMemo(
      () => getVariantStyles(theme, variant, isDark),
      [theme, variant, isDark],
    );

    const [layouts, setLayouts] = useState<Record<string, ItemLayout>>({});
    const [availableWidth, setAvailableWidth] = useState(0);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const naturalWidthRef = useRef(0);

    const translateX = useRef(new Animated.Value(0)).current;
    const indicatorWidth = useRef(new Animated.Value(0)).current;

    const onItemLayout = useCallback((name: string, layout: ItemLayout) => {
      setLayouts((prev) => {
        const current = prev[name];

        if (current && current.x === layout.x && current.width === layout.width) {
          return prev;
        }

        return { ...prev, [name]: layout };
      });
    }, []);

    const detectsOverflow = overflow === 'compact' || overflow === 'menu';

    const items = useMemo(
      () =>
        Children.toArray(children)
          .filter(isValidElement)
          .filter(
            (child) =>
              (child.type as { displayName?: string }).displayName === 'InlineViewSwitcherItem',
          )
          .map((child) => (child as ReactElement<InlineViewSwitcherItemProps>).props),
      [children],
    );

    // Natural width of the row: RN leaves `flexShrink` at 0, so an
    // overflowing row still reports each item at its own full width.
    const naturalWidth = useMemo(() => {
      const measured = items.map((item) => layouts[item.name]?.width ?? 0);

      if (measured.some((width) => width === 0)) {
        return 0;
      }

      const gaps = Math.max(items.length - 1, 0) * styles.gap;

      return measured.reduce((total, width) => total + width, 0) + gaps + 2 * styles.padding;
    }, [items, layouts, styles.gap, styles.padding]);

    useEffect(() => {
      if (!detectsOverflow || availableWidth === 0 || naturalWidth === 0) {
        if (!detectsOverflow) {
          setIsOverflowing(false);
        }
        return;
      }

      setIsOverflowing((prev) => {
        if (!prev) {
          if (naturalWidth > availableWidth) {
            naturalWidthRef.current = naturalWidth;
            return true;
          }
          return false;
        }

        return naturalWidthRef.current > availableWidth + HYSTERESIS;
      });
    }, [detectsOverflow, availableWidth, naturalWidth]);

    const compact = overflow === 'compact' && isOverflowing;
    const inMenuMode = overflow === 'menu' && isOverflowing;
    const activeItem = items.find((item) => item.name === value) ?? items[0];
    const activeLayout = layouts[value];

    useEffect(() => {
      if (inMenuMode || !activeLayout) {
        return;
      }

      if (reducedMotion) {
        translateX.setValue(activeLayout.x);
        indicatorWidth.setValue(activeLayout.width);
        return;
      }

      const animation = Animated.parallel([
        Animated.timing(translateX, {
          toValue: activeLayout.x,
          duration: INDICATOR_DURATION,
          useNativeDriver: false,
        }),
        Animated.timing(indicatorWidth, {
          toValue: activeLayout.width,
          duration: INDICATOR_DURATION,
          useNativeDriver: false,
        }),
      ]);

      animation.start();

      // Stop on unmount (and before restarting): a JS-driven animation keeps
      // its own timer alive, which would otherwise go on ticking against a
      // torn-down tree.
      return () => animation.stop();
    }, [activeLayout, inMenuMode, reducedMotion, translateX, indicatorWidth]);

    const context = useMemo(
      () => ({ value, onValueChange, compact, styles, onItemLayout }),
      [value, onValueChange, compact, styles, onItemLayout],
    );

    const handleRowLayout = useCallback(
      (event: LayoutChangeEvent) => {
        if (detectsOverflow) {
          setAvailableWidth(event.nativeEvent.layout.width);
        }
      },
      [detectsOverflow],
    );

    const snapToOffsets = useMemo(
      () =>
        overflow === 'scroll'
          ? items
              .map((item) => layouts[item.name]?.x ?? 0)
              .filter((x, index) => index === 0 || x > 0)
          : undefined,
      [overflow, items, layouts],
    );

    const row = (
      <RNView
        ref={ref}
        accessibilityRole={inMenuMode ? undefined : 'radiogroup'}
        accessibilityLabel={accessibilityLabel}
        onLayout={handleRowLayout}
        style={[
          { flexDirection: 'row', alignItems: 'stretch' },
          styles.container,
          // `.overflowDetect { width: 100% }` — the row has to be
          // constrained for there to be an overflow to detect at all.
          detectsOverflow ? { width: '100%' } : { alignSelf: 'flex-start' },
          style,
        ]}
        {...viewProps}
      >
        {inMenuMode ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${accessibilityLabel}: ${activeItem?.label ?? activeItem?.name}`}
            onPress={() => setSheetOpen(true)}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: theme.space1,
                minHeight: 28,
                paddingVertical: 4,
              },
              styles.item,
            ]}
          >
            {activeItem?.icon ? <Icon icon={activeItem.icon} size="md" /> : null}
            {activeItem?.label ? (
              // Idle color, not `activeTextColor`: menu mode hides the
              // indicator, so there's no accent surface behind the trigger.
              // The web version applies its `.active` class here anyway,
              // which paints `round`'s label in `accent-fg` (#fff) on a plain
              // card — white on white. Fixed rather than ported.
              <RNText style={labelTextStyle(theme, true, styles.idleTextColor)}>
                {activeItem.label}
              </RNText>
            ) : null}
            <Icon icon={PanDown} size="sm" />
          </Pressable>
        ) : (
          <>
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  left: 0,
                  top: styles.indicatorInset,
                  bottom: styles.indicatorInset,
                  width: indicatorWidth,
                  transform: [{ translateX }],
                },
                styles.indicator,
              ]}
            />
            {children}
          </>
        )}
      </RNView>
    );

    return (
      <InlineViewSwitcherContext.Provider value={context}>
        {overflow === 'scroll' ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToOffsets={snapToOffsets}
            decelerationRate="fast"
            contentContainerStyle={{ flexGrow: 0 }}
            style={{ flexGrow: 0 }}
          >
            {row}
          </ScrollView>
        ) : (
          row
        )}

        {overflow === 'menu' ? (
          <BottomSheet
            open={sheetOpen}
            title={accessibilityLabel}
            onClose={() => setSheetOpen(false)}
          >
            <RNView accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
              {items.map((item) => {
                const active = item.name === value;

                return (
                  <Pressable
                    key={item.name}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: active }}
                    accessibilityLabel={item.label ?? item.name}
                    onPress={() => {
                      onValueChange(item.name);
                      setSheetOpen(false);
                    }}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: theme.space2,
                      paddingVertical: theme.space2,
                      paddingHorizontal: theme.space3,
                      borderRadius: theme.radiusMd,
                      backgroundColor: pressed ? theme.activeOverlay : 'transparent',
                    })}
                  >
                    {item.icon ? <Icon icon={item.icon} size="md" /> : null}
                    <RNText
                      style={[
                        labelTextStyle(
                          theme,
                          active,
                          active ? theme.accentColor : theme.windowFgColor,
                        ),
                        { flex: 1 },
                      ]}
                    >
                      {item.label ?? item.name}
                    </RNText>
                    {active ? <Icon icon={Check} size="md" /> : null}
                  </Pressable>
                );
              })}
            </RNView>
          </BottomSheet>
        ) : null}
      </InlineViewSwitcherContext.Provider>
    );
  },
);
