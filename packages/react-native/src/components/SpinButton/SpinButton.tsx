import { useCallback } from 'react';
import type { AccessibilityActionEvent, StyleProp, ViewStyle } from 'react-native';
import { Pressable, Text, View } from 'react-native';

import { useGnomeTheme } from '@/GnomeProvider';

const BTN_SIZE = 36;

export interface SpinButtonProps {
  /** Current value. */
  value: number;
  /** Called when the value changes. */
  onChange: (value: number) => void;
  /** Minimum allowed value. Defaults to `0`. */
  min?: number;
  /** Maximum allowed value. Defaults to `100`. */
  max?: number;
  /** Amount to increment/decrement per step. Defaults to `1`. */
  step?: number;
  /** Number of decimal places shown. Derived from `step` when omitted. */
  decimals?: number;
  /**
   * Wrap around instead of clamping at the edges — stepping past `max` returns
   * to `min` and vice versa, and the −/+ buttons never disable. Mirrors
   * `GtkSpinButton:wrap`; used for cyclic values like hours and minutes.
   */
  wrap?: boolean;
  /**
   * Custom display formatter for the current value (e.g. zero-padding, or
   * mapping a numeric value to `AM`/`PM`). Defaults to fixed-decimal text. When
   * provided, its result is also exposed as the accessibility value's `text`.
   */
  format?: (value: number) => string;
  /** Disables the control. */
  disabled?: boolean;
  /** Accessible label. Required — RN has no visible-label association to fall back on. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

function countDecimals(n: number): number {
  const s = n.toString();
  const dot = s.indexOf('.');

  return dot === -1 ? 0 : s.length - dot - 1;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function wrapValue(value: number, min: number, max: number, step: number): number {
  const range = max - min + step;
  return ((((value - min) % range) + range) % range) + min;
}

/**
 * Numeric input with − and + buttons following the Adwaita `GtkSpinButton` style.
 *
 * Rebuilt with `View`/`Pressable`/`Text` rather than ported from
 * `@gnome-ui/react`'s DOM-based JSX, but mirrors its prop API and clamp/wrap/
 * decimal math (pure JS, ported verbatim).
 *
 * The primary interaction is tapping the visible −/+ buttons, same as a
 * sighted mouse user on the web version. The web version's keyboard
 * interaction (↑/↓ one step, Page Up/Down ten steps, Home/End to bounds) has
 * no RN equivalent — a touch-first device has no keyboard to drive it, the
 * same reasoning `Slider` already applied. Rather than dropping value
 * adjustment accessibility entirely, single-step increment/decrement is
 * wired through `accessibilityRole="adjustable"` + `onAccessibilityAction`
 * (VoiceOver's swipe-up/down, TalkBack's local-context menu), reusing the
 * exact recipe `Slider` already proved works — the bigger Page Up/Down and
 * Home/End jumps have no equivalent screen-reader gesture on either
 * platform, so those alone are dropped, same as `Slider`. The visible
 * buttons are hidden from the accessibility tree (mirrors the web version's
 * `aria-hidden`/`tabIndex={-1}` on both `<button>`s) so a screen reader user
 * gets one adjustable stop, not three.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/spin-buttons.html
 */
export const SpinButton = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  decimals,
  wrap = false,
  format,
  disabled = false,
  accessibilityLabel,
  style,
}: SpinButtonProps) => {
  const theme = useGnomeTheme();
  const dp = decimals ?? countDecimals(step);

  const set = useCallback(
    (next: number) => {
      const bounded = wrap ? wrapValue(next, min, max, step) : clamp(next, min, max);
      onChange(parseFloat(bounded.toFixed(dp)));
    },
    [onChange, min, max, step, dp, wrap],
  );

  const displayText = format ? format(value) : value.toFixed(dp);

  const handleAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      if (disabled) {
        return;
      }

      switch (event.nativeEvent.actionName) {
        case 'increment':
          set(value + step);
          break;
        case 'decrement':
          set(value - step);
          break;
      }
    },
    [disabled, value, step, set],
  );

  const decrementDisabled = disabled || (!wrap && value <= min);
  const incrementDisabled = disabled || (!wrap && value >= max);

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: value, text: format ? displayText : undefined }}
      accessibilityState={{ disabled }}
      accessibilityActions={[
        { name: 'increment', label: 'increment' },
        { name: 'decrement', label: 'decrement' },
      ]}
      onAccessibilityAction={handleAccessibilityAction}
      style={[
        {
          flexDirection: 'row',
          alignSelf: 'flex-start',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.cardShadeColor,
          borderRadius: theme.radiusMd,
          backgroundColor: theme.viewBgColor,
          overflow: 'hidden',
          opacity: disabled ? theme.opacityDisabled : 1,
        },
        style,
      ]}
    >
      <Pressable
        accessibilityElementsHidden
        importantForAccessibility="no"
        disabled={decrementDisabled}
        onPress={() => set(value - step)}
        style={({ pressed }) => ({
          width: BTN_SIZE,
          height: BTN_SIZE,
          alignItems: 'center',
          justifyContent: 'center',
          borderRightWidth: 1,
          borderRightColor: theme.cardShadeColor,
          backgroundColor: pressed && !decrementDisabled ? theme.activeOverlay : 'transparent',
          opacity: decrementDisabled ? theme.opacityDisabled : 1,
        })}
      >
        <Text style={{ fontSize: 17, lineHeight: 20, color: theme.viewFgColor }}>−</Text>
      </Pressable>

      <Text
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={{
          minWidth: 56,
          textAlign: 'center',
          paddingHorizontal: theme.space2,
          fontFamily: theme.fontFamily,
          fontSize: theme.fontSizeBody,
          fontVariant: ['tabular-nums'],
          color: theme.viewFgColor,
        }}
      >
        {displayText}
      </Text>

      <Pressable
        accessibilityElementsHidden
        importantForAccessibility="no"
        disabled={incrementDisabled}
        onPress={() => set(value + step)}
        style={({ pressed }) => ({
          width: BTN_SIZE,
          height: BTN_SIZE,
          alignItems: 'center',
          justifyContent: 'center',
          borderLeftWidth: 1,
          borderLeftColor: theme.cardShadeColor,
          backgroundColor: pressed && !incrementDisabled ? theme.activeOverlay : 'transparent',
          opacity: incrementDisabled ? theme.opacityDisabled : 1,
        })}
      >
        <Text style={{ fontSize: 17, lineHeight: 20, color: theme.viewFgColor }}>+</Text>
      </Pressable>
    </View>
  );
};
