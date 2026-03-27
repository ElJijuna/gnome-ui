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
