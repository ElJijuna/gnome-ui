import type { useGnomeTheme } from '@/GnomeProvider';
import type { IconColor, IconSize } from './Icon';

/**
 * Non-component helpers shared between `Icon` and `AnimatedIcon` — kept in
 * their own module (not exported from `Icon.tsx` itself) so both files stay
 * component-only for Fast Refresh, per the project's `react-refresh/
 * only-export-components` lint rule.
 */

export const ICON_SIZE_MAP: Record<IconSize, number> = { sm: 12, md: 16, lg: 20 };

export function resolveIconColor(
  theme: ReturnType<typeof useGnomeTheme>,
  color: IconColor | undefined,
) {
  switch (color) {
    case 'blue':
      return theme.blue3;
    case 'green':
      return theme.green4;
    case 'yellow':
      return theme.yellow4;
    case 'orange':
      return theme.orange3;
    case 'red':
      return theme.red3;
    case 'purple':
      return theme.purple3;
    case 'brown':
      return theme.brown3;
    default:
      return theme.windowFgColor;
  }
}

export function iconAccessibilityProps(label: string | undefined) {
  return label
    ? { accessible: true as const, accessibilityLabel: label, accessibilityRole: 'image' as const }
    : { accessible: false as const, accessibilityRole: 'none' as const };
}
