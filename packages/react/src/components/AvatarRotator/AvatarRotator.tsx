import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { Avatar, type AvatarColor, type AvatarSize } from "../Avatar";
import styles from "./AvatarRotator.module.css";

export interface AvatarRotatorProps extends HTMLAttributes<HTMLSpanElement> {
  /** Full name used for the accessible label and initials fallback. */
  name?: string;
  /** Image URLs to rotate through. */
  avatars?: string[];
  /** Accessible label. Defaults to `name`. */
  alt?: string;
  /** Size of the avatar. Defaults to `"md"`. */
  size?: AvatarSize;
  /** Fallback initials color when no avatar image is available. */
  color?: AvatarColor;
  /** Time between avatar changes in milliseconds. Defaults to `3000`. */
  interval?: number;
  /** Crossfade duration in milliseconds. Defaults to `240`. */
  transitionDuration?: number;
  /** Pause automatic rotation while hovered or focused. Defaults to `true`. */
  pauseOnHover?: boolean;
  /**
   * Controlled active avatar index.
   * When omitted the rotator manages index state internally.
   */
  activeIndex?: number;
  /** Initial active avatar index for uncontrolled usage. Defaults to `0`. */
  defaultActiveIndex?: number;
  /** Called when the active avatar changes. */
  onIndexChange?: (index: number) => void;
}

function clampIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(query.matches);

    const handleChange = () => setPrefersReducedMotion(query.matches);
    query.addEventListener?.("change", handleChange);
    return () => query.removeEventListener?.("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Single avatar surface that rotates through multiple image sources.
 *
 * Keeps `Avatar` focused on rendering one identity, while this component owns
 * timing, crossfade animation, and pause behavior.
 */
export function AvatarRotator({
  name = "",
  avatars = [],
  alt,
  size = "md",
  color,
  interval = 3000,
  transitionDuration = 240,
  pauseOnHover = true,
  activeIndex,
  defaultActiveIndex = 0,
  onIndexChange,
  className,
  style,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...props
}: AvatarRotatorProps) {
  const sources = useMemo(
    () => avatars.map((src) => src.trim()).filter(Boolean),
    [avatars],
  );
  const isControlled = activeIndex !== undefined;
  const [internalIndex, setInternalIndex] = useState(defaultActiveIndex);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const currentIndex = clampIndex(
    isControlled ? activeIndex : internalIndex,
    sources.length,
  );

  useEffect(() => {
    if (sources.length <= 1) return;
    if (interval <= 0) return;
    if (isPaused || prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      const nextIndex = clampIndex(currentIndex + 1, sources.length);
      if (!isControlled) setInternalIndex(nextIndex);
      onIndexChange?.(nextIndex);
    }, interval);

    return () => window.clearInterval(timer);
  }, [
    currentIndex,
    interval,
    isControlled,
    isPaused,
    onIndexChange,
    prefersReducedMotion,
    sources.length,
  ]);

  if (sources.length === 0) {
    return (
      <Avatar
        name={name}
        alt={alt}
        size={size}
        color={color}
        className={className}
        style={style}
        {...props}
      />
    );
  }

  const label = alt ?? name ?? "Avatar";
  const transitionStyle = {
    ...style,
    "--avatar-rotator-duration": `${Math.max(0, transitionDuration)}ms`,
  } as CSSProperties;

  return (
    <span
      role="img"
      aria-label={label}
      className={[styles.rotator, styles[size], className]
        .filter(Boolean)
        .join(" ")}
      style={transitionStyle}
      onMouseEnter={(event) => {
        if (pauseOnHover) setIsPaused(true);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        if (pauseOnHover) setIsPaused(false);
        onMouseLeave?.(event);
      }}
      onFocus={(event) => {
        if (pauseOnHover) setIsPaused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        if (pauseOnHover) setIsPaused(false);
        onBlur?.(event);
      }}
      {...props}
    >
      {sources.map((src, index) => (
        <Avatar
          key={`${src}-${index}`}
          name={name}
          src={src}
          alt=""
          size={size}
          aria-hidden="true"
          className={[
            styles.layer,
            index === currentIndex ? styles.active : null,
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ))}
    </span>
  );
}
