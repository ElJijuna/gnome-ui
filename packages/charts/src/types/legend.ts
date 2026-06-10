export type ChartLegendPosition = 'top' | 'bottom' | 'left' | 'right';

export function getLegendProps(position: ChartLegendPosition = 'bottom') {
  const map = {
    top: { verticalAlign: 'top', align: 'center', layout: 'horizontal' },
    bottom: { verticalAlign: 'bottom', align: 'center', layout: 'horizontal' },
    left: { verticalAlign: 'middle', align: 'left', layout: 'vertical' },
    right: { verticalAlign: 'middle', align: 'right', layout: 'vertical' },
  } as const;
  return map[position];
}
