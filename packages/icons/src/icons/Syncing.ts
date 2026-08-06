import type { IconDefinition } from '../types.ts';

/**
 * emblem-synchronizing-symbolic — animated variant of `Refresh`.
 *
 * Static (via `<Icon>`) or spinning (via `<AnimatedIcon>`). Reuses `Refresh`'s
 * exact path data so the "at rest" frame matches the static icon pixel for
 * pixel; only the wrapping `<g>` adds rotation.
 */
export const Syncing: IconDefinition = {
  viewBox: '0 0 16 16',
  animated: true,
  svg: `
    <style>
      .gicon-syncing__spin {
        transform-origin: 8px 8px;
        animation: gicon-syncing-rotate 1.5s linear infinite;
        animation-play-state: var(--gnome-icon-play-state, paused);
      }
      @keyframes gicon-syncing-rotate {
        to { transform: rotate(360deg); }
      }
    </style>
    <g class="gicon-syncing__spin">
      <path fill-rule="evenodd" d="M8 2a6 6 0 0 0-6 6h2a4 4 0 0 1 4-4 4 4 0 0 1 4 4 4 4 0 0 1-4 4v-2L5 13l3 3v-2a6 6 0 0 0 6-6 6 6 0 0 0-6-6z"/>
    </g>
  `,
};
