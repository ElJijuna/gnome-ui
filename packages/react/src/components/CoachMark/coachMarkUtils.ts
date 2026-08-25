/**
 * Positioning helpers for `CoachMark`. Kept pure and DOM-measurement-free so
 * they can be unit-tested directly; the component feeds them real rects.
 *
 * The algorithm mirrors `Popover`'s viewport-aware flip: try the preferred side,
 * then its opposite, then the rest, picking the first that fits; clamp the
 * cross-axis and shift the arrow when nothing fits perfectly.
 */

export type CoachMarkPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface BubblePosition {
  top: number;
  left: number;
  placement: CoachMarkPlacement;
  /** Arrow centre offset in px from the near edge of the bubble. */
  arrowOffset: number;
}

const GAP = 12;
const MARGIN = 12;
const ARROW_HALF = 7;

/** Grow a rect outward by `pad` on every side, e.g. the spotlight cutout. */
export const padRect = (rect: Rect, pad: number): Rect => ({
  top: rect.top - pad,
  left: rect.left - pad,
  width: rect.width + pad * 2,
  height: rect.height + pad * 2,
});

/**
 * Place the callout bubble around `target`, flipping to stay inside a
 * `viewport` (width × height). `bubble` is the measured bubble size.
 */
export const computeBubblePosition = (
  target: Rect,
  bubble: { width: number; height: number },
  viewport: { width: number; height: number },
  preferred: CoachMarkPlacement,
): BubblePosition => {
  const targetRight = target.left + target.width;
  const targetBottom = target.top + target.height;
  const targetCX = target.left + target.width / 2;
  const targetCY = target.top + target.height / 2;

  const opposite: Record<CoachMarkPlacement, CoachMarkPlacement> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };
  const candidates = [
    ...new Set<CoachMarkPlacement>([
      preferred,
      opposite[preferred],
      'bottom',
      'top',
      'right',
      'left',
    ]),
  ];

  const raw = (p: CoachMarkPlacement) => {
    switch (p) {
      case 'bottom':
        return { top: targetBottom + GAP, left: targetCX - bubble.width / 2 };
      case 'top':
        return { top: target.top - bubble.height - GAP, left: targetCX - bubble.width / 2 };
      case 'left':
        return { top: targetCY - bubble.height / 2, left: target.left - bubble.width - GAP };
      default:
        return { top: targetCY - bubble.height / 2, left: targetRight + GAP };
    }
  };

  // First pass: a side that fits both axes cleanly.
  for (const p of candidates) {
    const { top, left } = raw(p);
    const fitsH = left >= MARGIN && left + bubble.width <= viewport.width - MARGIN;
    const fitsV = top >= MARGIN && top + bubble.height <= viewport.height - MARGIN;
    if (fitsH && fitsV) {
      const arrowOffset = p === 'top' || p === 'bottom' ? targetCX - left : targetCY - top;
      return { top, left, placement: p, arrowOffset };
    }
  }

  // Second pass: primary axis fits; clamp the cross axis, keep the arrow on target.
  for (const p of candidates) {
    const { top, left } = raw(p);
    if (p === 'top' || p === 'bottom') {
      const fitsV = top >= MARGIN && top + bubble.height <= viewport.height - MARGIN;
      if (!fitsV) {
        continue;
      }
      const clampedLeft = Math.max(MARGIN, Math.min(left, viewport.width - bubble.width - MARGIN));
      const offset = targetCX - clampedLeft;
      return {
        top,
        left: clampedLeft,
        placement: p,
        arrowOffset: Math.max(ARROW_HALF + 4, Math.min(offset, bubble.width - ARROW_HALF - 4)),
      };
    }
    const fitsH = left >= MARGIN && left + bubble.width <= viewport.width - MARGIN;
    if (!fitsH) {
      continue;
    }
    const clampedTop = Math.max(MARGIN, Math.min(top, viewport.height - bubble.height - MARGIN));
    const offset = targetCY - clampedTop;
    return {
      top: clampedTop,
      left,
      placement: p,
      arrowOffset: Math.max(ARROW_HALF + 4, Math.min(offset, bubble.height - ARROW_HALF - 4)),
    };
  }

  // Fallback: clamp a bottom placement into the viewport.
  const fbTop = targetBottom + GAP;
  const fbLeft = targetCX - bubble.width / 2;
  const clampedTop = Math.max(MARGIN, Math.min(fbTop, viewport.height - bubble.height - MARGIN));
  const clampedLeft = Math.max(MARGIN, Math.min(fbLeft, viewport.width - bubble.width - MARGIN));
  const offset = targetCX - clampedLeft;
  return {
    top: clampedTop,
    left: clampedLeft,
    placement: 'bottom',
    arrowOffset: Math.max(ARROW_HALF + 4, Math.min(offset, bubble.width - ARROW_HALF - 4)),
  };
};
