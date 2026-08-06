import { forwardRef, type ReactNode } from 'react';
import type { PressableProps, StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import { Pressable, Text } from 'react-native';

import { useGnomeTheme, useResolvedContrast } from '../../GnomeProvider';
import type { GnomeThemeTokens } from '../../theme';

export type ButtonVariant = 'default' | 'suggested' | 'destructive' | 'flat' | 'raised';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'default' | 'pill' | 'circular';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Visual style of the button. Follows GNOME HIG button types. */
  variant?: ButtonVariant;
  /** Size of the button. */
  size?: ButtonSize;
  /** Shape of the button. "pill" for primary actions in open space, "circular" for icon-only buttons. */
  shape?: ButtonShape;
  /**
   * Dark semi-transparent overlay style for buttons placed on top of media
   * or images — mirrors `@gnome-ui/react`'s `osd` prop.
   */
  osd?: boolean;
  /**
   * Icon placed before the label. Rendered as-is — RN has no CSS
   * `currentColor` equivalent, so size and color it yourself (`theme.*FgColor`
   * from `useGnomeTheme()` matches the resolved label color for each variant).
   */
  leadingIcon?: ReactNode;
  /** Icon placed after the label. See `leadingIcon` for color/size notes. */
  trailingIcon?: ReactNode;
  /** String children render as a themed `Text` label; other nodes render as-is. */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Style applied to the label `Text` when `children` is a string. */
  textStyle?: StyleProp<TextStyle>;
}

interface SizeMetrics {
  minHeight: number;
  minWidth: number;
  paddingVertical: number;
  paddingHorizontal: number;
  fontSize: number;
}

function getSizeMetrics(theme: GnomeThemeTokens, size: ButtonSize): SizeMetrics {
  switch (size) {
    case 'sm':
      return {
        minHeight: 28,
        minWidth: 64,
        paddingVertical: 4,
        paddingHorizontal: theme.space1,
        fontSize: theme.fontSizeCaption,
      };
    case 'lg':
      return {
        minHeight: 42,
        minWidth: 88,
        paddingVertical: theme.space1,
        paddingHorizontal: theme.space3,
        fontSize: theme.fontSizeTitle4,
      };
    default:
      return {
        minHeight: 34,
        minWidth: 88,
        paddingVertical: theme.space1,
        paddingHorizontal: theme.space2,
        fontSize: theme.fontSizeBody,
      };
  }
}

function getCircularSize(size: ButtonSize): number {
  switch (size) {
    case 'sm':
      return 28;
    case 'lg':
      return 42;
    default:
      return 34;
  }
}

interface VariantColors {
  backgroundColor: string;
  borderColor: string;
  color: string;
}

function getVariantColors(
  theme: GnomeThemeTokens,
  variant: ButtonVariant,
  pressed: boolean,
  osd: boolean,
): VariantColors {
  if (osd) {
    return {
      backgroundColor: pressed ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.65)',
      borderColor: 'rgba(255, 255, 255, 0.12)',
      color: 'rgba(255, 255, 255, 0.95)',
    };
  }

  switch (variant) {
    case 'suggested':
      return {
        backgroundColor: theme.accentBgColor,
        borderColor: 'transparent',
        color: theme.accentFgColor,
      };
    case 'destructive':
      return {
        backgroundColor: theme.destructiveBgColor,
        borderColor: 'transparent',
        color: theme.destructiveFgColor,
      };
    case 'flat':
      return {
        backgroundColor: pressed ? theme.activeOverlay : 'transparent',
        borderColor: 'transparent',
        color: theme.windowFgColor,
      };
    default:
      return {
        backgroundColor: pressed ? theme.light3 : theme.cardBgColor,
        borderColor: theme.light3,
        color: theme.windowFgColor,
      };
  }
}

/**
 * Button component following GNOME Human Interface Guidelines.
 *
 * Variants:
 * - `default`     — Standard action, flat appearance with subtle border.
 * - `suggested`   — Affirmative/primary action (accent color). Use at most once per view.
 * - `destructive` — Dangerous or irreversible action (red). Use sparingly.
 * - `flat`        — No border or background; ideal for header bars and toolbars.
 * - `raised`      — Explicit raised look inside flat/toolbar contexts.
 *
 * Rebuilt with `Pressable`/`View`/`Text` rather than ported from
 * `@gnome-ui/react`'s DOM-based JSX, but mirrors its prop API.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/buttons.html
 */
export const Button = forwardRef<View, ButtonProps>(function Button(
  {
    variant = 'default',
    size = 'md',
    shape = 'default',
    osd = false,
    leadingIcon,
    trailingIcon,
    children,
    style,
    textStyle,
    disabled,
    ...pressableProps
  },
  ref,
) {
  const theme = useGnomeTheme();
  const contrast = useResolvedContrast();

  return (
    <Pressable
      ref={ref}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => {
        const { backgroundColor, borderColor } = getVariantColors(theme, variant, pressed, osd);
        const solidVariant = !osd && (variant === 'suggested' || variant === 'destructive');
        const circularSize = shape === 'circular' ? getCircularSize(size) : undefined;
        const { minHeight, minWidth, paddingVertical, paddingHorizontal } = getSizeMetrics(
          theme,
          size,
        );

        return [
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.space1,
            minHeight: circularSize ?? minHeight,
            minWidth: circularSize ?? (shape === 'pill' ? undefined : minWidth),
            width: circularSize,
            height: circularSize,
            paddingVertical: circularSize ? theme.space1 : paddingVertical,
            paddingHorizontal: circularSize
              ? theme.space1
              : shape === 'pill'
                ? theme.space3
                : paddingHorizontal,
            borderRadius: shape === 'default' ? theme.radiusMd : theme.radiusPill,
            borderWidth: variant === 'default' && contrast === 'more' ? 2 : 1,
            borderColor,
            backgroundColor,
            opacity: disabled ? theme.opacityDisabled : pressed && solidVariant ? 0.85 : 1,
          } satisfies ViewStyle,
          style,
        ];
      }}
      {...pressableProps}
    >
      {({ pressed }) => {
        const { fontSize } = getSizeMetrics(theme, size);
        const { color } = getVariantColors(theme, variant, pressed, osd);

        return (
          <>
            {leadingIcon}
            {typeof children === 'string' ? (
              <Text
                style={[
                  {
                    fontFamily: theme.fontFamily,
                    fontWeight: String(theme.fontWeightSemibold) as TextStyle['fontWeight'],
                    fontSize,
                    color,
                  },
                  textStyle,
                ]}
              >
                {children}
              </Text>
            ) : (
              children
            )}
            {trailingIcon}
          </>
        );
      }}
    </Pressable>
  );
});
