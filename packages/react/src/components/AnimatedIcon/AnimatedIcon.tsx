import type { IconDefinition } from '@gnome-ui/icons';
import type { CSSProperties } from 'react';

import { Icon, type IconProps } from '@/components/Icon';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export interface AnimatedIconProps extends Omit<IconProps, 'icon'> {
  /** Animated icon from `@gnome-ui/icons` (`animated: true`, e.g. `Syncing`, `Recording`). */
  icon: IconDefinition;
  /**
   * Whether the animation plays. Defaults to `true`.
   *
   * Regardless of this prop, the animation is always paused when the OS
   * `prefers-reduced-motion` setting is on — callers don't need to check it
   * themselves, though doing so (e.g. to skip starting a poll loop) is fine.
   */
  playing?: boolean;
}

/**
 * Plays the CSS animation embedded in an `animated` icon from
 * `@gnome-ui/icons` (`Syncing`, `Recording`, `Downloading`, `Connecting`, …)
 * — rendered through plain `<Icon>`, these show a static frame instead.
 *
 * Useful for progress, sync, recording, download, and connection states, or
 * cross-fading between icons by swapping `icon` while `playing` stays true.
 *
 * @example
 * import { Syncing } from "@gnome-ui/icons";
 * <AnimatedIcon icon={Syncing} playing={isSyncing} label="Syncing" />
 */
export const AnimatedIcon = ({ icon, playing = true, style, ...props }: AnimatedIconProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isPlaying = playing && !prefersReducedMotion;

  const playStateStyle = {
    ...style,
    '--gnome-icon-play-state': isPlaying ? 'running' : 'paused',
  } as CSSProperties;

  return <Icon icon={icon} style={playStateStyle} {...props} />;
};
