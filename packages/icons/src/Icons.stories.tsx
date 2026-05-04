import type { Meta, StoryObj } from "@storybook/react";
import type { IconDefinition } from "./types.ts";
import * as icons from "./icons/index.ts";
import * as thirdParty from "./third-party/index.ts";

// ─── Minimal inline SVG renderer ──────────────────────────────────────────────

interface IconProps {
  icon: IconDefinition;
  size?: number;
  color?: string;
}

function Icon({ icon, size = 16, color = "currentColor" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={icon.viewBox}
      width={size}
      height={size}
      fill={color}
      aria-hidden
    >
      {icon.paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fillRule={p.fillRule}
          clipRule={p.clipRule}
        />
      ))}
    </svg>
  );
}

// ─── Gallery component ────────────────────────────────────────────────────────

const iconEntries = Object.entries(icons) as [string, IconDefinition][];

interface GalleryProps {
  size: number;
  color: string;
  filter: string;
}

function Gallery({ size, color, filter }: GalleryProps) {
  const filtered = filter
    ? iconEntries.filter(([name]) =>
        name.toLowerCase().includes(filter.toLowerCase())
      )
    : iconEntries;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <p style={{ color: "#666", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
        {filtered.length} icon{filtered.length !== 1 ? "s" : ""}
        {filter ? ` matching "${filter}"` : ""}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: "1rem",
        }}
      >
        {filtered.map(([name, def]) => (
          <div
            key={name}
            title={name}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              backgroundColor: "#fff",
            }}
          >
            <Icon icon={def} size={size} color={color} />
            <span
              style={{
                fontSize: "0.7rem",
                color: "#555",
                textAlign: "center",
                wordBreak: "break-word",
              }}
            >
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = {
  title: "Icons/Gallery",
  component: Gallery,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "All Adwaita symbolic icons exported by `@gnome-ui/icons`. Each icon is a framework-agnostic `IconDefinition` (viewBox + SVG paths) that can be consumed by any adapter.",
      },
    },
  },
  argTypes: {
    size: {
      control: { type: "range", min: 12, max: 64, step: 4 },
      description: "Rendered icon size in px",
    },
    color: {
      control: "color",
      description: "SVG fill color",
    },
    filter: {
      control: "text",
      description: "Filter icons by name",
    },
  },
  args: {
    size: 16,
    color: "#1c1c1c",
    filter: "",
  },
} satisfies Meta<typeof Gallery>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const AllIcons: Story = {
  name: "All Icons",
};

export const LargeSize: Story = {
  name: "Large (32px)",
  args: { size: 32 },
};

export const DarkBackground: Story = {
  name: "Dark Background",
  args: { color: "#ffffff" },
  parameters: {
    backgrounds: { default: "gnome-dark" },
  },
};

// ─── Individual icon stories by category ──────────────────────────────────────

const categories: Record<string, string[]> = {
  Navigation: ["GoPrevious", "GoNext", "GoHome", "GoUp", "PanDown", "PanUp", "PanStart", "PanEnd"],
  Actions: ["Add", "Remove", "Delete", "Edit", "Copy", "Paste", "Cut", "Undo", "Redo", "Save", "DocumentOpen", "Close", "Search", "Refresh", "Share", "Attachment"],
  UI: ["OpenMenu", "ViewMore", "ViewSidebar", "ViewReveal", "ViewConceal", "Settings"],
  Status: ["Information", "Warning", "Error", "Check"],
  "People & Identity": ["Person", "Accessibility"],
  "System & Hardware": ["Applications", "Notifications", "InputMouse", "InputKeyboard", "InputTablet", "ColorManagement", "Printer", "Lock"],
  Misc: ["Star", "StarOutline", "Heart"],
  Media: ["MediaPlay", "MediaPause", "MediaSkipForward", "MediaSkipBackward"],
};

function CategoryGrid({ category, size, color }: { category: string; size: number; color: string }) {
  const names = categories[category] ?? [];
  const entries = names
    .map((n) => [n, (icons as Record<string, IconDefinition>)[n]] as [string, IconDefinition])
    .filter(([, def]) => def != null);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: "1rem", fontSize: "1rem", color: "#333" }}>{category}</h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        {entries.map(([name, def]) => (
          <div
            key={name}
            title={name}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              backgroundColor: "#fff",
              minWidth: "80px",
            }}
          >
            <Icon icon={def} size={size} color={color} />
            <span style={{ fontSize: "0.7rem", color: "#555", textAlign: "center" }}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const NavigationIcons: Story = {
  name: "Navigation",
  render: (args) => <CategoryGrid category="Navigation" size={args.size} color={args.color} />,
};

export const ActionIcons: Story = {
  name: "Actions",
  render: (args) => <CategoryGrid category="Actions" size={args.size} color={args.color} />,
};

export const StatusIcons: Story = {
  name: "Status",
  render: (args) => <CategoryGrid category="Status" size={args.size} color={args.color} />,
};

export const MediaIcons: Story = {
  name: "Media",
  render: (args) => <CategoryGrid category="Media" size={args.size} color={args.color} />,
};

// ─── Third-party logos ────────────────────────────────────────────────────────

const thirdPartyEntries = Object.entries(thirdParty) as [string, IconDefinition][];

const PLATFORM_COLORS: Record<string, string> = {
  GitHub:    "#24292f",
  GitLab:    "#FC6D26",
  Bitbucket: "#0052CC",
  X:         "#000000",
  Npm:       "#CB3837",
};

export const ThirdPartyIcons: Story = {
  name: "Third-party",
  render: (args) => (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <p style={{ color: "#666", marginBottom: "0.5rem", fontSize: "0.875rem" }}>
        Brand marks for third-party platforms. These follow the same{" "}
        <code>IconDefinition</code> shape and work with{" "}
        <code>&lt;Icon&gt;</code> from <code>@gnome-ui/react</code>.
      </p>
      <p style={{ color: "#999", marginBottom: "1.5rem", fontSize: "0.75rem" }}>
        Import from <code>@gnome-ui/icons</code> — they are re-exported alongside GNOME symbolic icons.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {thirdPartyEntries.map(([name, def]) => (
          <div
            key={name}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: "0.5rem", padding: "1rem 1.25rem",
              borderRadius: "8px", border: "1px solid #e0e0e0",
              backgroundColor: "#fff", minWidth: "90px",
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: PLATFORM_COLORS[name] ?? "#eee",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon icon={def} size={args.size} color="#ffffff" />
            </div>
            <span style={{ fontSize: "0.7rem", color: "#555", textAlign: "center" }}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Third-party platform logos (`GitHub`, `GitLab`, `Bitbucket`, `X`, `Npm`). Rendered with their brand colors for context — in production, pass `color` to `<Icon>` as needed.",
      },
    },
  },
};
