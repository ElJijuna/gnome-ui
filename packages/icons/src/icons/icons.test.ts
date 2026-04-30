import { describe, it, expect } from "vitest";
import type { IconDefinition } from "../types.ts";
import * as icons from "./index.ts";

const VALID_RULE_VALUES = ["nonzero", "evenodd", "inherit"] as const;
const VIEW_BOX_PATTERN = /^\d+ \d+ \d+ \d+$/;

const iconEntries = Object.entries(icons) as [string, IconDefinition][];

describe("standard icons", () => {
  it("exports at least one icon", () => {
    expect(iconEntries.length).toBeGreaterThan(0);
  });

  it.each(iconEntries)("%s — has a valid viewBox", (_name, icon) => {
    expect(icon.viewBox).toMatch(VIEW_BOX_PATTERN);
  });

  it.each(iconEntries)("%s — has at least one path", (_name, icon) => {
    expect(icon.paths.length).toBeGreaterThan(0);
  });

  it.each(iconEntries)("%s — all paths have a non-empty d attribute", (_name, icon) => {
    for (const path of icon.paths) {
      expect(path.d).toBeTruthy();
    }
  });

  it.each(iconEntries)("%s — fillRule and clipRule are valid when set", (_name, icon) => {
    for (const path of icon.paths) {
      if (path.fillRule !== undefined) {
        expect(VALID_RULE_VALUES).toContain(path.fillRule);
      }
      if (path.clipRule !== undefined) {
        expect(VALID_RULE_VALUES).toContain(path.clipRule);
      }
    }
  });
});
