export type FloatingPlacement = 'bottom' | 'left' | 'right' | 'top';

export interface FloatingPosition {
  arrowOffset: number;
  left: number;
  placement: FloatingPlacement;
  top: number;
}

const GAP = 10;
const VIEWPORT_MARGIN = 8;
const ARROW_EDGE_MARGIN = 10;

function opposite(placement: FloatingPlacement): FloatingPlacement {
  if (placement === 'bottom') {
    return 'top';
  }

  if (placement === 'top') {
    return 'bottom';
  }

  return placement === 'left' ? 'right' : 'left';
}

function rawPosition(trigger: DOMRect, content: DOMRect, placement: FloatingPlacement) {
  if (placement === 'bottom') {
    return {
      left: trigger.left + trigger.width / 2 - content.width / 2,
      top: trigger.bottom + GAP,
    };
  }

  if (placement === 'top') {
    return {
      left: trigger.left + trigger.width / 2 - content.width / 2,
      top: trigger.top - content.height - GAP,
    };
  }

  if (placement === 'left') {
    return {
      left: trigger.left - content.width - GAP,
      top: trigger.top + trigger.height / 2 - content.height / 2,
    };
  }

  return {
    left: trigger.right + GAP,
    top: trigger.top + trigger.height / 2 - content.height / 2,
  };
}

export function computeFloatingPosition(
  trigger: DOMRect,
  content: DOMRect,
  preferred: FloatingPlacement,
  viewport = { height: window.innerHeight, width: window.innerWidth },
): FloatingPosition {
  const candidates = [
    ...new Set<FloatingPlacement>([
      preferred,
      opposite(preferred),
      'bottom',
      'top',
      'right',
      'left',
    ]),
  ];

  let placement = preferred;
  let position = rawPosition(trigger, content, placement);
  let foundPerfectFit = false;

  for (const candidate of candidates) {
    const candidatePosition = rawPosition(trigger, content, candidate);
    const fitsHorizontally =
      candidatePosition.left >= VIEWPORT_MARGIN &&
      candidatePosition.left + content.width <= viewport.width - VIEWPORT_MARGIN;
    const fitsVertically =
      candidatePosition.top >= VIEWPORT_MARGIN &&
      candidatePosition.top + content.height <= viewport.height - VIEWPORT_MARGIN;

    if (fitsHorizontally && fitsVertically) {
      placement = candidate;
      position = candidatePosition;
      foundPerfectFit = true;
      break;
    }
  }

  if (!foundPerfectFit) {
    for (const candidate of candidates) {
      const candidatePosition = rawPosition(trigger, content, candidate);
      const fitsPrimaryAxis =
        candidate === 'top' || candidate === 'bottom'
          ? candidatePosition.top >= VIEWPORT_MARGIN &&
            candidatePosition.top + content.height <= viewport.height - VIEWPORT_MARGIN
          : candidatePosition.left >= VIEWPORT_MARGIN &&
            candidatePosition.left + content.width <= viewport.width - VIEWPORT_MARGIN;

      if (fitsPrimaryAxis) {
        placement = candidate;
        position = candidatePosition;
        break;
      }
    }
  }

  const left = Math.max(
    VIEWPORT_MARGIN,
    Math.min(position.left, viewport.width - content.width - VIEWPORT_MARGIN),
  );
  const top = Math.max(
    VIEWPORT_MARGIN,
    Math.min(position.top, viewport.height - content.height - VIEWPORT_MARGIN),
  );
  const vertical = placement === 'top' || placement === 'bottom';
  const rawArrowOffset = vertical
    ? trigger.left + trigger.width / 2 - left
    : trigger.top + trigger.height / 2 - top;
  const contentSize = vertical ? content.width : content.height;
  const arrowOffset = Math.max(
    ARROW_EDGE_MARGIN,
    Math.min(rawArrowOffset, contentSize - ARROW_EDGE_MARGIN),
  );

  return { arrowOffset, left, placement, top };
}
