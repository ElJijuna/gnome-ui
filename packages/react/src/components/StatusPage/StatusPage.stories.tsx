import type { Meta, StoryObj } from "@storybook/react";
import {
  Search, StarOutline, Error, Information, Delete, DocumentOpen,
} from "@gnome-ui/icons";
import { StatusPage } from "./StatusPage";
import { Button } from "../Button";
import { Popover } from "../Popover";

const meta: Meta<typeof StatusPage> = {
  title: "Components/StatusPage",
  component: StatusPage,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Empty-state and status page following the Adwaita \`AdwStatusPage\` pattern.

Use to fill an empty view with context and a path forward.

### Guidelines
- Always explain **why** the view is empty and **what the user can do** about it.
- Keep the title to one short noun phrase — "No Results", "All Done", "Connection Lost".
- The description should be one or two sentences at most.
- Provide one primary action when there is a clear next step.
- Choose an icon that reinforces the message — do not use generic placeholders.
- Do not use for loading states — use \`Spinner\` or \`ProgressBar\` instead.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusPage>;

// ─── Empty search ─────────────────────────────────────────────────────────────

export const NoResults: Story = {
  render: () => (
    <StatusPage
      icon={Search}
      title="No Results"
      description='Try a different search term or check your spelling.'
    />
  ),
  parameters: { controls: { disable: true } },
};

// ─── Empty collection ─────────────────────────────────────────────────────────

export const EmptyCollection: Story = {
  render: () => (
    <StatusPage
      icon={StarOutline}
      title="No Favourites Yet"
      description="Items you star will appear here."
    >
      <Button variant="suggested">Browse Library</Button>
    </StatusPage>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Empty collection with a suggested action that takes the user to content.",
      },
    },
  },
};

// ─── Error state ──────────────────────────────────────────────────────────────

export const ErrorState: Story = {
  render: () => (
    <StatusPage
      icon={Error}
      title="Something Went Wrong"
      description="Could not load your files. Check your connection and try again."
    >
      <Button variant="suggested">Try Again</Button>
      <Button>Report Issue</Button>
    </StatusPage>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Error state with a primary 'Try Again' action and a secondary 'Report Issue' path.",
      },
    },
  },
};

// ─── All done / success ───────────────────────────────────────────────────────

export const AllDone: Story = {
  render: () => (
    <StatusPage
      iconNode={<span style={{ fontSize: 96, lineHeight: 1 }}>🎉</span>}
      title="All Caught Up"
      description="You have read every message in your inbox."
    />
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Use `iconNode` for emoji or custom graphics instead of an `@gnome-ui/icons` definition.",
      },
    },
  },
};

// ─── No icon ──────────────────────────────────────────────────────────────────

export const NoIcon: Story = {
  render: () => (
    <StatusPage
      title="Trash Is Empty"
      description="Items moved to Trash will appear here. Trash is emptied automatically after 30 days."
    >
      <Button>Open Settings</Button>
    </StatusPage>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Icon is optional — omit it for simpler messages." },
    },
  },
};

// ─── In a card ────────────────────────────────────────────────────────────────

export const InCard: Story = {
  render: () => (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 12,
        overflow: "hidden",
        maxWidth: 400,
      }}
    >
      <StatusPage
        icon={DocumentOpen}
        title="No Documents"
        description="Open a document to get started."
        style={{ padding: "32px 24px" }}
      >
        <Button variant="suggested">Open File…</Button>
      </StatusPage>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "StatusPage inside a card — useful for panels and sidebar detail areas.",
      },
    },
  },
};

// ─── Informational ────────────────────────────────────────────────────────────

export const Informational: Story = {
  render: () => (
    <StatusPage
      icon={Information}
      title="Updates Available"
      description="New versions of your installed extensions are ready to install."
    >
      <Button variant="suggested">Update All</Button>
      <Button variant="flat">Remind Me Later</Button>
    </StatusPage>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Compact ──────────────────────────────────────────────────────────────────

export const Compact: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
      {/* Sidebar panel */}
      <div
        style={{
          width: 220,
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 12,
          overflow: "hidden",
          background: "var(--gnome-card-bg-color, #fff)",
        }}
      >
        <StatusPage
          compact
          icon={Search}
          title="No Results"
          description="Try a different search term."
        />
      </div>

      {/* Popover */}
      <Popover
        content={
          <StatusPage
            compact
            icon={StarOutline}
            title="No Favourites"
            description="Star items to save them here."
          >
            <Button size="sm" variant="suggested">Browse</Button>
          </StatusPage>
        }
      >
        <Button>Open Popover</Button>
      </Popover>

      {/* Comparison: default vs compact */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden", background: "var(--gnome-card-bg-color,#fff)", width: 200 }}>
          <StatusPage icon={Information} title="Default" description="Full spacing and icon size." />
        </div>
        <div style={{ border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden", background: "var(--gnome-card-bg-color,#fff)", width: 200 }}>
          <StatusPage compact icon={Information} title="Compact" description="Reduced spacing and icon size." />
        </div>
      </div>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Use `compact` for sidebars, popovers, and small panels where full spacing would overwhelm the context. Icon shrinks from 128 px to 64 px; title drops to `title-4` scale; padding and gaps are reduced.",
      },
    },
  },
};

// ─── Destructive action ───────────────────────────────────────────────────────

export const DestructiveAction: Story = {
  render: () => (
    <StatusPage
      icon={Delete}
      title="Delete Account?"
      description="All your data will be permanently removed. This action cannot be undone."
    >
      <Button variant="destructive">Delete Account</Button>
      <Button>Cancel</Button>
    </StatusPage>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Destructive confirmation — use sparingly, prefer a Dialog for critical actions.",
      },
    },
  },
};
