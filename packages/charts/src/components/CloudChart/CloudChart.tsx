import { GNOME_CHART_PALETTE } from "../../colors";
import styles from "./CloudChart.module.css";

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
  className?: string;
  "aria-label"?: string;
}

export function CloudChart({
  data,
  height = 300,
  minFontSize = 12,
  maxFontSize = 48,
  className,
  "aria-label": ariaLabel,
}: CloudChartProps) {
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
    resolvedColor:
      item.color ?? GNOME_CHART_PALETTE[i % GNOME_CHART_PALETTE.length],
  }));

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? `Word cloud with ${data.length} terms`}
      className={[styles.cloud, className].filter(Boolean).join(" ")}
      style={{ minHeight: height }}
    >
      {words.map((word) => (
        <span
          key={word.text}
          className={styles.word}
          style={{
            fontSize: word.fontSize,
            color: word.resolvedColor,
          }}
          aria-label={`${word.text} ${word.value}`}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
}
