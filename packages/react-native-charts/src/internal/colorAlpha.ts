/**
 * Appends an alpha channel to a 6-digit hex color (`#RRGGBB` -> `#RRGGBBAA`) —
 * the same `#RRGGBBAA`-suffix technique `Chip`/`Highlight`/`Blockquote` already
 * use in `@gnome-ui/react-native` for a translucent tint from a flat theme
 * color, reused here for gradient-fill stops. Only handles 6-digit hex input
 * (the shape every palette color in this package and its theme tokens use);
 * any other color format is returned unchanged rather than corrupted.
 */
export function withAlpha(color: string, alpha: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    return color;
  }

  const clamped = Math.round(Math.min(1, Math.max(0, alpha)) * 255);
  const hex = clamped.toString(16).padStart(2, '0');

  return `${color}${hex}`;
}
