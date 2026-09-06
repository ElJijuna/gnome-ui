import type { IconDefinition } from '@gnome-ui/icons';
import { Close } from '@gnome-ui/icons';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useGnomeTheme } from '@/GnomeProvider';

export interface ChipProps {
  /** Text label displayed inside the chip. */
  label: string;
  /** Leading icon from `@gnome-ui/icons`. */
  icon?: IconDefinition;
  /**
   * When provided, renders a remove (×) button and calls this handler.
   * The chip root becomes a plain `View`; only the remove button is
   * interactive.
   */
  onRemove?: () => void;
  /**
   * When true the chip renders as a toggle button.
   * Use `selected` + `onToggle` to control its state.
   */
  selectable?: boolean;
  /** Active/selected state. Only relevant when `selectable` is true. */
  selected?: boolean;
  /**
   * Called when a selectable chip is pressed.
   * Only relevant when `selectable` is true.
   */
  onToggle?: () => void;
  /** Disabled state — applies to both selectable chips and the remove button. */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Compact pill-shaped label for tags, filters, and selection states.
 * Mirrors `@gnome-ui/react`'s `Chip`.
 *
 * Three usage modes:
 * - **Static** — just a visual label (no `onRemove`, no `selectable`).
 * - **Removable** — add `onRemove` to show a × button.
 * - **Selectable** — add `selectable` + `selected` + `onToggle` for toggle
 *   behavior. Same `isInteractive = selectable && !onRemove` precedence as
 *   the web version: passing both `selectable` and `onRemove` renders the
 *   remove button, not a toggle.
 *
 * Pair with `WrapBox` for multi-chip layouts.
 *
 * Rebuilt with `Pressable`/`View`/`Text` rather than ported from
 * `@gnome-ui/react`'s `<button>`/`<span>`: the selected background/border
 * tint (`color-mix(in srgb, accent 15%/50%, transparent)`) has no RN
 * equivalent, resolved to a literal 8-digit `#RRGGBBAA` hex instead — the
 * same `Highlight` precedent, since `accentBgColor` is always a plain
 * 6-digit hex. The `:hover`/`:active` background transitions collapse into
 * a single pressed-state overlay tinted by `theme.activeOverlay` (the same
 * `ActionRow`/`Card` recipe), since touch has no hover. The leading icon
 * and remove (×) icon don't recolor to match the selected accent text
 * (`color: inherit` on the web) — RN's `Icon` has no `currentColor`
 * equivalent and only accepts a fixed named-swatch palette, none of which
 * tracks the app's configurable accent color, so both icons stay in the
 * default foreground color; a decorative nicety dropped, not a behavior
 * gap. `accessibilityRole="checkbox"` on the selectable form ports 1:1
 * (the same `Checkbox` precedent).
 *
 * @see https://developer.gnome.org/hig/patterns/selection.html
 */
export const Chip = ({
  label,
  icon,
  onRemove,
  selectable = false,
  selected = false,
  onToggle,
  disabled = false,
  style,
  testID,
}: ChipProps) => {
  const theme = useGnomeTheme();
  const isInteractive = selectable && !onRemove;

  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space1,
    paddingVertical: 3,
    paddingHorizontal: theme.space2,
    borderRadius: theme.radiusPill,
    borderWidth: 1,
    borderColor: selected ? `${theme.accentBgColor}80` : theme.light3,
    backgroundColor: selected ? `${theme.accentBgColor}26` : theme.cardBgColor,
    overflow: 'hidden',
  };

  const labelStyle: TextStyle = {
    color: selected ? theme.accentColor : theme.windowFgColor,
    fontWeight: String(
      selected ? theme.fontWeightSemibold : theme.fontWeightNormal,
    ) as TextStyle['fontWeight'],
  };

  const content = (
    <>
      {icon && (
        <View style={{ marginStart: -2 }}>
          <Icon icon={icon} size="sm" />
        </View>
      )}

      <Text variant="caption" style={labelStyle}>
        {label}
      </Text>

      {onRemove && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
          disabled={disabled}
          onPress={onRemove}
          hitSlop={8}
          style={{ marginEnd: -4, opacity: disabled ? theme.opacityDisabled : 1 }}
        >
          <Icon icon={Close} size="sm" />
        </Pressable>
      )}
    </>
  );

  if (isInteractive) {
    return (
      <Pressable
        testID={testID}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected, disabled }}
        accessibilityLabel={label}
        onPress={onToggle}
        style={[baseStyle, { opacity: disabled ? theme.opacityDisabled : 1 }, style]}
      >
        {({ pressed }) => (
          <>
            {content}
            {pressed && !disabled && (
              <View
                pointerEvents="none"
                style={[StyleSheet.absoluteFill, { backgroundColor: theme.activeOverlay }]}
              />
            )}
          </>
        )}
      </Pressable>
    );
  }

  return (
    <View
      testID={testID}
      style={[baseStyle, { opacity: disabled ? theme.opacityDisabled : 1 }, style]}
    >
      {content}
    </View>
  );
};
