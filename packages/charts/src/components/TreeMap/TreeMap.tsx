import { ReactElement } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { useLocale } from "@gnome-ui/react";
import { GNOME_CHART_PALETTE } from "../../colors";
import styles from "./TreeMap.module.css";

export interface TreeMapDataItem {
  label: string;
  value: number;
  group?: string;
}

export interface TreeMapProps {
  data: TreeMapDataItem[];
  height?: number;
  showLabels?: boolean;
  className?: string;
}

const TOOLTIP_CONTENT_STYLE = {
  backgroundColor: "var(--gnome-popover-bg-color, #fff)",
  border: "1px solid var(--gnome-light-3, #deddda)",
  borderRadius: "var(--gnome-radius-md, 8px)",
  fontFamily: "var(--gnome-font-family, system-ui)",
  fontSize: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
};

function buildColorMap(data: TreeMapDataItem[]): Map<string, string> {
  const keys: string[] = [];
  for (const item of data) {
    const key = item.group ?? item.label;
    if (!keys.includes(key)) keys.push(key);
  }
  return new Map(
    keys.map((k, i) => [k, GNOME_CHART_PALETTE[i % GNOME_CHART_PALETTE.length]])
  );
}

interface TileProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  value: number;
  group?: string;
  colorMap: Map<string, string>;
  showLabels: boolean;
  formatNumber: (value: number) => string;
}

function Tile({ x, y, width, height, name, value, group, colorMap, showLabels, formatNumber }: TileProps) {
  const colorKey = group ?? name;
  const fill = colorMap.get(colorKey) ?? GNOME_CHART_PALETTE[0];
  const showText = showLabels && width > 40 && height > 24;
  const formattedValue = formatNumber(value);

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke="var(--gnome-window-bg-color, #fff)"
        strokeWidth={2}
        rx={4}
        ry={4}
        role="img"
        aria-label={`${name}: ${formattedValue}`}
      />
      {showText && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - (height > 44 ? 8 : 0)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--gnome-window-fg-color, rgba(255,255,255,0.9))"
            fontSize={12}
            fontFamily="var(--gnome-font-family, system-ui)"
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {name}
          </text>
          {height > 44 && (
            <text
              x={x + width / 2}
              y={y + height / 2 + 10}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--gnome-window-fg-color, rgba(255,255,255,0.7))"
              fontSize={11}
              fontFamily="var(--gnome-font-family, system-ui)"
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              {formattedValue}
            </text>
          )}
        </>
      )}
    </g>
  );
}

export function TreeMap({
  data,
  height = 400,
  showLabels = true,
  className,
}: TreeMapProps) {
  const locale = useLocale();
  const formatNumber = (value: number) => new Intl.NumberFormat(locale).format(value);

  const colorMap = buildColorMap(data);
  const rechartsData = data.map((item) => ({ name: item.label, value: item.value, group: item.group }));

  return (
    <div
      className={[styles.container, className].filter(Boolean).join(" ")}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={rechartsData}
          dataKey="value"
          nameKey="name"
          content={
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((props: any) => (
              <Tile
                x={props.x}
                y={props.y}
                width={props.width}
                height={props.height}
                name={props.name}
                value={props.value}
                group={props.group}
                colorMap={colorMap}
                showLabels={showLabels}
                formatNumber={formatNumber}
              />
            )) as unknown as ReactElement
          }
        >
          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            formatter={(value: number, name: string) => [formatNumber(value), name]}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
