import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, StatusBadge } from "@gnome-ui/react";
import { IconBadge } from "../IconBadge";
import { EntityCard } from "./EntityCard";

const meta: Meta<typeof EntityCard> = {
  title: "Layout/EntityCard",
  component: EntityCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Avatar/icon + title + meta card. Covers both compact grid cards (Following screen)
and full-width list rows (MyApps screen) via additive optional props.

\`\`\`tsx
import { EntityCard } from "@gnome-ui/layout";
import { IconBadge } from "@gnome-ui/layout";

<EntityCard
  avatar={<IconBadge color="blue" size="md">🌤</IconBadge>}
  title="GNOME Weather"
  subtitle="@alice_dev"
  meta={["v4.8.0", "⭐ 203"]}
/>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EntityCard>;

// ─── Following — Apps tab ──────────────────────────────────────────────────────

const FOLLOWING_APPS = [
  { id: "1", icon: "🌤", name: "GNOME Weather",  maintainer: "@alice_dev",  version: "v4.8.0", watchers: 203 },
  { id: "2", icon: "📅", name: "GNOME Calendar", maintainer: "@gnome_team", version: "v47.0",  watchers: 891 },
  { id: "3", icon: "🎵", name: "Rhythmbox",       maintainer: "@rbox_dev",   version: "v3.4.7", watchers: 517 },
];

export const FollowingApps: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, width: 500 }}>
      {FOLLOWING_APPS.map((app) => (
        <EntityCard
          key={app.id}
          avatar={<IconBadge size="md">{app.icon}</IconBadge>}
          title={app.name}
          subtitle={app.maintainer}
          meta={[app.version, `⭐ ${app.watchers}`]}
          onClick={() => {}}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: { story: "Compact grid cards — Following / Apps tab. No `badge`, no `description`." },
    },
  },
};

// ─── Following — Maintainers tab ───────────────────────────────────────────────

const FOLLOWING_MAINTAINERS = [
  { id: "1", name: "Alice Dev",    handle: "@alice_dev",   apps: 4, followers: 312 },
  { id: "2", name: "GNOME Team",   handle: "@gnome_team",  apps: 12, followers: 4821 },
  { id: "3", name: "Rhythmbox Dev",handle: "@rbox_dev",    apps: 1, followers: 95 },
];

export const FollowingMaintainers: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, width: 500 }}>
      {FOLLOWING_MAINTAINERS.map((m) => (
        <EntityCard
          key={m.id}
          avatar={<Avatar name={m.name} size="sm" />}
          title={m.name}
          subtitle={m.handle}
          meta={[`${m.apps} apps`, `👤 ${m.followers.toLocaleString()}`]}
          onClick={() => {}}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: { story: "Compact grid cards — Following / Maintainers tab. Uses `<Avatar>` instead of `<IconBadge>`." },
    },
  },
};

// ─── MyApps — list rows ────────────────────────────────────────────────────────

const APPS = [
  { id: "weather",  icon: "⛅", color: "#3584e4", name: "GNOME Weather",   status: "published", desc: "The official weather app for GNOME desktop.", version: "v4.8.1", downloads: 12483 },
  { id: "maps",     icon: "🗺",  color: "#33d17a", name: "GNOME Maps",      status: "published", desc: "Explore and navigate the world.",              version: "v3.38.0", downloads: 9241 },
  { id: "podcasts", icon: "🎙",  color: "#9141ac", name: "GNOME Podcasts",  status: "beta",      desc: "Listen to podcasts on GNOME.",                 version: "v0.5.1", downloads: 4102 },
];

export const MyApps: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 480 }}>
      {APPS.map((app) => (
        <EntityCard
          key={app.id}
          avatar={<IconBadge color={app.color as "blue"} size="lg">{app.icon}</IconBadge>}
          title={app.name}
          badge={
            <StatusBadge variant={app.status === "published" ? "success" : "warning"}>
              {app.status}
            </StatusBadge>
          }
          trailing={<span style={{ opacity: 0.3, fontSize: "1.2rem" }}>›</span>}
          description={app.desc}
          meta={[app.version, `${app.downloads.toLocaleString()} downloads`]}
          onClick={() => {}}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: { story: "Full-width list rows — MyApps screen. Uses `badge`, `trailing`, and `description`." },
    },
  },
};

// ─── Minimal (no optional props) ──────────────────────────────────────────────

export const Minimal: Story = {
  args: {
    avatar: <IconBadge size="md">📄</IconBadge>,
    title: "Entity title",
  },
  parameters: {
    docs: {
      description: { story: "Only `avatar` and `title` — all other props omitted." },
    },
  },
};
