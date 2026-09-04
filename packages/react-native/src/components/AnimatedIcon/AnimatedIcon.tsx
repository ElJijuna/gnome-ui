import { Connecting, Downloading, type IconDefinition, Recording, Syncing } from '@gnome-ui/icons';
import { type ComponentType, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { Circle, G, Path, Svg } from 'react-native-svg';
import type { IconProps } from '@/components/Icon';
import { Icon } from '@/components/Icon';
import { ICON_SIZE_MAP, iconAccessibilityProps, resolveIconColor } from '@/components/Icon/shared';
import { useGnomeTheme, useReducedMotion } from '@/GnomeProvider';

export interface AnimatedIconProps extends Omit<IconProps, 'icon'> {
  /** Animated icon from `@gnome-ui/icons` (`animated: true` — `Syncing`, `Recording`, `Downloading`, `Connecting`). */
  icon: IconDefinition;
  /**
   * Whether the animation plays. Defaults to `true`.
   *
   * Regardless of this prop, the animation is always paused when the OS
   * reduced-motion setting is on — callers don't need to check
   * `useReducedMotion()` themselves.
   */
  playing?: boolean;
}

/**
 * `Animated`'s style/prop interpolation only takes effect on `Animated.*`
 * host components — the same gotcha already documented on `Toast`/`Dialog`,
 * here applied to `react-native-svg`'s shape components instead of `View`/
 * `Pressable`. Hoisted to module scope so they aren't recreated per render.
 */
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface MotionProps {
  fill: string;
}

/** Drives a `0 → 1` value on an infinite loop. Used wherever the whole motion can be expressed as one `interpolate()` off a single linear driver. */
function useLoopingProgress(duration: number) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(value, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );

    animation.start();

    return () => animation.stop();
  }, [value, duration]);

  return value;
}

/** Same as `useLoopingProgress`, but the repeating loop only starts after an initial one-time `delay` — for staggering identical cycles (`Connecting`'s three dots) out of phase with each other. */
function useDelayedLoopingProgress(duration: number, delay: number) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.timing(value, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ),
    ]);

    animation.start();

    return () => animation.stop();
  }, [value, duration, delay]);

  return value;
}

/**
 * `emblem-synchronizing-symbolic` — rotates a full turn, 1.5s linear, mirroring
 * `@gnome-ui/icons`' `Syncing.svg` `@keyframes gicon-syncing-rotate`.
 * Reuses `Refresh`'s exact path data, same as the source icon.
 */
const SyncingMotion = ({ fill }: MotionProps) => {
  const progress = useLoopingProgress(1500);
  const transform = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['rotate(0, 8, 8)', 'rotate(360, 8, 8)'],
  });

  return (
    <AnimatedG transform={transform}>
      <Path
        fill={fill}
        fillRule="evenodd"
        d="M8 2a6 6 0 0 0-6 6h2a4 4 0 0 1 4-4 4 4 0 0 1 4 4 4 4 0 0 1-4 4v-2L5 13l3 3v-2a6 6 0 0 0 6-6 6 6 0 0 0-6-6z"
      />
    </AnimatedG>
  );
};

/**
 * `media-record-symbolic` — opacity pulse `1 → 0.35 → 1`, 1.2s ease-in-out,
 * mirroring `Recording.svg`'s `@keyframes gicon-recording-pulse`.
 */
const RecordingMotion = ({ fill }: MotionProps) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const easing = Easing.inOut(Easing.ease);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.35, duration: 600, easing, useNativeDriver: false }),
        Animated.timing(opacity, { toValue: 1, duration: 600, easing, useNativeDriver: false }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <AnimatedPath
      fill={fill}
      opacity={opacity}
      d="m 15 8 c 0 3.867188 -3.132812 7 -7 7 s -7 -3.132812 -7 -7 s 3.132812 -7 7 -7 s 7 3.132812 7 7 z m 0 0"
    />
  );
};

/**
 * Animated download indicator — static tray bar, arrow drops into it on a
 * loop (translateY + opacity), 1.4s, mirroring `Downloading.svg`'s
 * `@keyframes gicon-downloading-drop`. The five CSS keyframe stops
 * (`0%, 20%, 50%, 55%, 80%, 100%`) become one `interpolate()`'s
 * `inputRange` off a single linear `0 → 1` driver — good enough fidelity
 * for a decorative micro-interaction without chaining five separately-eased
 * `Animated.timing` segments.
 */
const DownloadingMotion = ({ fill }: MotionProps) => {
  const progress = useLoopingProgress(1400);
  const stops = [0, 0.2, 0.5, 0.55, 0.8, 1];
  const transform = progress.interpolate({
    inputRange: stops,
    outputRange: [
      'translate(0, 0)',
      'translate(0, 0)',
      'translate(0, 3)',
      'translate(0, -3)',
      'translate(0, 0)',
      'translate(0, 0)',
    ],
  });
  const opacity = progress.interpolate({ inputRange: stops, outputRange: [1, 1, 0, 0, 1, 1] });

  return (
    <>
      <Path fill={fill} d="M2 13h12v2H2z" />
      <AnimatedG transform={transform} opacity={opacity}>
        <Path fill={fill} fillRule="evenodd" d="m2.5 5 5.5 6 5.5-6z" />
      </AnimatedG>
    </>
  );
};

/** `scale(s)` around an arbitrary `(cx, cy)` pivot, composed as SVG's own translate/scale/translate-back — `react-native-svg`'s dedicated `scale` prop takes a `NumberArray`, not a single animatable number, and its non-deprecated `scaleX`/`scaleY` still can't share one `Animated.Value` with `origin` cleanly, so a plain `transform` string is the most direct fit. */
function scaleAround(cx: number, cy: number, scale: number) {
  return `translate(${cx}, ${cy}) scale(${scale}) translate(${-cx}, ${-cy})`;
}

interface ConnectingDotProps {
  cx: number;
  cy: number;
  fill: string;
  delay: number;
}

/** One of `Connecting`'s three signal dots — opacity + scale pulse, 1.2s ease-in-out, staggered via `delay` so the three read as a left-to-right sweep, mirroring `Connecting.svg`'s `animation-delay: 0/0.15s/0.3s`. */
const ConnectingDot = ({ cx, cy, fill, delay }: ConnectingDotProps) => {
  const progress = useDelayedLoopingProgress(1200, delay);
  const stops = [0, 0.2, 0.4, 1];
  const opacity = progress.interpolate({ inputRange: stops, outputRange: [1, 0.3, 1, 1] });
  const transform = progress.interpolate({
    inputRange: stops,
    outputRange: [
      scaleAround(cx, cy, 1),
      scaleAround(cx, cy, 0.7),
      scaleAround(cx, cy, 1),
      scaleAround(cx, cy, 1),
    ],
  });

  return (
    <AnimatedCircle cx={cx} cy={cy} r={2} fill={fill} opacity={opacity} transform={transform} />
  );
};

/**
 * `network-wireless-acquiring-symbolic` — static device/arc path, three
 * signal dots pulsing in a staggered sweep, mirroring `Connecting.svg`.
 */
const ConnectingMotion = ({ fill }: MotionProps) => {
  return (
    <>
      <Path
        fill={fill}
        d="m 8 1.992188 c -2.617188 0 -5.238281 0.933593 -7.195312 2.808593 l -0.496094 0.480469 c -0.3984378 0.378906 -0.410156 1.011719 -0.03125 1.410156 c 0.003906 0.007813 0.011718 0.011719 0.019531 0.015625 c 0.480469 -1.011719 1.503906 -1.707031 2.703125 -1.707031 h 0.9375 c 2.480469 -1.292969 5.644531 -1.292969 8.125 0 h 0.9375 c 1.199219 0 2.222656 0.695312 2.707031 1.707031 c 0.003907 -0.007812 0.011719 -0.011719 0.015625 -0.015625 c 0.378906 -0.398437 0.367188 -1.03125 -0.03125 -1.410156 l -0.496094 -0.480469 c -1.957031 -1.875 -4.578124 -2.808593 -7.195312 -2.808593 z m -1.730469 9.007812 c -0.441406 0.765625 -0.339843 1.757812 0.316407 2.414062 c 0.78125 0.78125 2.046874 0.78125 2.828124 0 c 0.65625 -0.65625 0.757813 -1.648437 0.316407 -2.414062 z m 0 0"
      />
      <ConnectingDot cx={3} cy={8} fill={fill} delay={0} />
      <ConnectingDot cx={8} cy={8} fill={fill} delay={150} />
      <ConnectingDot cx={13} cy={8} fill={fill} delay={300} />
    </>
  );
};

/**
 * Known animated icons, matched by referential identity against
 * `@gnome-ui/icons`' own exports. There is no generic way to interpret an
 * arbitrary icon's `svg`-embedded CSS `@keyframes` in RN (no CSS engine),
 * so each recipe is hand-built — this registry only covers the 4 icons
 * `@gnome-ui/icons` currently ships as `animated: true`. An icon that isn't
 * in it (a future 5th animated icon, or a consumer-authored one) falls back
 * to the static `<Icon>` frame — `playing` silently has no visible effect
 * rather than throwing.
 */
const RECIPES = new Map<IconDefinition, ComponentType<MotionProps>>([
  [Syncing, SyncingMotion],
  [Recording, RecordingMotion],
  [Downloading, DownloadingMotion],
  [Connecting, ConnectingMotion],
]);

/**
 * Plays the motion for a known `animated` icon from `@gnome-ui/icons`
 * (`Syncing`, `Recording`, `Downloading`, `Connecting`) — rendered through
 * plain `<Icon>`, these show a static frame instead.
 *
 * Unlike `@gnome-ui/react`'s `AnimatedIcon` (which plays a CSS animation
 * embedded in the icon's raw `svg` markup via a `--gnome-icon-play-state`
 * custom property), RN has no CSS engine to interpret `@keyframes` at all —
 * `<Icon>` already drops the `<style>` block silently (see its own doc
 * comment), and this component instead hand-builds each of the 4 known
 * icons' exact motion with `Animated`, matched against `RECIPES` by
 * reference. When playing and reduced motion is off, it renders its own
 * `<Svg>` with the matching `*Motion` recipe as children; otherwise (not
 * playing, reduced motion on, or an icon `RECIPES` doesn't recognize) it
 * defers straight to `<Icon>`.
 *
 * Useful for progress, sync, recording, download, and connection states, or
 * cross-fading between icons by swapping `icon` while `playing` stays true.
 *
 * @example
 * import { Syncing } from "@gnome-ui/icons";
 * <AnimatedIcon icon={Syncing} playing={isSyncing} label="Syncing" />
 */
export const AnimatedIcon = ({
  icon,
  playing = true,
  size = 'md',
  width,
  height,
  label,
  color,
}: AnimatedIconProps) => {
  const theme = useGnomeTheme();
  const reducedMotion = useReducedMotion();
  const isPlaying = playing && !reducedMotion;
  const Motion = isPlaying ? RECIPES.get(icon) : undefined;

  if (!Motion) {
    return (
      <Icon icon={icon} size={size} width={width} height={height} label={label} color={color} />
    );
  }

  const px = ICON_SIZE_MAP[size];
  const fill = resolveIconColor(theme, color);
  const accessibilityProps = iconAccessibilityProps(label);

  return (
    <Svg viewBox={icon.viewBox} width={width ?? px} height={height ?? px} {...accessibilityProps}>
      <Motion fill={fill} />
    </Svg>
  );
};
