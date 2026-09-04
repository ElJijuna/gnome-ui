import { useCallback, useMemo, useState } from 'react';
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

export interface SliderMark {
  value: number;
  label?: string;
}

export interface SliderProps extends Omit<ViewProps, 'style'> {
  /** Current value. Must be between `min` and `max`. */
  value: number;
  /** Called when the value changes. */
  onChange: (value: number) => void;
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
  /** Disables the control. */
  disabled?: boolean;
  /**
   * Marks to display along the track.
   * Each mark can have an optional label rendered below the track.
   */
  marks?: SliderMark[];
  /** Accessible label. Required — RN has no visible-label association to fall back on. */
  accessibilityLabel?: string;
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
 * Draggable range slider following the Adwaita `GtkScale` pattern.
 *
 * - Touch drag (via `PanResponder`) sets the value continuously.
 * - `accessibilityRole="adjustable"` + `onAccessibilityAction` handles the
 *   "increment"/"decrement" actions VoiceOver (swipe up/down) and TalkBack
 *   generate for an adjustable element — RN's native analog of the web
 *   version's ← / → keyboard stepping, since a touch-first device has no
 *   keyboard to drive `ArrowLeft`/`ArrowRight`/`Home`/`End`/`PageUp`/
 *   `PageDown` with. Those bigger/edge jumps have no equivalent gesture on
 *   either platform's screen reader, so only single-step increment/decrement
 *   is ported.
 * - Optional tick marks with labels.
 * - Fills the track from the left up to the thumb (accent colour).
 *
 * RN's `transform` only accepts pixel offsets, not the CSS `%` units the
 * web version's `left: X%; transform: translate(-50%, -50%)` centering
 * trick relies on — so the thumb and tick marks are positioned with a
 * plain pixel `left` (`(pct / 100) * trackWidth - size / 2`, measured via
 * `onLayout`) instead, and vertical centering comes from the track's own
 * `justifyContent: 'center'` rather than a transform.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/sliders.html
 */
export const Slider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  marks,
  accessibilityLabel,
  style,
  onLayout,
  ...viewProps
}: SliderProps) => {
  const theme = useGnomeTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const [labelWidths, setLabelWidths] = useState<Record<number, number>>({});

  const dp = countDecimals(step);
  const clamped = clamp(value, min, max);
  const pct = ((clamped - min) / (max - min)) * 100;

  const handleTrackLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setTrackWidth(event.nativeEvent.layout.width);
      onLayout?.(event);
    },
    [onLayout],
  );

  const commit = useCallback(
    (locationX: number) => {
      if (disabled || trackWidth <= 0) {
        return;
      }

      const raw = (locationX / trackWidth) * (max - min) + min;

      onChange(clamp(snapToStep(raw, min, step, dp), min, max));
    },
    [disabled, trackWidth, min, max, step, dp, onChange],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (event: GestureResponderEvent) => commit(event.nativeEvent.locationX),
        onPanResponderMove: (event: GestureResponderEvent) => commit(event.nativeEvent.locationX),
      }),
    [disabled, commit],
  );

  const handleAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      if (disabled) {
        return;
      }

      switch (event.nativeEvent.actionName) {
        case 'increment':
          onChange(clamp(snapToStep(value + step, min, step, dp), min, max));
          break;
        case 'decrement':
          onChange(clamp(snapToStep(value - step, min, step, dp), min, max));
          break;
      }
    },
    [disabled, value, step, min, max, dp, onChange],
  );

  const hasMarks = marks && marks.length > 0;
  const hasLabels = hasMarks && marks.some((m) => m.label);

  const thumbLeft = (pct / 100) * trackWidth - THUMB_SIZE / 2;

  return (
    <View
      style={[{ width: '100%', paddingTop: 10, paddingBottom: hasLabels ? 0 : 10 }, style]}
      {...viewProps}
    >
      <View
        onLayout={handleTrackLayout}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min, max, now: clamped }}
        accessibilityState={{ disabled }}
        accessibilityActions={[
          { name: 'increment', label: 'increment' },
          { name: 'decrement', label: 'decrement' },
        ]}
        onAccessibilityAction={handleAccessibilityAction}
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
              height: '100%',
              width: `${pct}%`,
              borderRadius: theme.radiusPill,
              backgroundColor: theme.accentBgColor,
            }}
          />
        </View>

        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: thumbLeft,
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
              // Positioned by a pixel `left` computed from the label's own
              // measured width (0 until its first `onLayout`, so it starts
              // left-aligned to the mark and snaps to centered a frame
              // later) — a zero-width `View` with `alignItems: 'center'`
              // was tried first hoping Yoga would center an overflowing
              // child around it the way a CSS `%`-of-self `transform:
              // translateX(-50%)` does, but the iOS Simulator screenshot
              // check (never skip it) showed the labels not rendering at
              // all, so self-measurement replaced it.
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
