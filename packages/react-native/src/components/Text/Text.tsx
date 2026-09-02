import { forwardRef } from 'react';
import type { AccessibilityRole, TextProps as RNTextProps, TextStyle } from 'react-native';
import { Text as RNText } from 'react-native';

import { useGnomeTheme } from '../../GnomeProvider';
import type { GnomeThemeTokens } from '../../theme';

export type TextVariant =
  | 'large-title'
  | 'title-1'
  | 'title-2'
  | 'title-3'
  | 'title-4'
  | 'heading'
  | 'body'
  | 'document'
  | 'caption'
  | 'caption-heading'
  | 'monospace'
  | 'numeric';

export type TextColor =
  | 'default'
  | 'dim'
  | 'accent'
  | 'destructive'
  | 'success'
  | 'warning'
  | 'error';

/**
 * Variants the web component renders as `<h1>`–`<h4>`. RN has no heading
 * elements, so they default to the `header` accessibility role instead —
 * the closest native equivalent, and what VoiceOver/TalkBack use to build
 * their heading rotor.
 */
const HEADING_VARIANTS: ReadonlySet<TextVariant> = new Set<TextVariant>([
  'large-title',
  'title-1',
  'title-2',
  'title-3',
  'title-4',
  'heading',
]);

export interface TextProps extends RNTextProps {
  /** Typography style. Mirrors Adwaita / GNOME HIG text styles. */
  variant?: TextVariant;
  /** Semantic color. */
  color?: TextColor;
  children?: RNTextProps['children'];
}

/**
 * CSS `line-height` ratios and `letter-spacing` `em` values are relative;
 * RN wants absolute dp for both, so they're resolved against the variant's
 * own font size here.
 */
function getVariantStyle(theme: GnomeThemeTokens, variant: TextVariant): TextStyle {
  const weight = (value: number) => String(value) as TextStyle['fontWeight'];

  switch (variant) {
    case 'large-title':
      return {
        fontSize: theme.fontSizeLargeTitle,
        fontWeight: weight(300),
        lineHeight: Math.round(theme.fontSizeLargeTitle * theme.lineHeightHeading),
        letterSpacing: theme.fontSizeLargeTitle * -0.02,
      };
    case 'title-1':
      return {
        fontSize: theme.fontSizeTitle1,
        fontWeight: weight(theme.fontWeightBold),
        lineHeight: Math.round(theme.fontSizeTitle1 * theme.lineHeightHeading),
      };
    case 'title-2':
      return {
        fontSize: theme.fontSizeTitle2,
        fontWeight: weight(theme.fontWeightBold),
        lineHeight: Math.round(theme.fontSizeTitle2 * theme.lineHeightHeading),
      };
    case 'title-3':
      return {
        fontSize: theme.fontSizeTitle3,
        fontWeight: weight(theme.fontWeightBold),
        lineHeight: Math.round(theme.fontSizeTitle3 * theme.lineHeightHeading),
      };
    case 'title-4':
      return {
        fontSize: theme.fontSizeTitle4,
        fontWeight: weight(theme.fontWeightSemibold),
        lineHeight: Math.round(theme.fontSizeTitle4 * theme.lineHeightHeading),
      };
    case 'heading':
      return {
        fontSize: theme.fontSizeBody,
        fontWeight: weight(theme.fontWeightBold),
        lineHeight: Math.round(theme.fontSizeBody * theme.lineHeightHeading),
      };
    case 'document':
      return {
        fontSize: theme.fontSizeBody,
        fontWeight: weight(theme.fontWeightNormal),
        lineHeight: Math.round(theme.fontSizeBody * 1.65),
      };
    case 'caption':
      return {
        fontSize: theme.fontSizeCaption,
        fontWeight: weight(theme.fontWeightNormal),
        lineHeight: Math.round(theme.fontSizeCaption * theme.lineHeightBody),
      };
    case 'caption-heading':
      return {
        fontSize: theme.fontSizeCaption,
        fontWeight: weight(theme.fontWeightSemibold),
        lineHeight: Math.round(theme.fontSizeCaption * theme.lineHeightHeading),
        letterSpacing: theme.fontSizeCaption * 0.06,
        textTransform: 'uppercase',
      };
    case 'monospace':
      return {
        fontFamily: theme.fontFamilyMono,
        fontSize: 14,
        lineHeight: Math.round(14 * theme.lineHeightBody),
      };
    case 'numeric':
      return {
        fontSize: theme.fontSizeBody,
        fontWeight: weight(theme.fontWeightNormal),
        lineHeight: Math.round(theme.fontSizeBody * theme.lineHeightBody),
        fontVariant: ['tabular-nums'],
      };
    default:
      return {
        fontSize: theme.fontSizeBody,
        fontWeight: weight(theme.fontWeightNormal),
        lineHeight: Math.round(theme.fontSizeBody * theme.lineHeightBody),
      };
  }
}

/**
 * `dim` is an opacity in the web stylesheet rather than a color, so it stays
 * an opacity here — that keeps it correct against any background, the same
 * way `.color-dim` does.
 */
function getColorStyle(theme: GnomeThemeTokens, color: TextColor): TextStyle {
  switch (color) {
    case 'dim':
      return { color: theme.windowFgColor, opacity: theme.opacityDim };
    case 'accent':
      return { color: theme.accentColor };
    case 'destructive':
      return { color: theme.destructiveColor };
    case 'success':
      return { color: theme.successColor };
    case 'warning':
      return { color: theme.warningColor };
    case 'error':
      return { color: theme.errorColor };
    default:
      return { color: theme.windowFgColor };
  }
}

/**
 * Text component following GNOME Human Interface Guidelines typography styles.
 *
 * Variants map directly to Adwaita style classes:
 * `large-title`, `title-1`–`title-4`, `heading`, `body`, `document`,
 * `caption`, `caption-heading`, `monospace`, `numeric`.
 *
 * Rebuilt on RN's `Text` rather than ported from `@gnome-ui/react`'s DOM-based
 * JSX: there is no element to pick, so `@gnome-ui/react`'s `as` prop is
 * replaced by `accessibilityRole`, which the heading variants default to
 * `"header"`.
 *
 * @see https://developer.gnome.org/hig/guidelines/typography.html
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/style-classes.html
 */
export const Text = forwardRef<RNText, TextProps>(function Text(
  { variant = 'body', color = 'default', style, children, accessibilityRole, ...textProps },
  ref,
) {
  const theme = useGnomeTheme();
  const role: AccessibilityRole | undefined =
    accessibilityRole ?? (HEADING_VARIANTS.has(variant) ? 'header' : undefined);

  return (
    <RNText
      ref={ref}
      accessibilityRole={role}
      style={[
        { fontFamily: theme.fontFamily },
        getVariantStyle(theme, variant),
        getColorStyle(theme, color),
        style,
      ]}
      {...textProps}
    >
      {children}
    </RNText>
  );
});
