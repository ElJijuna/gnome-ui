import { StyleSheet, Text, View } from 'react-native';

import { type ChartLegendPosition, isVerticalLegendPosition } from '@/types/legend';

export interface ChartLegendEntry {
  key: string;
  label: string;
  color: string;
}

export interface ChartLegendProps {
  entries: ChartLegendEntry[];
  position: ChartLegendPosition;
  textColor: string;
  fontFamily: string;
}

/** Victory Native has no built-in legend component — every chart hand-rolls one via this. */
export const ChartLegend = ({ entries, position, textColor, fontFamily }: ChartLegendProps) => {
  const isVertical = isVerticalLegendPosition(position);

  return (
    <View
      style={[styles.legend, isVertical ? styles.legendVertical : styles.legendHorizontal]}
      importantForAccessibility="no-hide-descendants"
    >
      {entries.map((entry) => (
        <View key={entry.key} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: entry.color }]} />
          <Text numberOfLines={1} style={[styles.legendLabel, { color: textColor, fontFamily }]}>
            {entry.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  legend: {
    flexWrap: 'wrap',
    gap: 12,
  },
  legendHorizontal: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  legendVertical: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 8,
    flexShrink: 1,
  },
  legendItem: {
    flexDirection: 'row',
    flexShrink: 1,
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  legendLabel: {
    fontSize: 12,
    flexShrink: 1,
  },
});
