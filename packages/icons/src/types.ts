/**
 * Framework-agnostic icon definition.
 * Each icon is a set of SVG path descriptors within a fixed viewBox.
 *
 * Adapters (React, Angular, etc.) consume this shape to render the icon
 * as an inline SVG.
 */
export interface IconDefinition {
  /** SVG viewBox attribute, e.g. `"0 0 16 16"`. */
  readonly viewBox: string;
  /** One or more SVG path objects that make up the icon. */
  readonly paths: ReadonlyArray<IconPath>;
}

export interface IconPath {
  readonly d: string;
  readonly fillRule?: "nonzero" | "evenodd" | "inherit";
  readonly clipRule?: "nonzero" | "evenodd" | "inherit";
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
