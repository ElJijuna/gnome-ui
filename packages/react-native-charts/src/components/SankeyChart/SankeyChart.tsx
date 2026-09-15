import { useGnomeTheme, useNumberFormatter } from '@gnome-ui/react-native';
import { Canvas, Path, RoundedRect, Skia, Text } from '@shopify/react-native-skia';
import { useCallback, useMemo, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';

import { getChartPalette } from '@/colors';
import { ChartContainer } from '@/internal/ChartContainer';
import { withAlpha } from '@/internal/colorAlpha';
import { useChartFont } from '@/internal/useChartFont';

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
  /** Append the formatted value to each node label. Defaults to `false`. */
  showValues?: boolean;
  valueFormatter?: (value: number) => string;
  'aria-label'?: string;
}

const FONT_SIZE = 12;
const LABEL_GAP = 6;
const MARGIN_X = 16;
const MARGIN_Y = 8;
const RELAX_ITERATIONS = 6;
// Caps how many px-per-unit the vertical scale can reach when every column's
// total value is tiny (e.g. all-1 demo data) — without this a near-zero
// column total drives `ky` toward Infinity and nodes render absurdly tall.
const MAX_KY = 40;

interface GraphNode {
  name: string;
  depth: number;
  value: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  sourceLinks: GraphLink[];
  targetLinks: GraphLink[];
}

interface GraphLink {
  source: GraphNode;
  target: GraphNode;
  value: number;
  width: number;
  y0: number;
  y1: number;
}

function buildGraph(
  nodes: SankeyChartNode[],
  links: SankeyChartLink[],
): { nodes: GraphNode[]; links: GraphLink[] } {
  const nameToNode = new Map<string, GraphNode>(
    nodes.map((n) => [
      n.name,
      {
        name: n.name,
        depth: 0,
        value: 0,
        x0: 0,
        x1: 0,
        y0: 0,
        y1: 0,
        sourceLinks: [],
        targetLinks: [],
      },
    ]),
  );
  const graphLinks: GraphLink[] = [];

  for (const l of links) {
    const source = nameToNode.get(l.source);
    const target = nameToNode.get(l.target);

    if (!source || !target) {
      continue;
    }

    const link: GraphLink = { source, target, value: l.value, width: 0, y0: 0, y1: 0 };
    source.sourceLinks.push(link);
    target.targetLinks.push(link);
    graphLinks.push(link);
  }

  return { nodes: [...nameToNode.values()], links: graphLinks };
}

function computeNodeValues(nodes: GraphNode[]) {
  for (const node of nodes) {
    const outgoing = node.sourceLinks.reduce((s, l) => s + l.value, 0);
    const incoming = node.targetLinks.reduce((s, l) => s + l.value, 0);
    node.value = Math.max(outgoing, incoming);
  }
}

/**
 * Longest-path depth from every source (no-incoming-link) node, via bounded
 * Bellman-Ford-style relaxation instead of an explicit topological sort —
 * simpler to hand-roll correctly, and the DAG assumption (a Sankey diagram
 * has no flow cycles, same assumption d3-sankey/Recharts' own `Sankey` make)
 * bounds convergence to at most `nodes.length` passes.
 */
function computeNodeDepths(nodes: GraphNode[]) {
  for (const node of nodes) {
    node.depth = 0;
  }

  for (let pass = 0; pass < nodes.length; pass += 1) {
    let changed = false;

    for (const node of nodes) {
      for (const link of node.sourceLinks) {
        if (link.target.depth < node.depth + 1) {
          link.target.depth = node.depth + 1;
          changed = true;
        }
      }
    }

    if (!changed) {
      break;
    }
  }
}

function groupByDepth(nodes: GraphNode[]): GraphNode[][] {
  const maxDepth = Math.max(0, ...nodes.map((n) => n.depth));
  const columns: GraphNode[][] = Array.from({ length: maxDepth + 1 }, () => []);

  for (const node of nodes) {
    columns[node.depth].push(node);
  }

  return columns;
}

function computeNodeX(columns: GraphNode[][], plotWidth: number, nodeWidth: number) {
  const maxDepth = columns.length - 1;
  const dx = maxDepth > 0 ? (plotWidth - nodeWidth) / maxDepth : 0;

  columns.forEach((column, depth) => {
    const x0 = MARGIN_X + depth * dx;

    for (const node of column) {
      node.x0 = x0;
      node.x1 = x0 + nodeWidth;
    }
  });
}

function computeNodeY(columns: GraphNode[][], plotHeight: number, nodePadding: number) {
  let ky = Number.POSITIVE_INFINITY;

  for (const column of columns) {
    const total = column.reduce((s, n) => s + n.value, 0);

    if (total <= 0) {
      continue;
    }

    const available = plotHeight - (column.length - 1) * nodePadding;
    ky = Math.min(ky, available / total);
  }

  if (!Number.isFinite(ky) || ky <= 0) {
    ky = 1;
  }

  ky = Math.min(ky, MAX_KY);

  for (const column of columns) {
    let y = MARGIN_Y;

    for (const node of column) {
      const h = Math.max(1, node.value * ky);
      node.y0 = y;
      node.y1 = y + h;
      y = node.y1 + nodePadding;
    }

    const used = y - nodePadding - MARGIN_Y;
    const offset = Math.max(0, (plotHeight - used) / 2);

    if (offset > 0) {
      for (const node of column) {
        node.y0 += offset;
        node.y1 += offset;
      }
    }
  }

  for (const column of columns) {
    for (const node of column) {
      for (const link of node.sourceLinks) {
        link.width = Math.max(1, link.value * ky);
      }
    }
  }
}

function weightedCenter(links: GraphLink[], pick: (l: GraphLink) => GraphNode): number | null {
  let sumWeighted = 0;
  let sumWeight = 0;

  for (const link of links) {
    const node = pick(link);
    sumWeighted += ((node.y0 + node.y1) / 2) * link.value;
    sumWeight += link.value;
  }

  return sumWeight > 0 ? sumWeighted / sumWeight : null;
}

/**
 * Pushes overlapping nodes apart, walking `column` in its existing order —
 * never re-sorted by current `y0`. `column`'s order is fixed once by
 * `groupByDepth` (the `nodes` prop's own order); every link's stacking
 * position (`computeLinkY`) is likewise fixed to its source/target node's
 * `sourceLinks`/`targetLinks` array order and never revisited after
 * relaxation. Re-sorting here by a node's *current* (post-relaxation) `y0`
 * — the original, more "obvious" approach — let two nodes swap visual rank
 * whenever relaxation pulled them far enough to cross, desyncing that
 * column's collision order from the link-stacking order fixed elsewhere and
 * producing links whose curves visibly crossed even though the underlying
 * `links` data never crossed. Confirmed via a real on-device screenshot: an
 * Signups->Customers/Signups->Churn pair pinched together mid-curve. Column
 * order must stay stable across every relax+collision pass for the two to
 * stay in sync.
 */
function resolveCollisions(column: GraphNode[], plotHeight: number, nodePadding: number) {
  let y = MARGIN_Y;

  for (const node of column) {
    const dy = y - node.y0;

    if (dy > 0) {
      node.y0 += dy;
      node.y1 += dy;
    }

    y = node.y1 + nodePadding;
  }

  const overflow = y - nodePadding - (MARGIN_Y + plotHeight);

  if (overflow > 0) {
    y = MARGIN_Y + plotHeight;

    for (let i = column.length - 1; i >= 0; i -= 1) {
      const node = column[i];
      const dy = node.y1 - y;

      if (dy > 0) {
        node.y0 -= dy;
        node.y1 -= dy;
      }

      y = node.y0 - nodePadding;
    }
  }
}

/** Pulls each node toward the weighted-average position of its *incoming* links' sources. */
function relaxLeftToRight(columns: GraphNode[][], plotHeight: number, nodePadding: number) {
  for (const column of columns) {
    for (const node of column) {
      const center = weightedCenter(node.targetLinks, (l) => l.source);

      if (center === null) {
        continue;
      }

      const dy = center - (node.y0 + node.y1) / 2;
      node.y0 += dy;
      node.y1 += dy;
    }

    resolveCollisions(column, plotHeight, nodePadding);
  }
}

/** Pulls each node toward the weighted-average position of its *outgoing* links' targets. */
function relaxRightToLeft(columns: GraphNode[][], plotHeight: number, nodePadding: number) {
  for (let i = columns.length - 1; i >= 0; i -= 1) {
    const column = columns[i];

    for (const node of column) {
      const center = weightedCenter(node.sourceLinks, (l) => l.target);

      if (center === null) {
        continue;
      }

      const dy = center - (node.y0 + node.y1) / 2;
      node.y0 += dy;
      node.y1 += dy;
    }

    resolveCollisions(column, plotHeight, nodePadding);
  }
}

function computeLinkY(nodes: GraphNode[]) {
  for (const node of nodes) {
    let ySource = node.y0;

    for (const link of node.sourceLinks) {
      link.y0 = ySource + link.width / 2;
      ySource += link.width;
    }

    let yTarget = node.y0;

    for (const link of node.targetLinks) {
      link.y1 = yTarget + link.width / 2;
      yTarget += link.width;
    }
  }
}

/**
 * Full d3-sankey-style layout: column assignment by longest-path depth,
 * node height proportional to throughput, then `RELAX_ITERATIONS` passes
 * alternating `relaxRightToLeft`/`relaxLeftToRight` — each pass nudges every
 * node toward the weighted-center of the links pulling on it and resolves
 * any resulting overlap — to straighten links and reduce crossings, the
 * same technique the original d3-sankey (and Recharts' own `Sankey`, which
 * this port mirrors) uses. No Victory Native or Skia primitive for this
 * exists, so it's hand-rolled directly on plain numbers, same approach as
 * `TreeMap`'s `squarify`. Deliberately skips d3-sankey's link-crossing sort
 * (links stack in the input `links` array's own order at each node) — a
 * documented scope trim, not the part of the algorithm the user asked for.
 */
function layoutSankey(
  nodes: SankeyChartNode[],
  links: SankeyChartLink[],
  width: number,
  height: number,
  nodeWidth: number,
  nodePadding: number,
): { nodes: GraphNode[]; links: GraphLink[] } | null {
  if (nodes.length === 0) {
    return null;
  }

  const graph = buildGraph(nodes, links);
  computeNodeValues(graph.nodes);
  computeNodeDepths(graph.nodes);

  const columns = groupByDepth(graph.nodes);
  const plotWidth = Math.max(0, width - 2 * MARGIN_X);
  const plotHeight = Math.max(0, height - 2 * MARGIN_Y);

  computeNodeX(columns, plotWidth, nodeWidth);
  computeNodeY(columns, plotHeight, nodePadding);

  for (let i = 0; i < RELAX_ITERATIONS; i += 1) {
    relaxRightToLeft(columns, plotHeight, nodePadding);
    relaxLeftToRight(columns, plotHeight, nodePadding);
  }

  computeLinkY(graph.nodes);

  return graph;
}

/**
 * Flow diagram (nodes as vertical bars, links as tapered curves between
 * them) for multi-stage funnels/allocations. See the module-level doc
 * comment on `layoutSankey` above for the layout algorithm.
 */
export const SankeyChart = ({
  nodes,
  links,
  height = 400,
  nodeWidth = 12,
  nodePadding = 24,
  showValues = false,
  valueFormatter,
  'aria-label': ariaLabel,
}: SankeyChartProps) => {
  const theme = useGnomeTheme();
  const palette = getChartPalette(theme);
  const formatNumber = useNumberFormatter().format;
  const format = valueFormatter ?? formatNumber;
  const font = useChartFont(FONT_SIZE);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height: h } = e.nativeEvent.layout;
    setCanvasSize({ width, height: h });
  }, []);

  const label = ariaLabel ?? `Sankey chart with ${nodes.length} nodes and ${links.length} flows`;

  const geometry = useMemo(() => {
    if (!canvasSize || nodes.length === 0) {
      return null;
    }

    const layout = layoutSankey(
      nodes,
      links,
      canvasSize.width,
      canvasSize.height,
      nodeWidth,
      nodePadding,
    );

    if (!layout) {
      return null;
    }

    const colorMap = new Map(nodes.map((n, i) => [n.name, n.color ?? palette[i % palette.length]]));

    const positionedNodes = layout.nodes.map((node) => {
      const fill = colorMap.get(node.name) ?? palette[0];
      const isTerminal = node.sourceLinks.length === 0;
      const text = showValues ? `${node.name} (${format(node.value)})` : node.name;
      const textWidth = font?.measureText(text).width ?? 0;
      const labelX = isTerminal ? node.x0 - LABEL_GAP - textWidth : node.x1 + LABEL_GAP;

      return {
        key: node.name,
        x: node.x0,
        y: node.y0,
        width: node.x1 - node.x0,
        height: Math.max(1, node.y1 - node.y0),
        fill,
        text,
        labelPoint: { x: labelX, y: (node.y0 + node.y1) / 2 + FONT_SIZE / 3 },
      };
    });

    const positionedLinks = layout.links.map((link, i) => {
      const cx = (link.source.x1 + link.target.x0) / 2;
      const path = Skia.PathBuilder.Make()
        .moveTo(link.source.x1, link.y0)
        .cubicTo(cx, link.y0, cx, link.y1, link.target.x0, link.y1)
        .build();

      return {
        key: `${link.source.name}-${link.target.name}-${i}`,
        path,
        color: withAlpha(colorMap.get(link.source.name) ?? palette[0], 0.35),
        width: link.width,
      };
    });

    return { nodes: positionedNodes, links: positionedLinks };
  }, [canvasSize, nodes, links, nodeWidth, nodePadding, palette, format, showValues, font]);

  return (
    <ChartContainer
      accessibilityLabel={label}
      legendPosition="bottom"
      height={height}
      legend={null}
    >
      <View style={{ flex: 1 }} onLayout={onLayout}>
        {canvasSize && geometry && (
          <Canvas style={{ width: canvasSize.width, height: canvasSize.height }}>
            {geometry.links.map((link) => (
              <Path
                key={link.key}
                path={link.path}
                style="stroke"
                strokeWidth={link.width}
                color={link.color}
              />
            ))}
            {geometry.nodes.map((node) => (
              <RoundedRect
                key={node.key}
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                r={2}
                color={node.fill}
              />
            ))}
            {font &&
              geometry.nodes.map((node) => (
                <Text
                  key={`label-${node.key}`}
                  x={node.labelPoint.x}
                  y={node.labelPoint.y}
                  text={node.text}
                  font={font}
                  color={theme.windowFgColor}
                />
              ))}
          </Canvas>
        )}
      </View>
    </ChartContainer>
  );
};
