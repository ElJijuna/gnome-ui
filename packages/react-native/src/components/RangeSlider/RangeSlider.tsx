import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  AccessibilityActionEvent,
  GestureResponderEvent,
  LayoutChangeEvent,
  StyleProp,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { PanResponder, Text, View } from 'react-native';

import { useGnomeTheme } from '@/GnomeProvider';

const TRACK_HEIGHT = 6;
const THUMB_SIZE = 22;
const TICK_SIZE = 4;

export interface RangeSliderMark {
  value: number;
  label?: string;
}

export interface RangeSliderProps extends Omit<ViewProps, 'style'> {
  /** Current `[lower, upper]` values. Both must be between `min` and `max`. */
  value: [number, number];
  /** Called when either thumb moves. */
  onChange: (value: [number, number]) => void;
  /** Minimum value. Defaults to `0`. */
  min?: number;
  /** Maximum value. Defaults to `100`. */
  max?: number;
  /**
   * Granularity of each step.
   * - The `adjustable` accessibility action (VoiceOver/TalkBack swipe up/down) moves by one step.
   * Defaults to `1`.
   */
  step?: number;
  /**
   * Minimum allowed gap between the lower and upper thumb, in value units.
   * Prevents the thumbs from crossing or overlapping. Defaults to `0`.
   */
  minDistance?: number;
  /** Disables the control. */
  disabled?: boolean;
  /**
   * Marks to display along the track.
   * Each mark can have an optional label rendered below the track.
   */
  marks?: RangeSliderMark[];
  /** Accessible label for the lower-bound thumb. Defaults to `"Minimum value"`. */
  minLabel?: string;
  /** Accessible label for the upper-bound thumb. Defaults to `"Maximum value"`. */
  maxLabel?: string;
  style?: StyleProp<ViewStyle>;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function snapToStep(v: number, min: number, step: number, decimals: number) {
  return parseFloat((Math.round((v - min) / step) * step + min).toFixed(decimals));
}

function countDecimals(n: number) {
  const s = n.toString();
  const dot = s.indexOf('.');

  return dot === -1 ? 0 : s.length - dot - 1;
}

/**
 * Dual-thumb slider for selecting a min/max range, following the Adwaita
 * `GtkScale` pattern used by `Slider` — mirrors `@gnome-ui/react`'s
 * `RangeSlider`. Distinct from `Slider` (single value) — use this for
 * range filters (price, date range, etc.) where both bounds are
 * adjustable.
 *
 * Reuses `Slider`'s exact `PanResponder`/`locationX` pixel-positioning
 * technique (no `%`-of-self transform, since RN's `transform` only takes
 * pixel offsets) rather than two separate per-thumb responders: a single
 * `PanResponder` spans the whole track and, on `onPanResponderGrant`,
 * picks whichever thumb is closer to the touch point — the same
 * nearest-thumb logic the web version's `handleTrackPointerDown` uses —
 * then that same thumb keeps following the touch for the rest of the
 * gesture (`onPanResponderMove`), exactly matching the web behavior of
 * "the thumb chosen at touch-down stays locked to the gesture even if the
 * pointer drifts closer to the other thumb mid-drag." This single-
 * responder shape also stands in for the web version's separate "drag the
 * track itself" affordance — touching anywhere on the track immediately
 * jumps the nearest thumb there, so no separate interaction is needed.
 *
 * The web's keyboard (← / → / Page Up/Down / Home/End) has no RN
 * equivalent — same "no keyboard to drive it" reasoning `Slider` already
 * established — replaced by two independent `accessibilityRole="adjustable"`
 * elements (one per thumb, each with its own `accessibilityValue`/
 * `onAccessibilityAction`), the native VoiceOver/TalkBack increment-
 * decrement analog. Each thumb's own visual `View` stays
 * `pointerEvents="none"` (dragging is the track responder's job, not a
 * per-thumb touch target) — screen readers still reach it independently
 * through the accessibility tree, which is separate from RN's touch hit-
 * testing.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/sliders.html
 */
export const RangeSlider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  minDistance = 0,
  disabled = false,
  marks,
  minLabel = 'Minimum value',
  maxLabel = 'Maximum value',
  style,
  onLayout,
  testID,
  ...viewProps
}: RangeSliderProps) => {
  const theme = useGnomeTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const [labelWidths, setLabelWidths] = useState<Record<number, number>>({});
  const dragIndexRef = useRef<0 | 1 | null>(null);

  const dp = countDecimals(step);
  const [lo, hi] = value;
  const clampedLo = clamp(lo, min, max);
  const clampedHi = clamp(hi, min, max);
  const loPct = ((clampedLo - min) / (max - min)) * 100;
  const hiPct = ((clampedHi - min) / (max - min)) * 100;

  const handleTrackLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setTrackWidth(event.nativeEvent.layout.width);
      onLayout?.(event);
    },
    [onLayout],
  );

  const setValueAt = useCallback(
    (index: 0 | 1, raw: number) => {
      const snapped = snapToStep(raw, min, step, dp);

      if (index === 0) {
        onChange([clamp(snapped, min, hi - minDistance), hi]);
      } else {
        onChange([lo, clamp(snapped, lo + minDistance, max)]);
      }
    },
    [min, max, step, dp, minDistance, lo, hi, onChange],
  );

  const valueFromLocationX = useCallback(
    (locationX: number) => (locationX / trackWidth) * (max - min) + min,
    [trackWidth, min, max],
  );

  const nearestThumbIndex = useCallback(
    (locationX: number): 0 | 1 => {
      const raw = valueFromLocationX(locationX);

      return Math.abs(raw - lo) <= Math.abs(raw - hi) ? 0 : 1;
    },
    [valueFromLocationX, lo, hi],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (event: GestureResponderEvent) => {
          if (trackWidth <= 0) {
            return;
          }

          const { locationX } = event.nativeEvent;
          const index = nearestThumbIndex(locationX);

          dragIndexRef.current = index;
          setValueAt(index, valueFromLocationX(locationX));
        },
        onPanResponderMove: (event: GestureResponderEvent) => {
          if (dragIndexRef.current === null || trackWidth <= 0) {
            return;
          }

          setValueAt(dragIndexRef.current, valueFromLocationX(event.nativeEvent.locationX));
        },
        onPanResponderRelease: () => {
          dragIndexRef.current = null;
        },
        onPanResponderTerminate: () => {
          dragIndexRef.current = null;
        },
      }),
    [disabled, trackWidth, nearestThumbIndex, setValueAt, valueFromLocationX],
  );

  const makeAccessibilityAction = useCallback(
    (index: 0 | 1) => (event: AccessibilityActionEvent) => {
      if (disabled) {
        return;
      }

      const current = index === 0 ? lo : hi;

      switch (event.nativeEvent.actionName) {
        case 'increment':
          setValueAt(index, current + step);
          break;
        case 'decrement':
          setValueAt(index, current - step);
          break;
      }
    },
    [disabled, lo, hi, step, setValueAt],
  );

  const hasMarks = marks && marks.length > 0;
  const hasLabels = hasMarks && marks.some((m) => m.label);

  const loThumbLeft = (loPct / 100) * trackWidth - THUMB_SIZE / 2;
  const hiThumbLeft = (hiPct / 100) * trackWidth - THUMB_SIZE / 2;

  return (
    <View
      testID={testID}
      style={[{ width: '100%', paddingTop: 10, paddingBottom: hasLabels ? 0 : 10 }, style]}
      {...viewProps}
    >
      <View
        testID={testID ? `${testID}-track` : undefined}
        onLayout={handleTrackLayout}
        style={{
          justifyContent: 'center',
          height: THUMB_SIZE,
          opacity: disabled ? theme.opacityDisabled : 1,
        }}
        {...panResponder.panHandlers}
      >
        <View
          pointerEvents="none"
          style={{
            width: '100%',
            height: TRACK_HEIGHT,
            borderRadius: theme.radiusPill,
            backgroundColor: theme.cardShadeColor,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              position: 'absolute',
              height: '100%',
              left: `${loPct}%`,
              width: `${hiPct - loPct}%`,
              borderRadius: theme.radiusPill,
              backgroundColor: theme.accentBgColor,
            }}
          />
        </View>

        <View
          pointerEvents="none"
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={minLabel}
          accessibilityValue={{ min, max: hi, now: clampedLo }}
          accessibilityState={{ disabled }}
          accessibilityActions={[
            { name: 'increment', label: 'increment' },
            { name: 'decrement', label: 'decrement' },
          ]}
          onAccessibilityAction={makeAccessibilityAction(0)}
          style={{
            position: 'absolute',
            left: loThumbLeft,
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: theme.radiusPill,
            backgroundColor: theme.accentBgColor,
            borderWidth: 2,
            borderColor: theme.windowBgColor,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.25,
            shadowRadius: 3,
            elevation: 3,
          }}
        />

        <View
          pointerEvents="none"
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={maxLabel}
          accessibilityValue={{ min: lo, max, now: clampedHi }}
          accessibilityState={{ disabled }}
          accessibilityActions={[
            { name: 'increment', label: 'increment' },
            { name: 'decrement', label: 'decrement' },
          ]}
          onAccessibilityAction={makeAccessibilityAction(1)}
          style={{
            position: 'absolute',
            left: hiThumbLeft,
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: theme.radiusPill,
            backgroundColor: theme.accentBgColor,
            borderWidth: 2,
            borderColor: theme.windowBgColor,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.25,
            shadowRadius: 3,
            elevation: 3,
          }}
        />

        {hasMarks &&
          marks.map((m) => {
            const mPct = ((clamp(m.value, min, max) - min) / (max - min)) * 100;
            const tickLeft = (mPct / 100) * trackWidth - TICK_SIZE / 2;

            return (
              <View
                key={m.value}
                pointerEvents="none"
                importantForAccessibility="no"
                style={{
                  position: 'absolute',
                  left: tickLeft,
                  width: TICK_SIZE,
                  height: TICK_SIZE,
                  borderRadius: TICK_SIZE / 2,
                  backgroundColor: theme.windowBgColor,
                }}
              />
            );
          })}
      </View>

      {hasLabels && (
        <View
          importantForAccessibility="no"
          style={{ position: 'relative', width: '100%', height: 20, marginTop: 6 }}
        >
          {marks.map((m) => {
            const mPct = ((clamp(m.value, min, max) - min) / (max - min)) * 100;
            const centerX = (mPct / 100) * trackWidth;
            const labelWidth = labelWidths[m.value] ?? 0;

            return (
              <Text
                key={m.value}
                numberOfLines={1}
                onLayout={(event) => {
                  const {
                    layout: { width },
                  } = event.nativeEvent;

                  setLabelWidths((prev) =>
                    prev[m.value] === width ? prev : { ...prev, [m.value]: width },
                  );
                }}
                style={{
                  position: 'absolute',
                  left: centerX - labelWidth / 2,
                  fontFamily: theme.fontFamily,
                  fontSize: theme.fontSizeCaption,
                  color: theme.windowFgColor,
                  opacity: theme.opacityDim,
                }}
              >
                {m.label}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
};
