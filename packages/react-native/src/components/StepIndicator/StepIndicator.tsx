import { Check } from '@gnome-ui/icons';
import { useEffect, useRef } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Animated, Easing, Pressable, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useGnomeTheme, useResolvedContrast } from '@/GnomeProvider';

export type StepIndicatorOrientation = 'horizontal' | 'vertical';

export interface StepIndicatorProps {
  /**
   * Total number of steps, or an array of per-step labels rendered beside
   * (vertical) or beneath (horizontal) each circle. Pass a plain number for
   * an unlabelled sequence (only the "Step X of Y" caption is shown); pass
   * an array of strings to label each step.
   */
  steps: number | string[];
  /** Zero-based index of the current/active step. */
  currentStep: number;
  /** Layout direction. Default: `"horizontal"`. */
  orientation?: StepIndicatorOrientation;
  /**
   * Called when a completed step's circle is pressed, letting the user jump
   * back to a step they've already finished. Omit to make steps
   * non-interactive. The current and upcoming steps are never pressable.
   */
  onStepClick?: (index: number) => void;
  /** Accessible label for the indicator. Default: `"Progress"`. */
  label?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const CIRCLE_SIZE = 28;
const CONNECTOR_THICKNESS = 2;
/** Matches `@gnome-ui/react`'s `.stepItem::after { inset-block-start: 14px }` (horizontal). */
const HORIZONTAL_CONNECTOR_TOP = 14;
/** Matches the vertical `::after`'s `inset-inline-start`/`inset-block-start`. */
const VERTICAL_CONNECTOR_LEFT = 14;
const VERTICAL_CONNECTOR_TOP = 30;

interface StepCircleProps {
  index: number;
  label?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  onStepClick?: (index: number) => void;
}

/**
 * One step's circle — its own component (not inlined in the parent's
 * `.map()`) purely so each circle owns an independent pair of
 * `Animated.Value`s, the same "each item animates itself" shape
 * `AvatarRotator`'s `RotatorLayer` already established for a
 * variable-length, data-driven list.
 */
const StepCircle = ({ index, label, isCompleted, isCurrent, onStepClick }: StepCircleProps) => {
  const theme = useGnomeTheme();
  const contrast = useResolvedContrast();
  const clickable = Boolean(onStepClick) && isCompleted;

  // Two independent 0/1 progress values rather than one three-state value:
  // "accented" (border) is true for current OR completed, "filled"
  // (background) only for current — they change on different transitions
  // (upcoming→current flips both; current→completed flips only "filled").
  const accentProgress = useRef(new Animated.Value(isCompleted || isCurrent ? 1 : 0)).current;
  const fillProgress = useRef(new Animated.Value(isCurrent ? 1 : 0)).current;
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const [x1, y1, x2, y2] = theme.easingDefault;
    const easing = Easing.bezier(x1, y1, x2, y2);

    Animated.timing(accentProgress, {
      toValue: isCompleted || isCurrent ? 1 : 0,
      duration: theme.durationFast,
      easing,
      useNativeDriver: false,
    }).start();

    Animated.timing(fillProgress, {
      toValue: isCurrent ? 1 : 0,
      duration: theme.durationFast,
      easing,
      useNativeDriver: false,
    }).start();
  }, [
    isCompleted,
    isCurrent,
    accentProgress,
    fillProgress,
    theme.durationFast,
    theme.easingDefault,
  ]);

  const borderColor = accentProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.borderSubtle, theme.accentBgColor],
  });
  const backgroundColor = fillProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.viewBgColor, theme.accentBgColor],
  });

  const accessibilityLabel = label ?? `Step ${index + 1}`;

  const circleStyle: Animated.WithAnimatedValue<ViewStyle> = {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radiusPill,
    borderWidth: contrast === 'more' ? 3 : 2,
    borderColor,
    backgroundColor,
  };

  const content = isCompleted ? (
    // `tintColor`, not `color`, since RN has no `currentColor` to inherit
    // from the circle the way the web icon does — same call BottomTabBar's
    // active-tab icon already made for tracking the *configurable* accent.
    <Icon icon={Check} size="sm" tintColor={theme.accentBgColor} />
  ) : (
    <Text
      variant="caption"
      style={{
        color: isCurrent ? '#fff' : theme.windowFgColor,
        fontWeight: String(theme.fontWeightSemibold) as TextStyle['fontWeight'],
      }}
    >
      {index + 1}
    </Text>
  );

  if (clickable) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() => onStepClick?.(index)}
      >
        <Animated.View style={circleStyle}>{content}</Animated.View>
      </Pressable>
    );
  }

  return (
    <Animated.View
      accessible
      accessibilityState={{ selected: isCurrent }}
      accessibilityLabel={accessibilityLabel}
      style={circleStyle}
    >
      {content}
    </Animated.View>
  );
};

/**
 * Numbered "Step X of Y" progress indicator for onboarding/wizard flows —
 * mirrors `@gnome-ui/react`'s `StepIndicator`. Directly portable per this
 * package's own ROADMAP note: no web-only APIs are involved, just derived
 * dot/number state from `currentStep`.
 *
 * The outer container sets `role="navigation"` **without** `accessible` —
 * the corrected pattern `ToggleGroup` established over the earlier
 * `BoxedList`/`ViewSwitcher` precedent: `accessible` on a *grouping*
 * container with multiple independently-focusable children (each step
 * circle here) collapses the whole subtree into one VoiceOver stop on iOS.
 * The role still groups on Android, and every step stays individually
 * reachable; assert `element.props.role` on a `testID` in tests instead of
 * `getByRole('navigation')`.
 *
 * The connecting line between circles reuses the exact CSS trick verbatim
 * (`position: absolute; left: 50%; width: 100%` inside each equal-width
 * flex item, so the line runs from one circle's center to the next's) —
 * `left`/`width` percentages are supported for RN position/dimension
 * props, unlike the `transform: translateX('50%')` trick this package has
 * hit real bugs with elsewhere (that limitation is specific to `transform`).
 *
 * The web version's checkmark/number content swap and connector-line color
 * change have no CSS `transition` at all (only `.circle`'s own
 * `background-color`/`border-color` do), so only those two colors animate
 * here — the content swap and connector recolor are instant, matching the
 * source exactly rather than adding an unrequested fade.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.StepIndicator.html
 */
export const StepIndicator = ({
  steps,
  currentStep,
  orientation = 'horizontal',
  onStepClick,
  label = 'Progress',
  style,
  testID,
}: StepIndicatorProps) => {
  const theme = useGnomeTheme();
  const isVertical = orientation === 'vertical';

  const stepLabels = Array.isArray(steps) ? steps : undefined;
  const stepCount = Array.isArray(steps) ? steps.length : steps;
  const clampedCurrent = Math.max(0, Math.min(currentStep, stepCount - 1));

  return (
    <View
      testID={testID}
      role="navigation"
      accessibilityLabel={label}
      style={[{ gap: theme.space2 }, style]}
    >
      {!stepLabels && (
        <Text
          variant="caption"
          color="dim"
          style={{ fontWeight: String(theme.fontWeightSemibold) as TextStyle['fontWeight'] }}
        >
          {`Step ${clampedCurrent + 1} of ${stepCount}`}
        </Text>
      )}

      <View
        style={{
          flexDirection: isVertical ? 'column' : 'row',
          alignItems: isVertical ? 'stretch' : 'flex-start',
        }}
      >
        {Array.from({ length: stepCount }, (_, i) => {
          const isCompleted = i < clampedCurrent;
          const isCurrent = i === clampedCurrent;
          const isLast = i === stepCount - 1;
          const stepLabel = stepLabels?.[i];
          const connectorColor = isCompleted ? theme.accentBgColor : theme.borderSubtle;

          return (
            <View
              key={i}
              style={
                isVertical
                  ? {
                      position: 'relative',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      paddingBottom: isLast ? 0 : theme.space3,
                    }
                  : {
                      position: 'relative',
                      flex: 1,
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: theme.space1,
                    }
              }
            >
              {!isLast && (
                <View
                  pointerEvents="none"
                  style={
                    isVertical
                      ? {
                          position: 'absolute',
                          left: VERTICAL_CONNECTOR_LEFT,
                          top: VERTICAL_CONNECTOR_TOP,
                          width: CONNECTOR_THICKNESS,
                          height: '100%',
                          backgroundColor: connectorColor,
                          zIndex: -1,
                        }
                      : {
                          position: 'absolute',
                          left: '50%',
                          top: HORIZONTAL_CONNECTOR_TOP,
                          width: '100%',
                          height: CONNECTOR_THICKNESS,
                          backgroundColor: connectorColor,
                          zIndex: -1,
                        }
                  }
                />
              )}

              <StepCircle
                index={i}
                label={stepLabel}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                onStepClick={onStepClick}
              />

              {stepLabel && (
                <Text
                  variant="caption"
                  numberOfLines={isVertical ? undefined : 1}
                  ellipsizeMode={isVertical ? undefined : 'tail'}
                  style={[
                    isVertical
                      ? { paddingLeft: theme.space2, textAlign: 'left' as const }
                      : { maxWidth: 96, textAlign: 'center' as const },
                    isCurrent && {
                      fontWeight: String(theme.fontWeightSemibold) as TextStyle['fontWeight'],
                    },
                  ]}
                >
                  {stepLabel}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};
