import type { Meta, StoryObj } from "@storybook/react";
import { Card, Popover, Avatar } from "@gnome-ui/react";
import { UserCard } from "./UserCard";

const meta: Meta<typeof UserCard> = {
  title: "Layout/UserCard",
  component: UserCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
User identity panel for popovers, sidebar footers, and profile pages.

Renders an \`Avatar\`, a display name, an optional sub-line (e-mail, role…),
and a list of action buttons. A separator is automatically inserted before
any \`"destructive"\` action.

The component has **no card chrome** — place it inside a \`Popover\` or wrap
it in \`<Card>\` depending on context.

\`\`\`tsx
import { UserCard } from "@gnome-ui/layout";

<UserCard
  name="Ada Lovelace"
  email="ada@gnome.org"
  actions={[
    { label: "View Profile",     onClick: () => {} },
    { label: "Account Settings", onClick: () => {} },
    { label: "Sign Out",         onClick: () => {}, variant: "destructive" },
  ]}
/>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof UserCard>;

const defaultActions = [
  { label: "View Profile",     onClick: () => alert("profile")  },
  { label: "Account Settings", onClick: () => alert("settings") },
  { label: "Sign Out",         onClick: () => alert("sign out"), variant: "destructive" as const },
];

// ─── Default (vertical) ───────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    name: "Ada Lovelace",
    email: "ada@gnome.org",
    actions: defaultActions,
  },
  parameters: {
    docs: {
      description: { story: "Default orientation (`vertical`): avatar centered on top, identity below, actions at the bottom." },
    },
  },
};

// ─── Horizontal ───────────────────────────────────────────────────────────────

export const Horizontal: Story = {
  args: {
    name: "Ada Lovelace",
    email: "ada@gnome.org",
    orientation: "horizontal",
    actions: defaultActions,
  },
  parameters: {
    docs: {
      description: { story: "`orientation=\"horizontal\"` places the avatar on the left — suited for popovers and compact sidebar footers." },
    },
  },
};

// ─── No email ─────────────────────────────────────────────────────────────────

export const NoEmail: Story = {
  args: {
    name: "Ada Lovelace",
    actions: defaultActions,
  },
  parameters: {
    docs: {
      description: { story: "Without `email` the identity row collapses to a single line." },
    },
  },
};

// ─── No actions ───────────────────────────────────────────────────────────────

export const NoActions: Story = {
  args: {
    name: "Ada Lovelace",
    email: "ada@gnome.org",
  },
  parameters: {
    docs: {
      description: { story: "Without `actions` only the identity header is rendered — useful as a read-only profile snippet." },
    },
  },
};

// ─── Large avatar ─────────────────────────────────────────────────────────────

export const LargeAvatar: Story = {
  args: {
    name: "Ada Lovelace",
    email: "ada@gnome.org",
    avatarSize: "lg",
    actions: defaultActions,
  },
  parameters: {
    docs: {
      description: { story: "`avatarSize=\"lg\"` suits a standalone profile card." },
    },
  },
};

// ─── Inside a Card ────────────────────────────────────────────────────────────

export const InsideCard: Story = {
  render: () => (
    <Card style={{ width: 240, padding: 0, overflow: "hidden" }}>
      <UserCard
        name="Ada Lovelace"
        email="ada@gnome.org"
        avatarSize="lg"
        actions={defaultActions}
      />
    </Card>
  ),
  parameters: {
    docs: {
      description: { story: "Wrap in `<Card padding=\"none\">` for a standalone profile card in a sidebar footer or settings page." },
    },
  },
};

// ─── Inside a Popover ─────────────────────────────────────────────────────────

export const InsidePopover: Story = {
  render: () => (
    <Popover
      placement="bottom"
      content={
        <UserCard
          name="Ada Lovelace"
          email="ada@gnome.org"
          actions={defaultActions}
        />
      }
    >
      <button
        type="button"
        aria-label="User menu"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 2,
          borderRadius: "50%",
          display: "flex",
        }}
      >
        <Avatar name="Ada Lovelace" size="sm" />
      </button>
    </Popover>
  ),
  parameters: {
    docs: {
      description: { story: "The most common use-case: `UserCard` as the `content` of a `Popover` triggered by an avatar button." },
    },
  },
};

// ─── Only destructive actions ─────────────────────────────────────────────────

export const OnlyDestructive: Story = {
  args: {
    name: "Ada Lovelace",
    email: "ada@gnome.org",
    actions: [
      { label: "Sign Out",      onClick: () => {}, variant: "destructive" },
      { label: "Delete Account",onClick: () => {}, variant: "destructive" },
    ],
  },
  parameters: {
    docs: {
      description: { story: "When all actions are destructive no auto-separator is inserted between them." },
    },
  },
};

// ─── With avatar image ────────────────────────────────────────────────────────

export const WithAvatarImage: Story = {
  args: {
    name: "Ada Lovelace",
    email: "ada@gnome.org",
    avatarSrc: "https://i.pravatar.cc/64?u=ada",
    avatarSize: "lg",
    actions: defaultActions,
  },
  parameters: {
    docs: {
      description: { story: "Pass `avatarSrc` to show a photo instead of initials." },
    },
  },
};
