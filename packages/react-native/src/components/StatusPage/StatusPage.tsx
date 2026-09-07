import type { IconDefinition } from '@gnome-ui/icons';
import { forwardRef, type ReactNode } from 'react';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import { View as RNView } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { WrapBox } from '@/components/WrapBox';
import { useGnomeTheme, useResolvedColorScheme } from '@/GnomeProvider';

export interface StatusPageProps extends Omit<ViewProps, 'style'> {
  /**
   * Large icon displayed above the title.
   * Use an icon from `@gnome-ui/icons` or omit for a text-only page.
   */
  icon?: IconDefinition;
  /**
   * Custom icon node. Use when you need an image, emoji, or a rendered
   * SVG that is not part of `@gnome-ui/icons`.
   * Ignored when `icon` is also provided.
   */
  iconNode?: ReactNode;
  /** Main heading. Keep it short — one noun phrase. */
  title: string;
  /** Supporting description rendered below the title. */
  description?: string;
  /**
   * Optional action area — typically one or two `Button`s.
   * Rendered below the description, wrapping onto a second line if needed.
   */
  children?: ReactNode;
  /**
   * Reduces padding, icon size, and title scale for use in compact
   * contexts such as sidebars, popovers, and small panels.
   */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * The description's `max-width: 36ch` has no RN unit to port to. `ch` is
 * the advance width of "0", ≈ 0.5em in the sans faces Adwaita uses, so the
 * cap is resolved against the description's own font size — keeping the
 * measure font-relative the way the CSS is, rather than freezing it at one
 * pixel value that would be wrong in `compact`.
 */
const measureFor = (fontSize: number) => Math.round(36 * 0.5 * fontSize);

/**
 * Empty-state / status page following the Adwaita `AdwStatusPage` pattern,
 * mirroring `@gnome-ui/react`'s own `StatusPage`.
 *
 * Use to fill a view with no content yet, an error state, or a completion
 * confirmation. Always explain *why* the view is empty and *what the user
 * can do* about it — don't use it for loading states, where `Spinner` or
 * `ProgressBar` belong instead.
 *
 * Centres its content on both axes, but — exactly as in the web version —
 * the vertical centring only does anything once a parent gives it height:
 * put it in a `flex: 1` container to fill the view.
 *
 * The title renders through this package's `Text` at `variant="title-1"`
 * (`"title-4"` when `compact`), which means it also picks up `Text`'s
 * automatic `header` accessibility role — a deliberate divergence from the
 * web version's `<p class="title">`. That `<p>` exists because HTML forces
 * you to pick a concrete `h1`–`h6` level for a component that has no idea
 * where it sits in the document outline; RN's `header` role carries no
 * level, so the dilemma disappears and the title can be what it actually
 * is. On a touch device the rotor is the only structural navigation a
 * screen reader user has, so this is worth having.
 *
 * The icon is dimmed by its wrapper's `opacity` (0.55 light / 0.45 dark,
 * the two values the web version's own `@media (prefers-color-scheme)`
 * block hardcodes) and hidden from assistive tech with the
 * `accessibilityElementsHidden` + `importantForAccessibility="no"` pair
 * this package already uses in place of `aria-hidden`. Its color needs no
 * handling at all: `Icon` already defaults to the theme foreground, which
 * is what `.iconWrap`'s `color` sets.
 *
 * The action area is a `WrapBox` rather than a hand-rolled row — `.actions`
 * is `display: flex; flex-wrap: wrap; justify-content: center; gap` and
 * nothing else, which is exactly what that component already is.
 *
 * @example
 * <StatusPage
 *   icon={StarOutline}
 *   title="No favorites yet"
 *   description="Packages you star will show up here."
 * >
 *   <Button variant="suggested" onPress={onAdd}>Add a package</Button>
 * </StatusPage>
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.StatusPage.html
 * @see https://developer.gnome.org/hig/patterns/feedback/empty-states.html
 */
export const StatusPage = forwardRef<View, StatusPageProps>(function StatusPage(
  { icon, iconNode, title, description, children, compact = false, style, ...viewProps },
  ref,
) {
  const theme = useGnomeTheme();
  const colorScheme = useResolvedColorScheme();

  const iconSize = compact ? 64 : 128;
  const iconContent = icon ? <Icon icon={icon} width={iconSize} height={iconSize} /> : iconNode;
  const descriptionFontSize = compact ? theme.fontSizeCaption : theme.fontSizeBody;

  return (
    <RNView
      ref={ref}
      style={[
        {
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: compact ? theme.space3 : theme.space6,
          paddingHorizontal: compact ? theme.space3 : theme.space4,
        },
        style,
      ]}
      {...viewProps}
    >
      {iconContent ? (
        <RNView
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: compact ? theme.space2 : theme.space4,
            opacity: colorScheme === 'dark' ? 0.45 : 0.55,
          }}
        >
          {iconContent}
        </RNView>
      ) : null}

      <Text variant={compact ? 'title-4' : 'title-1'} style={{ textAlign: 'center' }}>
        {title}
      </Text>

      {description ? (
        <Text
          variant={compact ? 'caption' : 'body'}
          color="dim"
          style={{
            textAlign: 'center',
            maxWidth: measureFor(descriptionFontSize),
            marginTop: compact ? theme.space1 : theme.space2,
          }}
        >
          {description}
        </Text>
      ) : null}

      {children ? (
        <WrapBox
          justify="center"
          childSpacing={compact ? theme.space1 : theme.space2}
          style={{ marginTop: compact ? theme.space2 : theme.space4 }}
        >
          {children}
        </WrapBox>
      ) : null}
    </RNView>
  );
});
