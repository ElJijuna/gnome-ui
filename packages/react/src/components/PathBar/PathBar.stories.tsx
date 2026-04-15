import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PathBar } from "./PathBar";
import type { PathBarSegment } from "./PathBar";

const meta: Meta<typeof PathBar> = {
  title: "Components/PathBar",
  component: PathBar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Breadcrumb path bar for navigating a hierarchical location.

Mirrors the location bar in **GNOME Files (Nautilus)**. Segments are separated
by chevron dividers. All segments except the last are interactive — clicking
them calls \`onNavigate\`. The last segment represents the current location and
is rendered as a bold, non-interactive label.

\`\`\`tsx
import { PathBar } from "@gnome-ui/react";

<PathBar
  segments={[
    { label: "Home",      path: "/home"                     },
    { label: "Documents", path: "/home/documents"           },
    { label: "Projects",  path: "/home/documents/projects"  },
  ]}
  onNavigate={(path) => navigate(path)}
/>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PathBar>;

// ─── Shared segments ──────────────────────────────────────────────────────────

const deepSegments: PathBarSegment[] = [
  { label: "Home",      path: "/home"                            },
  { label: "Documents", path: "/home/documents"                  },
  { label: "Projects",  path: "/home/documents/projects"         },
  { label: "gnome-ui",  path: "/home/documents/projects/gnome-ui" },
];

// ─── Stories ──────────────────────────────────────────────────────────────────

/** Standard breadcrumb path — click ancestor segments to navigate. */
export const Default: Story = {
  args: {
    segments: deepSegments,
  },
};

/** Only a single segment (root). No buttons, no separators. */
export const Root: Story = {
  args: {
    segments: [{ label: "Home", path: "/home" }],
  },
};

/** Two-level path. */
export const TwoLevels: Story = {
  args: {
    segments: [
      { label: "Home",      path: "/home"           },
      { label: "Documents", path: "/home/documents" },
    ],
  },
};

/** Interactive demo: clicking a segment truncates the path to that point. */
export const Interactive: Story = {
  render: () => {
    const allSegments: PathBarSegment[] = deepSegments;
    const [current, setCurrent] = useState(allSegments.length - 1);

    const handleNavigate = (_path: string, index: number) => {
      setCurrent(index);
    };

    return (
      <PathBar
        segments={allSegments.slice(0, current + 1)}
        onNavigate={handleNavigate}
      />
    );
  },
  parameters: { controls: { disable: true } },
};

/** Segments with folder icons at the leading edge. */
export const WithIcons: Story = {
  render: () => {
    const FolderIcon = () => (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d="M1 3.5A1.5 1.5 0 0 1 2.5 2H5l1.5 2H11.5A1.5 1.5 0 0 1 13 5.5v5A1.5 1.5 0 0 1 11.5 12h-9A1.5 1.5 0 0 1 1 10.5v-7Z"
          fill="currentColor"
        />
      </svg>
    );

    const segments: PathBarSegment[] = [
      { label: "Home",      path: "/home",           icon: <FolderIcon /> },
      { label: "Documents", path: "/home/documents", icon: <FolderIcon /> },
      { label: "Projects",  path: "/home/documents/projects", icon: <FolderIcon /> },
    ];

    return <PathBar segments={segments} />;
  },
  parameters: { controls: { disable: true } },
};
