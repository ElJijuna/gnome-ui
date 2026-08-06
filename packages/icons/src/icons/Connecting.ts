import type { IconDefinition } from '../types.ts';

/**
 * network-wireless-acquiring-symbolic — animated variant of
 * `NetworkWirelessAcquiring`.
 *
 * Reuses that icon's exact device/arc path verbatim as a static base; the
 * three signal dots (same centers and radius as the original path's dot
 * subpaths, expressed as `<circle>` for animation) pulse in sequence to
 * suggest an active connection attempt.
 */
export const Connecting: IconDefinition = {
  viewBox: '0 0 16 16',
  animated: true,
  svg: `
    <style>
      .gicon-connecting__dot {
        transform-box: fill-box;
        transform-origin: center;
        animation: gicon-connecting-pulse 1.2s ease-in-out infinite;
        animation-play-state: var(--gnome-icon-play-state, paused);
      }
      .gicon-connecting__dot:nth-of-type(2) { animation-delay: 0.15s; }
      .gicon-connecting__dot:nth-of-type(3) { animation-delay: 0.3s; }
      @keyframes gicon-connecting-pulse {
        0%, 40%, 100% { opacity: 1; transform: scale(1); }
        20% { opacity: 0.3; transform: scale(0.7); }
      }
    </style>
    <path d="m 8 1.992188 c -2.617188 0 -5.238281 0.933593 -7.195312 2.808593 l -0.496094 0.480469 c -0.3984378 0.378906 -0.410156 1.011719 -0.03125 1.410156 c 0.003906 0.007813 0.011718 0.011719 0.019531 0.015625 c 0.480469 -1.011719 1.503906 -1.707031 2.703125 -1.707031 h 0.9375 c 2.480469 -1.292969 5.644531 -1.292969 8.125 0 h 0.9375 c 1.199219 0 2.222656 0.695312 2.707031 1.707031 c 0.003907 -0.007812 0.011719 -0.011719 0.015625 -0.015625 c 0.378906 -0.398437 0.367188 -1.03125 -0.03125 -1.410156 l -0.496094 -0.480469 c -1.957031 -1.875 -4.578124 -2.808593 -7.195312 -2.808593 z m -1.730469 9.007812 c -0.441406 0.765625 -0.339843 1.757812 0.316407 2.414062 c 0.78125 0.78125 2.046874 0.78125 2.828124 0 c 0.65625 -0.65625 0.757813 -1.648437 0.316407 -2.414062 z m 0 0"/>
    <circle class="gicon-connecting__dot" cx="3" cy="8" r="2"/>
    <circle class="gicon-connecting__dot" cx="8" cy="8" r="2"/>
    <circle class="gicon-connecting__dot" cx="13" cy="8" r="2"/>
  `,
};
