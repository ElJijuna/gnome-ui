import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { StyleProp, View, ViewStyle } from 'react-native';
import { View as RNView } from 'react-native';

import { useGnomeTheme } from '@/GnomeProvider';

export interface LinkedGroupProps {
  /**
   * Each child must accept and merge a `style` prop the way every
   * `@gnome-ui/react-native` component already does (`style` last in its
   * own internal style array) — see the component doc for why.
   */
  children: ReactNode;
  /** Stack children vertically instead of horizontally. */
  vertical?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

type StyleableElement = ReactElement<{ style?: StyleProp<ViewStyle> }>;

/**
 * Renders children as a single visually-connected unit with no gap and
 * merged borders — the canonical GNOME pattern for button groups and
 * segmented inputs. Mirrors `@gnome-ui/react`'s `LinkedGroup`, itself
 * mirroring the libadwaita `.linked` style class.
 *
 * The web version reaches every child's border-radius via a CSS
 * `> *` universal child selector — RN has no equivalent way for a parent
 * `View` to reach into an arbitrary child's own internally-computed
 * styles. Reimagined instead as the same `cloneElement`-onto-children
 * technique `Popover`/`Tooltip` already use on their own trigger:
 * each child gets a computed corner-radius/negative-margin override
 * merged onto whatever `style` it already has, using the same
 * "zero the shared inner corners, keep `theme.radiusMd` on the outer
 * ones, overlap by 1 dp to collapse the shared border" recipe
 * `SplitButton` already proved for its own two-piece connected border —
 * generalized here from a fixed two children to an arbitrary list. This
 * only works because every component in this package already merges a
 * passed-in `style` prop last, the same assumption `Popover`'s own
 * trigger-cloning already depends on.
 *
 * The web CSS also raises a hovered/focused child's `z-index` so its own
 * border isn't visually covered by the next sibling's overlapping edge —
 * dropped here: RN is touch-first (no `:hover`), and no component in this
 * package currently renders an escaping focus ring that overlap could
 * clip, so there's nothing yet for the z-index bump to protect.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/1-latest/style-classes.html#linked-style-class
 *
 * @example
 * <LinkedGroup>
 *   <Button variant="flat">Bold</Button>
 *   <Button variant="flat">Italic</Button>
 * </LinkedGroup>
 */
export const LinkedGroup = forwardRef<View, LinkedGroupProps>(function LinkedGroup(
  { children, vertical = false, style, testID },
  ref,
) {
  const theme = useGnomeTheme();
  const items = Children.toArray(children).filter(isValidElement) as StyleableElement[];
  const count = items.length;

  return (
    <RNView
      ref={ref}
      testID={testID}
      style={[{ flexDirection: vertical ? 'column' : 'row', alignItems: 'stretch' }, style]}
    >
      {items.map((child, index) => {
        const isFirst = index === 0;
        const isLast = index === count - 1;

        const cornerStyle: ViewStyle = vertical
          ? {
              borderTopLeftRadius: isFirst ? theme.radiusMd : 0,
              borderTopRightRadius: isFirst ? theme.radiusMd : 0,
              borderBottomLeftRadius: isLast ? theme.radiusMd : 0,
              borderBottomRightRadius: isLast ? theme.radiusMd : 0,
              marginTop: isFirst ? 0 : -1,
            }
          : {
              borderTopLeftRadius: isFirst ? theme.radiusMd : 0,
              borderBottomLeftRadius: isFirst ? theme.radiusMd : 0,
              borderTopRightRadius: isLast ? theme.radiusMd : 0,
              borderBottomRightRadius: isLast ? theme.radiusMd : 0,
              marginLeft: isFirst ? 0 : -1,
            };

        return cloneElement(child, {
          key: index,
          style: [child.props.style, cornerStyle],
        });
      })}
    </RNView>
  );
});
