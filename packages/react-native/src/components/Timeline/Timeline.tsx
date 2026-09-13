import type { ReactNode } from 'react';
import { useState } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { ScrollView, View } from 'react-native';

import { useGnomeTheme } from '@/GnomeProvider';

export type TimelineOrientation = 'vertical' | 'horizontal';
export type TimelineVariant = 'default' | 'dotted' | 'none';

export interface TimelineItem {
  /** Icon rendered inside the timeline node. Sized/colored by the consumer — see the component doc. */
  icon?: ReactNode;
  /**
   * Content at the leading edge of the node.
   * - **Vertical:** rendered to the left of the connector track.
   * - **Horizontal:** rendered above the node.
   *
   * Typical use: timestamp, badge, short label.
   */
  leading?: ReactNode;
  /** Main event content rendered adjacent to the node (title, description…). */
  content: ReactNode;
}

export interface TimelineProps {
  /** Ordered list of timeline events. */
  items: TimelineItem[];
  /**
   * Axis direction of the connector line.
   * - `"vertical"` — events stack top-to-bottom (default).
   * - `"horizontal"` — events flow left-to-right, in a horizontal `ScrollView`.
   */
  orientation?: TimelineOrientation;
  /**
   * Visual style of the connector between nodes.
   * - `"default"` — solid thin line.
   * - `"dotted"` — dotted line; useful for future or pending events.
   * - `"none"` — no connector; each node stands alone.
   */
  variant?: TimelineVariant;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const NODE_DOT_SIZE = 12;
const NODE_ICON_SIZE = 28;
const LINE_THICKNESS = 2;
const VERTICAL_MIN_LINE_LENGTH = 16;
/** Cross-dimension of the dotted line's box — see `lineStyle`'s doc comment. */
const DOTTED_LINE_CROSS_SIZE = 6;
/** Matches `@gnome-ui/react`'s `grid-template-columns: auto 24px 1fr` (fixed track width). */
const VERTICAL_NODE_TRACK_WIDTH = 24;
/** No fixed value in the source CSS (an `auto` grid row) — the larger of the two node sizes. */
const HORIZONTAL_NODE_TRACK_HEIGHT = NODE_ICON_SIZE;
/** Matches the source CSS's literal (non-tokenized) `padding-bottom: 20px`. */
const VERTICAL_ITEM_GAP = 20;
/** Matches `grid-auto-columns: minmax(72px, 1fr)` — the `1fr` growth half doesn't
 * port (see the component doc), only the `72px` floor. */
const HORIZONTAL_MIN_ITEM_WIDTH = 72;
const HORIZONTAL_ITEM_GAP = 8;

/**
 * Ordered sequence of events connected by a visual timeline — mirrors
 * `@gnome-ui/react`'s `Timeline`. An original composition (no direct
 * libadwaita widget), following GNOME HIG activity-feed/stepper patterns.
 *
 * The web version aligns every item's `leading` column (vertical) or row
 * (horizontal) via CSS subgrid, so timestamps/labels line up across items
 * regardless of how wide/tall any single one of them is. RN/Yoga has no
 * grid or subgrid at all, so that alignment is reproduced by measurement
 * instead — the same `onLayout` + `Record<index, size>` +
 * "largest-so-far wins" technique `Slider`'s mark labels already
 * established: every item's `leading` cell (always rendered, even when
 * empty, matching the web version's own "same 3 children" comment)
 * reports its own rendered width (vertical) or height (horizontal), and
 * every cell gets a `minWidth`/`minHeight` equal to the largest one
 * measured so far, so the node column/row starts at the same position in
 * every item. The node track itself additionally gets a *fixed*
 * width (vertical, matching the source CSS's literal `24px` column) or
 * height (horizontal, the larger of the dot/icon node sizes, since the
 * source's row there is CSS `auto` with no fixed value to port) — without
 * it, an item with an icon node (28 dp) and one with a plain dot (12 dp)
 * would each size their own track differently, misaligning `content`'s
 * start position between them.
 *
 * `orientation="horizontal"` wraps itself in a horizontal `ScrollView`,
 * reimagining the web CSS's `overflow-x: auto` — the direct native
 * equivalent for "scroll instead of overflow when items don't fit". The
 * web version's `grid-auto-columns: minmax(72px, 1fr)` also grows items
 * to fill leftover space when the row *doesn't* overflow; that half
 * doesn't port (a `ScrollView`'s content isn't bounded the way a CSS grid
 * track is, so there's no "leftover space" to distribute) — each item
 * just gets a flat 72 dp `minWidth` instead, unconditionally scrollable
 * like `overflow-x: auto`'s own fallback path.
 *
 * `icon`/`leading`/`content` are plain `ReactNode`, the same as
 * `PathBar`'s segment `icon` — the consumer sizes and colors their own
 * icon (e.g. `tintColor={theme.accentFgColor}` on their own `<Icon>`),
 * since RN has no `currentColor` for this component to tint an arbitrary
 * child with the way the web version's CSS `color: accent-fg-color`
 * does via inheritance onto the icon's SVG.
 *
 * `role="list"`/`role="listitem"` are set **without** `accessible` — the
 * `ToggleGroup`/`StepIndicator`-established pattern for a grouping role
 * over children that may themselves contain focusable content (an
 * item's `content` is arbitrary `ReactNode` and could include one), so
 * nothing nested inside gets swallowed into a single VoiceOver stop.
 * Assert `element.props.role` on a `testID` in tests instead of
 * `getByRole('list'/'listitem')`.
 */
export const Timeline = ({
  items,
  orientation = 'vertical',
  variant = 'default',
  style,
  testID,
}: TimelineProps) => {
  const theme = useGnomeTheme();
  const horizontal = orientation === 'horizontal';
  const showLine = variant !== 'none';
  const dotted = variant === 'dotted';

  const [leadingExtents, setLeadingExtents] = useState<Record<number, number>>({});
  const maxLeadingExtent = Object.values(leadingExtents).reduce((max, v) => Math.max(max, v), 0);

  const handleLeadingLayout = (index: number) => (event: LayoutChangeEvent) => {
    const size = horizontal ? event.nativeEvent.layout.height : event.nativeEvent.layout.width;

    setLeadingExtents((prev) => (prev[index] === size ? prev : { ...prev, [index]: size }));
  };

  const lineStyle = (hidden: boolean): StyleProp<ViewStyle> => {
    // The web CSS draws the dotted line via a single `border-left`/`border-top`
    // (zero-width box, one bordered side) — confirmed on-device (iOS Simulator,
    // saturated debug colors) that RN's `borderStyle: 'dotted'` renders nothing
    // at all unless every side shares the same width AND color (even three
    // sides at `borderWidth: 0` or `borderColor: 'transparent'` suppresses it
    // entirely). Reimagined as a narrow box with a *uniform* dotted border on
    // all four sides instead — visually indistinguishable from a single
    // dotted line at this thickness, and the only combination that actually
    // renders. **Any future dotted/dashed RN border needs all sides
    // width+color-uniform — a single-side border in that style silently
    // renders invisible, no error.**
    const base: ViewStyle = dotted
      ? horizontal
        ? {
            flex: 1,
            height: DOTTED_LINE_CROSS_SIZE,
            borderWidth: LINE_THICKNESS,
            borderStyle: 'dotted',
            borderColor: theme.borderSubtle,
          }
        : {
            flex: 1,
            width: DOTTED_LINE_CROSS_SIZE,
            minHeight: VERTICAL_MIN_LINE_LENGTH,
            borderWidth: LINE_THICKNESS,
            borderStyle: 'dotted',
            borderColor: theme.borderSubtle,
          }
      : horizontal
        ? { flex: 1, height: LINE_THICKNESS, backgroundColor: theme.borderSubtle }
        : {
            flex: 1,
            width: LINE_THICKNESS,
            minHeight: VERTICAL_MIN_LINE_LENGTH,
            backgroundColor: theme.borderSubtle,
          };

    return hidden || !showLine ? { ...base, opacity: 0 } : base;
  };

  const renderedItems = items.map((item, i) => {
    const isFirst = i === 0;
    const isLast = i === items.length - 1;
    const hasIcon = Boolean(item.icon);

    const node = (
      <View
        style={{
          width: hasIcon ? NODE_ICON_SIZE : NODE_DOT_SIZE,
          height: hasIcon ? NODE_ICON_SIZE : NODE_DOT_SIZE,
          borderRadius: theme.radiusPill,
          backgroundColor: theme.accentBgColor,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {item.icon}
      </View>
    );

    const leadingCell = (
      <View
        onLayout={handleLeadingLayout(i)}
        style={
          horizontal
            ? {
                minHeight: maxLeadingExtent,
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: theme.space2,
              }
            : {
                minWidth: maxLeadingExtent,
                flexShrink: 0,
                alignSelf: 'flex-start',
                alignItems: 'flex-end',
                paddingTop: 4,
              }
        }
      >
        {item.leading}
      </View>
    );

    const nodeTrack = horizontal ? (
      <View
        style={{
          height: HORIZONTAL_NODE_TRACK_HEIGHT,
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <View style={lineStyle(isFirst)} />
        {node}
        <View style={lineStyle(isLast)} />
      </View>
    ) : (
      <View
        style={{ width: VERTICAL_NODE_TRACK_WIDTH, flexShrink: 0, alignItems: 'center', flex: 1 }}
      >
        {node}
        {!isLast && showLine && <View style={lineStyle(false)} />}
      </View>
    );

    const contentCell = (
      <View
        style={
          horizontal
            ? { alignItems: 'center', paddingTop: theme.space2 }
            : {
                flex: 1,
                minWidth: 0,
                alignSelf: 'flex-start',
                paddingTop: 2,
                paddingBottom: isLast ? 0 : VERTICAL_ITEM_GAP,
              }
        }
      >
        {item.content}
      </View>
    );

    return (
      <View
        key={i}
        testID={testID ? `${testID}-item-${i}` : undefined}
        role="listitem"
        style={
          horizontal
            ? { minWidth: HORIZONTAL_MIN_ITEM_WIDTH, marginRight: isLast ? 0 : HORIZONTAL_ITEM_GAP }
            : { flexDirection: 'row', columnGap: theme.space2 }
        }
      >
        {leadingCell}
        {nodeTrack}
        {contentCell}
      </View>
    );
  });

  if (horizontal) {
    return (
      <ScrollView
        testID={testID}
        role="list"
        horizontal
        showsHorizontalScrollIndicator={false}
        style={style}
        contentContainerStyle={{ flexDirection: 'row' }}
      >
        {renderedItems}
      </ScrollView>
    );
  }

  return (
    <View testID={testID} role="list" style={style}>
      {renderedItems}
    </View>
  );
};
