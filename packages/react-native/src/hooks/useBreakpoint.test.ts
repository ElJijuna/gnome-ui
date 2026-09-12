import { describe, expect, it } from '@jest/globals';

import { bucketForWidth, resolveResponsive } from './useBreakpoint';

describe('bucketForWidth', () => {
  it('reports base for an unmeasured (zero or negative) width', () => {
    expect(bucketForWidth(0)).toBe('base');
    expect(bucketForWidth(-1)).toBe('base');
  });

  it('picks the narrowest bucket whose threshold the width does not exceed', () => {
    expect(bucketForWidth(400)).toBe('narrow');
    expect(bucketForWidth(401)).toBe('medium');
    expect(bucketForWidth(550)).toBe('medium');
    expect(bucketForWidth(551)).toBe('wide');
    expect(bucketForWidth(860)).toBe('wide');
    expect(bucketForWidth(861)).toBe('base');
  });
});

describe('resolveResponsive', () => {
  it('passes a plain value straight through', () => {
    expect(resolveResponsive(3, 'narrow', 1)).toBe(3);
    expect(resolveResponsive<number | string>('10%', 'base', 0)).toBe('10%');
  });

  it('falls back when nothing is given', () => {
    expect(resolveResponsive(undefined, 'narrow', 1)).toBe(1);
    expect(resolveResponsive({}, 'narrow', 1)).toBe(1);
  });

  // The buckets are max-widths, so a map reads like stacked media queries.
  it('lets the narrowest matching entry win', () => {
    const map = { base: 4, wide: 3, medium: 2, narrow: 1 };

    expect(resolveResponsive(map, 'narrow', 0)).toBe(1);
    expect(resolveResponsive(map, 'medium', 0)).toBe(2);
    expect(resolveResponsive(map, 'wide', 0)).toBe(3);
    expect(resolveResponsive(map, 'base', 0)).toBe(4);
  });

  it('falls outwards to the next wider entry that exists', () => {
    // No `medium`, so a 550 dp window keeps the `wide` value — exactly what
    // `bucketForWidth`'s own narrow/medium/wide/base ordering would do.
    const map = { base: 3, wide: 2, narrow: 1 };

    expect(resolveResponsive(map, 'medium', 0)).toBe(2);
    expect(resolveResponsive(map, 'narrow', 0)).toBe(1);
  });

  it('never widens past the bucket it was asked for', () => {
    // `narrow` only applies at ≤ 400 dp; a wider bucket must not pick it up.
    expect(resolveResponsive({ narrow: 1 }, 'base', 9)).toBe(9);
    expect(resolveResponsive({ narrow: 1 }, 'wide', 9)).toBe(9);
  });

  it('treats zero as a value, not as missing', () => {
    expect(resolveResponsive({ base: 5, narrow: 0 }, 'narrow', 9)).toBe(0);
  });
});
