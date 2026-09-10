import { forwardRef } from 'react';
import type { View, ViewProps } from 'react-native';
import { View as RNView } from 'react-native';

export type BinProps = ViewProps;

/**
 * Single-child container with no visual styling.
 *
 * A transparent wrapper that forwards all `View` props (and a ref to the
 * underlying `View`) straight through — useful as a neutral base for custom
 * components that need to apply layout or size constraints without
 * introducing any chrome of their own.
 *
 * Mirrors `AdwBin` and `@gnome-ui/react`'s own `Bin`. A plain RN `View`
 * already has no default visual styling (no background, no border), so
 * unlike the web port there's no CSS reset to strip — this is a pure
 * passthrough.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Bin.html
 */
export const Bin = forwardRef<View, BinProps>(function Bin(props, ref) {
  return <RNView ref={ref} {...props} />;
});
