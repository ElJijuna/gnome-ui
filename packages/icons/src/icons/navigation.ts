import type { IconDefinition } from "../types.ts";

/** go-previous-symbolic */
export const GoPrevious: IconDefinition = {
  viewBox: "0 0 16 16",
  paths: [{ d: "M10.5 2.5 5 8l5.5 5.5 1.5-1.5L8 8l4-4z", fillRule: "evenodd" }],
};

/** go-next-symbolic */
export const GoNext: IconDefinition = {
  viewBox: "0 0 16 16",
  paths: [{ d: "M5.5 2.5 11 8l-5.5 5.5L4 12l4-4-4-4z", fillRule: "evenodd" }],
};

/** go-home-symbolic */
export const GoHome: IconDefinition = {
  viewBox: "0 0 16 16",
  paths: [
    {
      d: "M8 1 1 7h2v7h4v-4h2v4h4V7h2L8 1zm0 2.2L13 8v5h-2.5v-4H5.5v4H3V8z",
      fillRule: "evenodd",
    },
  ],
};

/** go-up-symbolic */
export const GoUp: IconDefinition = {
  viewBox: "0 0 16 16",
  paths: [{ d: "M8 2 2.5 8H6v6h4V8h3.5z", fillRule: "evenodd" }],
};

/** pan-down-symbolic */
export const PanDown: IconDefinition = {
  viewBox: "0 0 16 16",
  paths: [{ d: "m2.5 5 5.5 6 5.5-6z", fillRule: "evenodd" }],
};

/** pan-up-symbolic */
export const PanUp: IconDefinition = {
  viewBox: "0 0 16 16",
  paths: [{ d: "M2.5 11 8 5l5.5 6z", fillRule: "evenodd" }],
};

/** pan-start-symbolic (RTL-aware chevron left) */
export const PanStart: IconDefinition = {
  viewBox: "0 0 16 16",
  paths: [{ d: "M11 2.5 5 8l6 5.5z", fillRule: "evenodd" }],
};

/** pan-end-symbolic (RTL-aware chevron right) */
export const PanEnd: IconDefinition = {
  viewBox: "0 0 16 16",
  paths: [{ d: "M5 2.5 11 8 5 13.5z", fillRule: "evenodd" }],
};
