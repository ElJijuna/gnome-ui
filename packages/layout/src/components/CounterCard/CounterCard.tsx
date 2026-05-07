import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import { Card, Icon, Text, useLocale } from "@gnome-ui/react";
import type { IconDefinition } from "@gnome-ui/icons";
import styles from "./CounterCard.module.css";

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Animates a number from its previous value to `target`.
 * Re-animates from the mid-point when `target` changes while running.
 * Respects `prefers-reduced-motion`.
 */
function useCountUp(target: number, duration: number, enabled: boolean): number {
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);
  const rafRef     = useRef<number | null>(null);

  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!enabled || reducedMotion) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      displayRef.current = target;
      setDisplay(target);
      return;
    }

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    const startValue = displayRef.current;
    const startTime  = performance.now();

    function tick(now: number) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic — starts fast, decelerates at the end
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = startValue + (target - startValue) * eased;

      displayRef.current = value;
      setDisplay(value);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [target, duration, enabled]);

  return display;
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface CounterCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Text label shown above the value. */
  label: string;
  /** The numeric target value. */
  value: number;
  /** String prepended to the formatted number (e.g. `"$"`). */
  prefix?: string;
  /** String appended to the formatted number (e.g. `" files"`, `" GB"`). */
  suffix?: string;
  /**
   * Number of decimal places to show.
   * Intermediate animation frames are rounded to this precision.
   * Defaults to `0`.
   */
  decimals?: number;
  /**
   * Custom formatter applied to the raw (animated) number.
   * When provided, `decimals` is ignored for display purposes.
   */
  format?: (value: number) => string;
  /**
   * Animate the value counting up from `0` (or from the previous value when
   * `value` changes). Set to `false` to disable animation.
   * Defaults to `true`.
   */
  animated?: boolean;
  /**
   * Animation duration in milliseconds.
   * Defaults to `1000`.
   */
  duration?: number;
  /**
   * Render the value in the accent color.
   * Defaults to `false`.
   */
  accent?: boolean;
  /** Make the card interactive (clickable). Passed to `Card`. */
  interactive?: boolean;
  /** Icon rendered in a tinted badge in the top-right corner of the card. */
  icon?: IconDefinition;
  /**
   * Per-card accent color (CSS color string, e.g. `"#3584e4"`).
   * Drives the icon badge background tint and the value text color.
   * Takes precedence over the `accent` boolean when provided.
   */
  color?: string;
  /** Short trend line rendered below the value in a muted success color. */
  trend?: string;
}

export function CounterCard({
  label,
  value,
  prefix,
  suffix,
  decimals = 0,
  format,
  animated = true,
  duration = 1000,
  accent = false,
  interactive = false,
  icon,
  color,
  trend,
  className,
  style,
  ...props
}: CounterCardProps) {
  const locale = useLocale();
  const raw = useCountUp(value, duration, animated);

  const numberFormat = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const formatted = format ? format(raw) : numberFormat.format(raw);

  const useColor = Boolean(color);

  return (
    <Card
      interactive={interactive}
      className={[styles.card, className].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      <div className={styles.header}>
        <Text variant="caption" color="dim" className={styles.label}>
          {label}
        </Text>
        {icon && (
          <div
            className={styles.iconBadge}
            style={{
              background: color
                ? `color-mix(in srgb, ${color} 15%, transparent)`
                : "var(--gnome-hover-overlay, rgba(0,0,0,0.06))",
              color: color ?? undefined,
            }}
          >
            <Icon icon={icon} size="sm" />
          </div>
        )}
      </div>
      <span
        className={[
          styles.value,
          useColor ? null : accent ? styles.accent : null,
        ]
          .filter(Boolean)
          .join(" ")}
        style={useColor ? { color } : undefined}
        aria-live="polite"
        aria-atomic="true"
        aria-label={`${label}: ${prefix ?? ""}${numberFormat.format(value)}${suffix ?? ""}`}
      >
        {prefix && <span className={styles.affix}>{prefix}</span>}
        <Text variant="title-2" as="span" className={styles.number}>
          {formatted}
        </Text>
        {suffix && <span className={styles.affix}>{suffix}</span>}
      </span>
      {trend && (
        <Text variant="caption" className={styles.trend}>
          {trend}
        </Text>
      )}
    </Card>
  );
}
