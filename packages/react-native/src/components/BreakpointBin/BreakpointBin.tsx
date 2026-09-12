import type { ReactNode } from 'react';
import { useState } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewProps, ViewStyle } from 'react-native';
import { View } from 'react-native';

export interface BreakpointDefinition {
  /** Identifier for this breakpoint, e.g. `"compact"` or `"narrow"`. */
  name: string;
  /**
   * Container width threshold in dp.
   * This breakpoint becomes active when the container width is ≤ this value.
   */
  maxWidth: number;
}

export interface BreakpointBinState {
  /**
   * Name of the currently active breakpoint, or `null` when the container
   * is wider than all defined breakpoints.
   */
  activeBreakpoint: string | null;
  /** Current container width in dp (from `onLayout`). */
  width: number;
}

export interface BreakpointBinProps extends Omit<ViewProps, 'children' | 'style'> {
  /**
   * Breakpoint definitions. The active breakpoint is the smallest
   * `maxWidth` ≥ the container's current width — declaration order doesn't
   * matter, they're sorted internally.
   */
  breakpoints: BreakpointDefinition[];
  /**
   * Render prop that receives the current breakpoint state.
   *
   * @example
   * ```tsx
   * <BreakpointBin breakpoints={[{ name: "compact", maxWidth: 400 }]}>
   *   {({ activeBreakpoint }) =>
   *     activeBreakpoint === "compact" ? <CompactLayout /> : <WideLayout />
   *   }
   * </BreakpointBin>
   * ```
   */
  children: (state: BreakpointBinState) => ReactNode;
  style?: StyleProp<ViewStyle>;
}

function evaluate(breakpoints: BreakpointDefinition[], width: number): BreakpointBinState {
  const sorted = [...breakpoints].sort((a, b) => a.maxWidth - b.maxWidth);
  const match = sorted.find((bp) => width <= bp.maxWidth) ?? null;

  return { activeBreakpoint: match?.name ?? null, width };
}

/**
 * Container that fires layout changes when **its own width** crosses
 * defined thresholds — the CSS container-query equivalent of
 * `AdwBreakpointBin` (libadwaita 1.9 / GNOME 50), and the per-*component*
 * sibling of `useBreakpoint` (which watches the window instead).
 *
 * `@gnome-ui/react`'s version watches its own width via `ResizeObserver`;
 * RN has no such API, so this measures the same thing via `onLayout` —
 * fired on mount and again on every subsequent resize of the `View` itself
 * (e.g. the parent's flex layout reflowing, or a device rotation changing
 * how much space this container is given). Composable the same way: the
 * same component can render differently depending on how much space its
 * parent gives it, regardless of the window size — two `BreakpointBin`s
 * side by side with identical `breakpoints` can be in different states.
 *
 * Unlike the web version, there's no `data-breakpoint` attribute to expose
 * for CSS targeting (RN has no attribute selectors) — branch on
 * `activeBreakpoint` directly inside the render prop instead, exactly like
 * every story below already does.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.BreakpointBin.html
 */
export const BreakpointBin = ({
  breakpoints,
  children,
  style,
  onLayout,
  ...viewProps
}: BreakpointBinProps) => {
  const [width, setWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
    onLayout?.(event);
  };

  return (
    <View onLayout={handleLayout} style={style} {...viewProps}>
      {children(evaluate(breakpoints, width))}
    </View>
  );
};
