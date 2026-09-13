import { Star, StarOutline } from '@gnome-ui/icons';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, View } from 'react-native';

import { Icon, type IconSize } from '@/components/Icon';
import { useGnomeTheme } from '@/GnomeProvider';

export interface RatingStarsProps {
  /** Current rating, between `0` and `max`. */
  value: number;
  /** Number of stars. Defaults to `5`. */
  max?: number;
  /**
   * Called when the user picks a rating. Omit to render a read-only
   * display (e.g. an average rating) instead of an interactive input.
   */
  onChange?: (value: number) => void;
  /** Star size. Defaults to `"md"`. */
  size?: IconSize;
  /** Renders as read-only even when `onChange` is provided. */
  disabled?: boolean;
  /** Accessible label. Defaults to `"Rating"` (interactive) or a generated `"N out of M stars"` (read-only). */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Star rating display and input. Mirrors `@gnome-ui/react`'s `RatingStars`.
 *
 * Renders `role="radiogroup"` of `role="radio"` stars when `onChange` is
 * provided, or a static `role="img"` when it isn't — e.g. for showing an
 * average/read-only rating.
 *
 * The web version's `role="radiogroup"` layer also owns an `onKeyDown`
 * handler for arrow-key roving-tabindex navigation and a mouse-hover
 * preview that doesn't commit until clicked; neither has a touch
 * counterpart, so both drop — same standing convention `ToggleGroup`
 * already established for this package (its own doc comment covers the
 * reasoning). What's left, tapping a star to commit that rating, is a
 * strict subset of the web interaction, not an approximation of it.
 *
 * Each star's fill color is `tintColor={theme.warningBgColor}` rather than
 * `Icon`'s own fixed `color="yellow"` (→ `theme.yellow4`, a different hex):
 * the source CSS reads `var(--gnome-warning-bg-color, #f6d32d)` directly
 * with no `color-mix()` darkening step, so the semantic warning token
 * itself — already tracking dark mode and every contrast level — is the
 * exact match, not an approximation through the fixed palette. Stars carry
 * no `label` on `Icon` (decorative — `iconAccessibilityProps` already hides
 * an unlabeled icon from the tree); the accessible name lives on the
 * container (read-only) or each `Pressable` (interactive) instead, mirroring
 * `ToggleGroupItem`'s icon-only items.
 */
export const RatingStars = ({
  value,
  max = 5,
  onChange,
  size = 'md',
  disabled = false,
  accessibilityLabel,
  style,
  testID,
}: RatingStarsProps) => {
  const theme = useGnomeTheme();
  const interactive = Boolean(onChange) && !disabled;
  const clamped = Math.min(max, Math.max(0, value));
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  if (!interactive) {
    return (
      <View
        testID={testID}
        accessible
        role="img"
        accessibilityLabel={accessibilityLabel ?? `${clamped} out of ${max} stars`}
        style={[{ flexDirection: 'row', alignItems: 'center', gap: 2 }, style]}
      >
        {stars.map((star) => (
          <Icon
            key={star}
            icon={star <= clamped ? Star : StarOutline}
            size={size}
            tintColor={theme.warningBgColor}
          />
        ))}
      </View>
    );
  }

  return (
    <View
      testID={testID}
      role="radiogroup"
      accessibilityLabel={accessibilityLabel ?? 'Rating'}
      style={[{ flexDirection: 'row', alignItems: 'center', gap: 2 }, style]}
    >
      {stars.map((star) => (
        <Pressable
          key={star}
          role="radio"
          accessibilityState={{ checked: star === clamped }}
          accessibilityLabel={`${star} ${star === 1 ? 'star' : 'stars'}`}
          onPress={() => onChange?.(star)}
          style={{ padding: 2, borderRadius: theme.radiusSm }}
        >
          <Icon
            icon={star <= clamped ? Star : StarOutline}
            size={size}
            tintColor={theme.warningBgColor}
          />
        </Pressable>
      ))}
    </View>
  );
};
