import { useNumberFormatter } from '@gnome-ui/react';
import type { ReactElement } from 'react';
import { Sankey as RechartsSankey, ResponsiveContainer, Tooltip } from 'recharts';

import { GNOME_CHART_PALETTE } from '../../colors';
import { GNOME_TOOLTIP_ITEM_STYLE, GNOME_TOOLTIP_STYLE } from '../../tooltipStyle';

import styles from './SankeyChart.module.css';

export interface SankeyChartNode {
  name: string;
  color?: string;
}

export interface SankeyChartLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyChartProps {
  nodes: SankeyChartNode[];
  links: SankeyChartLink[];
  height?: number;
  nodeWidth?: number;
  nodePadding?: number;
  /** Append the formatted value to each node label. */
  showValues?: boolean;
  valueFormatter?: (value: number) => string;
  className?: string;
  'aria-label'?: string;
}

interface NodeShapeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  payload: { name: string; value: number };
  colorMap: Map<string, string>;
  terminalNames: Set<string>;
  showValues: boolean;
  format: (value: number) => string;
}

const NodeShape = ({
  x,
  y,
  width,
  height,
  payload,
  colorMap,
  terminalNames,
  showValues,
  format,
}: NodeShapeProps) => {
  const fill = colorMap.get(payload.name) ?? GNOME_CHART_PALETTE[0];
  const isTerminal = terminalNames.has(payload.name);
  const labelX = isTerminal ? x - 6 : x + width + 6;
  const label = showValues ? `${payload.name} (${format(payload.value)})` : payload.name;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={2}
        ry={2}
        aria-label={`${payload.name}: ${format(payload.value)}`}
      />
      <text
        x={labelX}
        y={y + height / 2}
        textAnchor={isTerminal ? 'end' : 'start'}
        dominantBaseline="middle"
        fontSize={12}
        fontFamily="var(--gnome-font-family, system-ui)"
        fill="var(--gnome-window-fg-color, rgba(0, 0, 0, 0.8))"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {label}
      </text>
    </g>
  );
};

interface LinkShapeProps {
  sourceX: number;
  sourceY: number;
  sourceControlX: number;
  targetX: number;
  targetY: number;
  targetControlX: number;
  linkWidth: number;
  payload: { source: { name: string }; target: { name: string }; value: number };
  colorMap: Map<string, string>;
  format: (value: number) => string;
}

const LinkShape = ({
  sourceX,
  sourceY,
  sourceControlX,
  targetX,
  targetY,
  targetControlX,
  linkWidth,
  payload,
  colorMap,
  format,
}: LinkShapeProps) => {
  const color = colorMap.get(payload.source.name) ?? GNOME_CHART_PALETTE[0];

  return (
    <path
      d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
      fill="none"
      stroke={`color-mix(in srgb, ${color} 35%, transparent)`}
      strokeWidth={Math.max(1, linkWidth)}
      aria-label={`${payload.source.name} to ${payload.target.name}: ${format(payload.value)}`}
    />
  );
};

export const SankeyChart = ({
  nodes,
  links,
  height = 400,
  nodeWidth = 12,
  nodePadding = 24,
  showValues = false,
  valueFormatter,
  className,
  'aria-label': ariaLabel,
}: SankeyChartProps) => {
  const formatNumber = useNumberFormatter().format;
  const format = valueFormatter ?? formatNumber;

  const colorMap = new Map(
    nodes.map((node, i) => [
      node.name,
      node.color ?? GNOME_CHART_PALETTE[i % GNOME_CHART_PALETTE.length],
    ]),
  );
  const nameToIndex = new Map(nodes.map((node, i) => [node.name, i]));
  const terminalNames = new Set(nodes.map((node) => node.name));

  for (const link of links) {
    terminalNames.delete(link.source);
  }

  const data = {
    nodes: nodes.map((node) => ({ name: node.name })),
    links: links.map((link) => ({
      source: nameToIndex.get(link.source) ?? 0,
      target: nameToIndex.get(link.target) ?? 0,
      value: link.value,
    })),
  };

  return (
    <div
      role="img"
      aria-label={
        ariaLabel ?? `Sankey chart with ${nodes.length} nodes and ${links.length} flows`
      }
      className={[styles.container, className].filter(Boolean).join(' ')}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsSankey
          data={data}
          nodeWidth={nodeWidth}
          nodePadding={nodePadding}
          margin={{ top: 8, right: 24, bottom: 8, left: 24 }}
          link={
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((props: any) => (
              <LinkShape {...props} colorMap={colorMap} format={format} />
            )) as unknown as ReactElement<SVGElement>
          }
          node={
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((props: any) => (
              <NodeShape
                {...props}
                colorMap={colorMap}
                terminalNames={terminalNames}
                showValues={showValues}
                format={format}
              />
            )) as unknown as ReactElement<SVGElement>
          }
        >
          <Tooltip
            contentStyle={GNOME_TOOLTIP_STYLE}
            itemStyle={GNOME_TOOLTIP_ITEM_STYLE}
            formatter={(value: number) => [format(value), 'Value']}
          />
        </RechartsSankey>
      </ResponsiveContainer>
    </div>
  );
};
