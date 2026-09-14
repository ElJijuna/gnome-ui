import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { type ChartLegendPosition, isVerticalLegendPosition } from '@/types/legend';

export interface ChartContainerProps {
  accessibilityLabel: string;
  legendPosition: ChartLegendPosition;
  /** Pass `null` (not a conditional) when the legend is hidden, so layout stays stable. */
  legend: ReactNode | null;
  height: number;
  children: ReactNode;
}

/**
 * Shared wrapper every chart composes: accessibility role/label on the outer
 * `View`, row/column layout that swaps depending on `legendPosition`, and
 * placing the (optional) legend before or after the chart canvas.
 */
export const ChartContainer = ({
  accessibilityLabel,
  legendPosition,
  legend,
  height,
  children,
}: ChartContainerProps) => {
  const isVertical = isVerticalLegendPosition(legendPosition);
  const legendFirst = legendPosition === 'top' || legendPosition === 'left';

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={isVertical ? styles.rowContainer : styles.columnContainer}
    >
      {legendFirst && legend}
      <View style={[{ height }, isVertical && styles.flexFill]}>{children}</View>
      {!legendFirst && legend}
    </View>
  );
};

const styles = StyleSheet.create({
  columnContainer: {
    flexDirection: 'column',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  flexFill: {
    flex: 1,
  },
});
