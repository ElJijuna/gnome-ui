import { describe, expect, it } from 'vitest';

import type { IconDefinition } from '../types.ts';

import * as icons from './index.ts';

const VALID_RULE_VALUES = ['nonzero', 'evenodd', 'inherit'] as const;
const VIEW_BOX_PATTERN = /^-?\d+(?:\.\d+)? -?\d+(?:\.\d+)? \d+(?:\.\d+)? \d+(?:\.\d+)?$/;

const iconEntries = Object.entries(icons) as [string, IconDefinition][];
const pathIconEntries = iconEntries.filter(([, icon]) => icon.paths !== undefined);
const animatedIconEntries = iconEntries.filter(([, icon]) => icon.svg !== undefined);

describe('standard icons', () => {
  it('exports at least one icon', () => {
    expect(iconEntries.length).toBeGreaterThan(0);
  });

  it.each(iconEntries)('%s — has a valid viewBox', (_name, icon) => {
    expect(icon.viewBox).toMatch(VIEW_BOX_PATTERN);
  });

  it.each(pathIconEntries)('%s — has at least one path', (_name, icon) => {
    expect(icon.paths?.length).toBeGreaterThan(0);
  });

  it.each(pathIconEntries)('%s — all paths have a non-empty d attribute', (_name, icon) => {
    for (const path of icon.paths ?? []) {
      expect(path.d).toBeTruthy();
    }
  });

  it.each(pathIconEntries)('%s — fillRule and clipRule are valid when set', (_name, icon) => {
    for (const path of icon.paths ?? []) {
      if (path.fillRule !== undefined) {
        expect(VALID_RULE_VALUES).toContain(path.fillRule);
      }

      if (path.clipRule !== undefined) {
        expect(VALID_RULE_VALUES).toContain(path.clipRule);
      }
    }
  });
});

describe('animated icons', () => {
  it('exports at least one animated icon', () => {
    expect(animatedIconEntries.length).toBeGreaterThan(0);
  });

  it.each(animatedIconEntries)('%s — is marked animated', (_name, icon) => {
    expect(icon.animated).toBe(true);
  });

  it.each(animatedIconEntries)('%s — has non-empty svg markup and no paths', (_name, icon) => {
    expect(icon.svg?.trim()).toBeTruthy();
    expect(icon.paths).toBeUndefined();
  });

  it.each(
    animatedIconEntries,
  )('%s — references the shared play-state variable so it is paused by default', (_name, icon) => {
    expect(icon.svg).toMatch(/var\(--gnome-icon-play-state, paused\)/);
  });
});
