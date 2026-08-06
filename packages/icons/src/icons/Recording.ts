import type { IconDefinition } from '../types.ts';

/**
 * media-record-symbolic — animated variant of `MediaRecord`.
 *
 * Static (via `<Icon>`) or blinking (via `<AnimatedIcon>`). Reuses
 * `MediaRecord`'s exact path data; only the wrapping `<g>` adds the pulse.
 */
export const Recording: IconDefinition = {
  viewBox: '0 0 16 16',
  animated: true,
  svg: `
    <style>
      .gicon-recording__pulse {
        transform-origin: 8px 8px;
        animation: gicon-recording-pulse 1.2s ease-in-out infinite;
        animation-play-state: var(--gnome-icon-play-state, paused);
      }
      @keyframes gicon-recording-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.35; }
      }
    </style>
    <g class="gicon-recording__pulse">
      <path d="m 15 8 c 0 3.867188 -3.132812 7 -7 7 s -7 -3.132812 -7 -7 s 3.132812 -7 7 -7 s 7 3.132812 7 7 z m 0 0"/>
    </g>
  `,
};
