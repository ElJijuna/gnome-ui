import { computeBubblePosition, padRect } from './coachMarkUtils';

describe('coachMarkUtils', () => {
  const viewport = { width: 1000, height: 800 };
  const bubble = { width: 300, height: 160 };

  it('padRect grows a rect on every side', () => {
    expect(padRect({ top: 100, left: 100, width: 40, height: 20 }, 8)).toEqual({
      top: 92,
      left: 92,
      width: 56,
      height: 36,
    });
  });

  it('places below when the preferred side fits', () => {
    const target = { top: 100, left: 400, width: 80, height: 40 };
    const pos = computeBubblePosition(target, bubble, viewport, 'bottom');

    expect(pos.placement).toBe('bottom');
    expect(pos.top).toBe(100 + 40 + 12); // below the target + gap
  });

  it('flips to the opposite side when the preferred side would overflow', () => {
    // Target hugs the top edge: a top-placed bubble cannot fit, so it flips down.
    const target = { top: 8, left: 400, width: 80, height: 40 };
    const pos = computeBubblePosition(target, bubble, viewport, 'top');

    expect(pos.placement).toBe('bottom');
  });

  it('keeps the arrow pointing at the target after clamping the cross axis', () => {
    // Top-right corner: only a clamped bottom placement fits, so the bubble is
    // pushed left of the target and the arrow shifts right to stay on centre.
    const target = { top: 8, left: 960, width: 30, height: 30 };
    const pos = computeBubblePosition(target, bubble, viewport, 'bottom');

    expect(pos.placement).toBe('bottom');
    expect(pos.left + pos.arrowOffset).toBeCloseTo(975, 0); // ≈ target centre (960 + 15)
  });
});
