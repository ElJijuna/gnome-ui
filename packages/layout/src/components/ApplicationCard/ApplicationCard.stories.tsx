import type { Meta, StoryObj } from "@storybook/react";
import { Button, StatusBadge } from "@gnome-ui/react";
import { IconBadge } from "../IconBadge";
import { ApplicationCard } from "./ApplicationCard";

const meta: Meta<typeof ApplicationCard> = {
  title: "Layout/ApplicationCard",
  component: ApplicationCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
App detail header with avatar, name, badge, description, stat row, and actions.
Designed for the MyApps \`AppDetail\` view — use \`EntityCard\` for list rows.

\`\`\`tsx
import { ApplicationCard } from "@gnome-ui/layout";

<ApplicationCard
  avatar={<IconBadge color="blue" size="xl">⛅</IconBadge>}
  name="GNOME Weather"
  badge={<StatusBadge variant="success">published</StatusBadge>}
  description="The official weather app for the GNOME desktop."
  stats={[
    { label: "Version", value: "v4.8.1" },
    { label: "Builds",  value: "24" },
  ]}
  actions={<Button variant="suggested">New Release</Button>}
/>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ApplicationCard>;

// ─── Full — MyApps AppDetail ───────────────────────────────────────────────────

const APPS = [
  { id: "weather",  icon: "⛅", color: "#3584e4", name: "GNOME Weather",  status: "published" as const, desc: "The official weather app for the GNOME desktop.", version: "v4.8.1",  builds: 24, updated: "2 days ago" },
  { id: "maps",     icon: "🗺",  color: "#33d17a", name: "GNOME Maps",    status: "published" as const, desc: "Explore and navigate the world.",                version: "v3.38.0", builds: 18, updated: "1 week ago" },
  { id: "podcasts", icon: "🎙",  color: "#9141ac", name: "GNOME Podcasts",status: "beta" as const,      desc: "Listen to podcasts on GNOME.",                  version: "v0.5.1",  builds: 7,  updated: "3 weeks ago" },
];

export const MyAppsDetail: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 480 }}>
      {APPS.map((app) => (
        <ApplicationCard
          key={app.id}
          avatar={<IconBadge color={app.color as "blue"} size="xl">{app.icon}</IconBadge>}
          name={app.name}
          badge={
            <StatusBadge variant={app.status === "published" ? "success" : "warning"}>
              {app.status}
            </StatusBadge>
          }
          description={app.desc}
          stats={[
            { label: "Version",      value: app.version },
            { label: "Builds",       value: String(app.builds) },
            { label: "Last updated", value: app.updated },
          ]}
          actions={
            <>
              <Button variant="flat">Edit</Button>
              <Button variant="suggested">New Release</Button>
            </>
          }
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: { story: "Full MyApps AppDetail variant — all props provided." },
    },
  },
};

// ─── Without stats or actions ──────────────────────────────────────────────────

export const Minimal: Story = {
  args: {
    avatar: <IconBadge size="xl">📦</IconBadge>,
    name: "My Application",
    description: "A short description of this application.",
  },
  parameters: {
    docs: {
      description: { story: "Only `avatar`, `name`, and `description` — no stats or actions." },
    },
  },
};

// ─── Stats only, no actions ────────────────────────────────────────────────────

export const WithStats: Story = {
  args: {
    avatar: <IconBadge color="green" size="xl">🗺</IconBadge>,
    name: "GNOME Maps",
    description: "Explore and navigate the world.",
    stats: [
      { label: "Version",      value: "v3.38.0" },
      { label: "Builds",       value: "18" },
      { label: "Last updated", value: "1 week ago" },
    ],
  },
  parameters: {
    docs: {
      description: { story: "`stats` row without `actions`." },
    },
  },
};
