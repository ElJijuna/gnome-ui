import { PanDown } from '@gnome-ui/icons';
import { Children, forwardRef, type ReactNode, useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import { Animated, Easing, Pressable, View as RNView } from 'react-native';

import { Icon } from '@/components/Icon';
import { Separator } from '@/components/Separator';
import { Text } from '@/components/Text';
import { useGnomeTheme, useReducedMotion } from '@/GnomeProvider';

export interface ExpanderRowProps {
  /** Primary label. */
  title: string;
  /** Secondary line below the title. */
  subtitle?: string;
  /** Icon or image placed at the leading edge of the header row. */
  leading?: ReactNode;
  /**
   * Widget placed at the trailing edge of the header row, before the
   * chevron (e.g. a value label or a `Switch`). Stop event propagation
   * inside it so the row's toggle isn't triggered.
   */
  trailing?: ReactNode;
  /**
   * Nested rows revealed when expanded. Use `ActionRow`, `ButtonRow`, or
   * any row-shaped element — separators are inserted automatically.
   */
  children?: ReactNode;
  /** Controlled expanded state. */
  expanded?: boolean;
  /** Initial expanded state when uncontrolled. Defaults to `false`. */
  defaultExpanded?: boolean;
  /** Called when the expanded state changes. */
  onExpandedChange?: (expanded: boolean) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Collapsible `ActionRow` that reveals nested rows on activation, mirroring
 * `@gnome-ui/react`'s `ExpanderRow`. The header row toggles a smooth reveal
 * animation exposing child rows. Supports both controlled (`expanded`) and
 * uncontrolled (`defaultExpanded`) modes.
 *
 * The reveal panel reuses the standalone `Expander`'s exact recipe — a
 * single `Animated.View` with a directly-driven numeric `height` (RN has no
 * CSS grid to lean on for the web version's `grid-template-rows: 0fr → 1fr`
 * trick), content staying mounted while collapsed
 * (`accessibilityElementsHidden`/`importantForAccessibility` standing in
 * for the web's `inert`), and the "show natural height until first
 * `onLayout` measurement lands, then hand control to `Animated`" guard for
 * a `defaultExpanded` initial mount. The only difference from `Expander`
 * itself: the chevron is `PanDown` (a straight down-arrow, matching the
 * source CSS's hand-drawn `M4 6l4 4 4-4` path and rotating 0deg → 180deg)
 * rather than `Expander`'s `PanEnd` triangle rotating 0deg → 90deg — the
 * same icon/rotation pair `Dropdown`'s own chevron already established.
 *
 * Nested children get a `Separator` inserted before each one (including
 * the first, directly under the header) via `Children.toArray(children)
 * .filter(Boolean)`, the same falsy-child-filtering `ExpanderRow`'s web
 * version already does. Unlike `CheckRow`/`ButtonRow`, this component has
 * no `disabled` prop — the source `@gnome-ui/react` version doesn't expose
 * one either, so none is added here.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ExpanderRow.html
 */
export const ExpanderRow = forwardRef<View, ExpanderRowProps>(function ExpanderRow(
  {
    title,
    subtitle,
    leading,
    trailing,
    children,
    expanded: controlledExpanded,
    defaultExpanded = false,
    onExpandedChange,
    style,
    testID,
  },
  ref,
) {
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
  const rotate = chevronAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const childItems = Children.toArray(children).filter(Boolean);

  return (
    <RNView ref={ref} testID={testID} style={[{ width: '100%' }, style]}>
      <Pressable
        role="button"
        accessibilityState={{ expanded }}
        onPress={toggle}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.space2,
          paddingVertical: theme.space2,
          paddingHorizontal: theme.space4,
          minHeight: 52,
          width: '100%',
          backgroundColor: pressed ? theme.activeOverlay : 'transparent',
        })}
      >
        {leading && <RNView style={{ flexShrink: 0 }}>{leading}</RNView>}

        <RNView style={{ flex: 1, gap: 2 }}>
          <Text
            variant="body"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: theme.cardFgColor,
              fontWeight: String(theme.fontWeightNormal) as TextStyle['fontWeight'],
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text variant="caption" color="dim" numberOfLines={1} ellipsizeMode="tail">
              {subtitle}
            </Text>
          )}
        </RNView>

        {trailing && (
          <RNView
            style={{ flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: theme.space1 }}
          >
            {trailing}
          </RNView>
        )}

        <Animated.View style={{ opacity: 0.55, transform: [{ rotate }] }}>
          <Icon icon={PanDown} size="md" />
        </Animated.View>
      </Pressable>

      <Animated.View
        style={{ height: showsNaturalHeight ? undefined : heightAnim, overflow: 'hidden' }}
        accessibilityElementsHidden={!expanded}
        importantForAccessibility={expanded ? 'yes' : 'no'}
      >
        <RNView accessible role="region" onLayout={handleContentLayout}>
          {childItems.map((child, i) => (
            <RNView key={i}>
              <Separator testID="expander-row-separator" />
              {child}
            </RNView>
          ))}
        </RNView>
      </Animated.View>
    </RNView>
  );
});
