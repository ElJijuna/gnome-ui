import { forwardRef, type ReactNode } from 'react';
import type { FlexStyle, StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import { View as RNView } from 'react-native';

export type WrapBoxJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
export type WrapBoxAlign = 'start' | 'center' | 'end' | 'stretch';

export interface WrapBoxProps extends Omit<ViewProps, 'style'> {
  /** Gap between children on the same line, in dp. Default: `6`. */
  childSpacing?: number;
  /** Gap between lines, in dp. Defaults to `childSpacing`. */
  lineSpacing?: number;
  /** Horizontal distribution of children within each line. Default: `"start"`. */
  justify?: WrapBoxJustify;
  /** Cross-axis alignment of children within each line. Default: `"center"`. */
  align?: WrapBoxAlign;
  /** When true children wrap in the reverse direction (bottom to top). */
  wrapReverse?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Yoga's own edge names — the same `start`/`end` → `flex-start`/`flex-end`
 * translation `Box` establishes, duplicated here rather than shared: these
 * are two small pure lookups, and `WrapBoxAlign` is deliberately a narrower
 * union than `BoxAlign` (no `baseline`), mirroring the web package's own
 * two separate types.
 */
const ALIGN: Record<WrapBoxAlign, FlexStyle['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

const JUSTIFY: Record<WrapBoxJustify, FlexStyle['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-between': 'space-between',
  'space-around': 'space-around',
  'space-evenly': 'space-evenly',
};

/**
 * Flexible wrapping layout container — children flow horizontally and wrap
 * to new lines when they don't fit, like words in a paragraph, without
 * locking them into a grid. Mirrors `AdwWrapBox` (libadwaita 1.7 / GNOME
 * 48) and `@gnome-ui/react`'s own `WrapBox`.
 *
 * Pair with `Chip` for tag lists and filter rows, or use standalone for any
 * collection of variable-width items.
 *
 * The web version ships its values as CSS custom properties consumed by a
 * stylesheet (`--wrapbox-gap`, `--wrapbox-justify`, …) because a CSS module
 * can't take runtime values any other way; RN has no such indirection, so
 * they're written straight onto the style object here. Everything else is a
 * direct translation: `flex-flow: row wrap` becomes
 * `flexDirection: 'row'` + `flexWrap`, and the shorthand
 * `gap: <row> <column>` splits into RN's separate `rowGap`/`columnGap`
 * (the single `gap` property would set both, which is exactly what this
 * component must be able to avoid).
 *
 * As in `Box`, `childSpacing`/`lineSpacing` are numbers only — RN's gap
 * properties take dp, not CSS strings — and `align`/`justify` keep the
 * web's bare `start`/`end` keywords in the public API while mapping
 * internally onto Yoga's `flex-start`/`flex-end`.
 *
 * `alignContent: 'stretch'` is set explicitly even though neither package
 * exposes an `alignContent` prop — **CSS defaults it to `stretch`, Yoga
 * defaults it to `flex-start`**, so without this line `align="stretch"`
 * silently does nothing on RN whenever the children have no cross-size of
 * their own: the line collapses to zero height before `alignItems` ever
 * gets to stretch anything into it. Caught on-device (the stretch row of
 * the example app's demo screen rendered empty); this restores the web
 * version's behaviour exactly. It's a no-op in the ordinary case where the
 * container hugs its content rather than having a fixed height.
 *
 * @example
 * // Tag list
 * <WrapBox childSpacing={6}>
 *   {tags.map((tag) => <Chip key={tag}>{tag}</Chip>)}
 * </WrapBox>
 *
 * @example
 * // Looser gap between lines than between items
 * <WrapBox childSpacing={6} lineSpacing={12} justify="center">
 *   {filters.map((filter) => <Chip key={filter}>{filter}</Chip>)}
 * </WrapBox>
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.WrapBox.html
 */
export const WrapBox = forwardRef<View, WrapBoxProps>(function WrapBox(
  {
    childSpacing = 6,
    lineSpacing,
    justify = 'start',
    align = 'center',
    wrapReverse = false,
    children,
    style,
    ...viewProps
  },
  ref,
) {
  return (
    <RNView
      ref={ref}
      style={[
        {
          flexDirection: 'row',
          flexWrap: wrapReverse ? 'wrap-reverse' : 'wrap',
          columnGap: childSpacing,
          rowGap: lineSpacing ?? childSpacing,
          justifyContent: JUSTIFY[justify],
          alignItems: ALIGN[align],
          alignContent: 'stretch',
        },
        style,
      ]}
      {...viewProps}
    >
      {children}
    </RNView>
  );
});
