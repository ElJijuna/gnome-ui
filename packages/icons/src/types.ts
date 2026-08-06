/**
 * Framework-agnostic icon definition.
 * Each icon is a set of SVG path descriptors within a fixed viewBox, or raw
 * markup for icons `paths` can't express (see `svg` below).
 *
 * Adapters (React, Angular, etc.) consume this shape to render the icon
 * as an inline SVG.
 */
export interface IconDefinition {
  /** SVG viewBox attribute, e.g. `"0 0 16 16"`. */
  readonly viewBox: string;
  /** One or more SVG path objects that make up the icon. Omit when using `svg` instead. */
  readonly paths?: ReadonlyArray<IconPath>;
  /**
   * Raw markup rendered inside the `<svg>` root instead of `paths` — used by
   * `animated` icons that need `<style>`/`<g>` structure a flat path list
   * can't express (mirrors GTK 4.22's `GtkSvg`, minus the native renderer:
   * this is still inline CSS-animated SVG). Content is authored in this
   * package and reviewed like any other source file — never accepts
   * user-supplied SVG, the same trust boundary GTK draws between app
   * resources and arbitrary user content.
   */
  readonly svg?: string;
  /**
   * Marks the icon as carrying a CSS animation in `svg`. Animated icons are
   * inert (first/static frame) when rendered directly with `<Icon>` — wrap
   * in `<AnimatedIcon>` to play them, which also enforces
   * `prefers-reduced-motion` regardless of the `playing` prop.
   */
  readonly animated?: boolean;
}

export interface IconPath {
  readonly d: string;
  readonly fillRule?: 'nonzero' | 'evenodd' | 'inherit';
  readonly clipRule?: 'nonzero' | 'evenodd' | 'inherit';
  readonly transform?: string;
}

/**
 * A minimal icon descriptor for single-path icons from third-party sets such
 * as `simple-icons`. Structurally compatible with `SimpleIcon` from
 * `simple-icons` — no cast or adapter needed.
 *
 * The viewBox defaults to `"0 0 24 24"` when omitted (simple-icons standard).
 */
export interface RawPathIconDefinition {
  /** SVG path `d` attribute string. */
  readonly path: string;
  /** SVG viewBox. Defaults to `"0 0 24 24"` when absent. */
  readonly viewBox?: string;
}

/**
 * Union of all accepted icon shapes for the `Icon` component.
 * - `IconDefinition` — icons from `@gnome-ui/icons`
 * - `RawPathIconDefinition` — single-path icons, e.g. from `simple-icons`
 */
export type AnyIconDefinition = IconDefinition | RawPathIconDefinition;
