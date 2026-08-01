export interface FontValue {
  family: string;
  /** Point size. */
  size: number;
  /** Numeric weight, 100–900. */
  weight: number;
}

export interface FontWeightOption {
  value: number;
  label: string;
}

/** Standard 9-step CSS/OpenType weight scale. */
export const FONT_WEIGHTS: FontWeightOption[] = [
  { value: 100, label: 'Thin' },
  { value: 200, label: 'Extra Light' },
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semi-Bold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extra Bold' },
  { value: 900, label: 'Black' },
];

/**
 * A representative default family list — GNOME's default UI/document/monospace
 * families plus the generic CSS font keywords. Real apps typically pass their
 * own `families` list (e.g. enumerated system or web fonts) instead.
 */
export const DEFAULT_FONT_FAMILIES: string[] = [
  'Cantarell',
  'Adwaita Sans',
  'Adwaita Mono',
  'Sans-serif',
  'Serif',
  'Monospace',
];

export function weightLabel(weight: number): string {
  return FONT_WEIGHTS.find((w) => w.value === weight)?.label ?? String(weight);
}
