import { forwardRef, type ReactNode } from 'react';
import type { FlexStyle, StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import { View as RNView } from 'react-native';

/** GNOME HIG standard spacing values (matches `GtkBox` spacing tokens). */
export type BoxSpacing = 3 | 6 | 12 | 18 | 24 | 32 | 48;

/** Alias of `BoxSpacing` for use as a padding scale. */
export type BoxPadding = BoxSpacing;

export type BoxOrientation = 'horizontal' | 'vertical';
export type BoxAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type BoxJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

export interface BoxProps extends Omit<ViewProps, 'style'> {
  /**
   * Direction children are arranged.
   * `"vertical"` → `flexDirection: 'column'` (default).
   * `"horizontal"` → `flexDirection: 'row'`.
   */
  orientation?: BoxOrientation;
  /**
   * Gap between children, in density-independent pixels.
   * Accepts any of the GNOME HIG standard spacing values or any number.
   * Defaults to `6` (the HIG "standard" inner spacing).
   */
  spacing?: BoxSpacing | number;
  /**
   * Cross-axis alignment (`alignItems`).
   * Defaults to `"stretch"` for vertical, `"center"` for horizontal.
   */
  align?: BoxAlign;
  /**
   * Main-axis distribution (`justifyContent`).
   * Defaults to `"start"`.
   */
  justify?: BoxJustify;
  /** Inner padding applied to all sides, in density-independent pixels. */
  padding?: BoxPadding | number;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Yoga's own edge names for the two values CSS spells differently — the web
 * version passes `align`/`justify` straight through to CSS, which accepts
 * the bare `start`/`end` keywords RN's `FlexStyle` union doesn't have.
 */
const ALIGN: Record<BoxAlign, FlexStyle['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const JUSTIFY: Record<BoxJustify, FlexStyle['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-between': 'space-between',
  'space-around': 'space-around',
  'space-evenly': 'space-evenly',
};

/**
 * Fundamental flex layout primitive — the RN equivalent of `GtkBox`, and a
 * 1:1 mirror of `@gnome-ui/react`'s own `Box`.
 *
 * Arranges children in a single row or column with consistent spacing
 * following the GNOME Human Interface Guidelines spacing scale:
 *
 * | Token | dp | Use |
 * |-------|----|-----|
 * | tight | 3  | Dense UI, icon + label pairs |
 * | standard | 6 | Default inner spacing |
 * | medium | 12 | Between related groups |
 * | large | 18 | Between loosely related sections |
 * | section | 24 | Page-level section gaps |
 * | loose | 32 | Large content separation |
 * | jumbo | 48 | Hero / splash spacing |
 *
 * `BoxSpacing` keeps the web package's exact seven values rather than being
 * remapped onto this package's own `theme.space1`–`space6` scale — the two
 * overlap at 6/12/18/24/48 but not at 3 or 32/36, and `BoxSpacing` is a
 * published type consumers may already be importing, so it ports verbatim.
 *
 * Two things the web version accepts don't survive the platform: `spacing`
 * and `padding` are numbers only (RN's `gap`/`padding` take dp, not CSS
 * strings like `"1rem"`), and `align`/`justify` — which the web passes
 * straight through to CSS — are mapped from their bare `start`/`end`
 * keywords onto Yoga's `flex-start`/`flex-end`. The prop values stay the
 * web ones so the API reads identically across both packages; only the
 * internal translation differs.
 *
 * `display: 'flex'` has no port and needs none — every RN `View` is already
 * a flex container.
 *
 * @example
 * // Vertical section (heading + content)
 * <Box spacing={12}>
 *   <Text variant="caption-heading" color="dim">Devices</Text>
 *   <BoxedList>…</BoxedList>
 * </Box>
 *
 * @example
 * // Horizontal icon + label
 * <Box orientation="horizontal" spacing={6} align="center">
 *   <Icon icon={Folder} />
 *   <Text>Documents</Text>
 * </Box>
 *
 * @see https://developer.gnome.org/hig/guidelines/spacing.html
 */
export const Box = forwardRef<View, BoxProps>(function Box(
  {
    orientation = 'vertical',
    spacing = 6,
    align,
    justify = 'start',
    padding,
    children,
    style,
    ...viewProps
  },
  ref,
) {
  const defaultAlign: BoxAlign = orientation === 'horizontal' ? 'center' : 'stretch';

  return (
    <RNView
      ref={ref}
      style={[
        {
          flexDirection: orientation === 'horizontal' ? 'row' : 'column',
          gap: spacing,
          alignItems: ALIGN[align ?? defaultAlign],
          justifyContent: JUSTIFY[justify],
        },
        padding !== undefined && { padding },
        style,
      ]}
      {...viewProps}
    >
      {children}
    </RNView>
  );
});
