import { Children, forwardRef, type ReactNode } from 'react';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import { View as RNView } from 'react-native';

import { Separator } from '@/components/Separator';
import { useGnomeTheme } from '@/GnomeProvider';

export type BoxedListVariant = 'default' | 'separate';

export interface BoxedListProps extends Omit<ViewProps, 'style'> {
  children?: ReactNode;
  /**
   * `"separate"` renders each child as its own standalone rounded card
   * instead of a single joined list — mirrors `.boxed-list-separate`.
   * Use when rows are independent items rather than a continuous group.
   */
  variant?: BoxedListVariant;
  style?: StyleProp<ViewStyle>;
}

/**
 * Rounded bordered list — the most common container pattern in GNOME apps.
 *
 * Mirrors the Adwaita `.boxed-list` style applied to a `GtkListBox`.
 * Separators between rows are inserted automatically. Pair with `ActionRow`
 * or any row-shaped element.
 *
 * Rebuilt with `View` rather than ported from `@gnome-ui/react`'s
 * `<ul>`/`<li>` — RN has no list-semantics elements, so the outer `View`
 * gets `accessibilityRole="list"` (there's no RN equivalent of `listitem`
 * for rows), paired with `accessible` — a plain `View` isn't an
 * accessibility element by default, so without it screen readers (and
 * `@testing-library/react-native`'s `getByRole`) would skip over the role
 * entirely. The web version applies `border-radius` directly to each
 * first/last child via a `:first-child > *` CSS selector, since its `<ul>`
 * has no `overflow: hidden` of its own; RN's `overflow: 'hidden'` on the
 * outer `View` clips every row to the container's rounded corners
 * uniformly, so that per-child trick isn't needed here.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/style-classes.html#boxed-lists-cards
 * @see https://developer.gnome.org/hig/patterns/containers.html
 */
export const BoxedList = forwardRef<View, BoxedListProps>(function BoxedList(
  { children, variant = 'default', style, ...viewProps },
  ref,
) {
  const theme = useGnomeTheme();
  const items = Children.toArray(children).filter(Boolean);

  if (variant === 'separate') {
    return (
      <RNView
        ref={ref}
        accessible
        accessibilityRole="list"
        style={[{ gap: theme.space2 }, style]}
        {...viewProps}
      >
        {items.map((child, i) => (
          <RNView
            // biome-ignore lint/suspicious/noArrayIndexKey: children have no natural stable id
            key={i}
            style={{
              backgroundColor: theme.cardBgColor,
              borderWidth: 1,
              borderColor: theme.dividerColor,
              borderRadius: theme.radiusLg,
              overflow: 'hidden',
            }}
          >
            {child}
          </RNView>
        ))}
      </RNView>
    );
  }

  return (
    <RNView
      ref={ref}
      accessible
      accessibilityRole="list"
      style={[
        {
          backgroundColor: theme.cardBgColor,
          borderWidth: 1,
          borderColor: theme.dividerColor,
          borderRadius: theme.radiusLg,
          overflow: 'hidden',
        },
        style,
      ]}
      {...viewProps}
    >
      {items.map((child, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: children have no natural stable id
        <RNView key={i}>
          {i > 0 && <Separator testID="boxed-list-separator" />}
          {child}
        </RNView>
      ))}
    </RNView>
  );
});
