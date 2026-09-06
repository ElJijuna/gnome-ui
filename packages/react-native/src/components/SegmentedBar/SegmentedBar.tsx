import { useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, View } from 'react-native';

import { Tooltip } from '@/components/Tooltip';
import { useGnomeTheme, useResolvedColorScheme } from '@/GnomeProvider';
import type { GnomeThemeTokens } from '@/theme';

export interface SegmentedBarSegment {
  /** Category name shown in the tooltip. */
  label: string;
  /**
   * Percentage value 0–100.
   * The sum of all segments should equal 100.
   * If it does not, values are redistributed proportionally.
   */
  value: number;
  /**
   * Color for this segment.
   * When omitted, a cycling palette of GNOME design tokens is used.
   */
  color?: string;
}

export interface SegmentedBarProps {
  /** Segments to display. Each segment contributes its share of the full bar width. */
  values: SegmentedBarSegment[];
  /**
   * Accessible label for the bar as a whole.
   * Auto-generated from `values` when omitted (e.g. "TypeScript 60%, JavaScript 30%").
   */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const COLOR_COUNT = 8;

function paletteColor(theme: GnomeThemeTokens, index: number): string {
  switch (index % COLOR_COUNT) {
    case 0:
      return theme.blue3;
    case 1:
      return theme.green3;
    case 2:
      return theme.purple3;
    case 3:
      return theme.orange3;
    case 4:
      return theme.red3;
    case 5:
      return theme.brown3;
    case 6:
      return theme.blue5;
    default:
      return theme.green5;
  }
}

/**
 * Horizontal bar split into proportional segments, one per category.
 * Mirrors `@gnome-ui/react`'s `SegmentedBar`. Typical use case: repository
 * language distribution.
 *
 * ```tsx
 * <SegmentedBar
 *   values={[
 *     { label: 'TypeScript', value: 60, color: '#3178c6' },
 *     { label: 'JavaScript', value: 30, color: '#f7df1e' },
 *     { label: 'CSS',        value: 10, color: '#563d7c' },
 *   ]}
 * />
 * ```
 *
 * The web version's hover interaction (dim every segment but the one under
 * the pointer, brighten that one via `filter: brightness()`) is rebuilt for
 * touch rather than dropped: each segment is a `Pressable`, and touching
 * one dims the rest immediately via `onPressIn`/`onPressOut` — deliberately
 * not gated behind `Tooltip`'s own long-press delay, since this feedback is
 * the RN analog of a `Pressable`'s own instant `pressed` state, not the
 * "peek" affordance a tooltip reveal is. Each segment is also wrapped in
 * `Tooltip` (`label`/`placement="top"`/`delay={200}`, ported 1:1 from the
 * web version's own tooltip) for the actual label/percentage readout,
 * composing cleanly with the dim/highlight `onPressIn`/`onPressOut` since
 * `Tooltip` clones its own handlers onto the child *and* still calls the
 * child's original ones. `filter: brightness(1.15)` on the actively-touched
 * segment has no RN equivalent (no `filter` support) — dropped as a
 * decorative nicety, since the touched segment already reads as
 * highlighted by contrast once every other segment dims to 35% opacity.
 *
 * `role="img"` + `accessibilityLabel` ports 1:1 from RN's newer web-aligned
 * `Role` union (the same `Avatar`/`LevelBar` precedent).
 *
 * @see https://developer.gnome.org/hig/patterns/feedback/progress.html
 */
export const SegmentedBar = ({ values, accessibilityLabel, style, testID }: SegmentedBarProps) => {
  const theme = useGnomeTheme();
  const scheme = useResolvedColorScheme();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = values.reduce((sum, s) => sum + s.value, 0) || 100;
  const defaultLabel = values.map((s) => `${s.label} ${s.value}%`).join(', ');
  const trackColor = scheme === 'dark' ? theme.dark2 : theme.light3;

  return (
    <View
      testID={testID}
      accessible
      role="img"
      accessibilityLabel={accessibilityLabel ?? defaultLabel}
      style={[
        {
          flexDirection: 'row',
          width: '100%',
          height: 8,
          borderRadius: theme.radiusPill,
          overflow: 'hidden',
          gap: 2,
          backgroundColor: trackColor,
        },
        style,
      ]}
    >
      {values.map((segment, i) => {
        const width = `${(segment.value / total) * 100}%` as const;
        const pct = segment.value % 1 === 0 ? segment.value : segment.value.toFixed(1);
        const tooltipLabel = `${segment.label}: ${pct}%`;

        return (
          <Tooltip key={segment.label} label={tooltipLabel} placement="top" delay={200}>
            <Pressable
              testID="segmented-bar-segment"
              onPressIn={() => setActiveIndex(i)}
              onPressOut={() => setActiveIndex(null)}
              style={{
                width,
                height: '100%',
                backgroundColor: segment.color ?? paletteColor(theme, i),
                opacity: activeIndex !== null && activeIndex !== i ? 0.35 : 1,
              }}
            />
          </Tooltip>
        );
      })}
    </View>
  );
};
