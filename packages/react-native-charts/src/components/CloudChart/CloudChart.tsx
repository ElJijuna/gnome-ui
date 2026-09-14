import { useGnomeTheme } from '@gnome-ui/react-native';
import { StyleSheet, Text, View } from 'react-native';

import { getChartPalette } from '@/colors';

export interface CloudChartDataItem {
  text: string;
  value: number;
  color?: string;
}

export interface CloudChartProps {
  data: CloudChartDataItem[];
  height?: number;
  minFontSize?: number;
  maxFontSize?: number;
  'aria-label'?: string;
}

/**
 * No Victory Native primitive (confirmed: no word-cloud/packing chart exists),
 * but unlike `RadarChart`/`RadialBarChart` this needed no Skia canvas either —
 * the web version has no real cloud-packing algorithm at all, just flex-wrapped
 * `<span>`s with a linearly-scaled `font-size` that the browser's own text flow
 * lays out. Ports directly to a flex-wrap `View` of `Text`s, no canvas needed.
 */
export const CloudChart = ({
  data,
  height = 300,
  minFontSize = 12,
  maxFontSize = 48,
  'aria-label': ariaLabel,
}: CloudChartProps) => {
  const theme = useGnomeTheme();
  const palette = getChartPalette(theme);

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const words = data.map((item, i) => ({
    ...item,
    fontSize:
      min === max
        ? (minFontSize + maxFontSize) / 2
        : minFontSize + ((item.value - min) / range) * (maxFontSize - minFontSize),
    resolvedColor: item.color ?? palette[i % palette.length],
  }));

  const label = ariaLabel ?? `Word cloud with ${data.length} terms`;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      style={[styles.cloud, { minHeight: height }]}
    >
      {words.map((word, i) => (
        <Text
          key={`${word.text}-${i}`}
          numberOfLines={1}
          style={{
            fontSize: word.fontSize,
            lineHeight: word.fontSize * 1.2,
            color: word.resolvedColor,
            fontFamily: theme.fontFamily,
          }}
        >
          {word.text}
        </Text>
      ))}
    </View>
  );
};

// Web's `:hover { opacity: 0.7 }` has no touch equivalent — the words are purely
// informational (no onPress in the source either) — dropped rather than faked
// with a press state that implies interactivity that isn't there.
const styles = StyleSheet.create({
  cloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 12,
  },
});
