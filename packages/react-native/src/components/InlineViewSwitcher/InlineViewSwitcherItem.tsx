import type { IconDefinition } from '@gnome-ui/icons';
import { forwardRef, useCallback } from 'react';
import type { LayoutChangeEvent, PressableProps, View } from 'react-native';
import { Pressable, Text as RNText } from 'react-native';

import { Icon } from '@/components/Icon';
import { useGnomeTheme } from '@/GnomeProvider';

import { useInlineViewSwitcher } from './InlineViewSwitcher';
import { labelTextStyle } from './variants';

export interface InlineViewSwitcherItemProps
  extends Omit<PressableProps, 'children' | 'style' | 'disabled' | 'onPress'> {
  /** String identifier — becomes the switcher's `value` when this item is active. */
  name: string;
  /** Visible label. */
  label?: string;
  /** Icon from `@gnome-ui/icons`. */
  icon?: IconDefinition;
  /** Accessible name. Required for icon-only items; defaults to `label`. */
  accessibilityLabel?: string;
  disabled?: boolean;
}

/**
 * Individual view option inside an `InlineViewSwitcher`. Can be icon-only,
 * label-only, or icon + label — for icon-only items always pass an
 * `accessibilityLabel` so screen readers can identify the view.
 *
 * The item paints no background of its own for the active state: that's the
 * parent's sliding indicator, which this component feeds by reporting its
 * `onLayout` position and width up through the context. Only the label's
 * color and weight change, exactly as in the web version — where the
 * `.active` class also sets nothing but `color` and `font-weight`.
 */
export const InlineViewSwitcherItem = forwardRef<View, InlineViewSwitcherItemProps>(
  function InlineViewSwitcherItem(
    { name, label, icon, accessibilityLabel, disabled = false, ...pressableProps },
    ref,
  ) {
    const theme = useGnomeTheme();
    const { value, onValueChange, compact, styles, onItemLayout } = useInlineViewSwitcher();

    const active = value === name;
    // In compact mode the label collapses, but only when an icon can stand
    // in for it — ported verbatim from the web fallback.
    const showLabel = Boolean(label) && !(compact && icon);
    const iconOnly = Boolean(icon) && !showLabel;

    const handleLayout = useCallback(
      (event: LayoutChangeEvent) => {
        const { x, width } = event.nativeEvent.layout;

        onItemLayout(name, { x, width });
      },
      [name, onItemLayout],
    );

    return (
      <Pressable
        ref={ref}
        disabled={disabled}
        onPress={() => onValueChange(name)}
        onLayout={handleLayout}
        accessibilityRole="radio"
        accessibilityState={{ checked: active, disabled }}
        accessibilityLabel={accessibilityLabel ?? label}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.space1,
            minHeight: 28,
            paddingVertical: 4,
            opacity: disabled ? theme.opacityDisabled : 1,
          },
          styles.item,
          iconOnly ? styles.iconOnlyItem : null,
        ]}
        {...pressableProps}
      >
        {icon ? <Icon icon={icon} size="md" /> : null}

        {showLabel ? (
          <RNText
            numberOfLines={1}
            style={labelTextStyle(
              theme,
              active,
              active ? styles.activeTextColor : styles.idleTextColor,
            )}
          >
            {label}
          </RNText>
        ) : null}
      </Pressable>
    );
  },
);

InlineViewSwitcherItem.displayName = 'InlineViewSwitcherItem';
