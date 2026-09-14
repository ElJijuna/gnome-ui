import { matchFont } from '@shopify/react-native-skia';

/**
 * Deliberately NOT `theme.fontFamily` ("Adwaita Sans") here: confirmed on-device
 * that Skia's `matchFont` silently renders no glyphs at all for an unregistered
 * family (unlike RN's own `<Text>`, which falls back to the OS default font for
 * an unknown `fontFamily` string — Skia's `FontMgr.matchFamilyStyle` has no such
 * substitution). Omitting `fontFamily` defaults to `"System"`, which is always
 * registered. Use this for every chart's axis-label font, never `matchFont`
 * called directly with `theme.fontFamily`.
 */
export function useChartFont(fontSize = 12) {
  return matchFont({ fontSize });
}
