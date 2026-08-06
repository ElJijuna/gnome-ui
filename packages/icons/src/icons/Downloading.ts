import type { IconDefinition } from '../types.ts';

/**
 * Animated download indicator — static tray bar with an arrow (`PanDown`'s
 * exact triangle) dropping into it on a loop.
 *
 * Static (via `<Icon>`, arrow at rest above the tray) or animated (via
 * `<AnimatedIcon>`).
 */
export const Downloading: IconDefinition = {
  viewBox: '0 0 16 16',
  animated: true,
  svg: `
    <style>
      .gicon-downloading__arrow {
        transform-origin: 8px 8px;
        animation: gicon-downloading-drop 1.4s ease-in infinite;
        animation-play-state: var(--gnome-icon-play-state, paused);
      }
      @keyframes gicon-downloading-drop {
        0%, 20%, 100% { transform: translateY(0); opacity: 1; }
        50% { transform: translateY(3px); opacity: 0; }
        55% { transform: translateY(-3px); opacity: 0; }
        80% { transform: translateY(0); opacity: 1; }
      }
    </style>
    <path d="M2 13h12v2H2z"/>
    <path class="gicon-downloading__arrow" fill-rule="evenodd" d="m2.5 5 5.5 6 5.5-6z"/>
  `,
};
