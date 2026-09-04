import type { AnyIconDefinition, IconDefinition } from '@gnome-ui/icons';
import type { StyleProp, ViewStyle } from 'react-native';
import { Path, Svg, SvgXml } from 'react-native-svg';

import { useGnomeTheme } from '@/GnomeProvider';

import { ICON_SIZE_MAP, iconAccessibilityProps, resolveIconColor } from './shared';

export type IconSize = 'sm' | 'md' | 'lg';

/** Named GNOME palette color for the icon. `"default"` (or omitting the prop) resolves to the theme's default foreground color. */
export type IconColor =
  | 'default'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'purple'
  | 'brown';

export interface IconProps {
  /** Icon from `@gnome-ui/icons`, a `simple-icons` icon, or a raw `{ path }` object. */
  icon: AnyIconDefinition;
  /**
   * Rendered size.
   * - `sm` — 12 px
   * - `md` — 16 px (default)
   * - `lg` — 20 px
   *
   * Override with `width`/`height` for non-standard sizes.
   */
  size?: IconSize;
  width?: number;
  height?: number;
  /** Accessible label. Omit for decorative icons — they are hidden from screen readers. */
  label?: string;
  /**
   * Named GNOME palette color. Omit (or pass `"default"`) to use the
   * theme's default foreground color — RN has no `currentColor`
   * equivalent to inherit from a parent, unlike the web version.
   */
  color?: IconColor;
  /** Forwarded to the underlying `Svg` — useful for a `transform` (e.g. a rotated disclosure chevron) or `margin`. */
  style?: StyleProp<ViewStyle>;
}

/**
 * `icon.paths` present → `IconDefinition` with structured path data.
 * `icon.svg` present (and no `paths`) → `IconDefinition` carrying raw markup
 * (the `animated` icons — see `AnimatedIcon`).
 * Neither → `RawPathIconDefinition` (e.g. a `simple-icons` `SimpleIcon`,
 * which has its own unrelated `svg` field alongside `path` — checking
 * `path` is absent, not just that `svg` is a string, is what keeps those
 * correctly classified below instead of misread as an internal
 * `IconDefinition`). Duplicated from `@gnome-ui/react`'s `Icon.tsx` rather
 * than shared — see that component for the full reasoning.
 */
function isIconDefinition(icon: AnyIconDefinition): icon is IconDefinition {
  if ('paths' in icon && Array.isArray((icon as IconDefinition).paths)) {
    return true;
  }

  return typeof (icon as IconDefinition).svg === 'string' && !('path' in icon);
}

/** `react-native-svg`'s `FillRule` has no `"inherit"` member (unlike `IconPath`'s, kept for CSS-source-of-truth completeness) — a leaf `<path>` has nothing to inherit from, so it maps to the SVG default (omitted attribute). */
function fillRule(rule: 'nonzero' | 'evenodd' | 'inherit' | undefined) {
  return rule === 'nonzero' || rule === 'evenodd' ? rule : undefined;
}

/**
 * Renders an icon as an inline SVG, via `react-native-svg`.
 *
 * Accepts icons from `@gnome-ui/icons`, any `simple-icons` icon, or a plain
 * `{ path }` object — same `AnyIconDefinition` union as `@gnome-ui/react`'s
 * `Icon`. Pass `label` only when the icon conveys meaning on its own.
 *
 * `animated` icons (`Syncing`, `Recording`, …) carry raw `svg` markup
 * instead of `paths` — rendered here through `SvgXml`, which parses the
 * structural elements (`<g>`/`<path>`/`<circle>`) but has no CSS engine, so
 * the embedded `<style>`/`@keyframes` block is silently dropped and the
 * shapes render at their authored rest position. That happens to be exactly
 * the desired "inert, static frame" behavior for a plain `<Icon>` — no
 * special-casing needed here; wrap in `<AnimatedIcon>` to actually play the
 * motion (RN has to hand-build that with `Animated`, since there is no CSS
 * animation engine to interpret the markup's keyframes).
 *
 * @example
 * import { Search } from "@gnome-ui/icons";
 * <Icon icon={Search} label="Search" />
 *
 * @example
 * import { siGithub } from "simple-icons";
 * <Icon icon={siGithub} label="GitHub" />
 */
export const Icon = ({ icon, size = 'md', width, height, label, color, style }: IconProps) => {
  const theme = useGnomeTheme();
  const px = ICON_SIZE_MAP[size];
  const fill = resolveIconColor(theme, color);

  const resolvedViewBox = isIconDefinition(icon) ? icon.viewBox : (icon.viewBox ?? '0 0 24 24');
  const rawSvg = isIconDefinition(icon) ? icon.svg : undefined;
  const paths = isIconDefinition(icon)
    ? icon.svg
      ? undefined
      : icon.paths?.map((p, i) => (
          <Path
            key={i}
            d={p.d}
            fillRule={fillRule(p.fillRule)}
            clipRule={fillRule(p.clipRule)}
            transform={p.transform}
          />
        ))
    : [<Path key={0} d={icon.path} />];

  const accessibilityProps = iconAccessibilityProps(label);

  if (rawSvg) {
    return (
      <SvgXml
        xml={`<svg viewBox="${resolvedViewBox}">${rawSvg}</svg>`}
        width={width ?? px}
        height={height ?? px}
        fill={fill}
        style={style}
        {...accessibilityProps}
      />
    );
  }

  return (
    <Svg
      viewBox={resolvedViewBox}
      width={width ?? px}
      height={height ?? px}
      fill={fill}
      style={style}
      {...accessibilityProps}
    >
      {paths}
    </Svg>
  );
};
