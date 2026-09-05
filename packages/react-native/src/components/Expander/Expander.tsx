import { PanEnd } from '@gnome-ui/icons';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { Animated, Easing, Pressable, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useGnomeTheme, useReducedMotion } from '@/GnomeProvider';

export interface ExpanderProps {
  /** Clickable header label. String children render as a themed `Text` label; other nodes render as-is. */
  label: ReactNode;
  /** Content revealed when expanded. */
  children?: ReactNode;
  /** Controlled expanded state. */
  expanded?: boolean;
  /** Initial expanded state when uncontrolled. Defaults to `false`. */
  defaultExpanded?: boolean;
  /** Called when the expanded state changes. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Disables the toggle. */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Standalone disclosure triangle + collapsible content — mirrors
 * `GtkExpander` and `@gnome-ui/react`'s `Expander`.
 *
 * A bare, unstyled counterpart to `ExpanderRow`. Use `Expander` outside a
 * settings-row context, e.g. "Show advanced options" in a form, or "Show
 * details" under an error message.
 *
 * The web version clips the panel with a CSS grid-height animation and
 * rides the content's `padding-top` on a second, separate transition (so a
 * collapsed expander doesn't reserve blank space for padding that belongs
 * to hidden content). RN has no CSS grid to lean on, so the panel is a
 * single `Animated.View` whose numeric `height` is driven directly —
 * `useNativeDriver: false`, the same accepted (and documented) trade-off
 * `Checkbox`/`RadioButton`/`Switch`/`AnimatedIcon` already make for
 * non-transform properties. Because the inner content `View`'s `onLayout`
 * measurement already includes its own `paddingTop`, animating that single
 * height value reproduces the web version's two-transition result with one
 * `Animated.Value` instead of two. Content stays mounted while collapsed
 * (matching the web version's `inert`, unmounted-from-the-tab-order-only
 * behavior) — `accessibilityElementsHidden` / `importantForAccessibility`
 * is RN's closest equivalent, applied to the panel wrapper.
 *
 * On first mount with `defaultExpanded`, the panel briefly renders at its
 * natural (unmeasured) height instead of the animated value, so the initial
 * reveal doesn't start from a wrong, pre-measurement `0` and pop once
 * `onLayout` resolves — the same "let layout report the truth once, then
 * hand control to `Animated`" shape `Dropdown`/`Tooltip` use for their own
 * `onLayout`-measured dimensions.
 *
 * The chevron is `PanEnd` (GNOME's own `pan-end-symbolic` disclosure
 * triangle) rather than a chevron glyph, matching the web version's
 * hand-drawn arrow shape. It rotates 0deg → 90deg on an `Animated.Value`
 * (the same `interpolate`-to-`rotate` recipe `Spinner` uses for its own
 * indeterminate spin), unlike `Dropdown`'s chevron, which snaps instantly
 * since that panel's own reveal has no comparable "settle" affordance.
 *
 * `role="region"` on the panel and `accessibilityState={{ expanded }}` on
 * the header port 1:1 from the web version's `aria-controls`/`aria-expanded`
 * pair — RN has no DOM ids, so the id-based `aria-labelledby`/`aria-controls`
 * relationship itself has no port, the same `ProgressBar`/`LevelBar`
 * precedent for dropping id-relationship-only ARIA props.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Expander.html
 */
export const Expander = ({
  label,
  children,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  disabled = false,
  style,
  testID,
}: ExpanderProps) => {
  const theme = useGnomeTheme();
  const reducedMotion = useReducedMotion();

  const isControlled = controlledExpanded !== undefined;
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const expanded = isControlled ? controlledExpanded : uncontrolledExpanded;

  const [contentHeight, setContentHeight] = useState(0);
  const hasMeasured = useRef(false);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const chevronAnim = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  const toggle = () => {
    if (disabled) {
      return;
    }

    const next = !expanded;

    if (!isControlled) {
      setUncontrolledExpanded(next);
    }

    onExpandedChange?.(next);
  };

  const handleContentLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;

    if (h === contentHeight) {
      hasMeasured.current = true;

      return;
    }

    if (expanded && !hasMeasured.current) {
      heightAnim.setValue(h);
    }

    hasMeasured.current = true;
    setContentHeight(h);
  };

  useEffect(() => {
    const [x1, y1, x2, y2] = theme.easingDefault;
    const easing = Easing.bezier(x1, y1, x2, y2);
    const target = expanded ? contentHeight : 0;

    if (reducedMotion) {
      heightAnim.setValue(target);
      chevronAnim.setValue(expanded ? 1 : 0);

      return;
    }

    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: target,
        duration: theme.durationNormal,
        easing,
        useNativeDriver: false,
      }),
      Animated.timing(chevronAnim, {
        toValue: expanded ? 1 : 0,
        duration: theme.durationFast,
        easing,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    expanded,
    contentHeight,
    reducedMotion,
    heightAnim,
    chevronAnim,
    theme.durationNormal,
    theme.durationFast,
    theme.easingDefault,
  ]);

  const showsNaturalHeight = expanded && !hasMeasured.current;
  const rotate = chevronAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });

  return (
    <View testID={testID} style={[{ width: '100%' }, style]}>
      <Pressable
        role="button"
        disabled={disabled}
        accessibilityState={{ expanded, disabled }}
        onPress={toggle}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: theme.space2,
          padding: theme.space1,
          margin: -theme.space1,
          borderRadius: theme.radiusSm,
          backgroundColor: pressed ? theme.activeOverlay : 'transparent',
          opacity: disabled ? theme.opacityDisabled : 1,
        })}
      >
        <Animated.View style={{ opacity: 0.55, transform: [{ rotate }] }}>
          <Icon icon={PanEnd} size="md" />
        </Animated.View>

        {typeof label === 'string' ? (
          <Text style={{ color: theme.windowFgColor }}>{label}</Text>
        ) : (
          label
        )}
      </Pressable>

      <Animated.View
        style={{ height: showsNaturalHeight ? undefined : heightAnim, overflow: 'hidden' }}
        accessibilityElementsHidden={!expanded}
        importantForAccessibility={expanded ? 'yes' : 'no'}
      >
        <View
          accessible
          role="region"
          onLayout={handleContentLayout}
          style={{ paddingTop: theme.space2 }}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
};
