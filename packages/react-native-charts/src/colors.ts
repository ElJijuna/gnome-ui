import type { GnomeThemeTokens } from '@gnome-ui/react-native';

/**
 * Default GNOME Adwaita color palette for chart series, resolved from the
 * active theme so it tracks color scheme / high-contrast switches — the RN
 * equivalent of `@gnome-ui/charts`' CSS-var-based `GNOME_CHART_PALETTE`.
 */
export function getChartPalette(theme: GnomeThemeTokens): string[] {
  return [theme.blue3, theme.green4, theme.orange3, theme.purple3, theme.red3, theme.yellow5];
}
