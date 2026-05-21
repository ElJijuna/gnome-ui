import type { IconDefinition } from "../types.ts";

/** vcs-branch-symbolic */
export const GitBranch: IconDefinition = {
  viewBox: "0 0 16 16",
  paths: [
    // trunk: between base node (4,12) and fork node (4,6)
    { d: "M 3.25 8 H 4.75 V 10 H 3.25 Z" },
    // branch line: from fork node (4,6) to head node (12,4)
    { d: "M 3.8 5.3 L 4.2 6.7 L 12.2 4.7 L 11.8 3.3 Z" },
    // nodes: base (4,12), fork (4,6), branch head (12,4)
    { d: "M 2 12 A 2 2 0 1 1 6 12 A 2 2 0 1 1 2 12 Z M 2 6 A 2 2 0 1 1 6 6 A 2 2 0 1 1 2 6 Z M 10 4 A 2 2 0 1 1 14 4 A 2 2 0 1 1 10 4 Z" },
  ],
};
