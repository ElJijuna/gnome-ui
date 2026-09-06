import { type ReactNode, useEffect, useRef, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Animated, Pressable, StyleSheet } from 'react-native';

import { Avatar, type AvatarColor, type AvatarSize } from '@/components/Avatar';
import { useReducedMotion } from '@/GnomeProvider';

export interface AvatarRotatorProps {
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
  /** Pause automatic rotation while pressed and held. Defaults to `true`. */
  pauseOnPress?: boolean;
  /**
   * Controlled active avatar index.
   * When omitted the rotator manages index state internally.
   */
  activeIndex?: number;
  /** Initial active avatar index for uncontrolled usage. Defaults to `0`. */
  defaultActiveIndex?: number;
  /** Called when the active avatar changes. */
  onIndexChange?: (index: number) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function clampIndex(index: number, length: number) {
  if (length <= 0) {
    return 0;
  }

  return ((index % length) + length) % length;
}

const SIZE_BOX: Record<AvatarSize, number> = { sm: 24, md: 32, lg: 48, xl: 64 };

interface RotatorLayerProps {
  active: boolean;
  duration: number;
  reducedMotion: boolean;
  children: ReactNode;
}

/**
 * One crossfading layer — owns its own `Animated.Value` rather than the
 * parent tracking an array of them, the same "each item animates itself"
 * shape `Toast`/`Toaster` already established for a list of independently
 * transitioning items.
 */
const RotatorLayer = ({ active, duration, reducedMotion, children }: RotatorLayerProps) => {
  const opacity = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    if (reducedMotion) {
      opacity.setValue(active ? 1 : 0);

      return;
    }

    Animated.timing(opacity, {
      toValue: active ? 1 : 0,
      duration,
      useNativeDriver: true,
    }).start();
  }, [active, duration, reducedMotion, opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[StyleSheet.absoluteFill, { opacity }]}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Single avatar surface that crossfades through multiple image sources.
 * Mirrors `@gnome-ui/react`'s `AvatarRotator`. Keeps `Avatar` focused on
 * rendering one identity, while this component owns timing, crossfade
 * animation, and pause behavior.
 *
 * Each source renders as its own absolutely-positioned `Avatar`, layered
 * via `StyleSheet.absoluteFill` and crossfaded with `Animated.timing` on
 * `useNativeDriver: true` — an exact reproduction of the web version's
 * stacked-`.layer`-elements-with-opacity-transition technique, just with
 * `RotatorLayer` (see above) owning each layer's own `Animated.Value`
 * instead of a single shared CSS custom property driving them all.
 *
 * **`prefers-reduced-motion` stops the rotation outright, not just the
 * fade** — ported exactly: the web source's own auto-advance `useEffect`
 * bails out early when reduced motion is on, the same as when paused, so
 * this isn't merely an instant-swap-instead-of-crossfade case like
 * `ProgressBar`'s determinate transitions.
 *
 * The web version's `pauseOnHover` (mouseEnter/mouseLeave, focus/blur)
 * becomes `pauseOnPress` (`onPressIn`/`onPressOut`) — the same touch
 * substitution `Toast`'s own press-and-hold pause already established,
 * kept as a real toggleable prop here (unlike `Toast`, where the web
 * source bakes the behavior in without an escape hatch).
 * `usePrefersReducedMotion` (the web version's `@gnome-ui/hooks` import)
 * has no bearing here — this package's own `useReducedMotion()` from
 * `GnomeProvider` is the correct, already-established source for this.
 *
 * `role="img"` + `accessibilityLabel` ports 1:1 from RN's newer
 * web-aligned `Role` union (the same `Avatar`/`AvatarGroup` precedent).
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Avatar.html
 */
export const AvatarRotator = ({
  name = '',
  avatars = [],
  alt,
  size = 'md',
  color,
  interval = 3000,
  transitionDuration = 240,
  pauseOnPress = true,
  activeIndex,
  defaultActiveIndex = 0,
  onIndexChange,
  style,
  testID,
}: AvatarRotatorProps) => {
  const reducedMotion = useReducedMotion();
  const sources = avatars.map((src) => src.trim()).filter(Boolean);
  const isControlled = activeIndex !== undefined;
  const [internalIndex, setInternalIndex] = useState(defaultActiveIndex);
  const [isPaused, setIsPaused] = useState(false);
  const currentIndex = clampIndex(isControlled ? activeIndex : internalIndex, sources.length);

  useEffect(() => {
    if (sources.length <= 1 || interval <= 0 || isPaused || reducedMotion) {
      return;
    }

    const timer = setInterval(() => {
      const nextIndex = clampIndex(currentIndex + 1, sources.length);

      if (!isControlled) {
        setInternalIndex(nextIndex);
      }

      onIndexChange?.(nextIndex);
    }, interval);

    return () => clearInterval(timer);
  }, [
    currentIndex,
    interval,
    isControlled,
    isPaused,
    onIndexChange,
    reducedMotion,
    sources.length,
  ]);

  if (sources.length === 0) {
    return <Avatar name={name} alt={alt} size={size} color={color} style={style} />;
  }

  const label = alt ?? (name || undefined) ?? 'Avatar';
  const box = SIZE_BOX[size];

  return (
    <Pressable
      testID={testID}
      accessible
      role="img"
      accessibilityLabel={label}
      onPressIn={() => pauseOnPress && setIsPaused(true)}
      onPressOut={() => pauseOnPress && setIsPaused(false)}
      style={[{ width: box, height: box, borderRadius: box / 2, overflow: 'hidden' }, style]}
    >
      {sources.map((src, index) => (
        <RotatorLayer
          key={`${src}-${index}`}
          active={index === currentIndex}
          duration={Math.max(0, transitionDuration)}
          reducedMotion={reducedMotion}
        >
          <Avatar name={name} src={src} size={size} />
        </RotatorLayer>
      ))}
    </Pressable>
  );
};
