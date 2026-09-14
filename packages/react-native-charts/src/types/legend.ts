export type ChartLegendPosition = 'top' | 'bottom' | 'left' | 'right';

/** Whether the legend and chart stack vertically (top/bottom) or sit side by side (left/right). */
export function isVerticalLegendPosition(position: ChartLegendPosition): boolean {
  return position === 'left' || position === 'right';
}
