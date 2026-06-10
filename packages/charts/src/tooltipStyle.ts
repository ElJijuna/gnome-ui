import type { CSSProperties } from 'react';

/**
 * Shared Recharts `contentStyle` — adapts to light/dark via CSS custom
 * properties set by `@gnome-ui/core` tokens and `GnomeProvider`.
 *
 * Pass to every `<Tooltip contentStyle={GNOME_TOOLTIP_STYLE} />`.
 * Also pass `itemStyle={GNOME_TOOLTIP_ITEM_STYLE}` to color series labels.
 */
export const GNOME_TOOLTIP_STYLE: CSSProperties = {
  backgroundColor: 'var(--gnome-popover-bg-color, #ffffff)',
  color: 'var(--gnome-popover-fg-color, rgba(0,0,0,0.8))',
  border: '1px solid var(--gnome-border-subtle, rgba(0,0,0,0.15))',
  borderRadius: 'var(--gnome-radius-md, 8px)',
  fontFamily: 'var(--gnome-font-family, system-ui)',
  fontSize: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
};

export const GNOME_TOOLTIP_ITEM_STYLE: CSSProperties = {
  color: 'var(--gnome-popover-fg-color, rgba(0,0,0,0.8))',
};
